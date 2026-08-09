# Data Ownership Architecture

> **Ownership is the foundation of trust.**

This document defines the ownership boundaries of information managed by the InnerMirror ecosystem.

It establishes which system owns which information, how ownership is preserved, and how data is permanently removed when requested by the learner.

---

# Design Philosophy

InnerMirror is not designed to replace GitHub.

GitHub and InnerMirror have different responsibilities.

GitHub records software development.

InnerMirror records learning continuity.

Runtime interprets learning.

Ownership remains with the learner.

---

# Ownership Principles

The architecture follows five fundamental principles.

## Principle 1

GitHub repositories always belong to the learner.

InnerMirror never becomes the owner of:

- GitHub repositories
- source code
- commits
- pull requests
- branches

GitHub remains the authoritative source of software development history.

---

## Principle 2

InnerMirror owns only learner-generated continuity.

InnerMirror stores information necessary to provide:

- Reflection
- Learning Journey
- Project continuity
- Runtime interpretation
- Long-term learning history

This information exists independently from GitHub.

---

## Principle 3

Runtime owns interpretation.

Runtime does not own learner information.

Runtime generates:

- summaries
- recommendations
- learning continuity
- pattern detection
- predictive interpretation

These outputs are derived from learner-provided information.

---

## Principle 4

The learner always owns the complete history.

The learner may permanently remove every record stored by InnerMirror.

Deletion removes the learner's entire InnerMirror history.

Partial deletion by:

- project
- repository
- date
- Reflection

is intentionally not supported.

The learning journey is treated as one continuous record.

---

## Principle 5

Ownership never transfers.

Connecting GitHub does not transfer ownership.

Using Runtime does not transfer ownership.

Using AI does not transfer ownership.

InnerMirror never claims ownership of learner-created information.

---

# Information Ownership Model

```text
Learner

↓

Owns

GitHub Repository

Reflection

Project

Learning Journey

────────────────────────────

GitHub

↓

Stores

Source Code

Commit History

Branches

Pull Requests

────────────────────────────

InnerMirror

↓

Stores

Reflection

Project Context

Learning Journey

Current Focus

────────────────────────────

Runtime

↓

Generates

Summary

Recommendation

Continuity

Prediction
```

---

# Permanent Records

The following information is considered learner-owned permanent records.

## Identity

- Internal User ID
- GitHub Provider ID
- GitHub Username
- GitHub Email Address

---

## Learning

- Reflection
- Current Focus
- Learning Journey
- Project History
- Project Events

---

## Project

- Connected Repository
- Project Identity
- Template Origin
- Project Metadata

---

# Derived Information

Derived information is produced by Runtime.

Examples include:

- Summary
- Recommendation
- Continuity Analysis
- Learning Pattern
- Prediction

Derived information exists only to improve learner understanding.

It never changes learner ownership.

---

# Data Lifecycle

```text
Learner

↓

Reflection

↓

Project Context

↓

Runtime Interpretation

↓

Learning Continuity

↓

Account Deletion

↓

Complete Removal
```

---

# Account Deletion

When a learner requests deletion,

InnerMirror permanently removes:

- learner identity
- Reflection
- Project records
- Learning Journey
- Runtime-derived learner history
- GitHub connection metadata

InnerMirror does not remove:

- GitHub repositories
- GitHub commits
- GitHub pull requests
- GitHub branches
- GitHub organizations

GitHub remains completely independent.

---

# System Responsibility

GitHub is responsible for software development history.

InnerMirror is responsible for learning continuity.

Runtime is responsible for interpretation.

The learner remains the owner of every project.

---

# Architecture Boundary

```text
GitHub

↓

Project Evidence

────────────────────────

InnerMirror

↓

Learning Record

────────────────────────

Runtime

↓

Learning Intelligence
```

Ownership never crosses these boundaries.

---

# Foundation Statement

GitHub remembers what you built.

InnerMirror remembers what you learned.

Runtime helps explain the journey.

The learner owns all of it.