import axios from "axios";
import { getAdminToken, clearAdminToken } from "./adminAuth";

// Admin API instance — separate from axiosInstance on purpose.
// The regular axiosInstance interceptor only knows about the USER token
// ("token" key) and handles 401s with the user refresh flow + /login redirect.
// Admin calls must carry the ADMIN token ("admin_token") and on 401 should
// clear the admin session and bounce to /admin, never the user login.
const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: { "Content-Type": "application/json" },
});

adminApi.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  // Same unwrap convention as axiosInstance: `response` is the JSON body
  // { status, data } — read one level, not two.
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Admin token expired / invalid → clear it and return to /admin.
      clearAdminToken();
      window.location.href = "/admin";
    }
    return Promise.reject(error.response?.data || error.message);
  },
);

export default adminApi;
