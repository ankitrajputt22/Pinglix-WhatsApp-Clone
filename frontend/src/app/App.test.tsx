import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "./App";

const healthResponse = {
  status: "UP",
  application: "Pinglix",
  message: "Pinglix backend is running",
  timestamp: "2026-07-30T12:00:00Z"
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

describe("App", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    window.history.replaceState({}, "", "/health");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the Pinglix frontend foundation", () => {
    vi.mocked(fetch).mockImplementation(() => new Promise(() => undefined));

    render(<App />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Pinglix" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Real-time conversations, instantly connected.")
    ).toBeInTheDocument();
  });

  it("shows a loading state while checking the backend", () => {
    vi.mocked(fetch).mockImplementation(() => new Promise(() => undefined));

    render(<App />);

    expect(
      screen.getByText("Checking backend connection...")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Checking..." })
    ).toBeDisabled();
  });

  it("shows the success state when the backend responds", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(healthResponse));

    render(<App />);

    expect(
      await screen.findByText("Backend connection successful")
    ).toBeInTheDocument();
    expect(screen.getByText("Pinglix backend is running")).toBeInTheDocument();
    expect(screen.getByText("UP")).toBeInTheDocument();
  });

  it("shows an error state when the backend request fails", async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError("Failed to fetch"));

    render(<App />);

    expect(
      await screen.findByText("Backend connection unavailable")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Backend connection failed. Please make sure the backend is running on port 8081."
      )
    ).toBeInTheDocument();
  });

  it("supports a health response that uses the app field", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({
        status: "UP",
        app: "Pinglix API",
        message: "Pinglix backend is running"
      })
    );

    render(<App />);

    expect(
      await screen.findByText("Backend connection successful")
    ).toBeInTheDocument();
    expect(screen.getByText("Pinglix API")).toBeInTheDocument();
  });

  it("shows a clear error for a malformed health response", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ app: "Pinglix" }));

    render(<App />);

    expect(
      await screen.findByText("Unexpected backend response.")
    ).toBeInTheDocument();
  });

  it("checks the backend again when retry is selected", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch)
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce(jsonResponse(healthResponse));

    render(<App />);

    const retryButton = await screen.findByRole("button", {
      name: "Retry Connection"
    });
    await user.click(retryButton);

    expect(
      await screen.findByText("Backend connection successful")
    ).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("does not show future authentication or chat screens on the health page", () => {
    vi.mocked(fetch).mockImplementation(() => new Promise(() => undefined));

    render(<App />);

    expect(
      screen.queryByRole("heading", { name: /log in/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /create.*account/i })
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/recent conversations/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/send message/i)).not.toBeInTheDocument();
  });
});
