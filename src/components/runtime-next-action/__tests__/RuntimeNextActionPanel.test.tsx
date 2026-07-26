import {
    fireEvent,
    render,
    screen,
} from "@testing-library/react";

import {
    describe,
    expect,
    it,
    vi,
} from "vitest";

import type {
    RuntimeEvidenceExplanation,
    RuntimeEvidenceGroup,
    RuntimeEvidenceItem,
} from "../../../runtime-next-action/runtimeEvidenceTypes";

import type {
    RuntimeNextAction,
} from "../../../runtime-next-action/runtimeNextActionTypes";

import type {
    RuntimeWhyExplanation,
} from "../../../runtime-next-action/runtimeWhyTypes";

import {
    createRuntimeRecommendationPresentationFixture,
} from "../../../test/fixtures/runtimeRecommendationPresentationFixture";

import {
    RuntimeNextActionPanel,
} from "../RuntimeNextActionPanel";

function createWhy(
  overrides: Partial<
    RuntimeWhyExplanation
  > = {}
): RuntimeWhyExplanation {
  return {
    summary:
      "The current implementation direction remains coherent.",

    context:
      "Recent project activity continues to support the current focus.",

    priorityReason:
      "Continuing this action preserves the strongest available project signal.",

    expectedOutcome:
      "The project can advance without an unnecessary direction change.",

    priority:
      "primary",

    ...overrides,
  };
}

function createEvidenceItem(
  overrides: Partial<
    RuntimeEvidenceItem
  > = {}
): RuntimeEvidenceItem {
  return {
    id:
      "evidence-stability",

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
      "primary-evidence",

    title:
      "The recommendation remains stable.",

    description:
      "The current action is supported by the latest Runtime state.",

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

    supporting: [],

    context: [],

    disclosure:
      "structured",

    ...overrides,
  };
}

function createAction(
  overrides: Partial<
    RuntimeNextAction
  > = {}
): RuntimeNextAction {
  return {
    kind:
      "continue-project-work",

    title:
      "Continue the current implementation",

    description:
      "Advance the current work without changing direction.",

    reason:
      "The latest Runtime signal supports continuing the current path.",

    why:
      createWhy(),

    evidence:
      createEvidence(),

    target:
      "current-focus",

    confidence:
      "high",

    source:
      "recommended-focus",

    sourceLabel:
      "Recommended focus",

    isActionable:
      true,

    ...overrides,
  };
}

describe(
  "RuntimeNextActionPanel",
  () => {
    it(
      "renders the next action region",
      () => {
        const action =
          createAction();

        render(
          <RuntimeNextActionPanel
            action={action}
          />
        );

        expect(
          screen.getByRole(
            "region",
            {
              name:
                action.title,
            }
          )
        ).toBeInTheDocument();
      }
    );

    it(
      "renders the action title and description",
      () => {
        render(
          <RuntimeNextActionPanel
            action={
              createAction()
            }
          />
        );

        expect(
          screen.getByRole(
            "heading",
            {
              name:
                "Continue the current implementation",
            }
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "Advance the current work without changing direction."
          )
        ).toBeInTheDocument();
      }
    );

    it(
      "renders the runtime recommendation heading",
      () => {
        render(
          <RuntimeNextActionPanel
            action={
              createAction()
            }
          />
        );

        expect(
          screen.getByText(
            "WHAT TO DO NEXT"
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "Runtime recommends this next step"
          )
        ).toBeInTheDocument();
      }
    );

    it.each([
      [
        "high",
        "Clear signal",
        "Runtime confidence: High",
      ],
      [
        "medium",
        "Developing signal",
        "Runtime confidence: Medium",
      ],
      [
        "low",
        "Early signal",
        "Runtime confidence: Low",
      ],
    ] as const)(
      "renders the %s confidence presentation",
      (
        confidence,
        expectedSignal,
        expectedLevel
      ) => {
        render(
          <RuntimeNextActionPanel
            action={
              createAction({
                confidence,
              })
            }
          />
        );

        expect(
          screen.getByText(
            expectedSignal
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            expectedLevel
          )
        ).toBeInTheDocument();
      }
    );

    it(
      "renders the action source label",
      () => {
        render(
          <RuntimeNextActionPanel
            action={
              createAction({
                sourceLabel:
                  "Recommended focus",
              })
            }
          />
        );

        expect(
          screen.getByText(
            "Based on Recommended focus"
          )
        ).toBeInTheDocument();
      }
    );

    it(
      "renders recommendation context when a valid presentation is provided",
      () => {
        render(
          <RuntimeNextActionPanel
            action={
              createAction()
            }
            recommendationPresentation={
              createRuntimeRecommendationPresentationFixture()
            }
          />
        );

        expect(
          screen.getByRole(
            "region",
            {
              name:
                "Runtime recommendation context",
            }
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "The current recommendation remains stable."
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "The adaptive recommendation remains aligned with the base recommendation."
          )
        ).toBeInTheDocument();
      }
    );

    it(
      "does not render recommendation context when the presentation is null",
      () => {
        render(
          <RuntimeNextActionPanel
            action={
              createAction()
            }
            recommendationPresentation={
              null
            }
          />
        );

        expect(
          screen.queryByRole(
            "region",
            {
              name:
                "Runtime recommendation context",
            }
          )
        ).not.toBeInTheDocument();
      }
    );

    it(
      "does not render recommendation context when the presentation is undefined",
      () => {
        render(
          <RuntimeNextActionPanel
            action={
              createAction()
            }
          />
        );

        expect(
          screen.queryByRole(
            "region",
            {
              name:
                "Runtime recommendation context",
            }
          )
        ).not.toBeInTheDocument();
      }
    );

    it(
      "does not render recommendation context when its tone is unavailable",
      () => {
        render(
          <RuntimeNextActionPanel
            action={
              createAction()
            }
            recommendationPresentation={
              createRuntimeRecommendationPresentationFixture({
                tone:
                  "unavailable",
              })
            }
          />
        );

        expect(
          screen.queryByRole(
            "region",
            {
              name:
                "Runtime recommendation context",
            }
          )
        ).not.toBeInTheDocument();
      }
    );

    it(
      "renders the structured runtime why explanation",
      () => {
        render(
          <RuntimeNextActionPanel
            action={
              createAction()
            }
          />
        );

        expect(
          screen.getByRole(
            "region",
            {
              name:
                "Runtime recommendation reasoning",
            }
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "The current implementation direction remains coherent."
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "Primary reason"
          )
        ).toBeInTheDocument();
      }
    );

    it(
      "renders the action reason as fallback when structured why data is unavailable",
      () => {
        render(
          <RuntimeNextActionPanel
            action={
              createAction({
                why:
                  undefined,

                reason:
                  "Runtime selected this action from the latest available project signal.",
              })
            }
          />
        );

        expect(
          screen.getByText(
            "Runtime selected this action from the latest available project signal."
          )
        ).toBeInTheDocument();

        expect(
          screen.queryByRole(
            "button",
            {
              name:
                "Show Runtime reasoning",
            }
          )
        ).not.toBeInTheDocument();
      }
    );

    it(
      "renders the runtime evidence summary",
      () => {
        render(
          <RuntimeNextActionPanel
            action={
              createAction()
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

        expect(
          screen.getByText(
            "Runtime found supporting evidence for this recommendation."
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "1 signal"
          )
        ).toBeInTheDocument();
      }
    );

    it(
      "does not render the evidence panel when evidence is unavailable",
      () => {
        render(
          <RuntimeNextActionPanel
            action={
              createAction({
                evidence:
                  undefined,
              })
            }
          />
        );

        expect(
          screen.queryByRole(
            "region",
            {
              name:
                "Evidence behind this recommendation",
            }
          )
        ).not.toBeInTheDocument();
      }
    );

    it(
      "renders navigation when the action is actionable",
      () => {
        const onNavigate =
          vi.fn();

        render(
          <RuntimeNextActionPanel
            action={
              createAction({
                target:
                  "current-focus",

                isActionable:
                  true,
              })
            }
            onNavigate={
              onNavigate
            }
          />
        );

        expect(
          screen.getByRole(
            "button",
            {
              name:
                "Go to Current Focus",
            }
          )
        ).toBeInTheDocument();
      }
    );

    it(
      "passes the action target when navigation is selected",
      () => {
        const onNavigate =
          vi.fn();

        render(
          <RuntimeNextActionPanel
            action={
              createAction({
                target:
                  "current-focus",
              })
            }
            onNavigate={
              onNavigate
            }
          />
        );

        fireEvent.click(
          screen.getByRole(
            "button",
            {
              name:
                "Go to Current Focus",
            }
          )
        );

        expect(
          onNavigate
        ).toHaveBeenCalledTimes(
          1
        );

        expect(
          onNavigate
        ).toHaveBeenCalledWith(
          "current-focus"
        );
      }
    );

    it(
      "does not render navigation when the action is not actionable",
      () => {
        const onNavigate =
          vi.fn();

        render(
          <RuntimeNextActionPanel
            action={
              createAction({
                isActionable:
                  false,
              })
            }
            onNavigate={
              onNavigate
            }
          />
        );

        expect(
          screen.queryByRole(
            "button",
            {
              name:
                "Go to Current Focus",
            }
          )
        ).not.toBeInTheDocument();
      }
    );

    it(
      "does not render navigation when the target is null",
      () => {
        const onNavigate =
          vi.fn();

        render(
          <RuntimeNextActionPanel
            action={
              createAction({
                target:
                  null,
              })
            }
            onNavigate={
              onNavigate
            }
          />
        );

        expect(
          screen.queryByRole(
            "button",
            {
              name:
                "Go to recommended action",
            }
          )
        ).not.toBeInTheDocument();

        expect(
          onNavigate
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "does not render navigation when no navigation handler is provided",
      () => {
        render(
          <RuntimeNextActionPanel
            action={
              createAction()
            }
          />
        );

        expect(
          screen.queryByRole(
            "button",
            {
              name:
                "Go to Current Focus",
            }
          )
        ).not.toBeInTheDocument();
      }
    );

    it.each([
      [
        "reflection",
        "Go to Reflection",
      ],
      [
        "combined-analysis",
        "Go to Reflection + GitHub",
      ],
      [
        "github-analysis",
        "Go to GitHub Analysis",
      ],
      [
        "current-focus",
        "Go to Current Focus",
      ],
      [
        "project-timeline",
        "Go to Project Timeline",
      ],
      [
        "runtime-details",
        "Explore Runtime Details",
      ],
    ] as const)(
      "renders the correct navigation label for %s",
      (
        target,
        expectedLabel
      ) => {
        const onNavigate =
          vi.fn();

        render(
          <RuntimeNextActionPanel
            action={
              createAction({
                target,
              })
            }
            onNavigate={
              onNavigate
            }
          />
        );

        const navigationButton =
          screen.getByRole(
            "button",
            {
              name:
                expectedLabel,
            }
          );

        expect(
          navigationButton
        ).toBeInTheDocument();

        fireEvent.click(
          navigationButton
        );

        expect(
          onNavigate
        ).toHaveBeenCalledTimes(
          1
        );

        expect(
          onNavigate
        ).toHaveBeenCalledWith(
          target
        );
      }
    );

    it(
      "renders recommendation context before runtime reasoning and evidence",
      () => {
        render(
          <RuntimeNextActionPanel
            action={
              createAction()
            }
            recommendationPresentation={
              createRuntimeRecommendationPresentationFixture()
            }
          />
        );

        const contextRegion =
          screen.getByRole(
            "region",
            {
              name:
                "Runtime recommendation context",
            }
          );

        const whyRegion =
          screen.getByRole(
            "region",
            {
              name:
                "Runtime recommendation reasoning",
            }
          );

        const evidenceRegion =
          screen.getByRole(
            "region",
            {
              name:
                "Evidence behind this recommendation",
            }
          );

        expect(
          contextRegion.compareDocumentPosition(
            whyRegion
          ) &
            Node.DOCUMENT_POSITION_FOLLOWING
        ).toBeTruthy();

        expect(
          whyRegion.compareDocumentPosition(
            evidenceRegion
          ) &
            Node.DOCUMENT_POSITION_FOLLOWING
        ).toBeTruthy();
      }
    );
  }
);