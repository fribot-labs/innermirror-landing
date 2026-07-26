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
    RuntimeWhyExplanation,
} from "../../../runtime-next-action/runtimeWhyTypes";

import {
    RuntimeWhyPanel,
} from "../RuntimeWhyPanel";

function createWhy(
  overrides: Partial<
    RuntimeWhyExplanation
  > = {}
): RuntimeWhyExplanation {
  return {
    summary:
      "The current project direction should continue.",

    priority:
      "primary",

    context:
      "Recent runtime observations remain aligned.",

    priorityReason:
      "This action preserves the current implementation momentum.",

    expectedOutcome:
      "The project can advance without changing direction.",

    ...overrides,
  };
}

describe(
  "RuntimeWhyPanel",
  () => {
    it(
      "renders the recommendation reasoning region",
      () => {
        render(
          <RuntimeWhyPanel
            why={createWhy()}
            fallbackReason="Fallback reasoning"
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
      }
    );

    it(
      "renders the why summary",
      () => {
        render(
          <RuntimeWhyPanel
            why={createWhy()}
            fallbackReason="Fallback reasoning"
          />
        );

        expect(
          screen.getByText(
            "Why Runtime recommends this"
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "The current project direction should continue."
          )
        ).toBeInTheDocument();
      }
    );

    it(
      "renders the formatted priority label",
      () => {
        render(
          <RuntimeWhyPanel
            why={createWhy({
              priority:
                "primary",
            })}
            fallbackReason="Fallback reasoning"
          />
        );

        expect(
          screen.getByText(
            "Primary reason"
          )
        ).toBeInTheDocument();
      }
    );

    it.each([
      [
        "blocking",
        "Required first",
        "runtime-why-panel__priority--blocking",
      ],
      [
        "primary",
        "Primary reason",
        "runtime-why-panel__priority--primary",
      ],
      [
        "reinforced",
        "Multiple signals",
        "runtime-why-panel__priority--reinforced",
      ],
      [
        "fallback",
        "Best available",
        "runtime-why-panel__priority--fallback",
      ],
    ] as const)(
      "applies the %s priority presentation",
      (
        priority,
        expectedLabel,
        expectedClass
      ) => {
        render(
          <RuntimeWhyPanel
            why={createWhy({
              priority,
            })}
            fallbackReason="Fallback reasoning"
          />
        );

        const priorityElement =
          screen.getByText(
            expectedLabel
          );

        expect(
          priorityElement
        ).toHaveClass(
          "runtime-why-panel__priority"
        );

        expect(
          priorityElement
        ).toHaveClass(
          expectedClass
        );
      }
    );

    it(
      "keeps the structured details collapsed initially",
      () => {
        render(
          <RuntimeWhyPanel
            why={createWhy()}
            fallbackReason="Fallback reasoning"
          />
        );

        expect(
          screen.queryByText(
            "Current context"
          )
        ).not.toBeInTheDocument();

        expect(
          screen.queryByText(
            "Why this comes first"
          )
        ).not.toBeInTheDocument();

        expect(
          screen.queryByText(
            "Expected outcome"
          )
        ).not.toBeInTheDocument();
      }
    );

    it(
      "expands the structured details when the toggle is clicked",
      () => {
        render(
          <RuntimeWhyPanel
            why={createWhy()}
            fallbackReason="Fallback reasoning"
          />
        );

        fireEvent.click(
          screen.getByRole(
            "button",
            {
              name:
                "Show Runtime reasoning",
            }
          )
        );

        expect(
          screen.getByText(
            "Current context"
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "Recent runtime observations remain aligned."
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "Why this comes first"
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "This action preserves the current implementation momentum."
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "Expected outcome"
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "The project can advance without changing direction."
          )
        ).toBeInTheDocument();
      }
    );

    it(
      "collapses the structured details when the toggle is clicked again",
      () => {
        render(
          <RuntimeWhyPanel
            why={createWhy()}
            fallbackReason="Fallback reasoning"
          />
        );

        fireEvent.click(
          screen.getByRole(
            "button",
            {
              name:
                "Show Runtime reasoning",
            }
          )
        );

        fireEvent.click(
          screen.getByRole(
            "button",
            {
              name:
                "Hide Runtime reasoning",
            }
          )
        );

        expect(
          screen.queryByText(
            "Current context"
          )
        ).not.toBeInTheDocument();

        expect(
          screen.queryByText(
            "Why this comes first"
          )
        ).not.toBeInTheDocument();

        expect(
          screen.queryByText(
            "Expected outcome"
          )
        ).not.toBeInTheDocument();
      }
    );

    it(
      "updates aria-expanded when the details are toggled",
      () => {
        render(
          <RuntimeWhyPanel
            why={createWhy()}
            fallbackReason="Fallback reasoning"
          />
        );

        const showButton =
          screen.getByRole(
            "button",
            {
              name:
                "Show Runtime reasoning",
            }
          );

        expect(
          showButton
        ).toHaveAttribute(
          "aria-expanded",
          "false"
        );

        fireEvent.click(
          showButton
        );

        const hideButton =
          screen.getByRole(
            "button",
            {
              name:
                "Hide Runtime reasoning",
            }
          );

        expect(
          hideButton
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
          <RuntimeWhyPanel
            why={createWhy()}
            fallbackReason="Fallback reasoning"
          />
        );

        const toggleButton =
          screen.getByRole(
            "button",
            {
              name:
                "Show Runtime reasoning",
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
          "runtime-why-panel__details"
        );
      }
    );

    it(
      "applies the expanded panel class while details are visible",
      () => {
        render(
          <RuntimeWhyPanel
            why={createWhy()}
            fallbackReason="Fallback reasoning"
          />
        );

        const region =
          screen.getByRole(
            "region",
            {
              name:
                "Runtime recommendation reasoning",
            }
          );

        expect(
          region
        ).not.toHaveClass(
          "runtime-why-panel--expanded"
        );

        fireEvent.click(
          screen.getByRole(
            "button",
            {
              name:
                "Show Runtime reasoning",
            }
          )
        );

        expect(
          region
        ).toHaveClass(
          "runtime-why-panel--expanded"
        );
      }
    );

    it(
      "renders the fallback reason when structured why data is unavailable",
      () => {
        render(
          <RuntimeWhyPanel
            why={undefined}
            fallbackReason="Runtime selected this action from the latest available signal."
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
            "Runtime selected this action from the latest available signal."
          )
        ).toBeInTheDocument();
      }
    );

    it(
      "does not render a toggle or priority in the fallback state",
      () => {
        render(
          <RuntimeWhyPanel
            why={undefined}
            fallbackReason="Runtime selected this action from the latest available signal."
          />
        );

        expect(
          screen.queryByRole(
            "button"
          )
        ).not.toBeInTheDocument();

        expect(
          screen.queryByText(
            "Required first"
          )
        ).not.toBeInTheDocument();

        expect(
          screen.queryByText(
            "Primary reason"
          )
        ).not.toBeInTheDocument();

        expect(
          screen.queryByText(
            "Multiple signals"
          )
        ).not.toBeInTheDocument();

        expect(
          screen.queryByText(
            "Best available"
          )
        ).not.toBeInTheDocument();
      }
    );
  }
);