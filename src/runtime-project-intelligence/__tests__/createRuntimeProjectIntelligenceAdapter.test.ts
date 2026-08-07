import {
    describe,
    expect,
    it,
} from "vitest";

import type {
    RuntimeProjectIntelligence,
} from "../../project-intelligence/runtimeProjectIntelligenceTypes";

import {
    createRuntimeProjectIntelligenceAdapter,
} from "../createRuntimeProjectIntelligenceAdapter";

function createIntelligence(
  overrides: Partial<
    RuntimeProjectIntelligence
  > = {}
): RuntimeProjectIntelligence {
  return {
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
      "2026-08-08T00:00:00.000Z",

    ...overrides,
  };
}

describe(
  "createRuntimeProjectIntelligenceAdapter",
  () => {
    it(
      "creates a Runtime Project Recommendation Input",
      () => {
        const result =
          createRuntimeProjectIntelligenceAdapter({
            intelligence:
              createIntelligence(),
          });

        expect(
          result
        ).toEqual({
          adapterVersion:
            "v1",

          projectId:
            "github:fribot-labs:fribot-learning",

          projectTitle:
            "fribot-learning",

          projectKind:
            "pbl",

          metadataSource:
            "repository-derived",

          readiness:
            "unfocused",

          currentFocus:
            null,

          projectSummary:
            "fribot-learning is selected as the current learning project. A current project focus has not been defined yet.",

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
      "sets adapterVersion to v1",
      () => {
        const result =
          createRuntimeProjectIntelligenceAdapter({
            intelligence:
              createIntelligence(),
          });

        expect(
          result.adapterVersion
        ).toBe(
          "v1"
        );
      }
    );

    it(
      "preserves the project id",
      () => {
        const intelligence =
          createIntelligence({
            projectId:
              "github:fribot-labs:tandem-robotics-docs",
          });

        const result =
          createRuntimeProjectIntelligenceAdapter({
            intelligence,
          });

        expect(
          result.projectId
        ).toBe(
          intelligence.projectId
        );
      }
    );

    it(
      "maps title to projectTitle",
      () => {
        const intelligence =
          createIntelligence({
            title:
              "Dual MCU Robotics",
          });

        const result =
          createRuntimeProjectIntelligenceAdapter({
            intelligence,
          });

        expect(
          result.projectTitle
        ).toBe(
          "Dual MCU Robotics"
        );
      }
    );

    it(
      "preserves a PBL project kind",
      () => {
        const result =
          createRuntimeProjectIntelligenceAdapter({
            intelligence:
              createIntelligence({
                projectKind:
                  "pbl",
              }),
          });

        expect(
          result.projectKind
        ).toBe(
          "pbl"
        );
      }
    );

    it(
      "preserves a general project kind",
      () => {
        const result =
          createRuntimeProjectIntelligenceAdapter({
            intelligence:
              createIntelligence({
                projectKind:
                  "general",
              }),
          });

        expect(
          result.projectKind
        ).toBe(
          "general"
        );
      }
    );

    it(
      "maps repository-derived source to metadataSource",
      () => {
        const result =
          createRuntimeProjectIntelligenceAdapter({
            intelligence:
              createIntelligence({
                source:
                  "repository-derived",
              }),
          });

        expect(
          result.metadataSource
        ).toBe(
          "repository-derived"
        );
      }
    );

    it(
      "maps pbl-manifest source to metadataSource",
      () => {
        const result =
          createRuntimeProjectIntelligenceAdapter({
            intelligence:
              createIntelligence({
                source:
                  "pbl-manifest",
              }),
          });

        expect(
          result.metadataSource
        ).toBe(
          "pbl-manifest"
        );
      }
    );

    it(
      "preserves unfocused readiness",
      () => {
        const result =
          createRuntimeProjectIntelligenceAdapter({
            intelligence:
              createIntelligence({
                readiness:
                  "unfocused",
              }),
          });

        expect(
          result.readiness
        ).toBe(
          "unfocused"
        );
      }
    );

    it(
      "preserves ready readiness",
      () => {
        const result =
          createRuntimeProjectIntelligenceAdapter({
            intelligence:
              createIntelligence({
                readiness:
                  "ready",

                currentFocus:
                  "Runtime Recommendation Adapter",
              }),
          });

        expect(
          result.readiness
        ).toBe(
          "ready"
        );
      }
    );

    it(
      "preserves a null current focus",
      () => {
        const result =
          createRuntimeProjectIntelligenceAdapter({
            intelligence:
              createIntelligence({
                currentFocus:
                  null,
              }),
          });

        expect(
          result.currentFocus
        ).toBeNull();
      }
    );

    it(
      "preserves the current focus",
      () => {
        const result =
          createRuntimeProjectIntelligenceAdapter({
            intelligence:
              createIntelligence({
                currentFocus:
                  "Runtime Recommendation Adapter",
              }),
          });

        expect(
          result.currentFocus
        ).toBe(
          "Runtime Recommendation Adapter"
        );
      }
    );

    it(
      "maps summary to projectSummary",
      () => {
        const summary =
          "Dual MCU Robotics is ready to continue with motor synchronization.";

        const result =
          createRuntimeProjectIntelligenceAdapter({
            intelligence:
              createIntelligence({
                summary,
              }),
          });

        expect(
          result.projectSummary
        ).toBe(
          summary
        );
      }
    );

    it(
      "preserves difficulty",
      () => {
        const result =
          createRuntimeProjectIntelligenceAdapter({
            intelligence:
              createIntelligence({
                difficulty:
                  "beginner",
              }),
          });

        expect(
          result.difficulty
        ).toBe(
          "beginner"
        );
      }
    );

    it(
      "preserves estimatedWeeks",
      () => {
        const result =
          createRuntimeProjectIntelligenceAdapter({
            intelligence:
              createIntelligence({
                estimatedWeeks:
                  6,
              }),
          });

        expect(
          result.estimatedWeeks
        ).toBe(
          6
        );
      }
    );

    it(
      "preserves learningGoal",
      () => {
        const learningGoal =
          "Understand how two microcontrollers divide responsibilities.";

        const result =
          createRuntimeProjectIntelligenceAdapter({
            intelligence:
              createIntelligence({
                learningGoal,
              }),
          });

        expect(
          result.learningGoal
        ).toBe(
          learningGoal
        );
      }
    );

    it(
      "preserves richer PBL metadata together",
      () => {
        const result =
          createRuntimeProjectIntelligenceAdapter({
            intelligence:
              createIntelligence({
                title:
                  "Dual MCU Robotics",

                source:
                  "pbl-manifest",

                projectKind:
                  "pbl",

                difficulty:
                  "beginner",

                estimatedWeeks:
                  6,

                learningGoal:
                  "Understand dual-controller robotics architecture.",

                currentFocus:
                  "Motor synchronization",

                readiness:
                  "ready",

                summary:
                  "Dual MCU Robotics is currently focused on motor synchronization.",
              }),
          });

        expect(
          result
        ).toEqual({
          adapterVersion:
            "v1",

          projectId:
            "github:fribot-labs:fribot-learning",

          projectTitle:
            "Dual MCU Robotics",

          projectKind:
            "pbl",

          metadataSource:
            "pbl-manifest",

          readiness:
            "ready",

          currentFocus:
            "Motor synchronization",

          projectSummary:
            "Dual MCU Robotics is currently focused on motor synchronization.",

          difficulty:
            "beginner",

          estimatedWeeks:
            6,

          learningGoal:
            "Understand dual-controller robotics architecture.",
        });
      }
    );

    it(
      "does not mutate the source Intelligence object",
      () => {
        const intelligence =
          createIntelligence({
            title:
              "Dual MCU Robotics",

            currentFocus:
              "Motor synchronization",

            readiness:
              "ready",
          });

        const original =
          structuredClone(
            intelligence
          );

        createRuntimeProjectIntelligenceAdapter({
          intelligence,
        });

        expect(
          intelligence
        ).toEqual(
          original
        );
      }
    );

    it(
      "creates a new object instead of returning the Intelligence object",
      () => {
        const intelligence =
          createIntelligence();

        const result =
          createRuntimeProjectIntelligenceAdapter({
            intelligence,
          });

        expect(
          result
        ).not.toBe(
          intelligence
        );
      }
    );

    it(
      "does not expose intelligenceVersion through the Runtime boundary",
      () => {
        const result =
          createRuntimeProjectIntelligenceAdapter({
            intelligence:
              createIntelligence(),
          });

        expect(
          "intelligenceVersion" in
            result
        ).toBe(
          false
        );
      }
    );

    it(
      "does not expose createdAt through the Runtime boundary",
      () => {
        const result =
          createRuntimeProjectIntelligenceAdapter({
            intelligence:
              createIntelligence(),
          });

        expect(
          "createdAt" in
            result
        ).toBe(
          false
        );
      }
    );
  }
);