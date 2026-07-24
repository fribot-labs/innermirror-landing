import type {
    RuntimeNextAction,
    RuntimeNextActionConfidence,
    RuntimeNextActionSource,
} from "../runtime-next-action/runtimeNextActionTypes";

/* ------------------------------------------------------------------ */
/* Candidate Types */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Candidate가 담당하는 구조적 역할입니다.
 *
 * UI 표시용 값이 아니라 Base Scoring과 Diagnostics에 사용합니다.
 */
export type RuntimeRecommendationCandidateCategory =
  | "context-recovery"
  | "reflection"
  | "project-stabilization"
  | "project-direction"
  | "project-review"
  | "continuity"
  | "fallback";

/**
 * Recommendation 문구가 현재 상황을 얼마나 구체적으로 설명하는지
 * 나타내는 값입니다.
 */
export type RuntimeRecommendationSpecificity =
  | "low"
  | "medium"
  | "high";

/**
 * Candidate를 생성한 구조적 규칙입니다.
 *
 * 이후 createRuntimeRecommendationCandidates.ts에서 이 타입을
 * 재사용합니다.
 */
export type RuntimeRecommendationCandidateRule =
  | "missing-project"
  | "missing-repository"
  | "missing-reflection"
  | "missing-github-context"
  | "reflection-draft"
  | "combined-analysis"
  | "recommended-focus"
  | "adaptive-coaching"
  | "decision-review"
  | "next-question"
  | "next-interpretation"
  | "continuity"
  | "current-focus"
  | "fallback";

/**
 * Candidate 생성 당시의 Runtime Context입니다.
 *
 * Base Score에서 작은 Context Alignment Modifier를 계산할 때
 * 사용합니다.
 */
export type RuntimeRecommendationCandidateContext = {
  hasProject:
    boolean;

  hasRepository:
    boolean;

  hasReflectionDraft:
    boolean;

  hasGitHubSnapshot:
    boolean;

  hasCurrentFocus:
    boolean;

  hasRecommendedFocus:
    boolean;

  hasNextInterpretation:
    boolean;

  hasAdaptiveCoaching:
    boolean;

  hasDecisionReviewQuestion:
    boolean;

  hasNextQuestion:
    boolean;

  recentCommitCount:
    number;

  recentPullRequestCount:
    number;

  reflectionCount:
    number;

  connectedEventCount:
    number;
};

/**
 * PR-046C Candidate Layer의 기본 단위입니다.
 *
 * 이 타입은 아직 Adaptive Score를 포함하지 않습니다.
 */
export type RuntimeRecommendationCandidate = {
  /**
   * 문구 변경에 영향을 받지 않는 안정적인 Candidate ID입니다.
   */
  id:
    string;

  /**
   * 동일 점수에서 결정적인 tie-breaker로 사용합니다.
   */
  generationOrder:
    number;

  rule:
    RuntimeRecommendationCandidateRule;

  category:
    RuntimeRecommendationCandidateCategory;

  action:
    RuntimeNextAction;

  /**
   * 기존 Recommendation 우선순위를 수치로 표현합니다.
   *
   * 권장 범위는 0~1000입니다.
   */
  basePriority:
    number;

  /**
   * 선행 조건 복구 Recommendation인지 나타냅니다.
   */
  isBlocking:
    boolean;

  specificity:
    RuntimeRecommendationSpecificity;

  context:
    RuntimeRecommendationCandidateContext;
};

/* ------------------------------------------------------------------ */
/* Score Policy Types */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationCandidateScoreRange = {
  minimum:
    number;

  maximum:
    number;
};

export type RuntimeRecommendationPriorityScorePolicy = {
  sourceMinimum:
    number;

  sourceMaximum:
    number;

  targetMinimum:
    number;

  targetMaximum:
    number;
};

export type RuntimeRecommendationConfidenceScorePolicy = {
  high:
    number;

  medium:
    number;

  low:
    number;

  unknown:
    number;
};

export type RuntimeRecommendationActionabilityScorePolicy = {
  actionable:
    number;

  notActionable:
    number;
};

export type RuntimeRecommendationSourceScorePolicy = {
  recommendedFocus:
    number;

  nextInterpretation:
    number;

  adaptiveCoaching:
    number;

  decisionReview:
    number;

  nextQuestion:
    number;

  projectState:
    number;

  fallback:
    number;

  unknown:
    number;
};

export type RuntimeRecommendationSpecificityScorePolicy = {
  high:
    number;

  medium:
    number;

  low:
    number;
};

export type RuntimeRecommendationCategoryScorePolicy = {
  contextRecovery:
    number;

  reflection:
    number;

  projectStabilization:
    number;

  projectDirection:
    number;

  projectReview:
    number;

  continuity:
    number;

  fallback:
    number;
};

export type RuntimeRecommendationContextScorePolicy = {
  reflectionDraftAlignment:
    number;

  githubContextAlignment:
    number;

  currentFocusAlignment:
    number;

  runtimeSignalAlignment:
    number;

  connectedHistoryAlignment:
    number;
};

export type RuntimeRecommendationBlockingScorePolicy = {
  modifier:
    number;

  minimumScore:
    number;
};

export type RuntimeRecommendationCandidateScorePolicy = {
  scoreRange:
    RuntimeRecommendationCandidateScoreRange;

  priority:
    RuntimeRecommendationPriorityScorePolicy;

  confidence:
    RuntimeRecommendationConfidenceScorePolicy;

  actionability:
    RuntimeRecommendationActionabilityScorePolicy;

  source:
    RuntimeRecommendationSourceScorePolicy;

  specificity:
    RuntimeRecommendationSpecificityScorePolicy;

  category:
    RuntimeRecommendationCategoryScorePolicy;

  context:
    RuntimeRecommendationContextScorePolicy;

  blocking:
    RuntimeRecommendationBlockingScorePolicy;

  decimalPlaces:
    number;
};

export type PartialRuntimeRecommendationCandidateScorePolicy = {
  scoreRange?:
    Partial<RuntimeRecommendationCandidateScoreRange>;

  priority?:
    Partial<RuntimeRecommendationPriorityScorePolicy>;

  confidence?:
    Partial<RuntimeRecommendationConfidenceScorePolicy>;

  actionability?:
    Partial<RuntimeRecommendationActionabilityScorePolicy>;

  source?:
    Partial<RuntimeRecommendationSourceScorePolicy>;

  specificity?:
    Partial<RuntimeRecommendationSpecificityScorePolicy>;

  category?:
    Partial<RuntimeRecommendationCategoryScorePolicy>;

  context?:
    Partial<RuntimeRecommendationContextScorePolicy>;

  blocking?:
    Partial<RuntimeRecommendationBlockingScorePolicy>;

  decimalPlaces?:
    number;
};

/* ------------------------------------------------------------------ */
/* Default Policy */
/* ------------------------------------------------------------------ */

/**
 * Base Priority가 가장 강한 결정 요소가 되도록 구성된
 * PR-046C Shadow Mode 기본 정책입니다.
 */
export const DEFAULT_RUNTIME_RECOMMENDATION_CANDIDATE_SCORE_POLICY:
  RuntimeRecommendationCandidateScorePolicy = {
  scoreRange: {
    minimum:
      0,

    maximum:
      100,
  },

  priority: {
    sourceMinimum:
      0,

    sourceMaximum:
      1000,

    targetMinimum:
      0,

    targetMaximum:
      88,
  },

  confidence: {
    high:
      3,

    medium:
      2,

    low:
      0,

    unknown:
      0,
  },

  actionability: {
    actionable:
      2,

    notActionable:
      0,
  },

  source: {
    recommendedFocus:
      1.5,

    nextInterpretation:
      0.5,

    adaptiveCoaching:
      1,

    decisionReview:
      1,

    nextQuestion:
      0.75,

    projectState:
      1,

    fallback:
      0,

    unknown:
      0,
  },

  specificity: {
    high:
      1.5,

    medium:
      0.75,

    low:
      0,
  },

  category: {
    contextRecovery:
      1,

    reflection:
      0.75,

    projectStabilization:
      1,

    projectDirection:
      0.5,

    projectReview:
      0.75,

    continuity:
      0.25,

    fallback:
      0,
  },

  context: {
    reflectionDraftAlignment:
      1.5,

    githubContextAlignment:
      1.5,

    currentFocusAlignment:
      1,

    runtimeSignalAlignment:
      1,

    connectedHistoryAlignment:
      0.5,
  },

  blocking: {
    modifier:
      2,

    minimumScore:
      90,
  },

  decimalPlaces:
    4,
};

/* ------------------------------------------------------------------ */
/* Score Result Types */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationContextScoreBreakdown = {
  reflectionDraftAlignment:
    number;

  githubContextAlignment:
    number;

  currentFocusAlignment:
    number;

  runtimeSignalAlignment:
    number;

  connectedHistoryAlignment:
    number;

  total:
    number;

  reasons:
    string[];
};

export type RuntimeRecommendationScoreBreakdown = {
  originalBasePriority:
    number;

  structuralPriorityScore:
    number;

  confidenceModifier:
    number;

  actionabilityModifier:
    number;

  sourceModifier:
    number;

  specificityModifier:
    number;

  categoryModifier:
    number;

  contextModifier:
    number;

  blockingModifier:
    number;

  rawScore:
    number;

  protectedScore:
    number;

  finalScore:
    number;

  wasBlockingMinimumApplied:
    boolean;

  wasScoreClamped:
    boolean;
};

export type RuntimeRecommendationScoredCandidate = {
  candidate:
    RuntimeRecommendationCandidate;

  candidateId:
    string;

  baseScore:
    number;

  scoreBreakdown:
    RuntimeRecommendationScoreBreakdown;

  contextBreakdown:
    RuntimeRecommendationContextScoreBreakdown;
};

export type RuntimeRecommendationCandidateScoreDiagnostic = {
  candidateId:
    string;

  generationOrder:
    number;

  rule:
    RuntimeRecommendationCandidateRule;

  category:
    RuntimeRecommendationCandidateCategory;

  kind:
    RuntimeNextAction["kind"];

  target:
    RuntimeNextAction["target"];

  source:
    RuntimeNextAction["source"];

  confidence:
    RuntimeNextAction["confidence"];

  specificity:
    RuntimeRecommendationSpecificity;

  isBlocking:
    boolean;

  originalBasePriority:
    number;

  baseScore:
    number;

  scoreBreakdown:
    RuntimeRecommendationScoreBreakdown;

  contextBreakdown:
    RuntimeRecommendationContextScoreBreakdown;

  warnings:
    string[];
};

export type RuntimeRecommendationCandidateScoringDiagnostics = {
  generatedAt:
    string;

  candidateCount:
    number;

  blockingCandidateCount:
    number;

  minimumScore:
    number | null;

  maximumScore:
    number | null;

  averageScore:
    number | null;

  candidates:
    RuntimeRecommendationCandidateScoreDiagnostic[];

  warnings:
    string[];
};

export type CreateRuntimeRecommendationCandidateScoreParams = {
  candidate:
    RuntimeRecommendationCandidate;

  policy?:
    PartialRuntimeRecommendationCandidateScorePolicy;
};

export type CreateRuntimeRecommendationCandidateScoresParams = {
  candidates:
    RuntimeRecommendationCandidate[];

  policy?:
    PartialRuntimeRecommendationCandidateScorePolicy;

  generatedAt?:
    string;
};

export type CreateRuntimeRecommendationCandidateScoresResult = {
  scoredCandidates:
    RuntimeRecommendationScoredCandidate[];

  diagnostics:
    RuntimeRecommendationCandidateScoringDiagnostics;

  policy:
    RuntimeRecommendationCandidateScorePolicy;
};

/* ------------------------------------------------------------------ */
/* Public API */
/* ------------------------------------------------------------------ */

export function createRuntimeRecommendationCandidateScore({
  candidate,
  policy,
}: CreateRuntimeRecommendationCandidateScoreParams):
  RuntimeRecommendationScoredCandidate {
  const normalizedPolicy =
    normalizeRuntimeRecommendationCandidateScorePolicy(
      policy
    );

  return createRuntimeRecommendationCandidateScoreWithPolicy({
    candidate,

    policy:
      normalizedPolicy,
  });
}

export function createRuntimeRecommendationCandidateScores({
  candidates,
  policy,
  generatedAt,
}: CreateRuntimeRecommendationCandidateScoresParams):
  CreateRuntimeRecommendationCandidateScoresResult {
  const normalizedPolicy =
    normalizeRuntimeRecommendationCandidateScorePolicy(
      policy
    );

  const scoredCandidates =
    candidates.map(
      (candidate) =>
        createRuntimeRecommendationCandidateScoreWithPolicy({
          candidate,

          policy:
            normalizedPolicy,
        })
    );

  return {
    scoredCandidates,

    diagnostics:
      createRuntimeRecommendationCandidateScoringDiagnostics({
        scoredCandidates,

        generatedAt:
          normalizeGeneratedAt(
            generatedAt
          ),
      }),

    policy:
      normalizedPolicy,
  };
}

/* ------------------------------------------------------------------ */
/* Score Builder */
/* ------------------------------------------------------------------ */

type CreateRuntimeRecommendationCandidateScoreWithPolicyParams = {
  candidate:
    RuntimeRecommendationCandidate;

  policy:
    RuntimeRecommendationCandidateScorePolicy;
};

function createRuntimeRecommendationCandidateScoreWithPolicy({
  candidate,
  policy,
}: CreateRuntimeRecommendationCandidateScoreWithPolicyParams):
  RuntimeRecommendationScoredCandidate {
  const structuralPriorityScore =
    normalizeRuntimeRecommendationPriorityScore({
      basePriority:
        candidate.basePriority,

      policy:
        policy.priority,
    });

  const confidenceModifier =
    resolveRuntimeRecommendationConfidenceModifier(
      candidate.action.confidence,
      policy.confidence
    );

  const actionabilityModifier =
    candidate.action.isActionable
      ? policy.actionability.actionable
      : policy.actionability.notActionable;

  const sourceModifier =
    resolveRuntimeRecommendationSourceModifier(
      candidate.action.source,
      policy.source
    );

  const specificityModifier =
    resolveRuntimeRecommendationSpecificityModifier(
      candidate.specificity,
      policy.specificity
    );

  const categoryModifier =
    resolveRuntimeRecommendationCategoryModifier(
      candidate.category,
      policy.category
    );

  const contextBreakdown =
    resolveRuntimeRecommendationContextScore({
      candidate,

      policy:
        policy.context,
    });

  const blockingModifier =
    candidate.isBlocking
      ? policy.blocking.modifier
      : 0;

  const rawScore =
    structuralPriorityScore +
    confidenceModifier +
    actionabilityModifier +
    sourceModifier +
    specificityModifier +
    categoryModifier +
    contextBreakdown.total +
    blockingModifier;

  const wasBlockingMinimumApplied =
    candidate.isBlocking &&
    rawScore < policy.blocking.minimumScore;

  const protectedScore =
    wasBlockingMinimumApplied
      ? policy.blocking.minimumScore
      : rawScore;

  const finalScore =
    normalizeRuntimeRecommendationFinalScore({
      score:
        protectedScore,

      range:
        policy.scoreRange,

      decimalPlaces:
        policy.decimalPlaces,
    });

  const roundedProtectedScore =
    roundNumber(
      protectedScore,
      policy.decimalPlaces
    );

  const scoreBreakdown:
    RuntimeRecommendationScoreBreakdown = {
    originalBasePriority:
      candidate.basePriority,

    structuralPriorityScore,

    confidenceModifier,

    actionabilityModifier,

    sourceModifier,

    specificityModifier,

    categoryModifier,

    contextModifier:
      contextBreakdown.total,

    blockingModifier,

    rawScore:
      roundNumber(
        rawScore,
        policy.decimalPlaces
      ),

    protectedScore:
      roundedProtectedScore,

    finalScore,

    wasBlockingMinimumApplied,

    wasScoreClamped:
      finalScore !==
      roundedProtectedScore,
  };

  return {
    candidate,

    candidateId:
      candidate.id,

    baseScore:
      finalScore,

    scoreBreakdown,

    contextBreakdown,
  };
}

/* ------------------------------------------------------------------ */
/* Priority Score */
/* ------------------------------------------------------------------ */

type NormalizeRuntimeRecommendationPriorityScoreParams = {
  basePriority:
    number;

  policy:
    RuntimeRecommendationPriorityScorePolicy;
};

function normalizeRuntimeRecommendationPriorityScore({
  basePriority,
  policy,
}: NormalizeRuntimeRecommendationPriorityScoreParams):
  number {
  const normalizedPriority =
    clampNumber(
      normalizeFiniteNumber(
        basePriority,
        policy.sourceMinimum
      ),
      policy.sourceMinimum,
      policy.sourceMaximum
    );

  const sourceSpan =
    policy.sourceMaximum -
    policy.sourceMinimum;

  const targetSpan =
    policy.targetMaximum -
    policy.targetMinimum;

  if (
    sourceSpan <= 0
  ) {
    return policy.targetMinimum;
  }

  const ratio =
    (
      normalizedPriority -
      policy.sourceMinimum
    ) /
    sourceSpan;

  return roundNumber(
    policy.targetMinimum +
      ratio *
        targetSpan,
    4
  );
}

/* ------------------------------------------------------------------ */
/* Confidence Modifier */
/* ------------------------------------------------------------------ */

function resolveRuntimeRecommendationConfidenceModifier(
  confidence:
    RuntimeNextActionConfidence | null | undefined,
  policy:
    RuntimeRecommendationConfidenceScorePolicy
): number {
  switch (
    confidence
  ) {
    case "high":
      return policy.high;

    case "medium":
      return policy.medium;

    case "low":
      return policy.low;

    default:
      return policy.unknown;
  }
}

/* ------------------------------------------------------------------ */
/* Source Modifier */
/* ------------------------------------------------------------------ */

function resolveRuntimeRecommendationSourceModifier(
  source:
    RuntimeNextActionSource | null | undefined,
  policy:
    RuntimeRecommendationSourceScorePolicy
): number {
  switch (
    source
  ) {
    case "recommended-focus":
      return policy.recommendedFocus;

    case "next-interpretation":
      return policy.nextInterpretation;

    case "adaptive-coaching":
      return policy.adaptiveCoaching;

    case "decision-review":
      return policy.decisionReview;

    case "next-question":
      return policy.nextQuestion;

    case "project-state":
      return policy.projectState;

    case "fallback":
      return policy.fallback;

    default:
      return policy.unknown;
  }
}

/* ------------------------------------------------------------------ */
/* Specificity Modifier */
/* ------------------------------------------------------------------ */

function resolveRuntimeRecommendationSpecificityModifier(
  specificity:
    RuntimeRecommendationSpecificity,
  policy:
    RuntimeRecommendationSpecificityScorePolicy
): number {
  switch (
    specificity
  ) {
    case "high":
      return policy.high;

    case "medium":
      return policy.medium;

    case "low":
    default:
      return policy.low;
  }
}

/* ------------------------------------------------------------------ */
/* Category Modifier */
/* ------------------------------------------------------------------ */

function resolveRuntimeRecommendationCategoryModifier(
  category:
    RuntimeRecommendationCandidateCategory,
  policy:
    RuntimeRecommendationCategoryScorePolicy
): number {
  switch (
    category
  ) {
    case "context-recovery":
      return policy.contextRecovery;

    case "reflection":
      return policy.reflection;

    case "project-stabilization":
      return policy.projectStabilization;

    case "project-direction":
      return policy.projectDirection;

    case "project-review":
      return policy.projectReview;

    case "continuity":
      return policy.continuity;

    case "fallback":
    default:
      return policy.fallback;
  }
}

/* ------------------------------------------------------------------ */
/* Context Modifier */
/* ------------------------------------------------------------------ */

type ResolveRuntimeRecommendationContextScoreParams = {
  candidate:
    RuntimeRecommendationCandidate;

  policy:
    RuntimeRecommendationContextScorePolicy;
};

function resolveRuntimeRecommendationContextScore({
  candidate,
  policy,
}: ResolveRuntimeRecommendationContextScoreParams):
  RuntimeRecommendationContextScoreBreakdown {
  const reasons:
    string[] = [];

  let reflectionDraftAlignment =
    0;

  let githubContextAlignment =
    0;

  let currentFocusAlignment =
    0;

  let runtimeSignalAlignment =
    0;

  let connectedHistoryAlignment =
    0;

  if (
    candidate.context.hasReflectionDraft &&
    isReflectionCandidate(
      candidate
    )
  ) {
    reflectionDraftAlignment =
      policy.reflectionDraftAlignment;

    reasons.push(
      "Candidate aligns with the current reflection draft."
    );
  }

  if (
    candidate.context.hasGitHubSnapshot &&
    isGitHubContextCandidate(
      candidate
    )
  ) {
    githubContextAlignment =
      policy.githubContextAlignment;

    reasons.push(
      "Candidate aligns with the available GitHub context."
    );
  }

  if (
    candidate.context.hasCurrentFocus &&
    isCurrentFocusCandidate(
      candidate
    )
  ) {
    currentFocusAlignment =
      policy.currentFocusAlignment;

    reasons.push(
      "Candidate aligns with the current project focus."
    );
  }

  if (
    hasMatchingRuntimeSignal(
      candidate
    )
  ) {
    runtimeSignalAlignment =
      policy.runtimeSignalAlignment;

    reasons.push(
      "Candidate aligns with an available Runtime signal."
    );
  }

  if (
    candidate.context.connectedEventCount > 0 &&
    isContinuityCandidate(
      candidate
    )
  ) {
    connectedHistoryAlignment =
      policy.connectedHistoryAlignment;

    reasons.push(
      "Candidate aligns with connected project history."
    );
  }

  const total =
    reflectionDraftAlignment +
    githubContextAlignment +
    currentFocusAlignment +
    runtimeSignalAlignment +
    connectedHistoryAlignment;

  return {
    reflectionDraftAlignment,

    githubContextAlignment,

    currentFocusAlignment,

    runtimeSignalAlignment,

    connectedHistoryAlignment,

    total:
      roundNumber(
        total,
        4
      ),

    reasons,
  };
}

function isReflectionCandidate(
  candidate:
    RuntimeRecommendationCandidate
): boolean {
  return (
    candidate.category ===
      "reflection" ||
    candidate.action.kind ===
      "write-reflection" ||
    candidate.action.kind ===
      "analyze-reflection-with-github"
  );
}

function isGitHubContextCandidate(
  candidate:
    RuntimeRecommendationCandidate
): boolean {
  return (
    candidate.action.kind ===
      "analyze-github" ||
    candidate.action.kind ===
      "analyze-reflection-with-github" ||
    candidate.action.target ===
      "github-analysis" ||
    candidate.action.target ===
      "combined-analysis"
  );
}

function isCurrentFocusCandidate(
  candidate:
    RuntimeRecommendationCandidate
): boolean {
  return (
    candidate.category ===
      "project-stabilization" ||
    candidate.category ===
      "project-direction" ||
    candidate.category ===
      "project-review" ||
    candidate.action.target ===
      "current-focus"
  );
}

function isContinuityCandidate(
  candidate:
    RuntimeRecommendationCandidate
): boolean {
  return (
    candidate.category ===
      "continuity" ||
    candidate.action.target ===
      "project-timeline"
  );
}

function hasMatchingRuntimeSignal(
  candidate:
    RuntimeRecommendationCandidate
): boolean {
  switch (
    candidate.action.source
  ) {
    case "recommended-focus":
      return candidate.context.hasRecommendedFocus;

    case "next-interpretation":
      return candidate.context.hasNextInterpretation;

    case "adaptive-coaching":
      return candidate.context.hasAdaptiveCoaching;

    case "decision-review":
      return candidate.context.hasDecisionReviewQuestion;

    case "next-question":
      return candidate.context.hasNextQuestion;

    case "project-state":
      return (
        candidate.context.hasCurrentFocus ||
        candidate.context.hasGitHubSnapshot
      );

    case "fallback":
    default:
      return false;
  }
}

/* ------------------------------------------------------------------ */
/* Final Score */
/* ------------------------------------------------------------------ */

type NormalizeRuntimeRecommendationFinalScoreParams = {
  score:
    number;

  range:
    RuntimeRecommendationCandidateScoreRange;

  decimalPlaces:
    number;
};

function normalizeRuntimeRecommendationFinalScore({
  score,
  range,
  decimalPlaces,
}: NormalizeRuntimeRecommendationFinalScoreParams):
  number {
  return roundNumber(
    clampNumber(
      normalizeFiniteNumber(
        score,
        range.minimum
      ),
      range.minimum,
      range.maximum
    ),
    decimalPlaces
  );
}

/* ------------------------------------------------------------------ */
/* Diagnostics */
/* ------------------------------------------------------------------ */

type CreateRuntimeRecommendationCandidateScoringDiagnosticsParams = {
  scoredCandidates:
    RuntimeRecommendationScoredCandidate[];

  generatedAt:
    string;
};

function createRuntimeRecommendationCandidateScoringDiagnostics({
  scoredCandidates,
  generatedAt,
}: CreateRuntimeRecommendationCandidateScoringDiagnosticsParams):
  RuntimeRecommendationCandidateScoringDiagnostics {
  const diagnostics =
    scoredCandidates.map(
      createRuntimeRecommendationCandidateScoreDiagnostic
    );

  const scores =
    scoredCandidates.map(
      (candidate) =>
        candidate.baseScore
    );

  const warnings:
    string[] = [];

  if (
    scoredCandidates.length === 0
  ) {
    warnings.push(
      "No recommendation candidates were available for scoring."
    );
  }

  if (
    hasDuplicateCandidateIds(
      scoredCandidates
    )
  ) {
    warnings.push(
      "Duplicate recommendation candidate IDs were detected."
    );
  }

  return {
    generatedAt,

    candidateCount:
      scoredCandidates.length,

    blockingCandidateCount:
      scoredCandidates.filter(
        ({ candidate }) =>
          candidate.isBlocking
      ).length,

    minimumScore:
      scores.length > 0
        ? Math.min(
            ...scores
          )
        : null,

    maximumScore:
      scores.length > 0
        ? Math.max(
            ...scores
          )
        : null,

    averageScore:
      scores.length > 0
        ? roundNumber(
            scores.reduce(
              (
                total,
                score
              ) =>
                total +
                score,
              0
            ) /
              scores.length,
            4
          )
        : null,

    candidates:
      diagnostics,

    warnings,
  };
}

function createRuntimeRecommendationCandidateScoreDiagnostic(
  scoredCandidate:
    RuntimeRecommendationScoredCandidate
): RuntimeRecommendationCandidateScoreDiagnostic {
  const {
    candidate,
    baseScore,
    scoreBreakdown,
    contextBreakdown,
  } =
    scoredCandidate;

  const warnings:
    string[] = [];

  if (
    candidate.basePriority < 0
  ) {
    warnings.push(
      "Candidate base priority was below zero."
    );
  }

  if (
    candidate.isBlocking &&
    !scoreBreakdown.wasBlockingMinimumApplied &&
    baseScore <
      DEFAULT_RUNTIME_RECOMMENDATION_CANDIDATE_SCORE_POLICY
        .blocking.minimumScore
  ) {
    warnings.push(
      "Blocking candidate score is below the default protected minimum."
    );
  }

  if (
    scoreBreakdown.wasScoreClamped
  ) {
    warnings.push(
      "Candidate score was clamped to the configured score range."
    );
  }

  return {
    candidateId:
      candidate.id,

    generationOrder:
      candidate.generationOrder,

    rule:
      candidate.rule,

    category:
      candidate.category,

    kind:
      candidate.action.kind,

    target:
      candidate.action.target,

    source:
      candidate.action.source,

    confidence:
      candidate.action.confidence,

    specificity:
      candidate.specificity,

    isBlocking:
      candidate.isBlocking,

    originalBasePriority:
      candidate.basePriority,

    baseScore,

    scoreBreakdown,

    contextBreakdown,

    warnings,
  };
}

function hasDuplicateCandidateIds(
  scoredCandidates:
    RuntimeRecommendationScoredCandidate[]
): boolean {
  const candidateIds =
    scoredCandidates.map(
      ({ candidateId }) =>
        candidateId
    );

  return (
    new Set(
      candidateIds
    ).size !==
    candidateIds.length
  );
}

/* ------------------------------------------------------------------ */
/* Policy Normalization */
/* ------------------------------------------------------------------ */

export function normalizeRuntimeRecommendationCandidateScorePolicy(
  policy?:
    PartialRuntimeRecommendationCandidateScorePolicy
): RuntimeRecommendationCandidateScorePolicy {
  const fallback =
    DEFAULT_RUNTIME_RECOMMENDATION_CANDIDATE_SCORE_POLICY;

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

  const sourceMinimum =
    normalizeFiniteNumber(
      policy?.priority?.sourceMinimum,
      fallback.priority.sourceMinimum
    );

  const sourceMaximum =
    Math.max(
      sourceMinimum,
      normalizeFiniteNumber(
        policy?.priority?.sourceMaximum,
        fallback.priority.sourceMaximum
      )
    );

  const targetMinimum =
    normalizeFiniteNumber(
      policy?.priority?.targetMinimum,
      fallback.priority.targetMinimum
    );

  const targetMaximum =
    Math.max(
      targetMinimum,
      normalizeFiniteNumber(
        policy?.priority?.targetMaximum,
        fallback.priority.targetMaximum
      )
    );

  return {
    scoreRange: {
      minimum:
        minimumScore,

      maximum:
        maximumScore,
    },

    priority: {
      sourceMinimum,

      sourceMaximum,

      targetMinimum,

      targetMaximum,
    },

    confidence: {
      ...fallback.confidence,
      ...policy?.confidence,
    },

    actionability: {
      ...fallback.actionability,
      ...policy?.actionability,
    },

    source: {
      ...fallback.source,
      ...policy?.source,
    },

    specificity: {
      ...fallback.specificity,
      ...policy?.specificity,
    },

    category: {
      ...fallback.category,
      ...policy?.category,
    },

    context: {
      ...fallback.context,
      ...policy?.context,
    },

    blocking: {
      modifier:
        normalizeFiniteNumber(
          policy?.blocking?.modifier,
          fallback.blocking.modifier
        ),

      minimumScore:
        clampNumber(
          normalizeFiniteNumber(
            policy?.blocking?.minimumScore,
            fallback.blocking.minimumScore
          ),
          minimumScore,
          maximumScore
        ),
    },

    decimalPlaces:
      clampInteger(
        policy?.decimalPlaces,
        fallback.decimalPlaces,
        0,
        8
      ),
  };
}

export function cloneRuntimeRecommendationCandidateScorePolicy(
  policy:
    RuntimeRecommendationCandidateScorePolicy
): RuntimeRecommendationCandidateScorePolicy {
  return {
    scoreRange: {
      ...policy.scoreRange,
    },

    priority: {
      ...policy.priority,
    },

    confidence: {
      ...policy.confidence,
    },

    actionability: {
      ...policy.actionability,
    },

    source: {
      ...policy.source,
    },

    specificity: {
      ...policy.specificity,
    },

    category: {
      ...policy.category,
    },

    context: {
      ...policy.context,
    },

    blocking: {
      ...policy.blocking,
    },

    decimalPlaces:
      policy.decimalPlaces,
  };
}

/* ------------------------------------------------------------------ */
/* Primitive Helpers */
/* ------------------------------------------------------------------ */

function normalizeGeneratedAt(
  value:
    string | undefined
): string {
  if (
    typeof value ===
      "string" &&
    !Number.isNaN(
      Date.parse(
        value
      )
    )
  ) {
    return new Date(
      value
    ).toISOString();
  }

  return new Date().toISOString();
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
  const safeDecimalPlaces =
    clampInteger(
      decimalPlaces,
      4,
      0,
      8
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