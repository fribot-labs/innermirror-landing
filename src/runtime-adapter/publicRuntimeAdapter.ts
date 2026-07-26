import type {
  LandingReflectionInput,
  RuntimeReflectionResponse,
  RuntimeReflectionResult,
  RuntimeReflectionTransportResult,
} from "./runtimeAdapterTypes";

import {
  normalizeRuntimeReflectionResult,
} from "./normalizeRuntimeReflectionResult";

import {
  RuntimeAdapterError,
} from "./runtimeAdapterErrors";

/* ------------------------------------------------------------------ */
/* Runtime Configuration */
/* ------------------------------------------------------------------ */

const RUNTIME_BASE_URL =
  getRuntimeBaseUrl();

const REQUEST_TIMEOUT_MS =
  getRuntimeNumberEnv(
    "VITE_RUNTIME_REQUEST_TIMEOUT_MS",
    90000
  );

const RETRY_COUNT =
  getRuntimeNumberEnv(
    "VITE_RUNTIME_RETRY_COUNT",
    0
  );

/* ------------------------------------------------------------------ */
/* Public API */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Runtime Request */
/* ------------------------------------------------------------------ */

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

        body:
          JSON.stringify(input),

        signal:
          controller.signal,
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
      (await response.json()) as
        RuntimeReflectionResponse;

    if (!data.ok) {
      throw new RuntimeAdapterError(
        normalizeRuntimeErrorCode(
          data.error?.code
        ),

        data.error?.message ??
          "Runtime returned an error response.",

        data.error?.recoverable ??
          true
      );
    }

    validateRuntimeReflectionResult(
      data.result
    );

    return normalizeRuntimeReflectionResult(
      data.result
    );
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
    window.clearTimeout(
      timeoutId
    );
  }
}

/* ------------------------------------------------------------------ */
/* Retry */
/* ------------------------------------------------------------------ */

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

      if (
        attempt < retries
      ) {
        await delay(
          400 * (attempt + 1)
        );
      }
    }
  }

  if (
    lastError instanceof Error
  ) {
    throw lastError;
  }

  throw new RuntimeAdapterError(
    "RUNTIME_UNKNOWN_ERROR",
    "Runtime request failed without a recognized error.",
    true
  );
}

function delay(
  milliseconds: number
): Promise<void> {
  return new Promise(
    (resolve) => {
      window.setTimeout(
        resolve,
        milliseconds
      );
    }
  );
}

/* ------------------------------------------------------------------ */
/* Runtime Response Validation */
/* ------------------------------------------------------------------ */

/**
 * Private Runtime에서 수신한 원시 Transport Result를 검증합니다.
 *
 * recommendationIntegration은 이전 Runtime 계약과의 호환성을 위해
 * 생략될 수 있습니다.
 *
 * 허용 상태:
 *
 * - undefined
 * - null
 * - 최소 Integration Result 구조를 가진 object
 */
function validateRuntimeReflectionResult(
  value: unknown
): asserts value is RuntimeReflectionTransportResult {
  if (
    !isRecord(value)
  ) {
    throwInvalidRuntimeResponse(
      "Runtime response is not a valid object."
    );
  }

  const result =
    value as Partial<
      RuntimeReflectionTransportResult
    >;

  if (
    result.contractVersion !== "v1"
  ) {
    throwInvalidRuntimeResponse(
      "Runtime contract version mismatch."
    );
  }

  if (
    typeof result.reflectionId !==
      "string" ||
    result.reflectionId
      .trim()
      .length === 0
  ) {
    throwInvalidRuntimeResponse(
      "Missing reflectionId."
    );
  }

  validateRuntimeSummary(
    result.summary
  );

  validateRuntimePacing(
    result.pacing
  );

  validateRuntimeNextQuestion(
    result.nextQuestion
  );

  validateRuntimeContinuitySignal(
    result.continuitySignal
  );

  validateRecommendationIntegration(
    result.recommendationIntegration
  );
}

function validateRuntimeSummary(
  value:
    RuntimeReflectionTransportResult[
      "summary"
    ] | undefined
): void {
  if (
    !isRecord(value) ||
    typeof value.text !== "string" ||
    !isFiniteNumber(
      value.confidence
    )
  ) {
    throwInvalidRuntimeResponse(
      "Invalid summary structure."
    );
  }
}

function validateRuntimePacing(
  value:
    RuntimeReflectionTransportResult[
      "pacing"
    ] | undefined
): void {
  if (
    !isRecord(value) ||
    typeof value.message !== "string" ||
    !isRuntimePacingLevel(
      value.level
    )
  ) {
    throwInvalidRuntimeResponse(
      "Invalid pacing structure."
    );
  }
}

function validateRuntimeNextQuestion(
  value:
    RuntimeReflectionTransportResult[
      "nextQuestion"
    ] | undefined
): void {
  if (
    !isRecord(value) ||
    typeof value.question !== "string" ||
    typeof value.reason !== "string"
  ) {
    throwInvalidRuntimeResponse(
      "Invalid nextQuestion structure."
    );
  }
}

function validateRuntimeContinuitySignal(
  value:
    RuntimeReflectionTransportResult[
      "continuitySignal"
    ] | undefined
): void {
  if (
    !isRecord(value) ||
    typeof value.message !== "string" ||
    !isFiniteNumber(
      value.strength
    ) ||
    !isRuntimeContinuityStatus(
      value.status
    )
  ) {
    throwInvalidRuntimeResponse(
      "Invalid continuitySignal structure."
    );
  }
}

/**
 * Recommendation Integration의 전체 내부 계약을 Adapter에서
 * 중복 검증하지 않습니다.
 *
 * PR-RI03에서는 다음 경계만 확인합니다.
 *
 * - 값이 없거나 null일 수 있음
 * - non-null 값은 object여야 함
 * - executiveSummaryResult가 object여야 함
 * - diagnostics가 object여야 함
 */
function validateRecommendationIntegration(
  value:
    RuntimeReflectionTransportResult[
      "recommendationIntegration"
    ]
): void {
  if (
    value === undefined ||
    value === null
  ) {
    return;
  }

  if (
    !isRecord(value) ||
    !isRecord(
      value.executiveSummaryResult
    ) ||
    !isRecord(
      value.diagnostics
    )
  ) {
    throwInvalidRuntimeResponse(
      "Invalid recommendationIntegration structure."
    );
  }
}

/* ------------------------------------------------------------------ */
/* Primitive Validation Helpers */
/* ------------------------------------------------------------------ */

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isFiniteNumber(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

function isRuntimePacingLevel(
  value: unknown
): value is
  RuntimeReflectionTransportResult[
    "pacing"
  ]["level"] {
  return (
    value === "low" ||
    value === "medium" ||
    value === "high"
  );
}

function isRuntimeContinuityStatus(
  value: unknown
): value is
  RuntimeReflectionTransportResult[
    "continuitySignal"
  ]["status"] {
  return (
    value === "new" ||
    value === "weak" ||
    value === "forming" ||
    value === "strong"
  );
}

function throwInvalidRuntimeResponse(
  message: string
): never {
  throw new RuntimeAdapterError(
    "RUNTIME_INVALID_RESPONSE",
    message,
    false
  );
}

/* ------------------------------------------------------------------ */
/* Runtime Error Normalization */
/* ------------------------------------------------------------------ */

function normalizeRuntimeErrorCode(
  code: string | undefined
):
  | "RUNTIME_TIMEOUT"
  | "RUNTIME_NETWORK_ERROR"
  | "RUNTIME_INVALID_RESPONSE"
  | "RUNTIME_SERVER_ERROR"
  | "RUNTIME_UNKNOWN_ERROR" {
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

/* ------------------------------------------------------------------ */
/* Runtime Environment */
/* ------------------------------------------------------------------ */

function getRuntimeBaseUrl(): string {
  const value =
    import.meta.env
      .VITE_RUNTIME_API_URL;

  if (
    typeof value === "string" &&
    value.trim().length > 0
  ) {
    return value.trim();
  }

  return "http://localhost:4000";
}

function getRuntimeNumberEnv(
  key: string,
  fallback: number
): number {
  const value =
    import.meta.env[key];

  const parsed =
    Number(value);

  if (
    Number.isFinite(parsed) &&
    parsed >= 0
  ) {
    return parsed;
  }

  return fallback;
}