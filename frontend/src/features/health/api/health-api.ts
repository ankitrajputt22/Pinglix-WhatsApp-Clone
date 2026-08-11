import { ApiClientError, apiClient } from "../../../lib/api-client";
import type { HealthResponse } from "../types/health.types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unexpectedResponse(): never {
  throw new ApiClientError("Unexpected backend response.", "RESPONSE");
}

export async function getHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const response = await apiClient.get<unknown>("/api/v1/health", signal);

  if (!isRecord(response)) {
    unexpectedResponse();
  }

  if (typeof response.status !== "string" || !response.status.trim()) {
    unexpectedResponse();
  }

  if (
    response.app !== undefined &&
    typeof response.app !== "string"
  ) {
    unexpectedResponse();
  }

  if (
    response.application !== undefined &&
    typeof response.application !== "string"
  ) {
    unexpectedResponse();
  }

  if (response.message !== undefined && typeof response.message !== "string") {
    unexpectedResponse();
  }

  if (
    response.timestamp !== undefined &&
    typeof response.timestamp !== "string"
  ) {
    unexpectedResponse();
  }

  return {
    status: response.status,
    app: response.app,
    application: response.application,
    message: response.message,
    timestamp: response.timestamp
  };
}
