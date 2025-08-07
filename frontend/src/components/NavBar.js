import React from 'react'
import {Menu, Container, Image} from 'semantic-ui-react'

function NavBar(){
    return  <Menu>
        <Container text>
            
            <Menu.Item>
                Call Center 
                <i className='phone icone'></i>
                </Menu.Item>
            <Menu.Item position='right'> 
                <Image src='https://react.semantic-ui.com/images/avatar/large/chris.jpg'
                        avatar
                            />
            </Menu.Item>

            <Menu.Item position='right'>A Name</Menu.Item>

        </Container>

    </Menu>
}

export default NavBar