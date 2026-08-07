import {
    describe,
    expect,
    it,
} from "vitest";

import {
    createRepositoryDerivedMetadata,
} from "../createRepositoryDerivedMetadata";

import type {
    RuntimeProjectIdentity,
} from "../../project-identity/runtimeProjectIdentityTypes";

function createProjectIdentity():
  RuntimeProjectIdentity {
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
      "2026-08-07T10:00:00.000Z",
  };
}

describe(
  "createRepositoryDerivedMetadata",
  () => {
    it(
      "creates repository-derived metadata",
      () => {
        const result =
          createRepositoryDerivedMetadata({
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
            null,

          courseId:
            null,

          title:
            "fribot-learning",

          difficulty:
            null,

          estimatedWeeks:
            null,

          learningGoal:
            null,

          source:
            "repository-derived",

          discoveredAt:
            "2026-08-07T11:00:00.000Z",

          updatedAt:
            "2026-08-07T11:00:00.000Z",
        });
      }
    );

    it(
      "preserves the Runtime project id",
      () => {
        const identity =
          createProjectIdentity();

        const result =
          createRepositoryDerivedMetadata({
            projectIdentity:
              identity,

            discoveredAt:
              "2026-08-07T11:00:00.000Z",
          });

        expect(
          result.projectId
        ).toBe(
          identity.projectId
        );
      }
    );

    it(
      "uses the repository name as the metadata title",
      () => {
        const identity =
          createProjectIdentity();

        identity.repository.name =
          "robotics-learning-project";

        const result =
          createRepositoryDerivedMetadata({
            projectIdentity:
              identity,

            discoveredAt:
              "2026-08-07T11:00:00.000Z",
          });

        expect(
          result.title
        ).toBe(
          "robotics-learning-project"
        );
      }
    );

    it(
      "uses repository-derived as the metadata source",
      () => {
        const result =
          createRepositoryDerivedMetadata({
            projectIdentity:
              createProjectIdentity(),

            discoveredAt:
              "2026-08-07T11:00:00.000Z",
          });

        expect(
          result.source
        ).toBe(
          "repository-derived"
        );
      }
    );

    it(
      "leaves PBL-specific metadata fields null",
      () => {
        const result =
          createRepositoryDerivedMetadata({
            projectIdentity:
              createProjectIdentity(),

            discoveredAt:
              "2026-08-07T11:00:00.000Z",
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
      "uses the same timestamp for discoveredAt and updatedAt",
      () => {
        const result =
          createRepositoryDerivedMetadata({
            projectIdentity:
              createProjectIdentity(),

            discoveredAt:
              "2026-08-07T11:00:00.000Z",
          });

        expect(
          result.discoveredAt
        ).toBe(
          result.updatedAt
        );
      }
    );

    it(
      "normalizes a valid discoveredAt value to ISO format",
      () => {
        const result =
          createRepositoryDerivedMetadata({
            projectIdentity:
              createProjectIdentity(),

            discoveredAt:
              "2026-08-07T20:00:00+09:00",
          });

        expect(
          result.discoveredAt
        ).toBe(
          "2026-08-07T11:00:00.000Z"
        );

        expect(
          result.updatedAt
        ).toBe(
          "2026-08-07T11:00:00.000Z"
        );
      }
    );

    it(
      "creates a valid ISO timestamp when discoveredAt is omitted",
      () => {
        const before =
          Date.now();

        const result =
          createRepositoryDerivedMetadata({
            projectIdentity:
              createProjectIdentity(),
          });

        const after =
          Date.now();

        const timestamp =
          Date.parse(
            result.discoveredAt
          );

        expect(
          Number.isNaN(
            timestamp
          )
        ).toBe(
          false
        );

        expect(
          timestamp
        ).toBeGreaterThanOrEqual(
          before
        );

        expect(
          timestamp
        ).toBeLessThanOrEqual(
          after
        );

        expect(
          result.updatedAt
        ).toBe(
          result.discoveredAt
        );
      }
    );

    it(
      "throws when discoveredAt is invalid",
      () => {
        expect(
          () =>
            createRepositoryDerivedMetadata({
              projectIdentity:
                createProjectIdentity(),

              discoveredAt:
                "not-a-date",
            })
        ).toThrow(
          "Repository-derived metadata requires a valid discoveredAt value."
        );
      }
    );

    it(
      "does not mutate the Runtime Project Identity",
      () => {
        const identity =
          createProjectIdentity();

        const originalIdentity =
          structuredClone(
            identity
          );

        createRepositoryDerivedMetadata({
          projectIdentity:
            identity,

          discoveredAt:
            "2026-08-07T11:00:00.000Z",
        });

        expect(
          identity
        ).toEqual(
          originalIdentity
        );
      }
    );

    it(
      "supports a general repository project kind",
      () => {
        const identity =
          createProjectIdentity();

        identity.kind =
          "general";

        const result =
          createRepositoryDerivedMetadata({
            projectIdentity:
              identity,

            discoveredAt:
              "2026-08-07T11:00:00.000Z",
          });

        expect(
          result.source
        ).toBe(
          "repository-derived"
        );

        expect(
          result.projectId
        ).toBe(
          identity.projectId
        );

        expect(
          result.title
        ).toBe(
          "fribot-learning"
        );
      }
    );

    it(
      "does not derive unsupported PBL information from repository identity",
      () => {
        const identity =
          createProjectIdentity();

        identity.repository.name =
          "advanced-robotics-12-week-course";

        const result =
          createRepositoryDerivedMetadata({
            projectIdentity:
              identity,

            discoveredAt:
              "2026-08-07T11:00:00.000Z",
          });

        expect(
          result.title
        ).toBe(
          "advanced-robotics-12-week-course"
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
      }
    );
  }
);