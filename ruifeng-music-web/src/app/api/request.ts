import axios from 'axios';

const language = typeof window !== 'undefined' 
  ? window.localStorage.getItem('language') 
  : process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE;

const instance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_HOST}:${process.env.NEXT_PUBLIC_API_PORT}`,
  timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 10000,
  headers: {
    'Accept-Language': language,
    'Content-Type': 'application/json'
  }
});

// 添加日志输出
console.log('API baseURL:', `${process.env.NEXT_PUBLIC_API_HOST}:${process.env.NEXT_PUBLIC_API_PORT}`);

instance.interceptors.request.use(config => {
  // do something with the config before it's sent
  console.log('Request URL:', config.baseURL+config.url);
  return config;
});

export default instance;
