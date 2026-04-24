import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import VideoPreview from "../components/VideoPreview";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("VideoPreview", () => {
  it("renders nothing when no URL provided", () => {
    const { container } = render(<VideoPreview url="" />);
    expect(container.firstChild).toBeNull();
  });

  it("fetches oEmbed data and shows title", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          title: "Test Video Title",
          author_name: "Test Channel",
          thumbnail_url: "https://example.com/thumb.jpg",
        }),
    });

    render(
      <VideoPreview url="https://www.youtube.com/watch?v=test123" />
    );

    await waitFor(() => {
      expect(screen.getByText("Test Video Title")).toBeInTheDocument();
    });
    expect(screen.getByText("Test Channel")).toBeInTheDocument();
    expect(screen.getByText("Ready to analyze")).toBeInTheDocument();
  });

  it("renders nothing when fetch fails (CORS)", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("CORS"));

    const { container } = render(
      <VideoPreview url="https://www.youtube.com/watch?v=test123" />
    );

    // Should not crash, just show nothing
    await waitFor(() => {
      expect(container.querySelector("[data-error]")).toBeNull();
    });
  });
});
