import {
    describe,
    expect,
    it,
} from "vitest";

import type {
    ProjectEventRecord,
} from "../../lib/projectEventPersistence";

import {
    createProjectLifecycleHistory,
} from "../projectLifecycleHistory";


const PROJECT_ID =
  "375880f2-5a87-4f60-8144-e91ea469ef04";

const USER_ID =
  "945b3454-3d6c-4433-af37-40e3fa227776";


function createProjectEvent(
  overrides:
    Partial<ProjectEventRecord> = {}
): ProjectEventRecord {
  return {
    id:
      "11111111-1111-4111-8111-111111111111",

    userId:
      USER_ID,

    projectId:
      PROJECT_ID,

    eventType:
      "project_started",

    eventData: {
      focus:
        "class abstraction",
    },

    occurredAt:
      "2026-08-12T00:50:58.000Z",

    createdAt:
      "2026-08-12T00:50:59.000Z",

    ...overrides,
  };
}


describe(
  "createProjectLifecycleHistory",
  () => {
    it(
      "returns an empty history when no Project Events are provided",
      () => {
        const result =
          createProjectLifecycleHistory(
            []
          );

        expect(
          result
        ).toEqual(
          []
        );
      }
    );


    it(
      "creates a project-started history entry from a project_started event",
      () => {
        const event =
          createProjectEvent();

        const result =
          createProjectLifecycleHistory(
            [
              event,
            ]
          );

        expect(
          result
        ).toEqual([
          {
            type:
              "project-started",

            eventId:
              event.id,

            projectId:
              PROJECT_ID,

            focus:
              "class abstraction",

            occurredAt:
              "2026-08-12T00:50:58.000Z",
          },
        ]);
      }
    );


    it(
      "normalizes the Project start focus before creating history",
      () => {
        const event =
          createProjectEvent({
            eventData: {
              focus:
                "  class abstraction  ",
            },
          });

        const result =
          createProjectLifecycleHistory(
            [
              event,
            ]
          );

        expect(
          result
        ).toEqual([
          {
            type:
              "project-started",

            eventId:
              event.id,

            projectId:
              PROJECT_ID,

            focus:
              "class abstraction",

            occurredAt:
              event.occurredAt,
          },
        ]);
      }
    );


    it(
      "allows a project-started event without a focus",
      () => {
        const event =
          createProjectEvent({
            eventData:
              {},
          });

        const result =
          createProjectLifecycleHistory(
            [
              event,
            ]
          );

        expect(
          result
        ).toEqual([
          {
            type:
              "project-started",

            eventId:
              event.id,

            projectId:
              PROJECT_ID,

            focus:
              null,

            occurredAt:
              event.occurredAt,
          },
        ]);
      }
    );


    it(
      "normalizes an empty Project start focus to null",
      () => {
        const event =
          createProjectEvent({
            eventData: {
              focus:
                "   ",
            },
          });

        const result =
          createProjectLifecycleHistory(
            [
              event,
            ]
          );

        expect(
          result[0]
        ).toEqual({
          type:
            "project-started",

          eventId:
            event.id,

          projectId:
            PROJECT_ID,

          focus:
            null,

          occurredAt:
            event.occurredAt,
        });
      }
    );


    it(
      "creates a focus-updated history entry from a focus_updated event",
      () => {
        const event =
          createProjectEvent({
            id:
              "22222222-2222-4222-8222-222222222222",

            eventType:
              "focus_updated",

            eventData: {
              previousFocus:
                "class abstraction",

              nextFocus:
                "class relationships",
            },

            occurredAt:
              "2026-08-12T00:53:21.000Z",
          });

        const result =
          createProjectLifecycleHistory(
            [
              event,
            ]
          );

        expect(
          result
        ).toEqual([
          {
            type:
              "focus-updated",

            eventId:
              event.id,

            projectId:
              PROJECT_ID,

            previousFocus:
              "class abstraction",

            nextFocus:
              "class relationships",

            occurredAt:
              "2026-08-12T00:53:21.000Z",
          },
        ]);
      }
    );


    it(
      "normalizes previous and next focus values",
      () => {
        const event =
          createProjectEvent({
            eventType:
              "focus_updated",

            eventData: {
              previousFocus:
                "  class abstraction  ",

              nextFocus:
                "  class relationships  ",
            },
          });

        const result =
          createProjectLifecycleHistory(
            [
              event,
            ]
          );

        expect(
          result[0]
        ).toEqual({
          type:
            "focus-updated",

          eventId:
            event.id,

          projectId:
            PROJECT_ID,

          previousFocus:
            "class abstraction",

          nextFocus:
            "class relationships",

          occurredAt:
            event.occurredAt,
        });
      }
    );


    it(
      "allows a focus-updated event without a previous focus",
      () => {
        const event =
          createProjectEvent({
            eventType:
              "focus_updated",

            eventData: {
              nextFocus:
                "class relationships",
            },
          });

        const result =
          createProjectLifecycleHistory(
            [
              event,
            ]
          );

        expect(
          result[0]
        ).toEqual({
          type:
            "focus-updated",

          eventId:
            event.id,

          projectId:
            PROJECT_ID,

          previousFocus:
            null,

          nextFocus:
            "class relationships",

          occurredAt:
            event.occurredAt,
        });
      }
    );


    it(
      "normalizes an empty previous focus to null",
      () => {
        const event =
          createProjectEvent({
            eventType:
              "focus_updated",

            eventData: {
              previousFocus:
                "   ",

              nextFocus:
                "class relationships",
            },
          });

        const result =
          createProjectLifecycleHistory(
            [
              event,
            ]
          );

        expect(
          result[0]
        ).toMatchObject({
          type:
            "focus-updated",

          previousFocus:
            null,

          nextFocus:
            "class relationships",
        });
      }
    );


    it(
      "omits a focus-updated event when nextFocus is missing",
      () => {
        const event =
          createProjectEvent({
            eventType:
              "focus_updated",

            eventData: {
              previousFocus:
                "class abstraction",
            },
          });

        const result =
          createProjectLifecycleHistory(
            [
              event,
            ]
          );

        expect(
          result
        ).toEqual(
          []
        );
      }
    );


    it(
      "omits a focus-updated event when nextFocus is empty",
      () => {
        const event =
          createProjectEvent({
            eventType:
              "focus_updated",

            eventData: {
              previousFocus:
                "class abstraction",

              nextFocus:
                "   ",
            },
          });

        const result =
          createProjectLifecycleHistory(
            [
              event,
            ]
          );

        expect(
          result
        ).toEqual(
          []
        );
      }
    );


    it(
      "ignores project_created events",
      () => {
        const event =
          createProjectEvent({
            eventType:
              "project_created",

            eventData:
              {},
          });

        const result =
          createProjectLifecycleHistory(
            [
              event,
            ]
          );

        expect(
          result
        ).toEqual(
          []
        );
      }
    );


    it(
      "ignores project_completed events",
      () => {
        const event =
          createProjectEvent({
            eventType:
              "project_completed",

            eventData:
              {},
          });

        const result =
          createProjectLifecycleHistory(
            [
              event,
            ]
          );

        expect(
          result
        ).toEqual(
          []
        );
      }
    );


    it(
      "preserves chronological input order",
      () => {
        const startedEvent =
          createProjectEvent({
            id:
              "11111111-1111-4111-8111-111111111111",

            eventType:
              "project_started",

            eventData: {
              focus:
                "class abstraction",
            },

            occurredAt:
              "2026-08-12T00:50:58.000Z",
          });

        const firstFocusEvent =
          createProjectEvent({
            id:
              "22222222-2222-4222-8222-222222222222",

            eventType:
              "focus_updated",

            eventData: {
              previousFocus:
                "class abstraction",

              nextFocus:
                "class relationships",
            },

            occurredAt:
              "2026-08-12T00:53:21.000Z",
          });

        const secondFocusEvent =
          createProjectEvent({
            id:
              "33333333-3333-4333-8333-333333333333",

            eventType:
              "focus_updated",

            eventData: {
              previousFocus:
                "class relationships",

              nextFocus:
                "second class abstraction",
            },

            occurredAt:
              "2026-08-12T01:01:46.000Z",
          });

        const result =
          createProjectLifecycleHistory(
            [
              startedEvent,
              firstFocusEvent,
              secondFocusEvent,
            ]
          );

        expect(
          result.map(
            (entry) =>
              entry.eventId
          )
        ).toEqual([
          startedEvent.id,
          firstFocusEvent.id,
          secondFocusEvent.id,
        ]);

        expect(
          result.map(
            (entry) =>
              entry.type
          )
        ).toEqual([
          "project-started",
          "focus-updated",
          "focus-updated",
        ]);
      }
    );


    it(
      "preserves the canonical Project identity for every history entry",
      () => {
        const events = [
          createProjectEvent({
            eventType:
              "project_started",
          }),

          createProjectEvent({
            id:
              "22222222-2222-4222-8222-222222222222",

            eventType:
              "focus_updated",

            eventData: {
              previousFocus:
                "class abstraction",

              nextFocus:
                "class relationships",
            },
          }),
        ];

        const result =
          createProjectLifecycleHistory(
            events
          );

        expect(
          result.every(
            (entry) =>
              entry.projectId ===
              PROJECT_ID
          )
        ).toBe(
          true
        );
      }
    );


    it(
      "preserves the source Project Event identity",
      () => {
        const event =
          createProjectEvent({
            id:
              "55555555-5555-4555-8555-555555555555",
          });

        const result =
          createProjectLifecycleHistory(
            [
              event,
            ]
          );

        expect(
          result[0]?.eventId
        ).toBe(
          event.id
        );
      }
    );


    it(
      "preserves the original occurredAt timestamp",
      () => {
        const occurredAt =
          "2026-08-12T03:47:02.477Z";

        const event =
          createProjectEvent({
            eventType:
              "focus_updated",

            eventData: {
              previousFocus:
                "post-restart class concept",

              nextFocus:
                "after-refresh class concept",
            },

            occurredAt,
          });

        const result =
          createProjectLifecycleHistory(
            [
              event,
            ]
          );

        expect(
          result[0]?.occurredAt
        ).toBe(
          occurredAt
        );
      }
    );


    it(
      "creates canonical lifecycle history from a mixed Project Event sequence",
      () => {
        const events: ProjectEventRecord[] = [
          createProjectEvent({
            id:
              "11111111-1111-4111-8111-111111111111",

            eventType:
              "project_created",

            eventData:
              {},

            occurredAt:
              "2026-08-12T00:49:00.000Z",
          }),

          createProjectEvent({
            id:
              "22222222-2222-4222-8222-222222222222",

            eventType:
              "project_started",

            eventData: {
              focus:
                "class abstraction",
            },

            occurredAt:
              "2026-08-12T00:50:58.000Z",
          }),

          createProjectEvent({
            id:
              "33333333-3333-4333-8333-333333333333",

            eventType:
              "focus_updated",

            eventData: {
              previousFocus:
                "class abstraction",

              nextFocus:
                "class relationships",
            },

            occurredAt:
              "2026-08-12T00:53:21.000Z",
          }),

          createProjectEvent({
            id:
              "44444444-4444-4444-8444-444444444444",

            eventType:
              "focus_updated",

            eventData: {
              previousFocus:
                "class relationships",

              nextFocus:
                "second class abstraction",
            },

            occurredAt:
              "2026-08-12T01:01:46.000Z",
          }),

          createProjectEvent({
            id:
              "55555555-5555-4555-8555-555555555555",

            eventType:
              "project_completed",

            eventData:
              {},

            occurredAt:
              "2026-08-12T08:00:00.000Z",
          }),
        ];

        const result =
          createProjectLifecycleHistory(
            events
          );

        expect(
          result
        ).toEqual([
          {
            type:
              "project-started",

            eventId:
              "22222222-2222-4222-8222-222222222222",

            projectId:
              PROJECT_ID,

            focus:
              "class abstraction",

            occurredAt:
              "2026-08-12T00:50:58.000Z",
          },

          {
            type:
              "focus-updated",

            eventId:
              "33333333-3333-4333-8333-333333333333",

            projectId:
              PROJECT_ID,

            previousFocus:
              "class abstraction",

            nextFocus:
              "class relationships",

            occurredAt:
              "2026-08-12T00:53:21.000Z",
          },

          {
            type:
              "focus-updated",

            eventId:
              "44444444-4444-4444-8444-444444444444",

            projectId:
              PROJECT_ID,

            previousFocus:
              "class relationships",

            nextFocus:
              "second class abstraction",

            occurredAt:
              "2026-08-12T01:01:46.000Z",
          },
        ]);
      }
    );
  }
);