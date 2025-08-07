import React, { useEffect, useState } from 'react';
import Login from './components/Login';
import {useImmer} from 'use-immer'
import axios from './utils/Axios'
import socket from './utils/Socketio';
import useLocalStorage from './hooks/useLocalStorage'
import CallCenter from './components/CallCenter'
function App() {

//  const [token, setToken] = useState()
   const [calls, setCalls] = useImmer({ 
    calls: [] 
  });
 
 const [user, setUser] = useImmer({  //or user.user, user.setUser
    username: '',
    mobileNumber: '',
    verificationCode: '',
    verificationSent: false 

  });

    const [storedToken, setStoredToken, isValidToken] = useLocalStorage('token', null);
                                                          //useTokenFromLocalStorage

   useEffect(() => {
    socket.on('disconnect', ()=>{
      console.log('socket disconnected')
    });
    //socket.on('call-new', (data)=>{
      socket.on('call-new', ({data:{ CallSid, CallStatus } })=>{

        setCalls(draft => {
          draft.calls.push({ CallSid, CallStatus })

        });
    });
    socket.on('enqueue', ({ data: { CallSid } }) => {
          //console.log('Enqueue event for:', CallSid);
          setCalls((draft) => {
            const index = draft.calls.findIndex((call) => call.CallSid === CallSid);
            if (index !== -1) {
              draft.calls[index].CallStatus = 'enqueue';
            }
          });
        });
    return () =>{}
  }, [])

   
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

 
  return (
    <div>
  hello world app.js and
    { storedToken ? (
      
      <CallCenter calls={calls} />
    ): (
    
     <Login user={user} setUser={setUser} sendSmsCode={sendSmsCode} sendVerificationCode={sendVerificationCode}
      />

  )} 

    
    </div>
  );
}

export default App;
