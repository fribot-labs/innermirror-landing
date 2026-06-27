# Landing Architecture Documentation

This directory contains the official architecture documentation of the **InnerMirror Landing** repository.

These documents define how the Landing remains a public presentation layer while communicating with the private Runtime through stable boundaries.

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

ARCHITECTURE_GOVERNANCE.md
```

---

# Document Guide

## REPOSITORY_BOUNDARY.md

Defines what the Landing owns and what it must never own.

Focus:

- repository identity
- UI responsibilities
- Runtime boundary
- public/private separation

---

## RUNTIME_ADAPTER_BOUNDARY_AUDIT.md

Records the Runtime Adapter boundary audit.

Focus:

- Runtime API adapter
- Runtime response mapping
- temporary local UI cache
- confirmation that Runtime intelligence is not implemented locally

---

## LANDING_RESPONSIBILITY_AUDIT.md

Records the current Landing responsibility audit.

Focus:

- current implementation
- Runtime intelligence separation
- presentation responsibility review

---

## LANDING_RESPONSIBILITY_MATRIX.md

Defines ownership of Landing responsibilities.

Focus:

- presentation ownership
- Runtime separation
- repository responsibility allocation

---

## ARCHITECTURE_GOVERNANCE.md

Defines the long-term architectural rules of the Landing.

Focus:

- governance
- presentation constraints
- Runtime communication policy
- long-term evolution principles

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

Architecture Governance
```

---

# Governance Philosophy

The architecture documentation is divided into three categories.

## Structure

- Repository Boundary

This document describes what the Landing is.

---

## Observation

- Runtime Adapter Boundary Audit
- Landing Responsibility Audit

These documents describe the current implementation.

---

## Governance

- Landing Responsibility Matrix
- Architecture Governance

These documents define how the Landing should continue to evolve.

---

# Foundation Principle

The Landing creates the user experience.

The Runtime creates the intelligence.

The Learning Platform creates the educational journey.

Architecture documentation exists to preserve this separation as the Fribot ecosystem evolves.