const express = require('express');
const twilio = require('./Twilio')
const bodyParser= require('body-parser')
const cors = require('cors')
const http= require('http')
const socketIo= require('socket.io')

const app=express()
const server=http.createServer(app)
//const socket=socketIo(server)

const socket=socketIo(server, {
    cors:{
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    }
})


socket.on('connection', (socket)=>{
    console.log('sockect connect', socket)
})

socket.on('disconnect', (socket)=>{
    console.log('sockect disconnected', socket)
})



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

/*app.get('/login', async(req,res)=>{
    console.log('login')
    //res.send('login')//
    const data = await twilio.sendVerifyAsync(process.env.MOBILE, 'sms');
    res.send(data)
    console.log('datalogin', data)
})*/

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

    res.send(data)
    console.log('datalogin', data)
    console.log('to', to)
    console.log('channel',channel)
})

/*app.get('/verify', async(req,res)=>{
    console.log('verify')
    //res.send('verify')
    const data= await twilio.verifyCodeAsync(process.env.MOBILE, req.query.code);
      console.log('dataverify', data)
    return data
    
})*/

/*
app.post('/verify', async (req, res) => {
  const code = req.query.code;
  const to = MOBILE;

  console.log('Iindex.js functionsncoming verification request');
  console.log('index.js functionsCode:', code);
  console.log('index.js functionsTo:', to);

  try {
    const result = await twilio.verifyCodeAsync(to, code);
    console.log('Twilio verify response:', result);

    if (result.status === 'approved') {
      console.log('index.js functionsPhone number verified');
      res.send('Phone number verified');
    } else {
      console.log('index.js functionsVerification failed - status:', result.status);
      res.send('Invalid or expired code');
    }

  } catch (err) {
    console.error('index.js functionsTwilio verification error:', err?.response?.data || err.message || err);
    res.status(400).send('Verification failed');
  }
});*/

app.post('/verify', async (req, res) => {
  const { to, code } = req.body;

  console.log('📥 Incoming /verify request:', req.body);

  if (!to || !code) {
    console.log('❌ Missing "to" or "code"');
    return res.status(400).send({ error: 'Missing "to" or "code"' });
  }

  try {
    const data = await twilio.verifyCodeAsync(to, code);
    console.log('✅ Twilio verify response:', data);

    if (data.status === 'approved') {
      console.log('🎉 Phone number verified!');
      res.send({ success: true, message: 'Phone number verified' });
    } else {
      console.log('❌ Verification failed:', data.status);
      res.send({ success: false, message: 'Invalid or expired code' });
    }

  } catch (err) {
    console.error('❌ Error in verifyCodeAsync:', err.message || err);
    res.status(500).send({ error: 'Verification failed' });
  }
});


console.log(process.env.MOBILE)


//app.listen(PORT,()=>{
server.listen(PORT,()=>{

    console.log(`Port running: ${PORT}`)
})