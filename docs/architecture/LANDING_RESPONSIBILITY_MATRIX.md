# LANDING_RESPONSIBILITY_MATRIX.md

The Landing Responsibility Matrix defines the official ownership of presentation responsibilities within the Fribot ecosystem.

Its purpose is to ensure that the Landing repository remains responsible for user interaction while all Runtime intelligence remains inside the private Runtime.

This document complements the Runtime Responsibility Matrix.

---

# Purpose

Every responsibility belongs to one primary repository.

The Landing owns presentation.

The Runtime owns intelligence.

The Learning Platform owns education.

The Archive preserves history.

This matrix defines those ownership rules for the presentation layer.

---

# Landing Responsibility Matrix

| Responsibility | fribot-learning | innermirror-landing | innermirror-runtime-private | innermirror-engine-private | fribot-flow-timeline |
|----------------|-----------------|----------------------|-----------------------------|----------------------------|----------------------|
| Learning Templates | ✅ | ❌ | ❌ | ❌ | ❌ |
| Educational Documentation | ✅ | ❌ | ❌ | ❌ | ❌ |
| Foundation Documentation | ✅ | ❌ | ❌ | ❌ | ❌ |
| MVP Roadmap | ✅ | ❌ | ❌ | ❌ | ❌ |
| Reflection Input | ❌ | ✅ | ❌ | ❌ | ❌ |
| Reflection Editor | ❌ | ✅ | ❌ | ❌ | ❌ |
| GitHub Connection | ❌ | ✅ | ❌ | ❌ | ❌ |
| Repository Selection | ❌ | ✅ | ❌ | ❌ | ❌ |
| Runtime API Adapter | ❌ | ✅ | ❌ | ❌ | ❌ |
| Runtime Response Mapping | ❌ | ✅ | ❌ | ❌ | ❌ |
| Loading State | ❌ | ✅ | ❌ | ❌ | ❌ |
| Error State | ❌ | ✅ | ❌ | ❌ | ❌ |
| Progress Visualization | ❌ | ✅ | ❌ | ❌ | ❌ |
| Portfolio Display | ❌ | ✅ | ❌ | ❌ | ❌ |
| Coaching Result Display | ❌ | ✅ | ❌ | ❌ | ❌ |
| Decision Review Display | ❌ | ✅ | ❌ | ❌ | ❌ |
| Runtime Boundary Status | ❌ | ✅ | ❌ | ❌ | ❌ |
| Reflection Analysis | ❌ | ❌ | ✅ | ❌ | ❌ |
| Reflection Summary | ❌ | ❌ | ✅ | ❌ | ❌ |
| Runtime Question Generation | ❌ | ❌ | ✅ | ❌ | ❌ |
| Continuity Intelligence | ❌ | ❌ | ✅ | ❌ | ❌ |
| Decision Review Generation | ❌ | ❌ | ✅ | ❌ | ❌ |
| PBL Coaching Generation | ❌ | ❌ | ✅ | ❌ | ❌ |
| Runtime Memory | ❌ | ❌ | ✅ | ❌ | ❌ |
| Runtime Persistence | ❌ | ❌ | ✅ | ❌ | ❌ |
| Runtime Orchestration | ❌ | ❌ | ✅ | ❌ | ❌ |
| Experimental Runtime Research | ❌ | ❌ | ❌ | ✅ | ❌ |
| Historical UX Prototype | ❌ | ❌ | ❌ | ❌ | ✅ |
| Sandbox Experiment | ❌ | ❌ | ❌ | ❌ | ✅ |

---

# Landing Responsibilities

The Landing is responsible for the user experience.

Primary responsibilities include:

- Reflection Input
- GitHub Connection
- Repository Selection
- Runtime API Adapter
- Runtime Response Mapping
- UI State Management
- Progress Visualization
- Portfolio Display
- Coaching Presentation
- Decision Review Presentation

Landing presents Runtime intelligence.

It does not generate Runtime intelligence.

---

# Runtime Responsibilities

The Runtime remains responsible for:

- Reflection Analysis
- Reflection Summary
- Runtime Questions
- Continuity Intelligence
- Decision Review
- PBL Coaching
- Runtime Memory
- Runtime Orchestration

Landing should consume Runtime responses rather than reproduce these responsibilities.

---

# Learning Platform Responsibilities

The Learning Platform owns:

- educational content
- learning templates
- project-based curriculum
- documentation
- roadmap

Landing consumes educational context but does not own educational policy.

---

# Research Responsibilities

Experimental Runtime concepts belong to:

```
innermirror-engine-private
```

Landing should never depend directly on experimental Runtime implementations.

---

# Archive Responsibilities

Historical implementation belongs to:

```
fribot-flow-timeline
```

The Landing may reference historical UX ideas, but active implementation belongs to `innermirror-landing`.

---

# Responsibility Rules

Before implementing a new feature, ask:

1. Does this present Runtime results?

→ Landing

---

2. Does this analyze learner data?

→ Runtime

---

3. Does this define educational content?

→ Learning Platform

---

4. Is this experimental?

→ Engine Research

---

5. Is this historical?

→ Archive

---

# Responsibility Violations

The following examples violate Landing responsibilities.

## Landing

Should NOT contain

- Reflection Analysis
- Runtime Summary Generation
- Decision Review Generation
- PBL Coaching Generation
- Continuity Intelligence
- Runtime Memory Processing

---

## Runtime

Should NOT contain

- React Components
- JSX
- Portfolio Rendering
- User Interface
- Progress Display

---

## Learning Platform

Should NOT contain

- Runtime API
- Reflection Analysis
- Runtime Intelligence

---

## Archive

Should NOT contain

- Active MVP UI
- Production Runtime
- Production Learning Platform

---

# Maintenance Policy

The Landing Responsibility Matrix should be updated whenever:

- Landing gains a new presentation responsibility
- Runtime responsibilities change
- Repository boundaries change
- new repositories are introduced

Routine UI improvements should not require modifications to this document.

---

# Foundation Principle

The Landing creates the experience.

The Runtime creates the intelligence.

The Learning Platform creates the educational journey.

Each repository should own one primary responsibility.

Maintaining this separation preserves the long-term architecture of the Fribot ecosystem.
