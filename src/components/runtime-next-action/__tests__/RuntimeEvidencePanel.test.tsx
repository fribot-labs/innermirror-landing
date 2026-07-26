import {
    fireEvent,
    render,
    screen,
} from "@testing-library/react";

import {
    describe,
    expect,
    it,
} from "vitest";

import type {
    RuntimeEvidenceExplanation,
    RuntimeEvidenceGroup,
    RuntimeEvidenceItem,
} from "../../../runtime-next-action/runtimeEvidenceTypes";

import {
    RuntimeEvidencePanel,
} from "../RuntimeEvidencePanel";

function createEvidenceItem(
  overrides: Partial<
    RuntimeEvidenceItem
  > = {}
): RuntimeEvidenceItem {
  return {
    id:
      "primary-stability",

    label:
      "Stability",

    value:
      "Stable",

    description:
      "The recommendation remained consistent across recent observations.",

    source:
      "adaptive-coaching",

    importance:
      "primary",

    ...overrides,
  };
}

function createEvidenceGroup(
  overrides: Partial<
    RuntimeEvidenceGroup
  > = {}
): RuntimeEvidenceGroup {
  return {
    id:
      "primary-recommendation",

    title:
      "The current recommendation remains stable.",

    description:
      "The selected action is directly supported by the latest Runtime state.",

    items: [
      createEvidenceItem(),
    ],

    ...overrides,
  };
}

function createEvidence(
  overrides: Partial<
    RuntimeEvidenceExplanation
  > = {}
): RuntimeEvidenceExplanation {
  return {
    summary:
      "Runtime found supporting evidence for this recommendation.",

    primary:
      createEvidenceGroup(),

    supporting: [
      createEvidenceGroup({
        id:
          "supporting-continuity",

        title:
          "Continuity supports the same direction.",

        description:
          "Recent project activity remains aligned with the recommendation.",

        items: [
          createEvidenceItem({
            id:
              "supporting-continuity-score",

            label:
              "Continuity",

            value:
              0.84,

            description:
              "The project direction remains coherent across recent observations.",

            source:
              "continuity",

            importance:
              "supporting",
          }),
        ],
      }),
    ],

    context: [
      createEvidenceGroup({
        id:
          "context-github",

        title:
          "Recent GitHub activity is available.",

        description:
          "The recommendation includes the latest project snapshot.",

        items: [
          createEvidenceItem({
            id:
              "context-github-available",

            label:
              "GitHub snapshot",

            value:
              true,

            description:
              "Recent repository activity was included in the recommendation.",

            source:
              "github-snapshot",

            importance:
              "context",
          }),
        ],
      }),
    ],

    disclosure:
      "structured",

    ...overrides,
  };
}

function expandEvidence(): void {
  fireEvent.click(
    screen.getByRole(
      "button",
      {
        name:
          "View recommendation evidence",
      }
    )
  );
}

describe(
  "RuntimeEvidencePanel",
  () => {
    it(
      "renders nothing when evidence is unavailable",
      () => {
        const {
          container,
        } = render(
          <RuntimeEvidencePanel
            evidence={undefined}
          />
        );

        expect(
          container
        ).toBeEmptyDOMElement();
      }
    );

    it(
      "renders the recommendation evidence region",
      () => {
        render(
          <RuntimeEvidencePanel
            evidence={
              createEvidence()
            }
          />
        );

        expect(
          screen.getByRole(
            "region",
            {
              name:
                "Evidence behind this recommendation",
            }
          )
        ).toBeInTheDocument();
      }
    );

    it(
      "renders the evidence summary",
      () => {
        render(
          <RuntimeEvidencePanel
            evidence={
              createEvidence()
            }
          />
        );

        expect(
          screen.getByText(
            "Runtime found supporting evidence for this recommendation."
          )
        ).toBeInTheDocument();
      }
    );

    it(
      "counts all evidence items across primary, supporting, and context groups",
      () => {
        render(
          <RuntimeEvidencePanel
            evidence={
              createEvidence()
            }
          />
        );

        expect(
          screen.getByText(
            "3 signals"
          )
        ).toBeInTheDocument();
      }
    );

    it(
      "uses the singular signal label when only one evidence item exists",
      () => {
        render(
          <RuntimeEvidencePanel
            evidence={
              createEvidence({
                supporting: [],
                context: [],
              })
            }
          />
        );

        expect(
          screen.getByText(
            "1 signal"
          )
        ).toBeInTheDocument();
      }
    );

    it(
      "keeps the evidence details collapsed initially",
      () => {
        render(
          <RuntimeEvidencePanel
            evidence={
              createEvidence()
            }
          />
        );

        expect(
          screen.queryByText(
            "Primary evidence"
          )
        ).not.toBeInTheDocument();

        expect(
          screen.queryByText(
            "Supporting evidence"
          )
        ).not.toBeInTheDocument();

        expect(
          screen.queryByText(
            "Project context"
          )
        ).not.toBeInTheDocument();
      }
    );

    it(
      "starts with aria-expanded set to false",
      () => {
        render(
          <RuntimeEvidencePanel
            evidence={
              createEvidence()
            }
          />
        );

        expect(
          screen.getByRole(
            "button",
            {
              name:
                "View recommendation evidence",
            }
          )
        ).toHaveAttribute(
          "aria-expanded",
          "false"
        );
      }
    );

    it(
      "renders the primary evidence when expanded",
      () => {
        render(
          <RuntimeEvidencePanel
            evidence={
              createEvidence()
            }
          />
        );

        expandEvidence();

        expect(
          screen.getByText(
            "Primary evidence"
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "The current recommendation remains stable."
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "The selected action is directly supported by the latest Runtime state."
          )
        ).toBeInTheDocument();
      }
    );

    it(
      "renders supporting evidence when expanded",
      () => {
        render(
          <RuntimeEvidencePanel
            evidence={
              createEvidence()
            }
          />
        );

        expandEvidence();

        expect(
          screen.getByText(
            "Supporting evidence"
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "Continuity supports the same direction."
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "Recent project activity remains aligned with the recommendation."
          )
        ).toBeInTheDocument();
      }
    );

    it(
      "renders project context evidence when expanded",
      () => {
        render(
          <RuntimeEvidencePanel
            evidence={
              createEvidence()
            }
          />
        );

        expandEvidence();

        expect(
          screen.getByText(
            "Project context"
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "Recent GitHub activity is available."
          )
        ).toBeInTheDocument();
      }
    );

    it(
      "renders string evidence values",
      () => {
        render(
          <RuntimeEvidencePanel
            evidence={
              createEvidence()
            }
          />
        );

        expandEvidence();

        expect(
          screen.getByText(
            "Stable"
          )
        ).toBeInTheDocument();
      }
    );

    it(
      "renders number evidence values",
      () => {
        render(
          <RuntimeEvidencePanel
            evidence={
              createEvidence()
            }
          />
        );

        expandEvidence();

        expect(
          screen.getByText(
            "0.84"
          )
        ).toBeInTheDocument();
      }
    );

    it(
      "formats a true boolean evidence value as Available",
      () => {
        render(
          <RuntimeEvidencePanel
            evidence={
              createEvidence()
            }
          />
        );

        expandEvidence();

        expect(
          screen.getByText(
            "Available"
          )
        ).toBeInTheDocument();
      }
    );

    it(
      "formats a false boolean evidence value as Not available",
      () => {
        render(
          <RuntimeEvidencePanel
            evidence={
              createEvidence({
                context: [
                  createEvidenceGroup({
                    id:
                      "context-github-unavailable",

                    title:
                      "GitHub activity is unavailable.",

                    description:
                      "The latest project snapshot could not be included.",

                    items: [
                      createEvidenceItem({
                        id:
                          "context-github-not-available",

                        label:
                          "GitHub snapshot",

                        value:
                          false,

                        description:
                          "Recent repository activity was not available.",

                        source:
                          "github-snapshot",

                        importance:
                          "context",
                      }),
                    ],
                  }),
                ],
              })
            }
          />
        );

        expandEvidence();

        expect(
          screen.getByText(
            "Not available"
          )
        ).toBeInTheDocument();
      }
    );

    it(
      "renders evidence item labels and descriptions",
      () => {
        render(
          <RuntimeEvidencePanel
            evidence={
              createEvidence()
            }
          />
        );

        expandEvidence();

        expect(
          screen.getByText(
            "Stability"
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "The recommendation remained consistent across recent observations."
          )
        ).toBeInTheDocument();
      }
    );

    it(
      "renders an empty message for a group without evidence items",
      () => {
        render(
          <RuntimeEvidencePanel
            evidence={
              createEvidence({
                primary:
                  createEvidenceGroup({
                    items: [],
                  }),

                supporting: [],
                context: [],
              })
            }
          />
        );

        expandEvidence();

        expect(
          screen.getByText(
            "No additional structured evidence is available."
          )
        ).toBeInTheDocument();
      }
    );

    it(
      "does not render supporting or context sections when their groups are empty",
      () => {
        render(
          <RuntimeEvidencePanel
            evidence={
              createEvidence({
                supporting: [],
                context: [],
              })
            }
          />
        );

        expandEvidence();

        expect(
          screen.queryByText(
            "Supporting evidence"
          )
        ).not.toBeInTheDocument();

        expect(
          screen.queryByText(
            "Project context"
          )
        ).not.toBeInTheDocument();
      }
    );

    it(
      "renders multiple supporting groups",
      () => {
        render(
          <RuntimeEvidencePanel
            evidence={
              createEvidence({
                supporting: [
                  createEvidenceGroup({
                    id:
                      "supporting-continuity",

                    title:
                      "Continuity supports the recommendation.",
                  }),

                  createEvidenceGroup({
                    id:
                      "supporting-next-question",

                    title:
                      "The next question supports the recommendation.",

                    items: [
                      createEvidenceItem({
                        id:
                          "supporting-next-question-ready",

                        label:
                          "Next question",

                        value:
                          "Ready",

                        source:
                          "next-question",

                        importance:
                          "supporting",
                      }),
                    ],
                  }),
                ],
              })
            }
          />
        );

        expandEvidence();

        expect(
          screen.getByText(
            "Continuity supports the recommendation."
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "The next question supports the recommendation."
          )
        ).toBeInTheDocument();
      }
    );

    it(
      "updates aria-expanded when evidence is expanded",
      () => {
        render(
          <RuntimeEvidencePanel
            evidence={
              createEvidence()
            }
          />
        );

        const toggleButton =
          screen.getByRole(
            "button",
            {
              name:
                "View recommendation evidence",
            }
          );

        fireEvent.click(
          toggleButton
        );

        expect(
          screen.getByRole(
            "button",
            {
              name:
                "Hide recommendation evidence",
            }
          )
        ).toHaveAttribute(
          "aria-expanded",
          "true"
        );
      }
    );

    it(
      "connects aria-controls to the expanded details element",
      () => {
        render(
          <RuntimeEvidencePanel
            evidence={
              createEvidence()
            }
          />
        );

        const toggleButton =
          screen.getByRole(
            "button",
            {
              name:
                "View recommendation evidence",
            }
          );

        const detailsId =
          toggleButton.getAttribute(
            "aria-controls"
          );

        expect(
          detailsId
        ).not.toBeNull();

        fireEvent.click(
          toggleButton
        );

        const details =
          document.getElementById(
            detailsId as string
          );

        expect(
          details
        ).toBeInTheDocument();

        expect(
          details
        ).toHaveClass(
          "runtime-evidence-panel__details"
        );
      }
    );

    it(
      "applies the expanded panel class while details are visible",
      () => {
        render(
          <RuntimeEvidencePanel
            evidence={
              createEvidence()
            }
          />
        );

        const region =
          screen.getByRole(
            "region",
            {
              name:
                "Evidence behind this recommendation",
            }
          );

        expect(
          region
        ).not.toHaveClass(
          "runtime-evidence-panel--expanded"
        );

        expandEvidence();

        expect(
          region
        ).toHaveClass(
          "runtime-evidence-panel--expanded"
        );
      }
    );

    it(
      "collapses the evidence details when the toggle is clicked again",
      () => {
        render(
          <RuntimeEvidencePanel
            evidence={
              createEvidence()
            }
          />
        );

        expandEvidence();

        fireEvent.click(
          screen.getByRole(
            "button",
            {
              name:
                "Hide recommendation evidence",
            }
          )
        );

        expect(
          screen.queryByText(
            "Primary evidence"
          )
        ).not.toBeInTheDocument();

        expect(
          screen.getByRole(
            "button",
            {
              name:
                "View recommendation evidence",
            }
          )
        ).toHaveAttribute(
          "aria-expanded",
          "false"
        );
      }
    );

    it(
      "does not expose structured evidence controls in summary disclosure mode",
      () => {
        render(
          <RuntimeEvidencePanel
            evidence={
              createEvidence({
                disclosure:
                  "summary",
              })
            }
          />
        );

        expect(
          screen.getByText(
            "Runtime found supporting evidence for this recommendation."
          )
        ).toBeInTheDocument();

        expect(
          screen.queryByRole(
            "button"
          )
        ).not.toBeInTheDocument();

        expect(
          screen.queryByText(
            "Primary evidence"
          )
        ).not.toBeInTheDocument();
      }
    );
  }
);