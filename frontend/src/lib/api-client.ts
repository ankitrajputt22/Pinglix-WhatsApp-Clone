const DEFAULT_API_BASE_URL = "http://localhost:8081";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL
).replace(/\/+$/, "");

type ApiErrorKind = "HTTP" | "NETWORK" | "RESPONSE";

type ApiErrorBody = {
  error?: unknown;
  message?: unknown;
};

export class ApiClientError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly code?: string;

  constructor(
    message: string,
    kind: ApiErrorKind,
    status?: number,
    code?: string
  ) {
    super(message);
    this.name = "ApiClientError";
    this.kind = kind;
    this.status = status;
    this.code = code;
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
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...init.headers
      }
    });
  } catch {
    throw new ApiClientError(connectionFailureMessage(), "NETWORK");
  }

  if (!response.ok) {
    const errorBody = await readErrorBody(response);
    const safeMessage =
      response.status < 500 && typeof errorBody?.message === "string"
        ? errorBody.message
        : "The backend returned an error. Please try again.";

    throw new ApiClientError(
      safeMessage,
      "HTTP",
      response.status,
      typeof errorBody?.error === "string" ? errorBody.error : undefined
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

async function readErrorBody(response: Response): Promise<ApiErrorBody | null> {
  if (!response.headers.get("content-type")?.includes("application/json")) {
    return null;
  }

  try {
    const body = (await response.json()) as unknown;
    return typeof body === "object" && body !== null
      ? (body as ApiErrorBody)
      : null;
  } catch {
    return null;
  }
}

export const apiClient = {
  get<T>(path: string, signal?: AbortSignal) {
    return request<T>(path, {
      method: "GET",
      signal
    });
  },

  post<T>(path: string, body?: unknown, signal?: AbortSignal) {
    return request<T>(path, {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
      headers:
        body === undefined
          ? undefined
          : {
              "Content-Type": "application/json"
            },
      signal
    });
  },

  patch<T>(path: string, body?: unknown, signal?: AbortSignal) {
    return request<T>(path, {
      method: "PATCH",
      body: body === undefined ? undefined : JSON.stringify(body),
      headers:
        body === undefined
          ? undefined
          : {
              "Content-Type": "application/json"
            },
      signal
    });
  }
};
