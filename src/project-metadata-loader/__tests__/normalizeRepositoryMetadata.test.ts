import {
    describe,
    expect,
    it,
} from "vitest";

import {
    normalizeRepositoryMetadata,
} from "../normalizeRepositoryMetadata";

import type {
    RuntimeProjectIdentity,
} from "../../project-identity/runtimeProjectIdentityTypes";

import type {
    RepositoryMetadataManifest,
} from "../runtimeMetadataLoaderTypes";

function createProjectIdentity(
  overrides: Partial<RuntimeProjectIdentity> = {}
): RuntimeProjectIdentity {
  return {
    projectId:
      "github:fribot-labs:fribot-learning",

    source:
      "github-repository",

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

    createdAt:
      "2026-08-07T00:00:00.000Z",

    ...overrides,
  };
}

function createManifest(
  overrides: Partial<RepositoryMetadataManifest> = {}
): RepositoryMetadataManifest {
  return {
    schemaVersion:
      "v1",

    templateId:
      "fribot-learning",

    courseId:
      "fribot-learning-core",

    title:
      "Fribot Learning",

    difficulty:
      "beginner",

    estimatedWeeks:
      6,

    learningGoal:
      "Complete a project-based coding and robotics learning flow.",

    ...overrides,
  };
}

describe(
  "normalizeRepositoryMetadata",
  () => {
    it(
      "normalizes a PBL manifest into Runtime Project Metadata",
      () => {
        const projectIdentity =
          createProjectIdentity();

        const manifest =
          createManifest();

        const result =
          normalizeRepositoryMetadata({
            projectIdentity,
            manifest,
            discoveredAt:
              "2026-08-07T10:00:00.000Z",
          });

        expect(
          result
        ).toEqual({
          metadataVersion:
            "v1",

          projectId:
            "github:fribot-labs:fribot-learning",

          templateId:
            "fribot-learning",

          courseId:
            "fribot-learning-core",

          title:
            "Fribot Learning",

          difficulty:
            "beginner",

          estimatedWeeks:
            6,

          learningGoal:
            "Complete a project-based coding and robotics learning flow.",

          source:
            "pbl-manifest",

          discoveredAt:
            "2026-08-07T10:00:00.000Z",

          updatedAt:
            "2026-08-07T10:00:00.000Z",
        });
      }
    );

    it(
      "preserves the Project Identity projectId",
      () => {
        const projectIdentity =
          createProjectIdentity({
            projectId:
              "github:fribot-labs:custom-course",
          });

        const result =
          normalizeRepositoryMetadata({
            projectIdentity,
            manifest:
              createManifest(),

            discoveredAt:
              "2026-08-07T11:00:00.000Z",
          });

        expect(
          result.projectId
        ).toBe(
          projectIdentity.projectId
        );
      }
    );

    it(
      "copies manifest metadata fields",
      () => {
        const result =
          normalizeRepositoryMetadata({
            projectIdentity:
              createProjectIdentity(),

            manifest:
              createManifest({
                templateId:
                  "dual-mcu-starter",

                courseId:
                  "robotics-foundation",

                title:
                  "Dual MCU Robotics",

                difficulty:
                  "intermediate",

                estimatedWeeks:
                  8,

                learningGoal:
                  "Design a dual-controller robotics runtime.",
              }),

            discoveredAt:
              "2026-08-07T12:00:00.000Z",
          });

        expect(
          result.templateId
        ).toBe(
          "dual-mcu-starter"
        );

        expect(
          result.courseId
        ).toBe(
          "robotics-foundation"
        );

        expect(
          result.title
        ).toBe(
          "Dual MCU Robotics"
        );

        expect(
          result.difficulty
        ).toBe(
          "intermediate"
        );

        expect(
          result.estimatedWeeks
        ).toBe(
          8
        );

        expect(
          result.learningGoal
        ).toBe(
          "Design a dual-controller robotics runtime."
        );
      }
    );

    it(
      "marks normalized metadata as pbl-manifest sourced",
      () => {
        const result =
          normalizeRepositoryMetadata({
            projectIdentity:
              createProjectIdentity(),

            manifest:
              createManifest(),

            discoveredAt:
              "2026-08-07T13:00:00.000Z",
          });

        expect(
          result.source
        ).toBe(
          "pbl-manifest"
        );
      }
    );

    it(
      "falls back to the repository name when manifest title is null",
      () => {
        const projectIdentity =
          createProjectIdentity({
            repository: {
              owner:
                "fribot-labs",

              name:
                "tandem-pbl-starter-template",

              fullName:
                "fribot-labs/tandem-pbl-starter-template",

              defaultBranch:
                "main",

              htmlUrl:
                "https://github.com/fribot-labs/tandem-pbl-starter-template",
            },
          });

        const result =
          normalizeRepositoryMetadata({
            projectIdentity,

            manifest:
              createManifest({
                title:
                  null,
              }),

            discoveredAt:
              "2026-08-07T14:00:00.000Z",
          });

        expect(
          result.title
        ).toBe(
          "tandem-pbl-starter-template"
        );
      }
    );

    it(
      "preserves nullable manifest fields",
      () => {
        const result =
          normalizeRepositoryMetadata({
            projectIdentity:
              createProjectIdentity(),

            manifest:
              createManifest({
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
              }),

            discoveredAt:
              "2026-08-07T15:00:00.000Z",
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

        expect(
          result.title
        ).toBe(
          "fribot-learning"
        );
      }
    );

    it(
      "accepts zero estimatedWeeks under the current v1 contract",
      () => {
        const result =
          normalizeRepositoryMetadata({
            projectIdentity:
              createProjectIdentity(),

            manifest:
              createManifest({
                estimatedWeeks:
                  0,
              }),

            discoveredAt:
              "2026-08-07T16:00:00.000Z",
          });

        expect(
          result.estimatedWeeks
        ).toBe(
          0
        );
      }
    );

    it(
      "uses the supplied discoveredAt for both timestamps",
      () => {
        const discoveredAt =
          "2026-08-07T17:00:00.000Z";

        const result =
          normalizeRepositoryMetadata({
            projectIdentity:
              createProjectIdentity(),

            manifest:
              createManifest(),

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
      "normalizes discoveredAt to ISO format",
      () => {
        const result =
          normalizeRepositoryMetadata({
            projectIdentity:
              createProjectIdentity(),

            manifest:
              createManifest(),

            discoveredAt:
              "2026-08-07T19:00:00+09:00",
          });

        expect(
          result.discoveredAt
        ).toBe(
          "2026-08-07T10:00:00.000Z"
        );

        expect(
          result.updatedAt
        ).toBe(
          "2026-08-07T10:00:00.000Z"
        );
      }
    );

    it(
      "throws when discoveredAt is invalid",
      () => {
        expect(() =>
          normalizeRepositoryMetadata({
            projectIdentity:
              createProjectIdentity(),

            manifest:
              createManifest(),

            discoveredAt:
              "not-a-valid-date",
          })
        ).toThrow(
          "Repository metadata requires a valid discoveredAt value."
        );
      }
    );

    it(
      "does not use the manifest schemaVersion as Runtime metadataVersion",
      () => {
        const result =
          normalizeRepositoryMetadata({
            projectIdentity:
              createProjectIdentity(),

            manifest:
              createManifest(),

            discoveredAt:
              "2026-08-07T18:00:00.000Z",
          });

        expect(
          result.metadataVersion
        ).toBe(
          "v1"
        );

        expect(
          result.source
        ).toBe(
          "pbl-manifest"
        );
      }
    );
  }
);