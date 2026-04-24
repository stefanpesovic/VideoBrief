import { useState, useCallback } from "react";
import { summarizeVideo } from "../api/client";
import { isValidYoutubeUrl } from "../utils/youtube";

const INITIAL_STAGES = [
  { name: "Fetching transcript", status: "pending" },
  { name: "Analyzing content", status: "pending" },
  { name: "Extracting topics", status: "pending" },
  { name: "Generating timestamps", status: "pending" },
  { name: "Generating report", status: "pending" },
];

export default function useSummarize() {
  const [status, setStatus] = useState("idle"); // idle | processing | success | error
  const [stages, setStages] = useState(INITIAL_STAGES);
  const [report, setReport] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [error, setError] = useState(null);

  const summarize = useCallback(async (url) => {
    if (!isValidYoutubeUrl(url)) {
      setStatus("error");
      setError("Please enter a valid YouTube URL");
      return;
    }

    setStatus("processing");
    setError(null);
    setReport(null);
    setMetadata(null);

    // Simulate progressive stage updates while waiting for response
    const stagesCopy = INITIAL_STAGES.map((s) => ({ ...s }));
    setStages(stagesCopy);

    const stageTimer = simulateStages(stagesCopy, setStages);

    try {
      const data = await summarizeVideo(url);

      clearInterval(stageTimer);

      if (data.stages && data.stages.length > 0) {
        setStages(data.stages);
      } else {
        setStages(INITIAL_STAGES.map((s) => ({ ...s, status: "completed" })));
      }

      setReport(data.markdown_report);
      setMetadata(data.metadata);
      setStatus("success");
    } catch (err) {
      clearInterval(stageTimer);

      const message = extractErrorMessage(err);
      setError(message);
      setStatus("error");

      // Mark remaining stages as failed
      setStages((prev) =>
        prev.map((s) =>
          s.status === "running" || s.status === "pending"
            ? { ...s, status: "failed" }
            : s
        )
      );
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setStages(INITIAL_STAGES);
    setReport(null);
    setMetadata(null);
    setError(null);
  }, []);

  return { status, stages, report, metadata, error, summarize, reset };
}

function simulateStages(stages, setStages) {
  let currentIndex = 0;

  // Start first stage immediately
  stages[0] = { ...stages[0], status: "running" };
  setStages([...stages]);

  return setInterval(() => {
    if (currentIndex >= stages.length - 1) return;

    // Complete current stage
    stages[currentIndex] = { ...stages[currentIndex], status: "completed" };
    currentIndex++;
    // Start next stage
    stages[currentIndex] = { ...stages[currentIndex], status: "running" };
    setStages([...stages]);
  }, 3000);
}

function extractErrorMessage(err) {
  const response = err?.response;
  if (response) {
    const detail = response.data?.detail;
    if (detail) return detail;

    switch (response.status) {
      case 404:
        return "No transcript available for this video. Try a video with captions enabled.";
      case 422:
        return "Invalid YouTube URL. Please check and try again.";
      case 429:
        return "I'm processing too many requests right now, please wait.";
      case 504:
        return "The video is too long or complex. Try a shorter one.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  }

  if (err?.code === "ECONNABORTED" || err?.message?.includes("timeout")) {
    return "The video is too long or complex. Try a shorter one.";
  }

  return "Could not connect to the server. Please check your connection.";
}
