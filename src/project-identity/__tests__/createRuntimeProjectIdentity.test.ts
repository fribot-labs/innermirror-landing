import {
    describe,
    expect,
    it,
} from "vitest";

import {
    createRuntimeProjectIdentity,
} from "../createRuntimeProjectIdentity";

import type {
    GitHubRepositorySummary,
} from "../../types/githubLearningEntry";


function createRepository(
  overrides:
    Partial<GitHubRepositorySummary> = {}
): GitHubRepositorySummary {
  return {
    repositoryId:
      "123456789",

    owner:
      "wookjin-chung",

    name:
      "Tandem_Robotics",

    fullName:
      "wookjin-chung/Tandem_Robotics",

    defaultBranch:
      "main",

    private:
      false,

    htmlUrl:
      "https://github.com/wookjin-chung/Tandem_Robotics",

    updatedAt:
      "2026-08-10T00:00:00.000Z",

    ...overrides,
  };
}


describe(
  "createRuntimeProjectIdentity",
  () => {
    it(
      "preserves the stable GitHub repository identity",
      () => {
        const result =
          createRuntimeProjectIdentity({
            repository:
              createRepository(),

            createdAt:
              "2026-08-10T01:00:00.000Z",
          });

        expect(
          result.repository.repositoryId
        ).toBe(
          "123456789"
        );
      }
    );


    it(
      "trims the stable GitHub repository identity",
      () => {
        const result =
          createRuntimeProjectIdentity({
            repository:
              createRepository({
                repositoryId:
                  "  123456789  ",
              }),

            createdAt:
              "2026-08-10T01:00:00.000Z",
          });

        expect(
          result.repository.repositoryId
        ).toBe(
          "123456789"
        );
      }
    );


    it(
      "does not derive repository identity from mutable repository metadata",
      () => {
        const result =
          createRuntimeProjectIdentity({
            repository:
              createRepository({
                repositoryId:
                  "987654321",

                owner:
                  "new-owner",

                name:
                  "renamed-project",

                fullName:
                  "new-owner/renamed-project",

                htmlUrl:
                  "https://github.com/new-owner/renamed-project",
              }),

            createdAt:
              "2026-08-10T01:00:00.000Z",
          });

        expect(
          result.repository.repositoryId
        ).toBe(
          "987654321"
        );

        expect(
          result.projectId
        ).toBe(
          "github:new-owner:renamed-project"
        );
      }
    );


    it(
      "creates the existing logical projectId independently from repositoryId",
      () => {
        const result =
          createRuntimeProjectIdentity({
            repository:
              createRepository({
                repositoryId:
                  "555555555",

                owner:
                  "FRIBOT-LABS",

                name:
                  "InnerMirror-Landing",

                fullName:
                  "FRIBOT-LABS/InnerMirror-Landing",
              }),

            createdAt:
              "2026-08-10T01:00:00.000Z",
          });

        expect(
          result.repository.repositoryId
        ).toBe(
          "555555555"
        );

        expect(
          result.projectId
        ).toBe(
          "github:fribot-labs:innermirror-landing"
        );
      }
    );


    it(
      "throws when repositoryId is empty",
      () => {
        expect(() =>
          createRuntimeProjectIdentity({
            repository:
              createRepository({
                repositoryId:
                  "   ",
              }),

            createdAt:
              "2026-08-10T01:00:00.000Z",
          })
        ).toThrow(
          "A stable GitHub repository identity is required to create a Runtime Project Identity."
        );
      }
    );


    it(
      "throws when repository owner is empty",
      () => {
        expect(() =>
          createRuntimeProjectIdentity({
            repository:
              createRepository({
                owner:
                  "   ",
              }),

            createdAt:
              "2026-08-10T01:00:00.000Z",
          })
        ).toThrow(
          "A stable GitHub repository identity is required to create a Runtime Project Identity."
        );
      }
    );


    it(
      "throws when repository name is empty",
      () => {
        expect(() =>
          createRuntimeProjectIdentity({
            repository:
              createRepository({
                name:
                  "   ",
              }),

            createdAt:
              "2026-08-10T01:00:00.000Z",
          })
        ).toThrow(
          "A stable GitHub repository identity is required to create a Runtime Project Identity."
        );
      }
    );


    it(
      "normalizes repository metadata while preserving repositoryId",
      () => {
        const result =
          createRuntimeProjectIdentity({
            repository:
              createRepository({
                repositoryId:
                  "246813579",

                owner:
                  "  wookjin-chung  ",

                name:
                  "  robotics-project  ",

                fullName:
                  undefined,

                defaultBranch:
                  undefined,

                htmlUrl:
                  undefined,
              }),

            createdAt:
              "2026-08-10T02:00:00.000Z",
          });

        expect(
          result.repository
        ).toEqual({
          repositoryId:
            "246813579",

          owner:
            "wookjin-chung",

          name:
            "robotics-project",

          fullName:
            "wookjin-chung/robotics-project",

          defaultBranch:
            "main",

          htmlUrl:
            "https://github.com/wookjin-chung/robotics-project",
        });
      }
    );


    it(
      "preserves the supplied project kind",
      () => {
        const result =
          createRuntimeProjectIdentity({
            repository:
              createRepository(),

            kind:
              "pbl",

            createdAt:
              "2026-08-10T03:00:00.000Z",
          });

        expect(
          result.kind
        ).toBe(
          "pbl"
        );
      }
    );


    it(
      "normalizes a valid createdAt value to ISO format",
      () => {
        const result =
          createRuntimeProjectIdentity({
            repository:
              createRepository(),

            createdAt:
              "2026-08-10T12:00:00+09:00",
          });

        expect(
          result.createdAt
        ).toBe(
          "2026-08-10T03:00:00.000Z"
        );
      }
    );


    it(
      "throws when createdAt is invalid",
      () => {
        expect(() =>
          createRuntimeProjectIdentity({
            repository:
              createRepository(),

            createdAt:
              "not-a-valid-date",
          })
        ).toThrow(
          "Runtime Project Identity requires a valid createdAt value."
        );
      }
    );
  }
);