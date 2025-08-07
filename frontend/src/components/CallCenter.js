import React from 'react'
import NavBar from './NavBar'
import CallProgress from './CallProgress'

function CallCenter({ calls }){
    return (
        <div>

            <NavBar />
            {calls.calls.map((call)=> (
            
            <CallProgress call={ call } /> 
            
            ))}
                     
        </div>
    )
}

export default CallCenter