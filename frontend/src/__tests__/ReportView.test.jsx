import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ReportView from "../components/ReportView";

describe("ReportView", () => {
  it("renders nothing when markdown is null", () => {
    const { container } = render(<ReportView markdown={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders heading", () => {
    render(<ReportView markdown="# Video Summary" />);
    expect(screen.getByText("Video Summary")).toBeInTheDocument();
  });

  it("renders subheading", () => {
    render(<ReportView markdown="## Key Themes" />);
    expect(screen.getByText("Key Themes")).toBeInTheDocument();
  });

  it("renders paragraph text", () => {
    render(<ReportView markdown="This is a great video about AI." />);
    expect(screen.getByText("This is a great video about AI.")).toBeInTheDocument();
  });

  it("renders bold text", () => {
    render(<ReportView markdown="This is **important** text." />);
    expect(screen.getByText("important")).toBeInTheDocument();
  });

  it("renders bullet list items", () => {
    const md = ["- First item", "- Second item"].join("\n");
    render(<ReportView markdown={md} />);
    expect(screen.getByText("First item")).toBeInTheDocument();
    expect(screen.getByText("Second item")).toBeInTheDocument();
  });

  it("renders links that open in new tab", () => {
    render(<ReportView markdown="[Click here](https://example.com)" />);
    const link = screen.getByText("Click here");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders timestamp links with pill styling", () => {
    render(
      <ReportView markdown="[00:30](https://youtube.com/watch?v=abc&t=30)" />
    );
    const link = screen.getByText("00:30");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.className).toContain("rounded-full");
  });

  it("renders inline code", () => {
    render(<ReportView markdown="Use `console.log` for debugging." />);
    expect(screen.getByText("console.log")).toBeInTheDocument();
  });

  it("renders complex markdown document", () => {
    const md = `# Summary

## Overview

This video covers **important** topics.

## Key Points

- Point one
- Point two

## Timestamps

- [00:00](https://youtube.com/watch?v=abc&t=0) Intro
- [05:30](https://youtube.com/watch?v=abc&t=330) Main topic`;

    render(<ReportView markdown={md} />);

    expect(screen.getByText("Summary")).toBeInTheDocument();
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Point one")).toBeInTheDocument();
    expect(screen.getByText("00:00")).toBeInTheDocument();
  });
});
