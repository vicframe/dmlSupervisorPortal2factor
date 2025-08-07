const twilio  =require('twilio') 

const VoiceResponse = require('twilio/lib/twiml/VoiceResponse')

            
            

class Twilio{
    phoneNumber = '+18127320343'
    phonenNumberSid = 'PN8ea1699149f0acd7a1cc63ea4eecf92d'
    tokenSid = 'SK4411a33df3fe8ce0516b644d080f91a7'
    tokenSecret = '4yK4LfHvoV24N4onYbOauJykXy4TPITT'
    accountSid = 'AC4c3a89e56afcb829253b16848592cbea'
    verify = 'VA296574a1cec0b611282d9e7f30b6894d'
    outgoingApplicationSid = 'APae8310637ab70bff9a1e4c7c2bf12018'

    authToken = 'ac57125790f08b78ab7546146dc755e1'
    client;

    constructor(){
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
                    url: 'https://api-obcqutdy7a-uc.a.run.app/connect-call',
                    method: 'POST',
                    function (err, call){
                        console.log('answerCall', call);
                        if(err){
                            console.error('answerCall', err)
                        }
                    }

                })
            }

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