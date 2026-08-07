import {
    describe,
    expect,
    it,
} from "vitest";

import {
    createRuntimeProjectIntelligence,
} from "../createRuntimeProjectIntelligence";

import type {
    RuntimeProjectContext,
} from "../../project-context/runtimeProjectContextTypes";

import type {
    RuntimeProjectMetadata,
} from "../../project-metadata/runtimeProjectMetadataTypes";

function createMetadata():
  RuntimeProjectMetadata {
  return {
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
      "2026-08-07T10:00:00.000Z",

    updatedAt:
      "2026-08-07T10:00:00.000Z",
  };
}

function createContext():
  RuntimeProjectContext {
  return {
    contextVersion:
      "v1",

    projectId:
      "github:fribot-labs:fribot-learning",

    kind:
      "pbl",

    learningMode:
      "project-based-learning",

    learningStage:
      "not-defined",

    goal:
      null,

    currentMilestone:
      null,

    source:
      "repository-derived",

    createdAt:
      "2026-08-07T10:00:00.000Z",

    updatedAt:
      "2026-08-07T10:00:00.000Z",
  };
}

describe(
  "createRuntimeProjectIntelligence",
  () => {
    it(
      "creates Project Intelligence from Metadata and Context",
      () => {
        const result =
          createRuntimeProjectIntelligence({
            metadata:
              createMetadata(),

            context:
              createContext(),

            createdAt:
              "2026-08-07T11:00:00.000Z",
          });

        expect(
          result
        ).toEqual({
          intelligenceVersion:
            "v1",

          projectId:
            "github:fribot-labs:fribot-learning",

          title:
            "fribot-learning",

          source:
            "repository-derived",

          projectKind:
            "pbl",

          difficulty:
            null,

          estimatedWeeks:
            null,

          learningGoal:
            null,

          currentFocus:
            null,

          readiness:
            "unfocused",

          summary:
            "fribot-learning is selected as the current learning project. A current project focus has not been defined yet.",

          createdAt:
            "2026-08-07T11:00:00.000Z",
        });
      }
    );

    it(
      "returns unfocused when currentFocus is null",
      () => {
        const result =
          createRuntimeProjectIntelligence({
            metadata:
              createMetadata(),

            context:
              createContext(),

            currentFocus:
              null,

            createdAt:
              "2026-08-07T11:00:00.000Z",
          });

        expect(
          result.currentFocus
        ).toBeNull();

        expect(
          result.readiness
        ).toBe(
          "unfocused"
        );
      }
    );

    it(
      "returns unfocused when currentFocus is empty",
      () => {
        const result =
          createRuntimeProjectIntelligence({
            metadata:
              createMetadata(),

            context:
              createContext(),

            currentFocus:
              "   ",

            createdAt:
              "2026-08-07T11:00:00.000Z",
          });

        expect(
          result.currentFocus
        ).toBeNull();

        expect(
          result.readiness
        ).toBe(
          "unfocused"
        );
      }
    );

    it(
      "returns ready when currentFocus is provided",
      () => {
        const result =
          createRuntimeProjectIntelligence({
            metadata:
              createMetadata(),

            context:
              createContext(),

            currentFocus:
              "Motor synchronization",

            createdAt:
              "2026-08-07T11:00:00.000Z",
          });

        expect(
          result.currentFocus
        ).toBe(
          "Motor synchronization"
        );

        expect(
          result.readiness
        ).toBe(
          "ready"
        );
      }
    );

    it(
      "trims currentFocus",
      () => {
        const result =
          createRuntimeProjectIntelligence({
            metadata:
              createMetadata(),

            context:
              createContext(),

            currentFocus:
              "  Runtime Metadata UI  ",

            createdAt:
              "2026-08-07T11:00:00.000Z",
          });

        expect(
          result.currentFocus
        ).toBe(
          "Runtime Metadata UI"
        );
      }
    );

    it(
      "includes current focus in the summary when ready",
      () => {
        const result =
          createRuntimeProjectIntelligence({
            metadata:
              createMetadata(),

            context:
              createContext(),

            currentFocus:
              "Motor synchronization",

            createdAt:
              "2026-08-07T11:00:00.000Z",
          });

        expect(
          result.summary
        ).toBe(
          "fribot-learning is selected as the current learning project. The current focus is Motor synchronization."
        );
      }
    );

    it(
      "preserves PBL manifest metadata",
      () => {
        const metadata =
          createMetadata();

        metadata.source =
          "pbl-manifest";

        metadata.title =
          "Dual MCU Robotics";

        metadata.difficulty =
          "beginner";

        metadata.estimatedWeeks =
          6;

        metadata.learningGoal =
          "Understand how two microcontrollers divide responsibilities.";

        const result =
          createRuntimeProjectIntelligence({
            metadata,

            context:
              createContext(),

            currentFocus:
              "Motor synchronization",

            createdAt:
              "2026-08-07T11:00:00.000Z",
          });

        expect(
          result.source
        ).toBe(
          "pbl-manifest"
        );

        expect(
          result.title
        ).toBe(
          "Dual MCU Robotics"
        );

        expect(
          result.difficulty
        ).toBe(
          "beginner"
        );

        expect(
          result.estimatedWeeks
        ).toBe(
          6
        );

        expect(
          result.learningGoal
        ).toBe(
          "Understand how two microcontrollers divide responsibilities."
        );
      }
    );

    it(
      "builds a summary from PBL manifest metadata",
      () => {
        const metadata =
          createMetadata();

        metadata.source =
          "pbl-manifest";

        metadata.title =
          "Dual MCU Robotics";

        metadata.difficulty =
          "beginner";

        metadata.estimatedWeeks =
          6;

        metadata.learningGoal =
          "Understand how two microcontrollers divide responsibilities.";

        const result =
          createRuntimeProjectIntelligence({
            metadata,

            context:
              createContext(),

            currentFocus:
              "Motor synchronization",

            createdAt:
              "2026-08-07T11:00:00.000Z",
          });

        expect(
          result.summary
        ).toBe(
          "Dual MCU Robotics is a learning project with beginner difficulty and an estimated duration of 6 weeks. The learning goal is Understand how two microcontrollers divide responsibilities.. The current focus is Motor synchronization."
        );
      }
    );

    it(
      "preserves the Context project kind",
      () => {
        const context =
          createContext();

        context.kind =
          "general";

        const result =
          createRuntimeProjectIntelligence({
            metadata:
              createMetadata(),

            context,

            createdAt:
              "2026-08-07T11:00:00.000Z",
          });

        expect(
          result.projectKind
        ).toBe(
          "general"
        );
      }
    );

    it(
      "preserves the Metadata project id",
      () => {
        const metadata =
          createMetadata();

        const result =
          createRuntimeProjectIntelligence({
            metadata,

            context:
              createContext(),

            createdAt:
              "2026-08-07T11:00:00.000Z",
          });

        expect(
          result.projectId
        ).toBe(
          metadata.projectId
        );
      }
    );

    it(
      "throws when Metadata and Context reference different projects",
      () => {
        const context =
          createContext();

        context.projectId =
          "github:fribot-labs:another-project";

        expect(
          () =>
            createRuntimeProjectIntelligence({
              metadata:
                createMetadata(),

              context,

              createdAt:
                "2026-08-07T11:00:00.000Z",
            })
        ).toThrow(
          "Project Intelligence requires Metadata and Context to reference the same project."
        );
      }
    );

    it(
      "throws when Metadata projectId is empty",
      () => {
        const metadata =
          createMetadata();

        metadata.projectId =
          "   ";

        expect(
          () =>
            createRuntimeProjectIntelligence({
              metadata,

              context:
                createContext(),

              createdAt:
                "2026-08-07T11:00:00.000Z",
            })
        ).toThrow(
          "Project Intelligence requires a valid projectId."
        );
      }
    );

    it(
      "throws when Context projectId is empty",
      () => {
        const context =
          createContext();

        context.projectId =
          "   ";

        expect(
          () =>
            createRuntimeProjectIntelligence({
              metadata:
                createMetadata(),

              context,

              createdAt:
                "2026-08-07T11:00:00.000Z",
            })
        ).toThrow(
          "Project Intelligence requires a valid projectId."
        );
      }
    );

    it(
      "uses Untitled project when metadata title is null",
      () => {
        const metadata =
          createMetadata();

        metadata.title =
          null;

        const result =
          createRuntimeProjectIntelligence({
            metadata,

            context:
              createContext(),

            createdAt:
              "2026-08-07T11:00:00.000Z",
          });

        expect(
          result.title
        ).toBe(
          "Untitled project"
        );

        expect(
          result.summary
        ).toContain(
          "Untitled project"
        );
      }
    );

    it(
      "uses Untitled project when metadata title contains only whitespace",
      () => {
        const metadata =
          createMetadata();

        metadata.title =
          "   ";

        const result =
          createRuntimeProjectIntelligence({
            metadata,

            context:
              createContext(),

            createdAt:
              "2026-08-07T11:00:00.000Z",
          });

        expect(
          result.title
        ).toBe(
          "Untitled project"
        );
      }
    );

    it(
      "trims metadata title",
      () => {
        const metadata =
          createMetadata();

        metadata.title =
          "  Dual MCU Robotics  ";

        const result =
          createRuntimeProjectIntelligence({
            metadata,

            context:
              createContext(),

            createdAt:
              "2026-08-07T11:00:00.000Z",
          });

        expect(
          result.title
        ).toBe(
          "Dual MCU Robotics"
        );
      }
    );

    it(
      "normalizes createdAt to ISO format",
      () => {
        const result =
          createRuntimeProjectIntelligence({
            metadata:
              createMetadata(),

            context:
              createContext(),

            createdAt:
              "2026-08-07T20:00:00+09:00",
          });

        expect(
          result.createdAt
        ).toBe(
          "2026-08-07T11:00:00.000Z"
        );
      }
    );

    it(
      "creates a valid timestamp when createdAt is omitted",
      () => {
        const before =
          Date.now();

        const result =
          createRuntimeProjectIntelligence({
            metadata:
              createMetadata(),

            context:
              createContext(),
          });

        const after =
          Date.now();

        const timestamp =
          Date.parse(
            result.createdAt
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
      }
    );

    it(
      "throws when createdAt is invalid",
      () => {
        expect(
          () =>
            createRuntimeProjectIntelligence({
              metadata:
                createMetadata(),

              context:
                createContext(),

              createdAt:
                "not-a-date",
            })
        ).toThrow(
          "Project Intelligence requires a valid createdAt value."
        );
      }
    );

    it(
      "does not mutate Metadata or Context",
      () => {
        const metadata =
          createMetadata();

        const context =
          createContext();

        const originalMetadata =
          structuredClone(
            metadata
          );

        const originalContext =
          structuredClone(
            context
          );

        createRuntimeProjectIntelligence({
          metadata,
          context,

          currentFocus:
            "Motor synchronization",

          createdAt:
            "2026-08-07T11:00:00.000Z",
        });

        expect(
          metadata
        ).toEqual(
          originalMetadata
        );

        expect(
          context
        ).toEqual(
          originalContext
        );
      }
    );

    it(
      "does not invent missing PBL metadata",
      () => {
        const result =
          createRuntimeProjectIntelligence({
            metadata:
              createMetadata(),

            context:
              createContext(),

            currentFocus:
              "Explore architecture",

            createdAt:
              "2026-08-07T11:00:00.000Z",
          });

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