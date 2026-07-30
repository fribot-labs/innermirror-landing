import {
    render,
    screen,
    within,
} from "@testing-library/react";
import {
    describe,
    expect,
    it,
} from "vitest";

import {
    RuntimePredictionPanel,
} from "./RuntimePredictionPanel";

import type {
    RuntimePredictivePresentation,
} from "./runtimePredictivePresentationTypes";

/* ------------------------------------------------------------------ */
/* Fixture                                                            */
/* ------------------------------------------------------------------ */

const availablePresentation:
  RuntimePredictivePresentation = {
    status:
      "available",

    headline:
      "Likely Recommendation Evolution",

    summary:
      "The recommendation direction is becoming clearer.",

    primaryPrediction:
      "Preserve Current Recommendation",

    statePrediction: {
      label:
        "Likely State",

      value:
        "Recommendation Stable",

      confidence:
        0.86,
    },

    strategyPrediction: {
      label:
        "Likely Strategy",

      value:
        "Preserve Current Recommendation",

      confidence:
        0.79,
    },

    decisionPrediction: {
      label:
        "Likely Runtime Decision",

      value:
        "Continue Observation",

      confidence:
        0.74,
    },

    risk: {
      title:
        "Premature Commitment",

      description:
        "The recommendation may be accepted too early.",

      emphasis:
        "high",
    },

    opportunity: {
      title:
        "Evidence Continuity",

      description:
        "Additional evidence may strengthen the trajectory.",

      emphasis:
        "moderate",
    },

    confidence: {
      score:
        0.82,

      percentage:
        82,

      disclosure:
        "This confidence represents a conditional estimate.",
    },

    evidence: [
      "Repeated recommendation stability",
    ],

    warnings: [
      "Prediction remains conditional.",
    ],

    predictedAt:
      "2026-07-30T08:00:00.000Z",
  };

/* ------------------------------------------------------------------ */
/* Tests                                                              */
/* ------------------------------------------------------------------ */

describe(
  "RuntimePredictionPanel",
  () => {
    it(
      "renders empty state when presentation is null",
      () => {
        render(
          <RuntimePredictionPanel
            presentation={
              null
            }
          />,
        );

        expect(
          screen.getByRole(
            "heading",
            {
              name:
                "Runtime Prediction",
            },
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "No prediction is available yet.",
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      "renders available prediction",
      () => {
        render(
          <RuntimePredictionPanel
            presentation={
              availablePresentation
            }
          />,
        );

        expect(
          screen.getByRole(
            "heading",
            {
              name:
                availablePresentation.headline,
            },
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            availablePresentation.summary,
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "Prediction available",
          ),
        ).toBeInTheDocument();

        expect(
          screen.getAllByText(
            availablePresentation.primaryPrediction!,
          ),
        ).toHaveLength(
          2,
        );
      },
    );

    it(
      "renders prediction cards",
      () => {
        render(
          <RuntimePredictionPanel
            presentation={
              availablePresentation
            }
          />,
        );

        const stateCard =
          screen
            .getByText(
              "Likely State",
            )
            .closest(
              "article",
            );

        expect(
          stateCard,
        ).not.toBeNull();

        expect(
          stateCard,
        ).toHaveTextContent(
          "Recommendation Stable",
        );

        expect(
          within(
            stateCard!,
          ).getByText(
            /Confidence\s*86%/,
          ),
        ).toBeInTheDocument();

        const strategyCard =
          screen
            .getByText(
              "Likely Strategy",
            )
            .closest(
              "article",
            );

        expect(
          strategyCard,
        ).not.toBeNull();

        expect(
          strategyCard,
        ).toHaveTextContent(
          "Preserve Current Recommendation",
        );

        expect(
          within(
            strategyCard!,
          ).getByText(
            /Confidence\s*79%/,
          ),
        ).toBeInTheDocument();

        const decisionCard =
          screen
            .getByText(
              "Likely Runtime Decision",
            )
            .closest(
              "article",
            );

        expect(
          decisionCard,
        ).not.toBeNull();

        expect(
          decisionCard,
        ).toHaveTextContent(
          "Continue Observation",
        );

        expect(
          within(
            decisionCard!,
          ).getByText(
            /Confidence\s*74%/,
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      "renders overall confidence",
      () => {
        render(
          <RuntimePredictionPanel
            presentation={
              availablePresentation
            }
          />,
        );

        const confidenceProgress =
          screen.getByRole(
            "progressbar",
            {
              name:
                "Prediction confidence",
            },
          );

        expect(
          confidenceProgress,
        ).toHaveAttribute(
          "value",
          "82",
        );

        expect(
          confidenceProgress,
        ).toHaveAttribute(
          "max",
          "100",
        );

        expect(
          screen.getByText(
            availablePresentation.confidence.disclosure,
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      "renders risk and opportunity",
      () => {
        render(
          <RuntimePredictionPanel
            presentation={
              availablePresentation
            }
          />,
        );

        const riskCard =
          screen
            .getByText(
              "Risk",
            )
            .closest(
              "article",
            );

        expect(
          riskCard,
        ).not.toBeNull();

        expect(
          riskCard,
        ).toHaveTextContent(
          "Premature Commitment",
        );

        expect(
          riskCard,
        ).toHaveTextContent(
          "The recommendation may be accepted too early.",
        );

        const opportunityCard =
          screen
            .getByText(
              "Opportunity",
            )
            .closest(
              "article",
            );

        expect(
          opportunityCard,
        ).not.toBeNull();

        expect(
          opportunityCard,
        ).toHaveTextContent(
          "Evidence Continuity",
        );

        expect(
          opportunityCard,
        ).toHaveTextContent(
          "Additional evidence may strengthen the trajectory.",
        );
      },
    );

    it(
      "renders evidence and warnings",
      () => {
        render(
          <RuntimePredictionPanel
            presentation={
              availablePresentation
            }
          />,
        );

        expect(
          screen.getByRole(
            "heading",
            {
              name:
                "Evidence",
            },
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "Repeated recommendation stability",
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByRole(
            "heading",
            {
              name:
                "Warnings",
            },
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "Prediction remains conditional.",
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      "renders insufficient presentation without predictive detail cards",
      () => {
        render(
          <RuntimePredictionPanel
            presentation={{
              ...availablePresentation,

              status:
                "insufficient",

              headline:
                "Prediction Needs More Evidence",

              summary:
                "The current evidence is not yet sufficient.",

              primaryPrediction:
                null,

              statePrediction:
                null,

              strategyPrediction:
                null,

              decisionPrediction:
                null,

              risk:
                null,

              opportunity:
                null,

              evidence: [],

              warnings: [
                "More observations are required.",
              ],

              confidence: {
                score:
                  null,

                percentage:
                  null,

                disclosure:
                  "Need more evidence.",
              },
            }}
          />,
        );

        expect(
          screen.getByRole(
            "heading",
            {
              name:
                "Prediction Needs More Evidence",
            },
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "More evidence required",
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "Need more evidence.",
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "More observations are required.",
          ),
        ).toBeInTheDocument();

        expect(
          screen.queryByText(
            "Likely State",
          ),
        ).not.toBeInTheDocument();

        expect(
          screen.queryByRole(
            "progressbar",
            {
              name:
                "Prediction confidence",
            },
          ),
        ).not.toBeInTheDocument();
      },
    );

    it(
      "renders unavailable presentation without predictive detail cards",
      () => {
        render(
          <RuntimePredictionPanel
            presentation={{
              ...availablePresentation,

              status:
                "unavailable",

              headline:
                "Prediction Is Currently Unavailable",

              summary:
                "Prediction could not be produced.",

              primaryPrediction:
                null,

              statePrediction:
                null,

              strategyPrediction:
                null,

              decisionPrediction:
                null,

              risk:
                null,

              opportunity:
                null,

              evidence: [],

              warnings: [],

              confidence: {
                score:
                  null,

                percentage:
                  null,

                disclosure:
                  "Prediction unavailable.",
              },
            }}
          />,
        );

        expect(
          screen.getByRole(
            "heading",
            {
              name:
                "Prediction Is Currently Unavailable",
            },
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "Prediction unavailable",
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "Prediction unavailable.",
          ),
        ).toBeInTheDocument();

        expect(
          screen.queryByText(
            "Likely Strategy",
          ),
        ).not.toBeInTheDocument();

        expect(
          screen.queryByRole(
            "progressbar",
            {
              name:
                "Prediction confidence",
            },
          ),
        ).not.toBeInTheDocument();
      },
    );
  },
);