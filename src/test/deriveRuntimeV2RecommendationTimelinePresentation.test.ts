import {
    describe,
    expect,
    test,
} from "vitest";

import {
    deriveRuntimeV2RecommendationTimelinePresentation,
} from "../runtime-presentation/deriveRuntimeV2RecommendationTimelinePresentation";

import {
    createRuntimeV2RecommendationFixture,
    createRuntimeV2RecommendationResultFixture,
    createRuntimeV2RecommendationStateFixture,
} from "./fixtures/runtimeV2RecommendationFixture";

/* ------------------------------------------------------------------ */
/* Shared Timeline Fixture                                             */
/* ------------------------------------------------------------------ */

function createTwoRecommendationTimelineResult() {
  const previousRecommendation =
    createRuntimeV2RecommendationFixture({
      id:
        "recommendation-ri11-previous",

      direction:
        "reflection-strengthening",

      title:
        "Strengthen Reflection Reasoning",

      summary:
        "Connect recent project activity with stronger Reflection reasoning.",

      recommendedAction:
        "Record the reasoning behind important implementation changes.",

      recommendedSteps: [
        "Write a Reflection for the latest project change.",
        "Connect the Reflection with recent GitHub activity.",
      ],

      priority:
        "medium",

      confidence:
        "medium",

      createdAt:
        "2026-07-31T09:00:00.000Z",
    });

  const previousState =
    createRuntimeV2RecommendationStateFixture({
      recommendationId:
        previousRecommendation.id,

      projectId:
        previousRecommendation.projectId,

      status:
        "superseded",

      createdAt:
        previousRecommendation.createdAt,

      updatedAt:
        "2026-08-01T09:00:00.000Z",

      supersededAt:
        "2026-08-01T09:00:00.000Z",

      stateReason:
        'Superseded by Recommendation "recommendation-ri11-001".',
    });

  const currentRecommendation =
    createRuntimeV2RecommendationFixture({
      id:
        "recommendation-ri11-001",

      direction:
        "runtime-stabilization",

      title:
        "Stabilize Runtime Recommendation Integration",

      createdAt:
        "2026-08-01T09:00:00.000Z",
    });

  const currentState =
    createRuntimeV2RecommendationStateFixture({
      recommendationId:
        currentRecommendation.id,

      projectId:
        currentRecommendation.projectId,

      status:
        "current",

      createdAt:
        currentRecommendation.createdAt,

      updatedAt:
        currentRecommendation.createdAt,
    });

  return createRuntimeV2RecommendationResultFixture({
    recommendationOverrides: {
      ...currentRecommendation,
    },

    stateOverrides: {
      ...currentState,
    },

    timelineOverrides: {
      projectId:
        currentRecommendation.projectId,

      entries: [
        {
          recommendation:
            previousRecommendation,

          state:
            previousState,
        },

        {
          recommendation:
            currentRecommendation,

          state:
            currentState,
        },
      ],

      currentRecommendationId:
        currentRecommendation.id,

      generatedAt:
        "2026-08-01T09:00:00.000Z",
    },

    comparisonOverrides: {
      previousRecommendationId:
        previousRecommendation.id,

      currentRecommendationId:
        currentRecommendation.id,

      changeType:
        "shifted",

      previousDirection:
        previousRecommendation.direction,

      currentDirection:
        currentRecommendation.direction,

      summary:
        "Recommendation shifted from Reflection strengthening to Runtime stabilization.",

      changedFields: [
        "direction",
        "title",
        "recommendedAction",
      ],

      confidence:
        "high",
    },

    evolutionOverrides: {
      projectId:
        currentRecommendation.projectId,

      pattern:
        "strategic-shift",

      summary:
        "Runtime Recommendation changed after the project entered an integration stabilization phase.",

      previousDirection:
        previousRecommendation.direction,

      currentDirection:
        currentRecommendation.direction,

      emergingDirection:
        "ux-stabilization",

      transitionCount:
        1,

      confidence:
        "medium",
    },

    includePrediction:
      true,
  });
}

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */

describe(
  "deriveRuntimeV2RecommendationTimelinePresentation",
  () => {
    test(
      "returns null without a Recommendation Integration result",
      () => {
        expect(
          deriveRuntimeV2RecommendationTimelinePresentation(
            undefined
          )
        ).toBeNull();

        expect(
          deriveRuntimeV2RecommendationTimelinePresentation(
            null
          )
        ).toBeNull();
      }
    );

    test(
      "creates a beginning Timeline for the first Recommendation",
      () => {
        const presentation =
          deriveRuntimeV2RecommendationTimelinePresentation(
            createRuntimeV2RecommendationResultFixture()
          );

        expect(
          presentation
        ).not.toBeNull();

        expect(
          presentation?.headline
        ).toBe(
          "Recommendation history is beginning"
        );

        expect(
          presentation?.summary
        ).toBe(
          "The first Runtime Recommendation has been recorded."
        );

        expect(
          presentation?.recommendationCount
        ).toBe(
          1
        );

        expect(
          presentation?.items
        ).toHaveLength(
          1
        );
      }
    );

    test(
      "maps the current Recommendation into a Timeline item",
      () => {
        const presentation =
          deriveRuntimeV2RecommendationTimelinePresentation(
            createRuntimeV2RecommendationResultFixture()
          );

        const currentItem =
          presentation?.items[0];

        expect(
          currentItem
        ).toBeDefined();

        expect(
          currentItem?.id
        ).toBe(
          "recommendation-ri11-001"
        );

        expect(
          currentItem?.title
        ).toBe(
          "Stabilize Runtime Recommendation Integration"
        );

        expect(
          currentItem?.direction
        ).toBe(
          "runtime-stabilization"
        );

        expect(
          currentItem?.directionLabel
        ).toBe(
          "Runtime Stabilization"
        );

        expect(
          currentItem?.priority
        ).toBe(
          "high"
        );

        expect(
          currentItem?.confidence
        ).toBe(
          "high"
        );

        expect(
          currentItem?.isCurrent
        ).toBe(
          true
        );

        expect(
          currentItem?.status
        ).toBe(
          "current"
        );

        expect(
          currentItem?.statusLabel
        ).toBe(
          "Current"
        );
      }
    );

    test(
      "preserves chronological Runtime Timeline order",
      () => {
        const result =
          createTwoRecommendationTimelineResult();

        const presentation =
          deriveRuntimeV2RecommendationTimelinePresentation(
            result
          );

        expect(
          presentation?.items
        ).toHaveLength(
          2
        );

        expect(
          presentation?.items.map(
            (item) =>
              item.id
          )
        ).toEqual([
          "recommendation-ri11-previous",
          "recommendation-ri11-001",
        ]);
      }
    );

    test(
      "distinguishes previous and current Recommendations",
      () => {
        const presentation =
          deriveRuntimeV2RecommendationTimelinePresentation(
            createTwoRecommendationTimelineResult()
          );

        const previousItem =
          presentation?.items[0];

        const currentItem =
          presentation?.items[1];

        expect(
          previousItem?.isCurrent
        ).toBe(
          false
        );

        expect(
          previousItem?.status
        ).toBe(
          "superseded"
        );

        expect(
          previousItem?.statusLabel
        ).toBe(
          "Previous"
        );

        expect(
          currentItem?.isCurrent
        ).toBe(
          true
        );

        expect(
          currentItem?.status
        ).toBe(
          "current"
        );

        expect(
          currentItem?.statusLabel
        ).toBe(
          "Current"
        );
      }
    );

    test(
      "creates a comparison headline when multiple Recommendations exist",
      () => {
        const presentation =
          deriveRuntimeV2RecommendationTimelinePresentation(
            createTwoRecommendationTimelineResult()
          );

        expect(
          presentation?.headline
        ).toBe(
          "Recommendation direction over time"
        );

        expect(
          presentation?.summary
        ).toBe(
          "2 Runtime Recommendations are available for comparison."
        );

        expect(
          presentation?.recommendationCount
        ).toBe(
          2
        );
      }
    );

    test(
      "maps the current Recommendation ID and Timeline timestamp",
      () => {
        const presentation =
          deriveRuntimeV2RecommendationTimelinePresentation(
            createTwoRecommendationTimelineResult()
          );

        expect(
          presentation?.currentRecommendationId
        ).toBe(
          "recommendation-ri11-001"
        );

        expect(
          presentation?.generatedAt
        ).toBe(
          "2026-08-01T09:00:00.000Z"
        );
      }
    );

    test(
      "maps initial Recommendation Comparison",
      () => {
        const presentation =
          deriveRuntimeV2RecommendationTimelinePresentation(
            createRuntimeV2RecommendationResultFixture()
          );

        expect(
          presentation?.change.changeType
        ).toBe(
          "initial"
        );

        expect(
          presentation?.change.changeLabel
        ).toBe(
          "Initial recommendation"
        );
      }
    );

    test(
      "maps shifted Recommendation Comparison",
      () => {
        const presentation =
          deriveRuntimeV2RecommendationTimelinePresentation(
            createTwoRecommendationTimelineResult()
          );

        expect(
          presentation?.change.changeType
        ).toBe(
          "shifted"
        );

        expect(
          presentation?.change.changeLabel
        ).toBe(
          "Direction changed"
        );

        expect(
          presentation?.change.summary
        ).toBe(
          "Recommendation shifted from Reflection strengthening to Runtime stabilization."
        );

        expect(
          presentation?.change.changedFields
        ).toEqual([
          "direction",
          "title",
          "recommendedAction",
        ]);
      }
    );

    test.each([
      [
        "repeated",
        "Direction maintained",
      ],

      [
        "refined",
        "Recommendation refined",
      ],

      [
        "intensified",
        "Priority increased",
      ],

      [
        "deprioritized",
        "Priority decreased",
      ],
    ] as const)(
      "maps %s Recommendation Comparison",
      (
        changeType,
        expectedLabel
      ) => {
        const presentation =
          deriveRuntimeV2RecommendationTimelinePresentation(
            createRuntimeV2RecommendationResultFixture({
              comparisonOverrides: {
                changeType,
              },
            })
          );

        expect(
          presentation?.change.changeType
        ).toBe(
          changeType
        );

        expect(
          presentation?.change.changeLabel
        ).toBe(
          expectedLabel
        );
      }
    );

    test(
      "copies Comparison changed fields",
      () => {
        const source =
          createTwoRecommendationTimelineResult();

        const presentation =
          deriveRuntimeV2RecommendationTimelinePresentation(
            source
          );

        expect(
          presentation?.change.changedFields
        ).toEqual([
          "direction",
          "title",
          "recommendedAction",
        ]);

        expect(
          presentation?.change.changedFields
        ).not.toBe(
          source.comparison?.changedFields
        );
      }
    );

    test(
      "maps early Recommendation Evolution",
      () => {
        const presentation =
          deriveRuntimeV2RecommendationTimelinePresentation(
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
          "Early formation"
        );

        expect(
          presentation?.evolutionSummary
        ).toBe(
          "The Recommendation direction is beginning to form."
        );
      }
    );

    test(
      "maps strategic Recommendation shift",
      () => {
        const presentation =
          deriveRuntimeV2RecommendationTimelinePresentation(
            createTwoRecommendationTimelineResult()
          );

        expect(
          presentation?.evolutionPattern
        ).toBe(
          "strategic-shift"
        );

        expect(
          presentation?.evolutionLabel
        ).toBe(
          "Strategic shift"
        );

        expect(
          presentation?.evolutionSummary
        ).toBe(
          "Runtime Recommendation changed after the project entered an integration stabilization phase."
        );
      }
    );

    test.each([
      [
        "stable-direction",
        "Stable direction",
      ],

      [
        "progressive-refinement",
        "Progressive refinement",
      ],

      [
        "oscillation",
        "Direction oscillation",
      ],

      [
        "unclear",
        "Unclear evolution",
      ],
    ] as const)(
      "maps %s Recommendation Evolution",
      (
        pattern,
        expectedLabel
      ) => {
        const presentation =
          deriveRuntimeV2RecommendationTimelinePresentation(
            createRuntimeV2RecommendationResultFixture({
              evolutionOverrides: {
                pattern,
              },
            })
          );

        expect(
          presentation?.evolutionPattern
        ).toBe(
          pattern
        );

        expect(
          presentation?.evolutionLabel
        ).toBe(
          expectedLabel
        );
      }
    );

    test(
      "returns no Prediction when Predictive Intelligence is absent",
      () => {
        const presentation =
          deriveRuntimeV2RecommendationTimelinePresentation(
            createRuntimeV2RecommendationResultFixture()
          );

        expect(
          presentation?.prediction
        ).toBeNull();
      }
    );

    test(
      "maps Recommendation Predictive Intelligence",
      () => {
        const presentation =
          deriveRuntimeV2RecommendationTimelinePresentation(
            createTwoRecommendationTimelineResult()
          );

        expect(
          presentation?.prediction
        ).not.toBeNull();

        expect(
          presentation?.prediction?.direction
        ).toBe(
          "ux-stabilization"
        );

        expect(
          presentation?.prediction?.directionLabel
        ).toBe(
          "UX Stabilization"
        );

        expect(
          presentation?.prediction?.rationale
        ).toBe(
          "If the Runtime data boundary remains stable, the next likely concern is presentation quality."
        );

        expect(
          presentation?.prediction?.conditions
        ).toEqual([
          "Runtime Recommendation data remains available.",
          "Landing presentation continues to use the new transport contract.",
        ]);

        expect(
          presentation?.prediction?.confidence
        ).toBe(
          "medium"
        );

        expect(
          presentation?.prediction?.generatedAt
        ).toBe(
          "2026-08-01T10:00:00.000Z"
        );
      }
    );

    test(
      "copies Prediction conditions",
      () => {
        const source =
          createTwoRecommendationTimelineResult();

        const presentation =
          deriveRuntimeV2RecommendationTimelinePresentation(
            source
          );

        expect(
          presentation?.prediction?.conditions
        ).not.toBe(
          source.predictiveIntelligenceResult
            ?.conditions
        );
      }
    );

    test(
      "falls back to the current Recommendation when Timeline is absent",
      () => {
        const result =
          createRuntimeV2RecommendationResultFixture({
            includeTimeline:
              false,
          });

        const presentation =
          deriveRuntimeV2RecommendationTimelinePresentation(
            result
          );

        expect(
          presentation?.items
        ).toHaveLength(
          1
        );

        expect(
          presentation?.items[0]?.id
        ).toBe(
          result.currentRecommendation.id
        );

        expect(
          presentation?.items[0]?.isCurrent
        ).toBe(
          true
        );

        expect(
          presentation?.currentRecommendationId
        ).toBe(
          result.currentRecommendation.id
        );

        expect(
          presentation?.generatedAt
        ).toBeNull();
      }
    );

    test(
      "handles missing Comparison and Evolution layers",
      () => {
        const result =
          createRuntimeV2RecommendationResultFixture({
            includeComparison:
              false,

            includeEvolution:
              false,
          });

        const presentation =
          deriveRuntimeV2RecommendationTimelinePresentation(
            result
          );

        expect(
          presentation?.change.changeType
        ).toBeNull();

        expect(
          presentation?.change.changeLabel
        ).toBe(
          "No comparison is available yet"
        );

        expect(
          presentation?.change.summary
        ).toBeNull();

        expect(
          presentation?.change.changedFields
        ).toEqual([]);

        expect(
          presentation?.evolutionPattern
        ).toBeNull();

        expect(
          presentation?.evolutionLabel
        ).toBeNull();

        expect(
          presentation?.evolutionSummary
        ).toBeNull();
      }
    );

    test(
      "marks a Recommendation as current when its ID matches the current Recommendation",
      () => {
        const result =
          createRuntimeV2RecommendationResultFixture();

        const timelineEntry =
          result.timeline?.entries[0];

        if (!timelineEntry) {
          throw new Error(
            "Expected the fixture Timeline to contain one entry."
          );
        }

        timelineEntry.state = {
          ...timelineEntry.state,

          status:
            "superseded",
        };

        const presentation =
          deriveRuntimeV2RecommendationTimelinePresentation(
            result
          );

        expect(
          presentation?.items[0]?.isCurrent
        ).toBe(
          true
        );

        expect(
          presentation?.items[0]?.status
        ).toBe(
          "current"
        );

        expect(
          presentation?.items[0]?.statusLabel
        ).toBe(
          "Current"
        );
      }
    );

    test(
      "maps a dismissed Recommendation state",
      () => {
        const result =
          createRuntimeV2RecommendationResultFixture();

        const dismissedRecommendation =
          createRuntimeV2RecommendationFixture({
            id:
              "recommendation-dismissed",

            createdAt:
              "2026-07-30T09:00:00.000Z",
          });

        const dismissedState =
          createRuntimeV2RecommendationStateFixture({
            recommendationId:
              dismissedRecommendation.id,

            projectId:
              dismissedRecommendation.projectId,

            status:
              "dismissed",

            createdAt:
              dismissedRecommendation.createdAt,

            updatedAt:
              dismissedRecommendation.createdAt,
          });

        if (!result.timeline) {
          throw new Error(
            "Expected the fixture to contain a Timeline."
          );
        }

        result.timeline.entries = [
          {
            recommendation:
              dismissedRecommendation,

            state:
              dismissedState,
          },

          ...result.timeline.entries,
        ];

        const presentation =
          deriveRuntimeV2RecommendationTimelinePresentation(
            result
          );

        expect(
          presentation?.items[0]?.status
        ).toBe(
          "dismissed"
        );

        expect(
          presentation?.items[0]?.statusLabel
        ).toBe(
          "Dismissed"
        );

        expect(
          presentation?.items[0]?.isCurrent
        ).toBe(
          false
        );
      }
    );

    test(
      "provides a readable date label for each Timeline item",
      () => {
        const presentation =
          deriveRuntimeV2RecommendationTimelinePresentation(
            createTwoRecommendationTimelineResult()
          );

        expect(
          presentation?.items[0]?.createdAt
        ).toBe(
          "2026-07-31T09:00:00.000Z"
        );

        expect(
          presentation?.items[0]?.createdAtLabel
        ).toEqual(
          expect.any(String)
        );

        expect(
          presentation?.items[0]?.createdAtLabel.length
        ).toBeGreaterThan(
          0
        );
      }
    );

    test(
      "preserves an invalid date string as its display label",
      () => {
        const result =
          createRuntimeV2RecommendationResultFixture({
            recommendationOverrides: {
              createdAt:
                "invalid-date",
            },

            timelineOverrides: {
              entries:
                [],
            },
          });

        const presentation =
          deriveRuntimeV2RecommendationTimelinePresentation(
            result
          );

        expect(
          presentation?.items[0]?.createdAt
        ).toBe(
          "invalid-date"
        );

        expect(
          presentation?.items[0]?.createdAtLabel
        ).toBe(
          "invalid-date"
        );
      }
    );

    test(
      "does not mutate the Runtime Recommendation result",
      () => {
        const source =
          createTwoRecommendationTimelineResult();

        const originalTimelineIds =
          source.timeline?.entries.map(
            (entry) =>
              entry.recommendation.id
          ) ?? [];

        const originalChangedFields = [
          ...(source.comparison?.changedFields ?? []),
        ];

        const originalPredictionConditions = [
          ...(
            source.predictiveIntelligenceResult
              ?.conditions ??
            []
          ),
        ];

        const presentation =
          deriveRuntimeV2RecommendationTimelinePresentation(
            source
          );

        presentation?.items.reverse();

        presentation?.change.changedFields.push(
          "mutated-field"
        );

        presentation?.prediction?.conditions.push(
          "mutated-condition"
        );

        expect(
          source.timeline?.entries.map(
            (entry) =>
              entry.recommendation.id
          ) ?? []
        ).toEqual(
          originalTimelineIds
        );

        expect(
          source.comparison?.changedFields ??
          []
        ).toEqual(
          originalChangedFields
        );

        expect(
          source.predictiveIntelligenceResult
            ?.conditions ??
          []
        ).toEqual(
          originalPredictionConditions
        );
      }
    );

    test(
      "maps initial Recommendation Comparison",
      () => {
        const presentation =
          deriveRuntimeV2RecommendationTimelinePresentation(
            createRuntimeV2RecommendationResultFixture()
          );

        expect(
          presentation?.change.changeType
        ).toBe(
          "initial"
        );

        expect(
          presentation?.change.changeLabel
        ).toBe(
          "Initial recommendation"
        );

        expect(
          presentation?.change.summary
        ).toBe(
          "This is the first recorded Recommendation for the current project."
        );
      }
    );

    test(
      "hides the internal project ID from the initial Recommendation summary",
      () => {
        const presentation =
          deriveRuntimeV2RecommendationTimelinePresentation(
            createRuntimeV2RecommendationResultFixture({
              comparisonOverrides: {
                changeType:
                  "initial",

                summary:
                  'This is the first recorded Recommendation for project "dda66e18-62fc-46bf-99f6-d8621a853217".',
              },
            })
          );

        expect(
          presentation?.change.summary
        ).toBe(
          "This is the first recorded Recommendation for the current project."
        );

        expect(
          presentation?.change.summary
        ).not.toContain(
          "dda66e18-62fc-46bf-99f6-d8621a853217"
        );
      }
    );
  }
);