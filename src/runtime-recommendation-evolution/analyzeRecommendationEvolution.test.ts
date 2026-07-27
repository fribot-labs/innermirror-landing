import {
    describe,
    expect,
    it,
} from "vitest";

import {
    analyzeRecommendationEvolution,
} from "./analyzeRecommendationEvolution";

import type {
    RecommendationEvolutionSnapshot,
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

const ANALYZED_AT =
  "2026-07-27T01:00:00.000Z";

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

/* ------------------------------------------------------------------ */
/* Lifecycle Fixture Types                                            */
/* ------------------------------------------------------------------ */

type LifecycleOverrides =
  Partial<
    Omit<
      RuntimeRecommendationLifecycleRecord,
      "recommendation" |
      "transitions"
    >
  >;

type SnapshotOverrides =
  Partial<
    RecommendationEvolutionSnapshot
  >;

type CreateLifecycleFixtureParams = {
  id:
    string;

  recommendationId:
    string;

  fingerprint:
    string;

  snapshotOverrides?:
    SnapshotOverrides;

  lifecycleOverrides?:
    LifecycleOverrides;
};

/* ------------------------------------------------------------------ */
/* Lifecycle Fixtures                                                 */
/* ------------------------------------------------------------------ */

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
  overrides:
    SnapshotOverrides = {},
): RecommendationEvolutionSnapshot {
  return {
    lifecycleId:
      lifecycle.id,

    recommendationId:
      lifecycle.recommendationId,

    fingerprint,

    kind:
      (
        overrides.kind ??
        "reflect"
      ) as RecommendationEvolutionSnapshot["kind"],

    title:
      overrides.title ??
      "Review the current implementation",

    description:
      overrides.description ??
      "Review the current implementation and record the next observation.",

    target:
      (
        overrides.target ??
        "runtime"
      ) as RecommendationEvolutionSnapshot["target"],

    confidence:
      (
        overrides.confidence ??
        "medium"
      ) as RecommendationEvolutionSnapshot["confidence"],

    source:
      (
        overrides.source ??
        "runtime"
      ) as RecommendationEvolutionSnapshot["source"],

    sourceLabel:
      overrides.sourceLabel ??
      "Runtime analysis",

    whySummary:
      overrides.whySummary ??
      "The current implementation needs another observation.",

    evidenceSummary:
      overrides.evidenceSummary ??
      "The latest Lifecycle Record provides supporting evidence.",

    signalCount:
      overrides.signalCount ??
      2,

    createdAt:
      overrides.createdAt ??
      lifecycle.createdAt,

    activatedAt:
      overrides.activatedAt ??
      lifecycle.activatedAt,

    resolvedAt:
      overrides.resolvedAt ??
      lifecycle.resolvedAt,

    resolution:
      overrides.resolution ??
      lifecycle.resolution,
  };
}

/* ------------------------------------------------------------------ */
/* Combined Fixture                                                   */
/* ------------------------------------------------------------------ */

function createLifecycleFixture(
  params:
    CreateLifecycleFixtureParams,
): {
  lifecycle:
    RuntimeRecommendationLifecycleRecord;

  snapshot:
    RecommendationEvolutionSnapshot;

  fingerprint:
    string;
} {
  const lifecycle =
    createLifecycle(
      params.id,
      params.recommendationId,
      params.lifecycleOverrides,
    );

  const snapshot =
    createSnapshot(
      lifecycle,
      params.fingerprint,
      params.snapshotOverrides,
    );

  return {
    lifecycle,
    snapshot,
    fingerprint:
      params.fingerprint,
  };
}

/* ------------------------------------------------------------------ */
/* History Fixtures                                                   */
/* ------------------------------------------------------------------ */

function createHistory(
  records:
    RuntimeRecommendationLifecycleRecord[],
  overrides:
    Partial<
      RuntimeRecommendationLifecycleHistory
    > = {},
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
      overrides.id ??
      "history-1",

    activeLifecycleId:
      overrides.activeLifecycleId ??
      activeRecord?.id ??
      null,

    records,

    createdAt:
      overrides.createdAt ??
      HISTORY_CREATED_AT,

    updatedAt:
      overrides.updatedAt ??
      ANALYZED_AT,
  };
}

/* ------------------------------------------------------------------ */
/* Fingerprint Factory                                                */
/* ------------------------------------------------------------------ */

function createFingerprintFactory(
  fingerprints:
    ReadonlyMap<
      string,
      string
    >,
): (
  lifecycle:
    RuntimeRecommendationLifecycleRecord,
) => string {
  return (
    lifecycle,
  ) => {
    const fingerprint =
      fingerprints.get(
        lifecycle.id,
      );

    if (
      fingerprint === undefined
    ) {
      throw new Error(
        `Missing test fingerprint for Lifecycle "${lifecycle.id}".`,
      );
    }

    return fingerprint;
  };
}

/* ------------------------------------------------------------------ */
/* Snapshot Factory                                                   */
/* ------------------------------------------------------------------ */

function createSnapshotFactory(
  snapshots:
    ReadonlyMap<
      string,
      RecommendationEvolutionSnapshot
    >,
): (
  lifecycle:
    RuntimeRecommendationLifecycleRecord,
  fingerprint:
    string,
) => RecommendationEvolutionSnapshot {
  return (
    lifecycle,
    fingerprint,
  ) => {
    const snapshot =
      snapshots.get(
        lifecycle.id,
      );

    if (
      snapshot === undefined
    ) {
      throw new Error(
        `Missing test snapshot for Lifecycle "${lifecycle.id}".`,
      );
    }

    return {
      ...snapshot,
      fingerprint,
    };
  };
}

/* ------------------------------------------------------------------ */
/* Comparison ID Factory                                              */
/* ------------------------------------------------------------------ */

function createComparisonId(
  previous:
    RuntimeRecommendationLifecycleRecord | null,
  current:
    RuntimeRecommendationLifecycleRecord,
): string {
  if (
    previous === null
  ) {
    return (
      `comparison-initial-${current.id}`
    );
  }

  return (
    `comparison-${previous.id}-${current.id}`
  );
}

/* ------------------------------------------------------------------ */
/* Analyze Helper                                                     */
/* ------------------------------------------------------------------ */

function analyzeFixtures(
  fixtures:
    ReturnType<
      typeof createLifecycleFixture
    >[],
  historyOverrides:
    Partial<
      RuntimeRecommendationLifecycleHistory
    > = {},
) {
  const history =
    createHistory(
      fixtures.map(
        (
          fixture,
        ) =>
          fixture.lifecycle,
      ),
      historyOverrides,
    );

  const fingerprints =
    new Map(
      fixtures.map(
        (
          fixture,
        ) =>
          [
            fixture.lifecycle.id,
            fixture.fingerprint,
          ] as const,
      ),
    );

  const snapshots =
    new Map(
      fixtures.map(
        (
          fixture,
        ) =>
          [
            fixture.lifecycle.id,
            fixture.snapshot,
          ] as const,
      ),
    );

  return analyzeRecommendationEvolution({
    history,

    analyzedAt:
      ANALYZED_AT,

    createFingerprint:
      createFingerprintFactory(
        fingerprints,
      ),

    createSnapshot:
      createSnapshotFactory(
        snapshots,
      ),

    createComparisonId,
  });
}

/* ------------------------------------------------------------------ */
/* Assertion Helpers                                                  */
/* ------------------------------------------------------------------ */

function comparisonTypes(
  result:
    ReturnType<
      typeof analyzeRecommendationEvolution
    >,
): string[] {
  return result.comparisons.map(
    (
      comparison,
    ) =>
      comparison.type,
  );
}

function latestComparableComparison(
  result:
    ReturnType<
      typeof analyzeRecommendationEvolution
    >,
) {
  for (
    let index =
      result.comparisons.length - 1;
    index >= 0;
    index -= 1
  ) {
    const comparison =
      result.comparisons[index];

    if (
      comparison !== undefined &&
      comparison.previous !== null
    ) {
      return comparison;
    }
  }

  return null;
}

/* ------------------------------------------------------------------ */
/* Test Suite                                                         */
/* ------------------------------------------------------------------ */

describe(
  "analyzeRecommendationEvolution",
  () => {
    it(
      "returns an empty Evolution result for an empty Lifecycle History",
      () => {
        const result =
          analyzeFixtures(
            [],
          );

        expect(
          result.version,
        ).toBe(
          1,
        );

        expect(
          result.historyId,
        ).toBe(
          "history-1",
        );

        expect(
          result.analyzedAt,
        ).toBe(
          ANALYZED_AT,
        );

        expect(
          result.comparisons,
        ).toEqual(
          [],
        );

        expect(
          result.statistics.totalRecommendationCount,
        ).toBe(
          0,
        );

        expect(
          result.statistics.comparableRecommendationCount,
        ).toBe(
          0,
        );

        expect(
          result.statistics.transitionCount,
        ).toBe(
          0,
        );

        expect(
          result.summary.latestType,
        ).toBeNull();

        expect(
          result.summary.latestDirection,
        ).toBeNull();

        expect(
          result.summary.latestMagnitude,
        ).toBeNull();

        expect(
          result.summary.recommendationChanged,
        ).toBe(
          false,
        );

        expect(
          result.summary.hasSufficientHistory,
        ).toBe(
          false,
        );
      },
    );

    it(
      "creates one initial comparison for a single Lifecycle Record",
      () => {
        const first =
          createLifecycleFixture({
            id:
              "lifecycle-1",

            recommendationId:
              "recommendation-1",

            fingerprint:
              "fingerprint-1",
          });

        const result =
          analyzeFixtures([
            first,
          ]);

        expect(
          result.comparisons,
        ).toHaveLength(
          1,
        );

        expect(
          result.comparisons[0],
        ).toMatchObject({
          id:
            "comparison-initial-lifecycle-1",

          previous:
            null,

          type:
            "initial",

          direction:
            "unresolved",

          isRepeated:
            false,

          isCompletionAdvance:
            false,

          isSupersession:
            false,
        });

        expect(
          result.statistics.totalRecommendationCount,
        ).toBe(
          1,
        );

        expect(
          result.statistics.comparableRecommendationCount,
        ).toBe(
          0,
        );

        expect(
          result.summary.latestType,
        ).toBeNull();

        expect(
          result.summary.recommendationChanged,
        ).toBe(
          false,
        );

        expect(
          result.summary.hasSufficientHistory,
        ).toBe(
          false,
        );
      },
    );

    it(
      "creates a repeated comparison when consecutive fingerprints match",
      () => {
        const first =
          createLifecycleFixture({
            id:
              "lifecycle-1",

            recommendationId:
              "recommendation-1",

            fingerprint:
              "same-fingerprint",

            lifecycleOverrides: {
              state:
                "archived",

              resolution:
                "archived",

              archivedAt:
                SECOND_CREATED_AT,

              nextLifecycleId:
                "lifecycle-2",
          },
        });

        const second =
          createLifecycleFixture({
            id:
              "lifecycle-2",

            recommendationId:
              "recommendation-2",

            fingerprint:
              "same-fingerprint",

            lifecycleOverrides: {
              createdAt:
                SECOND_CREATED_AT,

              activatedAt:
                SECOND_CREATED_AT,

              previousLifecycleId:
                "lifecycle-1",
            },
          });

        const result =
          analyzeFixtures([
            first,
            second,
          ]);

        expect(
          comparisonTypes(
            result,
          ),
        ).toEqual([
          "initial",
          "repeated",
        ]);

        const latest =
          latestComparableComparison(
            result,
          );

        expect(
          latest,
        ).not.toBeNull();

        expect(
          latest,
        ).toMatchObject({
          type:
            "repeated",

          direction:
            "stable",

          magnitude:
            "none",

          isRepeated:
            true,
        });

        expect(
          result.statistics.totalRecommendationCount,
        ).toBe(
          2,
        );

        expect(
          result.statistics.comparableRecommendationCount,
        ).toBe(
          1,
        );

        expect(
          result.statistics.repeatedTransitionCount,
        ).toBe(
          1,
        );

        expect(
          result.statistics.repetitionRate,
        ).toBe(
          1,
        );

        expect(
          result.summary.latestType,
        ).toBe(
          "repeated",
        );

        expect(
          result.summary.latestDirection,
        ).toBe(
          "stable",
        );

        expect(
          result.summary.recommendationChanged,
        ).toBe(
          false,
        );

        expect(
          result.summary.hasSufficientHistory,
        ).toBe(
          false,
        );
      },
    );

    it(
      "creates a redirected comparison when the Recommendation target changes",
      () => {
        const first =
          createLifecycleFixture({
            id:
              "lifecycle-1",

            recommendationId:
              "recommendation-1",

            fingerprint:
              "fingerprint-1",

            snapshotOverrides: {
              target:
                "runtime" as RecommendationEvolutionSnapshot["target"],
            },

            lifecycleOverrides: {
              state:
                "archived",

              resolution:
                "archived",

              archivedAt:
                SECOND_CREATED_AT,

              nextLifecycleId:
                "lifecycle-2",
          },
        });

        const second =
          createLifecycleFixture({
            id:
              "lifecycle-2",

            recommendationId:
              "recommendation-2",

            fingerprint:
              "fingerprint-2",

            snapshotOverrides: {
              target:
                "project" as RecommendationEvolutionSnapshot["target"],
            },

            lifecycleOverrides: {
              createdAt:
                SECOND_CREATED_AT,

              activatedAt:
                SECOND_CREATED_AT,

              previousLifecycleId:
                "lifecycle-1",
            },
          });

        const result =
          analyzeFixtures([
            first,
            second,
          ]);

        expect(
          comparisonTypes(
            result,
          ),
        ).toEqual([
          "initial",
          "redirected",
        ]);

        const latest =
          latestComparableComparison(
            result,
          );

        expect(
          latest,
        ).toMatchObject({
          type:
            "redirected",

          direction:
            "redirecting",

          targetChanged:
            true,

          isRepeated:
            false,
        });

        expect(
          latest?.signals.map(
            (
              signal,
            ) =>
              signal.type,
          ),
        ).toContain(
          "target-changed",
        );

        expect(
          result.statistics.redirectedTransitionCount,
        ).toBe(
          1,
        );

        expect(
          result.statistics.changedTransitionCount,
        ).toBe(
          1,
        );

        expect(
          result.summary.latestType,
        ).toBe(
          "redirected",
        );

        expect(
          result.summary.latestDirection,
        ).toBe(
          "redirecting",
        );

        expect(
          result.summary.recommendationChanged,
        ).toBe(
          true,
        );
      },
    );

    it(
      "creates a completed-and-advanced comparison after completion",
      () => {
        const first =
          createLifecycleFixture({
            id:
              "lifecycle-1",

            recommendationId:
              "recommendation-1",

            fingerprint:
              "fingerprint-1",

            lifecycleOverrides: {
              state:
                "completed",

              resolution:
                "completed",

              resolvedAt:
                SECOND_CREATED_AT,

              nextLifecycleId:
                "lifecycle-2",
            },
          });

        const second =
          createLifecycleFixture({
            id:
              "lifecycle-2",

            recommendationId:
              "recommendation-2",

            fingerprint:
              "fingerprint-2",

            snapshotOverrides: {
              title:
                "Continue with the next implementation step",
            },

            lifecycleOverrides: {
              createdAt:
                SECOND_CREATED_AT,

              activatedAt:
                SECOND_CREATED_AT,

              previousLifecycleId:
                "lifecycle-1",
            },
          });

        const result =
          analyzeFixtures([
            first,
            second,
          ]);

        const latest =
          latestComparableComparison(
            result,
          );

        expect(
          latest,
        ).toMatchObject({
          type:
            "completed-and-advanced",

          direction:
            "advancing",

          isCompletionAdvance:
            true,
        });

        expect(
          latest?.signals.map(
            (
              signal,
            ) =>
              signal.type,
          ),
        ).toContain(
          "previous-completed",
        );

        expect(
          result.statistics.completedCount,
        ).toBe(
          1,
        );

        expect(
          result.statistics.completionAdvanceCount,
        ).toBe(
          1,
        );

        expect(
          result.summary.latestType,
        ).toBe(
          "completed-and-advanced",
        );

        expect(
          result.summary.latestDirection,
        ).toBe(
          "advancing",
        );

        expect(
          result.summary.recommendationChanged,
        ).toBe(
          true,
        );
      },
    );

    it(
      "creates a superseded comparison when an unfinished Recommendation is replaced",
      () => {
        const first =
          createLifecycleFixture({
            id:
              "lifecycle-1",

            recommendationId:
              "recommendation-1",

            fingerprint:
              "fingerprint-1",

            lifecycleOverrides: {
              state:
                "superseded",

              resolution:
                "superseded",

              resolvedAt:
                SECOND_CREATED_AT,

              nextLifecycleId:
                "lifecycle-2",

              supersededByRecommendationId:
                "recommendation-2",
            },
          });

        const second =
          createLifecycleFixture({
            id:
              "lifecycle-2",

            recommendationId:
              "recommendation-2",

            fingerprint:
              "fingerprint-2",

            snapshotOverrides: {
              title:
                "Use a different implementation approach",
            },

            lifecycleOverrides: {
              createdAt:
                SECOND_CREATED_AT,

              activatedAt:
                SECOND_CREATED_AT,

              previousLifecycleId:
                "lifecycle-1",
            },
          });

        const result =
          analyzeFixtures([
            first,
            second,
          ]);

        const latest =
          latestComparableComparison(
            result,
          );

        expect(
          latest,
        ).toMatchObject({
          type:
            "superseded",

          isSupersession:
            true,
        });

        expect(
          latest?.signals.map(
            (
              signal,
            ) =>
              signal.type,
          ),
        ).toContain(
          "previous-superseded",
        );

        expect(
          result.statistics.supersededCount,
        ).toBe(
          1,
        );

        expect(
          result.summary.latestType,
        ).toBe(
          "superseded",
        );

        expect(
          result.summary.recommendationChanged,
        ).toBe(
          true,
        );
      },
    );
  },
);