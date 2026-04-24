import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

let activeRequests = 0;
const listeners = new Set();

function notifyLoading() {
  const isLoading = activeRequests > 0;
  listeners.forEach((listener) => listener(isLoading));
}

function incrementRequests() {
  activeRequests += 1;
  notifyLoading();
}

function decrementRequests() {
  activeRequests = Math.max(0, activeRequests - 1);
  notifyLoading();
}

export function subscribeApiLoading(listener) {
  listeners.add(listener);
  listener(activeRequests > 0);

  return () => {
    listeners.delete(listener);
  };
}

api.interceptors.request.use(
  (config) => {
    incrementRequests();
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    decrementRequests();
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    decrementRequests();
    return response;
  },
  (error) => {
    decrementRequests();
    return Promise.reject(error);
  },
);

export default api;
