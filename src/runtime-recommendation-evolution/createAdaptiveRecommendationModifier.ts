import type {
    RuntimeRecommendationScoredCandidate,
} from "./createRuntimeRecommendationCandidateScore";

import type {
    RuntimeRecommendationQualityConfidence,
    RuntimeRecommendationQualityOutcome,
    RuntimeRecommendationQualityProfile,
    RuntimeRecommendationQualitySignalType,
} from "./runtimeRecommendationQualityTypes";

/* ------------------------------------------------------------------ */
/* Adaptive Policy Types */
/* ------------------------------------------------------------------ */

/**
 * Adaptive Modifier의 최종 허용 범위입니다.
 *
 * PR-046C Shadow Mode에서는 Base Score를 크게 흔들지 않도록
 * 보수적인 범위를 사용합니다.
 */
export type RuntimeRecommendationAdaptiveModifierRange = {
  minimum:
    number;

  maximum:
    number;
};

/**
 * Quality Confidence별 History 반영 비율입니다.
 *
 * unknown과 low는 기본적으로 History를 점수에 반영하지 않습니다.
 */
export type RuntimeRecommendationAdaptiveConfidenceWeightPolicy = {
  unknown:
    number;

  low:
    number;

  developing:
    number;

  established:
    number;
};

/**
 * Quality Outcome 자체에 부여하는 기본 Modifier입니다.
 *
 * 세부 Rate Modifier와 중복되므로 작은 값만 사용합니다.
 */
export type RuntimeRecommendationAdaptiveOutcomePolicy = {
  insufficientHistory:
    number;

  effective:
    number;

  mixed:
    number;

  unstable:
    number;

  unresolved:
    number;
};

/**
 * Recommendation History Rate별 최대 영향력입니다.
 */
export type RuntimeRecommendationAdaptiveRatePolicy = {
  /**
   * completionRate가 1일 때 적용되는 최대 양수 Modifier입니다.
   */
  completionMaximum:
    number;

  /**
   * completionEvidenceRate가 1일 때 적용되는 최대 양수 Modifier입니다.
   */
  completionEvidenceMaximum:
    number;

  /**
   * navigationRate가 1일 때 적용되는 최대 양수 Modifier입니다.
   *
   * Navigation은 완료가 아니므로 영향력을 작게 유지합니다.
   */
  navigationMaximum:
    number;

  /**
   * supersededRate가 1일 때 적용되는 최대 음수 Modifier의 절댓값입니다.
   */
  supersededMaximumPenalty:
    number;

  /**
   * repetitionRate가 1일 때 적용되는 최대 음수 Modifier의 절댓값입니다.
   */
  repetitionMaximumPenalty:
    number;

  /**
   * unresolvedRate가 1일 때 적용되는 최대 음수 Modifier의 절댓값입니다.
   */
  unresolvedMaximumPenalty:
    number;
};

/**
 * Quality Signal이 Adaptive Modifier에 미치는 최대 영향입니다.
 *
 * Signal strength는 0~1 범위이므로 각 값은 최대 기여량을 의미합니다.
 */
export type RuntimeRecommendationAdaptiveSignalPolicy = {
  highCompletionRate:
    number;

  completionObserved:
    number;

  navigationObserved:
    number;

  stableOutcome:
    number;

  lowCompletionRate:
    number;

  frequentlySuperseded:
    number;

  repeatedRecommendation:
    number;

  unresolvedRecommendation:
    number;

  visitedWithoutCompletion:
    number;

  mixedOutcome:
    number;

  insufficientOccurrences:
    number;
};

/**
 * Adaptive Modifier 전체 정책입니다.
 */
export type RuntimeRecommendationAdaptiveModifierPolicy = {
  modifierRange:
    RuntimeRecommendationAdaptiveModifierRange;

  confidenceWeight:
    RuntimeRecommendationAdaptiveConfidenceWeightPolicy;

  outcome:
    RuntimeRecommendationAdaptiveOutcomePolicy;

  rates:
    RuntimeRecommendationAdaptiveRatePolicy;

  signals:
    RuntimeRecommendationAdaptiveSignalPolicy;

  /**
   * 최소 History occurrence 수입니다.
   *
   * 이 값보다 적으면 confidence가 developing 이상이어도
   * Modifier를 적용하지 않습니다.
   */
  minimumOccurrences:
    number;

  /**
   * Blocking Candidate에 Adaptive Modifier 적용을 허용할지 결정합니다.
   *
   * PR-046C 기본값은 false입니다.
   */
  allowBlockingCandidateModifier:
    boolean;

  /**
   * 최종 결과 소수점 자리 수입니다.
   */
  decimalPlaces:
    number;
};

/**
 * 중첩 정책의 일부만 덮어쓸 수 있는 입력 타입입니다.
 */
export type PartialRuntimeRecommendationAdaptiveModifierPolicy = {
  modifierRange?:
    Partial<RuntimeRecommendationAdaptiveModifierRange>;

  confidenceWeight?:
    Partial<RuntimeRecommendationAdaptiveConfidenceWeightPolicy>;

  outcome?:
    Partial<RuntimeRecommendationAdaptiveOutcomePolicy>;

  rates?:
    Partial<RuntimeRecommendationAdaptiveRatePolicy>;

  signals?:
    Partial<RuntimeRecommendationAdaptiveSignalPolicy>;

  minimumOccurrences?:
    number;

  allowBlockingCandidateModifier?:
    boolean;

  decimalPlaces?:
    number;
};

/* ------------------------------------------------------------------ */
/* Default Policy */
/* ------------------------------------------------------------------ */

/**
 * PR-046C Shadow Mode의 기본 Adaptive Modifier 정책입니다.
 *
 * 설계 원칙:
 *
 * - Profile 없음 → 0
 * - unknown / low confidence → 0
 * - Blocking Candidate → 0
 * - History는 Base Score를 보조할 뿐 지배하지 않음
 * - 최종 Modifier 범위는 -8 ~ +8
 */
export const DEFAULT_RUNTIME_RECOMMENDATION_ADAPTIVE_MODIFIER_POLICY:
  RuntimeRecommendationAdaptiveModifierPolicy = {
  modifierRange: {
    minimum:
      -8,

    maximum:
      8,
  },

  confidenceWeight: {
    unknown:
      0,

    low:
      0,

    developing:
      0.55,

    established:
      1,
  },

  outcome: {
    insufficientHistory:
      0,

    effective:
      1.5,

    mixed:
      0,

    unstable:
      -1.5,

    unresolved:
      -2,
  },

  rates: {
    completionMaximum:
      3,

    completionEvidenceMaximum:
      1,

    navigationMaximum:
      0.75,

    supersededMaximumPenalty:
      3,

    repetitionMaximumPenalty:
      2,

    unresolvedMaximumPenalty:
      3.5,
  },

  signals: {
    highCompletionRate:
      1,

    completionObserved:
      0.5,

    navigationObserved:
      0.25,

    stableOutcome:
      0.75,

    lowCompletionRate:
      -0.75,

    frequentlySuperseded:
      -1,

    repeatedRecommendation:
      -0.75,

    unresolvedRecommendation:
      -1.25,

    visitedWithoutCompletion:
      -0.5,

    mixedOutcome:
      -0.25,

    insufficientOccurrences:
      0,
  },

  minimumOccurrences:
    3,

  allowBlockingCandidateModifier:
    false,

  decimalPlaces:
    4,
};

/* ------------------------------------------------------------------ */
/* Modifier Breakdown */
/* ------------------------------------------------------------------ */

/**
 * Adaptive Modifier가 어떤 구성 요소로 만들어졌는지 설명합니다.
 */
export type RuntimeRecommendationAdaptiveModifierBreakdown = {
  /**
   * Quality Outcome에 따른 기본 Modifier입니다.
   */
  outcomeModifier:
    number;

  completionModifier:
    number;

  completionEvidenceModifier:
    number;

  navigationModifier:
    number;

  supersededModifier:
    number;

  repetitionModifier:
    number;

  unresolvedModifier:
    number;

  /**
   * Quality Profile Signal들의 합산 Modifier입니다.
   */
  signalModifier:
    number;

  /**
   * Confidence Weight 적용 전 전체 합계입니다.
   */
  rawModifierBeforeConfidence:
    number;

  /**
   * Profile confidence에 따라 적용된 0~1 가중치입니다.
   */
  confidenceWeight:
    number;

  /**
   * Confidence Weight 적용 후 Clamp 이전 Modifier입니다.
   */
  weightedModifier:
    number;

  /**
   * Modifier Range Clamp 이후 최종 Modifier입니다.
   */
  finalModifier:
    number;

  wasClamped:
    boolean;

  wasBlocked:
    boolean;
};

/* ------------------------------------------------------------------ */
/* Signal Contribution */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationAdaptiveSignalContribution = {
  type:
    RuntimeRecommendationQualitySignalType;

  strength:
    number;

  policyModifier:
    number;

  contribution:
    number;

  description:
    string;
};

/* ------------------------------------------------------------------ */
/* Modifier Status and Reason */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationAdaptiveModifierStatus =
  | "applied"
  | "no-quality-profile"
  | "insufficient-confidence"
  | "insufficient-occurrences"
  | "blocking-candidate-protected"
  | "neutral-history";

export type RuntimeRecommendationAdaptiveModifierReason =
  | "quality-profile-applied"
  | "quality-profile-missing"
  | "quality-confidence-too-low"
  | "history-occurrences-below-minimum"
  | "blocking-candidate-protected"
  | "quality-history-produced-neutral-modifier";

/* ------------------------------------------------------------------ */
/* Diagnostics */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationAdaptiveModifierDiagnostics = {
  candidateId:
    string;

  fingerprint:
    string | null;

  profileMatched:
    boolean;

  confidence:
    RuntimeRecommendationQualityConfidence | null;

  outcome:
    RuntimeRecommendationQualityOutcome | null;

  totalOccurrences:
    number;

  status:
    RuntimeRecommendationAdaptiveModifierStatus;

  reason:
    RuntimeRecommendationAdaptiveModifierReason;

  modifier:
    number;

  breakdown:
    RuntimeRecommendationAdaptiveModifierBreakdown;

  signalContributions:
    RuntimeRecommendationAdaptiveSignalContribution[];

  notes:
    string[];

  warnings:
    string[];
};

/* ------------------------------------------------------------------ */
/* Result Types */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationAdaptiveModifierResult = {
  candidateId:
    string;

  modifier:
    number;

  applied:
    boolean;

  status:
    RuntimeRecommendationAdaptiveModifierStatus;

  reason:
    RuntimeRecommendationAdaptiveModifierReason;

  breakdown:
    RuntimeRecommendationAdaptiveModifierBreakdown;

  signalContributions:
    RuntimeRecommendationAdaptiveSignalContribution[];

  diagnostics:
    RuntimeRecommendationAdaptiveModifierDiagnostics;
};

/* ------------------------------------------------------------------ */
/* Public Input */
/* ------------------------------------------------------------------ */

export type CreateAdaptiveRecommendationModifierParams = {
  scoredCandidate:
    RuntimeRecommendationScoredCandidate;

  qualityProfile:
    RuntimeRecommendationQualityProfile | null;

  policy?:
    PartialRuntimeRecommendationAdaptiveModifierPolicy;
};

export type CreateAdaptiveRecommendationModifiersParams = {
  scoredCandidates:
    RuntimeRecommendationScoredCandidate[];

  /**
   * Candidate ID별 Quality Profile입니다.
   *
   * resolveRuntimeRecommendationQualityProfiles() 결과에서
   * profile만 추출하여 전달할 수 있습니다.
   */
  qualityProfileByCandidateId:
    Record<
      string,
      RuntimeRecommendationQualityProfile | null | undefined
    >;

  policy?:
    PartialRuntimeRecommendationAdaptiveModifierPolicy;
};

export type CreateAdaptiveRecommendationModifiersResult = {
  results:
    RuntimeRecommendationAdaptiveModifierResult[];

  resultByCandidateId:
    Record<
      string,
      RuntimeRecommendationAdaptiveModifierResult
    >;

  appliedCount:
    number;

  neutralCount:
    number;

  policy:
    RuntimeRecommendationAdaptiveModifierPolicy;
};

/* ------------------------------------------------------------------ */
/* Public Builder */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Quality Profile을 사용해 Candidate의 Adaptive Modifier를
 * 계산합니다.
 *
 * 이 함수는 Adaptive Score를 계산하지 않습니다.
 *
 * Scored Candidate
 * +
 * Quality Profile
 * ↓
 * Adaptive Modifier
 */
export function createAdaptiveRecommendationModifier({
  scoredCandidate,
  qualityProfile,
  policy,
}: CreateAdaptiveRecommendationModifierParams):
  RuntimeRecommendationAdaptiveModifierResult {
  const normalizedPolicy =
    normalizeRuntimeRecommendationAdaptiveModifierPolicy(
      policy
    );

  return createAdaptiveRecommendationModifierWithPolicy({
    scoredCandidate,

    qualityProfile,

    policy:
      normalizedPolicy,
  });
}

/**
 * Scored Candidate 배열 전체의 Adaptive Modifier를 생성합니다.
 */
export function createAdaptiveRecommendationModifiers({
  scoredCandidates,
  qualityProfileByCandidateId,
  policy,
}: CreateAdaptiveRecommendationModifiersParams):
  CreateAdaptiveRecommendationModifiersResult {
  const normalizedPolicy =
    normalizeRuntimeRecommendationAdaptiveModifierPolicy(
      policy
    );

  const results =
    scoredCandidates.map(
      (scoredCandidate) =>
        createAdaptiveRecommendationModifierWithPolicy({
          scoredCandidate,

          qualityProfile:
            qualityProfileByCandidateId[
              scoredCandidate.candidateId
            ] ??
            null,

          policy:
            normalizedPolicy,
        })
    );

  const resultByCandidateId:
    Record<
      string,
      RuntimeRecommendationAdaptiveModifierResult
    > = {};

  for (
    const result of
    results
  ) {
    resultByCandidateId[
      result.candidateId
    ] =
      result;
  }

  return {
    results,

    resultByCandidateId,

    appliedCount:
      results.filter(
        (result) =>
          result.applied
      ).length,

    neutralCount:
      results.filter(
        (result) =>
          result.modifier === 0
      ).length,

    policy:
      normalizedPolicy,
  };
}

/* ------------------------------------------------------------------ */
/* Internal Builder */
/* ------------------------------------------------------------------ */

type CreateAdaptiveRecommendationModifierWithPolicyParams = {
  scoredCandidate:
    RuntimeRecommendationScoredCandidate;

  qualityProfile:
    RuntimeRecommendationQualityProfile | null;

  policy:
    RuntimeRecommendationAdaptiveModifierPolicy;
};

function createAdaptiveRecommendationModifierWithPolicy({
  scoredCandidate,
  qualityProfile,
  policy,
}: CreateAdaptiveRecommendationModifierWithPolicyParams):
  RuntimeRecommendationAdaptiveModifierResult {
  const candidateId =
    normalizeCandidateId(
      scoredCandidate.candidateId
    );

  if (
    qualityProfile === null
  ) {
    return createNeutralModifierResult({
      candidateId,

      qualityProfile:
        null,

      status:
        "no-quality-profile",

      reason:
        "quality-profile-missing",

      note:
        "No Recommendation Quality Profile matched this candidate.",
    });
  }

  if (
    scoredCandidate.candidate.isBlocking &&
    !policy.allowBlockingCandidateModifier
  ) {
    return createNeutralModifierResult({
      candidateId,

      qualityProfile,

      status:
        "blocking-candidate-protected",

      reason:
        "blocking-candidate-protected",

      note:
        "Adaptive Modifier was disabled because this is a blocking candidate.",
    });
  }

  const totalOccurrences =
    normalizeNonNegativeInteger(
      qualityProfile
        .features
        .counts
        .totalOccurrences
    );

  if (
    qualityProfile.confidence ===
      "unknown" ||
    qualityProfile.confidence ===
      "low"
  ) {
    return createNeutralModifierResult({
      candidateId,

      qualityProfile,

      status:
        "insufficient-confidence",

      reason:
        "quality-confidence-too-low",

      note:
        `Quality confidence is "${qualityProfile.confidence}", so history was not applied.`,
    });
  }

  if (
    totalOccurrences <
    policy.minimumOccurrences
  ) {
    return createNeutralModifierResult({
      candidateId,

      qualityProfile,

      status:
        "insufficient-occurrences",

      reason:
        "history-occurrences-below-minimum",

      note:
        `Only ${totalOccurrences} occurrence${
          totalOccurrences === 1
            ? ""
            : "s"
        } ${
          totalOccurrences === 1
            ? "is"
            : "are"
        } available; at least ${policy.minimumOccurrences} are required.`,
    });
  }

  const rates =
    qualityProfile.features.rates;

  const outcomeModifier =
    resolveOutcomeModifier(
      qualityProfile.outcome,
      policy.outcome
    );

  const completionModifier =
    clampUnit(
      rates.completionRate
    ) *
    policy.rates.completionMaximum;

  const completionEvidenceModifier =
    clampUnit(
      rates.completionEvidenceRate
    ) *
    policy.rates.completionEvidenceMaximum;

  const navigationModifier =
    clampUnit(
      rates.navigationRate
    ) *
    policy.rates.navigationMaximum;

  const supersededModifier =
    -(
      clampUnit(
        rates.supersededRate
      ) *
      policy.rates.supersededMaximumPenalty
    );

  const repetitionModifier =
    -(
      clampUnit(
        rates.repetitionRate
      ) *
      policy.rates.repetitionMaximumPenalty
    );

  const unresolvedModifier =
    -(
      clampUnit(
        rates.unresolvedRate
      ) *
      policy.rates.unresolvedMaximumPenalty
    );

  const signalContributions =
    createSignalContributions({
      profile:
        qualityProfile,

      policy:
        policy.signals,
    });

  const signalModifier =
    signalContributions.reduce(
      (
        total,
        contribution
      ) =>
        total +
        contribution.contribution,
      0
    );

  const rawModifierBeforeConfidence =
    outcomeModifier +
    completionModifier +
    completionEvidenceModifier +
    navigationModifier +
    supersededModifier +
    repetitionModifier +
    unresolvedModifier +
    signalModifier;

  const confidenceWeight =
    resolveConfidenceWeight(
      qualityProfile.confidence,
      policy.confidenceWeight
    );

  const weightedModifier =
    rawModifierBeforeConfidence *
    confidenceWeight;

  const finalModifier =
    roundNumber(
      clampNumber(
        weightedModifier,
        policy.modifierRange.minimum,
        policy.modifierRange.maximum
      ),
      policy.decimalPlaces
    );

  const roundedWeightedModifier =
    roundNumber(
      weightedModifier,
      policy.decimalPlaces
    );

  const breakdown:
    RuntimeRecommendationAdaptiveModifierBreakdown = {
    outcomeModifier:
      roundNumber(
        outcomeModifier,
        policy.decimalPlaces
      ),

    completionModifier:
      roundNumber(
        completionModifier,
        policy.decimalPlaces
      ),

    completionEvidenceModifier:
      roundNumber(
        completionEvidenceModifier,
        policy.decimalPlaces
      ),

    navigationModifier:
      roundNumber(
        navigationModifier,
        policy.decimalPlaces
      ),

    supersededModifier:
      roundNumber(
        supersededModifier,
        policy.decimalPlaces
      ),

    repetitionModifier:
      roundNumber(
        repetitionModifier,
        policy.decimalPlaces
      ),

    unresolvedModifier:
      roundNumber(
        unresolvedModifier,
        policy.decimalPlaces
      ),

    signalModifier:
      roundNumber(
        signalModifier,
        policy.decimalPlaces
      ),

    rawModifierBeforeConfidence:
      roundNumber(
        rawModifierBeforeConfidence,
        policy.decimalPlaces
      ),

    confidenceWeight:
      roundNumber(
        confidenceWeight,
        policy.decimalPlaces
      ),

    weightedModifier:
      roundedWeightedModifier,

    finalModifier,

    wasClamped:
      finalModifier !==
      roundedWeightedModifier,

    wasBlocked:
      false,
  };

  const applied =
    finalModifier !== 0;

  const status:
    RuntimeRecommendationAdaptiveModifierStatus =
      applied
        ? "applied"
        : "neutral-history";

  const reason:
    RuntimeRecommendationAdaptiveModifierReason =
      applied
        ? "quality-profile-applied"
        : "quality-history-produced-neutral-modifier";

  const notes =
    createAppliedModifierNotes({
      profile:
        qualityProfile,

      finalModifier,

      confidenceWeight,
    });

  const warnings:
    string[] = [];

  if (
    breakdown.wasClamped
  ) {
    warnings.push(
      "Adaptive Modifier was clamped to the configured modifier range."
    );
  }

  if (
    qualityProfile.identity.kind !==
      scoredCandidate.candidate.action.kind ||
    qualityProfile.identity.target !==
      scoredCandidate.candidate.action.target ||
    qualityProfile.identity.source !==
      scoredCandidate.candidate.action.source
  ) {
    warnings.push(
      "The Quality Profile identity does not fully match the scored candidate action."
    );
  }

  const diagnostics:
    RuntimeRecommendationAdaptiveModifierDiagnostics = {
    candidateId,

    fingerprint:
      normalizeOptionalText(
        qualityProfile
          .identity
          .fingerprint
      ),

    profileMatched:
      true,

    confidence:
      qualityProfile.confidence,

    outcome:
      qualityProfile.outcome,

    totalOccurrences,

    status,

    reason,

    modifier:
      finalModifier,

    breakdown,

    signalContributions,

    notes,

    warnings,
  };

  return {
    candidateId,

    modifier:
      finalModifier,

    applied,

    status,

    reason,

    breakdown,

    signalContributions,

    diagnostics,
  };
}

/* ------------------------------------------------------------------ */
/* Neutral Result */
/* ------------------------------------------------------------------ */

type CreateNeutralModifierResultParams = {
  candidateId:
    string;

  qualityProfile:
    RuntimeRecommendationQualityProfile | null;

  status:
    Exclude<
      RuntimeRecommendationAdaptiveModifierStatus,
      "applied" | "neutral-history"
    >;

  reason:
    Exclude<
      RuntimeRecommendationAdaptiveModifierReason,
      | "quality-profile-applied"
      | "quality-history-produced-neutral-modifier"
    >;

  note:
    string;
};

function createNeutralModifierResult({
  candidateId,
  qualityProfile,
  status,
  reason,
  note,
}: CreateNeutralModifierResultParams):
  RuntimeRecommendationAdaptiveModifierResult {
  const breakdown =
    createEmptyModifierBreakdown({
      wasBlocked:
        status ===
        "blocking-candidate-protected",
    });

  const diagnostics:
    RuntimeRecommendationAdaptiveModifierDiagnostics = {
    candidateId,

    fingerprint:
      qualityProfile === null
        ? null
        : normalizeOptionalText(
            qualityProfile
              .identity
              .fingerprint
          ),

    profileMatched:
      qualityProfile !== null,

    confidence:
      qualityProfile?.confidence ??
      null,

    outcome:
      qualityProfile?.outcome ??
      null,

    totalOccurrences:
      qualityProfile === null
        ? 0
        : normalizeNonNegativeInteger(
            qualityProfile
              .features
              .counts
              .totalOccurrences
          ),

    status,

    reason,

    modifier:
      0,

    breakdown,

    signalContributions:
      [],

    notes: [
      note,
    ],

    warnings:
      [],
  };

  return {
    candidateId,

    modifier:
      0,

    applied:
      false,

    status,

    reason,

    breakdown,

    signalContributions:
      [],

    diagnostics,
  };
}

function createEmptyModifierBreakdown({
  wasBlocked,
}: {
  wasBlocked:
    boolean;
}):
  RuntimeRecommendationAdaptiveModifierBreakdown {
  return {
    outcomeModifier:
      0,

    completionModifier:
      0,

    completionEvidenceModifier:
      0,

    navigationModifier:
      0,

    supersededModifier:
      0,

    repetitionModifier:
      0,

    unresolvedModifier:
      0,

    signalModifier:
      0,

    rawModifierBeforeConfidence:
      0,

    confidenceWeight:
      0,

    weightedModifier:
      0,

    finalModifier:
      0,

    wasClamped:
      false,

    wasBlocked,
  };
}

/* ------------------------------------------------------------------ */
/* Outcome Modifier */
/* ------------------------------------------------------------------ */

function resolveOutcomeModifier(
  outcome:
    RuntimeRecommendationQualityOutcome,
  policy:
    RuntimeRecommendationAdaptiveOutcomePolicy
): number {
  switch (
    outcome
  ) {
    case "insufficient-history":
      return policy.insufficientHistory;

    case "effective":
      return policy.effective;

    case "mixed":
      return policy.mixed;

    case "unstable":
      return policy.unstable;

    case "unresolved":
      return policy.unresolved;
  }
}

/* ------------------------------------------------------------------ */
/* Confidence Weight */
/* ------------------------------------------------------------------ */

function resolveConfidenceWeight(
  confidence:
    RuntimeRecommendationQualityConfidence,
  policy:
    RuntimeRecommendationAdaptiveConfidenceWeightPolicy
): number {
  switch (
    confidence
  ) {
    case "unknown":
      return clampUnit(
        policy.unknown
      );

    case "low":
      return clampUnit(
        policy.low
      );

    case "developing":
      return clampUnit(
        policy.developing
      );

    case "established":
      return clampUnit(
        policy.established
      );
  }
}

/* ------------------------------------------------------------------ */
/* Signal Contributions */
/* ------------------------------------------------------------------ */

type CreateSignalContributionsParams = {
  profile:
    RuntimeRecommendationQualityProfile;

  policy:
    RuntimeRecommendationAdaptiveSignalPolicy;
};

function createSignalContributions({
  profile,
  policy,
}: CreateSignalContributionsParams):
  RuntimeRecommendationAdaptiveSignalContribution[] {
  return profile.signals.map(
    (signal) => {
      const normalizedStrength =
        clampUnit(
          signal.strength
        );

      const policyModifier =
        resolveSignalPolicyModifier(
          signal.type,
          policy
        );

      return {
        type:
          signal.type,

        strength:
          normalizedStrength,

        policyModifier,

        contribution:
          roundNumber(
            normalizedStrength *
            policyModifier,
            4
          ),

        description:
          normalizeDescription(
            signal.description
          ),
      };
    }
  );
}

function resolveSignalPolicyModifier(
  type:
    RuntimeRecommendationQualitySignalType,
  policy:
    RuntimeRecommendationAdaptiveSignalPolicy
): number {
  switch (
    type
  ) {
    case "high-completion-rate":
      return policy.highCompletionRate;

    case "completion-observed":
      return policy.completionObserved;

    case "navigation-observed":
      return policy.navigationObserved;

    case "stable-outcome":
      return policy.stableOutcome;

    case "low-completion-rate":
      return policy.lowCompletionRate;

    case "frequently-superseded":
      return policy.frequentlySuperseded;

    case "repeated-recommendation":
      return policy.repeatedRecommendation;

    case "unresolved-recommendation":
      return policy.unresolvedRecommendation;

    case "visited-without-completion":
      return policy.visitedWithoutCompletion;

    case "mixed-outcome":
      return policy.mixedOutcome;

    case "insufficient-occurrences":
      return policy.insufficientOccurrences;
  }
}

/* ------------------------------------------------------------------ */
/* Notes */
/* ------------------------------------------------------------------ */

type CreateAppliedModifierNotesParams = {
  profile:
    RuntimeRecommendationQualityProfile;

  finalModifier:
    number;

  confidenceWeight:
    number;
};

function createAppliedModifierNotes({
  profile,
  finalModifier,
  confidenceWeight,
}: CreateAppliedModifierNotesParams):
  string[] {
  const notes:
    string[] = [];

  notes.push(
    `Quality outcome "${profile.outcome}" was evaluated with "${profile.confidence}" confidence.`
  );

  notes.push(
    `A confidence weight of ${roundNumber(
      confidenceWeight,
      4
    )} was applied.`
  );

  if (
    finalModifier > 0
  ) {
    notes.push(
      `History increased the candidate score by ${finalModifier}.`
    );
  } else if (
    finalModifier < 0
  ) {
    notes.push(
      `History decreased the candidate score by ${Math.abs(
        finalModifier
      )}.`
    );
  } else {
    notes.push(
      "Positive and negative History signals produced a neutral modifier."
    );
  }

  return notes;
}

/* ------------------------------------------------------------------ */
/* Policy Normalization */
/* ------------------------------------------------------------------ */

export function normalizeRuntimeRecommendationAdaptiveModifierPolicy(
  policy?:
    PartialRuntimeRecommendationAdaptiveModifierPolicy
): RuntimeRecommendationAdaptiveModifierPolicy {
  const fallback =
    DEFAULT_RUNTIME_RECOMMENDATION_ADAPTIVE_MODIFIER_POLICY;

  const minimumModifier =
    normalizeFiniteNumber(
      policy
        ?.modifierRange
        ?.minimum,
      fallback
        .modifierRange
        .minimum
    );

  const maximumModifier =
    Math.max(
      minimumModifier,
      normalizeFiniteNumber(
        policy
          ?.modifierRange
          ?.maximum,
        fallback
          .modifierRange
          .maximum
      )
    );

  return {
    modifierRange: {
      minimum:
        minimumModifier,

      maximum:
        maximumModifier,
    },

    confidenceWeight: {
      unknown:
        normalizeUnitPolicyValue(
          policy
            ?.confidenceWeight
            ?.unknown,
          fallback
            .confidenceWeight
            .unknown
        ),

      low:
        normalizeUnitPolicyValue(
          policy
            ?.confidenceWeight
            ?.low,
          fallback
            .confidenceWeight
            .low
        ),

      developing:
        normalizeUnitPolicyValue(
          policy
            ?.confidenceWeight
            ?.developing,
          fallback
            .confidenceWeight
            .developing
        ),

      established:
        normalizeUnitPolicyValue(
          policy
            ?.confidenceWeight
            ?.established,
          fallback
            .confidenceWeight
            .established
        ),
    },

    outcome: {
      ...fallback.outcome,
      ...normalizeFiniteRecord(
        policy?.outcome
      ),
    },

    rates: {
      completionMaximum:
        normalizeNonNegativeNumber(
          policy
            ?.rates
            ?.completionMaximum,
          fallback
            .rates
            .completionMaximum
        ),

      completionEvidenceMaximum:
        normalizeNonNegativeNumber(
          policy
            ?.rates
            ?.completionEvidenceMaximum,
          fallback
            .rates
            .completionEvidenceMaximum
        ),

      navigationMaximum:
        normalizeNonNegativeNumber(
          policy
            ?.rates
            ?.navigationMaximum,
          fallback
            .rates
            .navigationMaximum
        ),

      supersededMaximumPenalty:
        normalizeNonNegativeNumber(
          policy
            ?.rates
            ?.supersededMaximumPenalty,
          fallback
            .rates
            .supersededMaximumPenalty
        ),

      repetitionMaximumPenalty:
        normalizeNonNegativeNumber(
          policy
            ?.rates
            ?.repetitionMaximumPenalty,
          fallback
            .rates
            .repetitionMaximumPenalty
        ),

      unresolvedMaximumPenalty:
        normalizeNonNegativeNumber(
          policy
            ?.rates
            ?.unresolvedMaximumPenalty,
          fallback
            .rates
            .unresolvedMaximumPenalty
        ),
    },

    signals: {
      ...fallback.signals,
      ...normalizeFiniteRecord(
        policy?.signals
      ),
    },

    minimumOccurrences:
      normalizePositiveInteger(
        policy?.minimumOccurrences,
        fallback.minimumOccurrences
      ),

    allowBlockingCandidateModifier:
      typeof policy
        ?.allowBlockingCandidateModifier ===
        "boolean"
        ? policy
            .allowBlockingCandidateModifier
        : fallback
            .allowBlockingCandidateModifier,

    decimalPlaces:
      clampInteger(
        policy?.decimalPlaces,
        fallback.decimalPlaces,
        0,
        8
      ),
  };
}

export function cloneRuntimeRecommendationAdaptiveModifierPolicy(
  policy:
    RuntimeRecommendationAdaptiveModifierPolicy
): RuntimeRecommendationAdaptiveModifierPolicy {
  return {
    modifierRange: {
      ...policy.modifierRange,
    },

    confidenceWeight: {
      ...policy.confidenceWeight,
    },

    outcome: {
      ...policy.outcome,
    },

    rates: {
      ...policy.rates,
    },

    signals: {
      ...policy.signals,
    },

    minimumOccurrences:
      policy.minimumOccurrences,

    allowBlockingCandidateModifier:
      policy.allowBlockingCandidateModifier,

    decimalPlaces:
      policy.decimalPlaces,
  };
}

/* ------------------------------------------------------------------ */
/* Primitive Helpers */
/* ------------------------------------------------------------------ */

function normalizeCandidateId(
  value:
    string
): string {
  const normalized =
    value
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      );

  return normalized.length > 0
    ? normalized
    : "runtime-recommendation-candidate";
}

function normalizeOptionalText(
  value:
    string | null | undefined
): string | null {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const normalized =
    value
      .trim()
      .replace(
        /\s+/g,
        " "
      );

  return normalized.length > 0
    ? normalized
    : null;
}

function normalizeDescription(
  value:
    string
): string {
  return (
    normalizeOptionalText(
      value
    ) ??
    "No quality signal description is available."
  );
}

function normalizeNonNegativeInteger(
  value:
    number
): number {
  if (
    !Number.isFinite(
      value
    )
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(
      value
    )
  );
}

function normalizePositiveInteger(
  value:
    number | undefined,
  fallback:
    number
): number {
  const candidate =
    normalizeFiniteNumber(
      value,
      fallback
    );

  return Math.max(
    1,
    Math.floor(
      candidate
    )
  );
}

function normalizeNonNegativeNumber(
  value:
    number | undefined,
  fallback:
    number
): number {
  return Math.max(
    0,
    normalizeFiniteNumber(
      value,
      fallback
    )
  );
}

function normalizeUnitPolicyValue(
  value:
    number | undefined,
  fallback:
    number
): number {
  return clampUnit(
    normalizeFiniteNumber(
      value,
      fallback
    )
  );
}

function normalizeFiniteNumber(
  value:
    number | null | undefined,
  fallback:
    number
): number {
  return (
    typeof value ===
      "number" &&
    Number.isFinite(
      value
    )
  )
    ? value
    : fallback;
}

function normalizeFiniteRecord<
  T extends Record<
    string,
    number
  >,
>(
  value:
    Partial<T> | undefined
): Partial<T> {
  if (
    value === undefined
  ) {
    return {};
  }

  const result:
    Partial<T> = {};

  for (
    const [
      key,
      candidate,
    ] of
    Object.entries(
      value
    )
  ) {
    if (
      typeof candidate ===
        "number" &&
      Number.isFinite(
        candidate
      )
    ) {
      (
        result as
          Record<
            string,
            number
          >
      )[
        key
      ] =
        candidate;
    }
  }

  return result;
}

function clampUnit(
  value:
    number
): number {
  return clampNumber(
    normalizeFiniteNumber(
      value,
      0
    ),
    0,
    1
  );
}

function clampNumber(
  value:
    number,
  minimum:
    number,
  maximum:
    number
): number {
  return Math.min(
    maximum,
    Math.max(
      minimum,
      value
    )
  );
}

function clampInteger(
  value:
    number | undefined,
  fallback:
    number,
  minimum:
    number,
  maximum:
    number
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

function roundNumber(
  value:
    number,
  decimalPlaces:
    number
): number {
  if (
    !Number.isFinite(
      value
    )
  ) {
    return 0;
  }

  const safeDecimalPlaces =
    Math.max(
      0,
      Math.min(
        8,
        Math.floor(
          decimalPlaces
        )
      )
    );

  const multiplier =
    10 **
    safeDecimalPlaces;

  return (
    Math.round(
      value *
      multiplier
    ) /
    multiplier
  );
}