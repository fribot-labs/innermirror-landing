# InnerMirror Landing Documentation

This directory contains the architectural, product, and development documentation for the **InnerMirror Landing** repository.

The Landing repository is responsible for the public user interface, GitHub project integration, Reflection input, project presentation, and communication with the private Runtime.

It intentionally does **not** contain Runtime intelligence implementation.

---

# Documentation Structure

## Start Here

If you are new to this repository, read the following documents first.

1. [Documentation Index](./INDEX.md)
2. [One Pager](./ONE_PAGER.md)
3. [MVP](./MVP.md)
4. [Terminology](./TERMINOLOGY.md)
5. [Information Architecture](./INFORMATION_ARCHITECTURE.md)

---

# Product Foundations

These documents define the product itself.

| Document | Purpose |
|----------|---------|
| ONE_PAGER.md | Product overview |
| MVP.md | MVP scope |
| TERMINOLOGY.md | Official user-facing terminology |
| INFORMATION_ARCHITECTURE.md | Official information hierarchy |
| MVP_RELEASE_CHECKLIST.md | Release verification |

---

# Repository Architecture

The `architecture/` directory contains long-term repository governance documents.

Important documents include:

- ARCHITECTURE_GOVERNANCE.md
- REPOSITORY_BOUNDARY.md
- LANDING_RUNTIME_PRESENTATION_BOUNDARY.md
- LANDING_RESPONSIBILITY_MATRIX.md
- LANDING_RESPONSIBILITY_AUDIT.md
- RUNTIME_ADAPTER_BOUNDARY_AUDIT.md

These documents define what belongs inside the Landing repository and what must remain inside Runtime.

---

# GitHub Learning

Landing integrates GitHub repositories into the Runtime learning workflow.

Main documents:

- GITHUB_LEARNING_ENTRY.md
- GITHUB_SNAPSHOT_INTEGRATION.md
- PBL_PROJECT_DOMAIN_MODEL.md

Core flow:

```text
GitHub Repository
        ↓
Project Activity
        ↓
Project Timeline
        ↓
Runtime
```

---

# Runtime Presentation

Landing presents Runtime output but does not generate Runtime intelligence.

Presentation flow:

```text
Reflection
        ↓
Reflection Memory
        ↓
Memory Timeline

GitHub Repository
        ↓
Project Activity
        ↓
Project Timeline

Reflection + Project Activity
        ↓
Project Flow
        ↓
Runtime Interpretation
```

---

# Development Records

The repository also contains historical development records.

Examples:

- PR_001.md
- PR_002.md
- PR_017_RECORD_MERGE_ARCHIVE_SCHEMA.md
- RELEASE_v0.1.0.md

These documents explain how the repository evolved over time.

---

# Official Product Concepts

The Landing MVP officially uses the following concepts.

## User Input

- Reflection

## Memory

- Reflection Memory
- Memory Timeline

## GitHub

- Project Activity
- Project Timeline

## Interpretation

- Project Flow
- Runtime Interpretation

## Pattern Recognition

- Recurring Theme
- Identity Drift

These names should remain consistent throughout the repository.

---

# Before Adding a New Feature

Ask the following questions.

1. Is this user input?
2. Is this stored memory?
3. Is this a timeline?
4. Is this GitHub activity?
5. Is this project interpretation?
6. Is this Runtime interpretation?
7. Is this a recurring pattern?

Every new feature should belong to exactly one primary layer.

---

# Documentation Maintenance

Whenever a new long-lived feature is introduced:

1. Update `TERMINOLOGY.md` if a new user-facing concept is created.
2. Update `INFORMATION_ARCHITECTURE.md` if the information hierarchy changes.
3. Update `INDEX.md` if a new permanent documentation file is added.
4. Keep repository responsibility documents synchronized with implementation.

---

# Documentation Philosophy

Documentation should explain:

- **why** the system exists,
- **what** responsibility each repository owns,
- **where** each feature belongs,
- **how** information moves through the product.

Documentation should avoid duplicating implementation details that are already expressed clearly in the source code.