import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StagedLoader from "../components/StagedLoader";

const mockStages = [
  { name: "Fetching transcript", status: "completed" },
  { name: "Analyzing content", status: "running" },
  { name: "Extracting topics", status: "pending" },
  { name: "Generating timestamps", status: "pending" },
  { name: "Generating report", status: "pending" },
];

describe("StagedLoader", () => {
  it("renders all stage names", () => {
    render(<StagedLoader stages={mockStages} />);

    expect(screen.getByText("Fetching transcript")).toBeInTheDocument();
    expect(screen.getByText("Analyzing content")).toBeInTheDocument();
    expect(screen.getByText("Extracting topics")).toBeInTheDocument();
    expect(screen.getByText("Generating timestamps")).toBeInTheDocument();
    expect(screen.getByText("Generating report")).toBeInTheDocument();
  });

  it("shows agent thinking footer", () => {
    render(<StagedLoader stages={mockStages} />);

    expect(screen.getByText("Agent is thinking")).toBeInTheDocument();
  });

  it("renders correct number of list items", () => {
    render(<StagedLoader stages={mockStages} />);

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(5);
  });

  it("renders with all completed stages", () => {
    const completedStages = mockStages.map((s) => ({
      ...s,
      status: "completed",
    }));
    render(<StagedLoader stages={completedStages} />);

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(5);
  });

  it("renders with failed stage", () => {
    const failedStages = [
      { name: "Fetching transcript", status: "failed" },
      { name: "Analyzing content", status: "pending" },
    ];
    render(<StagedLoader stages={failedStages} />);

    expect(screen.getByText("Fetching transcript")).toBeInTheDocument();
  });

  it("renders progress bar when stage has progress", () => {
    const stagesWithProgress = [
      { name: "Fetching transcript", status: "running", progress: 50 },
    ];
    const { container } = render(<StagedLoader stages={stagesWithProgress} />);

    // framer-motion animates width, so check the progress bar element exists
    const progressBar = container.querySelector('.bg-gradient-to-r');
    expect(progressBar).toBeInTheDocument();
  });
});
