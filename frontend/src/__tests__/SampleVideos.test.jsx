import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SampleVideos from "../components/SampleVideos";

describe("SampleVideos", () => {
  it("renders three sample buttons", () => {
    render(<SampleVideos onSelect={() => {}} />);

    expect(screen.getByLabelText(/Try: TED Talk on Grit/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Try: Python in 100 Seconds/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Try: Productivity Podcast Clip/)).toBeInTheDocument();
  });

  it("calls onSelect with URL when clicked", () => {
    const onSelect = vi.fn();
    render(<SampleVideos onSelect={onSelect} />);

    fireEvent.click(screen.getByLabelText(/Try: TED Talk on Grit/));

    expect(onSelect).toHaveBeenCalledWith(
      "https://www.youtube.com/watch?v=H14bBuluwB8"
    );
  });

  it("renders 'or try one of these' text", () => {
    render(<SampleVideos onSelect={() => {}} />);
    expect(screen.getByText("or try one of these")).toBeInTheDocument();
  });
});
