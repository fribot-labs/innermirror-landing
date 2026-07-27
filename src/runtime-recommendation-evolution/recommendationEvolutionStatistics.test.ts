import {
    describe,
    expect,
    it,
} from "vitest";

import {
    createRecommendationEvolutionStatistics,
} from "./recommendationEvolutionStatistics";

import type {
    RecommendationEvolutionSnapshot,
    RecommendationEvolutionType,
    RecommendationLifecycleComparison,
} from "./recommendationEvolutionTypes";

import type {
    RuntimeNextAction,
} from "../runtime-next-action/runtimeNextActionTypes";

import type {
    RuntimeRecommendationLifecycleHistory,
    RuntimeRecommendationLifecycleRecord,
    RuntimeRecommendationLifecycleResolution,
    RuntimeRecommendationLifecycleState,
} from "../runtime-recommendation-lifecycle/runtimeRecommendationLifecycleTypes";

/* ------------------------------------------------------------------ */
/* Test Constants                                                     */
/* ------------------------------------------------------------------ */

const HISTORY_CREATED_AT =
  "2026-07-27T00:00:00.000Z";

const FIRST_CREATED_AT =
  "2026-07-27T00:05:00.000Z";

const SECOND_CREATED_AT =
  "2026-07-27T00:15:00.000Z";

const THIRD_CREATED_AT =
  "2026-07-27T00:25:00.000Z";

const FOURTH_CREATED_AT =
  "2026-07-27T00:35:00.000Z";

const COMPARED_AT =
  "2026-07-27T01:00:00.000Z";

/* ------------------------------------------------------------------ */
/* Lifecycle Fixtures                                                 */
/* ------------------------------------------------------------------ */

type LifecycleOverrides =
  Partial<
    Omit<
      RuntimeRecommendationLifecycleRecord,
      "recommendation" |
      "transitions"
    >
  >;

function createLifecycle(
  id:
    string,
  recommendationId:
    string,
  overrides:
    LifecycleOverrides = {},
): RuntimeRecommendationLifecycleRecord {
  const state:
    RuntimeRecommendationLifecycleState =
      overrides.state ??
      "active";

  const resolution:
    RuntimeRecommendationLifecycleResolution | null =
      overrides.resolution ??
      null;

  return {
    id,

    recommendationId,

    recommendation:
      {} as RuntimeNextAction,

    state,

    createdAt:
      overrides.createdAt ??
      FIRST_CREATED_AT,

    activatedAt:
      overrides.activatedAt ??
      FIRST_CREATED_AT,

    resolvedAt:
      overrides.resolvedAt ??
      null,

    archivedAt:
      overrides.archivedAt ??
      null,

    resolution,

    previousLifecycleId:
      overrides.previousLifecycleId ??
      null,

    nextLifecycleId:
      overrides.nextLifecycleId ??
      null,

    supersededByRecommendationId:
      overrides.supersededByRecommendationId ??
      null,

    transitions:
      [],

    updatedAt:
      overrides.updatedAt ??
      overrides.archivedAt ??
      overrides.resolvedAt ??
      overrides.activatedAt ??
      overrides.createdAt ??
      FIRST_CREATED_AT,
  };
}

/* ------------------------------------------------------------------ */
/* Snapshot Fixtures                                                  */
/* ------------------------------------------------------------------ */

function createSnapshot(
  lifecycle:
    RuntimeRecommendationLifecycleRecord,
  fingerprint:
    string,
): RecommendationEvolutionSnapshot {
  return {
    lifecycleId:
      lifecycle.id,

    recommendationId:
      lifecycle.recommendationId,

    fingerprint,

    kind:
      "reflect" as RecommendationEvolutionSnapshot["kind"],

    title:
      "Review the current implementation",

    description:
      "Review the implementation and record the next observation.",

    target:
      "runtime" as RecommendationEvolutionSnapshot["target"],

    confidence:
      "medium" as RecommendationEvolutionSnapshot["confidence"],

    source:
      "runtime" as RecommendationEvolutionSnapshot["source"],

    sourceLabel:
      "Runtime analysis",

    whySummary:
      "The latest implementation needs another observation.",

    evidenceSummary:
      "The current Lifecycle provides supporting evidence.",

    signalCount:
      2,

    createdAt:
      lifecycle.createdAt,

    activatedAt:
      lifecycle.activatedAt,

    resolvedAt:
      lifecycle.resolvedAt,

    resolution:
      lifecycle.resolution,
  };
}

/* ------------------------------------------------------------------ */
/* Comparison Fixtures                                                */
/* ------------------------------------------------------------------ */

function createComparison(
  current:
    RuntimeRecommendationLifecycleRecord,
  previous:
    RuntimeRecommendationLifecycleRecord | null,
  type:
    RecommendationEvolutionType,
  index:
    number,
): RecommendationLifecycleComparison {
  const currentSnapshot =
    createSnapshot(
      current,
      `fingerprint-${index}`,
    );

  const previousSnapshot =
    previous === null
      ? null
      : createSnapshot(
          previous,
          `fingerprint-${index - 1}`,
        );

  return {
    id:
      `comparison-${index}`,

    previous:
      previousSnapshot,

    current:
      currentSnapshot,

    type,

    magnitude:
      type === "initial" ||
      type === "repeated"
        ? "none"
        : "moderate",

    direction:
      type === "initial"
        ? "unresolved"
        : type === "repeated"
          ? "stable"
          : type === "refined"
            ? "narrowing"
            : type === "expanded"
              ? "broadening"
              : type === "completed-and-advanced"
                ? "advancing"
                : "redirecting",

    confidence:
      "high",

    dataQuality:
      previous === null
        ? "partial"
        : "sufficient",

    isRepeated:
      type === "repeated",

    isCompletionAdvance:
      type === "completed-and-advanced",

    isSupersession:
      type === "superseded",

    targetChanged:
      type === "redirected",

    kindChanged:
      false,

    confidenceChanged:
      false,

    fieldChanges:
      [],

    signals:
      [
        {
          type:
            type === "initial"
              ? "missing-comparison-data"
              : type === "repeated"
                ? "same-fingerprint"
                : type === "completed-and-advanced"
                  ? "previous-completed"
                  : type === "superseded"
                    ? "previous-superseded"
                    : type === "redirected"
                      ? "target-changed"
                      : "title-changed",

          description:
            "Test comparison signal.",

          weight:
            1,
        },
      ],

    comparedAt:
      COMPARED_AT,
  };
}

function createComparisons(
  records:
    RuntimeRecommendationLifecycleRecord[],
  types:
    RecommendationEvolutionType[],
): RecommendationLifecycleComparison[] {
  return records.map(
    (
      record,
      index,
    ) => {
      const previous =
        index === 0
          ? null
          : records[index - 1] ??
            null;

      const type =
        types[index] ??
        "refined";

      return createComparison(
        record,
        previous,
        type,
        index,
      );
    },
  );
}

/* ------------------------------------------------------------------ */
/* History Fixture                                                    */
/* ------------------------------------------------------------------ */

function createHistory(
  records:
    RuntimeRecommendationLifecycleRecord[],
): RuntimeRecommendationLifecycleHistory {
  const activeRecord =
    records.find(
      (
        record,
      ) =>
        record.state ===
        "active",
    );

  return {
    id:
      "history-1",

    activeLifecycleId:
      activeRecord?.id ??
      null,

    records,

    createdAt:
      HISTORY_CREATED_AT,

    updatedAt:
      COMPARED_AT,
  };
}

/* ------------------------------------------------------------------ */
/* Tests                                                              */
/* ------------------------------------------------------------------ */

describe(
  "createRecommendationEvolutionStatistics",
  () => {
    it(
      "returns zeroed statistics for an empty History",
      () => {
        const result =
          createRecommendationEvolutionStatistics({
            history:
              createHistory(
                [],
              ),

            comparisons:
              [],
          });

        expect(
          result,
        ).toEqual({
          totalRecommendationCount:
            0,

          comparableRecommendationCount:
            0,

          transitionCount:
            0,

          activeCount:
            0,

          completedCount:
            0,

          supersededCount:
            0,

          archivedCount:
            0,

          repeatedTransitionCount:
            0,

          changedTransitionCount:
            0,

          refinedTransitionCount:
            0,

          redirectedTransitionCount:
            0,

          completionAdvanceCount:
            0,

          completionRate:
            0,

          supersessionRate:
            0,

          repetitionRate:
            0,

          averageActiveDurationMs:
            null,
        });
      },
    );

    it(
      "counts current Lifecycle states",
      () => {
        const created =
          createLifecycle(
            "lifecycle-created",
            "recommendation-created",
            {
              state:
                "created",

              activatedAt:
                null,
            },
          );

        const active =
          createLifecycle(
            "lifecycle-active",
            "recommendation-active",
            {
              state:
                "active",

              createdAt:
                SECOND_CREATED_AT,

              activatedAt:
                SECOND_CREATED_AT,
            },
          );

        const completed =
          createLifecycle(
            "lifecycle-completed",
            "recommendation-completed",
            {
              state:
                "completed",

              resolution:
                "completed",

              createdAt:
                THIRD_CREATED_AT,

              activatedAt:
                THIRD_CREATED_AT,

              resolvedAt:
                FOURTH_CREATED_AT,
            },
          );

        const superseded =
          createLifecycle(
            "lifecycle-superseded",
            "recommendation-superseded",
            {
              state:
                "superseded",

              resolution:
                "superseded",

              createdAt:
                THIRD_CREATED_AT,

              activatedAt:
                THIRD_CREATED_AT,

              resolvedAt:
                FOURTH_CREATED_AT,
            },
          );

        const archived =
          createLifecycle(
            "lifecycle-archived",
            "recommendation-archived",
            {
              state:
                "archived",

              resolution:
                "archived",

              createdAt:
                THIRD_CREATED_AT,

              activatedAt:
                null,

              archivedAt:
                FOURTH_CREATED_AT,
            },
          );

        const records =
          [
            created,
            active,
            completed,
            superseded,
            archived,
          ];

        const comparisons =
          createComparisons(
            records,
            [
              "initial",
              "refined",
              "completed-and-advanced",
              "superseded",
              "redirected",
            ],
          );

        const result =
          createRecommendationEvolutionStatistics({
            history:
              createHistory(
                records,
              ),

            comparisons,
          });

        expect(
          result.totalRecommendationCount,
        ).toBe(
          5,
        );

        expect(
          result.activeCount,
        ).toBe(
          1,
        );

        expect(
          result.completedCount,
        ).toBe(
          1,
        );

        expect(
          result.supersededCount,
        ).toBe(
          1,
        );

        expect(
          result.archivedCount,
        ).toBe(
          1,
        );
      },
    );

    it(
      "counts repeated and changed transitions",
      () => {
        const first =
          createLifecycle(
            "lifecycle-1",
            "recommendation-1",
          );

        const second =
          createLifecycle(
            "lifecycle-2",
            "recommendation-2",
            {
              createdAt:
                SECOND_CREATED_AT,

              activatedAt:
                SECOND_CREATED_AT,
            },
          );

        const third =
          createLifecycle(
            "lifecycle-3",
            "recommendation-3",
            {
              createdAt:
                THIRD_CREATED_AT,

              activatedAt:
                THIRD_CREATED_AT,
            },
          );

        const records =
          [
            first,
            second,
            third,
          ];

        const comparisons =
          createComparisons(
            records,
            [
              "initial",
              "repeated",
              "redirected",
            ],
          );

        const result =
          createRecommendationEvolutionStatistics({
            history:
              createHistory(
                records,
              ),

            comparisons,
          });

        expect(
          result.comparableRecommendationCount,
        ).toBe(
          2,
        );

        expect(
          result.transitionCount,
        ).toBe(
          2,
        );

        expect(
          result.repeatedTransitionCount,
        ).toBe(
          1,
        );

        expect(
          result.changedTransitionCount,
        ).toBe(
          1,
        );

        expect(
          result.redirectedTransitionCount,
        ).toBe(
          1,
        );

        expect(
          result.repetitionRate,
        ).toBe(
          0.5,
        );
      },
    );

    it(
      "calculates completion and supersession rates from resolved Lifecycle states",
      () => {
        const completedOne =
          createLifecycle(
            "lifecycle-completed-1",
            "recommendation-completed-1",
            {
              state:
                "completed",

              resolution:
                "completed",

              resolvedAt:
                SECOND_CREATED_AT,
            },
          );

        const completedTwo =
          createLifecycle(
            "lifecycle-completed-2",
            "recommendation-completed-2",
            {
              state:
                "completed",

              resolution:
                "completed",

              createdAt:
                SECOND_CREATED_AT,

              activatedAt:
                SECOND_CREATED_AT,

              resolvedAt:
                THIRD_CREATED_AT,
            },
          );

        const superseded =
          createLifecycle(
            "lifecycle-superseded",
            "recommendation-superseded",
            {
              state:
                "superseded",

              resolution:
                "superseded",

              createdAt:
                THIRD_CREATED_AT,

              activatedAt:
                THIRD_CREATED_AT,

              resolvedAt:
                FOURTH_CREATED_AT,
            },
          );

        const records =
          [
            completedOne,
            completedTwo,
            superseded,
          ];

        const comparisons =
          createComparisons(
            records,
            [
              "initial",
              "completed-and-advanced",
              "superseded",
            ],
          );

        const result =
          createRecommendationEvolutionStatistics({
            history:
              createHistory(
                records,
              ),

            comparisons,
          });

        expect(
          result.completedCount,
        ).toBe(
          2,
        );

        expect(
          result.supersededCount,
        ).toBe(
          1,
        );

        expect(
          result.completionRate,
        ).toBeCloseTo(
          2 / 3,
        );

        expect(
          result.supersessionRate,
        ).toBeCloseTo(
          1 / 3,
        );
      },
    );

    it(
      "calculates average active duration from records with both timestamps",
      () => {
        const first =
          createLifecycle(
            "lifecycle-1",
            "recommendation-1",
            {
              state:
                "completed",

              resolution:
                "completed",

              activatedAt:
                "2026-07-27T00:00:00.000Z",

              resolvedAt:
                "2026-07-27T00:10:00.000Z",
            },
          );

        const second =
          createLifecycle(
            "lifecycle-2",
            "recommendation-2",
            {
              state:
                "superseded",

              resolution:
                "superseded",

              createdAt:
                SECOND_CREATED_AT,

              activatedAt:
                "2026-07-27T00:10:00.000Z",

              resolvedAt:
                "2026-07-27T00:30:00.000Z",
            },
          );

        const third =
          createLifecycle(
            "lifecycle-3",
            "recommendation-3",
            {
              state:
                "active",

              createdAt:
                THIRD_CREATED_AT,

              activatedAt:
                THIRD_CREATED_AT,

              resolvedAt:
                null,
            },
          );

        const records =
          [
            first,
            second,
            third,
          ];

        const comparisons =
          createComparisons(
            records,
            [
              "initial",
              "superseded",
              "refined",
            ],
          );

        const result =
          createRecommendationEvolutionStatistics({
            history:
              createHistory(
                records,
              ),

            comparisons,
          });

        const tenMinutes =
          10 *
          60 *
          1000;

        const twentyMinutes =
          20 *
          60 *
          1000;

        expect(
          result.averageActiveDurationMs,
        ).toBe(
          (
            tenMinutes +
            twentyMinutes
          ) /
          2,
        );
      },
    );

    it(
      "counts refined, redirected, and completion-advance transitions independently",
      () => {
        const records =
          [
            createLifecycle(
              "lifecycle-1",
              "recommendation-1",
            ),

            createLifecycle(
              "lifecycle-2",
              "recommendation-2",
              {
                createdAt:
                  SECOND_CREATED_AT,

                activatedAt:
                  SECOND_CREATED_AT,
              },
            ),

            createLifecycle(
              "lifecycle-3",
              "recommendation-3",
              {
                createdAt:
                  THIRD_CREATED_AT,

                activatedAt:
                  THIRD_CREATED_AT,
              },
            ),

            createLifecycle(
              "lifecycle-4",
              "recommendation-4",
              {
                createdAt:
                  FOURTH_CREATED_AT,

                activatedAt:
                  FOURTH_CREATED_AT,
              },
            ),
          ];

        const comparisons =
          createComparisons(
            records,
            [
              "initial",
              "refined",
              "redirected",
              "completed-and-advanced",
            ],
          );

        const result =
          createRecommendationEvolutionStatistics({
            history:
              createHistory(
                records,
              ),

            comparisons,
          });

        expect(
          result.refinedTransitionCount,
        ).toBe(
          1,
        );

        expect(
          result.redirectedTransitionCount,
        ).toBe(
          1,
        );

        expect(
          result.completionAdvanceCount,
        ).toBe(
          1,
        );

        expect(
          result.changedTransitionCount,
        ).toBe(
          3,
        );
      },
    );

    it(
      "rejects a comparison sequence whose first item is not initial",
      () => {
        const first =
          createLifecycle(
            "lifecycle-1",
            "recommendation-1",
          );

        const comparisons =
          createComparisons(
            [
              first,
            ],
            [
              "initial",
            ],
          );

        const initialComparison =
          comparisons[0];

        if (
          initialComparison === undefined
        ) {
          throw new Error(
            "Initial comparison fixture is missing.",
          );
        }

        comparisons[0] = {
          ...initialComparison,

          type:
            "refined",

          previous:
            initialComparison.current,
        };

        expect(
          () =>
            createRecommendationEvolutionStatistics({
              history:
                createHistory([
                  first,
                ]),

              comparisons,
            }),
        ).toThrow(
          "The first comparison must be an initial comparison with previous=null.",
        );
      },
    );
  },
);