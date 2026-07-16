# InnerMirror Landing Documentation Index

This document provides the central navigation point for the InnerMirror Landing documentation.

The Landing repository is responsible for the public user interface, GitHub project entry flow, Reflection input, project activity presentation, and communication with the private Runtime.

---

## Product Language and Structure

These documents define the official product terminology and information hierarchy used throughout the Landing MVP.

### [Terminology](./TERMINOLOGY.md)

Defines the official user-facing language used across the Landing UI, Runtime messages, documentation, and future features.

Key concepts include:

- Reflection
- Reflection Memory
- Memory Timeline
- Project Activity
- Project Timeline
- Project Flow
- Runtime Merge
- Runtime Interpretation
- Recurring Theme
- Identity Drift

### [Information Architecture](./INFORMATION_ARCHITECTURE.md)

Defines how user input, memory, project activity, timelines, project interpretation, and Runtime interpretation are conceptually organized.

Core relationships:

```text
Reflection
↓
Reflection Memory
↓
Memory Timeline
```

```text
GitHub Repository
↓
Project Activity
↓
Project Timeline
```

```text
Reflection + Project Activity
↓
Project Flow
```

```text
Reflection Memory + Project Timeline + Project Flow
↓
Runtime Interpretation
```

---

## Architecture and Repository Boundaries

### [Architecture Governance](./architecture/ARCHITECTURE_GOVERNANCE.md)

Defines the architectural governance rules applied to the Landing repository.

### [Repository Boundary](./architecture/REPOSITORY_BOUNDARY.md)

Defines what belongs inside the Landing repository and what must remain outside it.

### [Runtime Boundary](./RUNTIME_BOUNDARY.md)

Defines the boundary between the public Landing application and the private Runtime service.

### [Landing Runtime Presentation Boundary](./architecture/LANDING_RUNTIME_PRESENTATION_BOUNDARY.md)

Defines how Runtime output may be presented by Landing without transferring Runtime interpretation responsibility into the public repository.

### [Landing Responsibility Audit](./architecture/LANDING_RESPONSIBILITY_AUDIT.md)

Reviews whether current Landing features remain within the approved repository responsibility boundary.

### [Landing Responsibility Matrix](./architecture/LANDING_RESPONSIBILITY_MATRIX.md)

Maps major product responsibilities to Landing, Runtime, GitHub, and related repositories.

---

## GitHub Learning Integration

### [GitHub Learning Entry](./architecture/GITHUB_LEARNING_ENTRY.md)

Defines the GitHub connection and repository-selection entry flow.

### [GitHub Snapshot Integration](./architecture/GITHUB_SNAPSHOT_INTEGRATION.md)

Defines how recent commits and pull requests are manually captured for Runtime analysis.

### [PBL Project Domain Model](./architecture/PBL_PROJECT_DOMAIN_MODEL.md)

Defines the Landing-side PBL project model:

```text
Project
↓
Milestone
↓
Pull Request
↓
Completion
```

Reflection belongs to the Project.

---

## MVP Governance and Release

### [MVP](./MVP.md)

Describes the current Landing MVP scope.

### [MVP Release Checklist](./MVP_RELEASE_CHECKLIST.md)

Provides the verification checklist required before an MVP release.

### [Release v0.1.0](./RELEASE_v0.1.0.md)

Records the first Landing MVP release scope and completion state.

### [One Pager](./ONE_PAGER.md)

Provides a compact overview of the Landing product and architecture.

---

## Runtime and Reflection Documentation

### [Runtime Adapter Boundary Audit](./architecture/RUNTIME_ADAPTER_BOUNDARY_AUDIT.md)

Audits whether Runtime adapter code remains within the approved boundary.

### [Phase 1 Readiness Review](./architecture/PHASE_1_READINESS_REVIEW.md)

Reviews readiness for the first major Landing–Runtime integration phase.

### [PR-017 Record Merge Archive Schema](./PR-017_RECORD_MERGE_ARCHIVE_SCHEMA.md)

Documents the record merge and archive schema introduced during the earlier Reflection workflow.

---

## Development Records

### [PR-001](./PR_001.md)

Documents the first major Landing architecture and responsibility work.

### [PR-002](./PR_002.md)

Documents the Runtime responsibility cleanup and boundary refinement work.

---

## Documentation Rules

When adding or modifying a visible product concept:

1. Check [Terminology](./TERMINOLOGY.md).
2. Check [Information Architecture](./INFORMATION_ARCHITECTURE.md).
3. Reuse an existing official term whenever possible.
4. Identify the information layer to which the feature belongs.
5. Confirm that the feature remains inside the Landing repository boundary.
6. Update this index when a new long-lived documentation file is added.

Do not use the following concepts interchangeably:

- Reflection Memory and Memory Timeline
- Project Activity and Project Timeline
- Project Timeline and Project Flow
- Runtime Merge and Runtime Interpretation
- Source or Origin and Repository

---

## Recommended Reading Order

For a new developer or AI collaborator:

1. [One Pager](./ONE_PAGER.md)
2. [MVP](./MVP.md)
3. [Terminology](./TERMINOLOGY.md)
4. [Information Architecture](./INFORMATION_ARCHITECTURE.md)
5. [Repository Boundary](./architecture/REPOSITORY_BOUNDARY.md)
6. [Runtime Boundary](./RUNTIME_BOUNDARY.md)
7. [Landing Responsibility Matrix](./architecture/LANDING_RESPONSIBILITY_MATRIX.md)
8. [GitHub Snapshot Integration](./architecture/GITHUB_SNAPSHOT_INTEGRATION.md)
9. [PBL Project Domain Model](./architecture/PBL_PROJECT_DOMAIN_MODEL.md)
10. [MVP Release Checklist](./MVP_RELEASE_CHECKLIST.md)