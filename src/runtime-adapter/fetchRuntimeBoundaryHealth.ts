import {
    RuntimeAdapterError,
} from "./runtimeAdapterErrors";

import type {
    RuntimeBoundaryHealthResponse,
    RuntimeBoundaryHealthResult,
} from "./runtimeBoundaryTypes";

const RUNTIME_BASE_URL =
  getRuntimeBaseUrl();

const REQUEST_TIMEOUT_MS = 5000;

export async function fetchRuntimeBoundaryHealth():
  Promise<RuntimeBoundaryHealthResult> {
  const controller =
    new AbortController();

  const timeoutId =
    window.setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

  try {
    const response =
      await fetch(
        `${RUNTIME_BASE_URL}/runtime/boundary/health`,
        {
          signal:
            controller.signal,
        }
      );

    if (!response.ok) {
      throw new RuntimeAdapterError(
        "RUNTIME_SERVER_ERROR",
        `Runtime boundary health returned status ${response.status}`,
        response.status >= 500
      );
    }

    const data =
      (await response.json()) as RuntimeBoundaryHealthResponse;

    if (!data.ok || !data.result) {
      throw new RuntimeAdapterError(
        "RUNTIME_INVALID_RESPONSE",
        data.error?.message ??
          "Runtime boundary health response is invalid.",
        true
      );
    }

    return data.result;
  } catch (error) {
    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      throw new RuntimeAdapterError(
        "RUNTIME_TIMEOUT",
        "Runtime boundary health request timed out.",
        true
      );
    }

    if (
      error instanceof RuntimeAdapterError
    ) {
      throw error;
    }

    throw new RuntimeAdapterError(
      "RUNTIME_NETWORK_ERROR",
      error instanceof Error
        ? error.message
        : "Runtime boundary health request failed.",
      true
    );
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function getRuntimeBaseUrl(): string {
  const value =
    import.meta.env.VITE_RUNTIME_API_URL;

  if (
    typeof value === "string" &&
    value.trim().length > 0
  ) {
    return value;
  }

  return "http://localhost:4000";
}