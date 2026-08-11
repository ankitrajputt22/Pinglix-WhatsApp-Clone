import {
  render,
  screen,
  waitFor,
  within
} from "@testing-library/react";
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

const conversation = {
  id: 10,
  conversationType: "PRIVATE",
  title: null,
  imageUrl: null,
  otherParticipant: searchResult,
  lastMessageAt: null,
  createdAt: "2026-07-31T12:10:00Z",
  updatedAt: "2026-07-31T12:10:00Z"
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

type MockServerOptions = {
  initialConversations?: typeof conversation[];
  listError?: boolean;
  createError?: boolean;
};

function requestDetails(input: RequestInfo | URL, init?: RequestInit) {
  if (input instanceof Request) {
    return {
      method: input.method,
      path: new URL(input.url).pathname
    };
  }

  return {
    method: init?.method ?? "GET",
    path: new URL(input.toString()).pathname
  };
}

function mockServer(options: MockServerOptions = {}) {
  let conversations = [...(options.initialConversations ?? [])];

  vi.mocked(fetch).mockImplementation(async (input, init) => {
    const { method, path } = requestDetails(input, init);

    if (method === "GET" && path === "/api/v1/auth/me") {
      return jsonResponse(authUser);
    }

    if (method === "GET" && path === "/api/v1/users/me") {
      return jsonResponse(userProfile);
    }

    if (method === "GET" && path === "/api/v1/users/search") {
      return jsonResponse([searchResult]);
    }

    if (method === "GET" && path === "/api/v1/conversations") {
      return options.listError
        ? jsonResponse({ error: "INTERNAL_SERVER_ERROR" }, 500)
        : jsonResponse(conversations);
    }

    if (method === "POST" && path === "/api/v1/conversations/private") {
      if (options.createError) {
        return jsonResponse({ error: "INTERNAL_SERVER_ERROR" }, 500);
      }

      conversations = [conversation];
      return jsonResponse(conversation);
    }

    if (method === "GET" && path === `/api/v1/conversations/${conversation.id}`) {
      return jsonResponse(conversation);
    }

    if (
      method === "GET" &&
      path === `/api/v1/conversations/${conversation.id}/messages`
    ) {
      return jsonResponse({
        items: [],
        nextBeforeMessageId: null,
        hasMore: false
      });
    }

    if (method === "POST" && path === "/api/v1/auth/logout") {
      return jsonResponse({ message: "Logged out successfully" });
    }

    return jsonResponse({ error: "NOT_FOUND" }, 404);
  });
}

function renderApp() {
  window.history.replaceState({}, "", "/app");
  return render(<App />);
}

async function waitForApp() {
  return screen.findByRole("heading", { name: "Welcome to Pinglix" });
}

async function searchForUser(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Search users"), "ank");
  await user.click(screen.getByRole("button", { name: "Search" }));
  return screen.findByText("Ankush");
}

function conversationListRequests() {
  return vi.mocked(fetch).mock.calls.filter(([input, init]) => {
    const request = requestDetails(input, init);
    return (
      request.method === "GET" &&
      request.path === "/api/v1/conversations"
    );
  });
}

describe("private conversation module", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    window.history.replaceState({}, "", "/");
  });

  it("renders Recent Conversations and its empty state", async () => {
    mockServer();
    renderApp();

    await waitForApp();
    expect(
      await screen.findByRole("heading", { name: "Recent Conversations" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "No conversations yet. Search for users to start one."
      )
    ).toBeInTheDocument();
  });

  it("shows a Start Conversation button for each user result", async () => {
    const user = userEvent.setup();
    mockServer();
    renderApp();
    await waitForApp();
    await searchForUser(user);

    expect(
      screen.getByRole("button", {
        name: "Start conversation with Ankush"
      })
    ).toBeInTheDocument();
  });

  it("sends the selected target user ID when starting a conversation", async () => {
    const user = userEvent.setup();
    mockServer();
    renderApp();
    await waitForApp();
    await searchForUser(user);

    await user.click(
      screen.getByRole("button", {
        name: "Start conversation with Ankush"
      })
    );

    await waitFor(() => {
      const call = vi.mocked(fetch).mock.calls.find(([input, init]) => {
        const request = requestDetails(input, init);
        return (
          request.method === "POST" &&
          request.path === "/api/v1/conversations/private"
        );
      });
      expect(call).toBeDefined();
      expect(call?.[1]?.body).toBe(JSON.stringify({ targetUserId: 2 }));
    });
  });

  it("refreshes the list and selects a successful conversation", async () => {
    const user = userEvent.setup();
    mockServer();
    renderApp();
    await waitForApp();
    await searchForUser(user);

    await user.click(
      screen.getByRole("button", {
        name: "Start conversation with Ankush"
      })
    );

    expect(
      await screen.findByText("Conversation ready with Ankush.")
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Send the first message.")
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(conversationListRequests().length).toBeGreaterThanOrEqual(2)
    );
  });

  it("renders returned conversation details in the recent list", async () => {
    mockServer({ initialConversations: [conversation] });
    renderApp();
    await waitForApp();

    const list = await screen.findByRole("list", {
      name: "Recent conversations"
    });
    expect(within(list).getByText("Ankush")).toBeInTheDocument();
    expect(within(list).getByText("ankush@example.com")).toBeInTheDocument();
    expect(within(list).getByText("PRIVATE")).toBeInTheDocument();
    expect(within(list).getByText("No messages yet.")).toBeInTheDocument();
  });

  it("shows a friendly conversation creation error", async () => {
    const user = userEvent.setup();
    mockServer({ createError: true });
    renderApp();
    await waitForApp();
    await searchForUser(user);

    await user.click(
      screen.getByRole("button", {
        name: "Start conversation with Ankush"
      })
    );

    expect(
      await screen.findByText(
        "Unable to start conversation. Please try again."
      )
    ).toBeInTheDocument();
  });

  it("opens the selected conversation placeholder", async () => {
    const user = userEvent.setup();
    mockServer({ initialConversations: [conversation] });
    renderApp();
    await waitForApp();

    const list = await screen.findByRole("list", {
      name: "Recent conversations"
    });
    await user.click(
      within(list).getByRole("button", { name: /Ankush/i })
    );

    expect(
      await screen.findByLabelText("Message")
    ).toBeInTheDocument();
  });

  it("shows a friendly list error and allows refresh", async () => {
    const user = userEvent.setup();
    mockServer({ listError: true });
    renderApp();
    await waitForApp();

    expect(
      await screen.findByText(
        "Unable to load conversations. Please try again."
      )
    ).toBeInTheDocument();
    const initialRequests = conversationListRequests().length;
    await user.click(
      screen.getByRole("button", { name: "Refresh Conversations" })
    );
    await waitFor(() =>
      expect(conversationListRequests().length).toBeGreaterThan(initialRequests)
    );
  });

  it("returns to the conversation list from the mobile conversation view", async () => {
    const user = userEvent.setup();
    mockServer({ initialConversations: [conversation] });
    renderApp();
    await waitForApp();

    const list = await screen.findByRole("list", {
      name: "Recent conversations"
    });
    await user.click(
      within(list).getByRole("button", { name: /Ankush/i })
    );

    expect(await screen.findByLabelText("Message")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Back to Conversations" })
    );

    expect(screen.queryByLabelText("Message")).not.toBeInTheDocument();
    expect(
      screen.getByRole("complementary", { name: "Conversation navigation" })
    ).toBeInTheDocument();
  });

  it("does not render unsupported advanced message controls", async () => {
    const user = userEvent.setup();
    mockServer({ initialConversations: [conversation] });
    renderApp();
    await waitForApp();

    const list = await screen.findByRole("list", {
      name: "Recent conversations"
    });
    await user.click(
      within(list).getByRole("button", { name: /Ankush/i })
    );

    expect(await screen.findByLabelText("Message")).toBeInTheDocument();
    expect(screen.queryByText(/websocket/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/typing indicator/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/read receipt/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /attach/i })).not.toBeInTheDocument();
  });
});
