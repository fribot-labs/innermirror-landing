# Landing Architecture Documentation

This directory contains the official architecture documentation of the **InnerMirror Landing** repository.

These documents define how the Landing provides the public Project-Based Learning experience while communicating with the private Runtime through stable Runtime Contracts.

Together they define the architectural responsibilities, project workflow, GitHub integration boundary, and long-term governance of the Landing.

---

# Documentation Structure

```text
architecture/

README.md

↓

REPOSITORY_BOUNDARY.md

↓

RUNTIME_ADAPTER_BOUNDARY_AUDIT.md

↓

LANDING_RESPONSIBILITY_AUDIT.md

↓

LANDING_RESPONSIBILITY_MATRIX.md

↓

PBL_PROJECT_DOMAIN_MODEL.md

↓

GITHUB_SNAPSHOT_INTEGRATION.md

↓

ARCHITECTURE_GOVERNANCE.md
```

Each document owns one architectural responsibility.

---

# Document Guide

## REPOSITORY_BOUNDARY.md

Defines what the Landing owns and what it must never own.

Focus

- repository identity
- presentation responsibilities
- Runtime boundary
- public/private separation

---

## RUNTIME_ADAPTER_BOUNDARY_AUDIT.md

Records the Runtime Adapter boundary audit.

Focus

- Runtime API Adapter
- Runtime response mapping
- Runtime Contract communication
- local presentation state
- confirmation that Runtime intelligence is never implemented inside the Landing

---

## LANDING_RESPONSIBILITY_AUDIT.md

Records the current Landing implementation.

Focus

- current implementation
- presentation responsibility
- Runtime separation
- GitHub communication responsibility

This document records the current implementation rather than long-term architectural rules.

---

## LANDING_RESPONSIBILITY_MATRIX.md

Defines ownership of Landing responsibilities.

Focus

- GitHub Learning Entry
- Project workflow
- Runtime communication
- presentation ownership
- repository responsibility allocation

This document answers:

> Who owns this responsibility?

---

## PBL_PROJECT_DOMAIN_MODEL.md

Defines the Project-Based Learning domain model.

Focus

- Project
- Milestone
- Pull Request
- Reflection ownership
- Completion

This document defines how learning is organized inside the Landing.

---

## GITHUB_SNAPSHOT_INTEGRATION.md

Defines the GitHub Snapshot integration model.

Focus

- Manual GitHub Snapshot
- Repository communication
- Snapshot capture
- Runtime Context preparation
- MVP synchronization policy

This document defines how GitHub becomes part of the learning context.

---

## ARCHITECTURE_GOVERNANCE.md

Defines the long-term architectural rules of the Landing.

Focus

- governance
- presentation constraints
- Runtime communication policy
- GitHub boundary
- long-term evolution principles

This document answers:

> How should the Landing continue to evolve?

---

# Reading Order

New developers should read the documents in the following order.

```text
Repository Boundary

↓

Runtime Adapter Boundary Audit

↓

Landing Responsibility Audit

↓

Landing Responsibility Matrix

↓

PBL Project Domain Model

↓

GitHub Snapshot Integration

↓

Architecture Governance
```

This order moves from repository identity toward long-term governance.

---

# Documentation Philosophy

Landing architecture documentation is divided into four categories.

## Boundary

- Repository Boundary

Defines where the Landing begins and ends.

---

## Observation

- Runtime Adapter Boundary Audit
- Landing Responsibility Audit

These documents describe the current implementation.

---

## Structure

- Landing Responsibility Matrix
- PBL Project Domain Model
- GitHub Snapshot Integration

These documents describe how the Landing organizes learning.

---

## Governance

- Architecture Governance

Defines how the Landing should continue to evolve while preserving architectural consistency.

---

# Foundation Principle

The Learning Platform provides education.

The Landing provides project-based learning experiences.

GitHub provides development evidence.

The Runtime provides learning intelligence.

The Landing never interprets learner cognition.

The Runtime never presents learner experience.

Architecture documentation exists to preserve these responsibilities as the Fribot ecosystem evolves.
