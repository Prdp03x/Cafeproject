import axios from "axios";

const API = axios.create({
  //  baseURL: "https://selfserviceorder-1.onrender.com/api"
  baseURL: "http://localhost:5000/api"
});

// 🔥 Add interceptor
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = token;
  }

  return config;
});

export default API;