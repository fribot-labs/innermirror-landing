import type {
    CompareBaseAndAdaptiveRuntimeRecommendationsResult,
} from "./compareBaseAndAdaptiveRuntimeRecommendations";

import {
    normalizeGeneratedAt,
    uniqueStrings,
} from "./runtimeRecommendationMath";

/* ------------------------------------------------------------------ */
/* Observation Policy */
/* ------------------------------------------------------------------ */

/**
 * Observation 생성 정책입니다.
 *
 * Observation은 Shadow Comparison 결과를
 * 장기 분석 가능한 형태로 변환합니다.
 */
export type RuntimeRecommendationAdaptiveObservationPolicy = {
  /**
   * Observation 생성 시 Warning을 포함할지 결정합니다.
   */
  includeWarnings: boolean;

  /**
   * Observation 생성 시 Diagnostics를 포함할지 결정합니다.
   */
  includeDiagnostics: boolean;
};

export type PartialRuntimeRecommendationAdaptiveObservationPolicy = {
  includeWarnings?: boolean;
  includeDiagnostics?: boolean;
};

export const DEFAULT_RUNTIME_RECOMMENDATION_ADAPTIVE_OBSERVATION_POLICY:
  RuntimeRecommendationAdaptiveObservationPolicy = {
  includeWarnings: true,
  includeDiagnostics: true,
};

/* ------------------------------------------------------------------ */
/* Observation Status */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationAdaptiveObservationStatus =
  | "created"
  | "incomplete"
  | "invalid";

export type RuntimeRecommendationAdaptiveObservationReason =
  | "shadow-comparison-recorded"
  | "missing-base-winner"
  | "missing-adaptive-winner"
  | "missing-both-winners";

/* ------------------------------------------------------------------ */
/* Observation */
/* ------------------------------------------------------------------ */

/**
 * Shadow Comparison을 장기 분석 가능한
 * Observation으로 변환한 구조입니다.
 *
 * Runtime 내부 객체를 저장하지 않고,
 * 분석에 필요한 최소 정보만 보존합니다.
 */
export type RuntimeRecommendationAdaptiveObservation = {
  observationId: string;

  generatedAt: string;

  /**
   * Project / Repository / Session 등을
   * 구분하기 위한 Context Key입니다.
   */
  contextKey: string | null;

  baseCandidateId: string | null;

  adaptiveCandidateId: string | null;

  sameCandidate: boolean;

  winnerChanged: boolean;

  blockingStatusChanged: boolean;

  baseWinnerBaseScore: number | null;

  baseWinnerAdaptiveScore: number | null;

  adaptiveWinnerBaseScore: number | null;

  adaptiveWinnerAdaptiveScore: number | null;

  baseScoreDifference: number | null;

  adaptiveScoreDifference: number | null;

  baseWinnerAdaptiveRank: number | null;

  adaptiveWinnerRank: number | null;

  adaptiveCandidateCount: number;

  status:
    RuntimeRecommendationAdaptiveObservationStatus;

  reason:
    RuntimeRecommendationAdaptiveObservationReason;

  warnings:
    string[];
};

/* ------------------------------------------------------------------ */
/* Diagnostics */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationAdaptiveObservationDiagnostics = {
  generatedAt: string;

  status:
    RuntimeRecommendationAdaptiveObservationStatus;

  reason:
    RuntimeRecommendationAdaptiveObservationReason;

  contextKey:
    string | null;

  warningCount:
    number;

  warnings:
    string[];
};

/* ------------------------------------------------------------------ */
/* Result */
/* ------------------------------------------------------------------ */

export type CreateAdaptiveRecommendationObservationResult = {
  observation:
    RuntimeRecommendationAdaptiveObservation;

  diagnostics:
    RuntimeRecommendationAdaptiveObservationDiagnostics;

  policy:
    RuntimeRecommendationAdaptiveObservationPolicy;
};

/* ------------------------------------------------------------------ */
/* Public Input */
/* ------------------------------------------------------------------ */

export type CreateAdaptiveRecommendationObservationParams = {
  /**
   * PR-046C Shadow Comparison 결과입니다.
   */
  comparison:
    CompareBaseAndAdaptiveRuntimeRecommendationsResult;

  /**
   * 동일한 Runtime Context를 구분하기 위한 Key입니다.
   *
   * 예:
   *
   * projectId
   * repositoryId
   * sessionId
   */
  contextKey?:
    string | null;

  generatedAt?:
    string;

  policy?:
    PartialRuntimeRecommendationAdaptiveObservationPolicy;
};

/* ------------------------------------------------------------------ */
/* Public API */
/* ------------------------------------------------------------------ */

export function createAdaptiveRecommendationObservation({
  comparison,
  contextKey,
  generatedAt,
  policy,
}: CreateAdaptiveRecommendationObservationParams):
  CreateAdaptiveRecommendationObservationResult {

  const normalizedPolicy =
    normalizeRuntimeRecommendationAdaptiveObservationPolicy(
      policy
    );

  return createAdaptiveRecommendationObservationWithPolicy({
    comparison,

    contextKey:
      normalizeAdaptiveRecommendationObservationContextKey(
        contextKey
    ),

    generatedAt:
      normalizeGeneratedAt(
        generatedAt
      ),

    policy:
      normalizedPolicy,
  });
}

/* ------------------------------------------------------------------ */
/* Policy */
/* ------------------------------------------------------------------ */

export function normalizeRuntimeRecommendationAdaptiveObservationPolicy(
  policy?:
    PartialRuntimeRecommendationAdaptiveObservationPolicy
): RuntimeRecommendationAdaptiveObservationPolicy {

  const fallback =
    DEFAULT_RUNTIME_RECOMMENDATION_ADAPTIVE_OBSERVATION_POLICY;

  return {
    includeWarnings:
      typeof policy?.includeWarnings ===
      "boolean"
        ? policy.includeWarnings
        : fallback.includeWarnings,

    includeDiagnostics:
      typeof policy?.includeDiagnostics ===
      "boolean"
        ? policy.includeDiagnostics
        : fallback.includeDiagnostics,
  };
}

export function cloneRuntimeRecommendationAdaptiveObservationPolicy(
  policy:
    RuntimeRecommendationAdaptiveObservationPolicy
): RuntimeRecommendationAdaptiveObservationPolicy {

  return {
    includeWarnings:
      policy.includeWarnings,

    includeDiagnostics:
      policy.includeDiagnostics,
  };
}

/* ------------------------------------------------------------------ */
/* Internal Function Contracts */
/* ------------------------------------------------------------------ */

type CreateAdaptiveRecommendationObservationWithPolicyParams = {
  comparison:
    CompareBaseAndAdaptiveRuntimeRecommendationsResult;

  contextKey:
    string | null;

  generatedAt:
    string;

  policy:
    RuntimeRecommendationAdaptiveObservationPolicy;
};

/* ------------------------------------------------------------------ */
/* Observation Builder */
/* ------------------------------------------------------------------ */

function createAdaptiveRecommendationObservationWithPolicy({
  comparison,
  contextKey,
  generatedAt,
  policy,
}: CreateAdaptiveRecommendationObservationWithPolicyParams):
  CreateAdaptiveRecommendationObservationResult {

  const comparisonWarnings =
    policy.includeWarnings
      ? comparison
          .diagnostics
          .warnings
      : [];

  const validationWarnings =
    policy.includeDiagnostics
      ? createAdaptiveRecommendationObservationValidationWarnings({
          comparison,
          contextKey,
        })
      : [];

  const observationWarnings =
    uniqueStrings(
      comparisonWarnings
    );

  const diagnosticsWarnings =
    uniqueStrings([
      ...comparisonWarnings,
      ...validationWarnings,
    ]);

  const status =
    resolveAdaptiveRecommendationObservationStatus(
      comparison
    );

  const reason =
    resolveAdaptiveRecommendationObservationReason(
      comparison
    );

  const observationId =
    createAdaptiveRecommendationObservationId({
      contextKey,
      generatedAt,
      comparison,
    });

  const observation:
    RuntimeRecommendationAdaptiveObservation = {

    observationId,

    generatedAt,

    contextKey,

    baseCandidateId:
      comparison
        .diagnostics
        .baseCandidateId,

    adaptiveCandidateId:
      comparison
        .diagnostics
        .adaptiveCandidateId,

    sameCandidate:
      comparison
        .diagnostics
        .sameCandidate,

    winnerChanged:
      comparison
        .diagnostics
        .winnerChanged,

    blockingStatusChanged:
      comparison
        .diagnostics
        .blockingStatusChanged,

    baseWinnerBaseScore:
      comparison
        .scoreComparison
        .baseWinnerBaseScore,

    baseWinnerAdaptiveScore:
      comparison
        .scoreComparison
        .baseWinnerAdaptiveScore,

    adaptiveWinnerBaseScore:
      comparison
        .scoreComparison
        .adaptiveWinnerBaseScore,

    adaptiveWinnerAdaptiveScore:
      comparison
        .scoreComparison
        .adaptiveWinnerAdaptiveScore,

    baseScoreDifference:
      comparison
        .scoreComparison
        .baseScoreDifference,

    adaptiveScoreDifference:
      comparison
        .scoreComparison
        .adaptiveScoreDifference,

    baseWinnerAdaptiveRank:
      comparison
        .diagnostics
        .baseWinnerAdaptiveRank,

    adaptiveWinnerRank:
      comparison
        .diagnostics
        .adaptiveWinnerRank,

    adaptiveCandidateCount:
      comparison
        .diagnostics
        .adaptiveCandidateCount,

    status,

    reason,

    warnings:
      observationWarnings,
  };

  const diagnostics:
    RuntimeRecommendationAdaptiveObservationDiagnostics = {

    generatedAt,

    status,

    reason,

    contextKey,

    warningCount:
      diagnosticsWarnings.length,

    warnings:
      diagnosticsWarnings,
  };

  return {

    observation,

    diagnostics,

    policy:
      cloneRuntimeRecommendationAdaptiveObservationPolicy(
        policy
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Observation Status */
/* ------------------------------------------------------------------ */

function resolveAdaptiveRecommendationObservationStatus(
  comparison:
    CompareBaseAndAdaptiveRuntimeRecommendationsResult
):
  RuntimeRecommendationAdaptiveObservationStatus {

  const baseExists =
    comparison.baseWinner !==
    null;

  const adaptiveExists =
    comparison.adaptiveWinner !==
    null;

  if (
    baseExists &&
    adaptiveExists
  ) {
    return "created";
  }

  if (
    baseExists ||
    adaptiveExists
  ) {
    return "incomplete";
  }

  return "invalid";
}

/* ------------------------------------------------------------------ */
/* Observation Reason */
/* ------------------------------------------------------------------ */

function resolveAdaptiveRecommendationObservationReason(
  comparison:
    CompareBaseAndAdaptiveRuntimeRecommendationsResult
):
  RuntimeRecommendationAdaptiveObservationReason {

  const baseExists =
    comparison.baseWinner !==
    null;

  const adaptiveExists =
    comparison.adaptiveWinner !==
    null;

  if (
    baseExists &&
    adaptiveExists
  ) {
    return "shadow-comparison-recorded";
  }

  if (
    !baseExists &&
    adaptiveExists
  ) {
    return "missing-base-winner";
  }

  if (
    baseExists &&
    !adaptiveExists
  ) {
    return "missing-adaptive-winner";
  }

  return "missing-both-winners";
}

/* ------------------------------------------------------------------ */
/* Observation ID */
/* ------------------------------------------------------------------ */

type CreateAdaptiveRecommendationObservationIdParams = {

  contextKey:
    string | null;

  generatedAt:
    string;

  comparison:
    CompareBaseAndAdaptiveRuntimeRecommendationsResult;
};

function createAdaptiveRecommendationObservationId({
  contextKey,
  generatedAt,
  comparison,
}: CreateAdaptiveRecommendationObservationIdParams):
  string {
  const context =
    normalizeAdaptiveRecommendationObservationIdSegment(
      contextKey,
      "runtime"
    );

  const timestamp =
    normalizeAdaptiveRecommendationObservationIdSegment(
      generatedAt,
      "unknown-time"
    );

  const baseCandidateId =
    normalizeAdaptiveRecommendationObservationIdSegment(
      comparison
        .diagnostics
        .baseCandidateId,
      "none"
    );

  const adaptiveCandidateId =
    normalizeAdaptiveRecommendationObservationIdSegment(
      comparison
        .diagnostics
        .adaptiveCandidateId,
      "none"
    );

  return [
    "adaptive-observation",
    context,
    timestamp,
    baseCandidateId,
    adaptiveCandidateId,
  ].join(":");
}

/* ------------------------------------------------------------------ */
/* Observation Validation */
/* ------------------------------------------------------------------ */

type CreateAdaptiveRecommendationObservationValidationWarningsParams = {
  comparison:
    CompareBaseAndAdaptiveRuntimeRecommendationsResult;

  contextKey:
    string | null;
};

/**
 * Shadow Comparison과 Observation 사이의 데이터 일관성을 검사합니다.
 *
 * 이 함수는 Shadow Comparison을 다시 계산하지 않습니다.
 * Observation 생성 과정에서 발견할 수 있는 구조적 불일치만 경고합니다.
 */
function createAdaptiveRecommendationObservationValidationWarnings({
  comparison,
  contextKey,
}: CreateAdaptiveRecommendationObservationValidationWarningsParams):
  string[] {
  const warnings:
    string[] = [];

  const diagnostics =
    comparison.diagnostics;

  const scoreComparison =
    comparison.scoreComparison;

  if (
    comparison.baseWinner !== null &&
    diagnostics.baseCandidateId === null
  ) {
    warnings.push(
      "Base Winner exists, but the Shadow Comparison does not contain a Base Candidate ID."
    );
  }

  if (
    comparison.baseWinner === null &&
    diagnostics.baseCandidateId !== null
  ) {
    warnings.push(
      "A Base Candidate ID exists, but the Shadow Comparison does not contain a Base Winner."
    );
  }

  if (
    comparison.adaptiveWinner !== null &&
    diagnostics.adaptiveCandidateId === null
  ) {
    warnings.push(
      "Adaptive Winner exists, but the Shadow Comparison does not contain an Adaptive Candidate ID."
    );
  }

  if (
    comparison.adaptiveWinner === null &&
    diagnostics.adaptiveCandidateId !== null
  ) {
    warnings.push(
      "An Adaptive Candidate ID exists, but the Shadow Comparison does not contain an Adaptive Winner."
    );
  }

  if (
    diagnostics.sameCandidate &&
    (
      diagnostics.baseCandidateId === null ||
      diagnostics.adaptiveCandidateId === null
    )
  ) {
    warnings.push(
      "The Shadow Comparison is marked as the same Candidate, but one or both Candidate IDs are missing."
    );
  }

  if (
    diagnostics.sameCandidate &&
    diagnostics.baseCandidateId !==
      diagnostics.adaptiveCandidateId
  ) {
    warnings.push(
      "The Shadow Comparison is marked as the same Candidate, but the Candidate IDs do not match."
    );
  }

  if (
    diagnostics.winnerChanged &&
    diagnostics.sameCandidate
  ) {
    warnings.push(
      "The Shadow Comparison reports both winnerChanged and sameCandidate."
    );
  }

  if (
    diagnostics.winnerChanged &&
    (
      diagnostics.baseCandidateId === null ||
      diagnostics.adaptiveCandidateId === null
    )
  ) {
    warnings.push(
      "The Shadow Comparison reports a changed Winner, but one or both Winner Candidate IDs are missing."
    );
  }

  if (
    diagnostics.adaptiveCandidateCount < 0
  ) {
    warnings.push(
      "Adaptive Candidate Count cannot be negative."
    );
  }

  if (
    diagnostics.adaptiveWinnerRank !== null &&
    diagnostics.adaptiveWinnerRank < 1
  ) {
    warnings.push(
      "Adaptive Winner Rank must be greater than or equal to 1."
    );
  }

  if (
    diagnostics.baseWinnerAdaptiveRank !== null &&
    diagnostics.baseWinnerAdaptiveRank < 1
  ) {
    warnings.push(
      "Base Winner Adaptive Rank must be greater than or equal to 1."
    );
  }

  if (
    diagnostics.adaptiveWinnerRank !== null &&
    diagnostics.adaptiveWinnerRank >
      diagnostics.adaptiveCandidateCount
  ) {
    warnings.push(
      "Adaptive Winner Rank exceeds the Adaptive Candidate Count."
    );
  }

  if (
    diagnostics.baseWinnerAdaptiveRank !== null &&
    diagnostics.baseWinnerAdaptiveRank >
      diagnostics.adaptiveCandidateCount
  ) {
    warnings.push(
      "Base Winner Adaptive Rank exceeds the Adaptive Candidate Count."
    );
  }

  validateOptionalFiniteObservationNumber({
    value:
      scoreComparison
        .baseWinnerBaseScore,

    fieldName:
      "baseWinnerBaseScore",

    warnings,
  });

  validateOptionalFiniteObservationNumber({
    value:
      scoreComparison
        .baseWinnerAdaptiveScore,

    fieldName:
      "baseWinnerAdaptiveScore",

    warnings,
  });

  validateOptionalFiniteObservationNumber({
    value:
      scoreComparison
        .adaptiveWinnerBaseScore,

    fieldName:
      "adaptiveWinnerBaseScore",

    warnings,
  });

  validateOptionalFiniteObservationNumber({
    value:
      scoreComparison
        .adaptiveWinnerAdaptiveScore,

    fieldName:
      "adaptiveWinnerAdaptiveScore",

    warnings,
  });

  validateOptionalFiniteObservationNumber({
    value:
      scoreComparison
        .baseScoreDifference,

    fieldName:
      "baseScoreDifference",

    warnings,
  });

  validateOptionalFiniteObservationNumber({
    value:
      scoreComparison
        .adaptiveScoreDifference,

    fieldName:
      "adaptiveScoreDifference",

    warnings,
  });

  if (
    contextKey === null
  ) {
    warnings.push(
      "Adaptive Recommendation Observation was created without a Context Key."
    );
  }

  return uniqueStrings(
    warnings
  );
}

/* ------------------------------------------------------------------ */
/* Optional Number Validation */
/* ------------------------------------------------------------------ */

type ValidateOptionalFiniteObservationNumberParams = {
  value:
    number | null;

  fieldName:
    string;

  warnings:
    string[];
};

function validateOptionalFiniteObservationNumber({
  value,
  fieldName,
  warnings,
}: ValidateOptionalFiniteObservationNumberParams):
  void {
  if (
    value !== null &&
    !Number.isFinite(
      value
    )
  ) {
    warnings.push(
      `Observation field "${fieldName}" contains a non-finite number.`
    );
  }
}

/* ------------------------------------------------------------------ */
/* Context Key Normalization */
/* ------------------------------------------------------------------ */

/**
 * Project, Repository 또는 Session을 구분하는 Context Key를
 * 저장 가능한 문자열로 정규화합니다.
 *
 * 대소문자는 보존하고 앞뒤 공백만 제거합니다.
 */
function normalizeAdaptiveRecommendationObservationContextKey(
  value:
    string | null | undefined
): string | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const normalizedValue =
    value.trim();

  return normalizedValue.length > 0
    ? normalizedValue
    : null;
}

/* ------------------------------------------------------------------ */
/* Observation ID Segment Normalization */
/* ------------------------------------------------------------------ */

/**
 * Observation ID에 포함되는 문자열에서 구분자 충돌을 방지합니다.
 *
 * 원본 Candidate ID나 Context Key를 변경하지 않고,
 * Observation ID를 생성할 때만 안전한 Segment로 변환합니다.
 */
function normalizeAdaptiveRecommendationObservationIdSegment(
  value:
    string | null | undefined,
  fallback:
    string
): string {
  if (
    typeof value !== "string"
  ) {
    return fallback;
  }

  const normalizedValue =
    value.trim();

  if (
    normalizedValue.length === 0
  ) {
    return fallback;
  }

  return normalizedValue
    .replace(
      /\s+/g,
      "-"
    )
    .replace(
      /:/g,
      "-"
    );
}

/* ------------------------------------------------------------------ */
/* Observation Clone */
/* ------------------------------------------------------------------ */

/**
 * Observation의 독립적인 복사본을 생성합니다.
 *
 * History 또는 Store가 반환된 Observation을 수정해도
 * 원본 Observation이 변경되지 않도록 합니다.
 */
export function cloneRuntimeRecommendationAdaptiveObservation(
  observation:
    RuntimeRecommendationAdaptiveObservation
): RuntimeRecommendationAdaptiveObservation {
  return {
    observationId:
      observation.observationId,

    generatedAt:
      observation.generatedAt,

    contextKey:
      observation.contextKey,

    baseCandidateId:
      observation.baseCandidateId,

    adaptiveCandidateId:
      observation.adaptiveCandidateId,

    sameCandidate:
      observation.sameCandidate,

    winnerChanged:
      observation.winnerChanged,

    blockingStatusChanged:
      observation.blockingStatusChanged,

    baseWinnerBaseScore:
      observation.baseWinnerBaseScore,

    baseWinnerAdaptiveScore:
      observation.baseWinnerAdaptiveScore,

    adaptiveWinnerBaseScore:
      observation.adaptiveWinnerBaseScore,

    adaptiveWinnerAdaptiveScore:
      observation.adaptiveWinnerAdaptiveScore,

    baseScoreDifference:
      observation.baseScoreDifference,

    adaptiveScoreDifference:
      observation.adaptiveScoreDifference,

    baseWinnerAdaptiveRank:
      observation.baseWinnerAdaptiveRank,

    adaptiveWinnerRank:
      observation.adaptiveWinnerRank,

    adaptiveCandidateCount:
      observation.adaptiveCandidateCount,

    status:
      observation.status,

    reason:
      observation.reason,

    warnings:
      [
        ...observation.warnings,
      ],
  };
}

/* ------------------------------------------------------------------ */
/* Observation Diagnostics Clone */
/* ------------------------------------------------------------------ */

export function cloneRuntimeRecommendationAdaptiveObservationDiagnostics(
  diagnostics:
    RuntimeRecommendationAdaptiveObservationDiagnostics
): RuntimeRecommendationAdaptiveObservationDiagnostics {
  return {
    generatedAt:
      diagnostics.generatedAt,

    status:
      diagnostics.status,

    reason:
      diagnostics.reason,

    contextKey:
      diagnostics.contextKey,

    warningCount:
      diagnostics.warningCount,

    warnings:
      [
        ...diagnostics.warnings,
      ],
  };
}