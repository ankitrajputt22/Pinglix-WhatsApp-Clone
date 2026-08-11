import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "../../app/App";
import type { MessageResponse } from "./types/message.types";

const authUser = {
  id: 1,
  email: "ankit@example.com",
  displayName: "Ankit",
  profileImageUrl: null,
  accountStatus: "ACTIVE",
  createdAt: "2026-08-08T00:00:00Z"
};

const userProfile = {
  ...authUser,
  about: "Hey there! I am using Pinglix."
};

const otherParticipant = {
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
  otherParticipant,
  lastMessageAt: null,
  createdAt: "2026-08-08T00:00:00Z",
  updatedAt: "2026-08-08T00:00:00Z"
};

const receivedMessage: MessageResponse = {
  id: 50,
  clientMessageId: "3afec5f0-145a-4e12-9b55-57f0cf45d764",
  conversationId: 10,
  sender: {
    id: 2,
    email: "ankush@example.com",
    displayName: "Ankush",
    profileImageUrl: null
  },
  messageType: "TEXT",
  content: "Hello from Ankush",
  status: "SENT",
  createdAt: "2026-08-08T00:01:00Z",
  editedAt: null,
  deletedAt: null
};

const sentMessage: MessageResponse = {
  id: 51,
  clientMessageId: "98e5312d-dd5d-4fb0-abd7-eb3854e6b44d",
  conversationId: 10,
  sender: {
    id: 1,
    email: "ankit@example.com",
    displayName: "Ankit",
    profileImageUrl: null
  },
  messageType: "TEXT",
  content: "Hello from Ankit",
  status: "SENT",
  createdAt: "2026-08-08T00:02:00Z",
  editedAt: null,
  deletedAt: null
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

type MockServerOptions = {
  latestMessages?: MessageResponse[];
  olderMessages?: MessageResponse[];
  hasMore?: boolean;
  sendError?: boolean;
};

function requestDetails(input: RequestInfo | URL, init?: RequestInit) {
  const url = new URL(input instanceof Request ? input.url : input.toString());
  return {
    method: input instanceof Request ? input.method : init?.method ?? "GET",
    path: url.pathname,
    searchParams: url.searchParams
  };
}

function mockServer(options: MockServerOptions = {}) {
  let latestMessages = [...(options.latestMessages ?? [])];

  vi.mocked(fetch).mockImplementation(async (input, init) => {
    const request = requestDetails(input, init);

    if (request.method === "GET" && request.path === "/api/v1/auth/me") {
      return jsonResponse(authUser);
    }
    if (request.method === "GET" && request.path === "/api/v1/users/me") {
      return jsonResponse(userProfile);
    }
    if (request.method === "GET" && request.path === "/api/v1/conversations") {
      return jsonResponse([conversation]);
    }
    if (
      request.method === "GET" &&
      request.path === `/api/v1/conversations/${conversation.id}`
    ) {
      return jsonResponse(conversation);
    }
    if (
      request.method === "GET" &&
      request.path === `/api/v1/conversations/${conversation.id}/messages`
    ) {
      const before = request.searchParams.get("beforeMessageId");
      if (before !== null) {
        return jsonResponse({
          items: options.olderMessages ?? [],
          nextBeforeMessageId: null,
          hasMore: false
        });
      }
      return jsonResponse({
        items: latestMessages,
        nextBeforeMessageId: options.hasMore ? 50 : null,
        hasMore: options.hasMore ?? false
      });
    }
    if (
      request.method === "POST" &&
      request.path === `/api/v1/conversations/${conversation.id}/messages`
    ) {
      if (options.sendError) {
        return jsonResponse({ error: "INTERNAL_SERVER_ERROR" }, 500);
      }
      const body = JSON.parse(String(init?.body)) as {
        clientMessageId: string;
        content: string;
      };
      const created = {
        ...sentMessage,
        clientMessageId: body.clientMessageId,
        content: body.content.trim()
      };
      latestMessages = [...latestMessages, created];
      return jsonResponse(created);
    }
    if (request.method === "POST" && request.path === "/api/v1/auth/logout") {
      return jsonResponse({ message: "Logged out successfully" });
    }

    return jsonResponse({ error: "NOT_FOUND" }, 404);
  });
}

function renderApp() {
  window.history.replaceState({}, "", "/app");
  return render(<App />);
}

async function openConversation(user: ReturnType<typeof userEvent.setup>) {
  renderApp();
  await screen.findByRole("heading", { name: "Welcome to Pinglix" });
  const list = await screen.findByRole("list", {
    name: "Recent conversations"
  });
  await user.click(within(list).getByRole("button", { name: /Ankush/i }));
  return screen.findByLabelText("Message");
}

function requestCount(method: string, path: string) {
  return vi.mocked(fetch).mock.calls.filter(([input, init]) => {
    const request = requestDetails(input, init);
    return request.method === method && request.path === path;
  }).length;
}

describe("message module", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    window.history.replaceState({}, "", "/");
  });

  it("renders empty message history and a disabled composer", async () => {
    const user = userEvent.setup();
    mockServer();
    const input = await openConversation(user);

    expect(await screen.findByText("Send the first message.")).toBeInTheDocument();
    expect(input).toHaveAttribute("placeholder", "Type a message");
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();

    await user.type(input, "   ");
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
  });

  it("sends a valid message, clears the draft, and refreshes conversations", async () => {
    const user = userEvent.setup();
    mockServer();
    const input = await openConversation(user);
    const conversationRequestsBefore = requestCount(
      "GET",
      "/api/v1/conversations"
    );

    await user.type(input, "  Hello from the UI  ");
    await user.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => expect(input).toHaveValue(""));
    expect(await screen.findByText("Message sent.")).toBeInTheDocument();

    const sendCall = vi.mocked(fetch).mock.calls.find(([requestInput, init]) => {
      const request = requestDetails(requestInput, init);
      return (
        request.method === "POST" &&
        request.path === `/api/v1/conversations/${conversation.id}/messages`
      );
    });
    const body = JSON.parse(String(sendCall?.[1]?.body)) as {
      clientMessageId: string;
      content: string;
    };
    expect(body.clientMessageId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
    expect(body.content).toBe("  Hello from the UI  ");
    await waitFor(() =>
      expect(requestCount("GET", "/api/v1/conversations"))
        .toBeGreaterThan(conversationRequestsBefore)
    );
  });

  it("sends a message with Enter", async () => {
    const user = userEvent.setup();
    mockServer();
    const input = await openConversation(user);

    await user.type(input, "Send from keyboard{Enter}");

    await waitFor(() => expect(input).toHaveValue(""));
    expect(await screen.findByText("Message sent.")).toBeInTheDocument();
    expect(
      await screen.findByText("Send from keyboard")
    ).toBeInTheDocument();
  });

  it("keeps the draft when sending fails", async () => {
    const user = userEvent.setup();
    mockServer({ sendError: true });
    const input = await openConversation(user);

    await user.type(input, "Keep this message");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(
      await screen.findByText("Unable to send message. Please try again.")
    ).toBeInTheDocument();
    expect(input).toHaveValue("Keep this message");
  });

  it("renders sent and received messages with safe sender labels", async () => {
    const user = userEvent.setup();
    mockServer({ latestMessages: [receivedMessage, sentMessage] });
    await openConversation(user);

    const history = await screen.findByRole("list", {
      name: "Message history"
    });
    expect(within(history).getByText("Hello from Ankush")).toBeInTheDocument();
    expect(within(history).getByText("Hello from Ankit")).toBeInTheDocument();
    expect(within(history).getByText("Ankush")).toBeInTheDocument();
    expect(within(history).getByText("You")).toBeInTheDocument();
  });

  it("loads older messages with the oldest cursor", async () => {
    const user = userEvent.setup();
    const olderMessage = {
      ...receivedMessage,
      id: 40,
      clientMessageId: "f0792299-3b45-452b-9d10-b8092c39a222",
      content: "An older message"
    };
    mockServer({
      latestMessages: [receivedMessage],
      olderMessages: [olderMessage],
      hasMore: true
    });
    await openConversation(user);

    await user.click(
      await screen.findByRole("button", { name: "Load Older Messages" })
    );
    expect(await screen.findByText("An older message")).toBeInTheDocument();

    const olderRequest = vi.mocked(fetch).mock.calls.find(([input, init]) => {
      const request = requestDetails(input, init);
      return (
        request.method === "GET" &&
        request.path === `/api/v1/conversations/${conversation.id}/messages` &&
        request.searchParams.get("beforeMessageId") === "50"
      );
    });
    expect(olderRequest).toBeDefined();
  });

  it("does not add unsupported advanced message controls", async () => {
    const user = userEvent.setup();
    mockServer({ latestMessages: [receivedMessage] });
    await openConversation(user);

    expect(screen.queryByText(/websocket/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/typing/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/read receipt/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/delivered/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /attach/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /voice/i })).not.toBeInTheDocument();
  });
});
