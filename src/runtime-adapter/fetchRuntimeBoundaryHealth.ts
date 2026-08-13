import {
  RuntimeAdapterError,
} from "./runtimeAdapterErrors";

import type {
  RuntimeBoundaryHealthResult,
} from "./runtimeBoundaryTypes";

const RUNTIME_BASE_URL =
  getRuntimeBaseUrl();

const REQUEST_TIMEOUT_MS = 5000;

type PublicRuntimeHealthResponse = {
  ok: boolean;
  meta?: {
    generatedAt?: string;
  };
  result?: {
    service?: string;
    status?: string;
  };
  error?: {
    code?: string;
    message?: string;
  };
};

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
        `${RUNTIME_BASE_URL}/health`,
        {
          signal:
            controller.signal,
        }
      );

    if (!response.ok) {
      throw new RuntimeAdapterError(
        "RUNTIME_SERVER_ERROR",
        `Runtime health returned status ${response.status}`,
        response.status >= 500
      );
    }

    const data =
      (await response.json()) as
        PublicRuntimeHealthResponse;

    if (
      !data.ok ||
      data.result?.status !==
        "private-runtime-ready"
    ) {
      throw new RuntimeAdapterError(
        "RUNTIME_INVALID_RESPONSE",
        data.error?.message ??
          "Runtime health response is invalid.",
        true
      );
    }

    const generatedAt =
      typeof data.meta?.generatedAt ===
        "string" &&
      data.meta.generatedAt.trim().length > 0
        ? data.meta.generatedAt
        : new Date().toISOString();

    return {
      status:
        "healthy",

      checks: [
        {
          name:
            "runtime-service",

          status:
            "pass",

          message:
            "Runtime service is ready.",

          details: {
            service:
              data.result.service ??
              "innermirror-runtime-private",

            runtimeStatus:
              data.result.status,
          },
        },
      ],

      generatedAt,
    };
  } catch (error) {
    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      throw new RuntimeAdapterError(
        "RUNTIME_TIMEOUT",
        "Runtime health request timed out.",
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
        : "Runtime health request failed.",
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
    return value.trim();
  }

  return "http://localhost:4000";
}