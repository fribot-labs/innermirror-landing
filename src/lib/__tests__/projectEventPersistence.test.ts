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
      getUser:
        vi.fn(),

      from:
        vi.fn(),

      insert:
        vi.fn(),

      insertSelect:
        vi.fn(),

      single:
        vi.fn(),

      select:
        vi.fn(),

      eq:
        vi.fn(),

      order:
        vi.fn(),
    })
  );


vi.mock(
  "../supabaseClient",
  () => ({
    supabaseClient: {
      auth: {
        getUser:
          mocks.getUser,
      },

      from:
        mocks.from,
    },
  })
);


import {
  createProjectEvent,
  listProjectEvents,
  listProjectEventsByProject,
  type ProjectEventRecord,
} from "../projectEventPersistence";


const USER_ID =
  "945b3454-3d6c-4433-af37-40e3fa227776";

const PROJECT_ID =
  "375880f2-5a87-4f60-8144-e91ea469ef04";

const EVENT_ID =
  "6d654923-2d6f-4af6-89dc-38e889351254";


type TestProjectEventRow = {
  id:
    string;

  user_id:
    string;

  project_id:
    string;

  event_type:
    string;

  event_data:
    Record<string, unknown>;

  occurred_at:
    string;

  created_at:
    string;
};


const DATABASE_ROW:
  TestProjectEventRow = {
    id:
      EVENT_ID,

    user_id:
      USER_ID,

    project_id:
      PROJECT_ID,

    event_type:
      "focus_updated",

    event_data: {
      previousFocus:
        "class syntax",

      nextFocus:
        "class concept",
    },

    occurred_at:
      "2026-08-11T08:00:00.000Z",

    created_at:
      "2026-08-11T08:00:01.000Z",
  };


const EXPECTED_RECORD:
  ProjectEventRecord = {
    id:
      EVENT_ID,

    userId:
      USER_ID,

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

    occurredAt:
      "2026-08-11T08:00:00.000Z",

    createdAt:
      "2026-08-11T08:00:01.000Z",
  };


function mockAuthenticatedUser() {
  mocks.getUser.mockResolvedValue({
    data: {
      user: {
        id:
          USER_ID,
      },
    },

    error:
      null,
  });
}


function mockCreateSuccess(
  row:
    TestProjectEventRow =
      DATABASE_ROW
) {
  mocks.single.mockResolvedValue({
    data:
      row,

    error:
      null,
  });
}


function mockReadSuccess(
  rows:
    TestProjectEventRow[] = [
      DATABASE_ROW,
    ]
) {
  mocks.order.mockResolvedValue({
    data:
      rows,

    error:
      null,
  });
}


describe(
  "projectEventPersistence",
  () => {
    beforeEach(
      () => {
        vi.clearAllMocks();

        mocks.from.mockImplementation(
          () => ({
            insert:
              mocks.insert,

            select:
              mocks.select,
          })
        );

        mocks.insert.mockImplementation(
          () => ({
            select:
              mocks.insertSelect,
          })
        );

        mocks.insertSelect.mockImplementation(
          () => ({
            single:
              mocks.single,
          })
        );

        mocks.select.mockImplementation(
          () => ({
            eq:
              mocks.eq,
          })
        );

        mocks.eq.mockImplementation(
          () => ({
            eq:
              mocks.eq,

            order:
              mocks.order,
          })
        );
      }
    );


    it(
      "persists a canonical Project Event",
      async () => {
        mockAuthenticatedUser();
        mockCreateSuccess();

        const result =
          await createProjectEvent({
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

            occurredAt:
              "2026-08-11T08:00:00.000Z",
          });

        expect(
          mocks.from
        ).toHaveBeenCalledWith(
          "project_events"
        );

        expect(
          result
        ).toEqual(
          EXPECTED_RECORD
        );
      }
    );


    it(
      "uses the authenticated user as the Project Event owner",
      async () => {
        mockAuthenticatedUser();
        mockCreateSuccess();

        await createProjectEvent({
          projectId:
            PROJECT_ID,

          eventType:
            "project_started",
        });

        expect(
          mocks.insert
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            user_id:
              USER_ID,
          })
        );
      }
    );


    it(
      "persists the canonical project identity",
      async () => {
        mockAuthenticatedUser();
        mockCreateSuccess();

        await createProjectEvent({
          projectId:
            `  ${PROJECT_ID}  `,

          eventType:
            "project_started",
        });

        expect(
          mocks.insert
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            project_id:
              PROJECT_ID,
          })
        );
      }
    );


    it(
      "persists the Project Event type",
      async () => {
        mockAuthenticatedUser();
        mockCreateSuccess();

        await createProjectEvent({
          projectId:
            PROJECT_ID,

          eventType:
            "project_completed",
        });

        expect(
          mocks.insert
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            event_type:
              "project_completed",
          })
        );
      }
    );


    it(
      "persists Project Event metadata",
      async () => {
        mockAuthenticatedUser();
        mockCreateSuccess();

        const eventData = {
          previousFocus:
            "class syntax",

          nextFocus:
            "class concept",
        };

        await createProjectEvent({
          projectId:
            PROJECT_ID,

          eventType:
            "focus_updated",

          eventData,
        });

        expect(
          mocks.insert
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            event_data:
              eventData,
          })
        );
      }
    );


    it(
      "persists an explicit occurredAt value",
      async () => {
        mockAuthenticatedUser();
        mockCreateSuccess();

        await createProjectEvent({
          projectId:
            PROJECT_ID,

          eventType:
            "project_started",

          occurredAt:
            "2026-08-11T07:30:00.000Z",
        });

        expect(
          mocks.insert
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            occurred_at:
              "2026-08-11T07:30:00.000Z",
          })
        );
      }
    );


    it(
      "omits occurred_at when occurredAt is not provided",
      async () => {
        mockAuthenticatedUser();
        mockCreateSuccess();

        await createProjectEvent({
          projectId:
            PROJECT_ID,

          eventType:
            "project_started",
        });

        const payload =
          mocks.insert.mock.calls[0]?.[0];

        expect(
          payload
        ).not.toHaveProperty(
          "occurred_at"
        );
      }
    );


    it(
      "normalizes omitted eventData to an empty object",
      async () => {
        mockAuthenticatedUser();
        mockCreateSuccess();

        await createProjectEvent({
          projectId:
            PROJECT_ID,

          eventType:
            "project_started",
        });

        expect(
          mocks.insert
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            event_data:
              {},
          })
        );
      }
    );


    it(
      "normalizes the inserted database row into a Project Event record",
      async () => {
        mockAuthenticatedUser();
        mockCreateSuccess();

        const result =
          await createProjectEvent({
            projectId:
              PROJECT_ID,

            eventType:
              "focus_updated",
          });

        expect(
          result
        ).toEqual({
          id:
            EVENT_ID,

          userId:
            USER_ID,

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

          occurredAt:
            "2026-08-11T08:00:00.000Z",

          createdAt:
            "2026-08-11T08:00:01.000Z",
        });
      }
    );


    it(
      "requests the inserted Project Event row",
      async () => {
        mockAuthenticatedUser();
        mockCreateSuccess();

        await createProjectEvent({
          projectId:
            PROJECT_ID,

          eventType:
            "project_started",
        });

        expect(
          mocks.insertSelect
        ).toHaveBeenCalledWith(
          expect.stringContaining(
            "project_id"
          )
        );

        expect(
          mocks.single
        ).toHaveBeenCalledTimes(
          1
        );
      }
    );


    it(
      "rejects an empty canonical project identity before creating a Project Event",
      async () => {
        await expect(
          createProjectEvent({
            projectId:
              "   ",

            eventType:
              "project_started",
          })
        ).rejects.toThrow(
          "A canonical project identity is required to create a Project Event."
        );

        expect(
          mocks.getUser
        ).not.toHaveBeenCalled();

        expect(
          mocks.from
        ).not.toHaveBeenCalled();
      }
    );


    it(
      "rejects an unauthenticated user before writing a Project Event",
      async () => {
        mocks.getUser.mockResolvedValue({
          data: {
            user:
              null,
          },

          error:
            null,
        });

        await expect(
          createProjectEvent({
            projectId:
              PROJECT_ID,

            eventType:
              "project_started",
          })
        ).rejects.toThrow(
          "An authenticated user is required to create a Project Event."
        );

        expect(
          mocks.from
        ).not.toHaveBeenCalled();
      }
    );


    it(
      "propagates authentication errors while creating a Project Event",
      async () => {
        const authError =
          new Error(
            "Authentication failed."
          );

        mocks.getUser.mockResolvedValue({
          data: {
            user:
              null,
          },

          error:
            authError,
        });

        await expect(
          createProjectEvent({
            projectId:
              PROJECT_ID,

            eventType:
              "project_started",
          })
        ).rejects.toBe(
          authError
        );
      }
    );


    it(
      "propagates Project Event insert errors",
      async () => {
        mockAuthenticatedUser();

        const insertError =
          new Error(
            "Project Event insert failed."
          );

        mocks.single.mockResolvedValue({
          data:
            null,

          error:
            insertError,
        });

        await expect(
          createProjectEvent({
            projectId:
              PROJECT_ID,

            eventType:
              "project_started",
          })
        ).rejects.toBe(
          insertError
        );
      }
    );


    it(
      "loads lifecycle events scoped to the authenticated user and canonical Project",
      async () => {
        mockAuthenticatedUser();
        mockReadSuccess();

        const result =
          await listProjectEvents(
            PROJECT_ID
          );

        expect(
          mocks.from
        ).toHaveBeenCalledWith(
          "project_events"
        );

        expect(
          mocks.eq
        ).toHaveBeenNthCalledWith(
          1,
          "user_id",
          USER_ID
        );

        expect(
          mocks.eq
        ).toHaveBeenNthCalledWith(
          2,
          "project_id",
          PROJECT_ID
        );

        expect(
          result
        ).toEqual([
          EXPECTED_RECORD,
        ]);
      }
    );


    it(
      "normalizes the canonical Project identity before loading lifecycle events",
      async () => {
        mockAuthenticatedUser();
        mockReadSuccess();

        await listProjectEvents(
          `  ${PROJECT_ID}  `
        );

        expect(
          mocks.eq
        ).toHaveBeenCalledWith(
          "project_id",
          PROJECT_ID
        );
      }
    );


    it(
      "loads lifecycle events in ascending occurrence order",
      async () => {
        mockAuthenticatedUser();
        mockReadSuccess();

        await listProjectEvents(
          PROJECT_ID
        );

        expect(
          mocks.order
        ).toHaveBeenCalledWith(
          "occurred_at",
          {
            ascending:
              true,
          }
        );
      }
    );


    it(
      "normalizes lifecycle event rows returned from the database",
      async () => {
        mockAuthenticatedUser();

        mockReadSuccess([
          DATABASE_ROW,
          {
            id:
              "b2690246-91eb-4ddd-8711-55e85e308157",

            user_id:
              USER_ID,

            project_id:
              PROJECT_ID,

            event_type:
              "project_completed",

            event_data:
              {},

            occurred_at:
              "2026-08-12T08:00:00.000Z",

            created_at:
              "2026-08-12T08:00:01.000Z",
          },
        ]);

        const result =
          await listProjectEvents(
            PROJECT_ID
          );

        expect(
          result
        ).toEqual([
          EXPECTED_RECORD,
          {
            id:
              "b2690246-91eb-4ddd-8711-55e85e308157",

            userId:
              USER_ID,

            projectId:
              PROJECT_ID,

            eventType:
              "project_completed",

            eventData:
              {},

            occurredAt:
              "2026-08-12T08:00:00.000Z",

            createdAt:
              "2026-08-12T08:00:01.000Z",
          },
        ]);
      }
    );


    it(
      "returns an empty lifecycle history when no Project Events exist",
      async () => {
        mockAuthenticatedUser();

        mockReadSuccess(
          []
        );

        const result =
          await listProjectEvents(
            PROJECT_ID
          );

        expect(
          result
        ).toEqual(
          []
        );
      }
    );


    it(
      "rejects an empty canonical Project identity before loading lifecycle events",
      async () => {
        await expect(
          listProjectEvents(
            "   "
          )
        ).rejects.toThrow(
          "A canonical project identity is required to load project lifecycle events."
        );

        expect(
          mocks.getUser
        ).not.toHaveBeenCalled();

        expect(
          mocks.from
        ).not.toHaveBeenCalled();
      }
    );


    it(
      "rejects an unauthenticated user before loading lifecycle events",
      async () => {
        mocks.getUser.mockResolvedValue({
          data: {
            user:
              null,
          },

          error:
            null,
        });

        await expect(
          listProjectEvents(
            PROJECT_ID
          )
        ).rejects.toThrow(
          "An authenticated user is required to load Project lifecycle events."
        );

        expect(
          mocks.from
        ).not.toHaveBeenCalled();
      }
    );


    it(
      "propagates authentication errors while loading lifecycle events",
      async () => {
        const authError =
          new Error(
            "Authentication failed."
          );

        mocks.getUser.mockResolvedValue({
          data: {
            user:
              null,
          },

          error:
            authError,
        });

        await expect(
          listProjectEvents(
            PROJECT_ID
          )
        ).rejects.toBe(
          authError
        );
      }
    );


    it(
      "propagates lifecycle event query errors",
      async () => {
        mockAuthenticatedUser();

        const queryError =
          new Error(
            "Project lifecycle query failed."
          );

        mocks.order.mockResolvedValue({
          data:
            null,

          error:
            queryError,
        });

        await expect(
          listProjectEvents(
            PROJECT_ID
          )
        ).rejects.toBe(
          queryError
        );
      }
    );


    it(
      "reads Project Events scoped to the canonical project identity",
      async () => {
        mockAuthenticatedUser();
        mockReadSuccess();

        const result =
          await listProjectEventsByProject(
            PROJECT_ID
          );

        expect(
          mocks.from
        ).toHaveBeenCalledWith(
          "project_events"
        );

        expect(
          mocks.eq
        ).toHaveBeenCalledWith(
          "project_id",
          PROJECT_ID
        );

        expect(
          result
        ).toEqual([
          EXPECTED_RECORD,
        ]);
      }
    );


    it(
      "trims the canonical project identity before querying Project Events",
      async () => {
        mockAuthenticatedUser();
        mockReadSuccess();

        await listProjectEventsByProject(
          `  ${PROJECT_ID}  `
        );

        expect(
          mocks.eq
        ).toHaveBeenCalledWith(
          "project_id",
          PROJECT_ID
        );
      }
    );


    it(
      "requests Project Events in ascending occurrence order",
      async () => {
        mockAuthenticatedUser();
        mockReadSuccess();

        await listProjectEventsByProject(
          PROJECT_ID
        );

        expect(
          mocks.order
        ).toHaveBeenCalledWith(
          "occurred_at",
          {
            ascending:
              true,
          }
        );
      }
    );


    it(
      "normalizes Project Event rows returned from the database",
      async () => {
        mockAuthenticatedUser();

        mockReadSuccess([
          DATABASE_ROW,
          {
            id:
              "b2690246-91eb-4ddd-8711-55e85e308157",

            user_id:
              USER_ID,

            project_id:
              PROJECT_ID,

            event_type:
              "project_completed",

            event_data:
              {},

            occurred_at:
              "2026-08-12T08:00:00.000Z",

            created_at:
              "2026-08-12T08:00:01.000Z",
          },
        ]);

        const result =
          await listProjectEventsByProject(
            PROJECT_ID
          );

        expect(
          result
        ).toEqual([
          EXPECTED_RECORD,
          {
            id:
              "b2690246-91eb-4ddd-8711-55e85e308157",

            userId:
              USER_ID,

            projectId:
              PROJECT_ID,

            eventType:
              "project_completed",

            eventData:
              {},

            occurredAt:
              "2026-08-12T08:00:00.000Z",

            createdAt:
              "2026-08-12T08:00:01.000Z",
          },
        ]);
      }
    );


    it(
      "rejects an empty canonical project identity before reading Project Events",
      async () => {
        await expect(
          listProjectEventsByProject(
            "   "
          )
        ).rejects.toThrow(
          "A canonical project identity is required to read Project Events."
        );

        expect(
          mocks.getUser
        ).not.toHaveBeenCalled();

        expect(
          mocks.from
        ).not.toHaveBeenCalled();
      }
    );


    it(
      "rejects an unauthenticated user before reading Project Events",
      async () => {
        mocks.getUser.mockResolvedValue({
          data: {
            user:
              null,
          },

          error:
            null,
        });

        await expect(
          listProjectEventsByProject(
            PROJECT_ID
          )
        ).rejects.toThrow(
          "An authenticated user is required to read Project Events."
        );

        expect(
          mocks.from
        ).not.toHaveBeenCalled();
      }
    );


    it(
      "propagates authentication errors while reading Project Events",
      async () => {
        const authError =
          new Error(
            "Authentication failed."
          );

        mocks.getUser.mockResolvedValue({
          data: {
            user:
              null,
          },

          error:
            authError,
        });

        await expect(
          listProjectEventsByProject(
            PROJECT_ID
          )
        ).rejects.toBe(
          authError
        );
      }
    );


    it(
      "propagates Project Event query errors",
      async () => {
        mockAuthenticatedUser();

        const queryError =
          new Error(
            "Project Event query failed."
          );

        mocks.order.mockResolvedValue({
          data:
            null,

          error:
            queryError,
        });

        await expect(
          listProjectEventsByProject(
            PROJECT_ID
          )
        ).rejects.toBe(
          queryError
        );
      }
    );
  }
);