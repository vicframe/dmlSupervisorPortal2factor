const twilio  = require('twilio')
const VoiceResponse = require('twilio/lib/twiml/VoiceResponse')
            
            

class Twilio{


    constructor(){
        this.client=twilio(this.tokenSid, this.tokenSecret, {
            accountSid: this.accountSid,
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
            channel,
        })
        console.log('sendverify')
        return data

    }

    async verifyCodeAsync(to,code, username){
        const data=await this.client.verify.services(this.verify).verificationChecks.create({
            to,
            code,

        })
        console.log('verifycode')
        console.log('usenrame',username)
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

    getAccessTokenForVoice = (identity)=>{
        console.log(`access token for ${identity}`)
        const AccessToken = twilio.jwt.AccessToken;
        const VoiceGrant= AccessToken.VoiceGrant;
        const outgoingAppSid = this.outgoingApplicationSid;
        const voiceGrant = new VoiceGrant({
            outgoingApplicationSid: outgoingAppSid,
            incomingAllow: true
        });
        const token = new AccessToken(
            this.accountSid,
            this.tokenSid,
            this.tokenSecret,
            {identity}
        );
        token.addGrant(voiceGrant)
        console.log('access graned with JWT', token.toJwt())
        return (token.toJwt())

    }

    catch (err) {
    console.error('❌ Error in verifyCodeAsync:', err.message || err);
    throw err;
  }

}

const instance=new Twilio()
Object.freeze(instance)

module.exports= instance
