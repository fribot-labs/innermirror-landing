# ARCHITECTURE_GOVERNANCE.md

This document defines the long-term architectural governance of the **innermirror-landing** repository.

Its purpose is to preserve the architectural responsibilities established by the Foundation Documentation while supporting the evolution of the Project-Based Learning (PBL) experience.

Architecture evolves.

Responsibilities remain stable.

This document defines those responsibilities.

---

# Purpose

The Landing is the public Project-Based Learning experience of the Fribot ecosystem.

It guides learners through:

- GitHub Learning Entry
- Project creation
- Reflection
- Manual GitHub Snapshot
- Runtime communication
- Runtime result presentation

The Landing owns the learner experience.

The Runtime owns learning intelligence.

---

# Governance Scope

Repository

```text
innermirror-landing
```

Governance applies to:

- learner experience
- project workflow
- GitHub communication
- Runtime communication
- presentation architecture
- repository boundaries
- Foundation alignment

Every new Landing feature should comply with these governance rules.

---

# Landing Responsibilities

The Landing owns the following responsibilities.

## GitHub Learning

- GitHub Learning Entry
- GitHub Connection
- Repository Selection
- Manual GitHub Snapshot Capture

---

## Project Workflow

- Project Creation
- Project Summary
- Milestone Presentation
- Progress Visualization

---

## Reflection Workflow

- Reflection Input
- Reflection Editor
- Reflect + GitHub Analyze

---

## Runtime Communication

- Runtime Contract submission
- Runtime API Adapter
- Runtime response mapping
- Runtime loading state
- Runtime error state

---

## Presentation

- Coaching presentation
- Decision Review presentation
- Portfolio presentation

---

## Local State

- temporary Reflection cache
- offline recovery
- local presentation state

These responsibilities define the identity of the Landing.

---

# Responsibilities Outside Landing

The Landing does **not** own:

- Reflection Analysis
- GitHub Snapshot interpretation
- Runtime Context generation
- Runtime Summary generation
- Runtime Question generation
- Runtime Coaching generation
- Decision Review generation
- Runtime Memory
- Continuity Intelligence
- Runtime orchestration
- Runtime diagnostics
- proprietary AI reasoning

These responsibilities belong exclusively to:

```text
innermirror-runtime-private
```

Landing should never gradually absorb Runtime intelligence.

---

# Repository Relationships

The Landing collaborates with other repositories through stable Runtime Contracts.

---

## fribot-learning

Provides:

- curriculum
- educational structure
- learning templates
- educational documentation
- roadmap

Landing presents educational information.

It does not define educational policy.

---

## innermirror-runtime-private

Provides:

- Runtime Context
- Reflection Analysis
- GitHub interpretation
- Summary
- Question
- Coaching
- Decision Review
- Runtime Memory
- Continuity Intelligence

Landing prepares Runtime input.

Runtime generates learning intelligence.

Landing presents Runtime output.

---

## fribot-flow-timeline

Provides:

- historical UX ideas
- archived implementation
- development history

Landing may reference UX concepts.

Landing should never depend on archived implementation.

---

# Landing Architecture

The Landing follows the architecture below.

```text
GitHub Learning Entry

↓

Project

↓

Reflection

↓

GitHub Snapshot

↓

Runtime Contract

↓

Runtime API Adapter

↓

Runtime Response Mapping

↓

Presentation Components

↓

Learner Experience
```

Landing captures learning context.

Runtime interprets learning context.

---

# Governance Rules

## Rule 1

The Landing owns presentation.

The Runtime owns intelligence.

---

## Rule 2

The Landing owns GitHub communication.

The Runtime owns GitHub interpretation.

GitHub communication must never migrate into the Runtime.

---

## Rule 3

Reflection always belongs to a Project.

Reflection should never become an isolated workflow again.

---

## Rule 4

GitHub Snapshot is always captured manually.

Official workflow:

```text
Reflect + GitHub Analyze

↓

Capture Snapshot

↓

Runtime
```

Automatic synchronization is prohibited during the MVP.

---

## Rule 5

Landing communicates with Runtime only through Runtime Contracts.

Landing must never call internal Runtime modules directly.

---

## Rule 6

Landing must never generate:

- Summary
- Question
- Coaching
- Decision Review
- Continuity Intelligence

These belong to Runtime.

---

## Rule 7

Presentation should remain independent.

UI improvements should not require Runtime modifications whenever possible.

---

# Governance Maintenance

This document should be reviewed whenever:

- Project workflow changes
- Runtime Contract changes
- GitHub integration changes
- repository boundaries change
- new presentation architecture is introduced

Routine UI implementation should not require updates to this document.

---

# Relationship with Other Documents

This document complements:

- REPOSITORY_BOUNDARY.md
- LANDING_RESPONSIBILITY_AUDIT.md
- LANDING_RESPONSIBILITY_MATRIX.md
- PBL_PROJECT_DOMAIN_MODEL.md
- GITHUB_SNAPSHOT_INTEGRATION.md

These documents describe the Landing.

This document governs the Landing.

---

# Foundation Principle

The Learning Platform provides education.

The Landing provides the Project-Based Learning experience.

GitHub provides development evidence.

The Runtime provides learning intelligence.

Projects organize learning.

Reflection records learner thinking.

Keeping these responsibilities independent preserves the architectural clarity, maintainability, and long-term evolution of the Fribot ecosystem.
