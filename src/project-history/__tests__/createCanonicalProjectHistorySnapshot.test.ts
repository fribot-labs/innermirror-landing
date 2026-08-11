import {
    describe,
    expect,
    it,
} from "vitest";

import type {
    ProjectRecord,
} from "../../lib/projectPersistence";

import type {
    ReflectionRecord,
} from "../../lib/reflectionPersistence";

import {
    createCanonicalProjectHistorySnapshot,
} from "../createCanonicalProjectHistorySnapshot";


const PROJECT_ID =
  "375880f2-5a87-4f60-8144-e91ea469ef04";

const OTHER_PROJECT_ID =
  "11111111-2222-3333-4444-555555555555";

const REPOSITORY_ID =
  "1327565641";

const USER_ID =
  "945b3454-3d6c-4433-af37-40e3fa227776";


describe(
  "createCanonicalProjectHistorySnapshot",
  () => {
    it(
      "creates a canonical project history snapshot",
      () => {
        const snapshot =
          createCanonicalProjectHistorySnapshot({
            project:
              createProject(),

            reflections: [
              createReflection(),
            ],

            createdAt:
              "2026-08-11T03:00:00.000Z",
          });

        expect(
          snapshot.snapshotVersion
        ).toBe(
          "v1"
        );

        expect(
          snapshot.project
        ).toEqual({
          projectId:
            PROJECT_ID,

          repositoryId:
            REPOSITORY_ID,
        });

        expect(
          snapshot.eventCount
        ).toBe(
          1
        );

        expect(
          snapshot.createdAt
        ).toBe(
          "2026-08-11T03:00:00.000Z"
        );
      }
    );


    it(
      "maps Reflection records into canonical history events",
      () => {
        const snapshot =
          createCanonicalProjectHistorySnapshot({
            project:
              createProject(),

            reflections: [
              createReflection({
                id:
                  "reflection-123",

                content:
                  "I am beginning to understand why state and behavior belong together.",

                source:
                  "landing",

                createdAt:
                  "2026-08-11T01:30:00.000Z",
              }),
            ],
          });

        expect(
          snapshot.events
        ).toEqual([
          {
            reflectionId:
              "reflection-123",

            content:
              "I am beginning to understand why state and behavior belong together.",

            source:
              "landing",

            createdAt:
              "2026-08-11T01:30:00.000Z",
          },
        ]);
      }
    );


    it(
      "preserves the stable repository identity",
      () => {
        const snapshot =
          createCanonicalProjectHistorySnapshot({
            project:
              createProject({
                repositoryId:
                  " 1327565641 ",
              }),

            reflections:
              [],
          });

        expect(
          snapshot.project.repositoryId
        ).toBe(
          REPOSITORY_ID
        );
      }
    );


    it(
      "normalizes the canonical project identity",
      () => {
        const projectId =
          ` ${PROJECT_ID} `;

        const snapshot =
          createCanonicalProjectHistorySnapshot({
            project:
              createProject({
                id:
                  projectId,
              }),

            reflections: [
              createReflection({
                projectId:
                  PROJECT_ID,
              }),
            ],
          });

        expect(
          snapshot.project.projectId
        ).toBe(
          PROJECT_ID
        );
      }
    );


    it(
      "orders history events from oldest to newest",
      () => {
        const snapshot =
          createCanonicalProjectHistorySnapshot({
            project:
              createProject(),

            reflections: [
              createReflection({
                id:
                  "newest",

                createdAt:
                  "2026-08-11T03:00:00.000Z",
              }),

              createReflection({
                id:
                  "oldest",

                createdAt:
                  "2026-08-10T22:00:00.000Z",
              }),

              createReflection({
                id:
                  "middle",

                createdAt:
                  "2026-08-11T01:00:00.000Z",
              }),
            ],
          });

        expect(
          snapshot.events.map(
            (event) =>
              event.reflectionId
          )
        ).toEqual([
          "oldest",
          "middle",
          "newest",
        ]);
      }
    );


    it(
      "does not mutate the original Reflection array while ordering events",
      () => {
        const reflections = [
          createReflection({
            id:
              "newer",

            createdAt:
              "2026-08-11T02:00:00.000Z",
          }),

          createReflection({
            id:
              "older",

            createdAt:
              "2026-08-11T01:00:00.000Z",
          }),
        ];

        createCanonicalProjectHistorySnapshot({
          project:
            createProject(),

          reflections,
        });

        expect(
          reflections.map(
            (reflection) =>
              reflection.id
          )
        ).toEqual([
          "newer",
          "older",
        ]);
      }
    );


    it(
      "derives the history time range from ordered events",
      () => {
        const snapshot =
          createCanonicalProjectHistorySnapshot({
            project:
              createProject(),

            reflections: [
              createReflection({
                id:
                  "later",

                createdAt:
                  "2026-08-11T04:00:00.000Z",
              }),

              createReflection({
                id:
                  "earlier",

                createdAt:
                  "2026-08-09T08:30:00.000Z",
              }),
            ],
          });

        expect(
          snapshot.timeRange
        ).toEqual({
          startedAt:
            "2026-08-09T08:30:00.000Z",

          endedAt:
            "2026-08-11T04:00:00.000Z",
        });
      }
    );


    it(
      "creates an empty history snapshot",
      () => {
        const snapshot =
          createCanonicalProjectHistorySnapshot({
            project:
              createProject(),

            reflections:
              [],
          });

        expect(
          snapshot.events
        ).toEqual(
          []
        );

        expect(
          snapshot.eventCount
        ).toBe(
          0
        );

        expect(
          snapshot.timeRange
        ).toEqual({
          startedAt:
            null,

          endedAt:
            null,
        });
      }
    );


    it(
      "uses the same timestamp as both boundaries for a one-event history",
      () => {
        const snapshot =
          createCanonicalProjectHistorySnapshot({
            project:
              createProject(),

            reflections: [
              createReflection({
                createdAt:
                  "2026-08-11T01:00:00.000Z",
              }),
            ],
          });

        expect(
          snapshot.timeRange
        ).toEqual({
          startedAt:
            "2026-08-11T01:00:00.000Z",

          endedAt:
            "2026-08-11T01:00:00.000Z",
        });
      }
    );


    it(
      "normalizes valid Snapshot createdAt values to ISO format",
      () => {
        const snapshot =
          createCanonicalProjectHistorySnapshot({
            project:
              createProject(),

            reflections:
              [],

            createdAt:
              "2026-08-11T12:00:00+09:00",
          });

        expect(
          snapshot.createdAt
        ).toBe(
          "2026-08-11T03:00:00.000Z"
        );
      }
    );


    it(
      "normalizes valid Reflection timestamps to ISO format",
      () => {
        const snapshot =
          createCanonicalProjectHistorySnapshot({
            project:
              createProject(),

            reflections: [
              createReflection({
                createdAt:
                  "2026-08-11T12:30:00+09:00",
              }),
            ],
          });

        expect(
          snapshot.events[0]?.createdAt
        ).toBe(
          "2026-08-11T03:30:00.000Z"
        );
      }
    );


    it(
      "rejects a Reflection belonging to another canonical project",
      () => {
        expect(() =>
          createCanonicalProjectHistorySnapshot({
            project:
              createProject(),

            reflections: [
              createReflection({
                projectId:
                  OTHER_PROJECT_ID,
              }),
            ],
          })
        ).toThrow(
          "Canonical Project History Snapshot cannot include a Reflection from another project."
        );
      }
    );


    it(
      "rejects a standalone Reflection without project ownership",
      () => {
        expect(() =>
          createCanonicalProjectHistorySnapshot({
            project:
              createProject(),

            reflections: [
              createReflection({
                projectId:
                  null,
              }),
            ],
          })
        ).toThrow(
          "Canonical Project History Snapshot cannot include a Reflection from another project."
        );
      }
    );


    it(
      "rejects an empty canonical project identity",
      () => {
        expect(() =>
          createCanonicalProjectHistorySnapshot({
            project:
              createProject({
                id:
                  "   ",
              }),

            reflections:
              [],
          })
        ).toThrow(
          "Canonical Project History Snapshot requires a canonical project identity."
        );
      }
    );


    it(
      "rejects a missing stable repository identity",
      () => {
        expect(() =>
          createCanonicalProjectHistorySnapshot({
            project:
              createProject({
                repositoryId:
                  null,
              }),

            reflections:
              [],
          })
        ).toThrow(
          "Canonical Project History Snapshot requires a stable repository identity."
        );
      }
    );


    it(
      "rejects an empty stable repository identity",
      () => {
        expect(() =>
          createCanonicalProjectHistorySnapshot({
            project:
              createProject({
                repositoryId:
                  "   ",
              }),

            reflections:
              [],
          })
        ).toThrow(
          "Canonical Project History Snapshot requires a stable repository identity."
        );
      }
    );


    it(
      "rejects an invalid Snapshot createdAt value",
      () => {
        expect(() =>
          createCanonicalProjectHistorySnapshot({
            project:
              createProject(),

            reflections:
              [],

            createdAt:
              "not-a-date",
          })
        ).toThrow(
          "Canonical Project History Snapshot requires a valid createdAt value."
        );
      }
    );


    it(
      "rejects invalid Reflection timestamps",
      () => {
        expect(() =>
          createCanonicalProjectHistorySnapshot({
            project:
              createProject(),

            reflections: [
              createReflection({
                createdAt:
                  "invalid-reflection-date",
              }),
            ],
          })
        ).toThrow(
          "Canonical Project History Snapshot requires valid Reflection timestamps."
        );
      }
    );
  }
);


function createProject(
  overrides:
    Partial<ProjectRecord> = {}
): ProjectRecord {
  return {
    id:
      PROJECT_ID,

    userId:
      USER_ID,

    name:
      "class-concept-robot",

    repositoryId:
      REPOSITORY_ID,

    repositoryOwner:
      "fribot-labs",

    repositoryName:
      "class-concept-robot",

    templateId:
      null,

    courseId:
      null,

    currentFocus:
      "class concept",

    status:
      "active",

    startedAt:
      "2026-08-11T00:00:00.000Z",

    createdAt:
      "2026-08-11T00:00:00.000Z",

    updatedAt:
      "2026-08-11T00:00:00.000Z",

    ...overrides,
  };
}


function createReflection(
  overrides:
    Partial<ReflectionRecord> = {}
): ReflectionRecord {
  return {
    id:
      "reflection-1",

    userId:
      USER_ID,

    projectId:
      PROJECT_ID,

    content:
      "Reflection",

    source:
      "landing",

    createdAt:
      "2026-08-11T01:00:00.000Z",

    updatedAt:
      "2026-08-11T01:00:00.000Z",

    ...overrides,
  };
}