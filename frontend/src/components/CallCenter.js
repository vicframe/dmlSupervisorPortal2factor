import React from 'react'
import NavBar from './NavBar'
import CallProgress from './CallProgress'

/*function CallCenter({ calls }){
    return (
        <div>

            <NavBar />
            {calls.calls.map((call)=> (
            
            <CallProgress call={ call } /> 
            
            ))}
                     
        </div>
    )
}
*/

function CallCenter({ calls }) {
 const list = Array.isArray(calls) ? calls : (calls?.calls || []);
   return (
     <div>
       <NavBar />
       {list.map((call) => (
         <CallProgress key={call?.CallSid || crypto.randomUUID()} call={call} />
       ))}
     </div>
   );
 }
export default CallCenter