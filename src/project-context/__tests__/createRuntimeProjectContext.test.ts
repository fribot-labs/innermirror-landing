import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createRuntimeProjectContext,
} from "../createRuntimeProjectContext";

import type {
  RuntimeProjectIdentity,
} from "../../project-identity/runtimeProjectIdentityTypes";

function createProjectIdentity(
  overrides: Partial<RuntimeProjectIdentity> = {}
): RuntimeProjectIdentity {
  return {
    projectId:
      "github:wookjin-chung:tandem-robotics",

    source:
      "github-repository",

    kind:
      "general",

    repository: {
      repositoryId:
          "1001",

      owner:
        "wookjin-chung",

      name:
        "Tandem_Robotics",

      fullName:
        "wookjin-chung/Tandem_Robotics",

      defaultBranch:
        "main",

      htmlUrl:
        "https://github.com/wookjin-chung/Tandem_Robotics",
    },

    createdAt:
      "2026-08-07T00:00:00.000Z",

    ...overrides,
  };
}

describe(
  "createRuntimeProjectContext",
  () => {
    it(
      "creates a general project context for a personal repository",
      () => {
        const projectIdentity =
          createProjectIdentity();

        const result =
          createRuntimeProjectContext({
            projectIdentity,
            createdAt:
              "2026-08-07T01:00:00.000Z",
          });

        expect(
          result.contextVersion
        ).toBe(
          "v1"
        );

        expect(
          result.projectId
        ).toBe(
          "github:wookjin-chung:tandem-robotics"
        );

        expect(
          result.kind
        ).toBe(
          "general"
        );

        expect(
          result.learningMode
        ).toBe(
          "general-project"
        );

        expect(
          result.learningStage
        ).toBe(
          "not-defined"
        );

        expect(
          result.goal
        ).toBeNull();

        expect(
          result.currentMilestone
        ).toBeNull();

        expect(
          result.source
        ).toBe(
          "repository-derived"
        );

        expect(
          result.createdAt
        ).toBe(
          "2026-08-07T01:00:00.000Z"
        );

        expect(
          result.updatedAt
        ).toBe(
          "2026-08-07T01:00:00.000Z"
        );
      }
    );

    it(
      "creates a PBL project context for a fribot-labs repository",
      () => {
        const projectIdentity =
          createProjectIdentity({
            projectId:
              "github:fribot-labs:fribot-learning",

            repository: {
              repositoryId:
                "1002",

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
          });

        const result =
          createRuntimeProjectContext({
            projectIdentity,
            createdAt:
              "2026-08-07T02:00:00.000Z",
          });

        expect(
          result.projectId
        ).toBe(
          "github:fribot-labs:fribot-learning"
        );

        expect(
          result.kind
        ).toBe(
          "pbl"
        );

        expect(
          result.learningMode
        ).toBe(
          "project-based-learning"
        );

        expect(
          result.learningStage
        ).toBe(
          "not-defined"
        );

        expect(
          result.goal
        ).toBeNull();

        expect(
          result.currentMilestone
        ).toBeNull();

        expect(
          result.source
        ).toBe(
          "repository-derived"
        );
      }
    );

    it(
      "treats the fribot-labs owner comparison as case-insensitive",
      () => {
        const projectIdentity =
          createProjectIdentity({
            projectId:
              "github:fribot-labs:innermirror-landing",

            repository: {
              repositoryId:
                "1003",

              owner:
                "FRIBOT-LABS",

              name:
                "innermirror-landing",

              fullName:
                "FRIBOT-LABS/innermirror-landing",

              defaultBranch:
                "main",

              htmlUrl:
                "https://github.com/fribot-labs/innermirror-landing",
            },
          });

        const result =
          createRuntimeProjectContext({
            projectIdentity,
            createdAt:
              "2026-08-07T03:00:00.000Z",
          });

        expect(
          result.kind
        ).toBe(
          "pbl"
        );

        expect(
          result.learningMode
        ).toBe(
          "project-based-learning"
        );
      }
    );

    it(
      "preserves the Project Identity projectId",
      () => {
        const projectIdentity =
          createProjectIdentity({
            projectId:
              "github:wookjin-chung:pbl-coaching-system-design",
          });

        const result =
          createRuntimeProjectContext({
            projectIdentity,
            createdAt:
              "2026-08-07T04:00:00.000Z",
          });

        expect(
          result.projectId
        ).toBe(
          projectIdentity.projectId
        );
      }
    );

    it(
      "does not infer learning state that has not been discovered",
      () => {
        const result =
          createRuntimeProjectContext({
            projectIdentity:
              createProjectIdentity(),

            createdAt:
              "2026-08-07T05:00:00.000Z",
          });

        expect(
          result.learningStage
        ).toBe(
          "not-defined"
        );

        expect(
          result.goal
        ).toBeNull();

        expect(
          result.currentMilestone
        ).toBeNull();
      }
    );

    it(
      "uses the supplied createdAt for both createdAt and updatedAt",
      () => {
        const createdAt =
          "2026-08-07T06:30:00.000Z";

        const result =
          createRuntimeProjectContext({
            projectIdentity:
              createProjectIdentity(),

            createdAt,
          });

        expect(
          result.createdAt
        ).toBe(
          createdAt
        );

        expect(
          result.updatedAt
        ).toBe(
          createdAt
        );
      }
    );

    it(
      "normalizes a valid createdAt value to ISO format",
      () => {
        const result =
          createRuntimeProjectContext({
            projectIdentity:
              createProjectIdentity(),

            createdAt:
              "2026-08-07T15:00:00+09:00",
          });

        expect(
          result.createdAt
        ).toBe(
          "2026-08-07T06:00:00.000Z"
        );

        expect(
          result.updatedAt
        ).toBe(
          "2026-08-07T06:00:00.000Z"
        );
      }
    );

    it(
      "throws when createdAt is invalid",
      () => {
        expect(() =>
          createRuntimeProjectContext({
            projectIdentity:
              createProjectIdentity(),

            createdAt:
              "not-a-valid-date",
          })
        ).toThrow(
          "Runtime Project Context requires a valid createdAt value."
        );
      }
    );
  }
);