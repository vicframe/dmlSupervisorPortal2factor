require('dotenv').config();
const express = require('express');
const twilio = require('./Twilio')
const bodyParser= require('body-parser')
const cors = require('cors')
const http= require('http')
const socketIo= require('socket.io')
const jwt=require('./utils/Jwt')
const functions = require('firebase-functions')
const { Twilio } = require('twilio');
const { getAccessTokenForVoice } = require('./Twilio')


const { VoiceResponse } = require('twilio').twiml;
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: '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' });
const { findContactByUniqueId } = require('./ghl'); // adjust path if needed


const app=express()
const server=http.createServer(app)
//const socket=socketIo(server)

const io=socketIo(server, {
    cors:{
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true
    }
})



io.on('connection', (socket)=>{
    console.log('sockect connect', socket.id)
    socket.emit('twilio-token', { token: getAccessTokenForVoice('victor') })
    socket.on('disconnect', ()=>{
    console.log('sockect disconnected', socket.id)
    })
    socket.on('answer-call', ({ sid }) => {
        console.log('answering clal sid', sid)
        twilio.answerCall(sid)
    })
})

io.use((socket, next) => {
  console.log('✅ Socket middleware — skipping verification');
  socket.username = 'victor'; // optional
  next(); // let everything through
});

 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())
app.use(express.static('public'));

//PORT=3001
const PORT = process.env.PORT || 3001;


app.get('/test', (req,res)=>{
    console.log('test')
    res.send('test sent')
})

app.post('/check-token', (req,res)=>{
    const { token } = req.body;
    let isValid=false
    try{
     isValid = jwt.verifyToken(token)   

    }catch(error){
        console.log(error)
    }
    res.send({ isValid })

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





app.post('/gather-id', async (req, res) => {
  const {  SpeechResult } = req.body;
  console.log('sp[ppeechesult', req.body)
  //const rawSpeech = (SpeechResult || '').toLowerCase().trim();
  //const rawSpeech = (SpeechResult || '').toLowerCase().replace(/[\s\.]/g, '').trim();
  const rawSpeech = (SpeechResult || '').toLowerCase().replace(/[\s\.,]/g, '').trim();

  const twiml = new VoiceResponse();

  // ✅ Extract ID from speech (e.g., "RT12345678", "ic98765432")
  //const idMatch = rawSpeech.match(/\b(rt|ic)\d{8}\b/i);
  const idMatch = rawSpeech.match(/\b(rt|ic)\d{7,10}\b/i);


  console.log('idmatch', idMatch)
  const uniqueId = idMatch ? idMatch[0].toUpperCase() : null;
  console.log('uniqueId', uniqueId)

  // ✅ Handle valid unique ID
  if (uniqueId) {
   // const prompt = `The user provided the ID ${uniqueId}. Confirm it back to them in a natural and friendly way. Then let them know they will be transferred next.`;

   const contact = await findContactByUniqueId(uniqueId);

        let aiPrompt;

        if (contact) {
            const name = contact.firstName
            ? contact.firstName.charAt(0).toUpperCase() + contact.firstName.slice(1)
            : 'there';

  console.log(`✅ Matched contact: ${name} (${uniqueId})`);
        //const name = contact.contactName || `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
       // aiPrompt = `The caller's ID is ${uniqueId}, and their name is ${name}. Confirm the ID and name in a warm and conversational tone, and let them know they will be transferred now.`;
       aiPrompt = `The caller's ID is matched and their name is ${name}. Greet them by name specifically, for example: 'Nice to meet you, say name.' Then let them know they’ll be transferred now. Keep it warm and short.`;
        } else {
        aiPrompt = `The caller provided the ID ${uniqueId}. Confirm it back in a friendly tone and tell them they will be transferred now.`;
        }


    try {
        const prompt = `The user provided ID ${uniqueId}. Please confirm this ID in a warm tone, and let them know they'll be transferred now.`;

      const aiResponse = await openai.chat.completions.create({
        
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a clear, concise and quick voice assistant in a call center.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 60
      });

      const confirmationMessage = aiResponse.choices[0].message.content.trim();
      twiml.say({ voice: 'female' }, confirmationMessage);
      twiml.redirect('https://dmlsupervisorportal2factor.onrender.com/enqueue');

    } catch (err) {
      console.error('OpenAI error:', err.message || err);
      twiml.say({ voice: 'female' }, 'Thanks. We’re transferring your call now.');
      twiml.redirect('https://dmlsupervisorportal2factor.onrender.com/enqueue');
    }

  // ✅ Handle natural-language fallback
  } else if (
    rawSpeech.includes("don’t have") ||
    rawSpeech.includes("don't have") ||
    rawSpeech.includes("do not have") ||
    rawSpeech.includes("no") ||
    rawSpeech.includes("forgot") ||
    rawSpeech.includes("can't remember") ||
    rawSpeech.includes("cannot remember") ||
    rawSpeech.includes("i don’t know") ||
    rawSpeech.includes("i don't know")
  ) {
    twiml.say({ voice: 'female' }, "No worries! We'll still connect you to someone who can help.");
    twiml.redirect('https://dmlsupervisorportal2factor.onrender.com/enqueue');

  // ❌ Invalid input fallback
  } else {
    twiml.say({ voice: 'female' }, "Sorry, that wasn’t a valid ID. Please try again.");
    twiml.redirect('https://dmlsupervisorportal2factor.onrender.com/call-new');
  }

  res.type('text/xml');
  res.send(twiml.toString());
});


app.post('/call-status-changed',(req,res)=>{
    console.log('call status change' )
    res.send('ok')
})

app.post('/enqueue', (req,res)=>{
    const response = twilio.enqueueCall('customer service');
    console.log('enquingcall')
    io.emit('enqueue', {data: req.body})
    res.type('text/xml');
    res.send(response.toString());
    console.log('response.toString()', response.toString())
})



app.post('/connect-call', (req, res) => {
  console.log('Connecting call');
  const response = twilio.redirectCall('victor');
  res.type('text/xml');
  res.send(response.toString());
  console.log('repsonssese', response.toString())
});

console.log(process.env.MOBILE)


//app.listen(PORT,()=>{
server.listen(PORT,()=>{

    console.log(`Port running: ${PORT}`)
  
})

exports.api = functions.https.onRequest(app);
