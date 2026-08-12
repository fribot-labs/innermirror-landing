import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";


const mocks =
  vi.hoisted(
    () => ({
      createProjectEvent:
        vi.fn(),
    })
  );


vi.mock(
  "../../lib/projectEventPersistence",
  () => ({
    createProjectEvent:
      mocks.createProjectEvent,
  })
);


import {
    recordProjectFocusUpdatedEvent,
    recordProjectStartedEvent,
} from "../projectLifecycleEvents";


const PROJECT_ID =
  "375880f2-5a87-4f60-8144-e91ea469ef04";


describe(
  "projectLifecycleEvents",
  () => {
    beforeEach(
      () => {
        vi.clearAllMocks();

        mocks.createProjectEvent
          .mockResolvedValue(
            undefined
          );
      }
    );


    describe(
      "recordProjectStartedEvent",
      () => {
        it(
          "records project_started when a Project starts for the first time",
          async () => {
            await recordProjectStartedEvent({
              projectId:
                PROJECT_ID,

              wasAlreadyStarted:
                false,
            });

            expect(
              mocks.createProjectEvent
            ).toHaveBeenCalledTimes(
              1
            );

            expect(
              mocks.createProjectEvent
            ).toHaveBeenCalledWith({
              projectId:
                PROJECT_ID,

              eventType:
                "project_started",

              eventData:
                {},
            });
          }
        );


        it(
          "does not record project_started when the Project was already started",
          async () => {
            await recordProjectStartedEvent({
              projectId:
                PROJECT_ID,

              wasAlreadyStarted:
                true,
            });

            expect(
              mocks.createProjectEvent
            ).not.toHaveBeenCalled();
          }
        );


        it(
          "trims the canonical project identity before recording project_started",
          async () => {
            await recordProjectStartedEvent({
              projectId:
                `  ${PROJECT_ID}  `,

              wasAlreadyStarted:
                false,
            });

            expect(
              mocks.createProjectEvent
            ).toHaveBeenCalledWith({
              projectId:
                PROJECT_ID,

              eventType:
                "project_started",

              eventData:
                {},
            });
          }
        );


        it(
          "includes the normalized Project focus when one exists",
          async () => {
            await recordProjectStartedEvent({
              projectId:
                PROJECT_ID,

              wasAlreadyStarted:
                false,

              focus:
                "  class concept  ",
            });

            expect(
              mocks.createProjectEvent
            ).toHaveBeenCalledWith({
              projectId:
                PROJECT_ID,

              eventType:
                "project_started",

              eventData: {
                focus:
                  "class concept",
              },
            });
          }
        );


        it(
          "uses empty event data when the Project focus is null",
          async () => {
            await recordProjectStartedEvent({
              projectId:
                PROJECT_ID,

              wasAlreadyStarted:
                false,

              focus:
                null,
            });

            expect(
              mocks.createProjectEvent
            ).toHaveBeenCalledWith({
              projectId:
                PROJECT_ID,

              eventType:
                "project_started",

              eventData:
                {},
            });
          }
        );


        it(
          "uses empty event data when the Project focus contains only whitespace",
          async () => {
            await recordProjectStartedEvent({
              projectId:
                PROJECT_ID,

              wasAlreadyStarted:
                false,

              focus:
                "   ",
            });

            expect(
              mocks.createProjectEvent
            ).toHaveBeenCalledWith({
              projectId:
                PROJECT_ID,

              eventType:
                "project_started",

              eventData:
                {},
            });
          }
        );


        it(
          "rejects an empty canonical project identity before recording project_started",
          async () => {
            await expect(
              recordProjectStartedEvent({
                projectId:
                  "   ",

                wasAlreadyStarted:
                  false,
              })
            ).rejects.toThrow(
              "A canonical project identity is required to record a Project start event."
            );

            expect(
              mocks.createProjectEvent
            ).not.toHaveBeenCalled();
          }
        );


        it(
          "does not validate or persist an already-started Project again",
          async () => {
            await expect(
              recordProjectStartedEvent({
                projectId:
                  "   ",

                wasAlreadyStarted:
                  true,
              })
            ).resolves.toBeUndefined();

            expect(
              mocks.createProjectEvent
            ).not.toHaveBeenCalled();
          }
        );


        it(
          "propagates project_started persistence errors",
          async () => {
            const persistenceError =
              new Error(
                "Unable to persist project_started."
              );

            mocks.createProjectEvent
              .mockRejectedValue(
                persistenceError
              );

            await expect(
              recordProjectStartedEvent({
                projectId:
                  PROJECT_ID,

                wasAlreadyStarted:
                  false,
              })
            ).rejects.toBe(
              persistenceError
            );
          }
        );
      }
    );


    describe(
      "recordProjectFocusUpdatedEvent",
      () => {
        it(
          "records focus_updated when the Project focus changes",
          async () => {
            await recordProjectFocusUpdatedEvent({
              projectId:
                PROJECT_ID,

              previousFocus:
                "class syntax",

              nextFocus:
                "class concept",
            });

            expect(
              mocks.createProjectEvent
            ).toHaveBeenCalledTimes(
              1
            );

            expect(
              mocks.createProjectEvent
            ).toHaveBeenCalledWith({
              projectId:
                PROJECT_ID,

              eventType:
                "focus_updated",

              eventData: {
                previousFocus:
                  "class syntax",

                nextFocus:
                  "class concept",
              },
            });
          }
        );


        it(
          "trims the canonical project identity before recording focus_updated",
          async () => {
            await recordProjectFocusUpdatedEvent({
              projectId:
                `  ${PROJECT_ID}  `,

              previousFocus:
                "class syntax",

              nextFocus:
                "class concept",
            });

            expect(
              mocks.createProjectEvent
            ).toHaveBeenCalledWith(
              expect.objectContaining({
                projectId:
                  PROJECT_ID,
              })
            );
          }
        );


        it(
          "normalizes previousFocus and nextFocus before recording the transition",
          async () => {
            await recordProjectFocusUpdatedEvent({
              projectId:
                PROJECT_ID,

              previousFocus:
                "  class syntax  ",

              nextFocus:
                "  class concept  ",
            });

            expect(
              mocks.createProjectEvent
            ).toHaveBeenCalledWith({
              projectId:
                PROJECT_ID,

              eventType:
                "focus_updated",

              eventData: {
                previousFocus:
                  "class syntax",

                nextFocus:
                  "class concept",
              },
            });
          }
        );


        it(
          "does not record focus_updated when the normalized focus is unchanged",
          async () => {
            await recordProjectFocusUpdatedEvent({
              projectId:
                PROJECT_ID,

              previousFocus:
                "class concept",

              nextFocus:
                "class concept",
            });

            expect(
              mocks.createProjectEvent
            ).not.toHaveBeenCalled();
          }
        );


        it(
          "does not record focus_updated when values differ only by whitespace",
          async () => {
            await recordProjectFocusUpdatedEvent({
              projectId:
                PROJECT_ID,

              previousFocus:
                "class concept",

              nextFocus:
                "   class concept   ",
            });

            expect(
              mocks.createProjectEvent
            ).not.toHaveBeenCalled();
          }
        );


        it(
          "records focus_updated when previousFocus is null and nextFocus is provided",
          async () => {
            await recordProjectFocusUpdatedEvent({
              projectId:
                PROJECT_ID,

              previousFocus:
                null,

              nextFocus:
                "class concept",
            });

            expect(
              mocks.createProjectEvent
            ).toHaveBeenCalledWith({
              projectId:
                PROJECT_ID,

              eventType:
                "focus_updated",

              eventData: {
                previousFocus:
                  null,

                nextFocus:
                  "class concept",
              },
            });
          }
        );


        it(
          "normalizes an empty previousFocus to null",
          async () => {
            await recordProjectFocusUpdatedEvent({
              projectId:
                PROJECT_ID,

              previousFocus:
                "   ",

              nextFocus:
                "class concept",
            });

            expect(
              mocks.createProjectEvent
            ).toHaveBeenCalledWith({
              projectId:
                PROJECT_ID,

              eventType:
                "focus_updated",

              eventData: {
                previousFocus:
                  null,

                nextFocus:
                  "class concept",
              },
            });
          }
        );


        it(
          "rejects an empty canonical project identity before recording focus_updated",
          async () => {
            await expect(
              recordProjectFocusUpdatedEvent({
                projectId:
                  "   ",

                previousFocus:
                  "class syntax",

                nextFocus:
                  "class concept",
              })
            ).rejects.toThrow(
              "A canonical project identity is required to record a Project focus update event."
            );

            expect(
              mocks.createProjectEvent
            ).not.toHaveBeenCalled();
          }
        );


        it(
          "rejects an empty next focus",
          async () => {
            await expect(
              recordProjectFocusUpdatedEvent({
                projectId:
                  PROJECT_ID,

                previousFocus:
                  "class syntax",

                nextFocus:
                  "   ",
              })
            ).rejects.toThrow(
              "A Project focus update requires a non-empty next focus."
            );

            expect(
              mocks.createProjectEvent
            ).not.toHaveBeenCalled();
          }
        );


        it(
          "propagates focus_updated persistence errors",
          async () => {
            const persistenceError =
              new Error(
                "Unable to persist focus_updated."
              );

            mocks.createProjectEvent
              .mockRejectedValue(
                persistenceError
              );

            await expect(
              recordProjectFocusUpdatedEvent({
                projectId:
                  PROJECT_ID,

                previousFocus:
                  "class syntax",

                nextFocus:
                  "class concept",
              })
            ).rejects.toBe(
              persistenceError
            );
          }
        );
      }
    );
  }
);