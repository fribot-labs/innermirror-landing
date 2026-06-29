<p align="center">
  <img src="assets/logo/fribot-logo.png" width="96" />
</p>

<h1 align="center">InnerMirror Landing</h1>

<p align="center">
  Public PBL Learning Entry and Presentation Layer for the InnerMirror + Fribot ecosystem.
</p>

---

## Purpose

This repository is the official public application of the Fribot ecosystem.

The Landing provides the learner experience by:

- starting GitHub-based learning
- managing Project workflows
- collecting learner Reflection
- capturing GitHub Snapshots
- communicating with the private Runtime
- presenting Runtime intelligence
- visualizing project progress

The Landing presents learning.

The Runtime interprets learning.

---

## Architecture Boundary

```text
Learner

↓

GitHub Learning Entry

↓

Repository Selection

↓

Project

↓

Reflection

↓

Reflect + GitHub Analyze

↓

Runtime API

↓

Private Runtime

↓

Structured Runtime Response

↓

Landing Presentation
```

The Landing owns the learner experience.

The Runtime owns learning intelligence.

---

## Repository Identity

The Landing owns:

- GitHub Learning Entry
- GitHub Connection
- Repository Selection
- Project Creation
- Project Summary
- Reflection Input
- Reflection Editor
- Manual GitHub Snapshot Capture
- Runtime API Adapter
- Runtime Response Mapping
- UI State Management
- Progress Visualization
- Portfolio Presentation
- Coaching Presentation
- Decision Review Presentation

The Landing does **not** own:

- Reflection Analysis
- GitHub Interpretation
- Runtime Context
- Runtime Contract Interpretation
- Runtime Summary Generation
- Runtime Question Generation
- Runtime Coaching Generation
- Decision Review Generation
- Continuity Intelligence
- Runtime Memory
- Runtime Orchestration
- Proprietary AI reasoning

Runtime intelligence belongs exclusively to:

```text
innermirror-runtime-private
```

---

## Landing Architecture

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

Runtime API Adapter

↓

Runtime Response Mapping

↓

Presentation Components

↓

Learner Experience
```

The Landing captures learning context.

The Runtime interprets learning context.

---

## Manual GitHub Snapshot

The MVP intentionally avoids continuous GitHub synchronization.

GitHub data is collected only when the learner explicitly requests analysis.

Official workflow:

```text
Reflect + GitHub Analyze

↓

Capture GitHub Snapshot

↓

Runtime
```

The MVP intentionally excludes:

- GitHub Webhook
- Scheduler
- Polling
- Background synchronization

This keeps the learner in complete control of when project context is analyzed.

---

## PBL Project Model

The Landing organizes learning around Projects.

Official hierarchy:

```text
Project

↓

Milestone

↓

Pull Request

↓

Reflection
```

Reflection is no longer treated as an isolated record.

Reflection belongs to a Project.

---

## Runtime Relationship

The Landing prepares Runtime Contract V2 inputs.

Current Runtime Context includes:

- Reflection
- Project Context
- Repository Context
- GitHub Snapshot
- Learning Context

The Landing submits this context to the private Runtime.

The Runtime returns:

- Summary
- Question
- Coaching
- Decision Review

Landing never generates these outputs locally.

---

## Architecture Governance

The Landing follows strict architectural governance.

Core principles:

- Landing owns presentation.
- Runtime owns intelligence.
- Learning Platform owns education.
- GitHub communication belongs to the Landing.
- GitHub interpretation belongs to the Runtime.
- Runtime reasoning must never exist inside the Landing.
- Presentation must remain independent from Runtime implementation.

These principles preserve long-term architectural consistency.

---

## Architecture Documents

Detailed documentation is available under:

```text
docs/architecture/

README.md

REPOSITORY_BOUNDARY.md

LANDING_RESPONSIBILITY_AUDIT.md

LANDING_RESPONSIBILITY_MATRIX.md

PBL_PROJECT_DOMAIN_MODEL.md

GITHUB_SNAPSHOT_INTEGRATION.md

ARCHITECTURE_GOVERNANCE.md
```

Developers should review these documents before introducing new Landing functionality.

---

## Current Status

Current Phase

```text
Phase 1

✓ GitHub Learning Entry

↓

✓ Repository Selection

↓

✓ Project Domain

↓

✓ Manual GitHub Snapshot

↓

Runtime Contract V2 Ready
```

Next Phase

```text
Phase 2

Landing

↓

Runtime Contract V2

↓

Runtime V2 Pipeline

↓

Project-based Runtime Intelligence
```

---

## Foundation Principle

The Learning Platform provides education.

The Landing provides project-based learning experiences.

The Runtime provides learning intelligence.

GitHub provides development evidence.

Projects provide learning structure.

Reflection provides learner thinking.

Together they create one coherent Project-Based Learning experience.
