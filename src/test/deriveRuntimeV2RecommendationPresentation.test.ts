import {
    describe,
    expect,
    test,
} from "vitest";

import {
    deriveRuntimeV2RecommendationPresentation,
} from "../runtime-presentation/deriveRuntimeV2RecommendationPresentation";

import {
    createRuntimeV2RecommendationResultFixture,
} from "./fixtures/runtimeV2RecommendationFixture";

describe(
  "deriveRuntimeV2RecommendationPresentation",
  () => {
    test(
      "returns null without a Recommendation result",
      () => {
        expect(
          deriveRuntimeV2RecommendationPresentation(
            undefined
          )
        ).toBeNull();

        expect(
          deriveRuntimeV2RecommendationPresentation(
            null
          )
        ).toBeNull();
      }
    );

    test(
      "maps the current Recommendation",
      () => {
        const presentation =
          deriveRuntimeV2RecommendationPresentation(
            createRuntimeV2RecommendationResultFixture()
          );

        expect(
          presentation
        ).not.toBeNull();

        expect(
          presentation?.id
        ).toBe(
          "recommendation-ri11-001"
        );

        expect(
          presentation?.title
        ).toBe(
          "Stabilize Runtime Recommendation Integration"
        );

        expect(
          presentation?.action
        ).toBe(
          "Bind Runtime V2 Recommendation data before expanding the visible interface."
        );

        expect(
          presentation?.direction
        ).toBe(
          "runtime-stabilization"
        );

        expect(
          presentation?.directionLabel
        ).toBe(
          "Runtime Stabilization"
        );

        expect(
          presentation?.priority
        ).toBe(
          "high"
        );

        expect(
          presentation?.confidence
        ).toBe(
          "high"
        );
      }
    );

    test(
      "copies recommended steps",
      () => {
        const source =
          createRuntimeV2RecommendationResultFixture();

        const presentation =
          deriveRuntimeV2RecommendationPresentation(
            source
          );

        expect(
          presentation?.steps
        ).toEqual([
          "Add the Runtime V2 Recommendation transport contract.",
          "Create a Landing presentation adapter.",
          "Bind the presentation to RuntimeV2ResultPanel.",
        ]);

        expect(
          presentation?.steps
        ).not.toBe(
          source.currentRecommendation.recommendedSteps
        );
      }
    );

    test(
      "maps initial Comparison",
      () => {
        const presentation =
          deriveRuntimeV2RecommendationPresentation(
            createRuntimeV2RecommendationResultFixture()
          );

        expect(
          presentation?.changeType
        ).toBe(
          "initial"
        );

        expect(
          presentation?.changeLabel
        ).toBe(
          "Initial recommendation"
        );
      }
    );

    test(
      "maps refined Comparison",
      () => {
        const presentation =
          deriveRuntimeV2RecommendationPresentation(
            createRuntimeV2RecommendationResultFixture({
              comparisonOverrides: {
                changeType:
                  "refined",

                previousRecommendationId:
                  "recommendation-ri10-001",

                changedFields: [
                  "recommendedAction",
                  "recommendedSteps",
                ],
              },
            })
          );

        expect(
          presentation?.changeType
        ).toBe(
          "refined"
        );

        expect(
          presentation?.changeLabel
        ).toBe(
          "Recommendation became more specific"
        );
      }
    );

    test(
      "maps shifted Comparison",
      () => {
        const presentation =
          deriveRuntimeV2RecommendationPresentation(
            createRuntimeV2RecommendationResultFixture({
              comparisonOverrides: {
                changeType:
                  "shifted",

                previousRecommendationId:
                  "recommendation-ri10-001",

                previousDirection:
                  "reflection-strengthening",

                changedFields: [
                  "direction",
                ],
              },
            })
          );

        expect(
          presentation?.changeType
        ).toBe(
          "shifted"
        );

        expect(
          presentation?.changeLabel
        ).toBe(
          "Recommendation direction changed"
        );
      }
    );

    test(
      "maps aligned Observation",
      () => {
        const presentation =
          deriveRuntimeV2RecommendationPresentation(
            createRuntimeV2RecommendationResultFixture()
          );

        expect(
          presentation?.alignment
        ).toBe(
          "aligned"
        );

        expect(
          presentation?.alignmentLabel
        ).toBe(
          "Current project activity follows this direction."
        );

        expect(
          presentation?.observationSummary
        ).toBe(
          "Recent project activity follows the Runtime stabilization direction."
        );
      }
    );

    test(
      "maps insufficient Observation evidence",
      () => {
        const presentation =
          deriveRuntimeV2RecommendationPresentation(
            createRuntimeV2RecommendationResultFixture({
              observationOverrides: {
                alignment:
                  "insufficient-evidence",

                summary:
                  "More project evidence is required.",

                alignedEvidence:
                  [],

                missingEvidence: [
                  "Recent implementation evidence",
                ],

                confidence:
                  "low",
              },
            })
          );

        expect(
          presentation?.alignment
        ).toBe(
          "insufficient-evidence"
        );

        expect(
          presentation?.alignmentLabel
        ).toBe(
          "More project evidence is needed."
        );
      }
    );

    test(
      "maps early Recommendation Evolution",
      () => {
        const presentation =
          deriveRuntimeV2RecommendationPresentation(
            createRuntimeV2RecommendationResultFixture()
          );

        expect(
          presentation?.evolutionPattern
        ).toBe(
          "early-formation"
        );

        expect(
          presentation?.evolutionLabel
        ).toBe(
          "Early direction formation"
        );

        expect(
          presentation?.evolutionSummary
        ).toBe(
          "The Recommendation direction is beginning to form."
        );
      }
    );

    test(
      "returns empty Prediction fields when Prediction is absent",
      () => {
        const presentation =
          deriveRuntimeV2RecommendationPresentation(
            createRuntimeV2RecommendationResultFixture()
          );

        expect(
          presentation?.predictedDirection
        ).toBeNull();

        expect(
          presentation?.predictedDirectionLabel
        ).toBeNull();

        expect(
          presentation?.predictionRationale
        ).toBeNull();

        expect(
          presentation?.predictionConditions
        ).toEqual([]);
      }
    );

    test(
      "maps Predictive Intelligence",
      () => {
        const presentation =
          deriveRuntimeV2RecommendationPresentation(
            createRuntimeV2RecommendationResultFixture({
              includePrediction:
                true,
            })
          );

        expect(
          presentation?.predictedDirection
        ).toBe(
          "ux-stabilization"
        );

        expect(
          presentation?.predictedDirectionLabel
        ).toBe(
          "UX Stabilization"
        );

        expect(
          presentation?.predictionRationale
        ).toBe(
          "If the Runtime data boundary remains stable, the next likely concern is presentation quality."
        );

        expect(
          presentation?.predictionConditions
        ).toEqual([
          "Runtime Recommendation data remains available.",
          "Landing presentation continues to use the new transport contract.",
        ]);
      }
    );

    test(
      "exposes Timeline and evidence counts",
      () => {
        const presentation =
          deriveRuntimeV2RecommendationPresentation(
            createRuntimeV2RecommendationResultFixture()
          );

        expect(
          presentation?.timelineEntryCount
        ).toBe(
          1
        );

        expect(
          presentation?.evidenceCount
        ).toBe(
          2
        );
      }
    );

    test(
      "handles optional intelligence layers",
      () => {
        const presentation =
          deriveRuntimeV2RecommendationPresentation(
            createRuntimeV2RecommendationResultFixture({
              includeTimeline:
                false,

              includeComparison:
                false,

              includeObservation:
                false,

              includeEvolution:
                false,
            })
          );

        expect(
          presentation?.timelineEntryCount
        ).toBe(
          0
        );

        expect(
          presentation?.changeType
        ).toBeNull();

        expect(
          presentation?.changeLabel
        ).toBe(
          "Initial recommendation"
        );

        expect(
          presentation?.alignment
        ).toBeNull();

        expect(
          presentation?.alignmentLabel
        ).toBe(
          "More project evidence is needed."
        );

        expect(
          presentation?.evolutionPattern
        ).toBeNull();

        expect(
          presentation?.evolutionLabel
        ).toBeNull();
      }
    );

    test(
      "does not mutate the source result",
      () => {
        const source =
          createRuntimeV2RecommendationResultFixture({
            includePrediction:
              true,
          });

        const originalSteps = [
          ...source.currentRecommendation.recommendedSteps,
        ];

        const originalConditions = [
          ...(
            source.predictiveIntelligenceResult
              ?.conditions ??
            []
          ),
        ];

        const presentation =
          deriveRuntimeV2RecommendationPresentation(
            source
          );

        presentation?.steps.push(
          "Mutated presentation step"
        );

        presentation?.predictionConditions.push(
          "Mutated presentation condition"
        );

        expect(
          source.currentRecommendation.recommendedSteps
        ).toEqual(
          originalSteps
        );

        expect(
          source.predictiveIntelligenceResult
            ?.conditions ??
          []
        ).toEqual(
          originalConditions
        );
      }
    );
  }
);