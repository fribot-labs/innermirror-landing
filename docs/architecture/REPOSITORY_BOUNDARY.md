# Repository Boundary

This document defines the official repository boundary of `innermirror-landing`.

The Landing is the public Project-Based Learning interface of the Fribot ecosystem.

It owns learner interaction, GitHub communication, project workflow, and Runtime presentation.

It never generates Runtime intelligence.

---

# Repository Identity

`innermirror-landing` is the official **Project-Based Learning Presentation Repository**.

Its responsibilities are:

- guide learners into project-based learning
- capture learning context
- communicate with the Runtime
- present Runtime intelligence

The Landing prepares learning context.

The Runtime interprets learning context.

---

# This Repository Owns

`innermirror-landing` owns:

## GitHub Learning Entry

- GitHub connection UI
- Repository selection UI
- Project creation UI
- Project summary UI

---

## Reflection Workflow

- Reflection input
- Reflection editor
- Reflect + GitHub Analyze workflow

---

## GitHub Snapshot

- manual GitHub Snapshot capture
- Snapshot presentation
- Snapshot state management

---

## Runtime Communication

- Runtime Contract submission
- Runtime API adapter
- Runtime response mapping
- Runtime loading state
- Runtime error state

---

## Presentation

- Coaching presentation
- Decision Review presentation
- Progress visualization
- Portfolio presentation

---

## Local State

- temporary local UI cache
- offline recovery UI
- local Reflection persistence

---

# This Repository Does Not Own

`innermirror-landing` does **not** own:

- Reflection analysis
- GitHub Snapshot interpretation
- Runtime Context generation
- Runtime Summary generation
- Runtime Question generation
- Runtime Coaching generation
- Decision Review generation
- Continuity Intelligence
- Runtime Memory
- Runtime orchestration
- proprietary AI reasoning
- prompt engineering

These responsibilities belong to:

```text
innermirror-runtime-private
```

---

# Runtime-Related Folder Policy

Landing contains Runtime-related folders.

These folders exist only to support Runtime communication and presentation.

They must never become Runtime intelligence.

---

## `src/runtime-adapter/`

Purpose

Runtime communication.

Allowed

- Runtime Contract submission
- Runtime API communication
- Runtime response validation
- timeout recovery
- adapter hooks

Not allowed

- Reflection analysis
- Coaching generation
- Decision Review generation
- Runtime orchestration

---

## `src/runtime/`

Purpose

Runtime presentation mapping.

Allowed

- Runtime response mapping
- presentation data
- timeline mapping
- continuity surface data
- memory presentation
- recovery presentation

Not allowed

- learner analysis
- coaching generation
- decision generation
- Runtime reasoning

---

## `src/runtime-local/`

Purpose

Temporary presentation state.

Allowed

- local Reflection cache
- offline recovery
- local synchronization state

Not allowed

- Runtime Memory
- cognitive processing
- learning intelligence
- decision analysis

---

## `src/github/`

Purpose

GitHub communication.

Allowed

- GitHub Snapshot capture
- Snapshot preparation
- Snapshot normalization
- Snapshot state
- Repository communication

Not allowed

- GitHub interpretation
- learner evaluation
- coaching generation
- Runtime reasoning

GitHub communication belongs to Landing.

GitHub interpretation belongs to Runtime.

---

## `src/components/github/`

Purpose

GitHub presentation.

Allowed

- GitHub Learning Entry
- Repository Selector
- GitHub Snapshot Panel

These components display GitHub information.

They do not interpret GitHub information.

---

# Allowed Runtime Interaction

Landing communicates through Runtime Contract V2.

```text
Reflection

+

Project Context

+

Repository Context

+

GitHub Snapshot

+

Learning Context

↓

Runtime Contract V2

↓

Runtime
```

Landing prepares Runtime input.

Runtime performs analysis.

Landing presents results.

---

# Disallowed Pattern

The following logic must never exist inside the Landing.

```ts
generateSummary(...)
generateQuestion(...)
generateCoaching(...)
generateDecisionReview(...)
analyzeReflection(...)
analyzeGitHubSnapshot(...)
detectContinuity(...)
```

If code generates learning intelligence, it belongs to Runtime.

---

# Manual GitHub Policy

GitHub Snapshot is captured only when the learner explicitly requests analysis.

Official workflow:

```text
Reflect + GitHub Analyze

↓

Capture GitHub Snapshot

↓

Runtime
```

The MVP intentionally excludes:

- Webhook
- Scheduler
- Polling
- Background synchronization

The learner remains in control of GitHub analysis.

---

# Repository Relationships

## fribot-learning

Owns:

- curriculum
- learning templates
- educational documentation
- roadmap

---

## innermirror-runtime-private

Owns:

- Runtime Context
- Reflection analysis
- GitHub interpretation
- Summary
- Question
- Coaching
- Decision Review
- Runtime Memory
- Continuity Intelligence

---

## fribot-flow-timeline

Owns:

- historical implementation
- UX experiments
- development archive

Landing may reference ideas but should never depend on archived code.

---

# Feature Placement Guide

| Feature | Repository |
|----------|------------|
| GitHub Learning Entry | innermirror-landing |
| Repository Selection | innermirror-landing |
| Project Creation | innermirror-landing |
| Project Summary | innermirror-landing |
| Reflection Input | innermirror-landing |
| Manual GitHub Snapshot | innermirror-landing |
| Runtime API Adapter | innermirror-landing |
| Runtime Response Mapping | innermirror-landing |
| Coaching Presentation | innermirror-landing |
| Decision Review Presentation | innermirror-landing |
| Runtime Context | innermirror-runtime-private |
| Reflection Analysis | innermirror-runtime-private |
| GitHub Interpretation | innermirror-runtime-private |
| Runtime Summary | innermirror-runtime-private |
| Runtime Coaching | innermirror-runtime-private |
| Decision Review | innermirror-runtime-private |
| Runtime Memory | innermirror-runtime-private |

---

# Security Rule

`innermirror-landing` is public.

Therefore it must never contain:

- proprietary prompts
- Runtime intelligence
- cognitive analysis algorithms
- learner evaluation logic
- long-term memory processing

Public presentation is allowed.

Private intelligence is not.

---

# Foundation Principle

The Landing creates the learning experience.

GitHub provides development evidence.

The Runtime creates learning intelligence.

Keeping these responsibilities separated preserves the security, maintainability, and long-term evolution of the Fribot ecosystem.
