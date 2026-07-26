import {
    describe,
    expect,
    it,
} from "vitest";

import type {
    RuntimeActionHistoryEntry,
    RuntimeActionHistorySnapshot,
    RuntimeActionHistoryState,
    RuntimeActionObservationSnapshot,
    RuntimeActionTransitionType,
} from "../../runtime-action-history/runtimeActionHistoryTypes";

import type {
    RuntimeNextAction,
} from "../../runtime-next-action/runtimeNextActionTypes";

import {
    advanceRuntimeRecommendationLifecycle,
} from "../advanceRuntimeRecommendationLifecycle";

import {
    appendRuntimeRecommendationLifecycle,
    createRecommendationLifecycleHistory,
    replaceRuntimeRecommendationLifecycle,
} from "../createRecommendationLifecycleHistory";

import {
    createNextRecommendationLifecycle,
} from "../createNextRecommendationLifecycle";

import {
    createRuntimeActionHistoryFromLifecycle,
} from "../createRuntimeActionHistoryFromLifecycle";

import {
    createRuntimeRecommendationLifecycle,
} from "../createRuntimeRecommendationLifecycle";

import type {
    RuntimeRecommendationLifecycleHistory,
    RuntimeRecommendationLifecycleRecord,
} from "../runtimeRecommendationLifecycleTypes";

/* ------------------------------------------------------------------ */
/* Constants */
/* ------------------------------------------------------------------ */

const HISTORY_CREATED_AT =
  "2026-07-26T08:00:00.000Z";

const FIRST_OBSERVED_AT =
  "2026-07-26T08:10:00.000Z";

const SECOND_OBSERVED_AT =
  "2026-07-26T09:00:00.000Z";

const THIRD_OBSERVED_AT =
  "2026-07-26T10:00:00.000Z";

const PROJECT_ID =
  "project-001";

/* ------------------------------------------------------------------ */
/* Runtime Recommendation Fixture */
/* ------------------------------------------------------------------ */

/**
 * Lifecycle Adapter 테스트는 RuntimeNextAction 내부 생성 로직이 아니라
 * Recommendation 상태를 Action History로 변환하는 동작을 검증합니다.
 *
 * 실제 프로젝트에 공용 RuntimeNextAction Fixture가 있다면
 * 이 함수 대신 공용 Fixture를 import해서 사용해도 됩니다.
 */
function createRuntimeNextActionFixture(
  title =
    "Review the current project direction",
): RuntimeNextAction {
  return {
    kind:
      "reflection",

    title,

    description:
      "Record a reflection about the current project direction.",

    target:
      "reflection",

    confidence:
      "high",

    source:
      "runtime",

    sourceLabel:
      "Runtime",

    why:
      null,

    evidence:
      null,
  } as unknown as RuntimeNextAction;
}

/* ------------------------------------------------------------------ */
/* Action History Fixtures */
/* ------------------------------------------------------------------ */

function createEmptyActionHistory():
  RuntimeActionHistoryState {
  return {
    version:
      1,

    entries:
      [],

    transitions:
      [],

    activeEntryId:
      null,
  };
}

function createObservationFixture(
  overrides:
    Partial<RuntimeActionObservationSnapshot> = {},
): RuntimeActionObservationSnapshot {
  return {
    reflectionCount:
      1,

    githubSnapshotRevision:
      "github-revision-001",

    currentFocus:
      "Recommendation lifecycle integration",

    connectedEventCount:
      2,

    runtimeAnalysisRevision:
      "analysis-revision-001",

    ...overrides,
  };
}

function createActionSnapshot(
  lifecycle:
    RuntimeRecommendationLifecycleRecord,
): RuntimeActionHistorySnapshot {
  const recommendation =
    lifecycle.recommendation as unknown as {
      kind:
        RuntimeActionHistorySnapshot["kind"];

      title:
        string;

      description:
        string;

      target:
        RuntimeActionHistorySnapshot["target"];

      confidence:
        RuntimeActionHistorySnapshot["confidence"];

      source:
        RuntimeActionHistorySnapshot["source"];

      sourceLabel?:
        string;
    };

  return {
    kind:
      recommendation.kind,

    title:
      recommendation.title,

    description:
      recommendation.description,

    target:
      recommendation.target,

    confidence:
      recommendation.confidence,

    source:
      recommendation.source,

    sourceLabel:
      recommendation.sourceLabel ??
      "Runtime",

    whySummary:
      null,

    evidenceSummary:
      null,

    signalCount:
      0,
  };
}

function createFingerprint(
  lifecycle:
    RuntimeRecommendationLifecycleRecord,
): string {
  const action =
    createActionSnapshot(lifecycle);

  return [
    action.kind,
    action.target,
    action.title,
  ].join("::");
}

function createObservationKey(
  lifecycle:
    RuntimeRecommendationLifecycleRecord,
  observation:
    RuntimeActionObservationSnapshot,
): string {
  return [
    lifecycle.recommendationId,
    observation.reflectionCount,
    observation.githubSnapshotRevision ??
      "no-github-snapshot",
    observation.currentFocus ??
      "no-current-focus",
    observation.connectedEventCount,
    observation.runtimeAnalysisRevision ??
      "no-runtime-analysis",
  ].join("::");
}

function createEntryId(
  lifecycle:
    RuntimeRecommendationLifecycleRecord,
): string {
  return lifecycle.id;
}

function createTransitionId(
  fromEntryId:
    string | null,
  toEntryId:
    string,
  type:
    RuntimeActionTransitionType,
  occurredAt:
    string,
): string {
  return [
    "transition",
    fromEntryId ?? "initial",
    toEntryId,
    type,
    occurredAt,
  ].join("::");
}

/* ------------------------------------------------------------------ */
/* Lifecycle Fixtures */
/* ------------------------------------------------------------------ */

function createEmptyLifecycleHistory():
  RuntimeRecommendationLifecycleHistory {
  return createRecommendationLifecycleHistory(
    "lifecycle-history-001",
    HISTORY_CREATED_AT,
  );
}

function createActiveLifecycleHistory(
  title =
    "Review the current project direction",
): RuntimeRecommendationLifecycleHistory {
  return createNextRecommendationLifecycle({
    history:
      createEmptyLifecycleHistory(),

    nextLifecycleId:
      "lifecycle-001",

    nextRecommendationId:
      "recommendation-001",

    nextRecommendation:
      createRuntimeNextActionFixture(title),

    nextTransitionId:
      "lifecycle-transition-001",

    occurredAt:
      FIRST_OBSERVED_AT,
  }).history;
}

function synchronizeHistory(
  lifecycleHistory:
    RuntimeRecommendationLifecycleHistory,
  currentHistory:
    RuntimeActionHistoryState =
      createEmptyActionHistory(),
  observation:
    RuntimeActionObservationSnapshot =
      createObservationFixture(),
  observedAt =
    FIRST_OBSERVED_AT,
): RuntimeActionHistoryState {
  return createRuntimeActionHistoryFromLifecycle({
    lifecycleHistory,
    currentHistory,
    projectId:
      PROJECT_ID,
    observation,
    observedAt,
    createActionSnapshot,
    createFingerprint,
    createObservationKey,
    createEntryId,
    createTransitionId,
  });
}

/* ------------------------------------------------------------------ */
/* Clone Helpers */
/* ------------------------------------------------------------------ */

function cloneActionHistory(
  history:
    RuntimeActionHistoryState,
): RuntimeActionHistoryState {
  return {
    ...history,

    entries:
      history.entries.map(
        cloneActionHistoryEntry,
      ),

    transitions:
      history.transitions.map(
        (transition) => ({
          ...transition,
        }),
      ),
  };
}

function cloneActionHistoryEntry(
  entry:
    RuntimeActionHistoryEntry,
): RuntimeActionHistoryEntry {
  return {
    ...entry,

    action: {
      ...entry.action,
    },

    navigationEvents:
      entry.navigationEvents.map(
        (event) => ({
          ...event,
        }),
      ),

    completionEvidence:
      entry.completionEvidence.map(
        (evidence) => ({
          ...evidence,
        }),
      ),

    startedFrom: {
      ...entry.startedFrom,
    },

    lastObservedState: {
      ...entry.lastObservedState,
    },
  };
}

function cloneLifecycleHistory(
  history:
    RuntimeRecommendationLifecycleHistory,
): RuntimeRecommendationLifecycleHistory {
  return {
    ...history,

    records:
      history.records.map(
        (record) => ({
          ...record,

          recommendation: {
            ...record.recommendation,
          },

          transitions:
            record.transitions.map(
              (transition) => ({
                ...transition,
              }),
            ),
        }),
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Empty and Created Lifecycle */
/* ------------------------------------------------------------------ */

describe(
  "createRuntimeActionHistoryFromLifecycle - empty and created lifecycle",
  () => {
    it(
      "returns an empty Action History for an empty Lifecycle History",
      () => {
        const result =
          synchronizeHistory(
            createEmptyLifecycleHistory(),
          );

        expect(result).toEqual({
          version:
            1,

          entries:
            [],

          transitions:
            [],

          activeEntryId:
            null,
        });
      },
    );

    it(
      "does not create an Action History Entry for a created lifecycle",
      () => {
        const lifecycle =
          createRuntimeRecommendationLifecycle({
            lifecycleId:
              "lifecycle-created-001",

            recommendationId:
              "recommendation-created-001",

            recommendation:
              createRuntimeNextActionFixture(),

            createdAt:
              FIRST_OBSERVED_AT,

            activateImmediately:
              false,

            transitionId:
              "transition-created-001",
          });

        const history =
          appendRuntimeRecommendationLifecycle({
            history:
              createEmptyLifecycleHistory(),

            lifecycle,

            updatedAt:
              FIRST_OBSERVED_AT,
          });

        const result =
          synchronizeHistory(history);

        expect(result.entries).toEqual([]);

        expect(
          result.activeEntryId,
        ).toBeNull();

        expect(
          result.transitions,
        ).toEqual([]);
      },
    );
  },
);

/* ------------------------------------------------------------------ */
/* Active Lifecycle */
/* ------------------------------------------------------------------ */

describe(
  "createRuntimeActionHistoryFromLifecycle - active lifecycle",
  () => {
    it(
      "creates an active Action History Entry",
      () => {
        const result =
          synchronizeHistory(
            createActiveLifecycleHistory(),
          );

        expect(
          result.entries,
        ).toHaveLength(1);

        expect(
          result.entries[0],
        ).toMatchObject({
          id:
            "lifecycle-001",

          projectId:
            PROJECT_ID,

          status:
            "active",

          resolutionState:
            "new",

          observationCount:
            1,

          consecutiveRepeatCount:
            0,

          completedAt:
            null,

          supersededAt:
            null,

          replacedByEntryId:
            null,
        });
      },
    );

    it(
      "maps the Recommendation to an Action History Snapshot",
      () => {
        const result =
          synchronizeHistory(
            createActiveLifecycleHistory(
              "Inspect the latest project state",
            ),
          );

        expect(
          result.entries[0].action,
        ).toMatchObject({
          title:
            "Inspect the latest project state",

          description:
            "Record a reflection about the current project direction.",

          sourceLabel:
            "Runtime",

          whySummary:
            null,

          evidenceSummary:
            null,

          signalCount:
            0,
        });
      },
    );

    it(
      "uses the lifecycle ID as the Action History Entry ID",
      () => {
        const result =
          synchronizeHistory(
            createActiveLifecycleHistory(),
          );

        expect(
          result.entries[0].id,
        ).toBe("lifecycle-001");
      },
    );

    it(
      "connects activeLifecycleId to activeEntryId",
      () => {
        const result =
          synchronizeHistory(
            createActiveLifecycleHistory(),
          );

        expect(
          result.activeEntryId,
        ).toBe("lifecycle-001");
      },
    );

    it(
      "stores the initial project observation",
      () => {
        const observation =
          createObservationFixture({
            reflectionCount:
              3,

            currentFocus:
              "Lifecycle adapter tests",
          });

        const result =
          synchronizeHistory(
            createActiveLifecycleHistory(),
            createEmptyActionHistory(),
            observation,
          );

        expect(
          result.entries[0].startedFrom,
        ).toEqual(observation);

        expect(
          result.entries[0].lastObservedState,
        ).toEqual(observation);
      },
    );

    it(
      "creates an initial Action History Transition",
      () => {
        const result =
          synchronizeHistory(
            createActiveLifecycleHistory(),
          );

        expect(
          result.transitions,
        ).toHaveLength(1);

        expect(
          result.transitions[0],
        ).toMatchObject({
          projectId:
            PROJECT_ID,

          fromEntryId:
            null,

          toEntryId:
            "lifecycle-001",

          type:
            "initial",

          occurredAt:
            FIRST_OBSERVED_AT,
        });
      },
    );
  },
);

/* ------------------------------------------------------------------ */
/* Observation Synchronization */
/* ------------------------------------------------------------------ */

describe(
  "createRuntimeActionHistoryFromLifecycle - observations",
  () => {
    it(
      "does not count an identical observation twice",
      () => {
        const lifecycleHistory =
          createActiveLifecycleHistory();

        const observation =
          createObservationFixture();

        const first =
          synchronizeHistory(
            lifecycleHistory,
            createEmptyActionHistory(),
            observation,
            FIRST_OBSERVED_AT,
          );

        const second =
          synchronizeHistory(
            lifecycleHistory,
            first,
            observation,
            SECOND_OBSERVED_AT,
          );

        expect(
          second.entries[0].observationCount,
        ).toBe(1);

        expect(
          second.entries[0].lastObservedAt,
        ).toBe(FIRST_OBSERVED_AT);

        expect(
          second.entries[0].resolutionState,
        ).toBe("new");
      },
    );

    it(
      "increments the observation count when project state changes",
      () => {
        const lifecycleHistory =
          createActiveLifecycleHistory();

        const first =
          synchronizeHistory(
            lifecycleHistory,
            createEmptyActionHistory(),
            createObservationFixture(),
            FIRST_OBSERVED_AT,
          );

        const changedObservation =
          createObservationFixture({
            reflectionCount:
              2,

            runtimeAnalysisRevision:
              "analysis-revision-002",
          });

        const second =
          synchronizeHistory(
            lifecycleHistory,
            first,
            changedObservation,
            SECOND_OBSERVED_AT,
          );

        expect(
          second.entries[0].observationCount,
        ).toBe(2);

        expect(
          second.entries[0].lastObservedAt,
        ).toBe(SECOND_OBSERVED_AT);

        expect(
          second.entries[0].lastObservedState,
        ).toEqual(changedObservation);
      },
    );

    it(
      "marks the same Recommendation as repeated after a new observation",
      () => {
        const lifecycleHistory =
          createActiveLifecycleHistory();

        const first =
          synchronizeHistory(
            lifecycleHistory,
            createEmptyActionHistory(),
            createObservationFixture(),
            FIRST_OBSERVED_AT,
          );

        const second =
          synchronizeHistory(
            lifecycleHistory,
            first,
            createObservationFixture({
              connectedEventCount:
                3,
            }),
            SECOND_OBSERVED_AT,
          );

        expect(
          second.entries[0].resolutionState,
        ).toBe("repeated");

        expect(
          second.entries[0].consecutiveRepeatCount,
        ).toBe(1);
      },
    );

    it(
      "increments consecutiveRepeatCount across changed observations",
      () => {
        const lifecycleHistory =
          createActiveLifecycleHistory();

        const first =
          synchronizeHistory(
            lifecycleHistory,
            createEmptyActionHistory(),
            createObservationFixture(),
            FIRST_OBSERVED_AT,
          );

        const second =
          synchronizeHistory(
            lifecycleHistory,
            first,
            createObservationFixture({
              reflectionCount:
                2,
            }),
            SECOND_OBSERVED_AT,
          );

        const third =
          synchronizeHistory(
            lifecycleHistory,
            second,
            createObservationFixture({
              reflectionCount:
                3,
            }),
            THIRD_OBSERVED_AT,
          );

        expect(
          third.entries[0].observationCount,
        ).toBe(3);

        expect(
          third.entries[0].resolutionState,
        ).toBe("repeated");

        expect(
          third.entries[0].consecutiveRepeatCount,
        ).toBe(2);
      },
    );
  },
);

/* ------------------------------------------------------------------ */
/* Navigation Preservation */
/* ------------------------------------------------------------------ */

describe(
  "createRuntimeActionHistoryFromLifecycle - navigation preservation",
  () => {
    it(
      "preserves navigated status while the lifecycle remains active",
      () => {
        const lifecycleHistory =
          createActiveLifecycleHistory();

        const initial =
          synchronizeHistory(
            lifecycleHistory,
          );

        const navigatedHistory:
          RuntimeActionHistoryState = {
          ...initial,

          entries:
            initial.entries.map(
              (entry) => ({
                ...entry,

                status:
                  "navigated",

                navigationEvents: [
                  {
                    id:
                      "navigation-001",

                    target:
                      entry.action.target,

                    occurredAt:
                      SECOND_OBSERVED_AT,
                  },
                ],
              }),
            ),
        };

        const result =
          synchronizeHistory(
            lifecycleHistory,
            navigatedHistory,
            createObservationFixture({
              reflectionCount:
                2,
            }),
            THIRD_OBSERVED_AT,
          );

        expect(
          result.entries[0].status,
        ).toBe("navigated");

        expect(
          result.entries[0].navigationEvents,
        ).toEqual([
          {
            id:
              "navigation-001",

            target:
              result.entries[0].action.target,

            occurredAt:
              SECOND_OBSERVED_AT,
          },
        ]);
      },
    );
  },
);

/* ------------------------------------------------------------------ */
/* Completed Lifecycle */
/* ------------------------------------------------------------------ */

describe(
  "createRuntimeActionHistoryFromLifecycle - completed lifecycle",
  () => {
    it(
      "maps a completed lifecycle to a completed Action History Entry",
      () => {
        const first =
          createNextRecommendationLifecycle({
            history:
              createEmptyLifecycleHistory(),

            nextLifecycleId:
              "lifecycle-001",

            nextRecommendationId:
              "recommendation-001",

            nextRecommendation:
              createRuntimeNextActionFixture(
                "Complete the current reflection",
              ),

            nextTransitionId:
              "transition-create-001",

            occurredAt:
              FIRST_OBSERVED_AT,
          });

        const second =
          createNextRecommendationLifecycle({
            history:
              first.history,

            nextLifecycleId:
              "lifecycle-002",

            nextRecommendationId:
              "recommendation-002",

            nextRecommendation:
              createRuntimeNextActionFixture(
                "Review the completed reflection",
              ),

            nextTransitionId:
              "transition-create-002",

            currentResolution:
              "completed",

            currentTransitionId:
              "transition-complete-001",

            occurredAt:
              SECOND_OBSERVED_AT,
          });

        const result =
          synchronizeHistory(
            second.history,
            createEmptyActionHistory(),
            createObservationFixture({
              reflectionCount:
                2,
            }),
            SECOND_OBSERVED_AT,
          );

        const completedEntry =
          result.entries.find(
            (entry) =>
              entry.id === "lifecycle-001",
          );

        expect(
          completedEntry,
        ).toMatchObject({
          status:
            "completed",

          completedAt:
            SECOND_OBSERVED_AT,

          supersededAt:
            null,
        });
      },
    );

    it(
      "adds fallback completion evidence when no evidence exists",
      () => {
        const first =
          createNextRecommendationLifecycle({
            history:
              createEmptyLifecycleHistory(),

            nextLifecycleId:
              "lifecycle-001",

            nextRecommendationId:
              "recommendation-001",

            nextRecommendation:
              createRuntimeNextActionFixture(),

            nextTransitionId:
              "transition-create-001",

            occurredAt:
              FIRST_OBSERVED_AT,
          });

        const second =
          createNextRecommendationLifecycle({
            history:
              first.history,

            nextLifecycleId:
              "lifecycle-002",

            nextRecommendationId:
              "recommendation-002",

            nextRecommendation:
              createRuntimeNextActionFixture(
                "Next recommendation",
              ),

            nextTransitionId:
              "transition-create-002",

            currentResolution:
              "completed",

            currentTransitionId:
              "transition-complete-001",

            occurredAt:
              SECOND_OBSERVED_AT,
          });

        const result =
          synchronizeHistory(
            second.history,
          );

        const completedEntry =
          result.entries.find(
            (entry) =>
              entry.id === "lifecycle-001",
          );

        expect(
          completedEntry?.completionEvidence,
        ).toEqual([
          {
            type:
              "fallback-resolved",

            description:
              "The recommendation lifecycle was marked as completed.",

            occurredAt:
              SECOND_OBSERVED_AT,
          },
        ]);
      },
    );

    it(
      "preserves existing completion evidence",
      () => {
        const lifecycleHistory =
          createActiveLifecycleHistory();

        const initial =
          synchronizeHistory(
            lifecycleHistory,
          );

        const historyWithEvidence:
          RuntimeActionHistoryState = {
          ...initial,

          entries:
            initial.entries.map(
              (entry) => ({
                ...entry,

                completionEvidence: [
                  {
                    type:
                      "reflection-recorded",

                    description:
                      "A new reflection was recorded.",

                    occurredAt:
                      SECOND_OBSERVED_AT,
                  },
                ],
              }),
            ),
        };

        const activeLifecycle =
          lifecycleHistory.records[0];

        const completedLifecycle =
          advanceRuntimeRecommendationLifecycle({
            lifecycle:
              activeLifecycle,

            nextState:
              "completed",

            reason:
              "recommended-action-completed",

            actor:
              "user",

            transitionId:
              "transition-completed-001",

            occurredAt:
              THIRD_OBSERVED_AT,
          });

        const completedHistory =
          replaceRuntimeRecommendationLifecycle({
            history:
              lifecycleHistory,

            lifecycle:
              completedLifecycle,

            updatedAt:
              THIRD_OBSERVED_AT,
          });

        const result =
          synchronizeHistory(
            completedHistory,
            historyWithEvidence,
            createObservationFixture({
              reflectionCount:
                2,
            }),
            THIRD_OBSERVED_AT,
          );

        expect(
          result.entries[0].completionEvidence,
        ).toEqual([
          {
            type:
              "reflection-recorded",

            description:
              "A new reflection was recorded.",

            occurredAt:
              SECOND_OBSERVED_AT,
          },
        ]);
      },
    );

    it(
      "creates completed-and-advanced transition for the next entry",
      () => {
        const first =
          createNextRecommendationLifecycle({
            history:
              createEmptyLifecycleHistory(),

            nextLifecycleId:
              "lifecycle-001",

            nextRecommendationId:
              "recommendation-001",

            nextRecommendation:
              createRuntimeNextActionFixture(
                "First recommendation",
              ),

            nextTransitionId:
              "transition-create-001",

            occurredAt:
              FIRST_OBSERVED_AT,
          });

        const second =
          createNextRecommendationLifecycle({
            history:
              first.history,

            nextLifecycleId:
              "lifecycle-002",

            nextRecommendationId:
              "recommendation-002",

            nextRecommendation:
              createRuntimeNextActionFixture(
                "Second recommendation",
              ),

            nextTransitionId:
              "transition-create-002",

            currentResolution:
              "completed",

            currentTransitionId:
              "transition-complete-001",

            occurredAt:
              SECOND_OBSERVED_AT,
          });

        const result =
          synchronizeHistory(
            second.history,
          );

        expect(
          result.transitions.map(
            (transition) =>
              transition.type,
          ),
        ).toEqual([
          "initial",
          "completed-and-advanced",
        ]);
      },
    );
  },
);

/* ------------------------------------------------------------------ */
/* Superseded Lifecycle */
/* ------------------------------------------------------------------ */

describe(
  "createRuntimeActionHistoryFromLifecycle - superseded lifecycle",
  () => {
    it(
      "maps a superseded lifecycle to a superseded Action History Entry",
      () => {
        const first =
          createNextRecommendationLifecycle({
            history:
              createEmptyLifecycleHistory(),

            nextLifecycleId:
              "lifecycle-001",

            nextRecommendationId:
              "recommendation-001",

            nextRecommendation:
              createRuntimeNextActionFixture(
                "Initial recommendation",
              ),

            nextTransitionId:
              "transition-create-001",

            occurredAt:
              FIRST_OBSERVED_AT,
          });

        const second =
          createNextRecommendationLifecycle({
            history:
              first.history,

            nextLifecycleId:
              "lifecycle-002",

            nextRecommendationId:
              "recommendation-002",

            nextRecommendation:
              createRuntimeNextActionFixture(
                "Updated recommendation",
              ),

            nextTransitionId:
              "transition-create-002",

            currentResolution:
              "superseded",

            currentTransitionId:
              "transition-superseded-001",

            occurredAt:
              SECOND_OBSERVED_AT,
          });

        const result =
          synchronizeHistory(
            second.history,
          );

        const supersededEntry =
          result.entries.find(
            (entry) =>
              entry.id === "lifecycle-001",
          );

        expect(
          supersededEntry,
        ).toMatchObject({
          status:
            "superseded",

          supersededAt:
            SECOND_OBSERVED_AT,

          completedAt:
            null,

          replacedByEntryId:
            "lifecycle-002",
        });
      },
    );

    it(
      "creates a superseded transition to the replacement entry",
      () => {
        const first =
          createNextRecommendationLifecycle({
            history:
              createEmptyLifecycleHistory(),

            nextLifecycleId:
              "lifecycle-001",

            nextRecommendationId:
              "recommendation-001",

            nextRecommendation:
              createRuntimeNextActionFixture(
                "Initial recommendation",
              ),

            nextTransitionId:
              "transition-create-001",

            occurredAt:
              FIRST_OBSERVED_AT,
          });

        const second =
          createNextRecommendationLifecycle({
            history:
              first.history,

            nextLifecycleId:
              "lifecycle-002",

            nextRecommendationId:
              "recommendation-002",

            nextRecommendation:
              createRuntimeNextActionFixture(
                "Replacement recommendation",
              ),

            nextTransitionId:
              "transition-create-002",

            currentResolution:
              "superseded",

            currentTransitionId:
              "transition-superseded-001",

            occurredAt:
              SECOND_OBSERVED_AT,
          });

        const result =
          synchronizeHistory(
            second.history,
          );

        expect(
          result.transitions,
        ).toHaveLength(2);

        expect(
          result.transitions[1],
        ).toMatchObject({
          fromEntryId:
            "lifecycle-001",

          toEntryId:
            "lifecycle-002",

          type:
            "superseded",

          occurredAt:
            SECOND_OBSERVED_AT,
        });
      },
    );
  },
);

/* ------------------------------------------------------------------ */
/* Repeated Lifecycle Transition */
/* ------------------------------------------------------------------ */

describe(
  "createRuntimeActionHistoryFromLifecycle - repeated transition",
  () => {
    it(
      "creates a repeated transition when consecutive entries share a fingerprint",
      () => {
        const repeatedTitle =
          "Review the same project direction";

        const first =
          createNextRecommendationLifecycle({
            history:
              createEmptyLifecycleHistory(),

            nextLifecycleId:
              "lifecycle-001",

            nextRecommendationId:
              "recommendation-001",

            nextRecommendation:
              createRuntimeNextActionFixture(
                repeatedTitle,
              ),

            nextTransitionId:
              "transition-create-001",

            occurredAt:
              FIRST_OBSERVED_AT,
          });

        const second =
          createNextRecommendationLifecycle({
            history:
              first.history,

            nextLifecycleId:
              "lifecycle-002",

            nextRecommendationId:
              "recommendation-002",

            nextRecommendation:
              createRuntimeNextActionFixture(
                repeatedTitle,
              ),

            nextTransitionId:
              "transition-create-002",

            currentResolution:
              "superseded",

            currentTransitionId:
              "transition-superseded-001",

            occurredAt:
              SECOND_OBSERVED_AT,
          });

        const result =
          synchronizeHistory(
            second.history,
          );

        expect(
          result.transitions[1].type,
        ).toBe("repeated");
      },
    );
  },
);

/* ------------------------------------------------------------------ */
/* Archived Lifecycle */
/* ------------------------------------------------------------------ */

describe(
  "createRuntimeActionHistoryFromLifecycle - archived lifecycle",
  () => {
    it(
      "does not create a new Action History Entry for an archived lifecycle",
      () => {
        const createdLifecycle =
          createRuntimeRecommendationLifecycle({
            lifecycleId:
              "lifecycle-archived-001",

            recommendationId:
              "recommendation-archived-001",

            recommendation:
              createRuntimeNextActionFixture(),

            createdAt:
              FIRST_OBSERVED_AT,

            activateImmediately:
              false,

            transitionId:
              "transition-created-001",
          });

        const archivedLifecycle =
          advanceRuntimeRecommendationLifecycle({
            lifecycle:
              createdLifecycle,

            nextState:
              "archived",

            reason:
              "recommendation-manually-archived",

            actor:
              "user",

            transitionId:
              "transition-archived-001",

            occurredAt:
              SECOND_OBSERVED_AT,
          });

        const lifecycleHistory =
          appendRuntimeRecommendationLifecycle({
            history:
              createEmptyLifecycleHistory(),

            lifecycle:
              archivedLifecycle,

            updatedAt:
              SECOND_OBSERVED_AT,
          });

        const result =
          synchronizeHistory(
            lifecycleHistory,
          );

        expect(
          result.entries,
        ).toEqual([]);

        expect(
          result.transitions,
        ).toEqual([]);

        expect(
          result.activeEntryId,
        ).toBeNull();
      },
    );

    it(
      "preserves an existing Action History Entry after lifecycle archival",
      () => {
        const activeHistory =
          createActiveLifecycleHistory();

        const initialActionHistory =
          synchronizeHistory(
            activeHistory,
          );

        const activeLifecycle =
          activeHistory.records[0];

        const archivedLifecycle =
          advanceRuntimeRecommendationLifecycle({
            lifecycle:
              activeLifecycle,

            nextState:
              "archived",

            reason:
              "recommendation-manually-archived",

            actor:
              "user",

            transitionId:
              "transition-archived-001",

            occurredAt:
              SECOND_OBSERVED_AT,
          });

        const archivedHistory =
          replaceRuntimeRecommendationLifecycle({
            history:
              activeHistory,

            lifecycle:
              archivedLifecycle,

            updatedAt:
              SECOND_OBSERVED_AT,
          });

        const result =
          synchronizeHistory(
            archivedHistory,
            initialActionHistory,
            createObservationFixture(),
            SECOND_OBSERVED_AT,
          );

        expect(
          result.entries,
        ).toHaveLength(1);

        expect(
          result.entries[0].status,
        ).toBe("active");

        expect(
          result.activeEntryId,
        ).toBeNull();
      },
    );
  },
);

/* ------------------------------------------------------------------ */
/* Transition Deduplication */
/* ------------------------------------------------------------------ */

describe(
  "createRuntimeActionHistoryFromLifecycle - transition deduplication",
  () => {
    it(
      "does not append the same Action History Transition twice",
      () => {
        const lifecycleHistory =
          createActiveLifecycleHistory();

        const first =
          synchronizeHistory(
            lifecycleHistory,
          );

        const second =
          synchronizeHistory(
            lifecycleHistory,
            first,
            createObservationFixture(),
            SECOND_OBSERVED_AT,
          );

        expect(
          first.transitions,
        ).toHaveLength(1);

        expect(
          second.transitions,
        ).toHaveLength(1);

        expect(
          second.transitions[0],
        ).toEqual(
          first.transitions[0],
        );
      },
    );
  },
);

/* ------------------------------------------------------------------ */
/* Immutability */
/* ------------------------------------------------------------------ */

describe(
  "createRuntimeActionHistoryFromLifecycle - immutability",
  () => {
    it(
      "does not mutate Lifecycle History",
      () => {
        const lifecycleHistory =
          createActiveLifecycleHistory();

        const before =
          cloneLifecycleHistory(
            lifecycleHistory,
          );

        synchronizeHistory(
          lifecycleHistory,
        );

        expect(
          lifecycleHistory,
        ).toEqual(before);
      },
    );

    it(
      "does not mutate existing Action History",
      () => {
        const lifecycleHistory =
          createActiveLifecycleHistory();

        const currentHistory =
          synchronizeHistory(
            lifecycleHistory,
          );

        const before =
          cloneActionHistory(
            currentHistory,
          );

        synchronizeHistory(
          lifecycleHistory,
          currentHistory,
          createObservationFixture({
            reflectionCount:
              2,
          }),
          SECOND_OBSERVED_AT,
        );

        expect(
          currentHistory,
        ).toEqual(before);

        expect(
          currentHistory.entries[0]
            .observationCount,
        ).toBe(1);
      },
    );

    it(
      "returns new History, Entry, and nested array references",
      () => {
        const lifecycleHistory =
          createActiveLifecycleHistory();

        const currentHistory =
          synchronizeHistory(
            lifecycleHistory,
          );

        const result =
          synchronizeHistory(
            lifecycleHistory,
            currentHistory,
            createObservationFixture({
              reflectionCount:
                2,
            }),
            SECOND_OBSERVED_AT,
          );

        expect(result).not.toBe(
          currentHistory,
        );

        expect(result.entries).not.toBe(
          currentHistory.entries,
        );

        expect(result.entries[0]).not.toBe(
          currentHistory.entries[0],
        );

        expect(
          result.entries[0].navigationEvents,
        ).not.toBe(
          currentHistory.entries[0]
            .navigationEvents,
        );

        expect(
          result.entries[0].completionEvidence,
        ).not.toBe(
          currentHistory.entries[0]
            .completionEvidence,
        );
      },
    );
  },
);

/* ------------------------------------------------------------------ */
/* Validation */
/* ------------------------------------------------------------------ */

describe(
  "createRuntimeActionHistoryFromLifecycle - validation",
  () => {
    it(
      "rejects an unsupported Action History version",
      () => {
        const invalidHistory = {
          ...createEmptyActionHistory(),
          version:
            2,
        } as unknown as RuntimeActionHistoryState;

        expect(() =>
          synchronizeHistory(
            createActiveLifecycleHistory(),
            invalidHistory,
          ),
        ).toThrow(
          'Unsupported Runtime Action History version "2".',
        );
      },
    );

    it(
      "rejects duplicate Action History Entry IDs",
      () => {
        const initial =
          synchronizeHistory(
            createActiveLifecycleHistory(),
          );

        const duplicateHistory:
          RuntimeActionHistoryState = {
          ...initial,

          entries: [
            initial.entries[0],
            cloneActionHistoryEntry(
              initial.entries[0],
            ),
          ],
        };

        expect(() =>
          synchronizeHistory(
            createActiveLifecycleHistory(),
            duplicateHistory,
          ),
        ).toThrow(
          'Duplicate Action History Entry ID "lifecycle-001".',
        );
      },
    );

    it(
      "rejects an activeEntryId that references a missing entry",
      () => {
        const invalidHistory:
          RuntimeActionHistoryState = {
          ...createEmptyActionHistory(),

          activeEntryId:
            "missing-entry",
        };

        expect(() =>
          synchronizeHistory(
            createActiveLifecycleHistory(),
            invalidHistory,
          ),
        ).toThrow(
          'activeEntryId "missing-entry" does not exist.',
        );
      },
    );

    it(
      "rejects Lifecycle History with multiple active records",
      () => {
        const validHistory =
          createActiveLifecycleHistory();

        const activeLifecycle =
          validHistory.records[0];

        const invalidHistory:
          RuntimeRecommendationLifecycleHistory = {
          ...validHistory,

          records: [
            activeLifecycle,

            {
              ...activeLifecycle,

              id:
                "lifecycle-002",

              recommendationId:
                "recommendation-002",
            },
          ],
        };

        expect(() =>
          synchronizeHistory(
            invalidHistory,
          ),
        ).toThrow(
          "Lifecycle History contains multiple active records.",
        );
      },
    );

    it(
      "rejects an activeLifecycleId that references a missing lifecycle",
      () => {
        const invalidHistory:
          RuntimeRecommendationLifecycleHistory = {
          ...createEmptyLifecycleHistory(),

          activeLifecycleId:
            "missing-lifecycle",
        };

        expect(() =>
          synchronizeHistory(
            invalidHistory,
          ),
        ).toThrow(
          'activeLifecycleId "missing-lifecycle" does not exist.',
        );
      },
    );

    it(
      "rejects a blank project ID",
      () => {
        expect(() =>
          createRuntimeActionHistoryFromLifecycle({
            lifecycleHistory:
              createActiveLifecycleHistory(),

            currentHistory:
              createEmptyActionHistory(),

            projectId:
              " ",

            observation:
              createObservationFixture(),

            observedAt:
              FIRST_OBSERVED_AT,

            createActionSnapshot,
            createFingerprint,
            createObservationKey,
          }),
        ).toThrow(
          "projectId must be a non-empty string.",
        );
      },
    );

    it(
      "rejects an invalid observedAt timestamp",
      () => {
        expect(() =>
          createRuntimeActionHistoryFromLifecycle({
            lifecycleHistory:
              createActiveLifecycleHistory(),

            currentHistory:
              createEmptyActionHistory(),

            projectId:
              PROJECT_ID,

            observation:
              createObservationFixture(),

            observedAt:
              "invalid-date",

            createActionSnapshot,
            createFingerprint,
            createObservationKey,
          }),
        ).toThrow(
          "observedAt must be a valid ISO 8601 timestamp.",
        );
      },
    );

    it(
      "rejects an empty fingerprint returned by the factory",
      () => {
        expect(() =>
          createRuntimeActionHistoryFromLifecycle({
            lifecycleHistory:
              createActiveLifecycleHistory(),

            currentHistory:
              createEmptyActionHistory(),

            projectId:
              PROJECT_ID,

            observation:
              createObservationFixture(),

            observedAt:
              FIRST_OBSERVED_AT,

            createActionSnapshot,

            createFingerprint:
              () => " ",

            createObservationKey,
          }),
        ).toThrow(
          "createFingerprint result must be a non-empty string.",
        );
      },
    );

    it(
      "rejects an empty observation key returned by the factory",
      () => {
        expect(() =>
          createRuntimeActionHistoryFromLifecycle({
            lifecycleHistory:
              createActiveLifecycleHistory(),

            currentHistory:
              createEmptyActionHistory(),

            projectId:
              PROJECT_ID,

            observation:
              createObservationFixture(),

            observedAt:
              FIRST_OBSERVED_AT,

            createActionSnapshot,
            createFingerprint,

            createObservationKey:
              () => "",
          }),
        ).toThrow(
          "createObservationKey result must be a non-empty string.",
        );
      },
    );

    it(
      "rejects an Entry ID factory that returns an empty string",
      () => {
        expect(() =>
          createRuntimeActionHistoryFromLifecycle({
            lifecycleHistory:
              createActiveLifecycleHistory(),

            currentHistory:
              createEmptyActionHistory(),

            projectId:
              PROJECT_ID,

            observation:
              createObservationFixture(),

            observedAt:
              FIRST_OBSERVED_AT,

            createActionSnapshot,
            createFingerprint,
            createObservationKey,

            createEntryId:
              () => "",
          }),
        ).toThrow(
          "createEntryId result must be a non-empty string.",
        );
      },
    );
  },
);