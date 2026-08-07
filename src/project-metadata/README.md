# Runtime Project Metadata

## Purpose

Runtime Project Metadata represents information that is declared by a repository.

Unlike Runtime Project Context, Project Metadata is not an interpretation made by the Runtime.

Instead, it is a normalized representation of information provided by the repository itself.

---

## Architecture

```text
GitHub Repository
        │
        ▼
Runtime Project Identity
        │
        ▼
Runtime Project Metadata
        │
        ▼
Runtime Project Context
        │
        ▼
Reflection
Runtime Recommendation
Adaptive Coaching
```

---

## Responsibilities

Runtime Project Metadata is responsible for:

- describing repository-declared project information
- providing a normalized metadata model
- persisting metadata locally
- restoring metadata after browser refresh
- preparing metadata for future Runtime intelligence

Runtime Project Metadata is **not** responsible for:

- GitHub OAuth
- Runtime Session
- repository discovery
- Reflection analysis
- Runtime Recommendation
- adaptive coaching
- project interpretation

---

## Project Metadata

Current metadata contains:

```text
metadataVersion
projectId
templateId
courseId
title
difficulty
estimatedWeeks
learningGoal
source
discoveredAt
updatedAt
```

Example:

```json
{
  "metadataVersion": "v1",
  "projectId": "github:fribot-labs:fribot-learning",
  "templateId": null,
  "courseId": null,
  "title": "fribot-learning",
  "difficulty": null,
  "estimatedWeeks": null,
  "learningGoal": null,
  "source": "repository-derived",
  "discoveredAt": "2026-08-07T00:00:00.000Z",
  "updatedAt": "2026-08-07T00:00:00.000Z"
}
```

---

## Relationship with Other Layers

Project Identity answers:

> Which project is this?

Project Metadata answers:

> What does the repository declare about this project?

Project Context answers:

> What does the Runtime currently understand about this project?

These three layers intentionally have different responsibilities.

---

## Metadata Source

Current supported sources:

```text
repository-derived
```

Future sources:

```text
pbl-manifest
```

Repository-derived metadata is created directly from repository information.

Future PBL metadata will be loaded from repository files.

---

## Current Discovery

PR-LA11 intentionally performs only minimal discovery.

Current metadata includes:

- repository name
- projectId
- repository-derived source

The following values remain unknown:

```text
templateId
courseId
difficulty
estimatedWeeks
learningGoal
```

Unknown values are intentionally stored as:

```text
null
```

rather than inferred.

---

## Persistence

Metadata is stored using browser localStorage.

Storage key:

```text
innermirror.runtimeProjectMetadata
```

Available operations:

```text
saveRuntimeProjectMetadata()

loadRuntimeProjectMetadata()

clearRuntimeProjectMetadata()
```

Metadata is validated before saving and after loading.

Malformed metadata is discarded automatically.

---

## Lifecycle

Repository selected

```text
Repository

↓

Project Identity

↓

Project Metadata

↓

localStorage
```

---

Browser refresh

```text
Landing starts

↓

Project Metadata restored
```

---

Repository changed

```text
Repository A

↓

Metadata A

Repository B

↓

Metadata B
```

---

Runtime unavailable

```text
Runtime unavailable

↓

Metadata preserved
```

Metadata is independent from Runtime availability.

---

Runtime Session expired

```text
Runtime Session expired

↓

Metadata preserved
```

A new Runtime Session can reconnect to the same metadata.

---

GitHub logout

```text
GitHub logout

↓

Metadata removed

↓

localStorage cleared
```

---

## Runtime Boundary

Project Metadata currently exists only inside Landing.

The Runtime API contract is intentionally unchanged.

Current flow:

```text
Repository

↓

Project Identity

↓

Project Metadata

↓

Project Context
```

Project Metadata is **not yet** transmitted to the private Runtime.

---

## Future Repository Metadata

Future PBL repositories may expose metadata through files such as:

```text
README.md
project.json
template.json
course.json
```

These files will populate Runtime Project Metadata.

This discovery process belongs to a later integration layer.

---

## Future Evolution

Future versions may introduce:

```text
templateVersion
courseVersion
knowledgeDomain
difficultyLevel
estimatedHours
recommendedOrder
prerequisites
projectCategory
expectedOutcome
```

These fields will only be introduced when they can be obtained reliably from repository metadata.

---

## Design Principle

Repository

↓

Project Identity

↓

Project Metadata

↓

Project Context

↓

Runtime Intelligence

Project Metadata acts as a stable abstraction between repository structure and Runtime interpretation.

Repository structures may evolve independently while Runtime intelligence continues to rely on a consistent metadata contract.

---

## PR-LA11 Scope

PR-LA11 establishes:

- Runtime Project Metadata
- metadata persistence
- metadata restoration
- metadata validation
- metadata lifecycle
- metadata tests

PR-LA11 intentionally does **not** include:

- README parsing
- project.json parsing
- template.json parsing
- PBL manifest loading
- Runtime payload changes
- Project Context enrichment

Those capabilities will be introduced in subsequent PBL integration PRs.