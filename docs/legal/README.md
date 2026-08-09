# Legal Documentation

> **Legal architecture for the InnerMirror platform.**

This directory defines the legal, privacy, ownership, and compliance foundations of the InnerMirror service.

Unlike implementation documents, the documents in this directory define **what the service is allowed to do**, **what it must never do**, and **how learner rights are protected**.

These documents are the foundation for every future implementation.

---

# Purpose

InnerMirror is an online Reflection and Project Continuity service.

Because the service stores learner-created information over long periods of time, legal architecture is treated as part of the system architecture.

Every persistence decision should first be justified by legal and ownership principles before implementation begins.

---

# Design Philosophy

The legal architecture follows the principle:

```text
Legal Foundation

↓

Privacy

↓

Data Ownership

↓

Personal Data Inventory

↓

Persistence

↓

Database

↓

Security

↓

Implementation
```

Implementation must always follow the legal architecture.

Legal documents are not generated after development.

They define the boundaries of development.

---

# Document Structure

## LEGAL_FOUNDATION.md

Defines the legal identity of the InnerMirror service.

Topics include:

- service classification
- operating entity
- learner identity
- ownership principles
- legal boundaries
- MVP scope

---

## LEGAL_READINESS.md

Tracks the legal readiness of the current service.

Topics include:

- compliance checklist
- launch readiness
- unresolved legal issues
- production requirements

---

## PRIVACY.md

Located in the repository root.

Defines how personal information is processed.

Topics include:

- personal information
- processing purpose
- retention
- deletion
- learner rights

---

## DATA_OWNERSHIP.md

Defines ownership boundaries.

Topics include:

- learner ownership
- GitHub ownership
- Runtime-derived information
- deletion boundaries
- identity continuity

---

## PERSONAL_DATA_INVENTORY.md

Defines every category of personal information processed by the service.

Each item records:

- purpose
- source
- persistence status
- retention
- ownership

This document acts as the bridge between legal requirements and database design.

---

# Relationship with Architecture

Legal documentation is directly connected to the architecture documents.

```text
LEGAL_FOUNDATION.md

↓

DATA_OWNERSHIP.md

↓

PERSONAL_DATA_INVENTORY.md

↓

docs/architecture/

PERSISTENCE_DOMAIN_MODEL.md

↓

DATABASE_SCHEMA.md

↓

RLS_SECURITY_MODEL.md

↓

SUPABASE_MIGRATION_PLAN.md
```

This relationship intentionally keeps legal requirements ahead of technical implementation.

---

# Guiding Principles

The legal architecture is based on the following principles.

## Learner Ownership

The learner owns:

- projects
- Reflection
- learning journey

InnerMirror never becomes the owner of learner-created work.

---

## GitHub Independence

GitHub remains the authoritative software development platform.

InnerMirror does not:

- own GitHub repositories,
- modify GitHub repositories,
- delete GitHub repositories.

---

## Explicit Analysis

Analysis begins only when explicitly requested by the learner.

The current MVP does not:

- continuously monitor projects,
- perform automatic background analysis,
- connect learner information to external LLM analysis.

---

## Data Minimization

Only the minimum information required to provide the service should be processed or stored.

Information should never be stored merely because it is technically available.

---

## Transparency

Learners should always understand:

- what information is processed,
- why it is processed,
- how long it is retained,
- and how it can be permanently removed.

---

# Scope

The documents in this directory define:

- legal architecture
- ownership architecture
- privacy architecture
- compliance architecture

They do not define:

- UI implementation
- React components
- Runtime algorithms
- database SQL

Those topics belong to the architecture documents.

---

# Future Documents

Additional legal documents may be added as the service evolves.

Examples include:

```text
ACCOUNT_DELETION.md

SECURITY_POLICY.md

AI_TRANSPARENCY.md

INTERNATIONAL_TRANSFER.md

COOKIE_POLICY.md

TERMS.md
```

Each new document should remain consistent with:

```text
LEGAL_FOUNDATION.md
```

---

# Foundation Statement

The learner owns the project.

The learner controls identity continuity.

The learner decides when analysis begins.

GitHub remains independent.

InnerMirror stores only the information required to provide its own service.

Trust comes before intelligence.

Ownership comes before analysis.

Compliance comes before implementation.