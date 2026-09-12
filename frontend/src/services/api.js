import axios from "axios";

// Use the deployed backend by default so the app works from any device.
// VITE_API_URL can still override this for local development.
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://scamshield-pay.onrender.com/api";

const API = axios.create({
  baseURL: API_BASE_URL.replace(/\/$/, ""),
  headers: {
    "Content-Type": "application/json",
  },
});

export const analyzeMessage = async (message) => {
  try {
    const response = await API.post("/scan/analyze", {
      message,
    });

    return response.data;
  } catch (error) {
    if (error.code === "ERR_NETWORK") {
      throw new Error(
        "Unable to connect to ScamShield Pay backend. Please try again in a moment."
      );
    }

    throw error;
  }
};

export const checkHealth = async () => {
  const response = await API.get("/health");
  return response.data;
};
