const DEFAULT_API_BASE_URL = "http://localhost:8081";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL
).replace(/\/+$/, "");

type ApiErrorKind = "HTTP" | "NETWORK" | "RESPONSE";

export class ApiClientError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(message: string, kind: ApiErrorKind, status?: number) {
    super(message);
    this.name = "ApiClientError";
    this.kind = kind;
    this.status = status;
  }
}

export function createApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

function connectionFailureMessage() {
  try {
    const backendUrl = new URL(API_BASE_URL);

    if (backendUrl.port) {
      return `Backend connection failed. Please make sure the backend is running on port ${backendUrl.port}.`;
    }
  } catch {
    // The configuration error is reported with a safe generic message below.
  }

  return "Backend connection failed. Please check the configured backend URL.";
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(createApiUrl(path), {
      ...init,
      headers: {
        Accept: "application/json",
        ...init.headers
      }
    });
  } catch {
    throw new ApiClientError(connectionFailureMessage(), "NETWORK");
  }

  if (!response.ok) {
    throw new ApiClientError(
      "The backend returned an error. Please try again.",
      "HTTP",
      response.status
    );
  }

  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    throw new ApiClientError("Unexpected backend response.", "RESPONSE");
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiClientError("Unexpected backend response.", "RESPONSE");
  }
}

export const apiClient = {
  get<T>(path: string, signal?: AbortSignal) {
    return request<T>(path, {
      method: "GET",
      signal
    });
  }
};
