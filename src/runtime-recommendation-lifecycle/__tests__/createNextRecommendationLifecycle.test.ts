import { describe, expect, it } from "vitest";

import type {
    RuntimeNextAction,
} from "../../runtime-next-action/runtimeNextActionTypes";

import {
    createRecommendationLifecycleHistory,
} from "../createRecommendationLifecycleHistory";

import {
    createNextRecommendationLifecycle,
} from "../createNextRecommendationLifecycle";

import type {
    RuntimeRecommendationLifecycleHistory,
    RuntimeRecommendationLifecycleRecord,
} from "../runtimeRecommendationLifecycleTypes";

/* ------------------------------------------------------------------ */
/* Constants */
/* ------------------------------------------------------------------ */

const HISTORY_CREATED_AT =
  "2026-07-26T08:00:00.000Z";

const FIRST_OCCURRED_AT =
  "2026-07-26T08:10:00.000Z";

const SECOND_OCCURRED_AT =
  "2026-07-26T09:00:00.000Z";

const THIRD_OCCURRED_AT =
  "2026-07-26T10:00:00.000Z";

/* ------------------------------------------------------------------ */
/* Fixtures */
/* ------------------------------------------------------------------ */

/**
 * 이 테스트는 RuntimeNextAction의 내부 Presentation 계약이 아니라
 * Lifecycle 연결 동작을 검증합니다.
 *
 * 따라서 Lifecycle 테스트에 필요한 Recommendation 식별 정보만 가진
 * Fixture를 RuntimeNextAction 타입으로 제한하여 사용합니다.
 *
 * 프로젝트에 공용 RuntimeNextAction Fixture가 존재한다면 이 함수를
 * 해당 Fixture import로 교체할 수 있습니다.
 */
function createRuntimeNextActionFixture(
  overrides: Partial<RuntimeNextAction> = {},
): RuntimeNextAction {
  return {
    kind: "reflect",
    title: "Review the current project direction",
    description:
      "Record a reflection about the current project direction.",
    target: "reflection",
    confidence: "high",
    source: "runtime",
    sourceLabel: "Runtime",
    ...overrides,
  } as RuntimeNextAction;
}

function createEmptyHistory():
  RuntimeRecommendationLifecycleHistory {
  return createRecommendationLifecycleHistory(
    "history-001",
    HISTORY_CREATED_AT,
  );
}

function createHistoryWithActiveRecommendation(): {
  history:
    RuntimeRecommendationLifecycleHistory;

  activeLifecycle:
    RuntimeRecommendationLifecycleRecord;
} {
  const initialResult =
    createNextRecommendationLifecycle({
      history:
        createEmptyHistory(),

      nextLifecycleId:
        "lifecycle-001",

      nextRecommendationId:
        "recommendation-001",

      nextRecommendation:
        createRuntimeNextActionFixture({
          title:
            "Review the current project direction",
        }),

      nextTransitionId:
        "transition-create-001",

      occurredAt:
        FIRST_OCCURRED_AT,
    });

  return {
    history:
      initialResult.history,

    activeLifecycle:
      initialResult.nextLifecycle,
  };
}

function cloneHistory(
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
/* Initial Recommendation */
/* ------------------------------------------------------------------ */

describe(
  "createNextRecommendationLifecycle - initial recommendation",
  () => {
    it(
      "creates and immediately activates the first recommendation",
      () => {
        const result =
          createNextRecommendationLifecycle({
            history:
              createEmptyHistory(),

            nextLifecycleId:
              "lifecycle-001",

            nextRecommendationId:
              "recommendation-001",

            nextRecommendation:
              createRuntimeNextActionFixture(),

            nextTransitionId:
              "transition-create-001",

            occurredAt:
              FIRST_OCCURRED_AT,
          });

        expect(
          result.previousLifecycle,
        ).toBeNull();

        expect(
          result.nextLifecycle.state,
        ).toBe("active");

        expect(
          result.nextLifecycle.id,
        ).toBe("lifecycle-001");

        expect(
          result.nextLifecycle.recommendationId,
        ).toBe("recommendation-001");

        expect(
          result.history.activeLifecycleId,
        ).toBe("lifecycle-001");
      },
    );

    it(
      "creates the first lifecycle without a previous lifecycle link",
      () => {
        const result =
          createNextRecommendationLifecycle({
            history:
              createEmptyHistory(),

            nextLifecycleId:
              "lifecycle-001",

            nextRecommendationId:
              "recommendation-001",

            nextRecommendation:
              createRuntimeNextActionFixture(),

            nextTransitionId:
              "transition-create-001",

            occurredAt:
              FIRST_OCCURRED_AT,
          });

        expect(
          result.nextLifecycle.previousLifecycleId,
        ).toBeNull();

        expect(
          result.nextLifecycle.nextLifecycleId,
        ).toBeNull();
      },
    );

    it(
      "records created and active transitions for the first lifecycle",
      () => {
        const result =
          createNextRecommendationLifecycle({
            history:
              createEmptyHistory(),

            nextLifecycleId:
              "lifecycle-001",

            nextRecommendationId:
              "recommendation-001",

            nextRecommendation:
              createRuntimeNextActionFixture(),

            nextTransitionId:
              "transition-create-001",

            occurredAt:
              FIRST_OCCURRED_AT,
          });

        expect(
          result.nextLifecycle.transitions,
        ).toHaveLength(2);

        expect(
          result.nextLifecycle.transitions[0],
        ).toMatchObject({
          id:
            "transition-create-001",

          fromState:
            null,

          toState:
            "created",

          reason:
            "recommendation-created",

          actor:
            "runtime",

          occurredAt:
            FIRST_OCCURRED_AT,
        });

        expect(
          result.nextLifecycle.transitions[1],
        ).toMatchObject({
          id:
            "transition-create-001:activated",

          fromState:
            "created",

          toState:
            "active",

          reason:
            "recommendation-activated",

          actor:
            "runtime",

          occurredAt:
            FIRST_OCCURRED_AT,
        });
      },
    );

    it(
      "appends the first lifecycle to history",
      () => {
        const result =
          createNextRecommendationLifecycle({
            history:
              createEmptyHistory(),

            nextLifecycleId:
              "lifecycle-001",

            nextRecommendationId:
              "recommendation-001",

            nextRecommendation:
              createRuntimeNextActionFixture(),

            nextTransitionId:
              "transition-create-001",

            occurredAt:
              FIRST_OCCURRED_AT,
          });

        expect(
          result.history.records,
        ).toHaveLength(1);

        expect(
          result.history.records[0],
        ).toEqual(
          result.nextLifecycle,
        );

        expect(
          result.history.updatedAt,
        ).toBe(FIRST_OCCURRED_AT);
      },
    );

    it(
      "preserves the supplied recommendation object",
      () => {
        const recommendation =
          createRuntimeNextActionFixture({
            title:
              "Inspect the latest GitHub changes",
          });

        const result =
          createNextRecommendationLifecycle({
            history:
              createEmptyHistory(),

            nextLifecycleId:
              "lifecycle-001",

            nextRecommendationId:
              "recommendation-001",

            nextRecommendation:
              recommendation,

            nextTransitionId:
              "transition-create-001",

            occurredAt:
              FIRST_OCCURRED_AT,
          });

        expect(
          result.nextLifecycle.recommendation,
        ).toBe(recommendation);
      },
    );
  },
);

/* ------------------------------------------------------------------ */
/* Completed → Next */
/* ------------------------------------------------------------------ */

describe(
  "createNextRecommendationLifecycle - completed transition",
  () => {
    it(
      "completes the active lifecycle before activating the next lifecycle",
      () => {
        const {
          history,
        } =
          createHistoryWithActiveRecommendation();

        const result =
          createNextRecommendationLifecycle({
            history,

            nextLifecycleId:
              "lifecycle-002",

            nextRecommendationId:
              "recommendation-002",

            nextRecommendation:
              createRuntimeNextActionFixture({
                title:
                  "Analyze the latest project change",
              }),

            nextTransitionId:
              "transition-create-002",

            currentResolution:
              "completed",

            currentTransitionId:
              "transition-complete-001",

            occurredAt:
              SECOND_OCCURRED_AT,
          });

        expect(
          result.previousLifecycle?.state,
        ).toBe("completed");

        expect(
          result.previousLifecycle?.resolution,
        ).toBe("completed");

        expect(
          result.nextLifecycle.state,
        ).toBe("active");

        expect(
          result.history.activeLifecycleId,
        ).toBe("lifecycle-002");
      },
    );

    it(
      "uses user as the default actor for completion",
      () => {
        const {
          history,
        } =
          createHistoryWithActiveRecommendation();

        const result =
          createNextRecommendationLifecycle({
            history,

            nextLifecycleId:
              "lifecycle-002",

            nextRecommendationId:
              "recommendation-002",

            nextRecommendation:
              createRuntimeNextActionFixture(),

            nextTransitionId:
              "transition-create-002",

            currentResolution:
              "completed",

            currentTransitionId:
              "transition-complete-001",

            occurredAt:
              SECOND_OCCURRED_AT,
          });

        const transitions =
          result.previousLifecycle
            ?.transitions ?? [];

        const completionTransition =
          transitions[
            transitions.length - 1
          ];

        expect(
          completionTransition,
        ).toMatchObject({
          fromState:
            "active",

          toState:
            "completed",

          reason:
            "recommended-action-completed",

          actor:
            "user",

          occurredAt:
            SECOND_OCCURRED_AT,
        });
      },
    );

    it(
      "allows the completion actor to be overridden",
      () => {
        const {
          history,
        } =
          createHistoryWithActiveRecommendation();

        const result =
          createNextRecommendationLifecycle({
            history,

            nextLifecycleId:
              "lifecycle-002",

            nextRecommendationId:
              "recommendation-002",

            nextRecommendation:
              createRuntimeNextActionFixture(),

            nextTransitionId:
              "transition-create-002",

            currentResolution:
              "completed",

            currentTransitionId:
              "transition-complete-001",

            actor:
              "system",

            occurredAt:
              SECOND_OCCURRED_AT,
          });

        const transitions =
          result.previousLifecycle
            ?.transitions ?? [];

        const lastTransition =
          transitions[
            transitions.length - 1
          ];

        expect(
          lastTransition?.actor,
        ).toBe("system");
      },
    );

    it(
      "sets resolvedAt on the completed lifecycle",
      () => {
        const {
          history,
        } =
          createHistoryWithActiveRecommendation();

        const result =
          createNextRecommendationLifecycle({
            history,

            nextLifecycleId:
              "lifecycle-002",

            nextRecommendationId:
              "recommendation-002",

            nextRecommendation:
              createRuntimeNextActionFixture(),

            nextTransitionId:
              "transition-create-002",

            currentResolution:
              "completed",

            currentTransitionId:
              "transition-complete-001",

            occurredAt:
              SECOND_OCCURRED_AT,
          });

        expect(
          result.previousLifecycle?.resolvedAt,
        ).toBe(SECOND_OCCURRED_AT);

        expect(
          result.previousLifecycle?.supersededByRecommendationId,
        ).toBeNull();
      },
    );

    it(
      "connects the completed lifecycle to the next lifecycle",
      () => {
        const {
          history,
        } =
          createHistoryWithActiveRecommendation();

        const result =
          createNextRecommendationLifecycle({
            history,

            nextLifecycleId:
              "lifecycle-002",

            nextRecommendationId:
              "recommendation-002",

            nextRecommendation:
              createRuntimeNextActionFixture(),

            nextTransitionId:
              "transition-create-002",

            currentResolution:
              "completed",

            currentTransitionId:
              "transition-complete-001",

            occurredAt:
              SECOND_OCCURRED_AT,
          });

        expect(
          result.previousLifecycle?.nextLifecycleId,
        ).toBe("lifecycle-002");

        expect(
          result.nextLifecycle.previousLifecycleId,
        ).toBe("lifecycle-001");
      },
    );
  },
);

/* ------------------------------------------------------------------ */
/* Superseded → Next */
/* ------------------------------------------------------------------ */

describe(
  "createNextRecommendationLifecycle - superseded transition",
  () => {
    it(
      "supersedes the current lifecycle by default",
      () => {
        const {
          history,
        } =
          createHistoryWithActiveRecommendation();

        const result =
          createNextRecommendationLifecycle({
            history,

            nextLifecycleId:
              "lifecycle-002",

            nextRecommendationId:
              "recommendation-002",

            nextRecommendation:
              createRuntimeNextActionFixture({
                title:
                  "Continue with the updated recommendation",
              }),

            nextTransitionId:
              "transition-create-002",

            currentTransitionId:
              "transition-supersede-001",

            occurredAt:
              SECOND_OCCURRED_AT,
          });

        expect(
          result.previousLifecycle?.state,
        ).toBe("superseded");

        expect(
          result.previousLifecycle?.resolution,
        ).toBe("superseded");

        expect(
          result.nextLifecycle.state,
        ).toBe("active");
      },
    );

    it(
      "uses runtime as the default actor for supersession",
      () => {
        const {
          history,
        } =
          createHistoryWithActiveRecommendation();

        const result =
          createNextRecommendationLifecycle({
            history,

            nextLifecycleId:
              "lifecycle-002",

            nextRecommendationId:
              "recommendation-002",

            nextRecommendation:
              createRuntimeNextActionFixture(),

            nextTransitionId:
              "transition-create-002",

            currentResolution:
              "superseded",

            currentTransitionId:
              "transition-supersede-001",

            occurredAt:
              SECOND_OCCURRED_AT,
          });

        const transitions =
          result.previousLifecycle
            ?.transitions ?? [];

        const lastTransition =
          transitions[
            transitions.length - 1
          ];

        expect(
          lastTransition,
        ).toMatchObject({
          fromState:
            "active",

          toState:
            "superseded",

          reason:
            "new-recommendation-selected",

          actor:
            "runtime",
        });
      },
    );

    it(
      "records which recommendation superseded the current one",
      () => {
        const {
          history,
        } =
          createHistoryWithActiveRecommendation();

        const result =
          createNextRecommendationLifecycle({
            history,

            nextLifecycleId:
              "lifecycle-002",

            nextRecommendationId:
              "recommendation-002",

            nextRecommendation:
              createRuntimeNextActionFixture(),

            nextTransitionId:
              "transition-create-002",

            currentResolution:
              "superseded",

            currentTransitionId:
              "transition-supersede-001",

            occurredAt:
              SECOND_OCCURRED_AT,
          });

        expect(
          result.previousLifecycle
            ?.supersededByRecommendationId,
        ).toBe("recommendation-002");
      },
    );

    it(
      "preserves an optional transition note",
      () => {
        const {
          history,
        } =
          createHistoryWithActiveRecommendation();

        const result =
          createNextRecommendationLifecycle({
            history,

            nextLifecycleId:
              "lifecycle-002",

            nextRecommendationId:
              "recommendation-002",

            nextRecommendation:
              createRuntimeNextActionFixture(),

            nextTransitionId:
              "transition-create-002",

            currentResolution:
              "superseded",

            currentTransitionId:
              "transition-supersede-001",

            occurredAt:
              SECOND_OCCURRED_AT,

            note:
              "The project state now supports a more specific recommendation.",
          });

        const transitions =
          result.previousLifecycle
            ?.transitions ?? [];

        const lastTransition =
          transitions[
            transitions.length - 1
          ];

        expect(
          lastTransition?.note,
        ).toBe(
          "The project state now supports a more specific recommendation.",
        );
      },
    );
  },
);

/* ------------------------------------------------------------------ */
/* History Chain */
/* ------------------------------------------------------------------ */

describe(
  "createNextRecommendationLifecycle - history chain",
  () => {
    it(
      "preserves lifecycle creation order",
      () => {
        const first =
          createNextRecommendationLifecycle({
            history:
              createEmptyHistory(),

            nextLifecycleId:
              "lifecycle-001",

            nextRecommendationId:
              "recommendation-001",

            nextRecommendation:
              createRuntimeNextActionFixture({
                title:
                  "First recommendation",
              }),

            nextTransitionId:
              "transition-create-001",

            occurredAt:
              FIRST_OCCURRED_AT,
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
              createRuntimeNextActionFixture({
                title:
                  "Second recommendation",
              }),

            nextTransitionId:
              "transition-create-002",

            currentResolution:
              "completed",

            currentTransitionId:
              "transition-complete-001",

            occurredAt:
              SECOND_OCCURRED_AT,
          });

        const third =
          createNextRecommendationLifecycle({
            history:
              second.history,

            nextLifecycleId:
              "lifecycle-003",

            nextRecommendationId:
              "recommendation-003",

            nextRecommendation:
              createRuntimeNextActionFixture({
                title:
                  "Third recommendation",
              }),

            nextTransitionId:
              "transition-create-003",

            currentResolution:
              "superseded",

            currentTransitionId:
              "transition-supersede-002",

            occurredAt:
              THIRD_OCCURRED_AT,
          });

        expect(
          third.history.records.map(
            (record) => record.id,
          ),
        ).toEqual([
          "lifecycle-001",
          "lifecycle-002",
          "lifecycle-003",
        ]);
      },
    );

    it(
      "creates bidirectional links across multiple lifecycles",
      () => {
        const first =
          createNextRecommendationLifecycle({
            history:
              createEmptyHistory(),

            nextLifecycleId:
              "lifecycle-001",

            nextRecommendationId:
              "recommendation-001",

            nextRecommendation:
              createRuntimeNextActionFixture(),

            nextTransitionId:
              "transition-create-001",

            occurredAt:
              FIRST_OCCURRED_AT,
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
              createRuntimeNextActionFixture(),

            nextTransitionId:
              "transition-create-002",

            currentResolution:
              "completed",

            currentTransitionId:
              "transition-complete-001",

            occurredAt:
              SECOND_OCCURRED_AT,
          });

        const third =
          createNextRecommendationLifecycle({
            history:
              second.history,

            nextLifecycleId:
              "lifecycle-003",

            nextRecommendationId:
              "recommendation-003",

            nextRecommendation:
              createRuntimeNextActionFixture(),

            nextTransitionId:
              "transition-create-003",

            currentResolution:
              "superseded",

            currentTransitionId:
              "transition-supersede-002",

            occurredAt:
              THIRD_OCCURRED_AT,
          });

        const [
          lifecycleOne,
          lifecycleTwo,
          lifecycleThree,
        ] =
          third.history.records;

        expect(
          lifecycleOne.previousLifecycleId,
        ).toBeNull();

        expect(
          lifecycleOne.nextLifecycleId,
        ).toBe("lifecycle-002");

        expect(
          lifecycleTwo.previousLifecycleId,
        ).toBe("lifecycle-001");

        expect(
          lifecycleTwo.nextLifecycleId,
        ).toBe("lifecycle-003");

        expect(
          lifecycleThree.previousLifecycleId,
        ).toBe("lifecycle-002");

        expect(
          lifecycleThree.nextLifecycleId,
        ).toBeNull();
      },
    );

    it(
      "keeps exactly one active lifecycle",
      () => {
        const first =
          createNextRecommendationLifecycle({
            history:
              createEmptyHistory(),

            nextLifecycleId:
              "lifecycle-001",

            nextRecommendationId:
              "recommendation-001",

            nextRecommendation:
              createRuntimeNextActionFixture(),

            nextTransitionId:
              "transition-create-001",

            occurredAt:
              FIRST_OCCURRED_AT,
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
              createRuntimeNextActionFixture(),

            nextTransitionId:
              "transition-create-002",

            currentTransitionId:
              "transition-supersede-001",

            occurredAt:
              SECOND_OCCURRED_AT,
          });

        const activeRecords =
          second.history.records.filter(
            (record) =>
              record.state === "active",
          );

        expect(
          activeRecords,
        ).toHaveLength(1);

        expect(
          activeRecords[0].id,
        ).toBe("lifecycle-002");

        expect(
          second.history.activeLifecycleId,
        ).toBe("lifecycle-002");
      },
    );
  },
);

/* ------------------------------------------------------------------ */
/* Immutability */
/* ------------------------------------------------------------------ */

describe(
  "createNextRecommendationLifecycle - immutability",
  () => {
    it(
      "does not mutate the empty input history",
      () => {
        const history =
          createEmptyHistory();

        const before =
          cloneHistory(history);

        createNextRecommendationLifecycle({
          history,

          nextLifecycleId:
            "lifecycle-001",

          nextRecommendationId:
            "recommendation-001",

          nextRecommendation:
            createRuntimeNextActionFixture(),

          nextTransitionId:
            "transition-create-001",

          occurredAt:
            FIRST_OCCURRED_AT,
        });

        expect(history).toEqual(before);

        expect(
          history.records,
        ).toHaveLength(0);

        expect(
          history.activeLifecycleId,
        ).toBeNull();
      },
    );

    it(
      "does not mutate the existing active history",
      () => {
        const {
          history,
        } =
          createHistoryWithActiveRecommendation();

        const before =
          cloneHistory(history);

        createNextRecommendationLifecycle({
          history,

          nextLifecycleId:
            "lifecycle-002",

          nextRecommendationId:
            "recommendation-002",

          nextRecommendation:
            createRuntimeNextActionFixture(),

          nextTransitionId:
            "transition-create-002",

          currentResolution:
            "completed",

          currentTransitionId:
            "transition-complete-001",

          occurredAt:
            SECOND_OCCURRED_AT,
        });

        expect(history).toEqual(before);

        expect(
          history.records[0].state,
        ).toBe("active");

        expect(
          history.records[0].nextLifecycleId,
        ).toBeNull();

        expect(
          history.records[0].transitions,
        ).toHaveLength(2);
      },
    );

    it(
      "returns new history and record references",
      () => {
        const {
          history,
        } =
          createHistoryWithActiveRecommendation();

        const originalRecord =
          history.records[0];

        const result =
          createNextRecommendationLifecycle({
            history,

            nextLifecycleId:
              "lifecycle-002",

            nextRecommendationId:
              "recommendation-002",

            nextRecommendation:
              createRuntimeNextActionFixture(),

            nextTransitionId:
              "transition-create-002",

            currentTransitionId:
              "transition-supersede-001",

            occurredAt:
              SECOND_OCCURRED_AT,
          });

        expect(
          result.history,
        ).not.toBe(history);

        expect(
          result.history.records,
        ).not.toBe(history.records);

        expect(
          result.history.records[0],
        ).not.toBe(originalRecord);
      },
    );
  },
);

/* ------------------------------------------------------------------ */
/* Validation */
/* ------------------------------------------------------------------ */

describe(
  "createNextRecommendationLifecycle - validation",
  () => {
    it(
      "requires currentTransitionId when an active lifecycle exists",
      () => {
        const {
          history,
        } =
          createHistoryWithActiveRecommendation();

        expect(() =>
          createNextRecommendationLifecycle({
            history,

            nextLifecycleId:
              "lifecycle-002",

            nextRecommendationId:
              "recommendation-002",

            nextRecommendation:
              createRuntimeNextActionFixture(),

            nextTransitionId:
              "transition-create-002",

            occurredAt:
              SECOND_OCCURRED_AT,
          }),
        ).toThrow(
          "currentTransitionId must be a non-empty string.",
        );
      },
    );

    it(
      "rejects a duplicate lifecycle ID",
      () => {
        const {
          history,
        } =
          createHistoryWithActiveRecommendation();

        expect(() =>
          createNextRecommendationLifecycle({
            history,

            nextLifecycleId:
              "lifecycle-001",

            nextRecommendationId:
              "recommendation-002",

            nextRecommendation:
              createRuntimeNextActionFixture(),

            nextTransitionId:
              "transition-create-002",

            currentTransitionId:
              "transition-supersede-001",

            occurredAt:
              SECOND_OCCURRED_AT,
          }),
        ).toThrow(
          "nextLifecycleId must not match the current lifecycle ID.",
        );
      },
    );

    it(
      "rejects a duplicate recommendation ID",
      () => {
        const {
          history,
        } =
          createHistoryWithActiveRecommendation();

        expect(() =>
          createNextRecommendationLifecycle({
            history,

            nextLifecycleId:
              "lifecycle-002",

            nextRecommendationId:
              "recommendation-001",

            nextRecommendation:
              createRuntimeNextActionFixture(),

            nextTransitionId:
              "transition-create-002",

            currentTransitionId:
              "transition-supersede-001",

            occurredAt:
              SECOND_OCCURRED_AT,
          }),
        ).toThrow(
          "nextRecommendationId must not match the current recommendationId.",
        );
      },
    );

    it(
      "rejects a lifecycle ID that already exists in older history",
      () => {
        const first =
          createNextRecommendationLifecycle({
            history:
              createEmptyHistory(),

            nextLifecycleId:
              "lifecycle-001",

            nextRecommendationId:
              "recommendation-001",

            nextRecommendation:
              createRuntimeNextActionFixture(),

            nextTransitionId:
              "transition-create-001",

            occurredAt:
              FIRST_OCCURRED_AT,
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
              createRuntimeNextActionFixture(),

            nextTransitionId:
              "transition-create-002",

            currentTransitionId:
              "transition-supersede-001",

            occurredAt:
              SECOND_OCCURRED_AT,
          });

        expect(() =>
          createNextRecommendationLifecycle({
            history:
              second.history,

            nextLifecycleId:
              "lifecycle-001",

            nextRecommendationId:
              "recommendation-003",

            nextRecommendation:
              createRuntimeNextActionFixture(),

            nextTransitionId:
              "transition-create-003",

            currentTransitionId:
              "transition-supersede-002",

            occurredAt:
              THIRD_OCCURRED_AT,
          }),
        ).toThrow(
          'Lifecycle "lifecycle-001" already exists in history.',
        );
      },
    );

    it(
      "rejects a recommendation ID that already exists in older history",
      () => {
        const first =
          createNextRecommendationLifecycle({
            history:
              createEmptyHistory(),

            nextLifecycleId:
              "lifecycle-001",

            nextRecommendationId:
              "recommendation-001",

            nextRecommendation:
              createRuntimeNextActionFixture(),

            nextTransitionId:
              "transition-create-001",

            occurredAt:
              FIRST_OCCURRED_AT,
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
              createRuntimeNextActionFixture(),

            nextTransitionId:
              "transition-create-002",

            currentTransitionId:
              "transition-supersede-001",

            occurredAt:
              SECOND_OCCURRED_AT,
          });

        expect(() =>
          createNextRecommendationLifecycle({
            history:
              second.history,

            nextLifecycleId:
              "lifecycle-003",

            nextRecommendationId:
              "recommendation-001",

            nextRecommendation:
              createRuntimeNextActionFixture(),

            nextTransitionId:
              "transition-create-003",

            currentTransitionId:
              "transition-supersede-002",

            occurredAt:
              THIRD_OCCURRED_AT,
          }),
        ).toThrow(
          'Recommendation "recommendation-001" already exists in lifecycle history.',
        );
      },
    );

    it(
      "rejects an occurredAt timestamp earlier than history.updatedAt",
      () => {
        const {
          history,
        } =
          createHistoryWithActiveRecommendation();

        expect(() =>
          createNextRecommendationLifecycle({
            history,

            nextLifecycleId:
              "lifecycle-002",

            nextRecommendationId:
              "recommendation-002",

            nextRecommendation:
              createRuntimeNextActionFixture(),

            nextTransitionId:
              "transition-create-002",

            currentTransitionId:
              "transition-supersede-001",

            occurredAt:
              HISTORY_CREATED_AT,
          }),
        ).toThrow(
          "occurredAt must not be earlier than history.updatedAt.",
        );
      },
    );

    it(
      "rejects an invalid occurredAt timestamp",
      () => {
        expect(() =>
          createNextRecommendationLifecycle({
            history:
              createEmptyHistory(),

            nextLifecycleId:
              "lifecycle-001",

            nextRecommendationId:
              "recommendation-001",

            nextRecommendation:
              createRuntimeNextActionFixture(),

            nextTransitionId:
              "transition-create-001",

            occurredAt:
              "invalid-date",
          }),
        ).toThrow(
          "occurredAt must be a valid ISO 8601 timestamp.",
        );
      },
    );

    it(
      "rejects a null recommendation",
      () => {
        expect(() =>
          createNextRecommendationLifecycle({
            history:
              createEmptyHistory(),

            nextLifecycleId:
              "lifecycle-001",

            nextRecommendationId:
              "recommendation-001",

            nextRecommendation:
              null as unknown as RuntimeNextAction,

            nextTransitionId:
              "transition-create-001",

            occurredAt:
              FIRST_OCCURRED_AT,
          }),
        ).toThrow(
          "nextRecommendation must be a valid RuntimeNextAction object.",
        );
      },
    );

    it(
      "rejects an empty next lifecycle ID",
      () => {
        expect(() =>
          createNextRecommendationLifecycle({
            history:
              createEmptyHistory(),

            nextLifecycleId:
              " ",

            nextRecommendationId:
              "recommendation-001",

            nextRecommendation:
              createRuntimeNextActionFixture(),

            nextTransitionId:
              "transition-create-001",

            occurredAt:
              FIRST_OCCURRED_AT,
          }),
        ).toThrow(
          "nextLifecycleId must be a non-empty string.",
        );
      },
    );

    it(
      "rejects an empty next recommendation ID",
      () => {
        expect(() =>
          createNextRecommendationLifecycle({
            history:
              createEmptyHistory(),

            nextLifecycleId:
              "lifecycle-001",

            nextRecommendationId:
              "",

            nextRecommendation:
              createRuntimeNextActionFixture(),

            nextTransitionId:
              "transition-create-001",

            occurredAt:
              FIRST_OCCURRED_AT,
          }),
        ).toThrow(
          "nextRecommendationId must be a non-empty string.",
        );
      },
    );

    it(
      "rejects an inconsistent history with multiple active records",
      () => {
        const {
          history,
          activeLifecycle,
        } =
          createHistoryWithActiveRecommendation();

        const invalidHistory:
          RuntimeRecommendationLifecycleHistory = {
          ...history,

          records: [
            activeLifecycle,

            {
              ...activeLifecycle,

              id:
                "lifecycle-invalid-active",

              recommendationId:
                "recommendation-invalid-active",
            },
          ],
        };

        expect(() =>
          createNextRecommendationLifecycle({
            history:
              invalidHistory,

            nextLifecycleId:
              "lifecycle-002",

            nextRecommendationId:
              "recommendation-002",

            nextRecommendation:
              createRuntimeNextActionFixture(),

            nextTransitionId:
              "transition-create-002",

            currentTransitionId:
              "transition-supersede-001",

            occurredAt:
              SECOND_OCCURRED_AT,
          }),
        ).toThrow(
          "Lifecycle History contains multiple active records.",
        );
      },
    );

    it(
      "rejects an activeLifecycleId that references a missing record",
      () => {
        const invalidHistory:
          RuntimeRecommendationLifecycleHistory = {
          ...createEmptyHistory(),

          activeLifecycleId:
            "missing-lifecycle",
        };

        expect(() =>
          createNextRecommendationLifecycle({
            history:
              invalidHistory,

            nextLifecycleId:
              "lifecycle-001",

            nextRecommendationId:
              "recommendation-001",

            nextRecommendation:
              createRuntimeNextActionFixture(),

            nextTransitionId:
              "transition-create-001",

            occurredAt:
              FIRST_OCCURRED_AT,
          }),
        ).toThrow(
          'activeLifecycleId "missing-lifecycle" does not exist.',
        );
      },
    );

    it(
      "rejects a history with an active record but a null activeLifecycleId",
      () => {
        const {
          activeLifecycle,
        } =
          createHistoryWithActiveRecommendation();

        const invalidHistory:
          RuntimeRecommendationLifecycleHistory = {
          ...createEmptyHistory(),

          records: [
            activeLifecycle,
          ],

          activeLifecycleId:
            null,

          updatedAt:
            FIRST_OCCURRED_AT,
        };

        expect(() =>
          createNextRecommendationLifecycle({
            history:
              invalidHistory,

            nextLifecycleId:
              "lifecycle-002",

            nextRecommendationId:
              "recommendation-002",

            nextRecommendation:
              createRuntimeNextActionFixture(),

            nextTransitionId:
              "transition-create-002",

            occurredAt:
              SECOND_OCCURRED_AT,
          }),
        ).toThrow(
          "activeLifecycleId is null but an active lifecycle exists.",
        );
      },
    );
  },
);