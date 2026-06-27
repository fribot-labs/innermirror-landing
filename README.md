<p align="center">
  <img src="assets/logo/fribot-logo.png" width="96" />
</p>

<h1 align="center">InnerMirror Landing</h1>

<p align="center">
  Public presentation layer for the InnerMirror + Fribot PBL ecosystem.
</p>

---

## Purpose

This repository is the official public user interface of the Fribot ecosystem.

It provides the learner experience by:

- collecting learner input
- communicating with the private Runtime
- presenting Runtime intelligence
- visualizing learning progress

The Landing presents intelligence.

It does not generate intelligence.

---

## Architecture Boundary

```
Learner

↓

InnerMirror Landing

↓

Runtime API

↓

Private Runtime

↓

Structured Runtime Response

↓

Landing Presentation
```

The Landing is the presentation layer.

The Runtime remains completely independent from the user interface.

---

## Repository Identity

The Landing owns:

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

The Landing does **not** own:

- Reflection Analysis
- Reflection Summary Generation
- Runtime Question Generation
- Continuity Intelligence
- Decision Review Generation
- PBL Coaching Generation
- Runtime Memory
- Runtime Orchestration
- Proprietary AI reasoning

Runtime intelligence belongs exclusively to:

```
innermirror-runtime-private
```

---

## Landing Architecture

The Landing follows the architecture below.

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

It never interprets learner cognition locally.

---

## Architecture Governance

The Landing follows a strict architectural governance model.

Core principles include:

- Landing owns presentation.
- Runtime owns intelligence.
- Learning Platform owns education.
- Landing communicates only through Runtime contracts.
- Runtime reasoning must never exist inside the Landing.
- Presentation should remain independent from Runtime implementation.

These governance rules preserve long-term architectural consistency.

---

## Architecture Documents

Detailed Landing documentation is available under:

```
docs/architecture/

REPOSITORY_BOUNDARY.md

LANDING_RESPONSIBILITY_AUDIT.md

LANDING_RESPONSIBILITY_MATRIX.md

ARCHITECTURE_GOVERNANCE.md
```

Developers should review these documents before introducing new Landing functionality.

---

## Current Status

Current Phase

```
Phase 0

Repository Boundary

↓

Architecture Governance

↓

Responsibility Verification

✓ Complete
```

Next Phase

```
Phase 1

GitHub Learning Entry

↓

Repository Selection

↓

Reflection Workflow

↓

Runtime Integration
```

---

## Foundation Principle

The Learning Platform provides direction.

The Landing provides experience.

The Runtime provides understanding.

Maintaining these responsibilities independently is the foundation of the long-term Fribot architecture.
