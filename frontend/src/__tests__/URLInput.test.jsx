import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import URLInput from "../components/URLInput";

describe("URLInput", () => {
  it("renders input and submit button", () => {
    render(<URLInput onSubmit={() => {}} isLoading={false} />);

    expect(screen.getByLabelText("YouTube URL")).toBeInTheDocument();
    expect(screen.getByText("Brief it")).toBeInTheDocument();
  });

  it("autofocuses on mount", () => {
    render(<URLInput onSubmit={() => {}} isLoading={false} />);

    expect(screen.getByLabelText("YouTube URL")).toHaveFocus();
  });

  it("shows error for empty submit", () => {
    render(<URLInput onSubmit={() => {}} isLoading={false} />);

    fireEvent.click(screen.getByText("Brief it"));

    expect(screen.getByRole("alert")).toHaveTextContent("Please enter a YouTube URL");
  });

  it("shows error for invalid URL", () => {
    render(<URLInput onSubmit={() => {}} isLoading={false} />);

    fireEvent.change(screen.getByLabelText("YouTube URL"), {
      target: { value: "https://example.com" },
    });
    fireEvent.click(screen.getByText("Brief it"));

    expect(screen.getByRole("alert")).toHaveTextContent("Please enter a valid YouTube URL");
  });

  it("calls onSubmit with valid URL", () => {
    const onSubmit = vi.fn();
    render(<URLInput onSubmit={onSubmit} isLoading={false} />);

    fireEvent.change(screen.getByLabelText("YouTube URL"), {
      target: { value: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    });
    fireEvent.click(screen.getByText("Brief it"));

    expect(onSubmit).toHaveBeenCalledWith("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  });

  it("does not show error after valid submit", () => {
    const onSubmit = vi.fn();
    render(<URLInput onSubmit={onSubmit} isLoading={false} />);

    fireEvent.change(screen.getByLabelText("YouTube URL"), {
      target: { value: "https://youtu.be/dQw4w9WgXcQ" },
    });
    fireEvent.click(screen.getByText("Brief it"));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows 'Briefing...' when loading", () => {
    render(<URLInput onSubmit={() => {}} isLoading={true} />);

    expect(screen.getByText("Briefing...")).toBeInTheDocument();
  });

  it("disables input and button when loading", () => {
    render(<URLInput onSubmit={() => {}} isLoading={true} />);

    expect(screen.getByLabelText("YouTube URL")).toBeDisabled();
    expect(screen.getByText("Briefing...")).toBeDisabled();
  });

  it("clears error when user types", () => {
    render(<URLInput onSubmit={() => {}} isLoading={false} />);

    // Trigger error
    fireEvent.click(screen.getByText("Brief it"));
    expect(screen.getByRole("alert")).toBeInTheDocument();

    // Start typing
    fireEvent.change(screen.getByLabelText("YouTube URL"), {
      target: { value: "h" },
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
