const twilio=require('twilio')

            
            

class Twilio{
   

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
        console.log('sendverify', data)
        return data

    }

    async verifyCodeAsync(to,code){
        const data=await this.client.verify.services(this.verify).verificationChecks.create({
            to,
            code

        })
        console.log('verifycode', data)
        return data
    }

}

const instance=new Twilio()
Object.freeze(instance)

module.exports= instance
