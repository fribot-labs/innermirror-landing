import {
    describe,
    expect,
    test,
} from "vitest";

import {
    deriveRuntimeV2RecommendationInsightPresentation,
} from "../runtime-presentation/deriveRuntimeV2RecommendationInsightPresentation";

import {
    createRuntimeV2RecommendationInsightFixture,
} from "./fixtures/runtimeV2RecommendationFixture";

/* ------------------------------------------------------------------ */
/* Null and basic mapping                                             */
/* ------------------------------------------------------------------ */

describe(
  "deriveRuntimeV2RecommendationInsightPresentation",
  () => {
    test(
      "returns null when Recommendation Insight is undefined",
      () => {
        const presentation =
          deriveRuntimeV2RecommendationInsightPresentation(
            undefined
          );

        expect(
          presentation
        ).toBeNull();
      }
    );

    test(
      "returns null when Recommendation Insight is null",
      () => {
        const presentation =
          deriveRuntimeV2RecommendationInsightPresentation(
            null
          );

        expect(
          presentation
        ).toBeNull();
      }
    );

    test(
      "maps Runtime Recommendation Insight fields",
      () => {
        const insight =
          createRuntimeV2RecommendationInsightFixture();

        const presentation =
          deriveRuntimeV2RecommendationInsightPresentation(
            insight
          );

        expect(
          presentation
        ).not.toBeNull();

        expect(
          presentation?.headline
        ).toBe(
          insight.headline
        );

        expect(
          presentation?.summary
        ).toBe(
          insight.summary
        );

        expect(
          presentation?.keyInsight
        ).toBe(
          insight.keyInsight
        );

        expect(
          presentation?.pattern
        ).toBe(
          insight.pattern
        );

        expect(
          presentation?.confidence
        ).toBe(
          insight.confidence
        );

        expect(
          presentation?.generatedAt
        ).toBe(
          insight.generatedAt
        );
      }
    );

    test(
      "copies Runtime-generated supporting reasons",
      () => {
        const insight =
          createRuntimeV2RecommendationInsightFixture({
            supportingReasons: [
              "Comparison: Direction maintained",
              "Observation: Evidence remains insufficient",
              "Evolution: Stable direction",
            ],
          });

        const presentation =
          deriveRuntimeV2RecommendationInsightPresentation(
            insight
          );

        expect(
          presentation?.supportingReasons
        ).toEqual(
          insight.supportingReasons
        );

        expect(
          presentation?.supportingReasons
        ).not.toBe(
          insight.supportingReasons
        );
      }
    );

    test(
      "returns an empty supporting reasons array when Runtime provides no reasons",
      () => {
        const presentation =
          deriveRuntimeV2RecommendationInsightPresentation(
            createRuntimeV2RecommendationInsightFixture({
              supportingReasons:
                [],
            })
          );

        expect(
          presentation?.supportingReasons
        ).toEqual(
          []
        );
      }
    );

    test(
      "maps Runtime Evidence length to evidenceCount",
      () => {
        const presentation =
          deriveRuntimeV2RecommendationInsightPresentation(
            createRuntimeV2RecommendationInsightFixture({
              evidence: [
                {
                  id:
                    "insight-evidence-001",

                  source:
                    "recommendation-comparison",

                  label:
                    "Comparison Evidence",

                  summary:
                    "The Recommendation direction remains stable.",

                  confidence:
                    "high",
                },

                {
                  id:
                    "insight-evidence-002",

                  source:
                    "recommendation-observation",

                  label:
                    "Observation Evidence",

                  summary:
                    "Recent project evidence is partially aligned.",

                  confidence:
                    "medium",
                },

                {
                  id:
                    "insight-evidence-003",

                  source:
                    "recommendation-evolution",

                  label:
                    "Evolution Evidence",

                  summary:
                    "The Recommendation has remained stable over time.",

                  confidence:
                    "medium",
                },
              ],
            })
          );

        expect(
          presentation?.evidenceCount
        ).toBe(
          3
        );
      }
    );

    test(
      "maps empty Runtime Evidence to zero evidenceCount",
      () => {
        const presentation =
          deriveRuntimeV2RecommendationInsightPresentation(
            createRuntimeV2RecommendationInsightFixture({
              evidence:
                [],
            })
          );

        expect(
          presentation?.evidenceCount
        ).toBe(
          0
        );
      }
    );

    /* ---------------------------------------------------------------- */
    /* Pattern labels and tones                                         */
    /* ---------------------------------------------------------------- */

    test.each([
      {
        pattern:
          "early-understanding",
        expectedLabel:
          "Early understanding",
        expectedTone:
          "forming",
      },

      {
        pattern:
          "stable-but-under-evidenced",
        expectedLabel:
          "Stable, limited evidence",
        expectedTone:
          "forming",
      },

      {
        pattern:
          "stable-and-aligned",
        expectedLabel:
          "Stable and aligned",
        expectedTone:
          "stable",
      },

      {
        pattern:
          "progressing",
        expectedLabel:
          "Progressive refinement",
        expectedTone:
          "progressing",
      },

      {
        pattern:
          "strategic-transition",
        expectedLabel:
          "Strategic transition",
        expectedTone:
          "transition",
      },

      {
        pattern:
          "direction-conflict",
        expectedLabel:
          "Direction conflict",
        expectedTone:
          "warning",
      },

      {
        pattern:
          "uncertain",
        expectedLabel:
          "Uncertain interpretation",
        expectedTone:
          "uncertain",
      },
    ] as const)(
      "maps $pattern to its presentation label and tone",
      ({
        pattern,
        expectedLabel,
        expectedTone,
      }) => {
        const presentation =
          deriveRuntimeV2RecommendationInsightPresentation(
            createRuntimeV2RecommendationInsightFixture({
              pattern,
            })
          );

        expect(
          presentation?.pattern
        ).toBe(
          pattern
        );

        expect(
          presentation?.patternLabel
        ).toBe(
          expectedLabel
        );

        expect(
          presentation?.tone
        ).toBe(
          expectedTone
        );
      }
    );

    /* ---------------------------------------------------------------- */
    /* Confidence labels                                                */
    /* ---------------------------------------------------------------- */

    test.each([
      {
        confidence:
          "low",
        expectedLabel:
          "Low confidence",
      },

      {
        confidence:
          "medium",
        expectedLabel:
          "Medium confidence",
      },

      {
        confidence:
          "high",
        expectedLabel:
          "High confidence",
      },
    ] as const)(
      "maps $confidence confidence to its presentation label",
      ({
        confidence,
        expectedLabel,
      }) => {
        const presentation =
          deriveRuntimeV2RecommendationInsightPresentation(
            createRuntimeV2RecommendationInsightFixture({
              confidence,
            })
          );

        expect(
          presentation?.confidence
        ).toBe(
          confidence
        );

        expect(
          presentation?.confidenceLabel
        ).toBe(
          expectedLabel
        );
      }
    );

    /* ---------------------------------------------------------------- */
    /* Timestamp presentation                                           */
    /* ---------------------------------------------------------------- */

    test(
      "creates a readable generatedAt label",
      () => {
        const insight =
          createRuntimeV2RecommendationInsightFixture({
            generatedAt:
              "2026-08-01T10:30:00.000Z",
          });

        const presentation =
          deriveRuntimeV2RecommendationInsightPresentation(
            insight
          );

        expect(
          presentation?.generatedAt
        ).toBe(
          insight.generatedAt
        );

        expect(
          presentation?.generatedAtLabel
        ).toEqual(
          expect.any(String)
        );

        expect(
          presentation?.generatedAtLabel.length
        ).toBeGreaterThan(
          0
        );

        expect(
          presentation?.generatedAtLabel
        ).not.toBe(
          insight.generatedAt
        );
      }
    );

    test(
      "preserves an invalid generatedAt value as the display label",
      () => {
        const presentation =
          deriveRuntimeV2RecommendationInsightPresentation(
            createRuntimeV2RecommendationInsightFixture({
              generatedAt:
                "invalid-date",
            })
          );

        expect(
          presentation?.generatedAt
        ).toBe(
          "invalid-date"
        );

        expect(
          presentation?.generatedAtLabel
        ).toBe(
          "invalid-date"
        );
      }
    );

    /* ---------------------------------------------------------------- */
    /* Boundary and immutability                                        */
    /* ---------------------------------------------------------------- */

    test(
      "does not expose Runtime-only Recommendation identifiers",
      () => {
        const presentation =
          deriveRuntimeV2RecommendationInsightPresentation(
            createRuntimeV2RecommendationInsightFixture()
          );

        expect(
          presentation
        ).not.toHaveProperty(
          "projectId"
        );

        expect(
          presentation
        ).not.toHaveProperty(
          "currentRecommendationId"
        );

        expect(
          presentation
        ).not.toHaveProperty(
          "currentDirection"
        );

        expect(
          presentation
        ).not.toHaveProperty(
          "evidence"
        );
      }
    );

    test(
      "does not mutate the Runtime Recommendation Insight",
      () => {
        const insight =
          createRuntimeV2RecommendationInsightFixture({
            supportingReasons: [
              "Comparison: Direction maintained",
              "Observation: Evidence remains insufficient",
            ],

            evidence: [
              {
                id:
                  "immutable-insight-evidence",

                source:
                  "recommendation-observation",

                label:
                  "Immutable Evidence",

                summary:
                  "Runtime Insight source evidence remains unchanged.",

                confidence:
                  "medium",
              },
            ],
          });

        const originalSupportingReasons = [
          ...insight.supportingReasons,
        ];

        const originalEvidenceIds =
          insight.evidence.map(
            (evidence) =>
              evidence.id
          );

        const presentation =
          deriveRuntimeV2RecommendationInsightPresentation(
            insight
          );

        presentation?.supportingReasons.push(
          "Mutated presentation reason"
        );

        expect(
          insight.supportingReasons
        ).toEqual(
          originalSupportingReasons
        );

        expect(
          insight.evidence.map(
            (evidence) =>
              evidence.id
          )
        ).toEqual(
          originalEvidenceIds
        );
      }
    );

    test(
      "creates a new presentation object on every derivation",
      () => {
        const insight =
          createRuntimeV2RecommendationInsightFixture();

        const firstPresentation =
          deriveRuntimeV2RecommendationInsightPresentation(
            insight
          );

        const secondPresentation =
          deriveRuntimeV2RecommendationInsightPresentation(
            insight
          );

        expect(
          firstPresentation
        ).not.toBe(
          secondPresentation
        );

        expect(
          firstPresentation
        ).toEqual(
          secondPresentation
        );

        expect(
          firstPresentation?.supportingReasons
        ).not.toBe(
          secondPresentation?.supportingReasons
        );
      }
    );
  }
);