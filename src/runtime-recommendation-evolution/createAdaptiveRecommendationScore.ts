import type {
    RuntimeRecommendationScoredCandidate,
} from "./createRuntimeRecommendationCandidateScore";

import type {
    RuntimeRecommendationAdaptiveModifierResult,
} from "./createAdaptiveRecommendationModifier";

import {
    calculateAverage,
    calculateMaximum,
    calculateMinimum,
    clampInteger,
    clampNumber,
    normalizeCandidateId,
    normalizeFiniteNumber,
    normalizeGeneratedAt,
    roundNumber,
    uniqueStrings,
} from "./runtimeRecommendationMath";

export type RuntimeRecommendationAdaptiveScoreRange = {
  minimum: number;
  maximum: number;
};

export type RuntimeRecommendationAdaptiveScorePolicy = {
  scoreRange: RuntimeRecommendationAdaptiveScoreRange;
  allowBlockingCandidateAdjustment: boolean;
  blockingCandidateModifier: number;
  invalidBaseScoreFallback: number;
  invalidModifierFallback: number;
  decimalPlaces: number;
};

export type PartialRuntimeRecommendationAdaptiveScorePolicy = {
  scoreRange?: Partial<RuntimeRecommendationAdaptiveScoreRange>;
  allowBlockingCandidateAdjustment?: boolean;
  blockingCandidateModifier?: number;
  invalidBaseScoreFallback?: number;
  invalidModifierFallback?: number;
  decimalPlaces?: number;
};

export const DEFAULT_RUNTIME_RECOMMENDATION_ADAPTIVE_SCORE_POLICY:
  RuntimeRecommendationAdaptiveScorePolicy = {
    scoreRange: {
      minimum: 0,
      maximum: 100,
    },
    allowBlockingCandidateAdjustment: false,
    blockingCandidateModifier: 0,
    invalidBaseScoreFallback: 0,
    invalidModifierFallback: 0,
    decimalPlaces: 4,
  };

export type RuntimeRecommendationAdaptiveScoreStatus =
  | "adjusted"
  | "unchanged"
  | "blocking-candidate-protected"
  | "invalid-base-score-normalized"
  | "invalid-modifier-normalized";

export type RuntimeRecommendationAdaptiveScoreReason =
  | "adaptive-modifier-applied"
  | "adaptive-modifier-neutral"
  | "blocking-candidate-adjustment-disabled"
  | "base-score-was-invalid"
  | "adaptive-modifier-was-invalid";

export type RuntimeRecommendationAdaptiveScoreBreakdown = {
  originalBaseScore: number;
  normalizedBaseScore: number;
  originalModifier: number;
  appliedModifier: number;
  rawAdaptiveScore: number;
  finalAdaptiveScore: number;
  scoreDelta: number;
  wasBaseScoreNormalized: boolean;
  wasModifierNormalized: boolean;
  wasBlockingProtectionApplied: boolean;
  wasScoreClamped: boolean;
};

export type RuntimeRecommendationAdaptiveScoreDiagnostics = {
  candidateId: string;
  baseScore: number;
  originalModifier: number;
  appliedModifier: number;
  adaptiveScore: number;
  scoreDelta: number;
  isBlocking: boolean;
  modifierApplied: boolean;
  status: RuntimeRecommendationAdaptiveScoreStatus;
  reason: RuntimeRecommendationAdaptiveScoreReason;
  warnings: string[];
};

export type RuntimeRecommendationAdaptiveScoreResult = {
  candidateId: string;
  scoredCandidate: RuntimeRecommendationScoredCandidate;
  modifierResult: RuntimeRecommendationAdaptiveModifierResult;
  baseScore: number;
  adaptiveModifier: number;
  adaptiveScore: number;
  scoreDelta: number;
  status: RuntimeRecommendationAdaptiveScoreStatus;
  reason: RuntimeRecommendationAdaptiveScoreReason;
  breakdown: RuntimeRecommendationAdaptiveScoreBreakdown;
  diagnostics: RuntimeRecommendationAdaptiveScoreDiagnostics;
};

export type RuntimeRecommendationAdaptiveScoresDiagnostics = {
  generatedAt: string;
  candidateCount: number;
  adjustedCandidateCount: number;
  unchangedCandidateCount: number;
  blockingProtectedCandidateCount: number;
  positiveModifierCandidateCount: number;
  negativeModifierCandidateCount: number;
  neutralModifierCandidateCount: number;
  minimumAdaptiveScore: number | null;
  maximumAdaptiveScore: number | null;
  averageAdaptiveScore: number | null;
  warnings: string[];
};

export type CreateAdaptiveRecommendationScoreParams = {
  scoredCandidate: RuntimeRecommendationScoredCandidate;
  modifierResult: RuntimeRecommendationAdaptiveModifierResult;
  policy?: PartialRuntimeRecommendationAdaptiveScorePolicy;
};

export type CreateAdaptiveRecommendationScoresParams = {
  scoredCandidates: RuntimeRecommendationScoredCandidate[];
  modifierResultByCandidateId: Record<
    string,
    RuntimeRecommendationAdaptiveModifierResult | undefined
  >;
  policy?: PartialRuntimeRecommendationAdaptiveScorePolicy;
  generatedAt?: string;
};

export type CreateAdaptiveRecommendationScoresResult = {
  results: RuntimeRecommendationAdaptiveScoreResult[];
  resultByCandidateId: Record<
    string,
    RuntimeRecommendationAdaptiveScoreResult
  >;
  diagnostics: RuntimeRecommendationAdaptiveScoresDiagnostics;
  policy: RuntimeRecommendationAdaptiveScorePolicy;
};

export function createAdaptiveRecommendationScore({
  scoredCandidate,
  modifierResult,
  policy,
}: CreateAdaptiveRecommendationScoreParams):
  RuntimeRecommendationAdaptiveScoreResult {
  const normalizedPolicy =
    normalizeRuntimeRecommendationAdaptiveScorePolicy(policy);

  return createAdaptiveRecommendationScoreWithPolicy({
    scoredCandidate,
    modifierResult,
    policy: normalizedPolicy,
  });
}

export function createAdaptiveRecommendationScores({
  scoredCandidates,
  modifierResultByCandidateId,
  policy,
  generatedAt,
}: CreateAdaptiveRecommendationScoresParams):
  CreateAdaptiveRecommendationScoresResult {
  const normalizedPolicy =
    normalizeRuntimeRecommendationAdaptiveScorePolicy(policy);

  const results = scoredCandidates.map((scoredCandidate) => {
    const candidateId = scoredCandidate.candidateId;
    const modifierResult =
      modifierResultByCandidateId[candidateId];

    if (modifierResult === undefined) {
      throw new Error(
        [
          "Adaptive Modifier Result is missing.",
          `candidateId="${candidateId}"`,
        ].join(" ")
      );
    }

    return createAdaptiveRecommendationScoreWithPolicy({
      scoredCandidate,
      modifierResult,
      policy: normalizedPolicy,
    });
  });

  const resultByCandidateId: Record<
    string,
    RuntimeRecommendationAdaptiveScoreResult
  > = {};

  const warnings: string[] = [];

  for (const result of results) {
    if (resultByCandidateId[result.candidateId] !== undefined) {
      warnings.push(
        `Duplicate Adaptive Score candidate ID "${result.candidateId}" was detected.`
      );
    }

    resultByCandidateId[result.candidateId] = result;
  }

  return {
    results,
    resultByCandidateId,
    diagnostics:
      createRuntimeRecommendationAdaptiveScoresDiagnostics({
        results,
        generatedAt: normalizeGeneratedAt(generatedAt),
        warnings,
      }),
    policy: normalizedPolicy,
  };
}

type CreateAdaptiveRecommendationScoreWithPolicyParams = {
  scoredCandidate: RuntimeRecommendationScoredCandidate;
  modifierResult: RuntimeRecommendationAdaptiveModifierResult;
  policy: RuntimeRecommendationAdaptiveScorePolicy;
};

function createAdaptiveRecommendationScoreWithPolicy({
  scoredCandidate,
  modifierResult,
  policy,
}: CreateAdaptiveRecommendationScoreWithPolicyParams):
  RuntimeRecommendationAdaptiveScoreResult {
  const candidateId =
    normalizeCandidateId(scoredCandidate.candidateId);

  const originalBaseScore = scoredCandidate.baseScore;
  const originalModifier = modifierResult.modifier;

  const wasBaseScoreNormalized =
    !Number.isFinite(originalBaseScore);
  const wasModifierNormalized =
    !Number.isFinite(originalModifier);

  const normalizedBaseScore =
    wasBaseScoreNormalized
      ? normalizeFiniteNumber(
          policy.invalidBaseScoreFallback,
          policy.scoreRange.minimum
        )
      : originalBaseScore;

  const normalizedModifier =
    wasModifierNormalized
      ? normalizeFiniteNumber(
          policy.invalidModifierFallback,
          0
        )
      : originalModifier;

  const wasBlockingProtectionApplied =
    scoredCandidate.candidate.isBlocking &&
    !policy.allowBlockingCandidateAdjustment;

  const appliedModifier =
    wasBlockingProtectionApplied
      ? normalizeFiniteNumber(
          policy.blockingCandidateModifier,
          0
        )
      : normalizedModifier;

  const rawAdaptiveScore =
    normalizedBaseScore + appliedModifier;

  const roundedRawAdaptiveScore =
    roundNumber(rawAdaptiveScore, policy.decimalPlaces);

  const finalAdaptiveScore =
    normalizeAdaptiveFinalScore({
      score: rawAdaptiveScore,
      range: policy.scoreRange,
      decimalPlaces: policy.decimalPlaces,
    });

  const roundedNormalizedBaseScore =
    roundNumber(normalizedBaseScore, policy.decimalPlaces);

  const roundedAppliedModifier =
    roundNumber(appliedModifier, policy.decimalPlaces);

  const scoreDelta =
    roundNumber(
      finalAdaptiveScore - roundedNormalizedBaseScore,
      policy.decimalPlaces
    );

  const wasScoreClamped =
    finalAdaptiveScore !== roundedRawAdaptiveScore;

  const status =
    resolveRuntimeRecommendationAdaptiveScoreStatus({
      wasBaseScoreNormalized,
      wasModifierNormalized,
      wasBlockingProtectionApplied,
      scoreDelta,
    });

  const reason =
    resolveRuntimeRecommendationAdaptiveScoreReason({
      wasBaseScoreNormalized,
      wasModifierNormalized,
      wasBlockingProtectionApplied,
      scoreDelta,
    });

  const breakdown:
    RuntimeRecommendationAdaptiveScoreBreakdown = {
      originalBaseScore,
      normalizedBaseScore: roundedNormalizedBaseScore,
      originalModifier,
      appliedModifier: roundedAppliedModifier,
      rawAdaptiveScore: roundedRawAdaptiveScore,
      finalAdaptiveScore,
      scoreDelta,
      wasBaseScoreNormalized,
      wasModifierNormalized,
      wasBlockingProtectionApplied,
      wasScoreClamped,
    };

  const warnings =
    createRuntimeRecommendationAdaptiveScoreWarnings({
      scoredCandidate,
      modifierResult,
      breakdown,
    });

  const diagnostics:
    RuntimeRecommendationAdaptiveScoreDiagnostics = {
      candidateId,
      baseScore: roundedNormalizedBaseScore,
      originalModifier,
      appliedModifier: roundedAppliedModifier,
      adaptiveScore: finalAdaptiveScore,
      scoreDelta,
      isBlocking: scoredCandidate.candidate.isBlocking,
      modifierApplied: roundedAppliedModifier !== 0,
      status,
      reason,
      warnings,
    };

  return {
    candidateId,
    scoredCandidate,
    modifierResult,
    baseScore: roundedNormalizedBaseScore,
    adaptiveModifier: roundedAppliedModifier,
    adaptiveScore: finalAdaptiveScore,
    scoreDelta,
    status,
    reason,
    breakdown,
    diagnostics,
  };
}

type ResolveRuntimeRecommendationAdaptiveScoreStateParams = {
  wasBaseScoreNormalized: boolean;
  wasModifierNormalized: boolean;
  wasBlockingProtectionApplied: boolean;
  scoreDelta: number;
};

function resolveRuntimeRecommendationAdaptiveScoreStatus({
  wasBaseScoreNormalized,
  wasModifierNormalized,
  wasBlockingProtectionApplied,
  scoreDelta,
}: ResolveRuntimeRecommendationAdaptiveScoreStateParams):
  RuntimeRecommendationAdaptiveScoreStatus {
  if (wasBaseScoreNormalized) {
    return "invalid-base-score-normalized";
  }

  if (wasModifierNormalized) {
    return "invalid-modifier-normalized";
  }

  if (wasBlockingProtectionApplied) {
    return "blocking-candidate-protected";
  }

  return scoreDelta !== 0
    ? "adjusted"
    : "unchanged";
}

function resolveRuntimeRecommendationAdaptiveScoreReason({
  wasBaseScoreNormalized,
  wasModifierNormalized,
  wasBlockingProtectionApplied,
  scoreDelta,
}: ResolveRuntimeRecommendationAdaptiveScoreStateParams):
  RuntimeRecommendationAdaptiveScoreReason {
  if (wasBaseScoreNormalized) {
    return "base-score-was-invalid";
  }

  if (wasModifierNormalized) {
    return "adaptive-modifier-was-invalid";
  }

  if (wasBlockingProtectionApplied) {
    return "blocking-candidate-adjustment-disabled";
  }

  return scoreDelta !== 0
    ? "adaptive-modifier-applied"
    : "adaptive-modifier-neutral";
}

type CreateRuntimeRecommendationAdaptiveScoreWarningsParams = {
  scoredCandidate: RuntimeRecommendationScoredCandidate;
  modifierResult: RuntimeRecommendationAdaptiveModifierResult;
  breakdown: RuntimeRecommendationAdaptiveScoreBreakdown;
};

function createRuntimeRecommendationAdaptiveScoreWarnings({
  scoredCandidate,
  modifierResult,
  breakdown,
}: CreateRuntimeRecommendationAdaptiveScoreWarningsParams):
  string[] {
  const warnings: string[] = [];

  if (breakdown.wasBaseScoreNormalized) {
    warnings.push(
      "Base Score was not finite and was replaced with the configured fallback."
    );
  }

  if (breakdown.wasModifierNormalized) {
    warnings.push(
      "Adaptive Modifier was not finite and was replaced with the configured fallback."
    );
  }

  if (breakdown.wasBlockingProtectionApplied) {
    warnings.push(
      "Adaptive adjustment was disabled because the candidate is blocking."
    );
  }

  if (breakdown.wasScoreClamped) {
    warnings.push(
      "Adaptive Score was clamped to the configured score range."
    );
  }

  if (
    modifierResult.candidateId !==
    scoredCandidate.candidateId
  ) {
    warnings.push(
      "Adaptive Modifier candidate ID does not match the Base Scored Candidate ID."
    );
  }

  if (
    modifierResult.applied &&
    modifierResult.modifier === 0
  ) {
    warnings.push(
      "Adaptive Modifier Result is marked as applied, but its modifier value is zero."
    );
  }

  if (
    !modifierResult.applied &&
    modifierResult.modifier !== 0
  ) {
    warnings.push(
      "Adaptive Modifier Result is marked as not applied, but its modifier value is not zero."
    );
  }

  warnings.push(
    ...modifierResult.diagnostics.warnings.map(
      (warning) => `Modifier diagnostics: ${warning}`
    )
  );

  return uniqueStrings(warnings);
}

type NormalizeAdaptiveFinalScoreParams = {
  score: number;
  range: RuntimeRecommendationAdaptiveScoreRange;
  decimalPlaces: number;
};

function normalizeAdaptiveFinalScore({
  score,
  range,
  decimalPlaces,
}: NormalizeAdaptiveFinalScoreParams): number {
  const minimum =
    normalizeFiniteNumber(range.minimum, 0);

  const maximum =
    Math.max(
      minimum,
      normalizeFiniteNumber(range.maximum, 100)
    );

  return roundNumber(
    clampNumber(
      normalizeFiniteNumber(score, minimum),
      minimum,
      maximum
    ),
    decimalPlaces
  );
}

type CreateRuntimeRecommendationAdaptiveScoresDiagnosticsParams = {
  results: RuntimeRecommendationAdaptiveScoreResult[];
  generatedAt: string;
  warnings: string[];
};

function createRuntimeRecommendationAdaptiveScoresDiagnostics({
  results,
  generatedAt,
  warnings,
}: CreateRuntimeRecommendationAdaptiveScoresDiagnosticsParams):
  RuntimeRecommendationAdaptiveScoresDiagnostics {
  const adaptiveScores =
    results
      .map((result) => result.adaptiveScore)
      .filter((score) => Number.isFinite(score));

  const collectionWarnings = [...warnings];

  const duplicateCandidateIds =
    new Set(
      results.map((result) => result.candidateId)
    ).size !== results.length;

  if (results.length === 0) {
    collectionWarnings.push(
      "No recommendation candidates were available for Adaptive Score calculation."
    );
  }

  if (duplicateCandidateIds) {
    collectionWarnings.push(
      "Duplicate Adaptive Score candidate IDs were detected."
    );
  }

  if (adaptiveScores.length !== results.length) {
    collectionWarnings.push(
      "One or more Adaptive Score results contained a non-finite score."
    );
  }

  const candidateWarningCount =
    results.reduce(
      (total, result) =>
        total + result.diagnostics.warnings.length,
      0
    );

  if (candidateWarningCount > 0) {
    collectionWarnings.push(
      `${candidateWarningCount} candidate-level Adaptive Score warning${
        candidateWarningCount === 1 ? "" : "s"
      } ${
        candidateWarningCount === 1 ? "was" : "were"
      } generated.`
    );
  }

  const averageAdaptiveScore =
    calculateAverage(adaptiveScores);

  return {
    generatedAt,
    candidateCount: results.length,
    adjustedCandidateCount:
      results.filter(
        (result) => result.status === "adjusted"
      ).length,
    unchangedCandidateCount:
      results.filter(
        (result) => result.scoreDelta === 0
      ).length,
    blockingProtectedCandidateCount:
      results.filter(
        (result) =>
          result.breakdown.wasBlockingProtectionApplied
      ).length,
    positiveModifierCandidateCount:
      results.filter(
        (result) => result.adaptiveModifier > 0
      ).length,
    negativeModifierCandidateCount:
      results.filter(
        (result) => result.adaptiveModifier < 0
      ).length,
    neutralModifierCandidateCount:
      results.filter(
        (result) => result.adaptiveModifier === 0
      ).length,
    minimumAdaptiveScore:
      calculateMinimum(adaptiveScores),
    maximumAdaptiveScore:
      calculateMaximum(adaptiveScores),
    averageAdaptiveScore:
      averageAdaptiveScore === null
        ? null
        : roundNumber(averageAdaptiveScore, 4),
    warnings:
      uniqueStrings(collectionWarnings),
  };
}

export function normalizeRuntimeRecommendationAdaptiveScorePolicy(
  policy?: PartialRuntimeRecommendationAdaptiveScorePolicy
): RuntimeRecommendationAdaptiveScorePolicy {
  const fallback =
    DEFAULT_RUNTIME_RECOMMENDATION_ADAPTIVE_SCORE_POLICY;

  const minimumScore =
    normalizeFiniteNumber(
      policy?.scoreRange?.minimum,
      fallback.scoreRange.minimum
    );

  const maximumScore =
    Math.max(
      minimumScore,
      normalizeFiniteNumber(
        policy?.scoreRange?.maximum,
        fallback.scoreRange.maximum
      )
    );

  const invalidBaseScoreFallback =
    clampNumber(
      normalizeFiniteNumber(
        policy?.invalidBaseScoreFallback,
        fallback.invalidBaseScoreFallback
      ),
      minimumScore,
      maximumScore
    );

  return {
    scoreRange: {
      minimum: minimumScore,
      maximum: maximumScore,
    },
    allowBlockingCandidateAdjustment:
      typeof policy?.allowBlockingCandidateAdjustment ===
      "boolean"
        ? policy.allowBlockingCandidateAdjustment
        : fallback.allowBlockingCandidateAdjustment,
    blockingCandidateModifier:
      normalizeFiniteNumber(
        policy?.blockingCandidateModifier,
        fallback.blockingCandidateModifier
      ),
    invalidBaseScoreFallback,
    invalidModifierFallback:
      normalizeFiniteNumber(
        policy?.invalidModifierFallback,
        fallback.invalidModifierFallback
      ),
    decimalPlaces:
      clampInteger(
        policy?.decimalPlaces,
        fallback.decimalPlaces,
        0,
        8
      ),
  };
}

export function cloneRuntimeRecommendationAdaptiveScorePolicy(
  policy: RuntimeRecommendationAdaptiveScorePolicy
): RuntimeRecommendationAdaptiveScorePolicy {
  return {
    scoreRange: {
      ...policy.scoreRange,
    },
    allowBlockingCandidateAdjustment:
      policy.allowBlockingCandidateAdjustment,
    blockingCandidateModifier:
      policy.blockingCandidateModifier,
    invalidBaseScoreFallback:
      policy.invalidBaseScoreFallback,
    invalidModifierFallback:
      policy.invalidModifierFallback,
    decimalPlaces:
      policy.decimalPlaces,
  };
}