import React, {useEffect} from 'react';
import Login from './components/Login';
import {useImmer} from 'use-immer'
import axios from './utils/Axios'
import socket from './utils/Socketio'

function App() {
useEffect(() => {
  socket.on('disconnect', ()=>{
    console.log('socket disconnected')
  })
  return () => {};
}, []);

 const [user, setUser] = useImmer({  //or user.user, user.setUser
    username: '',
    mobileNumber: '',
    verificationCode: '',
    verificationSent: false 

  })

   
  async function sendSmsCode(){
    console.log('app.js send sms')
    await axios.post('/login',{
      to:user.mobileNumber,
      username:user.username,
      channel: 'sms'
       
    });
    setUser(draft =>{
      draft.verificationSent=true
    })

  }

  async function sendVerificationCode(){
    console.log('app.js sendverifcation code')
    const response = await axios.post('/verify', {
      to:user.mobileNumber,
      code:user.verificationCode
    })
    console.log('verification response', response.data)


  }

 /* async function sendVerificationCode(){
    console.log('app.js sening verify code')
    await axios.post('/verify', {
      to:user.mobileNumber,
      code:user.verificationCode
    })
  }*/

//  <Login user={user} setUser={setUser} sendSmsCode={sendSmsCode} sendVerificationCode={sendVerificationCode} />

  return (
    <div>
  hello world app.js and
   <Login user={user} setUser={setUser} sendSmsCode={sendSmsCode} sendVerificationCode={sendVerificationCode} />
    </div>
  );
}

export default App;
