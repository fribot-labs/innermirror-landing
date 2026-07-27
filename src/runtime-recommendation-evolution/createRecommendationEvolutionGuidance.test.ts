import {
    describe,
    expect,
    it,
} from "vitest";

import {
    createRecommendationEvolutionGuidance,
} from "./createRecommendationEvolutionGuidance";

import type {
    RecommendationEvolutionGuidanceTone,
    RecommendationEvolutionIntelligenceAssessment,
    RecommendationEvolutionIntelligenceSignal,
    RecommendationEvolutionIntelligenceSignalConfidence,
    RecommendationEvolutionIntelligenceSignalSeverity,
    RecommendationEvolutionIntelligenceSignalType,
    RecommendationEvolutionIntelligenceState,
    RecommendationEvolutionRuntimeDecision,
    RecommendationEvolutionRuntimeDecisionType,
    RecommendationEvolutionStrategy,
    RecommendationEvolutionStrategyPriority,
    RecommendationEvolutionStrategyType,
} from "./recommendationEvolutionIntelligenceTypes";

/* ------------------------------------------------------------------ */
/* Fixtures                                                           */
/* ------------------------------------------------------------------ */

const CREATED_AT =
  "2026-07-27T02:00:00.000Z";

type AssessmentOverrides =
  Partial<
    RecommendationEvolutionIntelligenceAssessment
  >;

function createAssessment(
  overrides:
    AssessmentOverrides = {},
): RecommendationEvolutionIntelligenceAssessment {
  return {
    state:
      "observing",

    confidence:
      "medium",

    scores: {
      stability:
        0.5,

      progress:
        0.3,

      repetitionRisk:
        0.2,

      redirectionRisk:
        0.2,

      completionMomentum:
        0.2,
    },

    primarySignalType:
      null,

    needsObservation:
      false,

    shouldMaintainCurrentRecommendation:
      false,

    shouldRefineRecommendation:
      false,

    shouldConfirmCompletion:
      false,

    shouldStabilizeDirection:
      false,

    reasoning: [
      "Assessment reasoning.",
    ],

    ...overrides,
  };
}

type StrategyOverrides =
  Partial<
    RecommendationEvolutionStrategy
  >;

function createStrategy(
  overrides:
    StrategyOverrides = {},
): RecommendationEvolutionStrategy {
  return {
    type:
      "observe",

    priority:
      "low",

    sourceState:
      "observing",

    primarySignalType:
      null,

    decisions: {
      shouldGenerateNewRecommendation:
        false,

      shouldPreserveCurrentRecommendation:
        true,

      shouldRequestProgressEvidence:
        true,

      shouldRequestCompletionConfirmation:
        false,

      shouldReduceDirectionChanges:
        false,

      shouldNarrowCurrentRecommendation:
        false,

      shouldClarifyCurrentRecommendation:
        true,

      shouldReconsiderCurrentRecommendation:
        false,
    },

    rationale: [
      "Strategy rationale.",
    ],

    relatedSignalIds:
      [],

    resolvedAt:
      CREATED_AT,

    ...overrides,
  };
}

type CreateSignalParams = {
  id?:
    string;

  type:
    RecommendationEvolutionIntelligenceSignalType;

  severity?:
    RecommendationEvolutionIntelligenceSignalSeverity;

  confidence?:
    RecommendationEvolutionIntelligenceSignalConfidence;

  score?:
    number;
};

function createSignal(
  params:
    CreateSignalParams,
): RecommendationEvolutionIntelligenceSignal {
  return {
    id:
      params.id ??
      `signal-${params.type}`,

    type:
      params.type,

    severity:
      params.severity ??
      "moderate",

    confidence:
      params.confidence ??
      "high",

    score:
      params.score ??
      0.8,

    title:
      `Signal ${params.type}`,

    description:
      `Description for ${params.type}`,

    evidence:
      [],

    relatedComparisonIds:
      [],

    detectedAt:
      CREATED_AT,
  };
}

type CreateRuntimeDecisionParams = {
  id?:
    string;

  type:
    RecommendationEvolutionRuntimeDecisionType;

  priority?:
    RecommendationEvolutionStrategyPriority;

  enabled?:
    boolean;

  sourceStrategyType:
    RecommendationEvolutionStrategyType;

  relatedSignalIds?:
    string[];
};

function createRuntimeDecision(
  params:
    CreateRuntimeDecisionParams,
): RecommendationEvolutionRuntimeDecision {
  return {
    id:
      params.id ??
      `decision-${params.type}`,

    type:
      params.type,

    priority:
      params.priority ??
      "medium",

    enabled:
      params.enabled ??
      true,

    sourceStrategyType:
      params.sourceStrategyType,

    description:
      `Decision ${params.type}`,

    rationale: [
      "Decision rationale.",
    ],

    relatedSignalIds:
      params.relatedSignalIds ??
      [],

    decidedAt:
      CREATED_AT,
  };
}

type CreateGuidanceFixtureParams = {
  assessment:
    RecommendationEvolutionIntelligenceAssessment;

  strategy:
    RecommendationEvolutionStrategy;

  signals?:
    RecommendationEvolutionIntelligenceSignal[];

  runtimeDecisions?:
    RecommendationEvolutionRuntimeDecision[];
};

function createGuidance(
  params:
    CreateGuidanceFixtureParams,
) {
  return createRecommendationEvolutionGuidance({
    assessment:
      params.assessment,

    strategy:
      params.strategy,

    runtimeDecisions:
      params.runtimeDecisions ??
      [],

    signals:
      params.signals ??
      [],

    createdAt:
      CREATED_AT,

    createGuidanceId:
      () =>
        "guidance-1",

    createWarningId:
      (
        index,
      ) =>
        `warning-${index}`,

    createObservationId:
      (
        index,
      ) =>
        `observation-${index}`,
  });
}

function createStateFixture(
  state:
    RecommendationEvolutionIntelligenceState,
  strategyType:
    RecommendationEvolutionStrategyType,
  tone:
    RecommendationEvolutionGuidanceTone,
) {
  const assessment =
    createAssessment({
      state,

      confidence:
        state === "unavailable" ||
        state === "observing"
          ? "low"
          : "high",
    });

  const strategy =
    createStrategy({
      type:
        strategyType,

      sourceState:
        state,
    });

  const guidance =
    createGuidance({
      assessment,
      strategy,
    });

  expect(
    guidance.tone,
  ).toBe(
    tone,
  );

  return guidance;
}

/* ------------------------------------------------------------------ */
/* Tests                                                              */
/* ------------------------------------------------------------------ */

describe(
  "createRecommendationEvolutionGuidance",
  () => {
    it(
      "creates unavailable guidance for unavailable assessment",
      () => {
        const guidance =
          createStateFixture(
            "unavailable",
            "observe",
            "unavailable",
          );

        expect(
          guidance.headline,
        ).toContain(
          "기록이 아직 없습니다",
        );

        expect(
          guidance.nextQuestion,
        ).not.toBeNull();
      },
    );

    it(
      "creates neutral observation guidance for observing assessment",
      () => {
        const signal =
          createSignal({
            type:
              "observation-needed",

            severity:
              "low",
          });

        const assessment =
          createAssessment({
            state:
              "observing",

            confidence:
              "low",

            needsObservation:
              true,

            primarySignalType:
              "observation-needed",
          });

        const strategy =
          createStrategy({
            type:
              "observe",

            sourceState:
              "observing",

            primarySignalType:
              "observation-needed",

            relatedSignalIds: [
              signal.id,
            ],
          });

        const guidance =
          createGuidance({
            assessment,
            strategy,
            signals: [
              signal,
            ],
          });

        expect(
          guidance.tone,
        ).toBe(
          "neutral",
        );

        expect(
          guidance.warnings,
        ).toHaveLength(
          1,
        );

        expect(
          guidance.observations,
        ).toHaveLength(
          1,
        );

        expect(
          guidance.relatedSignalIds,
        ).toContain(
          signal.id,
        );
      },
    );

    it(
      "creates stable guidance for maintain strategy",
      () => {
        const signal =
          createSignal({
            type:
              "stable-continuation",

            severity:
              "info",
          });

        const assessment =
          createAssessment({
            state:
              "stable",

            confidence:
              "high",

            primarySignalType:
              "stable-continuation",

            shouldMaintainCurrentRecommendation:
              true,
          });

        const strategy =
          createStrategy({
            type:
              "maintain",

            priority:
              "medium",

            sourceState:
              "stable",

            primarySignalType:
              "stable-continuation",

            relatedSignalIds: [
              signal.id,
            ],
          });

        const guidance =
          createGuidance({
            assessment,
            strategy,
            signals: [
              signal,
            ],
          });

        expect(
          guidance.tone,
        ).toBe(
          "stable",
        );

        expect(
          guidance.headline,
        ).toContain(
          "유지",
        );

        expect(
          guidance.runtimeInstruction,
        ).toContain(
          "보존",
        );

        expect(
          guidance.warnings,
        ).toHaveLength(
          0,
        );
      },
    );

    it(
      "creates progressing guidance with refinement observation for narrow strategy",
      () => {
        const signal =
          createSignal({
            type:
              "productive-refinement",

            severity:
              "moderate",
          });

        const assessment =
          createAssessment({
            state:
              "progressing",

            confidence:
              "high",

            primarySignalType:
              "productive-refinement",

            shouldMaintainCurrentRecommendation:
              true,

            shouldRefineRecommendation:
              true,
          });

        const strategy =
          createStrategy({
            type:
              "narrow",

            priority:
              "medium",

            sourceState:
              "progressing",

            primarySignalType:
              "productive-refinement",

            relatedSignalIds: [
              signal.id,
            ],

            decisions: {
              shouldGenerateNewRecommendation:
                false,

              shouldPreserveCurrentRecommendation:
                true,

              shouldRequestProgressEvidence:
                false,

              shouldRequestCompletionConfirmation:
                false,

              shouldReduceDirectionChanges:
                false,

              shouldNarrowCurrentRecommendation:
                true,

              shouldClarifyCurrentRecommendation:
                false,

              shouldReconsiderCurrentRecommendation:
                false,
            },
          });

        const guidance =
          createGuidance({
            assessment,
            strategy,
            signals: [
              signal,
            ],
          });

        expect(
          guidance.tone,
        ).toBe(
          "progressing",
        );

        expect(
          guidance.nextQuestion,
        ).toContain(
          "가장 작은 행동",
        );

        expect(
          guidance.observations.some(
            (
              observation,
            ) =>
              observation.subject ===
              "실행 가능한 최소 행동",
          ),
        ).toBe(
          true,
        );
      },
    );

    it(
      "creates attention guidance with warnings and completion observation for stalled state",
      () => {
        const unresolvedSignal =
          createSignal({
            type:
              "unresolved-repetition",

            severity:
              "high",
          });

        const persistentSignal =
          createSignal({
            type:
              "persistent-repetition",

            severity:
              "moderate",
          });

        const assessment =
          createAssessment({
            state:
              "stalled",

            confidence:
              "high",

            primarySignalType:
              "unresolved-repetition",

            shouldMaintainCurrentRecommendation:
              true,

            shouldConfirmCompletion:
              true,
          });

        const strategy =
          createStrategy({
            type:
              "confirm-completion",

            priority:
              "high",

            sourceState:
              "stalled",

            primarySignalType:
              "unresolved-repetition",

            relatedSignalIds: [
              unresolvedSignal.id,
              persistentSignal.id,
            ],

            decisions: {
              shouldGenerateNewRecommendation:
                false,

              shouldPreserveCurrentRecommendation:
                true,

              shouldRequestProgressEvidence:
                true,

              shouldRequestCompletionConfirmation:
                true,

              shouldReduceDirectionChanges:
                false,

              shouldNarrowCurrentRecommendation:
                false,

              shouldClarifyCurrentRecommendation:
                false,

              shouldReconsiderCurrentRecommendation:
                false,
            },
          });

        const guidance =
          createGuidance({
            assessment,
            strategy,
            signals: [
              unresolvedSignal,
              persistentSignal,
            ],
          });

        expect(
          guidance.tone,
        ).toBe(
          "attention",
        );

        expect(
          guidance.warnings.length,
        ).toBeGreaterThan(
          0,
        );

        expect(
          guidance.observations.some(
            (
              observation,
            ) =>
              observation.subject ===
              "현재 Recommendation 완료 여부",
          ),
        ).toBe(
          true,
        );

        expect(
          guidance.nextQuestion,
        ).toContain(
          "완료",
        );
      },
    );

    it(
      "creates attention guidance with direction observation for fragmented state",
      () => {
        const driftSignal =
          createSignal({
            type:
              "high-drift",

            severity:
              "high",
          });

        const assessment =
          createAssessment({
            state:
              "fragmented",

            confidence:
              "high",

            primarySignalType:
              "high-drift",

            shouldStabilizeDirection:
              true,
          });

        const strategy =
          createStrategy({
            type:
              "stabilize",

            priority:
              "high",

            sourceState:
              "fragmented",

            primarySignalType:
              "high-drift",

            relatedSignalIds: [
              driftSignal.id,
            ],

            decisions: {
              shouldGenerateNewRecommendation:
                false,

              shouldPreserveCurrentRecommendation:
                false,

              shouldRequestProgressEvidence:
                true,

              shouldRequestCompletionConfirmation:
                false,

              shouldReduceDirectionChanges:
                true,

              shouldNarrowCurrentRecommendation:
                false,

              shouldClarifyCurrentRecommendation:
                true,

              shouldReconsiderCurrentRecommendation:
                false,
            },
          });

        const guidance =
          createGuidance({
            assessment,
            strategy,
            signals: [
              driftSignal,
            ],
          });

        expect(
          guidance.tone,
        ).toBe(
          "attention",
        );

        expect(
          guidance.warnings[0]?.severity,
        ).toBe(
          "high",
        );

        expect(
          guidance.observations.some(
            (
              observation,
            ) =>
              observation.subject ===
              "최근 Recommendation 방향 변경",
          ),
        ).toBe(
          true,
        );
      },
    );

    it(
      "creates progressing guidance for advancing state",
      () => {
        const signal =
          createSignal({
            type:
              "completion-momentum",

            severity:
              "moderate",
          });

        const assessment =
          createAssessment({
            state:
              "advancing",

            confidence:
              "high",

            primarySignalType:
              "completion-momentum",
          });

        const strategy =
          createStrategy({
            type:
              "advance",

            priority:
              "high",

            sourceState:
              "advancing",

            primarySignalType:
              "completion-momentum",

            relatedSignalIds: [
              signal.id,
            ],

            decisions: {
              shouldGenerateNewRecommendation:
                true,

              shouldPreserveCurrentRecommendation:
                false,

              shouldRequestProgressEvidence:
                false,

              shouldRequestCompletionConfirmation:
                false,

              shouldReduceDirectionChanges:
                false,

              shouldNarrowCurrentRecommendation:
                false,

              shouldClarifyCurrentRecommendation:
                false,

              shouldReconsiderCurrentRecommendation:
                false,
            },
          });

        const guidance =
          createGuidance({
            assessment,
            strategy,
            signals: [
              signal,
            ],
          });

        expect(
          guidance.tone,
        ).toBe(
          "progressing",
        );

        expect(
          guidance.runtimeInstruction,
        ).toContain(
          "다음 단계",
        );

        expect(
          guidance.observations.some(
            (
              observation,
            ) =>
              observation.subject ===
              "완료 결과와 다음 단계의 연결",
          ),
        ).toBe(
          true,
        );
      },
    );

    it(
      "includes related signal IDs from strategy, runtime decisions, warnings, and observations",
      () => {
        const signal =
          createSignal({
            id:
              "signal-observation",

            type:
              "observation-needed",

            severity:
              "low",
          });

        const assessment =
          createAssessment({
            state:
              "observing",

            confidence:
              "low",

            needsObservation:
              true,

            primarySignalType:
              "observation-needed",
          });

        const strategy =
          createStrategy({
            type:
              "observe",

            sourceState:
              "observing",

            primarySignalType:
              "observation-needed",

            relatedSignalIds: [
              signal.id,
            ],
          });

        const decision =
          createRuntimeDecision({
            type:
              "request-progress-evidence",

            sourceStrategyType:
              "observe",

            relatedSignalIds: [
              signal.id,
            ],
          });

        const guidance =
          createGuidance({
            assessment,
            strategy,
            signals: [
              signal,
            ],
            runtimeDecisions: [
              decision,
            ],
          });

        expect(
          guidance.relatedSignalIds,
        ).toEqual([
          signal.id,
        ]);
      },
    );

    it(
      "combines assessment, strategy, and primary signal rationale without duplicates",
      () => {
        const signal =
          createSignal({
            type:
              "stable-continuation",

            severity:
              "info",
          });

        const assessment =
          createAssessment({
            state:
              "stable",

            primarySignalType:
              "stable-continuation",

            reasoning: [
              "Shared reason.",
            ],
          });

        const strategy =
          createStrategy({
            type:
              "maintain",

            sourceState:
              "stable",

            primarySignalType:
              "stable-continuation",

            relatedSignalIds: [
              signal.id,
            ],

            rationale: [
              "Shared reason.",
              "Strategy-only reason.",
            ],
          });

        const guidance =
          createGuidance({
            assessment,
            strategy,
            signals: [
              signal,
            ],
          });

        expect(
          guidance.rationale.filter(
            (
              reason,
            ) =>
              reason ===
              "Shared reason.",
          ),
        ).toHaveLength(
          1,
        );

        expect(
          guidance.rationale,
        ).toContain(
          "Strategy-only reason.",
        );

        expect(
          guidance.rationale,
        ).toContain(
          signal.description,
        );
      },
    );

    it(
      "throws when strategy sourceState does not match assessment state",
      () => {
        expect(
          () =>
            createGuidance({
              assessment:
                createAssessment({
                  state:
                    "stable",
                }),

              strategy:
                createStrategy({
                  type:
                    "maintain",

                  sourceState:
                    "observing",
                }),
            }),
        ).toThrow(
          "strategy.sourceState must match assessment.state.",
        );
      },
    );

    it(
      "throws when runtime decision sourceStrategyType does not match strategy type",
      () => {
        expect(
          () =>
            createGuidance({
              assessment:
                createAssessment({
                  state:
                    "stable",
                }),

              strategy:
                createStrategy({
                  type:
                    "maintain",

                  sourceState:
                    "stable",
                }),

              runtimeDecisions: [
                createRuntimeDecision({
                  type:
                    "preserve-current-recommendation",

                  sourceStrategyType:
                    "observe",
                }),
              ],
            }),
        ).toThrow(
          'Runtime Decision "decision-preserve-current-recommendation" sourceStrategyType must match strategy.type.',
        );
      },
    );

    it(
      "throws when createdAt is invalid",
      () => {
        expect(
          () =>
            createRecommendationEvolutionGuidance({
              assessment:
                createAssessment(),

              strategy:
                createStrategy(),

              runtimeDecisions:
                [],

              signals:
                [],

              createdAt:
                "invalid-date",

              createGuidanceId:
                () =>
                  "guidance-1",

              createWarningId:
                (
                  index,
                ) =>
                  `warning-${index}`,

              createObservationId:
                (
                  index,
                ) =>
                  `observation-${index}`,
            }),
        ).toThrow(
          "createdAt must be a valid ISO 8601 timestamp.",
        );
      },
    );
  },
);