import {
  describe,
  expect,
  it,
} from "vitest";

import {
  compareRecommendationLifecycle,
} from "./compareRecommendationLifecycle";

import type {
  RecommendationEvolutionSnapshot,
} from "./recommendationEvolutionTypes";

import type {
  RuntimeNextAction,
} from "../runtime-next-action/runtimeNextActionTypes";

import type {
  RuntimeRecommendationLifecycleRecord,
  RuntimeRecommendationLifecycleResolution,
  RuntimeRecommendationLifecycleState,
} from "../runtime-recommendation-lifecycle/runtimeRecommendationLifecycleTypes";

const COMPARED_AT =
  "2026-07-27T00:10:00.000Z";

const FIRST_CREATED_AT =
  "2026-07-27T00:00:00.000Z";

const SECOND_CREATED_AT =
  "2026-07-27T00:05:00.000Z";

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
      overrides.resolvedAt ??
      overrides.archivedAt ??
      overrides.activatedAt ??
      overrides.createdAt ??
      FIRST_CREATED_AT,
  };
}

type SnapshotOverrides =
  Partial<
    RecommendationEvolutionSnapshot
  >;

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
      "The latest lifecycle record provides supporting evidence.",
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
        `Missing test snapshot for lifecycle "${lifecycle.id}".`,
      );
    }

    return {
      ...snapshot,
      fingerprint,
    };
  };
}

function signalTypes(
  signals:
    ReturnType<
      typeof compareRecommendationLifecycle
    >["signals"],
): string[] {
  return signals.map(
    (
      signal,
    ) =>
      signal.type,
  );
}

describe(
  "compareRecommendationLifecycle",
  () => {
    it(
      "creates an initial comparison when no previous Lifecycle exists",
      () => {
        const current =
          createLifecycle(
            "lifecycle-1",
            "recommendation-1",
          );

        const currentSnapshot =
          createSnapshot(
            current,
            "fingerprint-1",
          );

        const result =
          compareRecommendationLifecycle({
            previous:
              null,
            current,
            previousFingerprint:
              null,
            currentFingerprint:
              "fingerprint-1",
            createSnapshot:
              createSnapshotFactory(
                new Map([
                  [
                    current.id,
                    currentSnapshot,
                  ],
                ]),
              ),
            comparisonId:
              "comparison-1",
            comparedAt:
              COMPARED_AT,
          });

        expect(
          result.id,
        ).toBe(
          "comparison-1",
        );

        expect(
          result.previous,
        ).toBeNull();

        expect(
          result.current.lifecycleId,
        ).toBe(
          current.id,
        );

        expect(
          result.type,
        ).toBe(
          "initial",
        );

        expect(
          result.direction,
        ).toBe(
          "unresolved",
        );

        expect(
          result.isRepeated,
        ).toBe(
          false,
        );

        expect(
          signalTypes(
            result.signals,
          ),
        ).toContain(
          "missing-comparison-data",
        );
      },
    );

    it(
      "classifies matching fingerprints as repeated",
      () => {
        const previous =
          createLifecycle(
            "lifecycle-1",
            "recommendation-1",
            {
              nextLifecycleId:
                "lifecycle-2",
            },
          );

        const current =
          createLifecycle(
            "lifecycle-2",
            "recommendation-2",
            {
              createdAt:
                SECOND_CREATED_AT,
              activatedAt:
                SECOND_CREATED_AT,
              previousLifecycleId:
                previous.id,
            },
          );

        const previousSnapshot =
          createSnapshot(
            previous,
            "same-fingerprint",
          );

        const currentSnapshot =
          createSnapshot(
            current,
            "same-fingerprint",
          );

        const result =
          compareRecommendationLifecycle({
            previous,
            current,
            previousFingerprint:
              "same-fingerprint",
            currentFingerprint:
              "same-fingerprint",
            createSnapshot:
              createSnapshotFactory(
                new Map([
                  [
                    previous.id,
                    previousSnapshot,
                  ],
                  [
                    current.id,
                    currentSnapshot,
                  ],
                ]),
              ),
            comparisonId:
              "comparison-repeat",
            comparedAt:
              COMPARED_AT,
          });

        expect(
          result.type,
        ).toBe(
          "repeated",
        );

        expect(
          result.isRepeated,
        ).toBe(
          true,
        );

        expect(
          result.direction,
        ).toBe(
          "stable",
        );

        expect(
          result.magnitude,
        ).toBe(
          "none",
        );

        expect(
          signalTypes(
            result.signals,
          ),
        ).toContain(
          "same-fingerprint",
        );
      },
    );

    it(
      "classifies a target change as redirected",
      () => {
        const previous =
          createLifecycle(
            "lifecycle-1",
            "recommendation-1",
            {
              nextLifecycleId:
                "lifecycle-2",
            },
          );

        const current =
          createLifecycle(
            "lifecycle-2",
            "recommendation-2",
            {
              createdAt:
                SECOND_CREATED_AT,
              activatedAt:
                SECOND_CREATED_AT,
              previousLifecycleId:
                previous.id,
            },
          );

        const previousSnapshot =
          createSnapshot(
            previous,
            "fingerprint-1",
            {
              target:
                "runtime" as RecommendationEvolutionSnapshot["target"],
            },
          );

        const currentSnapshot =
          createSnapshot(
            current,
            "fingerprint-2",
            {
              target:
                "project" as RecommendationEvolutionSnapshot["target"],
            },
          );

        const result =
          compareRecommendationLifecycle({
            previous,
            current,
            previousFingerprint:
              "fingerprint-1",
            currentFingerprint:
              "fingerprint-2",
            createSnapshot:
              createSnapshotFactory(
                new Map([
                  [
                    previous.id,
                    previousSnapshot,
                  ],
                  [
                    current.id,
                    currentSnapshot,
                  ],
                ]),
              ),
            comparisonId:
              "comparison-redirect",
            comparedAt:
              COMPARED_AT,
          });

        expect(
          result.type,
        ).toBe(
          "redirected",
        );

        expect(
          result.targetChanged,
        ).toBe(
          true,
        );

        expect(
          result.direction,
        ).toBe(
          "redirecting",
        );

        expect(
          signalTypes(
            result.signals,
          ),
        ).toContain(
          "target-changed",
        );

        expect(
          result.fieldChanges,
        ).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field:
                "target",
              changed:
                true,
            }),
          ]),
        );
      },
    );

    it(
      "classifies movement after completion as completed-and-advanced",
      () => {
        const previous =
          createLifecycle(
            "lifecycle-1",
            "recommendation-1",
            {
              state:
                "completed",
              resolution:
                "completed",
              resolvedAt:
                SECOND_CREATED_AT,
              nextLifecycleId:
                "lifecycle-2",
            },
          );

        const current =
          createLifecycle(
            "lifecycle-2",
            "recommendation-2",
            {
              createdAt:
                SECOND_CREATED_AT,
              activatedAt:
                SECOND_CREATED_AT,
              previousLifecycleId:
                previous.id,
            },
          );

        const previousSnapshot =
          createSnapshot(
            previous,
            "fingerprint-1",
          );

        const currentSnapshot =
          createSnapshot(
            current,
            "fingerprint-2",
            {
              title:
                "Continue with the next implementation step",
            },
          );

        const result =
          compareRecommendationLifecycle({
            previous,
            current,
            previousFingerprint:
              "fingerprint-1",
            currentFingerprint:
              "fingerprint-2",
            createSnapshot:
              createSnapshotFactory(
                new Map([
                  [
                    previous.id,
                    previousSnapshot,
                  ],
                  [
                    current.id,
                    currentSnapshot,
                  ],
                ]),
              ),
            comparisonId:
              "comparison-completed",
            comparedAt:
              COMPARED_AT,
          });

        expect(
          result.type,
        ).toBe(
          "completed-and-advanced",
        );

        expect(
          result.isCompletionAdvance,
        ).toBe(
          true,
        );

        expect(
          result.direction,
        ).toBe(
          "advancing",
        );

        expect(
          signalTypes(
            result.signals,
          ),
        ).toContain(
          "previous-completed",
        );
      },
    );

    it(
      "classifies replacement of an unfinished Recommendation as superseded",
      () => {
        const previous =
          createLifecycle(
            "lifecycle-1",
            "recommendation-1",
            {
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
          );

        const current =
          createLifecycle(
            "lifecycle-2",
            "recommendation-2",
            {
              createdAt:
                SECOND_CREATED_AT,
              activatedAt:
                SECOND_CREATED_AT,
              previousLifecycleId:
                previous.id,
            },
          );

        const previousSnapshot =
          createSnapshot(
            previous,
            "fingerprint-1",
          );

        const currentSnapshot =
          createSnapshot(
            current,
            "fingerprint-2",
            {
              title:
                "Use a different implementation approach",
            },
          );

        const result =
          compareRecommendationLifecycle({
            previous,
            current,
            previousFingerprint:
              "fingerprint-1",
            currentFingerprint:
              "fingerprint-2",
            createSnapshot:
              createSnapshotFactory(
                new Map([
                  [
                    previous.id,
                    previousSnapshot,
                  ],
                  [
                    current.id,
                    currentSnapshot,
                  ],
                ]),
              ),
            comparisonId:
              "comparison-superseded",
            comparedAt:
              COMPARED_AT,
          });

        expect(
          result.type,
        ).toBe(
          "superseded",
        );

        expect(
          result.isSupersession,
        ).toBe(
          true,
        );

        expect(
          signalTypes(
            result.signals,
          ),
        ).toContain(
          "previous-superseded",
        );
      },
    );

    it(
      "records an explicit Lifecycle link",
      () => {
        const previous =
          createLifecycle(
            "lifecycle-1",
            "recommendation-1",
            {
              nextLifecycleId:
                "lifecycle-2",
            },
          );

        const current =
          createLifecycle(
            "lifecycle-2",
            "recommendation-2",
            {
              createdAt:
                SECOND_CREATED_AT,
              activatedAt:
                SECOND_CREATED_AT,
              previousLifecycleId:
                previous.id,
            },
          );

        const previousSnapshot =
          createSnapshot(
            previous,
            "fingerprint-1",
          );

        const currentSnapshot =
          createSnapshot(
            current,
            "fingerprint-2",
            {
              title:
                "Review the current implementation in more detail",
            },
          );

        const result =
          compareRecommendationLifecycle({
            previous,
            current,
            previousFingerprint:
              "fingerprint-1",
            currentFingerprint:
              "fingerprint-2",
            createSnapshot:
              createSnapshotFactory(
                new Map([
                  [
                    previous.id,
                    previousSnapshot,
                  ],
                  [
                    current.id,
                    currentSnapshot,
                  ],
                ]),
              ),
            comparisonId:
              "comparison-linked",
            comparedAt:
              COMPARED_AT,
          });

        expect(
          signalTypes(
            result.signals,
          ),
        ).toContain(
          "lifecycle-linked",
        );
      },
    );
  },
);