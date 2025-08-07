import io from 'socket.io-client';  //clean for final
//export default io.connect('http://localhost:3001')


class Socket{
   // url = 'http://localhost:3001'
    client = null;
    constructor(){
        this.client = io.connect('https://api-obcqutdy7a-uc.a.run.app')
    }

    addToken(token){
        this.client = io.connect('https://api-obcqutdy7a-uc.a.run.app', { query: { token } })
        console.log('addtoken')

    }
    removeToken(){
        this.client = io.connect('https://api-obcqutdy7a-uc.a.run.app')
    }

}
const instance = new Socket();

//export default io.connect('http://localhost:3001')

export default instance
