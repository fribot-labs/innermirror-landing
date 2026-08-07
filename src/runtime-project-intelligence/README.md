# Runtime Project Intelligence Adapter

The Runtime Project Intelligence Adapter defines the boundary between the Landing project domain and the Runtime recommendation domain.

It converts the Landing-specific `RuntimeProjectIntelligence` object into a Runtime-safe recommendation input contract.

---

## Purpose

Landing already understands the learner's project through several domain layers.

```text
GitHub Repository

↓

RuntimeProjectIdentity

↓

RuntimeProjectMetadata

↓

RuntimeProjectContext

↓

RuntimeProjectIntelligence
```

However, Runtime Recommendation should not directly depend on Landing's internal domain model.

Instead, Landing exports a smaller boundary contract.

```text
RuntimeProjectIntelligence

↓

RuntimeProjectRecommendationInput
```

This isolates Runtime from future Landing implementation changes.

---

## Current Files

```text
src/runtime-project-intelligence/

├─ runtimeProjectIntelligenceAdapterTypes.ts
├─ createRuntimeProjectIntelligenceAdapter.ts
├─ README.md
└─ __tests__/
   └─ createRuntimeProjectIntelligenceAdapter.test.ts
```

---

## Responsibility

The adapter performs one responsibility only.

```text
Landing Intelligence

↓

Boundary Contract

↓

Runtime Recommendation Input
```

It does not:

```text
call Runtime

call GitHub

perform AI inference

generate recommendations

modify Intelligence

persist data
```

---

## RuntimeProjectRecommendationInput

Current adapter output:

```text
adapterVersion

projectId

projectTitle

projectKind

metadataSource

readiness

currentFocus

projectSummary

difficulty

estimatedWeeks

learningGoal
```

This contract intentionally contains only the project information required by Runtime Recommendation.

---

## Mapping

Current mapping:

```text
RuntimeProjectIntelligence

projectId
↓

projectId

title
↓

projectTitle

projectKind
↓

projectKind

source
↓

metadataSource

readiness
↓

readiness

currentFocus
↓

currentFocus

summary
↓

projectSummary

difficulty
↓

difficulty

estimatedWeeks
↓

estimatedWeeks

learningGoal
↓

learningGoal
```

The adapter performs semantic renaming where appropriate.

---

## Why Rename Fields?

Landing uses generic property names:

```text
title

source

summary
```

Inside Runtime, many different summaries and sources may exist.

Examples:

```text
Reflection summary

Project summary

Recommendation summary

Evidence summary
```

Using:

```text
projectSummary
```

instead of:

```text
summary
```

prevents ambiguity across Runtime layers.

The same applies to:

```text
metadataSource
```

instead of:

```text
source
```

---

## Information Not Exported

The adapter intentionally does not expose:

```text
intelligenceVersion

createdAt
```

These belong to the Landing Intelligence lifecycle.

Runtime Recommendation should remain independent from Landing implementation details.

---

## Validation

The adapter assumes the input Intelligence object is already valid.

Validation belongs to:

```text
createRuntimeProjectIntelligence()
```

The adapter therefore performs no additional validation.

Conceptually:

```text
Metadata

+

Context

↓

Project Intelligence
(validated)

↓

Runtime Adapter
(projected)

↓

Recommendation Input
```

---

## Null Handling

The adapter accepts only a valid:

```text
RuntimeProjectIntelligence
```

object.

Handling:

```text
null
```

belongs to the App boundary.

Example:

```text
if Intelligence == null

↓

return null

↓

else

↓

createRuntimeProjectIntelligenceAdapter()
```

This keeps the adapter focused on one responsibility.

---

## Deterministic Transformation

The adapter is deterministic.

Given the same Intelligence object, it always produces the same Runtime Recommendation Input.

The adapter:

```text
copies

renames

projects
```

It never infers missing information.

---

## Immutability

The source Intelligence object is never modified.

Conceptually:

```text
RuntimeProjectIntelligence

↓

copy

↓

RuntimeProjectRecommendationInput
```

The adapter always returns a new object.

---

## Boundary Principle

Landing owns:

```text
RuntimeProjectIntelligence
```

Runtime owns:

```text
Runtime Recommendation
```

The adapter isolates those responsibilities.

```text
Landing Domain

↓

Project Intelligence

──────────────────────

Runtime Boundary

↓

Recommendation Input

↓

Recommendation
```

Neither side should depend on the other's internal implementation.

---

## Tests

Current test coverage includes:

```text
adapter creation

adapterVersion

projectId mapping

title → projectTitle

projectKind preservation

metadataSource mapping

readiness preservation

currentFocus preservation

summary → projectSummary

difficulty preservation

estimatedWeeks preservation

learningGoal preservation

PBL metadata mapping

immutability

new object creation

hidden Landing fields

hidden lifecycle fields
```

The adapter is therefore fully verified as a boundary transformation layer.

---

## Architecture

Current architecture:

```text
Repository

↓

Identity

↓

Metadata

↓

Context

↓

Project Intelligence

↓

Runtime Project Intelligence Adapter

↓

Runtime Recommendation Input
```

The adapter represents the first explicit Runtime boundary object inside Landing.

---

## Scope

This module intentionally does not implement:

```text
Runtime API

Recommendation generation

Why explanations

Evidence generation

Adaptive coaching

Runtime streaming

Memory analysis
```

It exists only to define and maintain the Runtime boundary.

---

## Design Principle

The adapter follows one simple rule:

```text
Landing owns meaning.

Runtime owns recommendation.

The adapter only translates.
```

Keeping those responsibilities separate allows Landing and Runtime to evolve independently while sharing a stable communication contract.

---

## Next Step

The next planned layer is:

```text
PR-LA14B

Runtime Recommendation Request Integration
```

That PR will begin using:

```text
RuntimeProjectRecommendationInput
```

as part of the Runtime request payload.

Conceptually:

```text
Project Intelligence

↓

Recommendation Adapter

↓

Runtime Recommendation Request

↓

Runtime
```

The adapter therefore becomes the permanent boundary between the Landing project model and the Runtime recommendation system.