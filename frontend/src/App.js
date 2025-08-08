import React, { useEffect, useState } from 'react';
import Login from './components/Login';
import { useImmer } from 'use-immer'
import axios from './utils/Axios'
import socket from './utils/Socketio';
import useLocalStorage from './hooks/useLocalStorage'
import CallCenter from './components/CallCenter'
import useTokenFromLocalStorage from './hooks/useTokenFromLocalStorage'
import { Device } from '@twilio/voice-sdk';
//import * as Twilio from 'twilio-client';
function App() {

//  const [token, setToken] = useState()
   const [calls, setCalls] = useImmer({ 
    calls: [] 
  });
 
 const [user, setUser] = useImmer({  //or user.user, user.setUser
    username: '',
    mobileNumber: '',
    verificationCode: '',
    verificationSent: false ,

  });

    const [twilioToken, setTwilioToken] =useState()
    //const [storedToken, setStoredToken, isValidToken] = useLocalStorage('token', null);
                                                          //useTokenFromLocalStorage

    const [storedToken, setStoredToken, isValidToken] = useTokenFromLocalStorage(null);

    useEffect(() => {
      console.log('Twilio Token Canged')
      if(twilioToken){
        connectTwilioVoiceClient(twilioToken)
      }

    }, [twilioToken])


     useEffect(() => {
        if (isValidToken) {
          console.log('Valid token');
          return socket.addToken(storedToken);
        }
          console.log('invalid token');

        socket.removeToken();
      }, [isValidToken, storedToken]);
    

   useEffect(() => {
    console.log('Attaching socket listeners');
    
        socket.client.on('connect', () => {
          console.log('Connected');
        });

    socket.client.on('disconnect', ()=>{
      console.log('socket disconnected')
    });

    socket.client.on('twilio-token', (data) => {
      setTwilioToken(data.token)
      console.log('twiliotoken')
    })

    
    //socket.on('call-new', (data)=>{
    /*  socket.client.on('call-new', ({ data:{ CallSid, CallStatus } })=>{

        setCalls(draft => {
          const index = draft.calls.findIndex(call => call.CallSid ===CallSid )
          if(index === -1){
            draft.calls.push({ CallSid, CallStatus })
          }        

        });
    });*/

    socket.client.on('call-new', (payload) => {
  console.log('[socket] call-new RAW:', payload);
  const data = payload?.data || {};
  console.log('[socket] call-new DATA:', data);

  setCalls(draft => {
    const idx = draft.calls.findIndex(c => c.CallSid === data.CallSid);
    if (idx === -1) {
      draft.calls.unshift(data);            // add new call to top
    } else {
      draft.calls[idx] = { ...draft.calls[idx], ...data }; // merge updates
    }
  });
});



    socket.client.on('enqueue', ({ data: { CallSid } }) => {
          console.log('Enqueue event for:', CallSid);
          setCalls((draft) => {
            const index = draft.calls.findIndex((call) => call.CallSid === CallSid);
            if (index !== -1) {
              draft.calls[index].CallStatus = 'enqueue';
            }
          });
        });
    return () =>{}
  }, [setCalls])

   
  async function sendSmsCode(){
    console.log('app.js send sms')
    await axios.post('/login',{
      to:user.mobileNumber,
      username:user.username,
      channel: 'sms'
       
    });
    setUser(draft =>{
      draft.verificationSent = true
    })

  }

 function connectTwilioVoiceClient(twilioToken){

  const device = new Device(twilioToken, { 
    debug: true,
  
    audioConstraints: {
      mandatory: {
        googAutoGainControl: false
      }
    }
  })
  device.on('error', (error) => {
    console.log('Twilio error:', error)
  })
  device.on('incoming', (connection) => {
    console.log('incoming from Twilio')
    connection.accept();
  })
 }

  async function sendVerificationCode(){
    console.log('app.js sendverifcation code')
    const response = await axios.post('/verify', {
      to:user.mobileNumber,
      code:user.verificationCode,
      username: user.username,
    })
    console.log('received token', response.data.token);
    //setToken(response.data.token)
    setStoredToken(response.data.token)

  }
      //storedToken
 
  return (
    <div>
  hello world app.js and
    { isValidToken ? (
      
      <CallCenter calls={calls} />
    ): (
    
      <>
      <CallCenter calls={calls} />
     <Login user={user} setUser={setUser} sendSmsCode={sendSmsCode} sendVerificationCode={sendVerificationCode}
      />
      </>

  )} 

    
    </div>
  );
}

export default App;
