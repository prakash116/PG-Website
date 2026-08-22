// In development, `localhost` keeps the site and the API on one site so the
// browser accepts the session cookie; ports do not affect SameSite.
//
// The production default is a real URL on purpose. NEXT_PUBLIC_* is inlined at
// build time, so a build that forgets the variable would otherwise ship
// `http://localhost:5000` to every visitor — pointing their browser at their
// own machine, and blocked as mixed content from an https page anyway.
const DEFAULT_API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://pg-backend-pozw.onrender.com/api"
    : "http://localhost:5000/api";

const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

export const API_BASE_URL = (
  configuredApiBaseUrl || DEFAULT_API_BASE_URL
).replace(/\/+$/, "");

interface ApiErrorPayload {
  message?: string | string[];
}

function getApiErrorMessage(payload: unknown, status: number): string {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = (payload as ApiErrorPayload).message;

    if (Array.isArray(message) && message.length > 0) {
      return message[0];
    }

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return `Request failed with status ${status}.`;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly payload: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  // FormData is left alone: the browser has to set its own multipart boundary.
  if (
    init.body &&
    !headers.has("Content-Type") &&
    !(init.body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json");
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    ...init,
    headers,
    // Sends and receives the HttpOnly session cookie.
    credentials: "include",
  });

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      getApiErrorMessage(payload, response.status),
      response.status,
      payload
    );
  }

  return payload as T;
}
