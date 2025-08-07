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

io.use((socket, next)=>{
    console.log('socket middleware')
    if(socket.handshake.query && socket.handshake.query.token){
        const { token } = socket.handshake.query
        try{
            const result = jwt.verifyToken(token)
            console.log('token accepted')
            if(result.username) return next;

        }catch(error){
            console.log(error)
        }
    }

})


io.on('connection', (socket)=>{
   // console.log('sockect connect', socket)
        console.log('sockect connectID', socket.id)

        socket.emit('twilio-token', { token: getAccessTokenForVoice('directmyloan') })

    socket.on('disconnect', (socket)=>{
    console.log('sockect disconnected', socket.id)
})
    socket.on('answer-call', (sid) =>{
        console.log('answer with sid', sid)
    } )
})


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
        const { to, username, channel }=req.body
console.log('🔍 /login request body:', req.body);
 if (!to || !channel) {
    console.log('❌ Missing required fields');
    return res.status(400).send({ error: 'Missing "to" or "channel"' });
  }
    //const data = await twilio.sendVerifyAsync(process.env.MOBILE, 'sms');
        const data = await twilio.sendVerifyAsync(to, channel, username);

        res.send('sent code')
    //res.send(data)
    console.log('datalogin', data)
    console.log('to', to)
    console.log('channel',channel)
})



app.post('/verify', async (req, res) => {
  const { to, code, username } = req.body;

  console.log('📥 Incoming /verify request:', req.body);

  if (!to || !code || !username) {
    console.log('❌ Missing "to" or "code" or "username" ');
    return res.status(400).send({ error: 'Missing "to" or "code"' });
  }

  try {
    const data = await twilio.verifyCodeAsync(to, code,username);
    console.log('✅ Twilio verify response:', data);

    if (data.status === 'approved') {
        console.log('checkusername',username)
        const token=jwt.createJwt(username)
        console.log('this is jwttoken', token,)
        return res.send({token})

     // console.log('🎉 Phone number verified!');
      //res.send({ success: true, message: 'Phone number verified' });
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
    io.emit('call-new',{data:req.body})
    const response = twilio.voiceResponse('thanks for calling');
    res.type('text/xml');
        res.send(response.toString())

})

app.post('/call-status-changed',(req,res)=>{
    console.log('call status change')
    res.send('call status change')
})

app.post('/enqueue', (req,res)=>{
    const response = twilio.enqueueCall('customer service');
    console.log('enquingcall', response)
    io.emit('enqueue', {data: req.body})
    res.type('text/xml');
    res.send(response.toString());
    console.log('response', response.toString())
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