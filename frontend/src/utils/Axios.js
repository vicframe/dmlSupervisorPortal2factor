import axios from 'axios';

const baseURL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : 'https://dmlsupervisorportal2factor.onrender.com';

export default axios.create({
  baseURL,
  responseType: 'json',
});

/*
import axios from 'axios';
export default axios.create({
    baseURL:'http://localhost:3001',
    responseType : 'json'

})*/