import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import WelcomeBanner from "../components/WelcomeBanner";

beforeEach(() => {
  sessionStorage.clear();
});

describe("WelcomeBanner", () => {
  it("renders the banner message", () => {
    render(<WelcomeBanner />);
    expect(
      screen.getByText(/Portfolio demo project/)
    ).toBeInTheDocument();
  });

  it("has a dismiss button", () => {
    render(<WelcomeBanner />);
    expect(screen.getByLabelText("Dismiss banner")).toBeInTheDocument();
  });

  it("dismisses when close button clicked and saves to sessionStorage", async () => {
    render(<WelcomeBanner />);

    fireEvent.click(screen.getByLabelText("Dismiss banner"));

    await waitFor(() => {
      expect(screen.queryByText(/Portfolio demo project/)).not.toBeInTheDocument();
    });
    expect(sessionStorage.getItem("videobrief_banner_dismissed")).toBe("true");
  });

  it("stays dismissed when sessionStorage has the flag", () => {
    sessionStorage.setItem("videobrief_banner_dismissed", "true");
    render(<WelcomeBanner />);

    expect(screen.queryByText(/Portfolio demo project/)).not.toBeInTheDocument();
  });
});
