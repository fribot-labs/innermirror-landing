import {
    afterEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import {
    createReflection,
} from "../reflectionPersistence";

import {
    supabaseClient,
} from "../supabaseClient";


const USER_ID =
  "11111111-1111-4111-8111-111111111111";

const PROJECT_ID =
  "22222222-2222-4222-8222-222222222222";

const REFLECTION_ID =
  "33333333-3333-4333-8333-333333333333";


function createReflectionRow(
  overrides:
    Record<string, unknown> = {}
) {
  return {
    id:
      REFLECTION_ID,

    user_id:
      USER_ID,

    project_id:
      PROJECT_ID,

    content:
      "Reflection project association test",

    source:
      "landing",

    created_at:
      "2026-08-11T01:00:00.000Z",

    updated_at:
      "2026-08-11T01:00:00.000Z",

    ...overrides,
  };
}


function mockAuthenticatedUser() {
  return vi.spyOn(
    supabaseClient.auth,
    "getUser"
  ).mockImplementation(
    async () => ({
      data: {
        user: {
          id:
            USER_ID,
        },
      },

      error:
        null,
    } as never)
  );
}


function createInsertQueryMock({
  data,
  error = null,
}: {
  data: unknown;
  error?: unknown;
}) {
  const single =
    vi.fn().mockResolvedValue({
      data,
      error,
    });

  const select =
    vi.fn().mockReturnValue({
      single,
    });

  const insert =
    vi.fn().mockReturnValue({
      select,
    });

  return {
    insert,
    select,
    single,
  };
}


describe(
  "reflectionPersistence",
  () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });


    it(
      "persists the canonical project association when projectId is provided",
      async () => {
        mockAuthenticatedUser();

        const insertQuery =
          createInsertQueryMock({
            data:
              createReflectionRow(),
          });

        const fromSpy =
          vi.spyOn(
            supabaseClient,
            "from"
          ).mockReturnValue({
            insert:
              insertQuery.insert,
          } as never);

        const result =
          await createReflection({
            projectId:
              PROJECT_ID,

            content:
              "Reflection project association test",

            source:
              "landing",
          });

        expect(
          fromSpy
        ).toHaveBeenCalledWith(
          "reflections"
        );

        expect(
          insertQuery.insert
        ).toHaveBeenCalledWith({
          user_id:
            USER_ID,

          project_id:
            PROJECT_ID,

          content:
            "Reflection project association test",

          source:
            "landing",
        });

        expect(
          result.projectId
        ).toBe(
          PROJECT_ID
        );
      }
    );


    it(
      "preserves the canonical projectId returned by the database",
      async () => {
        mockAuthenticatedUser();

        const insertQuery =
          createInsertQueryMock({
            data:
              createReflectionRow(),
          });

        vi.spyOn(
          supabaseClient,
          "from"
        ).mockReturnValue({
          insert:
            insertQuery.insert,
        } as never);

        const result =
          await createReflection({
            projectId:
              PROJECT_ID,

            content:
              "Reflection project association test",

            source:
              "landing",
          });

        expect(
          result
        ).toEqual({
          id:
            REFLECTION_ID,

          userId:
            USER_ID,

          projectId:
            PROJECT_ID,

          content:
            "Reflection project association test",

          source:
            "landing",

          createdAt:
            "2026-08-11T01:00:00.000Z",

          updatedAt:
            "2026-08-11T01:00:00.000Z",
        });
      }
    );


    it(
      "persists null project_id for an explicit standalone Reflection",
      async () => {
        mockAuthenticatedUser();

        const insertQuery =
          createInsertQueryMock({
            data:
              createReflectionRow({
                project_id:
                  null,
              }),
          });

        vi.spyOn(
          supabaseClient,
          "from"
        ).mockReturnValue({
          insert:
            insertQuery.insert,
        } as never);

        const result =
          await createReflection({
            projectId:
              null,

            content:
              "Standalone Reflection",

            source:
              "landing",
          });

        expect(
          insertQuery.insert
        ).toHaveBeenCalledWith({
          user_id:
            USER_ID,

          project_id:
            null,

          content:
            "Standalone Reflection",

          source:
            "landing",
        });

        expect(
          result.projectId
        ).toBeNull();
      }
    );


    it(
      "persists null project_id when projectId is omitted",
      async () => {
        mockAuthenticatedUser();

        const insertQuery =
          createInsertQueryMock({
            data:
              createReflectionRow({
                project_id:
                  null,
              }),
          });

        vi.spyOn(
          supabaseClient,
          "from"
        ).mockReturnValue({
          insert:
            insertQuery.insert,
        } as never);

        await createReflection({
          content:
            "Standalone Reflection without projectId",

          source:
            "landing",
        });

        expect(
          insertQuery.insert
        ).toHaveBeenCalledWith({
          user_id:
            USER_ID,

          project_id:
            null,

          content:
            "Standalone Reflection without projectId",

          source:
            "landing",
        });
      }
    );


    it(
      "normalizes an omitted source to null",
      async () => {
        mockAuthenticatedUser();

        const insertQuery =
          createInsertQueryMock({
            data:
              createReflectionRow({
                source:
                  null,
              }),
          });

        vi.spyOn(
          supabaseClient,
          "from"
        ).mockReturnValue({
          insert:
            insertQuery.insert,
        } as never);

        await createReflection({
          projectId:
            PROJECT_ID,

          content:
            "Reflection without source",
        });

        expect(
          insertQuery.insert
        ).toHaveBeenCalledWith({
          user_id:
            USER_ID,

          project_id:
            PROJECT_ID,

          content:
            "Reflection without source",

          source:
            null,
        });
      }
    );


    it(
      "rejects an unauthenticated user before writing a Reflection",
      async () => {
        vi.spyOn(
          supabaseClient.auth,
          "getUser"
        ).mockImplementation(
          async () => ({
            data: {
              user:
                null,
            },

            error:
              null,
          } as never)
        );

        const fromSpy =
          vi.spyOn(
            supabaseClient,
            "from"
          );

        await expect(
          createReflection({
            projectId:
              PROJECT_ID,

            content:
              "Unauthenticated Reflection",
          })
        ).rejects.toThrow(
          "An authenticated user is required to create a reflection."
        );

        expect(
          fromSpy
        ).not.toHaveBeenCalled();
      }
    );


    it(
      "propagates authentication errors",
      async () => {
        const authError =
          new Error(
            "Authentication failed."
          );

        vi.spyOn(
          supabaseClient.auth,
          "getUser"
        ).mockImplementation(
          async () => ({
            data: {
              user:
                null,
            },

            error:
              authError,
          } as never)
        );

        await expect(
          createReflection({
            projectId:
              PROJECT_ID,

            content:
              "Reflection",
          })
        ).rejects.toBe(
          authError
        );
      }
    );


    it(
      "propagates Reflection insert errors",
      async () => {
        mockAuthenticatedUser();

        const insertError = {
          code:
            "23503",

          message:
            "insert or update on table reflections violates foreign key constraint",

          details:
            null,

          hint:
            null,
        };

        const insertQuery =
          createInsertQueryMock({
            data:
              null,

            error:
              insertError,
          });

        vi.spyOn(
          supabaseClient,
          "from"
        ).mockReturnValue({
          insert:
            insertQuery.insert,
        } as never);

        await expect(
          createReflection({
            projectId:
              PROJECT_ID,

            content:
              "Invalid association",
          })
        ).rejects.toBe(
          insertError
        );
      }
    );
  }
);