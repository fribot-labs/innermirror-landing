# Project Intelligence

The Project Intelligence layer derives a stable, deterministic interpretation of the learner's currently selected project.

It combines existing project information without performing AI inference, Runtime analysis, GitHub synchronization, or persistence.

---

## Purpose

InnerMirror Landing already maintains several project layers:

```text
GitHub Repository

↓

RuntimeProjectIdentity

↓

RuntimeProjectMetadata

↓

RuntimeProjectContext
```

Each layer has a different responsibility.

`RuntimeProjectIdentity` answers:

```text
Which repository is this project?
```

`RuntimeProjectMetadata` answers:

```text
What kind of project information is known?
```

`RuntimeProjectContext` answers:

```text
What learning context currently surrounds this project?
```

Project Intelligence combines these signals with the learner's current focus.

```text
RuntimeProjectMetadata
        \
         \
RuntimeProjectContext
          \
           → RuntimeProjectIntelligence
          /
currentFocus
```

The resulting object provides one normalized interpretation of the current project state.

---

## Current Scope

PR-LA13B introduces the first Project Intelligence contract and builder.

Current files:

```text
src/project-intelligence/

├─ runtimeProjectIntelligenceTypes.ts
├─ createRuntimeProjectIntelligence.ts
├─ README.md
└─ __tests__/
   └─ createRuntimeProjectIntelligence.test.ts
```

---

## RuntimeProjectIntelligence

The current v1 contract contains:

```text
intelligenceVersion

projectId

title

source

projectKind

difficulty

estimatedWeeks

learningGoal

currentFocus

readiness

summary

createdAt
```

The object is derived from existing project state rather than independently persisted.

---

## Input Sources

### RuntimeProjectMetadata

Provides:

```text
projectId

title

source

difficulty

estimatedWeeks

learningGoal
```

Metadata can originate from:

```text
repository-derived

or

pbl-manifest
```

Project Intelligence preserves that source instead of creating a new metadata origin.

---

### RuntimeProjectContext

Provides:

```text
projectId

kind
```

The complete Runtime Project Context also contains learning state such as:

```text
learningMode

learningStage

goal

currentMilestone

source

createdAt

updatedAt
```

The first Intelligence version intentionally does not consume all of these fields.

Only the context information required by the current contract is used.

This keeps the first Project Intelligence layer narrow and deterministic.

---

### Current Focus

`currentFocus` is supplied separately from the current Landing project-focus state.

Conceptually:

```text
currentStep

↓

currentFocus
```

The Intelligence layer normalizes the value before deriving readiness.

---

## Readiness

The first readiness model is intentionally minimal.

```text
currentFocus missing
or blank

↓

unfocused
```

```text
currentFocus available

↓

ready
```

Current values:

```ts
"unfocused"
"ready"
```

More advanced states such as:

```text
blocked

active

stalled

reviewing

completed
```

are intentionally outside the current scope.

Those states would require additional Runtime, GitHub, project-history, or learning-stage evidence.

---

## Deterministic Composition

Project Intelligence v1 does not use an LLM.

It does not attempt to infer hidden project properties.

The same normalized inputs produce the same semantic result, except for the generated timestamp when `createdAt` is omitted.

Conceptually:

```text
Metadata
+
Context
+
Current Focus

↓

Validation

↓

Normalization

↓

Readiness Resolution

↓

Summary Composition

↓

RuntimeProjectIntelligence
```

This makes the layer predictable and independently testable.

---

## Project Identity Validation

Metadata and Context must refer to the same project.

```text
metadata.projectId

must equal

context.projectId
```

If they differ, Project Intelligence creation fails.

This prevents unrelated project objects from being accidentally combined.

At the App boundary, temporary project mismatches are filtered before calling the builder.

---

## Normalization

The builder normalizes several input values.

### Current Focus

```text
null
→ null

"   "
→ null

"  Runtime Metadata UI  "
→ "Runtime Metadata UI"
```

### Title

A missing or blank title becomes:

```text
Untitled project
```

### createdAt

Valid dates are normalized to ISO format.

Invalid dates are rejected.

---

## Summary

The current summary is rule-based.

It does not represent an AI-generated recommendation.

For repository-derived metadata with no focus:

```text
fribot-learning is selected as the current learning project.
A current project focus has not been defined yet.
```

With a current focus:

```text
fribot-learning is selected as the current learning project.
The current focus is Runtime Metadata UI.
```

When richer PBL metadata exists, available difficulty, duration, and learning-goal information can also be included.

---

## No Unsupported Inference

Project Intelligence must not invent information that is not present in its inputs.

For example, repository-derived metadata containing:

```text
difficulty = null

estimatedWeeks = null

learningGoal = null
```

must remain:

```text
difficulty = null

estimatedWeeks = null

learningGoal = null
```

The repository name alone must not be used to guess these values.

---

## App Integration

`App.tsx` derives Project Intelligence using `useMemo`.

Conceptually:

```text
runtimeProjectMetadata
        +
runtimeProjectContext
        +
currentStep
        ↓
       useMemo
        ↓
runtimeProjectIntelligence
```

The Intelligence object is recalculated when any of these dependencies change.

This means:

```text
Repository changes

↓

Intelligence changes
```

and:

```text
Current Focus changes

↓

Intelligence changes
```

without maintaining a second synchronized Intelligence state.

---

## Derived State Policy

Project Intelligence is currently derived state.

It is not independently stored in:

```text
localStorage
```

and there is no:

```text
saveRuntimeProjectIntelligence()

loadRuntimeProjectIntelligence()

clearRuntimeProjectIntelligence()
```

API.

This is intentional.

The source-of-truth objects remain:

```text
RuntimeProjectMetadata

RuntimeProjectContext

current project focus
```

Project Intelligence can be recreated from those values.

---

## Sign Out Behavior

Project Intelligence requires valid Metadata and Context.

When Sign out clears those source objects:

```text
RuntimeProjectMetadata
→ null

RuntimeProjectContext
→ null
```

the derived Intelligence naturally becomes:

```text
null
```

No separate Intelligence cleanup operation is required.

---

## Repository Change Behavior

When the learner selects another repository:

```text
new Identity

↓

new Metadata

↓

new Context

↓

current focus reset

↓

new Project Intelligence
```

This prevents Intelligence from the previously selected repository from remaining active.

---

## Tests

The Project Intelligence builder currently includes coverage for:

```text
basic Intelligence creation

unfocused readiness

ready readiness

blank focus normalization

focus trimming

focus-aware summary

PBL manifest metadata preservation

PBL metadata summary composition

project kind preservation

projectId preservation

Metadata / Context project mismatch rejection

empty Metadata projectId rejection

empty Context projectId rejection

missing title fallback

blank title fallback

title trimming

createdAt ISO normalization

automatic timestamp generation

invalid timestamp rejection

input immutability

unsupported PBL inference prevention
```

Current result:

```text
21 tests

21 passed
```

---

## Architecture Boundary

This layer is responsible for:

```text
Project state composition

Project-state normalization

Basic readiness derivation

Deterministic project summary
```

It is not responsible for:

```text
GitHub API access

Repository metadata discovery

Manifest parsing

Metadata persistence

Context persistence

Runtime API calls

LLM analysis

Recommendation generation

Project Intelligence UI
```

Keeping these responsibilities separate prevents Project Intelligence from becoming another general-purpose Runtime layer.

---

## Relationship to Runtime Recommendation

Project Intelligence is intended to become a stable input for later recommendation work.

Future architecture may follow:

```text
Repository
    ↓
Identity
    ↓
Metadata
    ↓
Context
    ↓
Project Intelligence
    ↓
Runtime Recommendation
```

However, PR-LA13B does not yet connect Project Intelligence to recommendation generation.

That integration belongs to a later PR.

---

## Design Principle

The core principle of this layer is:

```text
Do not infer more than the project state supports.

First normalize what is known.

Then derive the smallest useful interpretation.
```

Project Intelligence should become richer only when reliable new project signals are available.

---

## PR-LA13B Scope

PR-LA13B establishes:

```text
RuntimeProjectIntelligence contract

+

deterministic Intelligence builder

+

validation and normalization rules

+

unit tests

+

App derived-state integration
```

It intentionally does not introduce a new learner-facing Intelligence surface.

---

## Next Step

The next planned layer is:

```text
PR-LA13C
Project Intelligence Presentation Layer
```

That PR can expose selected parts of:

```text
runtimeProjectIntelligence
```

to the learner.

Conceptually:

```text
Project Intelligence

↓

Presentation

↓

What project am I working on?

What is my current focus?

Is the project ready to proceed?

How can the current project state be summarized?
```

The Intelligence model should remain independent from that presentation layer.