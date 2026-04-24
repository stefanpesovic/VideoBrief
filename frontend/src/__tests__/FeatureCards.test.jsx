import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FeatureCards from "../components/FeatureCards";

describe("FeatureCards", () => {
  it("renders three feature cards", () => {
    render(<FeatureCards />);
    expect(screen.getByText("Smart Content Detection")).toBeInTheDocument();
    expect(screen.getByText("Clickable Timestamps")).toBeInTheDocument();
    expect(screen.getByText("Copy & Download")).toBeInTheDocument();
  });

  it("renders descriptions for each card", () => {
    render(<FeatureCards />);
    expect(
      screen.getByText(/AI agent identifies tutorials/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Jump directly to key moments/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Export your summary as markdown/)
    ).toBeInTheDocument();
  });
});
