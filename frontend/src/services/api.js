import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const studentToken = localStorage.getItem(
      "lakshyapath_token"
    );

    const adminToken = localStorage.getItem(
      "lakshyapath_admin_token"
    );

    const token = adminToken || studentToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;