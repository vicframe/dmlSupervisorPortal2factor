const twilio=require('twilio')

            
            

class Twilio{
    phoneNumber = '+16175044426'
    phonenNumberSid = 'PN8ea1699149f0acd7a1cc63ea4eecf92d'
    tokenSid = 'SK4411a33df3fe8ce0516b644d080f91a7'
    tokenSecret = '4yK4LfHvoV24N4onYbOauJykXy4TPITT'
    accountSid = 'AC4c3a89e56afcb829253b16848592cbea'
    verify = 'VA296574a1cec0b611282d9e7f30b6894d'

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