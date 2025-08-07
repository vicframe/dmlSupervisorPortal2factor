//import React from 'react'
import { useState } from 'react'
 function useLocalStorage(key,initialValue) {
    const [storedValue, setStoredValue] = useState(()=>{
        try{
            const item = localStorage.getItem(key);
            console.log('item', item)
            return item ? JSON.parse(item) : initialValue
        }catch(error){
            console.error(error)
            return initialValue
        }
    });
    const setValue = (value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value))
            console.log('localstorage', localStorage)
            setStoredValue(value)
        }catch(error){
            console.error(error)
        }
    }

    return [storedValue, setValue]
    
}

export default useLocalStorage