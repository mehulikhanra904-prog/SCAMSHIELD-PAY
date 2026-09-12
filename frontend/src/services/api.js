import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
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