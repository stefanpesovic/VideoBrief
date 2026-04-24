import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HowItWorks from "../components/HowItWorks";

describe("HowItWorks", () => {
  it("renders the section title", () => {
    render(<HowItWorks />);
    expect(screen.getByText("How it works")).toBeInTheDocument();
  });

  it("renders three steps", () => {
    render(<HowItWorks />);
    expect(screen.getByText("Paste URL")).toBeInTheDocument();
    expect(screen.getByText("AI Agent Analyzes")).toBeInTheDocument();
    expect(screen.getByText("Get Your Summary")).toBeInTheDocument();
  });

  it("renders step descriptions", () => {
    render(<HowItWorks />);
    expect(screen.getByText("Any YouTube video with captions")).toBeInTheDocument();
    expect(screen.getByText("LangGraph orchestrates 5 specialized tools")).toBeInTheDocument();
    expect(screen.getByText("Copy, download, or share")).toBeInTheDocument();
  });
});
