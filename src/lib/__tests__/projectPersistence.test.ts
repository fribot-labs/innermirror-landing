import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  ensureProjectForRepository,
  findProjectByRepositoryId,
  markProjectStarted,
  updateProjectCurrentFocus,
} from "../projectPersistence";

import {
  supabaseClient,
} from "../supabaseClient";

import type {
  GitHubRepositorySummary,
} from "../../types/githubLearningEntry";


const USER_ID =
  "11111111-1111-4111-8111-111111111111";

const PROJECT_ID =
  "22222222-2222-4222-8222-222222222222";


function createRepository(
  overrides:
    Partial<GitHubRepositorySummary> = {}
): GitHubRepositorySummary {
  return {
    repositoryId:
      "123456789",

    owner:
      "fribot-labs",

    name:
      "innermirror-landing",

    fullName:
      "fribot-labs/innermirror-landing",

    defaultBranch:
      "main",

    private:
      false,

    htmlUrl:
      "https://github.com/fribot-labs/innermirror-landing",

    updatedAt:
      "2026-08-10T00:00:00.000Z",

    ...overrides,
  };
}


function createProjectRow(
  overrides:
    Record<string, unknown> = {}
) {
  return {
    id:
      PROJECT_ID,

    user_id:
      USER_ID,

    name:
      "innermirror-landing",

    repository_id:
      "123456789",

    repository_owner:
      "fribot-labs",

    repository_name:
      "innermirror-landing",

    template_id:
      null,

    course_id:
      null,

    current_focus:
      null,

    status:
      "active",

    started_at:
      "2026-08-10T01:00:00.000Z",

    created_at:
      "2026-08-10T01:00:00.000Z",

    updated_at:
      "2026-08-10T01:00:00.000Z",

    ...overrides,
  };
}


function mockAuthenticatedUser() {
  return vi.spyOn(
    supabaseClient.auth,
    "getUser"
  ).mockResolvedValue({
    data: {
      user: {
        id:
          USER_ID,
      },
    },

    error:
      null,
  } as Awaited<
    ReturnType<
      typeof supabaseClient.auth.getUser
    >
  >);
}


function createLookupQueryMock({
  data,
  error = null,
}: {
  data: unknown;
  error?: unknown;
}) {
  const maybeSingle =
    vi.fn().mockResolvedValue({
      data,
      error,
    });

  const secondEq =
    vi.fn().mockReturnValue({
      maybeSingle,
    });

  const firstEq =
    vi.fn().mockReturnValue({
      eq:
        secondEq,
    });

  const select =
    vi.fn().mockReturnValue({
      eq:
        firstEq,
    });

  return {
    select,
    firstEq,
    secondEq,
    maybeSingle,
  };
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


function createStartProjectUpdateQueryMock({
  data,
  error = null,
}: {
  data: unknown;
  error?: unknown;
}) {
  const maybeSingle =
    vi.fn().mockResolvedValue({
      data,
      error,
    });

  const select =
    vi.fn().mockReturnValue({
      maybeSingle,
    });

  const is =
    vi.fn().mockReturnValue({
      select,
    });

  const secondEq =
    vi.fn().mockReturnValue({
      is,
    });

  const firstEq =
    vi.fn().mockReturnValue({
      eq:
        secondEq,
    });

  const update =
    vi.fn().mockReturnValue({
      eq:
        firstEq,
    });

  return {
    update,
    firstEq,
    secondEq,
    is,
    select,
    maybeSingle,
  };
}

function createProjectFocusUpdateQueryMock({
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

  const secondEq =
    vi.fn().mockReturnValue({
      select,
    });

  const firstEq =
    vi.fn().mockReturnValue({
      eq:
        secondEq,
    });

  const update =
    vi.fn().mockReturnValue({
      eq:
        firstEq,
    });

  return {
    update,
    firstEq,
    secondEq,
    select,
    single,
  };
}


describe(
  "projectPersistence",
  () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });


    it(
      "finds the authenticated user's project by stable repositoryId",
      async () => {
        mockAuthenticatedUser();

        const lookup =
          createLookupQueryMock({
            data:
              createProjectRow(),
          });

        const fromSpy =
          vi.spyOn(
            supabaseClient,
            "from"
          ).mockReturnValue({
            select:
              lookup.select,
          } as never);

        const result =
          await findProjectByRepositoryId(
            "  123456789  "
          );

        expect(
          result
        ).toEqual({
          id:
            PROJECT_ID,

          userId:
            USER_ID,

          name:
            "innermirror-landing",

          repositoryId:
            "123456789",

          repositoryOwner:
            "fribot-labs",

          repositoryName:
            "innermirror-landing",

          templateId:
            null,

          courseId:
            null,

          currentFocus:
            null,

          status:
            "active",

          startedAt:
            "2026-08-10T01:00:00.000Z",

          createdAt:
            "2026-08-10T01:00:00.000Z",

          updatedAt:
            "2026-08-10T01:00:00.000Z",
        });

        expect(
          fromSpy
        ).toHaveBeenCalledWith(
          "projects"
        );

        expect(
          lookup.firstEq
        ).toHaveBeenCalledWith(
          "user_id",
          USER_ID
        );

        expect(
          lookup.secondEq
        ).toHaveBeenCalledWith(
          "repository_id",
          "123456789"
        );
      }
    );


    it(
      "returns null when no project exists for the repository",
      async () => {
        mockAuthenticatedUser();

        const lookup =
          createLookupQueryMock({
            data:
              null,
          });

        vi.spyOn(
          supabaseClient,
          "from"
        ).mockReturnValue({
          select:
            lookup.select,
        } as never);

        await expect(
          findProjectByRepositoryId(
            "123456789"
          )
        ).resolves.toBeNull();
      }
    );


    it(
      "reuses the existing canonical project without inserting another row",
      async () => {
        mockAuthenticatedUser();

        const lookup =
          createLookupQueryMock({
            data:
              createProjectRow(),
          });

        const fromSpy =
          vi.spyOn(
            supabaseClient,
            "from"
          ).mockReturnValue({
            select:
              lookup.select,
          } as never);

        const result =
          await ensureProjectForRepository(
            createRepository()
          );

        expect(
          result.id
        ).toBe(
          PROJECT_ID
        );

        expect(
          result.repositoryId
        ).toBe(
          "123456789"
        );

        expect(
          fromSpy
        ).toHaveBeenCalledTimes(
          1
        );
      }
    );


    it(
      "creates a canonical project when the repository has no existing project",
      async () => {
        mockAuthenticatedUser();

        const lookup =
          createLookupQueryMock({
            data:
              null,
          });

        const insertedRow =
          createProjectRow({
            id:
              "33333333-3333-4333-8333-333333333333",

            started_at:
              null,
          });

        const insertQuery =
          createInsertQueryMock({
            data:
              insertedRow,
          });

        const fromSpy =
          vi.spyOn(
            supabaseClient,
            "from"
          )
            .mockReturnValueOnce({
              select:
                lookup.select,
            } as never)
            .mockReturnValueOnce({
              insert:
                insertQuery.insert,
            } as never);

        const result =
          await ensureProjectForRepository(
            createRepository()
          );

        expect(
          result.id
        ).toBe(
          "33333333-3333-4333-8333-333333333333"
        );

        expect(
          result.repositoryId
        ).toBe(
          "123456789"
        );

        expect(
          result.startedAt
        ).toBeNull();

        expect(
          fromSpy
        ).toHaveBeenCalledTimes(
          2
        );

        expect(
          insertQuery.insert
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            user_id:
              USER_ID,

            name:
              "innermirror-landing",

            repository_id:
              "123456789",

            repository_owner:
              "fribot-labs",

            repository_name:
              "innermirror-landing",

            status:
              "active",
          })
        );

        expect(
          insertQuery.insert
        ).toHaveBeenCalledWith(
          expect.not.objectContaining({
            started_at:
              expect.anything(),
          })
        );
      }
    );


    it(
      "recovers the canonical project when a concurrent insert causes a unique violation",
      async () => {
        mockAuthenticatedUser();

        const firstLookup =
          createLookupQueryMock({
            data:
              null,
          });

        const uniqueViolation = {
          code:
            "23505",

          message:
            "duplicate key value violates unique constraint",

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
              uniqueViolation,
          });

        const concurrentProjectRow =
          createProjectRow({
            id:
              "44444444-4444-4444-8444-444444444444",
          });

        const recoveryLookup =
          createLookupQueryMock({
            data:
              concurrentProjectRow,
          });

        const fromSpy =
          vi.spyOn(
            supabaseClient,
            "from"
          )
            .mockReturnValueOnce({
              select:
                firstLookup.select,
            } as never)

            .mockReturnValueOnce({
              insert:
                insertQuery.insert,
            } as never)

            .mockReturnValueOnce({
              select:
                recoveryLookup.select,
            } as never);

        const result =
          await ensureProjectForRepository(
            createRepository()
          );

        expect(
          result.id
        ).toBe(
          "44444444-4444-4444-8444-444444444444"
        );

        expect(
          result.repositoryId
        ).toBe(
          "123456789"
        );

        expect(
          fromSpy
        ).toHaveBeenCalledTimes(
          3
        );
      }
    );


    it(
      "rethrows a unique violation when the canonical project cannot be recovered",
      async () => {
        mockAuthenticatedUser();

        const firstLookup =
          createLookupQueryMock({
            data:
              null,
          });

        const uniqueViolation = {
          code:
            "23505",

          message:
            "duplicate key value violates unique constraint",

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
              uniqueViolation,
          });

        const recoveryLookup =
          createLookupQueryMock({
            data:
              null,
          });

        vi.spyOn(
          supabaseClient,
          "from"
        )
          .mockReturnValueOnce({
            select:
              firstLookup.select,
          } as never)

          .mockReturnValueOnce({
            insert:
              insertQuery.insert,
          } as never)

          .mockReturnValueOnce({
            select:
              recoveryLookup.select,
          } as never);

        await expect(
          ensureProjectForRepository(
            createRepository()
          )
        ).rejects.toBe(
          uniqueViolation
        );
      }
    );


    it(
      "normalizes repository metadata before creating a project",
      async () => {
        mockAuthenticatedUser();

        const lookup =
          createLookupQueryMock({
            data:
              null,
          });

        const insertQuery =
          createInsertQueryMock({
            data:
              createProjectRow({
                repository_id:
                  "987654321",

                repository_owner:
                  "fribot-labs",

                repository_name:
                  "robot-project",

                name:
                  "robot-project",
              }),
          });

        vi.spyOn(
          supabaseClient,
          "from"
        )
          .mockReturnValueOnce({
            select:
              lookup.select,
          } as never)
          .mockReturnValueOnce({
            insert:
              insertQuery.insert,
          } as never);

        await ensureProjectForRepository(
          createRepository({
            repositoryId:
              "  987654321  ",

            owner:
              "  fribot-labs  ",

            name:
              "  robot-project  ",
          })
        );

        expect(
          insertQuery.insert
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            repository_id:
              "987654321",

            repository_owner:
              "fribot-labs",

            repository_name:
              "robot-project",

            name:
              "robot-project",
          })
        );
      }
    );


    it(
      "rejects an empty repositoryId before accessing Supabase",
      async () => {
        const getUserSpy =
          vi.spyOn(
            supabaseClient.auth,
            "getUser"
          );

        const fromSpy =
          vi.spyOn(
            supabaseClient,
            "from"
          );

        await expect(
          ensureProjectForRepository(
            createRepository({
              repositoryId:
                "   ",
            })
          )
        ).rejects.toThrow(
          "A stable GitHub repository identity is required to persist an InnerMirror project."
        );

        expect(
          getUserSpy
        ).not.toHaveBeenCalled();

        expect(
          fromSpy
        ).not.toHaveBeenCalled();
      }
    );


    it(
      "rejects a non-numeric repositoryId before accessing Supabase",
      async () => {
        const getUserSpy =
          vi.spyOn(
            supabaseClient.auth,
            "getUser"
          );

        const fromSpy =
          vi.spyOn(
            supabaseClient,
            "from"
          );

        await expect(
          ensureProjectForRepository(
            createRepository({
              repositoryId:
                "repository-123",
            })
          )
        ).rejects.toThrow(
          "GitHub repository identity must be a positive numeric identifier."
        );

        expect(
          getUserSpy
        ).not.toHaveBeenCalled();

        expect(
          fromSpy
        ).not.toHaveBeenCalled();
      }
    );


    it(
      "rejects an unauthenticated user",
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
          ensureProjectForRepository(
            createRepository()
          )
        ).rejects.toThrow(
          "An authenticated user is required to persist projects."
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
        ).mockResolvedValue({
          data: {
            user:
              null,
          },

          error:
            authError,
        } as Awaited<
          ReturnType<
            typeof supabaseClient.auth.getUser
          >
        >);

        await expect(
          findProjectByRepositoryId(
            "123456789"
          )
        ).rejects.toBe(
          authError
        );
      }
    );


    it(
      "propagates project lookup errors",
      async () => {
        mockAuthenticatedUser();

        const lookupError =
          new Error(
            "Project lookup failed."
          );

        const lookup =
          createLookupQueryMock({
            data:
              null,

            error:
              lookupError,
          });

        vi.spyOn(
          supabaseClient,
          "from"
        ).mockReturnValue({
          select:
            lookup.select,
        } as never);

        await expect(
          findProjectByRepositoryId(
            "123456789"
          )
        ).rejects.toBe(
          lookupError
        );
      }
    );

    it(
      "marks an unstarted canonical project as started",
      async () => {
        mockAuthenticatedUser();

        const startedRow =
          createProjectRow({
            started_at:
              "2026-08-11T13:00:00.000Z",

            updated_at:
              "2026-08-11T13:00:00.000Z",
          });

        const updateQuery =
          createStartProjectUpdateQueryMock({
            data:
              startedRow,
          });

        const fromSpy =
          vi.spyOn(
            supabaseClient,
            "from"
          ).mockReturnValue({
            update:
              updateQuery.update,
          } as never);

        const result =
          await markProjectStarted(
            PROJECT_ID
          );

        expect(
          result.didStart
        ).toBe(
          true
        );

        expect(
          result.project.id
        ).toBe(
          PROJECT_ID
        );

        expect(
          result.project.startedAt
        ).toBe(
          "2026-08-11T13:00:00.000Z"
        );

        expect(
          fromSpy
        ).toHaveBeenCalledWith(
          "projects"
        );
      }
    );

    it(
      "normalizes the canonical project identity before starting the project",
      async () => {
        mockAuthenticatedUser();

        const updateQuery =
          createStartProjectUpdateQueryMock({
            data:
              createProjectRow(),
          });

        vi.spyOn(
          supabaseClient,
          "from"
        ).mockReturnValue({
          update:
            updateQuery.update,
        } as never);

        await markProjectStarted(
          `  ${PROJECT_ID}  `
        );

        expect(
          updateQuery.firstEq
        ).toHaveBeenCalledWith(
          "id",
          PROJECT_ID
        );
      }
    );

    it(
      "scopes the Project start transition to the authenticated user",
      async () => {
        mockAuthenticatedUser();

        const updateQuery =
          createStartProjectUpdateQueryMock({
            data:
              createProjectRow(),
          });

        vi.spyOn(
          supabaseClient,
          "from"
        ).mockReturnValue({
          update:
            updateQuery.update,
        } as never);

        await markProjectStarted(
          PROJECT_ID
        );

        expect(
          updateQuery.secondEq
        ).toHaveBeenCalledWith(
          "user_id",
          USER_ID
        );
      }
    );

    it(
      "starts only a canonical project whose started_at is null",
      async () => {
        mockAuthenticatedUser();

        const updateQuery =
          createStartProjectUpdateQueryMock({
            data:
              createProjectRow(),
          });

        vi.spyOn(
          supabaseClient,
          "from"
        ).mockReturnValue({
          update:
            updateQuery.update,
        } as never);

        await markProjectStarted(
          PROJECT_ID
        );

        expect(
          updateQuery.is
        ).toHaveBeenCalledWith(
          "started_at",
          null
        );
      }
    );

    it(
      "updates started_at and updated_at with the same timestamp",
      async () => {
        mockAuthenticatedUser();

        const updateQuery =
          createStartProjectUpdateQueryMock({
            data:
              createProjectRow(),
          });

        vi.spyOn(
          supabaseClient,
          "from"
        ).mockReturnValue({
          update:
            updateQuery.update,
        } as never);

        await markProjectStarted(
          PROJECT_ID
        );

        expect(
          updateQuery.update
        ).toHaveBeenCalledTimes(
          1
        );

        const updatePayload =
          updateQuery.update.mock.calls[0]?.[0];

        expect(
          updatePayload.started_at
        ).toEqual(
          expect.any(
            String
          )
        );

        expect(
          updatePayload.updated_at
        ).toBe(
          updatePayload.started_at
        );
      }
    );

    it(
      "returns didStart false without overwriting an already-started project",
      async () => {
        mockAuthenticatedUser();

        const updateQuery =
          createStartProjectUpdateQueryMock({
            data:
              null,
          });

        const existingStartedAt =
          "2026-08-10T01:00:00.000Z";

        const existingLookup =
          createLookupQueryMock({
            data:
              createProjectRow({
                started_at:
                  existingStartedAt,
              }),
          });

        const fromSpy =
          vi.spyOn(
            supabaseClient,
            "from"
          )
            .mockReturnValueOnce({
              update:
                updateQuery.update,
            } as never)
            .mockReturnValueOnce({
              select:
                existingLookup.select,
            } as never);

        const result =
          await markProjectStarted(
            PROJECT_ID
          );

        expect(
          result.didStart
        ).toBe(
          false
        );

        expect(
          result.project.startedAt
        ).toBe(
          existingStartedAt
        );

        expect(
          fromSpy
        ).toHaveBeenCalledTimes(
          2
        );
      }
    );

    it(
      "rejects an empty canonical project identity before accessing Supabase",
      async () => {
        const getUserSpy =
          vi.spyOn(
            supabaseClient.auth,
            "getUser"
          );

        const fromSpy =
          vi.spyOn(
            supabaseClient,
            "from"
          );

        await expect(
          markProjectStarted(
            "   "
          )
        ).rejects.toThrow(
          "A canonical project identity is required to start an InnerMirror project."
        );

        expect(
          getUserSpy
        ).not.toHaveBeenCalled();

        expect(
          fromSpy
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "rejects an unauthenticated user when starting a project",
      async () => {
        vi.spyOn(
          supabaseClient.auth,
          "getUser"
        ).mockResolvedValue({
          data: {
            user:
              null,
          },

          error:
            null,
        } as never);

        const fromSpy =
          vi.spyOn(
            supabaseClient,
            "from"
          );

        await expect(
          markProjectStarted(
            PROJECT_ID
          )
        ).rejects.toThrow(
          "An authenticated user is required to persist projects."
        );

        expect(
          fromSpy
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "propagates authentication errors when starting a project",
      async () => {
        const authError =
          new Error(
            "Authentication failed."
          );

        vi.spyOn(
          supabaseClient.auth,
          "getUser"
        ).mockResolvedValue({
          data: {
            user:
              null,
          },

          error:
            authError,
        } as Awaited<
          ReturnType<
            typeof supabaseClient.auth.getUser
          >
        >);

        await expect(
          markProjectStarted(
            PROJECT_ID
          )
        ).rejects.toBe(
          authError
        );
      }
    );

    it(
      "propagates Project start update errors",
      async () => {
        mockAuthenticatedUser();

        const updateError =
          new Error(
            "Project start update failed."
          );

        const updateQuery =
          createStartProjectUpdateQueryMock({
            data:
              null,

            error:
              updateError,
          });

        vi.spyOn(
          supabaseClient,
          "from"
        ).mockReturnValue({
          update:
            updateQuery.update,
        } as never);

        await expect(
          markProjectStarted(
            PROJECT_ID
          )
        ).rejects.toBe(
          updateError
        );
      }
    );

    it(
      "propagates existing Project lookup errors after a no-op start update",
      async () => {
        mockAuthenticatedUser();

        const updateQuery =
          createStartProjectUpdateQueryMock({
            data:
              null,
          });

        const lookupError =
          new Error(
            "Existing Project lookup failed."
          );

        const existingLookup =
          createLookupQueryMock({
            data:
              null,

            error:
              lookupError,
          });

        vi.spyOn(
          supabaseClient,
          "from"
        )
          .mockReturnValueOnce({
            update:
              updateQuery.update,
          } as never)
          .mockReturnValueOnce({
            select:
              existingLookup.select,
          } as never);

        await expect(
          markProjectStarted(
            PROJECT_ID
          )
        ).rejects.toBe(
          lookupError
        );
      }
    );

    it(
      "updates the canonical Project current focus",
      async () => {
        mockAuthenticatedUser();

        const updatedRow =
          createProjectRow({
            current_focus:
              "class relationships",

            updated_at:
              "2026-08-12T00:00:00.000Z",
          });

        const updateQuery =
          createProjectFocusUpdateQueryMock({
            data:
              updatedRow,
          });

        vi.spyOn(
          supabaseClient,
          "from"
        ).mockReturnValue({
          update:
            updateQuery.update,
        } as never);

        const result =
          await updateProjectCurrentFocus({
            projectId:
              PROJECT_ID,

            currentFocus:
              "class relationships",
          });

        expect(
          result.currentFocus
        ).toBe(
          "class relationships"
        );

        expect(
          result.id
        ).toBe(
          PROJECT_ID
        );
      }
    );

    it(
      "normalizes the canonical project identity before updating focus",
      async () => {
        mockAuthenticatedUser();

        const updateQuery =
          createProjectFocusUpdateQueryMock({
            data:
              createProjectRow({
                current_focus:
                  "class relationships",
              }),
          });

        vi.spyOn(
          supabaseClient,
          "from"
        ).mockReturnValue({
          update:
            updateQuery.update,
        } as never);

        await updateProjectCurrentFocus({
          projectId:
            `  ${PROJECT_ID}  `,

          currentFocus:
            "class relationships",
        });

        expect(
          updateQuery.firstEq
        ).toHaveBeenCalledWith(
          "id",
          PROJECT_ID
        );
      }
    );

    it(
      "normalizes the Project focus before persistence",
      async () => {
        mockAuthenticatedUser();

        const updateQuery =
          createProjectFocusUpdateQueryMock({
            data:
              createProjectRow({
                current_focus:
                  "class relationships",
              }),
          });

        vi.spyOn(
          supabaseClient,
          "from"
        ).mockReturnValue({
          update:
            updateQuery.update,
        } as never);

        await updateProjectCurrentFocus({
          projectId:
            PROJECT_ID,

          currentFocus:
            "  class relationships  ",
        });

        expect(
          updateQuery.update
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            current_focus:
              "class relationships",
          })
        );
      }
    );

    it(
      "scopes the Project focus update to the authenticated user",
      async () => {
        mockAuthenticatedUser();

        const updateQuery =
          createProjectFocusUpdateQueryMock({
            data:
              createProjectRow({
                current_focus:
                  "class relationships",
              }),
          });

        vi.spyOn(
          supabaseClient,
          "from"
        ).mockReturnValue({
          update:
            updateQuery.update,
        } as never);

        await updateProjectCurrentFocus({
          projectId:
            PROJECT_ID,

          currentFocus:
            "class relationships",
        });

        expect(
          updateQuery.secondEq
        ).toHaveBeenCalledWith(
          "user_id",
          USER_ID
        );
      }
    );

    it(
      "updates current_focus and updated_at together",
      async () => {
        mockAuthenticatedUser();

        const updateQuery =
          createProjectFocusUpdateQueryMock({
            data:
              createProjectRow({
                current_focus:
                  "class relationships",
              }),
          });

        vi.spyOn(
          supabaseClient,
          "from"
        ).mockReturnValue({
          update:
            updateQuery.update,
        } as never);

        await updateProjectCurrentFocus({
          projectId:
            PROJECT_ID,

          currentFocus:
            "class relationships",
        });

        expect(
          updateQuery.update
        ).toHaveBeenCalledTimes(
          1
        );

        const updatePayload =
          updateQuery.update.mock.calls[0]?.[0];

        expect(
          updatePayload.current_focus
        ).toBe(
          "class relationships"
        );

        expect(
          updatePayload.updated_at
        ).toEqual(
          expect.any(
            String
          )
        );

        expect(
          updatePayload
        ).not.toHaveProperty(
          "started_at"
        );
      }
    );

    it(
      "rejects an empty canonical project identity before updating focus",
      async () => {
        const getUserSpy =
          vi.spyOn(
            supabaseClient.auth,
            "getUser"
          );

        const fromSpy =
          vi.spyOn(
            supabaseClient,
            "from"
          );

        await expect(
          updateProjectCurrentFocus({
            projectId:
              "   ",

            currentFocus:
              "class relationships",
          })
        ).rejects.toThrow(
          "A canonical project identity is required to update the InnerMirror project focus."
        );

        expect(
          getUserSpy
        ).not.toHaveBeenCalled();

        expect(
          fromSpy
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "rejects an empty Project focus before accessing Supabase",
      async () => {
        const getUserSpy =
          vi.spyOn(
            supabaseClient.auth,
            "getUser"
          );

        const fromSpy =
          vi.spyOn(
            supabaseClient,
            "from"
          );

        await expect(
          updateProjectCurrentFocus({
            projectId:
              PROJECT_ID,

            currentFocus:
              "   ",
          })
        ).rejects.toThrow(
          "A non-empty project focus is required."
        );

        expect(
          getUserSpy
        ).not.toHaveBeenCalled();

        expect(
          fromSpy
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "rejects an unauthenticated user when updating Project focus",
      async () => {
        vi.spyOn(
          supabaseClient.auth,
          "getUser"
        ).mockResolvedValue({
          data: {
            user:
              null,
          },

          error:
            null,
        } as never);

        const fromSpy =
          vi.spyOn(
            supabaseClient,
            "from"
          );

        await expect(
          updateProjectCurrentFocus({
            projectId:
              PROJECT_ID,

            currentFocus:
              "class relationships",
          })
        ).rejects.toThrow(
          "An authenticated user is required to persist projects."
        );

        expect(
          fromSpy
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "propagates authentication errors when updating Project focus",
      async () => {
        const authError =
          new Error(
            "Authentication failed."
          );

        vi.spyOn(
          supabaseClient.auth,
          "getUser"
        ).mockResolvedValue({
          data: {
            user:
              null,
          },

          error:
            authError,
        } as Awaited<
          ReturnType<
            typeof supabaseClient.auth.getUser
          >
        >);

        await expect(
          updateProjectCurrentFocus({
            projectId:
              PROJECT_ID,

            currentFocus:
              "class relationships",
          })
        ).rejects.toBe(
          authError
        );
      }
    );

    it(
      "propagates Project focus update errors",
      async () => {
        mockAuthenticatedUser();

        const updateError =
          new Error(
            "Project focus update failed."
          );

        const updateQuery =
          createProjectFocusUpdateQueryMock({
            data:
              null,

            error:
              updateError,
          });

        vi.spyOn(
          supabaseClient,
          "from"
        ).mockReturnValue({
          update:
            updateQuery.update,
        } as never);

        await expect(
          updateProjectCurrentFocus({
            projectId:
              PROJECT_ID,

            currentFocus:
              "class relationships",
          })
        ).rejects.toBe(
          updateError
        );
      }
    );

    it(
      "preserves the canonical Project startedAt when updating focus",
      async () => {
        mockAuthenticatedUser();

        const startedAt =
          "2026-08-10T01:00:00.000Z";

        const updateQuery =
          createProjectFocusUpdateQueryMock({
            data:
              createProjectRow({
                current_focus:
                  "class relationships",

                started_at:
                  startedAt,
              }),
          });

        vi.spyOn(
          supabaseClient,
          "from"
        ).mockReturnValue({
          update:
            updateQuery.update,
        } as never);

        const result =
          await updateProjectCurrentFocus({
            projectId:
              PROJECT_ID,

            currentFocus:
              "class relationships",
          });

        expect(
          result.startedAt
        ).toBe(
          startedAt
        );
      }
    );
  }
);