import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Hero from "../components/Hero";

// Mock canvas context
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  scale: vi.fn(),
  fillStyle: "",
}));

describe("Hero", () => {
  it("renders the title", () => {
    render(<Hero />);
    expect(screen.getByText("VideoBrief")).toBeInTheDocument();
  });

  it("renders the tagline", () => {
    render(<Hero />);
    expect(
      screen.getByText(/From 2 hours of video to 2 minutes of insights/)
    ).toBeInTheDocument();
  });

  it("renders all three stats chips", () => {
    render(<Hero />);
    expect(screen.getByText("30-sec avg summary")).toBeInTheDocument();
    expect(screen.getByText("LangGraph + Llama 3.3")).toBeInTheDocument();
    expect(screen.getByText("100% free")).toBeInTheDocument();
  });
});
