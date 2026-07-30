import { apiClient } from "../../../lib/api-client";
import type { HealthResponse } from "../types/health.types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function fetchHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const response = await apiClient.get<unknown>("/api/v1/health", signal);

  if (!isRecord(response)) {
    throw new Error("Unexpected backend response.");
  }

  if (typeof response.status !== "string" || !response.status.trim()) {
    throw new Error("Backend response is missing status.");
  }

  if (
    typeof response.application !== "string" ||
    !response.application.trim()
  ) {
    throw new Error("Backend response is missing application name.");
  }

  if (response.message !== undefined && typeof response.message !== "string") {
    throw new Error("Unexpected backend response.");
  }

  if (
    response.timestamp !== undefined &&
    typeof response.timestamp !== "string"
  ) {
    throw new Error("Unexpected backend response.");
  }

  return {
    status: response.status,
    application: response.application,
    message: response.message,
    timestamp: response.timestamp
  };
}
