import {
    describe,
    expect,
    it,
} from "vitest";

import {
    parseRepositoryMetadataManifest,
} from "../parseRepositoryMetadataManifest";

describe(
  "parseRepositoryMetadataManifest",
  () => {
    it(
      "parses a valid v1 PBL manifest",
      () => {
        const result =
          parseRepositoryMetadataManifest({
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
          });

        expect(
          result
        ).toEqual({
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
        });
      }
    );

    it(
      "accepts nullable manifest fields",
      () => {
        const result =
          parseRepositoryMetadataManifest({
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
          });

        expect(
          result
        ).toEqual({
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
        });
      }
    );

    it(
      "normalizes surrounding whitespace in string fields",
      () => {
        const result =
          parseRepositoryMetadataManifest({
            schemaVersion:
              "v1",

            templateId:
              "  fribot-learning  ",

            courseId:
              "  robotics-core  ",

            title:
              "  Fribot Learning  ",

            difficulty:
              "  beginner  ",

            estimatedWeeks:
              6,

            learningGoal:
              "  Learn through a robotics project.  ",
          });

        expect(
          result.templateId
        ).toBe(
          "fribot-learning"
        );

        expect(
          result.courseId
        ).toBe(
          "robotics-core"
        );

        expect(
          result.title
        ).toBe(
          "Fribot Learning"
        );

        expect(
          result.difficulty
        ).toBe(
          "beginner"
        );

        expect(
          result.learningGoal
        ).toBe(
          "Learn through a robotics project."
        );
      }
    );

    it(
      "normalizes empty string fields to null",
      () => {
        const result =
          parseRepositoryMetadataManifest({
            schemaVersion:
              "v1",

            templateId:
              "",

            courseId:
              "   ",

            title:
              "",

            difficulty:
              "   ",

            estimatedWeeks:
              null,

            learningGoal:
              "",
          });

        expect(
          result.templateId
        ).toBeNull();

        expect(
          result.courseId
        ).toBeNull();

        expect(
          result.title
        ).toBeNull();

        expect(
          result.difficulty
        ).toBeNull();

        expect(
          result.learningGoal
        ).toBeNull();
      }
    );

    it(
      "accepts zero estimatedWeeks under the current v1 contract",
      () => {
        const result =
          parseRepositoryMetadataManifest({
            schemaVersion:
              "v1",

            templateId:
              null,

            courseId:
              null,

            title:
              "Prototype Project",

            difficulty:
              null,

            estimatedWeeks:
              0,

            learningGoal:
              null,
          });

        expect(
          result.estimatedWeeks
        ).toBe(
          0
        );
      }
    );

    it(
      "accepts a positive estimatedWeeks value",
      () => {
        const result =
          parseRepositoryMetadataManifest({
            schemaVersion:
              "v1",

            templateId:
              null,

            courseId:
              null,

            title:
              "Six Week Project",

            difficulty:
              "beginner",

            estimatedWeeks:
              6,

            learningGoal:
              null,
          });

        expect(
          result.estimatedWeeks
        ).toBe(
          6
        );
      }
    );

    it(
      "rejects non-object manifest values",
      () => {
        expect(() =>
          parseRepositoryMetadataManifest(
            "invalid-manifest"
          )
        ).toThrow(
          "PBL manifest must be an object."
        );
      }
    );

    it(
      "rejects null manifest values",
      () => {
        expect(() =>
          parseRepositoryMetadataManifest(
            null
          )
        ).toThrow(
          "PBL manifest must be an object."
        );
      }
    );

    it(
      "rejects array manifest values",
      () => {
        expect(() =>
          parseRepositoryMetadataManifest(
            []
          )
        ).toThrow(
          "PBL manifest must be an object."
        );
      }
    );

    it(
      "rejects a manifest with a missing schemaVersion",
      () => {
        expect(() =>
          parseRepositoryMetadataManifest({
            templateId:
              "fribot-learning",

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
        ).toThrow(
          "Unsupported PBL manifest schemaVersion."
        );
      }
    );

    it(
      "rejects an unsupported schemaVersion",
      () => {
        expect(() =>
          parseRepositoryMetadataManifest({
            schemaVersion:
              "v2",

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
        ).toThrow(
          "Unsupported PBL manifest schemaVersion."
        );
      }
    );

    it(
      "rejects a non-string templateId",
      () => {
        expect(() =>
          parseRepositoryMetadataManifest({
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
        ).toThrow(
          "PBL manifest string field is invalid."
        );
      }
    );

    it(
      "rejects a non-string courseId",
      () => {
        expect(() =>
          parseRepositoryMetadataManifest({
            schemaVersion:
              "v1",

            templateId:
              null,

            courseId:
              false,

            title:
              null,

            difficulty:
              null,

            estimatedWeeks:
              null,

            learningGoal:
              null,
          })
        ).toThrow(
          "PBL manifest string field is invalid."
        );
      }
    );

    it(
      "rejects a non-string title",
      () => {
        expect(() =>
          parseRepositoryMetadataManifest({
            schemaVersion:
              "v1",

            templateId:
              null,

            courseId:
              null,

            title:
              123,

            difficulty:
              null,

            estimatedWeeks:
              null,

            learningGoal:
              null,
          })
        ).toThrow(
          "PBL manifest string field is invalid."
        );
      }
    );

    it(
      "rejects a non-string difficulty",
      () => {
        expect(() =>
          parseRepositoryMetadataManifest({
            schemaVersion:
              "v1",

            templateId:
              null,

            courseId:
              null,

            title:
              null,

            difficulty:
              {
                level:
                  "beginner",
              },

            estimatedWeeks:
              null,

            learningGoal:
              null,
          })
        ).toThrow(
          "PBL manifest string field is invalid."
        );
      }
    );

    it(
      "rejects a non-string learningGoal",
      () => {
        expect(() =>
          parseRepositoryMetadataManifest({
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
              [
                "goal"
              ],
          })
        ).toThrow(
          "PBL manifest string field is invalid."
        );
      }
    );

    it(
      "rejects a negative estimatedWeeks value",
      () => {
        expect(() =>
          parseRepositoryMetadataManifest({
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
        ).toThrow(
          "PBL manifest estimatedWeeks is invalid."
        );
      }
    );

    it(
      "rejects a string estimatedWeeks value",
      () => {
        expect(() =>
          parseRepositoryMetadataManifest({
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
              "6",

            learningGoal:
              null,
          })
        ).toThrow(
          "PBL manifest estimatedWeeks is invalid."
        );
      }
    );

    it(
      "rejects an infinite estimatedWeeks value",
      () => {
        expect(() =>
          parseRepositoryMetadataManifest({
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
              Number.POSITIVE_INFINITY,

            learningGoal:
              null,
          })
        ).toThrow(
          "PBL manifest estimatedWeeks is invalid."
        );
      }
    );

    it(
      "rejects a NaN estimatedWeeks value",
      () => {
        expect(() =>
          parseRepositoryMetadataManifest({
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
              Number.NaN,

            learningGoal:
              null,
          })
        ).toThrow(
          "PBL manifest estimatedWeeks is invalid."
        );
      }
    );
  }
);