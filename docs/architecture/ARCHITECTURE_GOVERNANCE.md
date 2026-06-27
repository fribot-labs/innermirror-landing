# ARCHITECTURE_GOVERNANCE.md

This document defines the long-term architectural governance of the **innermirror-landing** repository.

Its purpose is to preserve the architectural responsibilities established by the Foundation Documentation.

Rather than documenting the current implementation, this document defines the architectural rules that every future Landing implementation must continue to follow.

Architecture evolves.

Responsibilities do not.

This document exists to preserve those responsibilities throughout the lifetime of the Fribot ecosystem.

---

# Purpose

The Landing is the public presentation layer of the Fribot ecosystem.

Its responsibility is to provide the learner experience.

It collects user input, communicates with the Runtime, and presents Runtime intelligence.

It does not generate intelligence.

---

# Governance Scope

Repository

```
innermirror-landing
```

Governance applies to:

- presentation responsibilities
- Runtime communication
- UI architecture
- repository boundaries
- Foundation alignment

Every new Landing feature should comply with these governance rules.

---

# Landing Responsibilities

The Landing owns the following responsibilities.

- Reflection Input
- Reflection Editor
- GitHub Connection
- Repository Selection
- Runtime API Adapter
- Runtime Response Mapping
- UI State Management
- Progress Visualization
- Portfolio Display
- Coaching Presentation
- Decision Review Presentation
- Runtime Status Presentation

These responsibilities define the identity of the Landing.

---

# Responsibilities Outside Landing

The Landing does **not** own:

- Reflection Analysis
- Reflection Summary Generation
- Runtime Question Generation
- Continuity Intelligence
- Decision Review Generation
- PBL Coaching Generation
- Runtime Memory
- Runtime Orchestration
- Runtime Diagnostics

These responsibilities belong to **innermirror-runtime-private**.

Landing should never gradually absorb Runtime intelligence.

---

# Repository Relationship

The Landing collaborates with the other repositories through stable contracts.

## fribot-learning

Provides:

- educational structure
- project context
- roadmap
- learning templates

Landing presents educational information.

It does not define educational policy.

---

## innermirror-runtime-private

Provides:

- Reflection Analysis
- Reflection Summary
- Runtime Questions
- Decision Review
- PBL Coaching
- Continuity Intelligence
- Runtime Memory Status

Landing presents these Runtime results.

It never generates them.

---

## fribot-flow-timeline

Provides historical UX ideas and implementation history.

Landing may reference previous UX concepts.

It should not depend on archived implementation.

---

# Landing Architecture

The Landing follows the architectural hierarchy below.

```
Reflection Input

↓

Runtime API Adapter

↓

Runtime Response Mapping

↓

Presentation Components

↓

User Experience
```

Landing transforms Runtime responses into user experiences.

It does not interpret learner cognition.

---

# Governance Rules

## Rule 1

The Landing owns presentation.

It never owns intelligence.

---

## Rule 2

Every Landing component should have one primary responsibility.

Presentation components should remain presentation-focused.

---

## Rule 3

Landing communicates with Runtime only through stable Runtime contracts.

Landing should never call internal Runtime modules directly.

---

## Rule 4

Reflection Analysis belongs exclusively to the Runtime.

Landing must never introduce:

- Reflection Analysis
- Decision Review generation
- PBL Coaching generation
- Runtime reasoning

---

## Rule 5

Educational content belongs to the Learning Platform.

Landing may display educational information.

It should not become responsible for educational policy.

---

## Rule 6

Presentation should remain independent.

Changes to UI should not require Runtime modifications whenever possible.

---

# Governance Maintenance

This document should be reviewed whenever:

- presentation responsibilities change
- Runtime API contracts change
- repository boundaries change
- new UI architecture is introduced

Routine UI implementation should not require changes to this document.

---

# Relationship with Other Documents

This document complements:

- REPOSITORY_BOUNDARY.md
- LANDING_RESPONSIBILITY_AUDIT.md
- LANDING_RESPONSIBILITY_MATRIX.md

These documents describe the Landing.

This document governs the Landing.

---

# Foundation Principle

The Landing exists to present.

The Runtime exists to understand.

The Learning Platform exists to teach.

These responsibilities must remain independent regardless of how the Landing evolves.

A beautiful interface is valuable.

A well-governed architecture is sustainable.

The Landing should always prioritize architectural clarity over implementation convenience.
