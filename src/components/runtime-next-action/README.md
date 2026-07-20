# Runtime Next Action UI Layer

The Runtime Next Action UI Layer presents one prioritized recommendation before the detailed Runtime analysis.

This layer is introduced in PR-041B.

It builds on the Runtime Next Action Foundation created in PR-041A.

---

# Purpose

The Runtime can produce many meaningful signals, including:

- Recommended Focus
- Adaptive Coaching
- Decision Review
- Next Question
- Project Flow
- Knowledge Compression

However, presenting all of these signals at the same visual level makes it difficult for the learner to identify the next step.

The Runtime Next Action UI Layer gives the learner one immediate answer:

> **What should I do next?**

---

# Architecture

```text
Recommendation Candidates

↓

Recommendation Resolution

↓

Runtime Why Explanation

↓

Runtime Next Action Presentation
```

The Foundation selects the recommendation.

The UI Layer presents it.

---

# Responsibility

This layer owns:

- displaying the selected next action
- creating a clear visual hierarchy
- presenting the action title
- presenting the action description
- explaining why the action is recommended
- displaying recommendation confidence
- displaying the recommendation source
- offering navigation toward the related Landing section

This layer does not own:

- Runtime interpretation
- recommendation rule selection
- action priority
- Runtime API requests
- Reflection execution
- GitHub analysis execution
- automatic button activation

---

# Main Component

## RuntimeNextActionPanel

Recommended file:

```text
src/components/runtime-next-action/RuntimeNextActionPanel.tsx
```

The component receives a `RuntimeNextAction` and renders a human-readable recommendation.

Example:

```tsx
<RuntimeNextActionPanel
  action={runtimeNextAction}
  onNavigate={handleNextActionNavigation}
/>
```

---

# Props

```ts
type RuntimeNextActionPanelProps = {
  action: RuntimeNextAction;
  onNavigate?: (
    target: RuntimeNextActionTarget
  ) => void;
};
```

## action

Contains the selected recommendation.

Expected fields include:

- `kind`
- `title`
- `description`
- `reason`
- `target`
- `confidence`
- `source`
- `sourceLabel`
- `isActionable`

## onNavigate

Optional callback used to move the learner to the relevant Landing section.

Examples:

- Reflection
- GitHub analysis
- Combined analysis
- Current focus
- Project timeline
- Runtime details

The callback must never automatically execute the related action.

It only changes the learner's location or attention.

---

# Recommended Layout

```text
What to do next

[Confidence Signal]

Action Title

Action Description

Why this is recommended

Recommendation Source

[Go to recommended action]
```

The action title should receive the strongest visual emphasis.

The supporting Runtime details should remain secondary.

---

# Placement

The panel should appear after the Project Snapshot and before the detailed Runtime interpretation.

Recommended order:

```text
Project Snapshot

↓

What to do next

↓

Runtime Interpretation

↓

Project Flow

↓

Project Timeline
```

The panel should not appear above Project Setup.

The learner should first understand the active project context before seeing the recommendation.

---

# Conditional Rendering

The panel should render only when a Runtime Next Action exists.

```tsx
{runtimeNextAction ? (
  <RuntimeNextActionPanel
    action={runtimeNextAction}
    onNavigate={handleNextActionNavigation}
  />
) : null}
```

This conditional rendering normally belongs in:

- `App.tsx`, or
- the parent component responsible for composing Runtime result sections

The exact location depends on where Project Snapshot and Runtime Interpretation are currently rendered.

---

# Confidence Presentation

Internal confidence values:

```text
high
medium
low
```

Recommended user-facing labels:

```text
high   → Clear signal
medium → Developing signal
low    → Early signal
```

The UI should avoid presenting confidence as mathematical certainty.

Confidence describes the strength of the available Runtime evidence.

---

# Source Presentation

The panel may show a supporting source label such as:

- Recommended Focus
- Adaptive Coaching
- Next Question
- Decision Review
- Project activity without Reflection
- Reflection without GitHub context
- Early project continuity

The source should remain visually secondary to the recommended action.

---

# Navigation Behavior

When `isActionable` is `true`, the panel may show:

```text
Go to recommended action
```

The navigation callback should:

- scroll to the related section
- focus the relevant input when appropriate
- preserve the current Runtime result
- avoid triggering any action automatically

The learner must always make the final decision.

---

# Non-actionable State

When `isActionable` is `false`:

- the recommendation should still be displayed
- the reason should remain visible
- the navigation control should be hidden or disabled
- the UI should explain what additional context is needed

Example:

```text
Add one meaningful project or Reflection event.
```

---

# Visual Principles

## One primary action

Only one action should receive primary emphasis.

The panel must not become another dashboard containing multiple competing recommendations.

## Explanation after action

The learner should first see:

```text
What should I do?
```

Then:

```text
Why?
```

## Human language

The UI should present actions in direct language.

Good:

```text
Write one Reflection explaining why the latest project change was necessary.
```

Avoid:

```text
Missing Reflection rule matched.
```

## Runtime evidence remains visible

The panel does not replace the detailed Runtime analysis.

It creates an entry point into that analysis.

---

# PR-041B Boundary

PR-041B introduces:

- `RuntimeNextActionPanel`
- panel styling
- confidence labels
- source presentation
- optional navigation callback
- conditional panel placement

PR-041B should avoid:

- changing Runtime-private
- changing Runtime contracts
- adding new recommendation rules
- modifying rule priority
- automatically executing actions
- deeply integrating live Runtime response mapping

Live integration belongs to PR-041C.

---

# Testing

The UI should be verified with fixture actions covering:

- high-confidence actionable state
- medium-confidence actionable state
- low-confidence actionable state
- non-actionable fallback state
- long title and description
- missing optional navigation callback

Validation should include:

- component rendering
- responsive layout
- keyboard accessibility
- navigation callback behavior
- `npm run dev`
- `npm run build`

---

# Long-term Goal

The Runtime Next Action UI Layer moves Landing from displaying analysis to guiding attention.

```text
Runtime Viewer

↓

Runtime Coach
```

The learner still controls every action.

Landing makes the next meaningful step easier to understand.

---

# Runtime Why Layer

The Why Layer explains why the selected Runtime Next Action has priority.

It receives the resolved recommendation and exposes:

- summary
- context
- priority reason
- expected outcome
- explanation priority

The UI displays the summary first and allows the learner to expand the full explanation.

The Why Layer does not expose:

- candidate scores
- candidate IDs
- raw Runtime signals
- project evidence payloads

Those belong to the Runtime Evidence Layer.