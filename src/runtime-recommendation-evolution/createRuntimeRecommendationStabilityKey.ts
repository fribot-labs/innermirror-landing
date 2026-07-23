import type {
    RuntimeNextAction,
} from "../runtime-next-action/runtimeNextActionTypes";

/* ------------------------------------------------------------------ */
/* Public Builder */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Stability에서 사용하는
 * Stable Key를 생성합니다.
 *
 * 목적:
 *
 * Recommendation 표현(title, description)이 아니라
 * Recommendation Identity를 비교하기 위함입니다.
 *
 * 이 Key는 Runtime Action History Fingerprint와 다릅니다.
 *
 * History Fingerprint:
 * project 포함
 *
 * Stability Key:
 * Recommendation Identity만 사용
 */
export function createRuntimeRecommendationStabilityKey(
  action:
    RuntimeNextAction
): string {
  return [
    normalizeKeyPart(
      action.kind
    ),

    normalizeKeyPart(
      action.target
    ),

    normalizeKeyPart(
      action.source
    ),
  ].join("::");
}

/* ------------------------------------------------------------------ */
/* Equality */
/* ------------------------------------------------------------------ */

/**
 * 두 Recommendation이 Stability 관점에서
 * 동일 Recommendation인지 비교합니다.
 */
export function areRuntimeRecommendationsEquivalent(
  left:
    RuntimeNextAction | null,
  right:
    RuntimeNextAction | null
): boolean {
  if (
    left === null &&
    right === null
  ) {
    return true;
  }

  if (
    left === null ||
    right === null
  ) {
    return false;
  }

  return (
    createRuntimeRecommendationStabilityKey(
      left
    ) ===
    createRuntimeRecommendationStabilityKey(
      right
    )
  );
}

/* ------------------------------------------------------------------ */
/* Candidate */
/* ------------------------------------------------------------------ */

/**
 * Candidate와 Stable Snapshot의
 * 동일성을 비교합니다.
 */
export function isRuntimeRecommendationKeyEqual(
  left:
    string | null,
  right:
    string | null
): boolean {
  return (
    normalizeNullableKey(
      left
    ) ===
    normalizeNullableKey(
      right
    )
  );
}

/* ------------------------------------------------------------------ */
/* Helpers */
/* ------------------------------------------------------------------ */

function normalizeKeyPart(
  value:
    string | null | undefined
): string {
  if (
    typeof value !== "string"
  ) {
    return "none";
  }

  const normalized =
    value
      .trim()
      .toLowerCase()
      .replace(
        /\s+/g,
        "-"
      )
      .replace(
        /:+/g,
        "-"
      );

  return normalized.length > 0
    ? normalized
    : "none";
}

function normalizeNullableKey(
  value:
    string | null
): string | null {
  if (
    value === null
  ) {
    return null;
  }

  const normalized =
    value.trim();

  return normalized.length > 0
    ? normalized
    : null;
}