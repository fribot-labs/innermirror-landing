import {
    render,
    screen,
} from "@testing-library/react";

import {
    describe,
    expect,
    test,
} from "vitest";

import {
    deriveRuntimeV2RecommendationInsightPresentation,
} from "../../runtime-presentation/deriveRuntimeV2RecommendationInsightPresentation";

import {
    createRuntimeV2RecommendationInsightFixture,
} from "../../test/fixtures/runtimeV2RecommendationFixture";

import {
    RuntimeV2RecommendationInsight,
} from "./RuntimeV2RecommendationInsight";

/* ------------------------------------------------------------------ */
/* Test helper                                                        */
/* ------------------------------------------------------------------ */

function createPresentation(
  overrides:
    Parameters<
      typeof createRuntimeV2RecommendationInsightFixture
    >[0] = {}
) {
  const insight =
    createRuntimeV2RecommendationInsightFixture(
      overrides
    );

  const presentation =
    deriveRuntimeV2RecommendationInsightPresentation(
      insight
    );

  if (!presentation) {
    throw new Error(
      "Expected Recommendation Insight Presentation fixture."
    );
  }

  return presentation;
}

/* ------------------------------------------------------------------ */
/* Runtime V2 Recommendation Insight                                  */
/* ------------------------------------------------------------------ */

describe(
  "RuntimeV2RecommendationInsight",
  () => {
    test(
      "renders the Recommendation Insight region",
      () => {
        const presentation =
          createPresentation();

        render(
          <RuntimeV2RecommendationInsight
            presentation={
              presentation
            }
          />
        );

        expect(
          screen.getByRole(
            "region",
            {
              name:
                presentation.headline,
            }
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "Recommendation Insight"
          )
        ).toBeInTheDocument();
      }
    );

    test(
      "renders the Runtime Insight headline and summary",
      () => {
        const presentation =
          createPresentation({
            headline:
              "Recommendation direction is becoming stable.",

            summary:
              "Recent Recommendation results now form a more consistent interpretation.",
          });

        render(
          <RuntimeV2RecommendationInsight
            presentation={
              presentation
            }
          />
        );

        expect(
          screen.getByRole(
            "heading",
            {
              name:
                presentation.headline,
            }
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            presentation.summary
          )
        ).toBeInTheDocument();
      }
    );

    test(
      "renders the primary Key Insight",
      () => {
        const presentation =
          createPresentation({
            keyInsight:
              "Recommendation confidence is limited by missing aligned project evidence.",
          });

        render(
          <RuntimeV2RecommendationInsight
            presentation={
              presentation
            }
          />
        );

        expect(
          screen.getByText(
            "Key Insight"
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            presentation.keyInsight
          )
        ).toBeInTheDocument();
      }
    );

    test(
      "renders all supporting reasons",
      () => {
        const presentation =
          createPresentation({
            supportingReasons: [
              "Comparison: Direction maintained",
              "Observation: Evidence remains insufficient",
              "Evolution: Stable direction",
              "Prediction: UX Stabilization",
            ],
          });

        render(
          <RuntimeV2RecommendationInsight
            presentation={
              presentation
            }
          />
        );

        expect(
          screen.getByText(
            "Supporting Reasons"
          )
        ).toBeInTheDocument();

        for (
          const reason of
          presentation.supportingReasons
        ) {
          expect(
            screen.getByText(
              reason
            )
          ).toBeInTheDocument();
        }
      }
    );

    test(
      "does not render Supporting Reasons when the list is empty",
      () => {
        const presentation =
          createPresentation({
            supportingReasons:
              [],
          });

        render(
          <RuntimeV2RecommendationInsight
            presentation={
              presentation
            }
          />
        );

        expect(
          screen.queryByText(
            "Supporting Reasons"
          )
        ).not.toBeInTheDocument();

        expect(
          screen.queryByRole(
            "list"
          )
        ).not.toBeInTheDocument();
      }
    );

    test(
      "renders pattern, confidence, and Evidence metadata",
      () => {
        const presentation =
          createPresentation({
            pattern:
              "stable-and-aligned",

            confidence:
              "high",

            evidence: [
              {
                id:
                  "insight-evidence-001",

                source:
                  "recommendation-comparison",

                label:
                  "Comparison Evidence",

                summary:
                  "The Recommendation direction remained stable.",

                confidence:
                  "high",
              },

              {
                id:
                  "insight-evidence-002",

                source:
                  "recommendation-observation",

                label:
                  "Observation Evidence",

                summary:
                  "Project activity supports the current Recommendation.",

                confidence:
                  "high",
              },
            ],
          });

        render(
          <RuntimeV2RecommendationInsight
            presentation={
              presentation
            }
          />
        );

        expect(
          screen.getByText(
            `Pattern: ${presentation.patternLabel}`
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            presentation.confidenceLabel
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            `Evidence: ${presentation.evidenceCount}`
          )
        ).toBeInTheDocument();
      }
    );

    test(
      "renders the generated time with its original Runtime timestamp",
      () => {
        const presentation =
          createPresentation({
            generatedAt:
              "2026-08-01T10:30:00.000Z",
          });

        render(
          <RuntimeV2RecommendationInsight
            presentation={
              presentation
            }
          />
        );

        const timeElement =
          screen.getByText(
            presentation.generatedAtLabel
          );

        expect(
          timeElement
        ).toBeInTheDocument();

        expect(
          timeElement.tagName
        ).toBe(
          "TIME"
        );

        expect(
          timeElement
        ).toHaveAttribute(
          "datetime",
          presentation.generatedAt
        );
      }
    );

    test.each([
      {
        pattern:
          "early-understanding",
        expectedTone:
          "forming",
      },

      {
        pattern:
          "stable-but-under-evidenced",
        expectedTone:
          "forming",
      },

      {
        pattern:
          "stable-and-aligned",
        expectedTone:
          "stable",
      },

      {
        pattern:
          "progressing",
        expectedTone:
          "progressing",
      },

      {
        pattern:
          "strategic-transition",
        expectedTone:
          "transition",
      },

      {
        pattern:
          "direction-conflict",
        expectedTone:
          "warning",
      },

      {
        pattern:
          "uncertain",
        expectedTone:
          "uncertain",
      },
    ] as const)(
      "applies the $expectedTone presentation class for $pattern",
      ({
        pattern,
        expectedTone,
      }) => {
        const presentation =
          createPresentation({
            pattern,
          });

        const {
          container,
        } =
          render(
            <RuntimeV2RecommendationInsight
              presentation={
                presentation
              }
            />
          );

        const insightElement =
          container.querySelector(
            ".runtime-v2-recommendation-insight"
          );

        expect(
          insightElement
        ).toBeInTheDocument();

        expect(
          insightElement
        ).toHaveClass(
          `runtime-v2-recommendation-insight-${expectedTone}`
        );
      }
    );

    test(
      "preserves the common Recommendation Insight class",
      () => {
        const presentation =
          createPresentation({
            pattern:
              "direction-conflict",
          });

        const {
          container,
        } =
          render(
            <RuntimeV2RecommendationInsight
              presentation={
                presentation
              }
            />
          );

        const insightElement =
          container.querySelector(
            ".runtime-v2-recommendation-insight"
          );

        expect(
          insightElement
        ).toHaveClass(
          "runtime-v2-recommendation-insight"
        );

        expect(
          insightElement
        ).toHaveClass(
          "runtime-v2-recommendation-insight-warning"
        );
      }
    );

    test(
      "renders zero when no Runtime Insight Evidence exists",
      () => {
        const presentation =
          createPresentation({
            evidence:
              [],
          });

        render(
          <RuntimeV2RecommendationInsight
            presentation={
              presentation
            }
          />
        );

        expect(
          screen.getByText(
            "Evidence: 0"
          )
        ).toBeInTheDocument();
      }
    );
  }
);