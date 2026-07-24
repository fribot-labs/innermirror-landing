/* ------------------------------------------------------------------ */
/* Date */
/* ------------------------------------------------------------------ */

/**
 * ISO-8601 UTC 문자열을 반환합니다.
 *
 * 잘못된 날짜 문자열이 전달되면 현재 시각을 사용합니다.
 */
export function normalizeGeneratedAt(
  value?: string
): string {
  if (
    typeof value === "string" &&
    !Number.isNaN(Date.parse(value))
  ) {
    return new Date(value).toISOString();
  }

  return new Date().toISOString();
}

/* ------------------------------------------------------------------ */
/* Number */
/* ------------------------------------------------------------------ */

/**
 * 유한한 숫자가 아니면 fallback을 반환합니다.
 */
export function normalizeFiniteNumber(
  value: number | null | undefined,
  fallback: number
): number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  )
    ? value
    : fallback;
}

/**
 * value를 minimum~maximum 범위로 제한합니다.
 */
export function clampNumber(
  value: number,
  minimum: number,
  maximum: number
): number {
  return Math.min(
    maximum,
    Math.max(minimum, value)
  );
}

/**
 * value를 0~1 범위로 제한합니다.
 */
export function clampUnit(
  value: number
): number {
  return clampNumber(
    normalizeFiniteNumber(value, 0),
    0,
    1
  );
}

/**
 * 정수를 minimum~maximum 범위로 제한합니다.
 */
export function clampInteger(
  value: number | undefined,
  fallback: number,
  minimum: number,
  maximum: number
): number {
  const normalized =
    normalizeFiniteNumber(
      value,
      fallback
    );

  return Math.round(
    clampNumber(
      normalized,
      minimum,
      maximum
    )
  );
}

/**
 * 0 이상의 정수만 허용합니다.
 */
export function normalizeNonNegativeInteger(
  value: number
): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(value)
  );
}

/**
 * 0 이상의 실수만 허용합니다.
 */
export function normalizeNonNegativeNumber(
  value: number | undefined,
  fallback: number
): number {
  return Math.max(
    0,
    normalizeFiniteNumber(
      value,
      fallback
    )
  );
}

/**
 * 최소 1 이상의 정수를 반환합니다.
 */
export function normalizePositiveInteger(
  value: number | undefined,
  fallback: number
): number {
  return Math.max(
    1,
    Math.floor(
      normalizeFiniteNumber(
        value,
        fallback
      )
    )
  );
}

/**
 * 소수점 자릿수를 반올림합니다.
 */
export function roundNumber(
  value: number,
  decimalPlaces: number
): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const safeDecimalPlaces =
    clampInteger(
      decimalPlaces,
      4,
      0,
      8
    );

  const multiplier =
    10 ** safeDecimalPlaces;

  return (
    Math.round(
      value * multiplier
    ) / multiplier
  );
}

/* ------------------------------------------------------------------ */
/* Text */
/* ------------------------------------------------------------------ */

/**
 * 공백 제거 후 빈 문자열이면 null을 반환합니다.
 */
export function normalizeOptionalText(
  value: string | null | undefined
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized =
    value
      .trim()
      .replace(/\s+/g, " ");

  return normalized.length > 0
    ? normalized
    : null;
}

/**
 * 비교용 문자열입니다.
 */
export function normalizeComparableText(
  value: string | null | undefined
): string {
  return (
    normalizeOptionalText(value) ??
    ""
  ).toLowerCase();
}

/**
 * 설명 문자열입니다.
 */
export function normalizeDescription(
  value: string
): string {
  return (
    normalizeOptionalText(value) ??
    "No description is available."
  );
}

/**
 * Candidate ID를 정규화합니다.
 *
 * 기존 ID는 유지하고 trim만 수행합니다.
 */
export function normalizeCandidateId(
  value: string
): string {
  const normalized =
    value.trim();

  return normalized.length > 0
    ? normalized
    : "runtime-recommendation-candidate";
}

/* ------------------------------------------------------------------ */
/* Record */
/* ------------------------------------------------------------------ */

/**
 * 숫자 Record에서 유한한 숫자만 복사합니다.
 */
export function normalizeFiniteRecord<
  T extends Record<string, number>,
>(
  value: Partial<T> | undefined
): Partial<T> {
  if (value === undefined) {
    return {};
  }

  const result: Partial<T> = {};

  for (const [
    key,
    candidate,
  ] of Object.entries(value)) {
    if (
      typeof candidate ===
        "number" &&
      Number.isFinite(candidate)
    ) {
      (
        result as Record<
          string,
          number
        >
      )[key] = candidate;
    }
  }

  return result;
}

/* ------------------------------------------------------------------ */
/* Statistics */
/* ------------------------------------------------------------------ */

/**
 * 평균값을 계산합니다.
 */
export function calculateAverage(
  values: number[]
): number | null {
  if (values.length === 0) {
    return null;
  }

  return (
    values.reduce(
      (sum, value) =>
        sum + value,
      0
    ) / values.length
  );
}

/**
 * 최소값입니다.
 */
export function calculateMinimum(
  values: number[]
): number | null {
  return values.length > 0
    ? Math.min(...values)
    : null;
}

/**
 * 최대값입니다.
 */
export function calculateMaximum(
  values: number[]
): number | null {
  return values.length > 0
    ? Math.max(...values)
    : null;
}

/**
 * 중복을 제거합니다.
 */
export function uniqueStrings(
  values: string[]
): string[] {
  return Array.from(
    new Set(
      values.filter(
        (value) =>
          value.trim().length > 0
      )
    )
  );
}