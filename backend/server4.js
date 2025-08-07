const express = require('express');
const twilio = require('./Twilio')
const bodyParser= require('body-parser')
const cors = require('cors')
const http= require('http')
const socketIo= require('socket.io')
const jwt=require('./utils/Jwt')



const app=express()
const server=http.createServer(app)
//const socket=socketIo(server)

const io=socketIo(server, {
    cors:{
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    }
})


io.on('connection', (socket)=>{
    console.log('sockect connect', socket.id)
    socket.on('disconnect', ()=>{
    console.log('sockect disconnected', socket.id)
    })
})

io.use((socket, next) => {
  console.log('✅ Socket middleware — skipping verification');
  socket.username = 'hardcoded-user'; // optional
  next(); // let everything through
});



//const client= twilio.client replace with twilio

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())
app.use(express.static('public'));

PORT=3001


app.get('/test', (req,res)=>{
    console.log('test')
    res.send('test sent')
})


app.post('/login', async(req,res)=>{
    console.log('login')
    //res.send('login')//
        const {to, username, channel}=req.body
console.log('🔍 /login request body:', req.body);
 if (!to || !channel) {
    console.log('❌ Missing required fields');
    return res.status(400).send({ error: 'Missing "to" or "channel"' });
  }
    //const data = await twilio.sendVerifyAsync(process.env.MOBILE, 'sms');
        const data = await twilio.sendVerifyAsync(to, channel);

    res.send('sent code')
    console.log('datalogin', data)
    console.log('to', to)
    console.log('channel',channel)
})


app.post('/verify', async (req, res) => {
  const { to, code, username } = req.body;

  console.log('📥 Incoming /verify request:', req.body);

  if (!to || !code || !username) {
    console.log('❌ Missing "to" or "code" or username');
    return res.status(400).send({ error: 'Missing "to" or "code" or username' });
  }

  try {
    const data = await twilio.verifyCodeAsync(to, code, username);
    console.log('✅ Twilio verify response:', data);

    if (data.status === 'approved') {
        console.log('checkusername',username)
        const token=jwt.createJwt(username)
      
        console.log('this is jwttoken', token,)
        return res.send({token})

    //  res.send({ success: true, message: 'Phone number verified' });
    } else {
      console.log('❌ Verification failed:', data.status);
      res.send({ success: false, message: 'Invalid or expired code' });
    }

  } catch (err) {
    console.error('❌ Error in verifyCodeAsync:', err.message || err);
    res.status(500).send({ error: 'Verification failed' });
  }
});

app.post('/call-new',(req,res)=>{
    console.log('recevie new call')
    //  res.send('ok')
    io.emit('call-new',{ data:req.body })
    const response = twilio.voiceResponse('thanks for calling hold.');
    res.type('text/xml');
    res.send(response.toString())

})

app.post('/call-status-changed',(req,res)=>{
    console.log('call status change' )
    res.send('call status change')
})

app.post('/enqueue', (req,res)=>{
    const response = twilio.enqueueCall('customer service');
    console.log('enquingcall')
    io.emit('enqueue', {data: req.body})
    res.type('text/xml');
    res.send(response.toString());
    //console.log('response')
})

app.post('/check-token', (req,res)=>{
    const {token} = req.body;
    let isValid=false
    try{
     isValid = jwt.verifyToken(token)   

    }catch(error){
        console.log(error)
    }
    res.send({ isValid })

})



console.log(process.env.MOBILE)


//app.listen(PORT,()=>{
server.listen(PORT,()=>{

    console.log(`Port running: ${PORT}`)
  
})

/*
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
      socket.client.on('call-new', ({ data:{ CallSid, CallStatus } })=>{

        setCalls(draft => {
          const index = draft.calls.findIndex(call => call.CallSid ===CallSid )
          if(index === -1){
            draft.calls.push({ CallSid, CallStatus })
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
*/