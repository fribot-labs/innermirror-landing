import {
    describe,
    expect,
    it,
} from "vitest";

import type {
    RecommendationPredictiveIntelligenceUpdateResult,
} from "../runtime-recommendation-evolution";

import {
    deriveRuntimePredictivePresentation,
} from "./deriveRuntimePredictivePresentation";

/* ------------------------------------------------------------------ */
/* Test Result Factory                                                */
/* ------------------------------------------------------------------ */

/**
 * 테스트에 필요한 최소 Predictive Intelligence 결과를 생성합니다.
 *
 * 실제 Domain 계약 전체를 테스트 Fixture에서 반복하지 않고,
 * Presentation derivation에 필요한 필드만 정의합니다.
 */
function createPredictiveResult(
  analysis: Record<string, unknown>,
  overrides: Record<string, unknown> = {},
): RecommendationPredictiveIntelligenceUpdateResult {
  return {
    analysis,
    ...overrides,
  } as unknown as RecommendationPredictiveIntelligenceUpdateResult;
}

/* ------------------------------------------------------------------ */
/* Null Input                                                         */
/* ------------------------------------------------------------------ */

describe(
  "deriveRuntimePredictivePresentation",
  () => {
    it(
      "returns null when the predictive result is null",
      () => {
        const presentation =
          deriveRuntimePredictivePresentation(
            null,
          );

        expect(
          presentation,
        ).toBeNull();
      },
    );

    /* -------------------------------------------------------------- */
    /* Available Prediction                                           */
    /* -------------------------------------------------------------- */

    it(
      "derives an available Runtime presentation from predictive candidates",
      () => {
        const result =
          createPredictiveResult(
            {
              state:
                "predicting",

              headline:
                "Recommendation direction is becoming clearer.",

              summary:
                "The current evidence indicates a likely recommendation evolution.",

              primaryPrediction:
                "Preserve the current recommendation while gathering more evidence.",

              confidence:
                0.82,

              predictedStateCandidates: [
                {
                  rank:
                    2,

                  state:
                    "reassessment-required",

                  confidence:
                    0.41,
                },
                {
                  rank:
                    1,

                  state:
                    "recommendation-stable",

                  confidence:
                    0.86,
                },
              ],

              predictedStrategyCandidates: [
                {
                  rank:
                    1,

                  strategy:
                    "preserve-current-recommendation",

                  probability:
                    0.79,
                },
              ],

              predictedDecisionCandidates: [
                {
                  rank:
                    1,

                  decision:
                    "continue-observation",

                  score:
                    0.74,
                },
              ],

              risks: [
                {
                  title:
                    "premature-commitment",

                  description:
                    "The recommendation may be accepted before enough evidence is available.",

                  severity:
                    "high",
                },
              ],

              opportunities: [
                {
                  title:
                    "evidence-continuity",

                  description:
                    "Additional observations may strengthen the recommendation trajectory.",

                  severity:
                    "moderate",
                },
              ],

              evidence: [
                "Repeated recommendation stability",
                "  Repeated recommendation stability  ",
                "",
                "Consistent decision trajectory",
              ],

              warnings: [
                "Prediction remains conditional.",
                "Prediction remains conditional.",
              ],

              predictedAt:
                "2026-07-30T08:00:00.000Z",
            },
          );

        const presentation =
          deriveRuntimePredictivePresentation(
            result,
          );

        expect(
          presentation,
        ).not.toBeNull();

        expect(
          presentation?.status,
        ).toBe(
          "available",
        );

        expect(
          presentation?.headline,
        ).toBe(
          "Recommendation direction is becoming clearer.",
        );

        expect(
          presentation?.summary,
        ).toBe(
          "The current evidence indicates a likely recommendation evolution.",
        );

        expect(
          presentation?.primaryPrediction,
        ).toBe(
          "Preserve the current recommendation while gathering more evidence.",
        );

        expect(
          presentation?.statePrediction,
        ).toEqual(
          {
            label:
              "Likely State",

            value:
              "Recommendation Stable",

            confidence:
              0.86,
          },
        );

        expect(
          presentation?.strategyPrediction,
        ).toEqual(
          {
            label:
              "Likely Strategy",

            value:
              "Preserve Current Recommendation",

            confidence:
              0.79,
          },
        );

        expect(
          presentation?.decisionPrediction,
        ).toEqual(
          {
            label:
              "Likely Runtime Decision",

            value:
              "Continue Observation",

            confidence:
              0.74,
          },
        );

        expect(
          presentation?.risk,
        ).toEqual(
          {
            title:
              "Premature Commitment",

            description:
              "The recommendation may be accepted before enough evidence is available.",

            emphasis:
              "high",
          },
        );

        expect(
          presentation?.opportunity,
        ).toEqual(
          {
            title:
              "Evidence Continuity",

            description:
              "Additional observations may strengthen the recommendation trajectory.",

            emphasis:
              "moderate",
          },
        );

        expect(
          presentation?.confidence,
        ).toEqual(
          {
            score:
              0.82,

            percentage:
              82,

            disclosure:
              "This confidence represents a conditional estimate, not a guaranteed future outcome.",
          },
        );

        expect(
          presentation?.evidence,
        ).toEqual(
          [
            "Repeated recommendation stability",
            "Consistent decision trajectory",
          ],
        );

        expect(
          presentation?.warnings,
        ).toEqual(
          [
            "Prediction remains conditional.",
          ],
        );

        expect(
          presentation?.predictedAt,
        ).toBe(
          "2026-07-30T08:00:00.000Z",
        );
      },
    );

    /* -------------------------------------------------------------- */
    /* Candidate Fallback                                             */
    /* -------------------------------------------------------------- */

    it(
      "uses the first candidate when no candidate has rank 1",
      () => {
        const result =
          createPredictiveResult(
            {
              state:
                "predicting",

              stateCandidates: [
                {
                  rank:
                    3,

                  value:
                    "first-available-state",

                  confidence:
                    0.65,
                },
                {
                  rank:
                    4,

                  value:
                    "second-available-state",

                  confidence:
                    0.55,
                },
              ],

              confidence:
                0.65,

              predictedAt:
                "2026-07-30T09:00:00.000Z",
            },
          );

        const presentation =
          deriveRuntimePredictivePresentation(
            result,
          );

        expect(
          presentation?.statePrediction,
        ).toEqual(
          {
            label:
              "Likely State",

            value:
              "First Available State",

            confidence:
              0.65,
          },
        );

        expect(
          presentation?.primaryPrediction,
        ).toBe(
          "First Available State",
        );
      },
    );

    /* -------------------------------------------------------------- */
    /* Confidence Normalization                                       */
    /* -------------------------------------------------------------- */

    it(
      "clamps confidence values into the supported range",
      () => {
        const result =
          createPredictiveResult(
            {
              state:
                "predicting",

              confidence:
                1.7,

              predictedDecisionCandidates: [
                {
                  rank:
                    1,

                  decision:
                    "retain-current-path",

                  confidence:
                    -0.4,
                },
              ],

              predictedAt:
                "2026-07-30T10:00:00.000Z",
            },
          );

        const presentation =
          deriveRuntimePredictivePresentation(
            result,
          );

        expect(
          presentation?.confidence.score,
        ).toBe(
          1,
        );

        expect(
          presentation?.confidence.percentage,
        ).toBe(
          100,
        );

        expect(
          presentation?.decisionPrediction?.confidence,
        ).toBe(
          0,
        );
      },
    );

    /* -------------------------------------------------------------- */
    /* Insufficient Prediction                                        */
    /* -------------------------------------------------------------- */

    it(
      "creates an insufficient presentation without requiring candidates",
      () => {
        const result =
          createPredictiveResult(
            {
              state:
                "insufficient",

              evidence: [],

              warnings: [
                "More observations are required.",
              ],

              predictedAt:
                "2026-07-30T11:00:00.000Z",
            },
          );

        const presentation =
          deriveRuntimePredictivePresentation(
            result,
          );

        expect(
          presentation,
        ).toEqual(
          {
            status:
              "insufficient",

            headline:
              "Prediction Needs More Evidence",

            summary:
              "The current evidence is not yet sufficient to produce a reliable recommendation prediction.",

            primaryPrediction:
              null,

            statePrediction:
              null,

            strategyPrediction:
              null,

            decisionPrediction:
              null,

            risk:
              null,

            opportunity:
              null,

            confidence: {
              score:
                null,

              percentage:
                null,

              disclosure:
                "This prediction is withheld because the current evidence is not yet sufficient.",
            },

            evidence: [],

            warnings: [
              "More observations are required.",
            ],

            predictedAt:
              "2026-07-30T11:00:00.000Z",
          },
        );
      },
    );

    /* -------------------------------------------------------------- */
    /* Unavailable Prediction                                         */
    /* -------------------------------------------------------------- */

    it(
      "creates an unavailable presentation with safe fallback text",
      () => {
        const result =
          createPredictiveResult(
            {
              state:
                "unavailable",

              predictedAt:
                "2026-07-30T12:00:00.000Z",
            },
          );

        const presentation =
          deriveRuntimePredictivePresentation(
            result,
          );

        expect(
          presentation?.status,
        ).toBe(
          "unavailable",
        );

        expect(
          presentation?.headline,
        ).toBe(
          "Prediction Is Currently Unavailable",
        );

        expect(
          presentation?.summary,
        ).toBe(
          "A recommendation prediction could not be produced from the current runtime result.",
        );

        expect(
          presentation?.primaryPrediction,
        ).toBeNull();

        expect(
          presentation?.confidence,
        ).toEqual(
          {
            score:
              null,

            percentage:
              null,

            disclosure:
              "No reliable predictive confidence is currently available.",
          },
        );
      },
    );

    /* -------------------------------------------------------------- */
    /* Result Independence                                            */
    /* -------------------------------------------------------------- */

    it(
      "returns presentation arrays that do not share references with source arrays",
      () => {
        const sourceEvidence = [
          "Initial evidence",
        ];

        const sourceWarnings = [
          "Initial warning",
        ];

        const result =
          createPredictiveResult(
            {
              state:
                "predicting",

              predictedStateCandidates: [
                {
                  rank:
                    1,

                  state:
                    "stable-direction",

                  confidence:
                    0.7,
                },
              ],

              confidence:
                0.7,

              evidence:
                sourceEvidence,

              warnings:
                sourceWarnings,

              predictedAt:
                "2026-07-30T13:00:00.000Z",
            },
          );

        const presentation =
          deriveRuntimePredictivePresentation(
            result,
          );

        expect(
          presentation,
        ).not.toBeNull();

        sourceEvidence.push(
          "Later source evidence",
        );

        sourceWarnings.push(
          "Later source warning",
        );

        expect(
          presentation?.evidence,
        ).toEqual(
          [
            "Initial evidence",
          ],
        );

        expect(
          presentation?.warnings,
        ).toEqual(
          [
            "Initial warning",
          ],
        );
      },
    );
  },
);