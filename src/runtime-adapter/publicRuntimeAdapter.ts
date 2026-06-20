import type {
  LandingReflectionInput,
  RuntimeReflectionResponse,
  RuntimeReflectionResult,
} from "./runtimeAdapterTypes";

import {
  RuntimeAdapterError,
} from "./runtimeAdapterErrors";

const RUNTIME_BASE_URL =
  import.meta.env.VITE_RUNTIME_API_URL ??
  "http://localhost:4000";

const REQUEST_TIMEOUT_MS = Number(
  import.meta.env
    .VITE_RUNTIME_REQUEST_TIMEOUT_MS ?? 8000
);

const RETRY_COUNT = Number(
  import.meta.env
    .VITE_RUNTIME_RETRY_COUNT ?? 1
);

export async function submitReflectionToRuntime(
  content: string
): Promise<RuntimeReflectionResult> {
  const input: LandingReflectionInput = {
    content,
    createdAt: new Date().toISOString(),
    source: "landing",
  };

  return runWithRetry(
    () => submitReflectionOnce(input),
    RETRY_COUNT
  );
}

async function submitReflectionOnce(
  input: LandingReflectionInput
): Promise<RuntimeReflectionResult> {
  const controller =
    new AbortController();

  const timeoutId =
    window.setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${RUNTIME_BASE_URL}/runtime/reflection`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(input),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      throw new RuntimeAdapterError(
        "RUNTIME_SERVER_ERROR",
        `Runtime server responded with status ${response.status}`,
        response.status >= 500
      );
    }

    const data =
      (await response.json()) as RuntimeReflectionResponse;

    if (!data.ok) {
      throw new RuntimeAdapterError(
        normalizeRuntimeErrorCode(
          data.error?.code
        ),
        data.error?.message ??
          "Runtime returned an error response.",
        data.error?.recoverable ?? true
      );
    }

    validateRuntimeReflectionResult(
      data.result
    );

    return data.result;
  } catch (error) {
    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      throw new RuntimeAdapterError(
        "RUNTIME_TIMEOUT",
        "Runtime request timed out.",
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
        : "Unknown runtime network error.",
      true
    );
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function runWithRetry<T>(
  task: () => Promise<T>,
  retries: number
): Promise<T> {
  let lastError: unknown;

  for (
    let attempt = 0;
    attempt <= retries;
    attempt += 1
  ) {
    try {
      return await task();
    } catch (error) {
      lastError = error;

      if (
        error instanceof RuntimeAdapterError &&
        !error.recoverable
      ) {
        break;
      }

      if (attempt < retries) {
        await delay(
          400 * (attempt + 1)
        );
      }
    }
  }

  throw lastError;
}

function delay(
  milliseconds: number
): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(
      resolve,
      milliseconds
    );
  });
}

function validateRuntimeReflectionResult(
  value: unknown
): asserts value is RuntimeReflectionResult {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    throw new RuntimeAdapterError(
      "RUNTIME_INVALID_RESPONSE",
      "Runtime response is not a valid object.",
      false
    );
  }

  const result =
    value as Partial<RuntimeReflectionResult>;

  if (
    result.contractVersion !== "v1"
  ) {
    throw new RuntimeAdapterError(
      "RUNTIME_INVALID_RESPONSE",
      "Runtime contract version mismatch.",
      false
    );
  }

  if (
    typeof result.reflectionId !==
    "string"
  ) {
    throw new RuntimeAdapterError(
      "RUNTIME_INVALID_RESPONSE",
      "Missing reflectionId.",
      false
    );
  }

  if (
    typeof result.summary?.text !==
      "string" ||
    typeof result.summary
      ?.confidence !== "number"
  ) {
    throw new RuntimeAdapterError(
      "RUNTIME_INVALID_RESPONSE",
      "Invalid summary structure.",
      false
    );
  }

  if (
    typeof result.pacing?.message !==
      "string" ||
    ![
      "low",
      "medium",
      "high",
    ].includes(
      result.pacing?.level ?? ""
    )
  ) {
    throw new RuntimeAdapterError(
      "RUNTIME_INVALID_RESPONSE",
      "Invalid pacing structure.",
      false
    );
  }

  if (
    typeof result.nextQuestion
      ?.question !== "string"
  ) {
    throw new RuntimeAdapterError(
      "RUNTIME_INVALID_RESPONSE",
      "Invalid nextQuestion structure.",
      false
    );
  }

  if (
    typeof result.continuitySignal
      ?.message !== "string" ||
    typeof result.continuitySignal
      ?.strength !== "number"
  ) {
    throw new RuntimeAdapterError(
      "RUNTIME_INVALID_RESPONSE",
      "Invalid continuitySignal structure.",
      false
    );
  }
}

function normalizeRuntimeErrorCode(
  code: string | undefined
): "RUNTIME_TIMEOUT" |
  "RUNTIME_NETWORK_ERROR" |
  "RUNTIME_INVALID_RESPONSE" |
  "RUNTIME_SERVER_ERROR" |
  "RUNTIME_UNKNOWN_ERROR" {
  if (
    code === "RUNTIME_TIMEOUT" ||
    code === "RUNTIME_NETWORK_ERROR" ||
    code === "RUNTIME_INVALID_RESPONSE" ||
    code === "RUNTIME_SERVER_ERROR" ||
    code === "RUNTIME_UNKNOWN_ERROR"
  ) {
    return code;
  }

  return "RUNTIME_SERVER_ERROR";
}