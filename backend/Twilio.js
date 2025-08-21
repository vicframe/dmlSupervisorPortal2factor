const twilio  =require('twilio') 

const VoiceResponse = require('twilio/lib/twiml/VoiceResponse')

            
            

class Twilio{
    /* 
    phoneNumber = process.env.TWILIO_PHONE_NUMBER
    phonenNumberSid = process.env.TWILIO_PHONE_SID
    tokenSid = process.env.TWILIO_TOKEN_SID
    tokenSecret = process.env.TWILIO_TOKEN_SECRET
    accountSid = process.env.TWILIO_ACCOUNT_SID
    verify = process.env.TWILIO_VERIFY_SID
    outgoingApplicationSid = process.env.TWILIO_APP_SID
    authToken = process.env.TWILIO_AUTH_TOKEN
    client;

    
    constructor(){
                console.log('✅ Twilio env variables:');
        console.log('TWILIO_PHONE_NUMBER:', this.phoneNumber);
        console.log('TWILIO_PHONE_SID:', this.phonenNumberSid);
        console.log('TWILIO_TOKEN_SID:', this.tokenSid);
        console.log('TWILIO_TOKEN_SECRET:', this.tokenSecret ? '[HIDDEN]' : '❌ MISSING');
        console.log('TWILIO_ACCOUNT_SID:', this.accountSid);
        console.log('TWILIO_VERIFY_SID:', this.verify);
        console.log('TWILIO_APP_SID:', this.outgoingApplicationSid);
        console.log('TWILIO_AUTH_TOKEN:', this.authToken ? '[HIDDEN]' : '❌ MISSING');
        this.client=twilio(this.tokenSid, this.tokenSecret, {
            accountSid:this.accountSid,
        });
    }
    getTwilio(){
        this.client
    }
    async sendVerifyAsync(to,channel){

       const data= await this.client.verify
       .services(this.verify)
       .verifications.create({
            to, 
            channel
        })
        console.log('sendverify')
        return data

    }

    async verifyCodeAsync(to,code,username){
        const data=await this.client.verify.services(this.verify).verificationChecks.create({
            to,
            code

        })
        console.log('verifycode')
        console.log('username',username)
        return data
    }

    voiceResponse(message){
            const twiml=new VoiceResponse();
            twiml.say({
                voice:"female",
                loop:1
            },
            message
            );
           //twiml.redirect('https://c740422743dc.ngrok-free.app/enqueue')
            //return 
                const gather = twiml.gather(
                {input: 'speech',
                action: 'https://api-obcqutdy7a-uc.a.run.app/gather-id',
                method: 'POST',
                language: 'en-US',
                speechTimeout: 'auto'

                /*input: 'speech',
                numDigits: 8,
                action: 'https://c740422743dc.ngrok-free.app/gather-id',
                method: 'POST'*/
            });
            gather.say({
                voice: "female"
            }, "Please say your unique ID number. Start with the letters R-T or I-C, followed by eight digits. Say it slowly and clearly");

            // 3. Fallback if gather fails
            twiml.say("We didn’t get any input. Please call again.");
            twiml.hangup();

            return twiml;

        }

        enqueueCall(queueName){
                const twiml= new VoiceResponse()
                twiml.enqueue(queueName);
                return twiml;
            }

        redirectCall(){
                const client= 'victor'
                const twiml= new VoiceResponse()
                twiml.dial().client(client);
                return twiml.toString();
            }            

            answerCall(sid){
                 console.log('answerCall with sid', sid);
                this.client.calls(sid).update({
                    url: 'https://dmlsupervisorportal2factor.onrender.com/connect-call',
                    method: 'POST',
                    function (err, call){
                        console.log('answerCall', call);
                        if(err){
                            console.error('answerCall', err)
                        }
                    }

                })
            }
//updatre url
            getAccessTokenForVoice = (identity) => {

                console.log(`Acess token ${identity}`)
                const AccessToken=twilio.jwt.AccessToken
                const VoiceGrant = AccessToken.VoiceGrant;
                const outgoingAppSid = this.outgoingApplicationSid
                const voiceGrant = new VoiceGrant({
                    outgoingApplicationSid: outgoingAppSid,
                    incomingAllow: true
                })
                const token = new AccessToken(
                    this.accountSid,
                    this.tokenSid,
                    this.tokenSecret,
                    {identity}

                )
                token.addGrant(voiceGrant)
                console.log('jwt acces', token.toJwt() )
                return (token.toJwt())
            }
        


}

const instance=new Twilio()
Object.freeze(instance)

module.exports= instance
