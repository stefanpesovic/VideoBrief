import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ErrorState from "../components/ErrorState";

describe("ErrorState", () => {
  it("renders headline and subtext for generic error", () => {
    render(<ErrorState error="Something broke" onRetry={() => {}} />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("shows transcript-specific error for transcript issues", () => {
    render(
      <ErrorState error="No transcript available" onRetry={() => {}} />
    );
    expect(screen.getByText("No transcript available")).toBeInTheDocument();
    expect(screen.getByText(/captions enabled/)).toBeInTheDocument();
  });

  it("renders try again button and calls onRetry", () => {
    const onRetry = vi.fn();
    render(<ErrorState error="oops" onRetry={onRetry} />);

    fireEvent.click(screen.getByText("Try again"));
    expect(onRetry).toHaveBeenCalled();
  });

  it("renders sample video alternatives when onSelectSample provided", () => {
    render(
      <ErrorState
        error="oops"
        onRetry={() => {}}
        onSelectSample={() => {}}
      />
    );
    expect(screen.getByText("Or try one of these instead")).toBeInTheDocument();
    expect(screen.getByLabelText(/Try: TED Talk on Grit/)).toBeInTheDocument();
  });

  it("calls onSelectSample when sample clicked", () => {
    const onSelectSample = vi.fn();
    render(
      <ErrorState
        error="oops"
        onRetry={() => {}}
        onSelectSample={onSelectSample}
      />
    );

    fireEvent.click(screen.getByLabelText(/Try: TED Talk on Grit/));
    expect(onSelectSample).toHaveBeenCalledWith(
      "https://www.youtube.com/watch?v=H14bBuluwB8"
    );
  });
});
