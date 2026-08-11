import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

import { stompClient } from "../lib/stomp-client";

beforeEach(() => {
  vi.spyOn(stompClient, "connect").mockImplementation(() => undefined);
  vi.spyOn(stompClient, "scheduleDisconnect").mockImplementation(
    () => undefined
  );
  vi.spyOn(stompClient, "disconnect").mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
