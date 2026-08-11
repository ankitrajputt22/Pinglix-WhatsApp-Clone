import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "../../app/App";
import { stompClient } from "../../lib/stomp-client";

const authUser = {
  id: 1,
  email: "ankit@example.com",
  displayName: "Ankit",
  profileImageUrl: null,
  accountStatus: "ACTIVE",
  createdAt: "2026-07-30T12:00:00Z"
};

const userProfile = {
  ...authUser,
  about: "Hey there! I am using Pinglix."
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

function unauthorizedResponse(code = "AUTHENTICATION_REQUIRED") {
  return jsonResponse(
    {
      timestamp: "2026-07-30T12:00:00Z",
      status: 401,
      error: code,
      message:
        code === "INVALID_CREDENTIALS"
          ? "Invalid email or password"
          : "Authentication is required",
      path: "/api/v1/auth/me"
    },
    401
  );
}

function mockAnonymousSession() {
  vi.mocked(fetch)
    .mockResolvedValueOnce(unauthorizedResponse())
    .mockResolvedValueOnce(unauthorizedResponse());
}

function renderAt(path: string) {
  window.history.replaceState({}, "", path);
  return render(<App />);
}

async function waitForLoginPage() {
  return screen.findByRole("heading", { name: "Log in to Pinglix" });
}

async function waitForRegisterPage() {
  return screen.findByRole("heading", { name: "Create your account" });
}

async function fillLoginForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Email"), "ankit@example.com");
  await user.type(screen.getByLabelText("Password"), "StrongPassword123!");
}

async function fillRegisterForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Display name"), "Ankit");
  await user.type(screen.getByLabelText("Email"), "ankit@example.com");
  await user.type(screen.getByLabelText("Password"), "StrongPassword123!");
  await user.type(
    screen.getByLabelText("Confirm password"),
    "StrongPassword123!"
  );
}

describe("authentication flow", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  it("renders the login form for an anonymous user", async () => {
    mockAnonymousSession();
    renderAt("/login");

    await waitForLoginPage();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeDisabled();
  });

  it("renders the register form for an anonymous user", async () => {
    mockAnonymousSession();
    renderAt("/register");

    await waitForRegisterPage();
    expect(screen.getByLabelText("Display name")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Register" })).toBeDisabled();
  });

  it("redirects an anonymous user from the root route to login", async () => {
    mockAnonymousSession();
    renderAt("/");

    expect(await waitForLoginPage()).toBeInTheDocument();
  });

  it("redirects an authenticated user from the root route to the app", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(authUser))
      .mockResolvedValueOnce(jsonResponse(userProfile))
      .mockResolvedValueOnce(jsonResponse([]));
    renderAt("/");

    expect(
      await screen.findByRole("heading", { name: "Welcome to Pinglix" })
    ).toBeInTheDocument();
  });

  it("validates the login form before submission", async () => {
    const user = userEvent.setup();
    mockAnonymousSession();
    renderAt("/login");
    await waitForLoginPage();

    await user.type(screen.getByLabelText("Email"), "invalid");
    await user.type(screen.getByLabelText("Password"), "x");
    await user.clear(screen.getByLabelText("Password"));

    expect(
      await screen.findByText("Enter a valid email address")
    ).toBeInTheDocument();
    expect(await screen.findByText("Password is required")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeDisabled();
  });

  it("lets the user show and hide the login password", async () => {
    const user = userEvent.setup();
    mockAnonymousSession();
    renderAt("/login");
    await waitForLoginPage();

    const password = screen.getByLabelText("Password");
    expect(password).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(password).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(password).toHaveAttribute("type", "password");
  });

  it("validates register field lengths", async () => {
    const user = userEvent.setup();
    mockAnonymousSession();
    renderAt("/register");
    await waitForRegisterPage();

    await user.type(screen.getByLabelText("Display name"), "A");
    await user.type(screen.getByLabelText("Email"), "ankit@example.com");
    await user.type(screen.getByLabelText("Password"), "short");
    await user.type(screen.getByLabelText("Confirm password"), "short");

    expect(
      await screen.findByText("Display name must be at least 2 characters")
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Password must be at least 8 characters")
    ).toBeInTheDocument();
  });

  it("shows a password confirmation mismatch", async () => {
    const user = userEvent.setup();
    mockAnonymousSession();
    renderAt("/register");
    await waitForRegisterPage();

    await user.type(screen.getByLabelText("Display name"), "Ankit");
    await user.type(screen.getByLabelText("Email"), "ankit@example.com");
    await user.type(
      screen.getByLabelText("Password"),
      "StrongPassword123!"
    );
    await user.type(
      screen.getByLabelText("Confirm password"),
      "DifferentPassword123!"
    );

    expect(
      await screen.findByText("Passwords do not match")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Register" })).toBeDisabled();
  });

  it("redirects to the protected app after successful login", async () => {
    const user = userEvent.setup();
    mockAnonymousSession();
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(authUser))
      .mockResolvedValueOnce(jsonResponse(userProfile))
      .mockResolvedValueOnce(jsonResponse([]));
    renderAt("/login");
    await waitForLoginPage();

    await fillLoginForm(user);
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(
      await screen.findByRole("heading", { name: "Welcome to Pinglix" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Current user profile" })
    ).toBeInTheDocument();
  });

  it("redirects to the protected app after successful registration", async () => {
    const user = userEvent.setup();
    mockAnonymousSession();
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(authUser, 201))
      .mockResolvedValueOnce(jsonResponse(userProfile))
      .mockResolvedValueOnce(jsonResponse([]));
    renderAt("/register");
    await waitForRegisterPage();

    await fillRegisterForm(user);
    await user.click(screen.getByRole("button", { name: "Register" }));

    expect(
      await screen.findByRole("heading", { name: "Welcome to Pinglix" })
    ).toBeInTheDocument();
  });

  it("redirects an anonymous user from the protected app to login", async () => {
    mockAnonymousSession();
    renderAt("/app");

    expect(await waitForLoginPage()).toBeInTheDocument();
  });

  it("restores an expired access session through the refresh cookie", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(unauthorizedResponse())
      .mockResolvedValueOnce(jsonResponse(authUser))
      .mockResolvedValueOnce(jsonResponse(userProfile))
      .mockResolvedValueOnce(jsonResponse([]));
    renderAt("/app");

    expect(
      await screen.findByRole("heading", { name: "Welcome to Pinglix" })
    ).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(4);
  });

  it("redirects an authenticated user away from login", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(authUser))
      .mockResolvedValueOnce(jsonResponse(userProfile))
      .mockResolvedValueOnce(jsonResponse([]));
    renderAt("/login");

    expect(
      await screen.findByRole("heading", { name: "Welcome to Pinglix" })
    ).toBeInTheDocument();
  });

  it("redirects an authenticated user away from registration", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(authUser))
      .mockResolvedValueOnce(jsonResponse(userProfile))
      .mockResolvedValueOnce(jsonResponse([]));
    renderAt("/register");

    expect(
      await screen.findByRole("heading", { name: "Welcome to Pinglix" })
    ).toBeInTheDocument();
  });

  it("logs out and redirects to login", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(authUser))
      .mockResolvedValueOnce(jsonResponse(userProfile))
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(
        jsonResponse({ message: "Logged out successfully" })
      );
    renderAt("/app");

    await user.click(await screen.findByRole("button", { name: "Logout" }));

    expect(stompClient.disconnect).toHaveBeenCalled();
    expect(await waitForLoginPage()).toBeInTheDocument();
  });

  it("shows a safe API error for invalid login credentials", async () => {
    const user = userEvent.setup();
    mockAnonymousSession();
    vi.mocked(fetch).mockResolvedValueOnce(
      unauthorizedResponse("INVALID_CREDENTIALS")
    );
    renderAt("/login");
    await waitForLoginPage();

    await fillLoginForm(user);
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(
      await screen.findByText("Invalid email or password")
    ).toBeInTheDocument();
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
  });

  it("shows the duplicate email error returned by registration", async () => {
    const user = userEvent.setup();
    mockAnonymousSession();
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse(
        {
          timestamp: "2026-07-31T00:00:00Z",
          status: 409,
          error: "DUPLICATE_RESOURCE",
          message: "Email is already registered",
          path: "/api/v1/auth/register"
        },
        409
      )
    );
    renderAt("/register");
    await waitForRegisterPage();

    await fillRegisterForm(user);
    await user.click(screen.getByRole("button", { name: "Register" }));

    expect(
      await screen.findByText("Email is already registered")
    ).toBeInTheDocument();
  });

  it("does not store authentication tokens in browser storage", async () => {
    const user = userEvent.setup();
    mockAnonymousSession();
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(authUser))
      .mockResolvedValueOnce(jsonResponse(userProfile))
      .mockResolvedValueOnce(jsonResponse([]));
    renderAt("/login");
    await waitForLoginPage();

    await fillLoginForm(user);
    await user.click(screen.getByRole("button", { name: "Login" }));
    await screen.findByRole("heading", { name: "Welcome to Pinglix" });

    expect(window.localStorage).toHaveLength(0);
    expect(window.sessionStorage).toHaveLength(0);
  });

  it("does not render chat features on authentication pages", async () => {
    mockAnonymousSession();
    renderAt("/login");
    await waitForLoginPage();

    expect(screen.queryByText(/recent conversations/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/send message/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/message composer/i)).not.toBeInTheDocument();
  });
});
