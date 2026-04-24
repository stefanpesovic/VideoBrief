import { describe, it, expect } from "vitest";
import {
  isValidYoutubeUrl,
  extractVideoId,
  getThumbnailUrl,
  formatTimestamp,
} from "../utils/youtube";

describe("isValidYoutubeUrl", () => {
  it("accepts standard watch URL", () => {
    expect(isValidYoutubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(true);
  });

  it("accepts short URL", () => {
    expect(isValidYoutubeUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(true);
  });

  it("accepts embed URL", () => {
    expect(isValidYoutubeUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe(true);
  });

  it("accepts shorts URL", () => {
    expect(isValidYoutubeUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe(true);
  });

  it("accepts live URL", () => {
    expect(isValidYoutubeUrl("https://www.youtube.com/live/dQw4w9WgXcQ")).toBe(true);
  });

  it("accepts URL with extra params", () => {
    expect(isValidYoutubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120")).toBe(true);
  });

  it("rejects non-YouTube URL", () => {
    expect(isValidYoutubeUrl("https://example.com")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidYoutubeUrl("")).toBe(false);
  });

  it("rejects random text", () => {
    expect(isValidYoutubeUrl("not a url")).toBe(false);
  });

  it("trims whitespace", () => {
    expect(isValidYoutubeUrl("  https://youtu.be/dQw4w9WgXcQ  ")).toBe(true);
  });
});

describe("extractVideoId", () => {
  it("extracts from standard URL", () => {
    expect(extractVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts from short URL", () => {
    expect(extractVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("returns null for invalid URL", () => {
    expect(extractVideoId("https://example.com")).toBeNull();
  });
});

describe("getThumbnailUrl", () => {
  it("returns correct thumbnail URL", () => {
    expect(getThumbnailUrl("dQw4w9WgXcQ")).toBe(
      "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
    );
  });
});

describe("formatTimestamp", () => {
  it("formats zero", () => {
    expect(formatTimestamp(0)).toBe("00:00");
  });

  it("formats seconds only", () => {
    expect(formatTimestamp(45)).toBe("00:45");
  });

  it("formats minutes and seconds", () => {
    expect(formatTimestamp(125)).toBe("02:05");
  });

  it("handles large values", () => {
    expect(formatTimestamp(3661)).toBe("61:01");
  });
});
