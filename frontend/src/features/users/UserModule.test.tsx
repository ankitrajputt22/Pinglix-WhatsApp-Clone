import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "../../app/App";

const authUser = {
  id: 1,
  email: "ankit@example.com",
  displayName: "Ankit",
  profileImageUrl: null,
  accountStatus: "ACTIVE",
  createdAt: "2026-07-31T12:00:00Z"
};

const userProfile = {
  ...authUser,
  about: "Hey there! I am using Pinglix."
};

const searchResult = {
  id: 2,
  email: "ankush@example.com",
  displayName: "Ankush",
  profileImageUrl: null,
  about: "Available on Pinglix"
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

function unauthorizedResponse() {
  return jsonResponse(
    {
      status: 401,
      error: "AUTHENTICATION_REQUIRED",
      message: "Authentication is required",
      path: "/api/v1/auth/me"
    },
    401
  );
}

function renderApp() {
  window.history.replaceState({}, "", "/app");
  return render(<App />);
}

function mockAuthenticatedProfile(profileResponse: Response) {
  vi.mocked(fetch)
    .mockResolvedValueOnce(jsonResponse(authUser))
    .mockResolvedValueOnce(profileResponse)
    .mockResolvedValueOnce(jsonResponse([]));
}

async function waitForApp() {
  return screen.findByRole("heading", { name: "Welcome to Pinglix" });
}

describe("user module", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    window.history.replaceState({}, "", "/");
  });

  it("renders the current user profile card", async () => {
    mockAuthenticatedProfile(jsonResponse(userProfile));
    renderApp();

    await waitForApp();
    expect(
      await screen.findByRole("heading", { name: "Current user profile" })
    ).toBeInTheDocument();
    const profile = screen.getByRole("region", {
      name: "Current user profile"
    });
    expect(within(profile).getByText("ankit@example.com")).toBeInTheDocument();
    expect(
      within(profile).getByText("Hey there! I am using Pinglix.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Search for users to start connecting on Pinglix.")
    ).toBeInTheDocument();
  });

  it("edits and saves the current user profile", async () => {
    const user = userEvent.setup();
    mockAuthenticatedProfile(jsonResponse(userProfile));
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        ...userProfile,
        displayName: "Ankit Rajput",
        about: "Building Pinglix"
      })
    );
    renderApp();
    await waitForApp();

    await user.click(screen.getByRole("button", { name: "Edit Profile" }));
    expect(screen.getByRole("form", { name: "Edit profile" })).toBeInTheDocument();
    await user.clear(screen.getByLabelText("Display name"));
    await user.type(screen.getByLabelText("Display name"), "Ankit Rajput");
    await user.clear(screen.getByLabelText("About"));
    await user.type(screen.getByLabelText("About"), "Building Pinglix");
    await user.click(screen.getByRole("button", { name: "Save" }));

    const profile = screen.getByRole("region", {
      name: "Current user profile"
    });
    expect(within(profile).getByText("Ankit Rajput")).toBeInTheDocument();
    expect(fetch).toHaveBeenLastCalledWith(
      "http://localhost:8081/api/v1/users/me",
      expect.objectContaining({
        credentials: "include",
        method: "PATCH",
        body: JSON.stringify({
          displayName: "Ankit Rajput",
          about: "Building Pinglix",
          profileImageUrl: ""
        })
      })
    );
  });

  it("moves focus to user search from New chat", async () => {
    const user = userEvent.setup();
    mockAuthenticatedProfile(jsonResponse(userProfile));
    renderApp();
    await waitForApp();

    await user.click(screen.getByRole("button", { name: "New chat" }));

    expect(screen.getByLabelText("Search users")).toHaveFocus();
  });

  it("shows a loading state while the profile is loading", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(authUser))
      .mockImplementationOnce(() => new Promise(() => undefined))
      .mockResolvedValueOnce(jsonResponse([]));
    renderApp();

    await waitForApp();
    expect(
      screen.getByText("Loading your profile...")
    ).toBeInTheDocument();
  });

  it("shows a friendly profile error state", async () => {
    mockAuthenticatedProfile(
      jsonResponse({ error: "INTERNAL_SERVER_ERROR" }, 500)
    );
    renderApp();

    expect(
      await screen.findByText("Unable to load your profile")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Unable to load your profile. Please try again.")
    ).toBeInTheDocument();
  });

  it("validates the minimum search length", async () => {
    const user = userEvent.setup();
    mockAuthenticatedProfile(jsonResponse(userProfile));
    renderApp();
    await waitForApp();

    await user.type(screen.getByLabelText("Search users"), "a");

    expect(
      await screen.findByText("Enter at least 2 characters to search")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Search" })).toBeDisabled();
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("renders matching user search results", async () => {
    const user = userEvent.setup();
    mockAuthenticatedProfile(jsonResponse(userProfile));
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([searchResult]));
    renderApp();
    await waitForApp();

    await user.type(screen.getByLabelText("Search users"), "ank");
    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(await screen.findByText("Ankush")).toBeInTheDocument();
    expect(screen.getByText("ankush@example.com")).toBeInTheDocument();
    expect(screen.getByText("Available on Pinglix")).toBeInTheDocument();
  });

  it("trims the search query before sending it", async () => {
    const user = userEvent.setup();
    mockAuthenticatedProfile(jsonResponse(userProfile));
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([searchResult]));
    renderApp();
    await waitForApp();

    await user.type(screen.getByLabelText("Search users"), "  ank  ");
    await user.click(screen.getByRole("button", { name: "Search" }));
    await screen.findByText("Ankush");

    expect(fetch).toHaveBeenLastCalledWith(
      "http://localhost:8081/api/v1/users/search?query=ank",
      expect.objectContaining({
        credentials: "include",
        method: "GET"
      })
    );
  });

  it("shows a search loading state", async () => {
    const user = userEvent.setup();
    mockAuthenticatedProfile(jsonResponse(userProfile));
    vi.mocked(fetch).mockImplementationOnce(() => new Promise(() => undefined));
    renderApp();
    await waitForApp();

    await user.type(screen.getByLabelText("Search users"), "ank");
    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(
      await screen.findByRole("button", { name: "Searching..." })
    ).toBeDisabled();
  });

  it("prevents search input longer than 100 characters", async () => {
    const user = userEvent.setup();
    mockAuthenticatedProfile(jsonResponse(userProfile));
    renderApp();
    await waitForApp();

    const input = screen.getByLabelText("Search users");
    await user.type(input, "a".repeat(101));

    expect(input).toHaveValue("a".repeat(100));
  });

  it("shows the no-results empty state", async () => {
    const user = userEvent.setup();
    mockAuthenticatedProfile(jsonResponse(userProfile));
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([]));
    renderApp();
    await waitForApp();

    await user.type(screen.getByLabelText("Search users"), "nobody");
    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(await screen.findByText("No users found.")).toBeInTheDocument();
  });

  it("shows a friendly search error state", async () => {
    const user = userEvent.setup();
    mockAuthenticatedProfile(jsonResponse(userProfile));
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ error: "INTERNAL_SERVER_ERROR" }, 500)
    );
    renderApp();
    await waitForApp();

    await user.type(screen.getByLabelText("Search users"), "ank");
    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(
      await screen.findByText("Unable to search users")
    ).toBeInTheDocument();
  });

  it("keeps the existing logout behavior", async () => {
    const user = userEvent.setup();
    mockAuthenticatedProfile(jsonResponse(userProfile));
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ message: "Logged out successfully" })
    );
    renderApp();
    await waitForApp();

    await user.click(screen.getByRole("button", { name: "Logout" }));

    expect(
      await screen.findByRole("heading", { name: "Log in to Pinglix" })
    ).toBeInTheDocument();
  });

  it("redirects unauthenticated users to login", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(unauthorizedResponse())
      .mockResolvedValueOnce(unauthorizedResponse());
    renderApp();

    expect(
      await screen.findByRole("heading", { name: "Log in to Pinglix" })
    ).toBeInTheDocument();
  });
});
