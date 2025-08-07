import React from 'react'
import {Grid, Header, Segment, Form, Button} from 'semantic-ui-react'
//import {Grid} from 'semantic-ui-react'


function Login({user:{username, mobileNumber, verificationCode, verificationSent},
    setUser, 
    sendSmsCode,
    sendVerificationCode}){
     
     function populateFields(event, data){
        setUser((draft)=>{
            draft[data.name] = data.value
        })
     }
    return (<Grid textAlign='center' verticalAlign='middle' style={{ height:'100vh'}}>
        <Grid.Column style={{maxWidth:450}}>
        login.js grid test
            <Header as='h2' color='teal' textAlign='center'>Log Into Account</Header>

                <Form>
                    <Segment stacked>
                        <Form.Input 
                        fluid 
                        icon='user' 
                        iconPosition='left' 
                        placeholder='username' 
                        value={username}
                        onChange={(event,data)=>{populateFields(event,data)}} 
                         
                        name='username' />
                
                <Form.Input 
                        fluid 
                        icon='mobile alternate' 
                        iconPosition='left' 
                        placeholder='phone' 
                        value={mobileNumber} 
                        onChange={(event,data)=>{populateFields(event,data)}} 
                     
                        name='mobileNumber'
                    />
                {verificationSent &&
                (<Form.Input
                        fluid
                        icon='key'
                        iconPosition='left'
                        placeholder='enter code'
                        value={verificationCode}
                        onChange={(event,data)=> populateFields(event,data)}
                        name='verificationCode'                
                    />)}



                    <Button color='teal' fluid size='large' onClick={!verificationSent ? sendSmsCode:sendVerificationCode} >
                        {!verificationSent ? 'login':'Enter your code.'}


                         </Button>


                    </Segment>
                </Form>
            
        </Grid.Column>
    </Grid>)
}

export default Login;