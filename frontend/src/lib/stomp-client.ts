import {
  Client,
  ReconnectionTimeMode,
  type StompSubscription
} from "@stomp/stompjs";

import type { RealtimeConnectionStatus } from "../features/realtime/types/realtime.types";

const DEFAULT_WS_URL = "ws://localhost:8081/ws";
const WS_URL = import.meta.env.VITE_WS_URL?.trim() || DEFAULT_WS_URL;
const RECONNECT_DELAY_MS = 1_000;
const MAX_RECONNECT_DELAY_MS = 10_000;

type StatusListener = (status: RealtimeConnectionStatus) => void;
type MessageListener = (body: string) => void;

export class StompClientManager {
  private client: Client | null = null;
  private status: RealtimeConnectionStatus = "idle";
  private readonly listeners = new Set<StatusListener>();
  private disconnectTimer: ReturnType<typeof setTimeout> | null = null;

  getStatus = () => this.status;

  subscribeToStatus = (listener: StatusListener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  connect = () => {
    if (this.disconnectTimer !== null) {
      clearTimeout(this.disconnectTimer);
      this.disconnectTimer = null;
    }
    if (this.client?.active) {
      return;
    }

    this.updateStatus(
      this.status === "disconnected" || this.status === "error"
        ? "reconnecting"
        : "connecting"
    );

    const client = new Client({
      brokerURL: WS_URL,
      reconnectDelay: RECONNECT_DELAY_MS,
      reconnectTimeMode: ReconnectionTimeMode.EXPONENTIAL,
      maxReconnectDelay: MAX_RECONNECT_DELAY_MS,
      connectionTimeout: 8_000,
      heartbeatIncoming: 10_000,
      heartbeatOutgoing: 10_000,
      debug: () => undefined
    });

    client.onConnect = () => this.updateStatus("connected");
    client.onWebSocketClose = () => {
      this.updateStatus(client.active ? "reconnecting" : "disconnected");
    };
    client.onWebSocketError = () => this.updateStatus("error");
    client.onStompError = () => this.updateStatus("error");

    this.client = client;
    client.activate();
  };

  scheduleDisconnect = () => {
    if (this.disconnectTimer !== null) {
      clearTimeout(this.disconnectTimer);
    }
    this.disconnectTimer = setTimeout(() => {
      this.disconnectTimer = null;
      void this.disconnect();
    }, 0);
  };

  disconnect = async () => {
    if (this.disconnectTimer !== null) {
      clearTimeout(this.disconnectTimer);
      this.disconnectTimer = null;
    }

    const client = this.client;
    this.client = null;
    if (client?.active) {
      await client.deactivate();
    }
    this.updateStatus("disconnected");
  };

  subscribe(destination: string, listener: MessageListener) {
    if (!this.client?.connected) {
      return () => undefined;
    }

    const subscription: StompSubscription = this.client.subscribe(
      destination,
      (message) => listener(message.body)
    );
    return () => subscription.unsubscribe();
  }

  private updateStatus(nextStatus: RealtimeConnectionStatus) {
    if (this.status === nextStatus) {
      return;
    }
    this.status = nextStatus;
    this.listeners.forEach((listener) => listener(nextStatus));
  }
}

export const stompClient = new StompClientManager();
