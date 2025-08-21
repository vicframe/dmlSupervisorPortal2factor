const twilio  =require('twilio') 

const VoiceResponse = require('twilio/lib/twiml/VoiceResponse')

            
            

class Twilio{
 

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
                loop:2
            },
            message
            );
           twiml.redirect('https://c740422743dc.ngrok-free.app/enqueue')
            return twiml
        }

        enqueueCall(queueName){
                const twiml= new VoiceResponse()
                twiml.enqueue(queueName);
                return twiml;
            }
        


}

const instance=new Twilio()
Object.freeze(instance)

module.exports= instance
