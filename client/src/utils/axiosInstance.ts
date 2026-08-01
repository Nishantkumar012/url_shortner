import axios from 'axios';



const axiosinstance = axios.create({
     
     baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
     headers:{
        'Content-Type': 'application/json'
     },
     withCredentials:true
})


// Request Interceptor: Automatically attach Token/Headers
axiosinstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // or from your state/cookies
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handling (Optional)
axiosinstance.interceptors.response.use(
  (response) => response.data, // Directly return response data
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized (e.g., redirect to login, clear storage)
      localStorage.removeItem('token');
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export default axiosinstance;