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
    RuntimeRecommendationPresentation,
} from "../../runtimeRecommendationPresentation";

import {
    RuntimeRecommendationContext,
} from "../RuntimeRecommendationContext";

function createPresentation(
  overrides: Partial<
    RuntimeRecommendationPresentation
  > = {}
): RuntimeRecommendationPresentation {
  return {
    tone: "stable",

    integrationStatusLabel:
      "Recommendation integrated",

    recommendationStateLabel:
      "The current recommendation remains stable.",

    recommendationChangeMessage:
      "The recommendation has not changed since the previous observation.",

    confidenceLabel:
      "High confidence",

    stabilityLabel:
      "Stable",

    driftLabel:
      "Low drift",

    nextFocus:
      "Continue the current implementation path.",

    observationCountLabel:
      "Based on 5 observations",

    ...overrides,
  } as RuntimeRecommendationPresentation;
}

describe(
  "RuntimeRecommendationContext",
  () => {
    it(
      "renders the recommendation context",
      () => {
        render(
          <RuntimeRecommendationContext
            presentation={
              createPresentation()
            }
          />
        );

        expect(
          screen.getByLabelText(
            "Runtime recommendation context"
          )
        ).not.toBeNull();
      }
    );

    it(
      "renders the recommendation status and state",
      () => {
        render(
          <RuntimeRecommendationContext
            presentation={
              createPresentation()
            }
          />
        );

        expect(
          screen.getByText(
            "Recommendation integrated"
          )
        ).not.toBeNull();

        expect(
          screen.getByText(
            "The current recommendation remains stable."
          )
        ).not.toBeNull();
      }
    );

    it(
      "renders the recommendation change message",
      () => {
        render(
          <RuntimeRecommendationContext
            presentation={
              createPresentation()
            }
          />
        );

        expect(
          screen.getByText(
            "The recommendation has not changed since the previous observation."
          )
        ).not.toBeNull();
      }
    );

    it(
      "renders confidence, stability, and drift",
      () => {
        render(
          <RuntimeRecommendationContext
            presentation={
              createPresentation()
            }
          />
        );

        expect(
          screen.getByText(
            "High confidence"
          )
        ).not.toBeNull();

        expect(
          screen.getByText(
            "Stable"
          )
        ).not.toBeNull();

        expect(
          screen.getByText(
            "Low drift"
          )
        ).not.toBeNull();
      }
    );

    it(
      "renders the next focus when available",
      () => {
        render(
          <RuntimeRecommendationContext
            presentation={
              createPresentation()
            }
          />
        );

        expect(
          screen.getByText(
            "Continue the current implementation path."
          )
        ).not.toBeNull();
      }
    );

    it(
      "does not render the next focus when null",
      () => {
        render(
          <RuntimeRecommendationContext
            presentation={
              createPresentation({
                nextFocus: null,
              })
            }
          />
        );

        expect(
          screen.queryByText(
            "Next focus:"
          )
        ).toBeNull();
      }
    );

    it(
      "renders the observation count",
      () => {
        render(
          <RuntimeRecommendationContext
            presentation={
              createPresentation()
            }
          />
        );

        expect(
          screen.getByText(
            "Based on 5 observations"
          )
        ).not.toBeNull();
      }
    );

    it(
      "applies the presentation tone class",
      () => {
        render(
          <RuntimeRecommendationContext
            presentation={
              createPresentation({
                tone: "caution",
              })
            }
          />
        );

        const context =
          screen.getByLabelText(
            "Runtime recommendation context"
          );

        expect(
          context.classList.contains(
            "runtime-recommendation-context"
          )
        ).toBe(true);

        expect(
          context.classList.contains(
            "runtime-recommendation-context--caution"
          )
        ).toBe(true);
      }
    );
  }
);