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
  (response) => {
    console.log("AXIOS RESPONSE:", response.config.url, response.data);
    return response.data; // Directly return response data
  },
  async (error) => {
    const originalRequest = error.config;

    // If 401, we haven't already tried to refresh, and this isn't the refresh
    // call itself (which would otherwise recurse forever on a bad cookie),
    // try to refresh.
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/admin")
    ) {
      originalRequest._retry = true;

      try {
        // Try to refresh the access token using the httpOnly refresh token cookie
        const response = await axiosinstance.post('/auth/refresh');
        console.log("response is ",response);
        console.log("data ",response.data);

        // The response interceptor above already unwraps to the JSON body,
        // i.e. { status, data: { accessToken } } — read one level, not two.
        const newToken = response.data?.accessToken;
        console.log("new token is", newToken);

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

    // For other 401 errors or if refresh failed (admin endpoints excluded:
    // the admin session uses its own token + /admin redirect in adminApi)
    if (
      error.response?.status === 401 &&
      !originalRequest.url?.includes("/admin")
    ) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error.response?.data || error.message);
  }
);

export default axiosinstance;