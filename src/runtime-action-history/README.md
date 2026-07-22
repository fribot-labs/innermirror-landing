# Runtime Action History

Runtime Action History preserves the lifecycle of Runtime recommendations for each active project.

The Runtime Recommendation Engine determines the most useful next action at the current moment. The History layer records how that recommendation changes over time, how the learner responds, and whether the recommended action is completed, replaced, repeated, or left unresolved.

---

## Purpose

Before this module was introduced, Runtime recommendations existed only as current UI state.

When project data changed, the previous recommendation disappeared.

Runtime Action History adds continuity by preserving:

- what Runtime recommended
- when the recommendation first appeared
- whether the learner navigated to the recommended area
- which project-state change completed the recommendation
- which recommendation replaced it
- whether the same recommendation returned later
- which recommendation is currently active

The module allows Runtime to move from a disposable next-action interface toward a long-term coaching continuity system.

---

## Core Flow

```text
Project and Runtime State

↓

Runtime Recommendation Engine

↓

RuntimeNextAction

↓

Recommendation Observation

↓

History Entry

↓

Navigation / Completion / Replacement

↓

Recommendation History UI
```

---

## Responsibility Boundary

### Runtime Recommendation Engine

Determines:

```text
What should the learner do next?
```

### Runtime Why Layer

Explains:

```text
Why is this action important now?
```

### Runtime Evidence Layer

Shows:

```text
What observable signals support this recommendation?
```

### Runtime Action History

Preserves:

```text
What was recommended?

How did the learner respond?

Did the relevant project state change?

Was the recommendation completed, replaced, or repeated?
```

The History module does not calculate recommendation priority.

It observes and preserves the result produced by the Recommendation Engine.

---

## Architecture

```text
useRuntimeActionHistory

├─ observes the current RuntimeNextAction
├─ creates a stable observation key
├─ prevents duplicate React-render observations
├─ records navigation
├─ synchronizes localStorage
└─ exposes project-specific History data

runtimeActionHistoryReducer

├─ creates History entries
├─ updates active entries
├─ completes recommendations
├─ supersedes replaced recommendations
├─ records transitions
├─ detects repeated recommendations
└─ preserves the active entry

runtimeActionCompletionRules

├─ compares starting and current project state
├─ creates completion evidence
└─ prevents navigation from being treated as completion

runtimeActionHistoryStore

├─ loads History state
├─ normalizes stored data
├─ saves localStorage state
├─ separates projects
├─ limits retained entries
└─ recovers from malformed storage

createRuntimeActionHistoryViewModel

├─ converts internal statuses into user-facing labels
├─ formats timestamps
├─ sorts the current recommendation first
├─ maps completion evidence labels
└─ prepares History statistics and card data
```

---

## Files

```text
src/runtime-action-history/
├─ runtimeActionHistoryTypes.ts
├─ createRuntimeActionFingerprint.ts
├─ createRuntimeActionHistorySnapshot.ts
├─ runtimeActionHistoryStore.ts
├─ runtimeActionHistoryReducer.ts
├─ runtimeActionCompletionRules.ts
├─ useRuntimeActionHistory.ts
├─ createRuntimeActionHistoryViewModel.ts
└─ README.md
```

---

## History Lifecycle

Each recommendation entry has one lifecycle status.

```ts
type RuntimeActionHistoryStatus =
  | "active"
  | "navigated"
  | "completed"
  | "superseded";
```

### active

The recommendation is currently active and has not yet been navigated to.

### navigated

The learner used the recommendation navigation action.

Navigation does not mean the recommendation is complete.

The UI continues to show this entry as:

```text
Current
```

while the navigation count is displayed separately as:

```text
Visited 1
```

### completed

A relevant project-state change confirms that the recommendation was completed.

Examples:

- a GitHub Snapshot was captured
- a Reflection was recorded
- Current Focus changed
- Runtime analysis was completed
- a connected project event was added

### superseded

The recommendation was replaced before completion evidence was observed.

The UI displays this state as:

```text
Replaced
```

---

## Resolution State

Lifecycle status and repetition are stored separately.

```ts
type RuntimeActionResolutionState =
  | "new"
  | "repeated"
  | "unresolved";
```

### new

The recommendation fingerprint has not appeared previously for the project.

### repeated

The same recommendation pattern appeared again after an earlier occurrence.

### unresolved

The same recommendation continues to return without confirmed resolution.

This separation allows an entry to be both:

```text
Completed + Repeated
```

or:

```text
Current + Repeated
```

without overloading the lifecycle status.

---

## Recommendation Fingerprint

A deterministic fingerprint identifies the same recommendation across React renders and later reappearances.

The fingerprint is composed from:

```text
project ID
action kind
navigation target
action source
normalized title
```

Example:

```text
project-id
::
write-reflection
::
reflection
::
recommended-focus
::
write-one-reflection-explaining-the-latest-project-change
```

The project ID is included so recommendations from different projects cannot collide.

Object identity is not used because `RuntimeNextAction` may be recreated during rendering.

---

## Recommendation Snapshot

The complete `RuntimeNextAction` object is not stored.

History preserves a compact snapshot containing:

- action kind
- title
- description
- navigation target
- confidence
- source
- source label
- Why summary
- Evidence summary
- signal count

This keeps History understandable without duplicating the full current Runtime payload.

---

## Observation Snapshot

Completion rules compare project state from two moments:

```text
Recommendation Start State

↓

Current Project State
```

The observation snapshot contains:

```ts
type RuntimeActionObservationSnapshot = {
  reflectionCount: number;
  githubSnapshotRevision: string | null;
  currentFocus: string | null;
  connectedEventCount: number;
  runtimeAnalysisRevision: string | null;
};
```

### startedFrom

The project state when the recommendation first became active.

### lastObservedState

The most recent project state observed for the entry.

### lastObservationKey

A stable key used to prevent the same recommendation and project state from being recorded repeatedly during React rerenders or StrictMode execution.

---

## Completion Rules

Completion is based on actual state change.

```text
Navigation click
≠
Recommendation completion
```

### Analyze GitHub

Completed when:

- the first GitHub Snapshot is created, or
- the Snapshot revision changes

### Write Reflection

Completed when:

- the project Reflection count increases

### Reflection + GitHub Analysis

Completed when:

- a Reflection is added and Runtime analysis changes, or
- a Reflection is added and the GitHub Snapshot changes

### Continue Project Work

Completed when:

- a connected project event is added, or
- the GitHub Snapshot changes

### Stabilize Current Focus

Completed when:

- Current Focus changes, or
- a follow-up Runtime analysis confirms work on the same focus

### Review Project Direction

Completed when:

- a Reflection is added
- Current Focus changes
- Runtime analysis changes

### Insufficient Context

Completed when additional usable context becomes available, including:

- Reflection
- GitHub Snapshot
- connected project event
- Current Focus
- Runtime analysis

---

## Completion Evidence

When a recommendation is completed, the module records structured evidence.

Supported evidence types:

```text
github-snapshot-created
github-snapshot-updated
reflection-recorded
current-focus-updated
runtime-analysis-completed
connected-event-added
fallback-resolved
```

The presentation layer converts these internal values into user-facing labels.

Examples:

```text
github-snapshot-created
→ GitHub activity captured

reflection-recorded
→ Reflection added

runtime-analysis-completed
→ Runtime analysis completed
```

---

## Navigation Recording

Recommendation navigation is recorded independently.

```text
Go to GitHub Analysis
Go to Reflection
Go to Current Focus
```

Each click creates a navigation event for the active recommendation entry.

The History UI displays the number as:

```text
Visited 1
```

Navigation counts are entry-specific.

When a new recommendation is created, its count starts at zero.

Example:

```text
Capture GitHub activity
Visited 1
Completed

Write one Reflection
Visited 0
Current
```

This is expected behavior.

---

## Transitions

The History reducer records recommendation transitions.

Supported types:

```text
initial
changed
repeated
completed-and-advanced
superseded
```

### initial

The first recommendation recorded for the project.

### changed

The recommendation changed without a more specific completion or replacement classification.

### repeated

A previously observed recommendation returned.

### completed-and-advanced

The previous recommendation was completed and Runtime advanced to the next action.

### superseded

The previous recommendation was replaced before completion.

Transitions are currently stored for future analysis and UI expansion.

The primary MVP History UI focuses on recommendation entries rather than displaying a full transition graph.

---

## Persistence

History is stored in browser localStorage.

```text
innermirror.runtime-action-history.v1
```

The stored state contains:

```ts
type RuntimeActionHistoryState = {
  version: 1;
  entries: RuntimeActionHistoryEntry[];
  transitions: RuntimeActionTransition[];
  activeEntryId: string | null;
};
```

The store safely handles:

- unavailable localStorage
- invalid JSON
- schema mismatch
- malformed entries
- malformed transitions
- stale active entry IDs
- storage quota failure

If stored state cannot be restored safely, the module returns an empty History state.

---

## Storage Limits

The History store limits retained data to prevent unlimited browser storage growth.

```text
Maximum entries per project: 50
Maximum total transitions: 100
```

Older data is removed during normalization while preserving the most recent project history.

---

## Project Separation

Every History entry and transition contains a project ID.

```text
Project A History
≠
Project B History
```

The UI receives only the entries and transitions belonging to the active project.

Clearing one project does not remove History belonging to another project.

---

## Clear Past History

The UI provides:

```text
Clear past history
```

The action requires user confirmation.

```text
Clear past Runtime Action History for this project?
The current recommendation will remain.
```

After clearing, the current recommendation may immediately appear again as a new active entry.

This is expected because the Hook continues observing the current `RuntimeNextAction`.

The clear action removes past history, not the active Runtime recommendation itself.

---

## History UI

The History panel is positioned after the current Runtime recommendation and before deeper Runtime analysis.

```text
Current Recommendation

↓

Recommendation History

↓

Runtime V2 Result
```

This preserves the intended information hierarchy:

```text
What should I do now?

↓

What has Runtime recommended before?

↓

What does Runtime understand in depth?
```

### Default Panel State

The panel is collapsed by default.

```text
RUNTIME ACTION HISTORY
Recommendation history

Current
Completed 3
Repeated 1

▸ Show recommendation history
```

### Expanded State

When expanded:

- the current entry appears first
- the current entry is open by default
- completed and replaced entries are collapsed by default
- users can open individual past entries
- completion evidence appears only when details are expanded

### Entry Labels

```text
active / navigated current entry
→ Current

completed
→ Completed

superseded
→ Replaced

repeated
→ Repeated

unresolved
→ Needs attention
```

### Entry Details

Expanded cards may show:

- recommendation title
- description
- first-observed time
- completion time
- Why summary
- Evidence summary
- completion evidence
- signal count
- visited count

Internal values such as fingerprints, entry IDs, observation keys, and raw Runtime payloads are not exposed.

---

## View Model Boundary

React components do not directly interpret History domain values.

```text
RuntimeActionHistoryEntry

↓

createRuntimeActionHistoryViewModel

↓

RuntimeActionHistoryEntryViewModel

↓

History Components
```

The View Model handles:

- user-facing status labels
- status tones
- completion evidence labels
- timestamp formatting
- current-entry ordering
- completed count
- repeated count
- unresolved count
- navigation count

This keeps presentation logic out of the reducer and UI components.

---

## App Integration

The module is integrated after `RuntimeNextAction` is created.

```ts
const {
  projectEntries:
    runtimeActionHistoryEntries,

  projectTransitions:
    runtimeActionHistoryTransitions,

  activeEntry:
    activeRuntimeActionHistoryEntry,

  recordNavigation:
    recordRuntimeActionNavigation,

  clearProjectHistory:
    clearRuntimeActionProjectHistory,
} = useRuntimeActionHistory({
  projectId:
    activeProject?.id ?? null,

  action:
    runtimeNextAction,

  observation: {
    reflectionCount,

    githubSnapshotRevision:
      latestCapturedSnapshot?.capturedAt ??
      null,

    currentFocus:
      runtimeCurrentFocus,

    connectedEventCount,

    runtimeAnalysisRevision:
      runtimeV2Response !== null
        ? JSON.stringify(
            runtimeV2Response
          )
        : null,
  },
});
```

Recommendation navigation must record the event before scrolling.

```ts
const handleNextActionNavigation = (
  target: RuntimeNextActionTarget
) => {
  recordRuntimeActionNavigation(
    target
  );

  // Existing navigation behavior
};
```

The History panel receives project-specific data.

```tsx
<RuntimeActionHistoryPanel
  entries={
    runtimeActionHistoryEntries
  }
  transitions={
    runtimeActionHistoryTransitions
  }
  activeEntryId={
    activeRuntimeActionHistoryEntry
      ?.id ??
    null
  }
  onClear={
    handleClearProjectHistory
  }
/>
```

---

## Styling

History-specific styles are stored separately.

```text
src/styles/runtime-history.css
```

This keeps the existing Runtime recommendation styles and History styles independent.

```text
runtime.css
→ Recommendation, Why, Evidence, Runtime surfaces

runtime-history.css
→ History panel, entry cards, status badges, details
```

The History UI intentionally has lower visual priority than the current recommendation.

Only the active entry receives stronger emphasis.

---

## Validation Scenarios

### Project Start

Expected:

```text
Current
Capture the latest GitHub activity.

Completed 0
Repeated 0
Visited 0
```

### Recommendation Navigation

After clicking:

```text
Go to GitHub Analysis
```

Expected:

```text
Current
Visited 1
```

The entry remains `Current`.

### GitHub Analyze

Expected:

```text
Completed
Capture the latest GitHub activity.

Current
Write one Reflection...
```

Completion evidence:

```text
GitHub activity captured
```

### Reflection

Expected:

```text
Completed
Write one Reflection...
```

Completion evidence:

```text
Reflection added
```

### Recommendation Replacement

Expected:

```text
Replaced
Analyze the current Reflection...
```

### Repeated Recommendation

Expected:

```text
Repeated
```

and the panel repeated count increases.

### Clear Past History

Expected:

- confirmation dialog appears
- cancel preserves History
- confirm removes previous entries
- current recommendation is observed again as a new active entry

---

## Non-Goals

This module does not currently provide:

- server-side History synchronization
- multi-device History restoration
- recommendation debounce
- automatic filtering of short-lived recommendations
- full transition graph visualization
- advanced History search
- History export
- adaptive recommendation scoring
- recommendation quality evaluation
- automatic undo

These may be introduced in later Runtime evolution work.

---

## Future Direction

Runtime Action History provides the foundation for adaptive recommendation evolution.

Future systems may use History to understand:

```text
Which recommendations were completed?

Which recommendations were repeatedly ignored?

Which actions repeatedly returned?

How long did recommendations remain unresolved?

Which Runtime signals led to useful project movement?
```

Possible future architecture:

```text
Recommendation History

↓

Outcome Analysis

↓

Adaptive Recommendation Scoring

↓

Recommendation Evolution
```

---

## Design Principle

Runtime Action History is not intended to judge the learner.

It preserves the relationship between:

```text
Runtime recommendation

Learner response

Project-state change
```

The goal is to make the coaching path understandable and continuous.

```text
Current action

↓

Previous recommendation

↓

Observed completion

↓

Next direction
```

Runtime recommendations are no longer disposable UI messages.

They become part of the project's reflective continuity.