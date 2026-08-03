import axios from 'axios';



const axiosinstance = axios.create({
     
     baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
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

// Response Interceptor: Global Error Handling & Token Refresh
axiosinstance.interceptors.response.use(
  (response) => response.data, // Directly return response data
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the access token using the httpOnly refresh token cookie
        const response = await axiosinstance.post('/auth/refresh');
        const newToken = response.data?.data?.accessToken;

        if (newToken) {
          // Store the new access token
          localStorage.setItem('token', newToken);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosinstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - clear token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // For other 401 errors or if refresh failed
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error.response?.data || error.message);
  }
);

export default axiosinstance;