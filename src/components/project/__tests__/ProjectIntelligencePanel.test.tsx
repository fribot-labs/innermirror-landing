import {
    render,
    screen,
} from "@testing-library/react";

import {
    describe,
    expect,
    it,
} from "vitest";

import type {
    RuntimeProjectIntelligence,
} from "../../../project-intelligence/runtimeProjectIntelligenceTypes";

import {
    ProjectIntelligencePanel,
} from "../ProjectIntelligencePanel";

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
  "ProjectIntelligencePanel",
  () => {
    it(
      "renders nothing when intelligence is null",
      () => {
        const {
          container,
        } = render(
          <ProjectIntelligencePanel
            intelligence={
              null
            }
          />
        );

        expect(
          container.firstChild
        ).toBeNull();
      }
    );

    it(
      "renders the project intelligence title",
      () => {
        const intelligence =
          createIntelligence();

        render(
          <ProjectIntelligencePanel
            intelligence={
              intelligence
            }
          />
        );

        expect(
          screen.getByText(
            "Project Intelligence"
          )
        ).toBeTruthy();

        expect(
          screen.getByRole(
            "heading",
            {
              name:
                "fribot-learning",
            }
          )
        ).toBeTruthy();
      }
    );

    it(
      "renders PBL for a PBL project",
      () => {
        render(
          <ProjectIntelligencePanel
            intelligence={
              createIntelligence({
                projectKind:
                  "pbl",
              })
            }
          />
        );

        expect(
          screen.getByText(
            "Project Type"
          )
        ).toBeTruthy();

        expect(
          screen.getByText(
            "PBL"
          )
        ).toBeTruthy();
      }
    );

    it(
      "renders General for a general project",
      () => {
        render(
          <ProjectIntelligencePanel
            intelligence={
              createIntelligence({
                projectKind:
                  "general",
              })
            }
          />
        );

        expect(
          screen.getByText(
            "General"
          )
        ).toBeTruthy();
      }
    );

    it(
      "renders Unfocused when readiness is unfocused",
      () => {
        render(
          <ProjectIntelligencePanel
            intelligence={
              createIntelligence({
                readiness:
                  "unfocused",

                currentFocus:
                  null,
              })
            }
          />
        );

        expect(
          screen.getByText(
            "Unfocused"
          )
        ).toBeTruthy();
      }
    );

    it(
      "renders Ready when readiness is ready",
      () => {
        render(
          <ProjectIntelligencePanel
            intelligence={
              createIntelligence({
                readiness:
                  "ready",

                currentFocus:
                  "Runtime Metadata UI",

                summary:
                  "fribot-learning is selected as the current learning project. The current focus is Runtime Metadata UI.",
              })
            }
          />
        );

        expect(
          screen.getByText(
            "Ready"
          )
        ).toBeTruthy();
      }
    );

    it(
      "renders Not defined when current focus is null",
      () => {
        render(
          <ProjectIntelligencePanel
            intelligence={
              createIntelligence({
                currentFocus:
                  null,

                readiness:
                  "unfocused",
              })
            }
          />
        );

        expect(
          screen.getByText(
            "Current Focus"
          )
        ).toBeTruthy();

        expect(
          screen.getByText(
            "Not defined"
          )
        ).toBeTruthy();
      }
    );

    it(
      "renders the current project focus when available",
      () => {
        render(
          <ProjectIntelligencePanel
            intelligence={
              createIntelligence({
                currentFocus:
                  "Runtime Metadata UI",

                readiness:
                  "ready",
              })
            }
          />
        );

        expect(
          screen.getByText(
            "Runtime Metadata UI"
          )
        ).toBeTruthy();
      }
    );

    it(
      "renders the intelligence summary without changing it",
      () => {
        const summary =
          "Dual MCU Robotics is a learning project with beginner difficulty and an estimated duration of 6 weeks. The current focus is motor synchronization.";

        render(
          <ProjectIntelligencePanel
            intelligence={
              createIntelligence({
                title:
                  "Dual MCU Robotics",

                source:
                  "pbl-manifest",

                difficulty:
                  "beginner",

                estimatedWeeks:
                  6,

                currentFocus:
                  "motor synchronization",

                readiness:
                  "ready",

                summary,
              })
            }
          />
        );

        expect(
          screen.getByText(
            "Summary"
          )
        ).toBeTruthy();

        expect(
          screen.getByText(
            summary
          )
        ).toBeTruthy();
      }
    );

    it(
      "renders updated intelligence when rerendered",
      () => {
        const {
          rerender,
        } = render(
          <ProjectIntelligencePanel
            intelligence={
              createIntelligence()
            }
          />
        );

        expect(
          screen.getByRole(
            "heading",
            {
              name:
                "fribot-learning",
            }
          )
        ).toBeTruthy();

        expect(
          screen.getByText(
            "Unfocused"
          )
        ).toBeTruthy();

        rerender(
          <ProjectIntelligencePanel
            intelligence={
              createIntelligence({
                projectId:
                  "github:fribot-labs:tandem-robotics-docs",

                title:
                  "tandem-robotics-docs",

                projectKind:
                  "general",

                currentFocus:
                  "Review robotics documentation",

                readiness:
                  "ready",

                summary:
                  "tandem-robotics-docs is selected as the current learning project. The current focus is Review robotics documentation.",
              })
            }
          />
        );

        expect(
          screen.queryByRole(
            "heading",
            {
              name:
                "fribot-learning",
            }
          )
        ).toBeNull();

        expect(
          screen.getByRole(
            "heading",
            {
              name:
                "tandem-robotics-docs",
            }
          )
        ).toBeTruthy();

        expect(
          screen.getByText(
            "General"
          )
        ).toBeTruthy();

        expect(
          screen.getByText(
            "Review robotics documentation"
          )
        ).toBeTruthy();

        expect(
          screen.getByText(
            "Ready"
          )
        ).toBeTruthy();
      }
    );
  }
);