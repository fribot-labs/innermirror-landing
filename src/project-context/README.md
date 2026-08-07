# Runtime Project Context

## Purpose

Runtime Project Context describes the meaning and learning state of a project.

Runtime Project Identity answers:

> What project is this?

Runtime Project Context answers:

> What kind of project is this, and what learning state is it currently in?

This layer sits between Project Identity and future Runtime/PBL intelligence.

---

## Architecture

```text
GitHub Repository
        │
        ▼
Runtime Project Identity
        │
        ▼
Runtime Project Context
        │
        ▼
Reflection
GitHub Activity
PBL Metadata
Runtime Recommendation
Learning Progress
```

---

## Responsibilities

This module is responsible for:

- creating Runtime Project Context from Project Identity
- describing the initial project type
- describing the initial learning mode
- storing the current Project Context
- restoring Project Context after browser refresh
- clearing Project Context when GitHub identity is removed
- preparing a stable context boundary for future PBL metadata

This module is not responsible for:

- GitHub OAuth
- Runtime GitHub Session
- repository discovery
- PBL metadata discovery
- curriculum parsing
- milestone detection
- learning progress inference
- Runtime recommendation generation

---

## Project Context

The current v1 context contains:

```ts
RuntimeProjectContext
```

with the following conceptual fields:

```text
contextVersion
projectId
kind
learningMode
learningStage
goal
currentMilestone
source
createdAt
updatedAt
```

Example:

```json
{
  "contextVersion": "v1",
  "projectId": "github:fribot-labs:fribot-learning",
  "kind": "pbl",
  "learningMode": "project-based-learning",
  "learningStage": "not-defined",
  "goal": null,
  "currentMilestone": null,
  "source": "repository-derived",
  "createdAt": "2026-08-07T00:00:00.000Z",
  "updatedAt": "2026-08-07T00:00:00.000Z"
}
```

---

## Relationship with Project Identity

Project Identity and Project Context have different responsibilities.

```text
Project Identity
        │
        ├─ stable projectId
        ├─ repository identity
        └─ project source

Project Context
        │
        ├─ project meaning
        ├─ learning mode
        ├─ learning stage
        ├─ goal
        └─ milestone
```

Project Context always belongs to a Project Identity through:

```text
projectId
```

The Project Identity remains the stable identifier.

The Project Context may evolve over time.

---

## Initial Context Creation

In PR-LA10, Project Context is created when a repository is selected.

```text
Repository selected
        │
        ▼
Runtime Project Identity created
        │
        ▼
Runtime Project Context created
        │
        ▼
Identity and Context stored locally
```

The Context is created from the newly generated Project Identity.

This keeps the two objects aligned from the beginning.

---

## Initial Project Classification

PR-LA10 performs only minimal repository-derived classification.

A project may initially be classified as:

```text
general
```

or:

```text
pbl
```

The associated learning mode is:

```text
general
→ general-project
```

or:

```text
pbl
→ project-based-learning
```

This is an initial context only.

It is not yet a complete PBL interpretation.

---

## Unknown Learning State

PR-LA10 intentionally does not infer information that has not yet been discovered.

Therefore the initial values may be:

```text
learningStage
→ not-defined

goal
→ null

currentMilestone
→ null
```

This is deliberate.

The Runtime should distinguish between:

```text
known information
```

and:

```text
not yet known information
```

rather than inventing project meaning.

---

## Context Source

The current source is:

```text
repository-derived
```

This means the Context was created from repository and Project Identity information.

A later PBL integration layer may introduce:

```text
pbl-metadata
```

as a stronger source.

Example future transition:

```text
repository-derived

↓

PBL metadata discovered

↓

pbl-metadata
```

---

## Persistence

Runtime Project Context is stored in browser localStorage.

Storage key:

```text
innermirror.runtimeProjectContext
```

The store provides:

```text
saveRuntimeProjectContext()

loadRuntimeProjectContext()

clearRuntimeProjectContext()
```

---

## Persistence Boundary

Project Context contains project-level metadata only.

It must never store:

- GitHub access tokens
- OAuth provider tokens
- Runtime Session IDs
- authentication credentials
- private repository contents
- Reflection contents

localStorage is treated as an untrusted persistence boundary.

Stored values must be validated before reuse.

---

## Lifecycle

### Repository selected

```text
Repository
        ↓
Project Identity
        ↓
Project Context
        ↓
localStorage
```

---

### Browser refresh

```text
Landing starts
        ↓
Project Identity restored
        ↓
Project Context restored
        ↓
Repository selection restored
```

---

### Repository changed

```text
Repository A
        ↓
Identity A
        ↓
Context A

Repository B selected
        ↓
Identity B
        ↓
Context B
```

The Context must always correspond to the current Project Identity.

---

### Runtime unavailable

```text
Runtime unavailable
        ↓
Project Identity preserved
        ↓
Project Context preserved
```

Runtime availability and Project Context have different lifecycles.

A temporary Runtime failure must not erase the meaning of the current project.

---

### Runtime Session expired

```text
Runtime Session expired
        ↓
Project Identity preserved
        ↓
Project Context preserved
```

A new Runtime Session can later reconnect to the same project.

---

### GitHub logout

```text
GitHub logout
        ↓
Runtime Session cleared
        ↓
Project Identity cleared
        ↓
Project Context cleared
```

This prevents project state from leaking across GitHub account changes.

---

## Runtime Contract Boundary

PR-LA10 does not yet send Runtime Project Context through the private Runtime API contract.

The current scope is:

```text
Landing

Project Context creation
        +
persistence
        +
restoration
        +
lifecycle
```

The following connection is intentionally deferred:

```text
Runtime Project Context
        ↓
Private Runtime API
```

The private Runtime contract should be extended first before Project Context is added to Runtime request payloads.

This avoids breaking the existing Runtime V2 contract.

---

## PBL Boundary

PR-LA10 does not parse PBL repository metadata.

It does not read:

```text
README
project.json
template.json
course metadata
curriculum metadata
milestone files
```

PBL metadata discovery belongs to a later integration layer.

The intended future architecture is:

```text
GitHub Repository
        ↓
Runtime Project Identity
        ↓
Runtime Project Context
        ↑
PBL Metadata Discovery
        ↓
Runtime Intelligence
```

---

## Why Project Context Exists

Without this layer, Runtime would need to interpret every repository format directly.

That would tightly couple Runtime intelligence to repository structure.

Project Context introduces an abstraction boundary:

```text
Repository-specific data
        ↓
Project Context
        ↓
Runtime Intelligence
```

This allows PBL repository formats to evolve without requiring every Runtime feature to understand those formats directly.

---

## Future Evolution

Future PRs may extend Project Context with information such as:

```text
templateId
courseId
learningGoal
currentMilestone
learningStage
difficulty
expectedDuration
knowledgeDomain
requiredPrerequisites
progressState
```

These fields should be introduced only when reliable metadata or Runtime analysis can provide them.

---

## PR-LA10 Scope

PR-LA10 establishes:

```text
Runtime Project Identity
        ↓
Runtime Project Context
```

It does not yet establish:

```text
PBL Metadata
        ↓
Runtime Project Context
        ↓
Private Runtime
```

Those connections belong to subsequent integration PRs.

---

## Design Principle

Project Identity should remain stable.

Project Context should be allowed to evolve.

```text
Identity
= Which project is this?

Context
= What does this project currently mean?
```

This separation provides the foundation for future PBL learning state, Runtime Memory, and adaptive coaching.