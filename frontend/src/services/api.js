import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API = axios.create({
  baseURL: API_BASE_URL.replace(/\/$/, ""),
  headers: {
    "Content-Type": "application/json",
  },
});

export const analyzeMessage = async (message) => {
  const response = await API.post("/scan/analyze", {
    message,
  });

  return response.data;
};

export const checkHealth = async () => {
  const response = await API.get("/health");
  return response.data;
};
