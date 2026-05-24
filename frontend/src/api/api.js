import axios from "axios";

const trimTrailingSlash = (value) => value?.replace(/\/+$/, "");

const resolveApiBaseUrl = () => {
  const envBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_URL);

  if (envBaseUrl) {
    return envBaseUrl;
  }

  if (import.meta.env.DEV) {
    return "http://localhost:5000/api";
  }

  if (typeof window !== "undefined") {
    return `${window.location.origin}/api`;
  }

  throw new Error("API URL missing in production");
};

const API = axios.create({
  baseURL: resolveApiBaseUrl(),
});

export const signup = (data) => API.post("/auth/signup", data);
export const login = (data) => API.post("/auth/login", data);
export const forgotPassword = (data) => API.post("/auth/forgot-password", data);
export const verifySecret = (data) => API.post("/auth/verify-secret", data);
export const resetPassword = (data) => API.post("/auth/reset-password", data);
export const updateSecurityQuestion = (data) => API.put("/auth/security-question", data);

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers ||= {};
    const hasAuthorizationHeader =
      typeof config.headers.Authorization !== "undefined" ||
      typeof config.headers.authorization !== "undefined";

    if (!hasAuthorizationHeader) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default API;
