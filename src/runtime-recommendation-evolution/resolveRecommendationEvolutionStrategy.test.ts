import {
    describe,
    expect,
    it,
} from "vitest";

import {
    resolveRecommendationEvolutionStrategy,
} from "./resolveRecommendationEvolutionStrategy";

import type {
    RecommendationEvolutionIntelligenceAssessment,
    RecommendationEvolutionIntelligenceSignal,
    RecommendationEvolutionIntelligenceSignalConfidence,
    RecommendationEvolutionIntelligenceSignalSeverity,
    RecommendationEvolutionIntelligenceSignalType,
    RecommendationEvolutionIntelligenceState,
} from "./recommendationEvolutionIntelligenceTypes";

/* ------------------------------------------------------------------ */
/* Fixtures                                                           */
/* ------------------------------------------------------------------ */

const RESOLVED_AT =
  "2026-07-27T01:00:00.000Z";

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
      "Test assessment reasoning.",
    ],

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
      RESOLVED_AT,
  };
}

function resolve(
  assessment:
    RecommendationEvolutionIntelligenceAssessment,
  signals:
    RecommendationEvolutionIntelligenceSignal[],
) {
  return resolveRecommendationEvolutionStrategy({
    assessment,

    signals,

    resolvedAt:
      RESOLVED_AT,
  });
}

function createStateAssessment(
  state:
    RecommendationEvolutionIntelligenceState,
  overrides:
    AssessmentOverrides = {},
): RecommendationEvolutionIntelligenceAssessment {
  return createAssessment({
    state,

    ...overrides,
  });
}

/* ------------------------------------------------------------------ */
/* Tests                                                              */
/* ------------------------------------------------------------------ */

describe(
  "resolveRecommendationEvolutionStrategy",
  () => {
    it(
      "returns observe and allows an initial recommendation for unavailable state",
      () => {
        const result =
          resolve(
            createStateAssessment(
              "unavailable",
              {
                confidence:
                  "low",

                needsObservation:
                  true,

                primarySignalType:
                  "insufficient-history",
              },
            ),
            [
              createSignal({
                type:
                  "insufficient-history",

                severity:
                  "info",
              }),
            ],
          );

        expect(
          result.type,
        ).toBe(
          "observe",
        );

        expect(
          result.priority,
        ).toBe(
          "low",
        );

        expect(
          result.decisions
            .shouldGenerateNewRecommendation,
        ).toBe(
          true,
        );

        expect(
          result.decisions
            .shouldPreserveCurrentRecommendation,
        ).toBe(
          false,
        );
      },
    );

    it(
      "returns observe and preserves the current recommendation for observing state",
      () => {
        const result =
          resolve(
            createStateAssessment(
              "observing",
              {
                confidence:
                  "low",

                needsObservation:
                  true,

                primarySignalType:
                  "observation-needed",
              },
            ),
            [
              createSignal({
                type:
                  "observation-needed",

                severity:
                  "low",
              }),
            ],
          );

        expect(
          result.type,
        ).toBe(
          "observe",
        );

        expect(
          result.decisions
            .shouldGenerateNewRecommendation,
        ).toBe(
          false,
        );

        expect(
          result.decisions
            .shouldPreserveCurrentRecommendation,
        ).toBe(
          true,
        );

        expect(
          result.decisions
            .shouldRequestProgressEvidence,
        ).toBe(
          true,
        );

        expect(
          result.decisions
            .shouldClarifyCurrentRecommendation,
        ).toBe(
          true,
        );
      },
    );

    it(
      "returns maintain for stable state",
      () => {
        const result =
          resolve(
            createStateAssessment(
              "stable",
              {
                confidence:
                  "high",

                primarySignalType:
                  "stable-continuation",

                shouldMaintainCurrentRecommendation:
                  true,
              },
            ),
            [
              createSignal({
                type:
                  "stable-continuation",

                severity:
                  "info",
              }),
              createSignal({
                type:
                  "stable-direction",

                severity:
                  "info",
              }),
            ],
          );

        expect(
          result.type,
        ).toBe(
          "maintain",
        );

        expect(
          result.priority,
        ).toBe(
          "medium",
        );

        expect(
          result.decisions
            .shouldPreserveCurrentRecommendation,
        ).toBe(
          true,
        );

        expect(
          result.decisions
            .shouldGenerateNewRecommendation,
        ).toBe(
          false,
        );
      },
    );

    it(
      "returns narrow for progressing state when refinement is recommended",
      () => {
        const result =
          resolve(
            createStateAssessment(
              "progressing",
              {
                primarySignalType:
                  "productive-refinement",

                shouldMaintainCurrentRecommendation:
                  true,

                shouldRefineRecommendation:
                  true,
              },
            ),
            [
              createSignal({
                type:
                  "productive-refinement",

                severity:
                  "moderate",
              }),
            ],
          );

        expect(
          result.type,
        ).toBe(
          "narrow",
        );

        expect(
          result.priority,
        ).toBe(
          "medium",
        );

        expect(
          result.decisions
            .shouldNarrowCurrentRecommendation,
        ).toBe(
          true,
        );

        expect(
          result.decisions
            .shouldPreserveCurrentRecommendation,
        ).toBe(
          true,
        );
      },
    );

    it(
      "returns clarify for progressing state when refinement is not yet recommended",
      () => {
        const result =
          resolve(
            createStateAssessment(
              "progressing",
              {
                primarySignalType:
                  "observation-needed",

                shouldMaintainCurrentRecommendation:
                  true,

                shouldRefineRecommendation:
                  false,

                needsObservation:
                  true,
              },
            ),
            [
              createSignal({
                type:
                  "observation-needed",

                severity:
                  "low",
              }),
            ],
          );

        expect(
          result.type,
        ).toBe(
          "clarify",
        );

        expect(
          result.decisions
            .shouldClarifyCurrentRecommendation,
        ).toBe(
          true,
        );

        expect(
          result.decisions
            .shouldRequestProgressEvidence,
        ).toBe(
          true,
        );
      },
    );

    it(
      "returns confirm-completion for stalled state",
      () => {
        const result =
          resolve(
            createStateAssessment(
              "stalled",
              {
                primarySignalType:
                  "unresolved-repetition",

                shouldMaintainCurrentRecommendation:
                  true,

                shouldConfirmCompletion:
                  true,
              },
            ),
            [
              createSignal({
                type:
                  "unresolved-repetition",

                severity:
                  "high",
              }),
              createSignal({
                type:
                  "persistent-repetition",

                severity:
                  "moderate",
              }),
            ],
          );

        expect(
          result.type,
        ).toBe(
          "confirm-completion",
        );

        expect(
          result.priority,
        ).toBe(
          "high",
        );

        expect(
          result.decisions
            .shouldRequestCompletionConfirmation,
        ).toBe(
          true,
        );

        expect(
          result.decisions
            .shouldRequestProgressEvidence,
        ).toBe(
          true,
        );

        expect(
          result.decisions
            .shouldGenerateNewRecommendation,
        ).toBe(
          false,
        );
      },
    );

    it(
      "returns stabilize for fragmented state without supersession signals",
      () => {
        const result =
          resolve(
            createStateAssessment(
              "fragmented",
              {
                primarySignalType:
                  "high-drift",

                shouldStabilizeDirection:
                  true,
              },
            ),
            [
              createSignal({
                type:
                  "high-drift",

                severity:
                  "high",
              }),
              createSignal({
                type:
                  "frequent-redirection",

                severity:
                  "moderate",
              }),
            ],
          );

        expect(
          result.type,
        ).toBe(
          "stabilize",
        );

        expect(
          result.priority,
        ).toBe(
          "high",
        );

        expect(
          result.decisions
            .shouldReduceDirectionChanges,
        ).toBe(
          true,
        );

        expect(
          result.decisions
            .shouldClarifyCurrentRecommendation,
        ).toBe(
          true,
        );
      },
    );

    it(
      "returns reconsider for fragmented state with premature supersession",
      () => {
        const result =
          resolve(
            createStateAssessment(
              "fragmented",
              {
                primarySignalType:
                  "premature-supersession",

                shouldStabilizeDirection:
                  true,
              },
            ),
            [
              createSignal({
                type:
                  "premature-supersession",

                severity:
                  "high",
              }),
              createSignal({
                type:
                  "high-supersession-rate",

                severity:
                  "high",
              }),
            ],
          );

        expect(
          result.type,
        ).toBe(
          "reconsider",
        );

        expect(
          result.priority,
        ).toBe(
          "high",
        );

        expect(
          result.decisions
            .shouldReconsiderCurrentRecommendation,
        ).toBe(
          true,
        );

        expect(
          result.decisions
            .shouldReduceDirectionChanges,
        ).toBe(
          true,
        );
      },
    );

    it(
      "returns advance and allows a new recommendation for advancing state",
      () => {
        const result =
          resolve(
            createStateAssessment(
              "advancing",
              {
                confidence:
                  "high",

                primarySignalType:
                  "completion-momentum",
              },
            ),
            [
              createSignal({
                type:
                  "completion-momentum",

                severity:
                  "moderate",

                confidence:
                  "high",
              }),
            ],
          );

        expect(
          result.type,
        ).toBe(
          "advance",
        );

        expect(
          result.priority,
        ).toBe(
          "high",
        );

        expect(
          result.decisions
            .shouldGenerateNewRecommendation,
        ).toBe(
          true,
        );

        expect(
          result.decisions
            .shouldRequestCompletionConfirmation,
        ).toBe(
          false,
        );

        expect(
          result.decisions
            .shouldPreserveCurrentRecommendation,
        ).toBe(
          false,
        );
      },
    );

    it(
      "falls back to the highest-priority signal when assessment primarySignalType is null",
      () => {
        const result =
          resolve(
            createStateAssessment(
              "fragmented",
              {
                primarySignalType:
                  null,

                shouldStabilizeDirection:
                  true,
              },
            ),
            [
              createSignal({
                type:
                  "frequent-redirection",

                severity:
                  "moderate",

                score:
                  0.7,
              }),
              createSignal({
                type:
                  "high-drift",

                severity:
                  "high",

                score:
                  1,
              }),
            ],
          );

        expect(
          result.primarySignalType,
        ).toBe(
          "high-drift",
        );
      },
    );

    it(
      "includes only strategy-relevant signal IDs",
      () => {
        const result =
          resolve(
            createStateAssessment(
              "stalled",
              {
                primarySignalType:
                  "unresolved-repetition",

                shouldConfirmCompletion:
                  true,
              },
            ),
            [
              createSignal({
                id:
                  "signal-unresolved",

                type:
                  "unresolved-repetition",

                severity:
                  "high",
              }),
              createSignal({
                id:
                  "signal-persistent",

                type:
                  "persistent-repetition",

                severity:
                  "moderate",
              }),
              createSignal({
                id:
                  "signal-stable",

                type:
                  "stable-direction",

                severity:
                  "info",
              }),
            ],
          );

        expect(
          result.relatedSignalIds,
        ).toEqual([
          "signal-unresolved",
          "signal-persistent",
        ]);
      },
    );

    it(
      "preserves assessment and signal reasoning in the strategy rationale",
      () => {
        const result =
          resolve(
            createStateAssessment(
              "advancing",
              {
                confidence:
                  "high",

                primarySignalType:
                  "completion-momentum",

                reasoning: [
                  "Completion evidence is sufficient.",
                ],
              },
            ),
            [
              createSignal({
                type:
                  "completion-momentum",

                severity:
                  "moderate",
              }),
            ],
          );

        expect(
          result.rationale.some(
            (
              reason,
            ) =>
              reason.includes(
                'Primary signal "completion-momentum"',
              ),
          ),
        ).toBe(
          true,
        );

        expect(
          result.rationale.some(
            (
              reason,
            ) =>
              reason.includes(
                "Completion momentum supports moving",
              ),
          ),
        ).toBe(
          true,
        );
      },
    );

    it(
      "throws when assessment primarySignalType does not exist in signals",
      () => {
        expect(
          () =>
            resolve(
              createStateAssessment(
                "stable",
                {
                  primarySignalType:
                    "stable-continuation",
                },
              ),
              [],
            ),
        ).toThrow(
          'Assessment primarySignalType "stable-continuation" does not exist in signals.',
        );
      },
    );

    it(
      "throws when resolvedAt is invalid",
      () => {
        expect(
          () =>
            resolveRecommendationEvolutionStrategy({
              assessment:
                createStateAssessment(
                  "observing",
                ),

              signals:
                [],

              resolvedAt:
                "invalid-date",
            }),
        ).toThrow(
          "resolvedAt must be a valid ISO 8601 timestamp.",
        );
      },
    );
  },
);