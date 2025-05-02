import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

//NOTE - 요청 인터셉터 - Authorization 헤더 추가
axiosInstance.interceptors.request.use(
  config => {
    // 쿠키 대신 sessionStorage에서 토큰 가져오기
    const token = sessionStorage.getItem('accessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);
export default axiosInstance;
