import React, { useEffect, useState } from 'react';
import Login from './components/Login';
import { useImmer } from 'use-immer';
import axios from './utils/Axios';
import socket from './utils/Socketio';
import CallCenter from './components/CallCenter';
import useTokenFromLocalStorage from './hooks/useTokenFromLocalStorage';
import { Device } from '@twilio/voice-sdk';

function App() {
  const [calls, setCalls] = useImmer({ calls: [] });
  const [user, setUser] = useImmer({
    username: '',
    mobileNumber: '',
    verificationCode: '',
    verificationSent: false,
  });
  const [twilioToken, setTwilioToken] = useState();
  const [storedToken, setStoredToken, isValidToken] = useTokenFromLocalStorage(null);

  useEffect(() => {
    console.log('Twilio token changed');
    if (twilioToken) {
      connectTwilioVoiceClient(twilioToken);
    }
  }, [twilioToken]);

  useEffect(() => {
    if (isValidToken) {
      console.log('Valid token');
      return socket.addToken(storedToken);
    }
    console.log('Invalid token');
    socket.removeToken();
  }, [isValidToken, storedToken]);

  useEffect(() => {
    console.log('Attaching socket listeners');

    socket.client.on('connect', () => {
      console.log('Connected');
    });

    socket.client.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.client.on('twilio-token', (data) => {
      console.log('Received Twilio token from backend');
      setTwilioToken(data.token);
    });

    socket.client.on('call-new', ({ data: { CallSid, CallStatus } }) => {
      console.log('New call received:', CallSid, CallStatus);
      setCalls((draft) => {
        const index = draft.calls.findIndex((call) => call.CallSid === CallSid);
        if (index === -1) {
          draft.calls.push({ CallSid, CallStatus });
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

    return () => {
      socket.client.off('connect');
      socket.client.off('disconnect');
      socket.client.off('twilio-token');
      socket.client.off('call-new');
      socket.client.off('enqueue');
    };
  }, [setCalls]);

  async function sendSmsCode() {
    console.log('Sending SMS code');
    await axios.post('/login', {
      to: user.mobileNumber,
      username: user.username,
      channel: 'sms',
    });
    setUser((draft) => {
      draft.verificationSent = true;
    });
  }

  function connectTwilioVoiceClient(twilioToken) {
    const device = new Device(twilioToken, { debug: true });

    device.on('error', (error) => {
      console.error('Twilio error:', error);
    });

    device.on('incoming', (connection) => {
      console.log('Incoming call from Twilio');
      connection.accept();
    });
  }

  async function sendVerificationCode() {
    console.log('Sending verification code');
    const response = await axios.post('/verify', {
      to: user.mobileNumber,
      code: user.verificationCode,
      username: user.username,
    });

    console.log('Received token:', response.data.token);
    setStoredToken(response.data.token);
  }

  return (
    <div>
      {isValidToken ? (
        <CallCenter calls={calls} />
      ) : (
        <>
          <CallCenter calls={calls} />
          <Login
            user={user}
            setUser={setUser}
            sendSmsCode={sendSmsCode}
            sendVerificationCode={sendVerificationCode}
          />
        </>
      )}
    </div>
  );
}

export default App;
