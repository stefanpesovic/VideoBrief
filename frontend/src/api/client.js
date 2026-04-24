import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 130000, // slightly above backend AGENT_TIMEOUT_SECONDS
});

export async function summarizeVideo(url) {
  const response = await api.post("/summarize", { url });
  return response.data;
}

export async function checkHealth() {
  const response = await api.get("/health");
  return response.data;
}

export default api;
