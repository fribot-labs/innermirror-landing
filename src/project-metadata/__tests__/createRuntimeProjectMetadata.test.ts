import {
    describe,
    expect,
    it,
} from "vitest";

import {
    createRuntimeProjectMetadata,
} from "../createRuntimeProjectMetadata";

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
  "createRuntimeProjectMetadata",
  () => {
    it(
      "creates repository-derived metadata from a Project Identity",
      () => {
        const projectIdentity =
          createProjectIdentity();

        const result =
          createRuntimeProjectMetadata({
            projectIdentity,

            discoveredAt:
              "2026-08-07T01:00:00.000Z",
          });

        expect(
          result.metadataVersion
        ).toBe(
          "v1"
        );

        expect(
          result.projectId
        ).toBe(
          "github:wookjin-chung:tandem-robotics"
        );

        expect(
          result.source
        ).toBe(
          "repository-derived"
        );
      }
    );

    it(
      "preserves the Project Identity projectId",
      () => {
        const projectIdentity =
          createProjectIdentity({
            projectId:
              "github:fribot-labs:fribot-learning",

            repository: {
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
          createRuntimeProjectMetadata({
            projectIdentity,

            discoveredAt:
              "2026-08-07T02:00:00.000Z",
          });

        expect(
          result.projectId
        ).toBe(
          projectIdentity.projectId
        );
      }
    );

    it(
      "uses the repository name as the initial metadata title",
      () => {
        const projectIdentity =
          createProjectIdentity({
            repository: {
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
          createRuntimeProjectMetadata({
            projectIdentity,

            discoveredAt:
              "2026-08-07T03:00:00.000Z",
          });

        expect(
          result.title
        ).toBe(
          "fribot-learning"
        );
      }
    );

    it(
      "does not infer metadata that has not been discovered",
      () => {
        const result =
          createRuntimeProjectMetadata({
            projectIdentity:
              createProjectIdentity(),

            discoveredAt:
              "2026-08-07T04:00:00.000Z",
          });

        expect(
          result.templateId
        ).toBeNull();

        expect(
          result.courseId
        ).toBeNull();

        expect(
          result.difficulty
        ).toBeNull();

        expect(
          result.estimatedWeeks
        ).toBeNull();

        expect(
          result.learningGoal
        ).toBeNull();
      }
    );

    it(
      "uses repository-derived as the initial metadata source",
      () => {
        const result =
          createRuntimeProjectMetadata({
            projectIdentity:
              createProjectIdentity(),

            discoveredAt:
              "2026-08-07T05:00:00.000Z",
          });

        expect(
          result.source
        ).toBe(
          "repository-derived"
        );
      }
    );

    it(
      "uses the supplied discoveredAt for both discoveredAt and updatedAt",
      () => {
        const discoveredAt =
          "2026-08-07T06:30:00.000Z";

        const result =
          createRuntimeProjectMetadata({
            projectIdentity:
              createProjectIdentity(),

            discoveredAt,
          });

        expect(
          result.discoveredAt
        ).toBe(
          discoveredAt
        );

        expect(
          result.updatedAt
        ).toBe(
          discoveredAt
        );
      }
    );

    it(
      "normalizes a valid discoveredAt value to ISO format",
      () => {
        const result =
          createRuntimeProjectMetadata({
            projectIdentity:
              createProjectIdentity(),

            discoveredAt:
              "2026-08-07T15:00:00+09:00",
          });

        expect(
          result.discoveredAt
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
      "supports an Organization repository without inferring PBL manifest metadata",
      () => {
        const projectIdentity =
          createProjectIdentity({
            projectId:
              "github:fribot-labs:fribot-learning",

            kind:
              "pbl",

            repository: {
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
          createRuntimeProjectMetadata({
            projectIdentity,

            discoveredAt:
              "2026-08-07T07:00:00.000Z",
          });

        expect(
          result.projectId
        ).toBe(
          "github:fribot-labs:fribot-learning"
        );

        expect(
          result.title
        ).toBe(
          "fribot-learning"
        );

        expect(
          result.templateId
        ).toBeNull();

        expect(
          result.courseId
        ).toBeNull();

        expect(
          result.difficulty
        ).toBeNull();

        expect(
          result.estimatedWeeks
        ).toBeNull();

        expect(
          result.learningGoal
        ).toBeNull();

        expect(
          result.source
        ).toBe(
          "repository-derived"
        );
      }
    );

    it(
      "throws when discoveredAt is invalid",
      () => {
        expect(() =>
          createRuntimeProjectMetadata({
            projectIdentity:
              createProjectIdentity(),

            discoveredAt:
              "not-a-valid-date",
          })
        ).toThrow(
          "Runtime Project Metadata requires a valid discoveredAt value."
        );
      }
    );
  }
);