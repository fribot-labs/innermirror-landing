import {
    describe,
    expect,
    it,
} from "vitest";

import type {
    CanonicalProjectHistorySnapshot,
} from "../../project-history/canonicalProjectHistoryTypes";

import {
    createProjectHistoryRuntimeInput,
} from "../createProjectHistoryRuntimeInput";


const PROJECT_ID =
  "375880f2-5a87-4f60-8144-e91ea469ef04";

const REPOSITORY_ID =
  "1327565641";


describe(
  "createProjectHistoryRuntimeInput",
  () => {
    it(
      "creates a Runtime Project History input v1",
      () => {
        const result =
          createProjectHistoryRuntimeInput({
            snapshot:
              createSnapshot(),
          });

        expect(
          result.contractVersion
        ).toBe(
          "v1"
        );

        expect(
          result.project
        ).toEqual({
          projectId:
            PROJECT_ID,

          repositoryId:
            REPOSITORY_ID,
        });
      }
    );


    it(
      "preserves the canonical project identity",
      () => {
        const result =
          createProjectHistoryRuntimeInput({
            snapshot:
              createSnapshot({
                project: {
                  projectId:
                    `  ${PROJECT_ID}  `,

                  repositoryId:
                    REPOSITORY_ID,
                },
              }),
          });

        expect(
          result.project.projectId
        ).toBe(
          PROJECT_ID
        );
      }
    );


    it(
      "preserves the stable repository identity",
      () => {
        const result =
          createProjectHistoryRuntimeInput({
            snapshot:
              createSnapshot({
                project: {
                  projectId:
                    PROJECT_ID,

                  repositoryId:
                    `  ${REPOSITORY_ID}  `,
                },
              }),
          });

        expect(
          result.project.repositoryId
        ).toBe(
          REPOSITORY_ID
        );
      }
    );


    it(
      "maps Reflection history events into Runtime history events",
      () => {
        const result =
          createProjectHistoryRuntimeInput({
            snapshot:
              createSnapshot(),
          });

        expect(
          result.events
        ).toEqual([
          {
            eventId:
              "reflection-1",

            eventType:
              "reflection",

            content:
              "First Reflection",

            source:
              "landing",

            occurredAt:
              "2026-08-10T01:00:00.000Z",
          },

          {
            eventId:
              "reflection-2",

            eventType:
              "reflection",

            content:
              "Second Reflection",

            source:
              "landing",

            occurredAt:
              "2026-08-11T02:00:00.000Z",
          },
        ]);
      }
    );


    it(
      "assigns reflection as the Runtime event type",
      () => {
        const result =
          createProjectHistoryRuntimeInput({
            snapshot:
              createSnapshot(),
          });

        expect(
          result.events.every(
            (event) =>
              event.eventType ===
              "reflection"
          )
        ).toBe(
          true
        );
      }
    );


    it(
      "maps Reflection createdAt to Runtime occurredAt",
      () => {
        const result =
          createProjectHistoryRuntimeInput({
            snapshot:
              createSnapshot({
                events: [
                  {
                    reflectionId:
                      "reflection-offset",

                    content:
                      "Offset timestamp",

                    source:
                      "landing",

                    createdAt:
                      "2026-08-11T12:30:00+09:00",
                  },
                ],

                eventCount:
                  1,

                timeRange: {
                  startedAt:
                    "2026-08-11T12:30:00+09:00",

                  endedAt:
                    "2026-08-11T12:30:00+09:00",
                },
              }),
          });

        expect(
          result.events[0]?.occurredAt
        ).toBe(
          "2026-08-11T03:30:00.000Z"
        );
      }
    );


    it(
      "preserves chronological history event order",
      () => {
        const result =
          createProjectHistoryRuntimeInput({
            snapshot:
              createSnapshot(),
          });

        expect(
          result.events.map(
            (event) =>
              event.eventId
          )
        ).toEqual([
          "reflection-1",
          "reflection-2",
        ]);
      }
    );


    it(
      "preserves the history event count",
      () => {
        const result =
          createProjectHistoryRuntimeInput({
            snapshot:
              createSnapshot(),
          });

        expect(
          result.eventCount
        ).toBe(
          2
        );
      }
    );


    it(
      "preserves the canonical history time range",
      () => {
        const result =
          createProjectHistoryRuntimeInput({
            snapshot:
              createSnapshot(),
          });

        expect(
          result.timeRange
        ).toEqual({
          startedAt:
            "2026-08-10T01:00:00.000Z",

          endedAt:
            "2026-08-11T02:00:00.000Z",
        });
      }
    );


    it(
      "maps Snapshot createdAt to snapshotCreatedAt",
      () => {
        const result =
          createProjectHistoryRuntimeInput({
            snapshot:
              createSnapshot({
                createdAt:
                  "2026-08-11T12:00:00+09:00",
              }),
          });

        expect(
          result.snapshotCreatedAt
        ).toBe(
          "2026-08-11T03:00:00.000Z"
        );
      }
    );


    it(
      "supports an empty canonical project history",
      () => {
        const result =
          createProjectHistoryRuntimeInput({
            snapshot:
              createSnapshot({
                events:
                  [],

                eventCount:
                  0,

                timeRange: {
                  startedAt:
                    null,

                  endedAt:
                    null,
                },
              }),
          });

        expect(
          result.events
        ).toEqual(
          []
        );

        expect(
          result.eventCount
        ).toBe(
          0
        );

        expect(
          result.timeRange
        ).toEqual({
          startedAt:
            null,

          endedAt:
            null,
        });
      }
    );


    it(
      "rejects an unsupported Snapshot version",
      () => {
        const snapshot =
          createSnapshot();

        const unsupportedSnapshot =
          {
            ...snapshot,

            snapshotVersion:
              "v2",
          } as unknown as
            CanonicalProjectHistorySnapshot;

        expect(() =>
          createProjectHistoryRuntimeInput({
            snapshot:
              unsupportedSnapshot,
          })
        ).toThrow(
          "Project History Runtime Input requires Canonical Project History Snapshot v1."
        );
      }
    );


    it(
      "rejects an empty canonical project identity",
      () => {
        expect(() =>
          createProjectHistoryRuntimeInput({
            snapshot:
              createSnapshot({
                project: {
                  projectId:
                    "   ",

                  repositoryId:
                    REPOSITORY_ID,
                },
              }),
          })
        ).toThrow(
          "Project History Runtime Input requires a canonical project identity."
        );
      }
    );


    it(
      "rejects an empty stable repository identity",
      () => {
        expect(() =>
          createProjectHistoryRuntimeInput({
            snapshot:
              createSnapshot({
                project: {
                  projectId:
                    PROJECT_ID,

                  repositoryId:
                    "   ",
                },
              }),
          })
        ).toThrow(
          "Project History Runtime Input requires a stable repository identity."
        );
      }
    );


    it(
      "rejects an eventCount that does not match the history events",
      () => {
        expect(() =>
          createProjectHistoryRuntimeInput({
            snapshot:
              createSnapshot({
                eventCount:
                  999,
              }),
          })
        ).toThrow(
          "Project History Runtime Input requires eventCount to match the number of history events."
        );
      }
    );


    it(
      "rejects an empty history with a non-null time range",
      () => {
        expect(() =>
          createProjectHistoryRuntimeInput({
            snapshot:
              createSnapshot({
                events:
                  [],

                eventCount:
                  0,

                timeRange: {
                  startedAt:
                    "2026-08-10T01:00:00.000Z",

                  endedAt:
                    "2026-08-10T01:00:00.000Z",
                },
              }),
          })
        ).toThrow(
          "Project History Runtime Input requires an empty history to have a null time range."
        );
      }
    );


    it(
      "rejects a non-empty history with an incomplete time range",
      () => {
        expect(() =>
          createProjectHistoryRuntimeInput({
            snapshot:
              createSnapshot({
                timeRange: {
                  startedAt:
                    null,

                  endedAt:
                    "2026-08-11T02:00:00.000Z",
                },
              }),
          })
        ).toThrow(
          "Project History Runtime Input requires a non-empty history to have a complete time range."
        );
      }
    );


    it(
      "rejects a history time range that does not match its first and last events",
      () => {
        expect(() =>
          createProjectHistoryRuntimeInput({
            snapshot:
              createSnapshot({
                timeRange: {
                  startedAt:
                    "2026-08-10T02:00:00.000Z",

                  endedAt:
                    "2026-08-11T02:00:00.000Z",
                },
              }),
          })
        ).toThrow(
          "Project History Runtime Input time range must match the first and last history events."
        );
      }
    );


    it(
      "rejects a history event without a stable event identity",
      () => {
        expect(() =>
          createProjectHistoryRuntimeInput({
            snapshot:
              createSnapshot({
                events: [
                  {
                    reflectionId:
                      "   ",

                    content:
                      "Invalid event",

                    source:
                      "landing",

                    createdAt:
                      "2026-08-10T01:00:00.000Z",
                  },
                ],

                eventCount:
                  1,

                timeRange: {
                  startedAt:
                    "2026-08-10T01:00:00.000Z",

                  endedAt:
                    "2026-08-10T01:00:00.000Z",
                },
              }),
          })
        ).toThrow(
          "Project History Runtime Input requires every history event to have a stable event identity."
        );
      }
    );


    it(
      "rejects invalid history event timestamps",
      () => {
        expect(() =>
          createProjectHistoryRuntimeInput({
            snapshot:
              createSnapshot({
                events: [
                  {
                    reflectionId:
                      "reflection-invalid-date",

                    content:
                      "Invalid timestamp",

                    source:
                      "landing",

                    createdAt:
                      "not-a-date",
                  },
                ],

                eventCount:
                  1,

                timeRange: {
                  startedAt:
                    "not-a-date",

                  endedAt:
                    "not-a-date",
                },
              }),
          })
        ).toThrow(
          "Project History Runtime Input requires a valid history start timestamp."
        );
      }
    );


    it(
      "rejects an invalid snapshot creation timestamp",
      () => {
        expect(() =>
          createProjectHistoryRuntimeInput({
            snapshot:
              createSnapshot({
                createdAt:
                  "invalid-snapshot-date",
              }),
          })
        ).toThrow(
          "Project History Runtime Input requires a valid snapshot creation timestamp."
        );
      }
    );
  }
);


function createSnapshot(
  overrides:
    Partial<CanonicalProjectHistorySnapshot> = {}
): CanonicalProjectHistorySnapshot {
  return {
    snapshotVersion:
      "v1",

    project: {
      projectId:
        PROJECT_ID,

      repositoryId:
        REPOSITORY_ID,
    },

    events: [
      {
        reflectionId:
          "reflection-1",

        content:
          "First Reflection",

        source:
          "landing",

        createdAt:
          "2026-08-10T01:00:00.000Z",
      },

      {
        reflectionId:
          "reflection-2",

        content:
          "Second Reflection",

        source:
          "landing",

        createdAt:
          "2026-08-11T02:00:00.000Z",
      },
    ],

    eventCount:
      2,

    timeRange: {
      startedAt:
        "2026-08-10T01:00:00.000Z",

      endedAt:
        "2026-08-11T02:00:00.000Z",
    },

    createdAt:
      "2026-08-11T03:00:00.000Z",

    ...overrides,
  };
}