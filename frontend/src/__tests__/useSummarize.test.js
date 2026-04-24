import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import useSummarize from "../hooks/useSummarize";

// Mock the API client
vi.mock("../api/client", () => ({
  summarizeVideo: vi.fn(),
}));

import { summarizeVideo } from "../api/client";

describe("useSummarize", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts in idle state", () => {
    const { result } = renderHook(() => useSummarize());

    expect(result.current.status).toBe("idle");
    expect(result.current.report).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.metadata).toBeNull();
  });

  it("sets error for invalid URL", async () => {
    const { result } = renderHook(() => useSummarize());

    await act(async () => {
      result.current.summarize("not-a-url");
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toContain("valid YouTube URL");
  });

  it("transitions to processing on valid URL", async () => {
    summarizeVideo.mockReturnValue(new Promise(() => {})); // never resolves

    const { result } = renderHook(() => useSummarize());

    act(() => {
      result.current.summarize("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    });

    expect(result.current.status).toBe("processing");
  });

  it("transitions to success on API response", async () => {
    summarizeVideo.mockResolvedValue({
      status: "success",
      markdown_report: "# Summary",
      stages: [
        { name: "Fetching transcript", status: "completed" },
      ],
      metadata: { video_id: "dQw4w9WgXcQ", url: "https://youtube.com/watch?v=dQw4w9WgXcQ" },
    });

    const { result } = renderHook(() => useSummarize());

    await act(async () => {
      await result.current.summarize("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    });

    expect(result.current.status).toBe("success");
    expect(result.current.report).toBe("# Summary");
    expect(result.current.metadata.video_id).toBe("dQw4w9WgXcQ");
  });

  it("handles API error", async () => {
    summarizeVideo.mockRejectedValue({
      response: {
        status: 404,
        data: { detail: "No transcript available for this video." },
      },
    });

    const { result } = renderHook(() => useSummarize());

    await act(async () => {
      await result.current.summarize("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toContain("No transcript");
  });

  it("handles network error", async () => {
    summarizeVideo.mockRejectedValue(new Error("Network Error"));

    const { result } = renderHook(() => useSummarize());

    await act(async () => {
      await result.current.summarize("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toContain("connect");
  });

  it("resets state", async () => {
    summarizeVideo.mockResolvedValue({
      status: "success",
      markdown_report: "# Report",
      stages: [],
      metadata: { video_id: "abc", url: "https://youtube.com/watch?v=abc" },
    });

    const { result } = renderHook(() => useSummarize());

    await act(async () => {
      await result.current.summarize("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    });

    expect(result.current.status).toBe("success");

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.report).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("handles rate limit error", async () => {
    summarizeVideo.mockRejectedValue({
      response: {
        status: 429,
        data: { detail: "I'm processing too many requests right now, please wait." },
      },
    });

    const { result } = renderHook(() => useSummarize());

    await act(async () => {
      await result.current.summarize("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toContain("too many requests");
  });
});
