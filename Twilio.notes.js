const twilio  = require('twilio')
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