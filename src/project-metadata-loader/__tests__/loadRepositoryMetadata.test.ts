import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  loadRepositoryMetadata,
  RepositoryMetadataLoadError,
} from "../loadRepositoryMetadata";

import type {
  RuntimeProjectIdentity,
} from "../../project-identity/runtimeProjectIdentityTypes";

function createProjectIdentity(): RuntimeProjectIdentity {
  return {
    projectId:
      "github:fribot-labs:fribot-learning",

    source:
      "github-repository",

    kind:
      "pbl",

    repository: {
      repositoryId:
        "123456789",

      owner:
        "fribot-labs",

      name:
        "fribot-learning",

      fullName:
        "fribot-labs/fribot-learning",

      defaultBranch:
        "main",

      htmlUrl:
        "https://github.com/fribot-labs/fribot-learning",
    },

    createdAt:
      "2026-08-07T10:00:00.000Z",
  };
}

function createJsonResponse(
  body: unknown,
  status = 200
): Response {
  return new Response(
    JSON.stringify(body),
    {
      status,

      headers: {
        "Content-Type":
          "application/json",
      },
    }
  );
}

function createSuccessfulRuntimeResponse(
  content:
    string
) {
  return {
    ok:
      true,

    data: {
      path:
        "pbl/manifest.json",

      content,

      encoding:
        "utf-8",

      sha:
        "manifest-sha-123",
    },
  };
}

describe(
  "loadRepositoryMetadata",
  () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it(
      "loads and normalizes valid PBL repository metadata",
      async () => {
        const manifest =
          JSON.stringify({
            schemaVersion:
              "v1",

            templateId:
              "dual-mcu",

            courseId:
              "robotics-foundation",

            title:
              "Dual MCU Robotics",

            difficulty:
              "beginner",

            estimatedWeeks:
              6,

            learningGoal:
              "Build and understand a dual-controller robotics system.",
          });

        vi.spyOn(
          globalThis,
          "fetch"
        ).mockResolvedValue(
          createJsonResponse(
            createSuccessfulRuntimeResponse(
              manifest
            )
          )
        );

        const result =
          await loadRepositoryMetadata({
            githubSessionId:
              "session-123",

            projectIdentity:
              createProjectIdentity(),

            discoveredAt:
              "2026-08-07T11:00:00.000Z",
          });

        expect(
          result
        ).toEqual({
          metadataVersion:
            "v1",

          projectId:
            "github:fribot-labs:fribot-learning",

          templateId:
            "dual-mcu",

          courseId:
            "robotics-foundation",

          title:
            "Dual MCU Robotics",

          difficulty:
            "beginner",

          estimatedWeeks:
            6,

          learningGoal:
            "Build and understand a dual-controller robotics system.",

          source:
            "pbl-manifest",

          discoveredAt:
            "2026-08-07T11:00:00.000Z",

          updatedAt:
            "2026-08-07T11:00:00.000Z",
        });
      }
    );

    it(
      "builds the Runtime repository-file request correctly",
      async () => {
        let capturedUrl =
          "";

        let capturedInit:
          RequestInit |
          undefined;

        vi.spyOn(
          globalThis,
          "fetch"
        ).mockImplementation(
          async (
            input,
            init
          ) => {
            capturedUrl =
              String(
                input
              );

            capturedInit =
              init;

            return createJsonResponse(
              createSuccessfulRuntimeResponse(
                JSON.stringify({
                  schemaVersion:
                    "v1",

                  templateId:
                    null,

                  courseId:
                    null,

                  title:
                    null,

                  difficulty:
                    null,

                  estimatedWeeks:
                    null,

                  learningGoal:
                    null,
                })
              )
            );
          }
        );

        await loadRepositoryMetadata({
          githubSessionId:
            "  session-123  ",

          projectIdentity:
            createProjectIdentity(),

          discoveredAt:
            "2026-08-07T11:00:00.000Z",
        });

        const url =
          new URL(
            capturedUrl
          );

        expect(
          url.origin
        ).toBe(
          "http://localhost:4000"
        );

        expect(
          url.pathname
        ).toBe(
          "/github/repository-file"
        );

        expect(
          url.searchParams.has(
            "sessionId"
          )
        ).toBe(false);

        expect(
          url.searchParams.get(
            "owner"
          )
        ).toBe(
          "fribot-labs"
        );

        expect(
          url.searchParams.get(
            "repository"
          )
        ).toBe(
          "fribot-learning"
        );

        expect(
          url.searchParams.get(
            "path"
          )
        ).toBe(
          "pbl/manifest.json"
        );

        expect(
          url.searchParams.get(
            "ref"
          )
        ).toBe(
          "main"
        );

        expect(
          capturedInit?.method
        ).toBe(
          "GET"
        );

        const headers =
          new Headers(
            capturedInit?.headers
          );

        expect(
          headers.get(
            "Accept"
          )
        ).toBe(
          "application/json"
        );

        expect(
          headers.get(
            "X-InnerMirror-Runtime-Session"
          )
        ).toBe(
          "session-123"
        );
      }
    );

    it(
      "returns null when the repository has no PBL manifest",
      async () => {
        vi.spyOn(
          globalThis,
          "fetch"
        ).mockResolvedValue(
          createJsonResponse(
            {
              ok:
                false,

              error: {
                code:
                  "REPOSITORY_FILE_NOT_FOUND",

                message:
                  "Repository file was not found.",
              },
            },
            404
          )
        );

        const result =
          await loadRepositoryMetadata({
            githubSessionId:
              "session-123",

            projectIdentity:
              createProjectIdentity(),
          });

        expect(
          result
        ).toBeNull();
      }
    );

    it(
      "preserves nullable PBL manifest metadata",
      async () => {
        vi.spyOn(
          globalThis,
          "fetch"
        ).mockResolvedValue(
          createJsonResponse(
            createSuccessfulRuntimeResponse(
              JSON.stringify({
                schemaVersion:
                  "v1",

                templateId:
                  null,

                courseId:
                  null,

                title:
                  null,

                difficulty:
                  null,

                estimatedWeeks:
                  null,

                learningGoal:
                  null,
              })
            )
          )
        );

        const result =
          await loadRepositoryMetadata({
            githubSessionId:
              "session-123",

            projectIdentity:
              createProjectIdentity(),

            discoveredAt:
              "2026-08-07T11:00:00.000Z",
          });

        expect(
          result
        ).not.toBeNull();

        expect(
          result
            ?.templateId
        ).toBeNull();

        expect(
          result
            ?.courseId
        ).toBeNull();

        expect(
          result
            ?.difficulty
        ).toBeNull();

        expect(
          result
            ?.estimatedWeeks
        ).toBeNull();

        expect(
          result
            ?.learningGoal
        ).toBeNull();
      }
    );

    it(
      "uses the repository name when manifest title is null",
      async () => {
        vi.spyOn(
          globalThis,
          "fetch"
        ).mockResolvedValue(
          createJsonResponse(
            createSuccessfulRuntimeResponse(
              JSON.stringify({
                schemaVersion:
                  "v1",

                templateId:
                  null,

                courseId:
                  null,

                title:
                  null,

                difficulty:
                  null,

                estimatedWeeks:
                  null,

                learningGoal:
                  null,
              })
            )
          )
        );

        const result =
          await loadRepositoryMetadata({
            githubSessionId:
              "session-123",

            projectIdentity:
              createProjectIdentity(),

            discoveredAt:
              "2026-08-07T11:00:00.000Z",
          });

        expect(
          result?.title
        ).toBe(
          "fribot-learning"
        );
      }
    );

    it(
      "supports UTF-8 manifest metadata",
      async () => {
        vi.spyOn(
          globalThis,
          "fetch"
        ).mockResolvedValue(
          createJsonResponse(
            createSuccessfulRuntimeResponse(
              JSON.stringify({
                schemaVersion:
                  "v1",

                templateId:
                  "robotics-basic",

                courseId:
                  "robotics-foundation",

                title:
                  "로봇 프로젝트 학습",

                difficulty:
                  "beginner",

                estimatedWeeks:
                  6,

                learningGoal:
                  "두 개의 MCU 관계를 이해한다.",
              })
            )
          )
        );

        const result =
          await loadRepositoryMetadata({
            githubSessionId:
              "session-123",

            projectIdentity:
              createProjectIdentity(),

            discoveredAt:
              "2026-08-07T11:00:00.000Z",
          });

        expect(
          result?.title
        ).toBe(
          "로봇 프로젝트 학습"
        );

        expect(
          result?.learningGoal
        ).toBe(
          "두 개의 MCU 관계를 이해한다."
        );
      }
    );

    it(
      "throws when the Runtime GitHub session id is empty",
      async () => {
        const fetchSpy =
          vi.spyOn(
            globalThis,
            "fetch"
          );

        await expect(
          loadRepositoryMetadata({
            githubSessionId:
              "   ",

            projectIdentity:
              createProjectIdentity(),
          })
        ).rejects.toMatchObject({
          name:
            "RepositoryMetadataLoadError",

          code:
            "GITHUB_SESSION_ID_REQUIRED",

          status:
            400,
        });

        expect(
          fetchSpy
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "throws when the repository owner is empty",
      async () => {
        const identity =
          createProjectIdentity();

        identity.repository.owner =
          "   ";

        const fetchSpy =
          vi.spyOn(
            globalThis,
            "fetch"
          );

        await expect(
          loadRepositoryMetadata({
            githubSessionId:
              "session-123",

            projectIdentity:
              identity,
          })
        ).rejects.toMatchObject({
          code:
            "REPOSITORY_OWNER_REQUIRED",

          status:
            400,
        });

        expect(
          fetchSpy
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "throws when the repository name is empty",
      async () => {
        const identity =
          createProjectIdentity();

        identity.repository.name =
          "   ";

        const fetchSpy =
          vi.spyOn(
            globalThis,
            "fetch"
          );

        await expect(
          loadRepositoryMetadata({
            githubSessionId:
              "session-123",

            projectIdentity:
              identity,
          })
        ).rejects.toMatchObject({
          code:
            "REPOSITORY_NAME_REQUIRED",

          status:
            400,
        });

        expect(
          fetchSpy
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "throws when the repository default branch is empty",
      async () => {
        const identity =
          createProjectIdentity();

        identity.repository.defaultBranch =
          "   ";

        const fetchSpy =
          vi.spyOn(
            globalThis,
            "fetch"
          );

        await expect(
          loadRepositoryMetadata({
            githubSessionId:
              "session-123",

            projectIdentity:
              identity,
          })
        ).rejects.toMatchObject({
          code:
            "REPOSITORY_DEFAULT_BRANCH_REQUIRED",

          status:
            400,
        });

        expect(
          fetchSpy
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "maps Runtime network failure to RUNTIME_NETWORK_ERROR",
      async () => {
        vi.spyOn(
          globalThis,
          "fetch"
        ).mockRejectedValue(
          new TypeError(
            "Failed to fetch"
          )
        );

        await expect(
          loadRepositoryMetadata({
            githubSessionId:
              "session-123",

            projectIdentity:
              createProjectIdentity(),
          })
        ).rejects.toMatchObject({
          name:
            "RepositoryMetadataLoadError",

          code:
            "RUNTIME_NETWORK_ERROR",

          status:
            502,
        });
      }
    );

    it(
      "maps an invalid Runtime JSON response to RUNTIME_INVALID_RESPONSE",
      async () => {
        vi.spyOn(
          globalThis,
          "fetch"
        ).mockResolvedValue(
          new Response(
            "not-json",
            {
              status:
                200,

              headers: {
                "Content-Type":
                  "text/plain",
              },
            }
          )
        );

        await expect(
          loadRepositoryMetadata({
            githubSessionId:
              "session-123",

            projectIdentity:
              createProjectIdentity(),
          })
        ).rejects.toMatchObject({
          code:
            "RUNTIME_INVALID_RESPONSE",

          status:
            502,
        });
      }
    );

    it(
      "preserves Runtime GitHub session errors",
      async () => {
        vi.spyOn(
          globalThis,
          "fetch"
        ).mockResolvedValue(
          createJsonResponse(
            {
              ok:
                false,

              error: {
                code:
                  "GITHUB_SESSION_INVALID",

                message:
                  "Invalid or expired GitHub session.",
              },
            },
            401
          )
        );

        await expect(
          loadRepositoryMetadata({
            githubSessionId:
              "session-123",

            projectIdentity:
              createProjectIdentity(),
          })
        ).rejects.toMatchObject({
          name:
            "RepositoryMetadataLoadError",

          code:
            "GITHUB_SESSION_INVALID",

          status:
            401,

          message:
            "Invalid or expired GitHub session.",
        });
      }
    );

    it(
      "preserves Runtime forbidden errors",
      async () => {
        vi.spyOn(
          globalThis,
          "fetch"
        ).mockResolvedValue(
          createJsonResponse(
            {
              ok:
                false,

              error: {
                code:
                  "GITHUB_ACCESS_FORBIDDEN",

                message:
                  "GitHub denied access to the repository file.",
              },
            },
            403
          )
        );

        await expect(
          loadRepositoryMetadata({
            githubSessionId:
              "session-123",

            projectIdentity:
              createProjectIdentity(),
          })
        ).rejects.toMatchObject({
          code:
            "GITHUB_ACCESS_FORBIDDEN",

          status:
            403,
        });
      }
    );

    it(
      "preserves Runtime server errors",
      async () => {
        vi.spyOn(
          globalThis,
          "fetch"
        ).mockResolvedValue(
          createJsonResponse(
            {
              ok:
                false,

              error: {
                code:
                  "GITHUB_REPOSITORY_FILE_FETCH_FAILED",

                message:
                  "GitHub repository file fetch failed.",
              },
            },
            500
          )
        );

        await expect(
          loadRepositoryMetadata({
            githubSessionId:
              "session-123",

            projectIdentity:
              createProjectIdentity(),
          })
        ).rejects.toMatchObject({
          code:
            "GITHUB_REPOSITORY_FILE_FETCH_FAILED",

          status:
            500,
        });
      }
    );

    it(
      "rejects a successful HTTP response with an error payload",
      async () => {
        vi.spyOn(
          globalThis,
          "fetch"
        ).mockResolvedValue(
          createJsonResponse({
            ok:
              false,

            error: {
              code:
                "UNEXPECTED_RUNTIME_RESULT",

              message:
                "Unexpected Runtime result.",
            },
          })
        );

        await expect(
          loadRepositoryMetadata({
            githubSessionId:
              "session-123",

            projectIdentity:
              createProjectIdentity(),
          })
        ).rejects.toMatchObject({
          code:
            "RUNTIME_INVALID_RESPONSE",

          status:
            502,
        });
      }
    );

    it(
      "rejects an invalid repository file payload",
      async () => {
        vi.spyOn(
          globalThis,
          "fetch"
        ).mockResolvedValue(
          createJsonResponse({
            ok:
              true,

            data: {
              path:
                "pbl/manifest.json",

              content:
                "{}",

              encoding:
                "base64",

              sha:
                "abc123",
            },
          })
        );

        await expect(
          loadRepositoryMetadata({
            githubSessionId:
              "session-123",

            projectIdentity:
              createProjectIdentity(),
          })
        ).rejects.toMatchObject({
          code:
            "RUNTIME_INVALID_REPOSITORY_FILE",

          status:
            502,
        });
      }
    );

    it(
      "rejects malformed manifest JSON",
      async () => {
        vi.spyOn(
          globalThis,
          "fetch"
        ).mockResolvedValue(
          createJsonResponse(
            createSuccessfulRuntimeResponse(
              "{ invalid-json"
            )
          )
        );

        await expect(
          loadRepositoryMetadata({
            githubSessionId:
              "session-123",

            projectIdentity:
              createProjectIdentity(),
          })
        ).rejects.toMatchObject({
          code:
            "PBL_MANIFEST_INVALID_JSON",

          status:
            422,
        });
      }
    );

    it(
      "rejects an unsupported manifest schemaVersion",
      async () => {
        vi.spyOn(
          globalThis,
          "fetch"
        ).mockResolvedValue(
          createJsonResponse(
            createSuccessfulRuntimeResponse(
              JSON.stringify({
                schemaVersion:
                  "v2",
              })
            )
          )
        );

        await expect(
          loadRepositoryMetadata({
            githubSessionId:
              "session-123",

            projectIdentity:
              createProjectIdentity(),
          })
        ).rejects.toMatchObject({
          code:
            "PBL_MANIFEST_INVALID",

          status:
            422,

          message:
            "Unsupported PBL manifest schemaVersion.",
        });
      }
    );

    it(
      "rejects invalid manifest field types",
      async () => {
        vi.spyOn(
          globalThis,
          "fetch"
        ).mockResolvedValue(
          createJsonResponse(
            createSuccessfulRuntimeResponse(
              JSON.stringify({
                schemaVersion:
                  "v1",

                templateId:
                  123,

                courseId:
                  null,

                title:
                  null,

                difficulty:
                  null,

                estimatedWeeks:
                  null,

                learningGoal:
                  null,
              })
            )
          )
        );

        await expect(
          loadRepositoryMetadata({
            githubSessionId:
              "session-123",

            projectIdentity:
              createProjectIdentity(),
          })
        ).rejects.toMatchObject({
          code:
            "PBL_MANIFEST_INVALID",

          status:
            422,

          message:
            "PBL manifest string field is invalid.",
        });
      }
    );

    it(
      "rejects invalid estimatedWeeks",
      async () => {
        vi.spyOn(
          globalThis,
          "fetch"
        ).mockResolvedValue(
          createJsonResponse(
            createSuccessfulRuntimeResponse(
              JSON.stringify({
                schemaVersion:
                  "v1",

                templateId:
                  null,

                courseId:
                  null,

                title:
                  null,

                difficulty:
                  null,

                estimatedWeeks:
                  -1,

                learningGoal:
                  null,
              })
            )
          )
        );

        await expect(
          loadRepositoryMetadata({
            githubSessionId:
              "session-123",

            projectIdentity:
              createProjectIdentity(),
          })
        ).rejects.toMatchObject({
          code:
            "PBL_MANIFEST_INVALID",

          status:
            422,

          message:
            "PBL manifest estimatedWeeks is invalid.",
        });
      }
    );

    it(
      "maps invalid discoveredAt to metadata normalization failure",
      async () => {
        vi.spyOn(
          globalThis,
          "fetch"
        ).mockResolvedValue(
          createJsonResponse(
            createSuccessfulRuntimeResponse(
              JSON.stringify({
                schemaVersion:
                  "v1",

                templateId:
                  null,

                courseId:
                  null,

                title:
                  "Fribot Learning",

                difficulty:
                  null,

                estimatedWeeks:
                  null,

                learningGoal:
                  null,
              })
            )
          )
        );

        await expect(
          loadRepositoryMetadata({
            githubSessionId:
              "session-123",

            projectIdentity:
              createProjectIdentity(),

            discoveredAt:
              "not-a-date",
          })
        ).rejects.toMatchObject({
          code:
            "PROJECT_METADATA_NORMALIZATION_FAILED",

          status:
            422,

          message:
            "Repository metadata requires a valid discoveredAt value.",
        });
      }
    );

    it(
      "returns RepositoryMetadataLoadError instances",
      async () => {
        vi.spyOn(
          globalThis,
          "fetch"
        ).mockResolvedValue(
          createJsonResponse(
            {
              ok:
                false,

              error: {
                code:
                  "GITHUB_SESSION_INVALID",

                message:
                  "Invalid or expired GitHub session.",
              },
            },
            401
          )
        );

        try {
          await loadRepositoryMetadata({
            githubSessionId:
              "session-123",

            projectIdentity:
              createProjectIdentity(),
          });

          throw new Error(
            "Expected loadRepositoryMetadata to reject."
          );
        } catch (
          error
        ) {
          expect(
            error
          ).toBeInstanceOf(
            RepositoryMetadataLoadError
          );

          if (
            error instanceof
            RepositoryMetadataLoadError
          ) {
            expect(
              error.name
            ).toBe(
              "RepositoryMetadataLoadError"
            );

            expect(
              error.code
            ).toBe(
              "GITHUB_SESSION_INVALID"
            );

            expect(
              error.status
            ).toBe(
              401
            );
          }
        }
      }
    );

    it(
      "loads and normalizes the Class Concept Robot PBL manifest contract",
      async () => {
        const manifest =
          JSON.stringify({
            schemaVersion:
              "v1",

            templateId:
              "fribot-learning-template-v1",

            courseId:
              "class-concept-robot",

            title:
              "Class Concept Robot",

            difficulty:
              "beginner",

            estimatedWeeks:
              4,

            learningGoal:
              "Understand why related state and behavior can be organized together through a class in robot programming.",
          });

        vi.spyOn(
          globalThis,
          "fetch"
        ).mockResolvedValue(
          createJsonResponse(
            createSuccessfulRuntimeResponse(
              manifest
            )
          )
        );

        const result =
          await loadRepositoryMetadata({
            githubSessionId:
              "session-123",

            projectIdentity:
              createProjectIdentity(),

            discoveredAt:
              "2026-08-08T07:30:00.000Z",
          });

        expect(
          result
        ).toEqual({
          metadataVersion:
            "v1",

          projectId:
            "github:fribot-labs:fribot-learning",

          templateId:
            "fribot-learning-template-v1",

          courseId:
            "class-concept-robot",

          title:
            "Class Concept Robot",

          difficulty:
            "beginner",

          estimatedWeeks:
            4,

          learningGoal:
            "Understand why related state and behavior can be organized together through a class in robot programming.",

          source:
            "pbl-manifest",

          discoveredAt:
            "2026-08-08T07:30:00.000Z",

          updatedAt:
            "2026-08-08T07:30:00.000Z",
        });
      }
    );
  }
);