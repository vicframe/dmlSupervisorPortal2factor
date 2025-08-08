import React from 'react'
import{ Container,Step } from 'semantic-ui-react'
import CallCenter from './CallCenter'
import socket from '../utils/Socketio'

function CallProgress({ call }){                    //..call.data.From

    function answerCall(sid){
        socket.client.emit('answer-call', { sid })

    }


    console.log('CallProgress received:', call); // logs the entire call object
    console.log('CallSid:', call.CallSid);       // logs just the CallSid
    console.log('CallStatus:', call.CallStatus); // logs just the CallStatus

/*
      <Step icon='phone' title='Ringing' description={call.CallSid} active={call.CallStatus ==='ringing'} completed= {call.CallStatus !== 'ringing'} />
            <Step icon='cogs' title='in Queue' description='User waiting in Queue' active={call.CallStatus ==='enqueue' } disabled={call.CallStatus === 'ringing'} onClick={()=> answerCall(call.CallSid)} />
            <Step icon='headphones' title='Answered' description='Answered by agent' disabled={call.CallStatus === 'ringing' || call.CallStatus ==='enqueue' } />
            <Step icon='times' title='Hang up' description='missed by agent' />



*/
    return <Container>
        <Step.Group fluid>

        <Step icon='phone' title='Ringing' description={call.CallSid} active={call.CallStatus ==='ringing'} completed= {call.CallStatus !== 'ringing'} />
        <Step icon='cogs' title='in Queue' description='User waiting in Queue' active={call.CallStatus ==='enqueue' } disabled={call.CallStatus === 'ringing'} onClick={()=> answerCall(call.CallSid)} />
         <Step icon='headphones' title='Answered' description='Answered by agent' disabled={call.CallStatus === 'ringing' || call.CallStatus === 'enqueue'  } />
        <Step icon='times' title='Hang up' description='missed by agent' />

        </Step.Group>
    </Container>
}

export default CallProgress