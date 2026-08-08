# SI05 Template-Driven Repository Validation

## Status

**PASS**

---

# Purpose

This document records the successful completion of the MVP repository
integration architecture.

The purpose of the MVP is **not** to understand every GitHub repository.

Instead, the MVP verifies that repositories exported from the Fribot Learning
template ecosystem can be interpreted consistently by InnerMirror Landing and
Runtime through an explicit public project contract.

The supported workflow is:

```text
Fribot Learning

↓

Project Template

↓

Project Export

↓

Learner-owned Repository

↓

InnerMirror Landing

↓

Runtime
```

This document verifies that the complete workflow now operates successfully.

---

# MVP Philosophy

The MVP intentionally follows a **Template-Driven** approach.

InnerMirror does **not** attempt to infer arbitrary repository intent.

Instead, Fribot Learning provides a predefined project structure and explicit
metadata that become part of the exported learner repository.

The guiding principle is:

```text
Human defines project intent

↓

Project Template

↓

PBL Manifest

↓

Landing interprets

↓

Runtime analyzes
```

rather than:

```text
Arbitrary Repository

↓

AI guesses project intent
```

The MVP therefore prioritizes **explicit project intent** over automatic
repository interpretation.

---

# Repository Architecture

The verified repository architecture is:

```text
Fribot Learning

(Project Catalog)

↓

Project Export

↓

Learner-owned Repository

↓

InnerMirror Landing

↓

InnerMirror Runtime
```

Each repository owns one independent responsibility.

---

# Repository Responsibilities

## Fribot Learning

Owns:

- Project templates
- Source learning projects
- Starter materials
- Educational documentation
- Project Export source
- Template contract

Does not own:

- Runtime intelligence
- Reflection data
- Recommendation results
- Learner history

---

## Learner Repository

Example:

```text
class-concept-robot
```

Owns:

- Learner project
- GitHub history
- Starter project
- Project documentation
- PBL manifest

Does not own:

- Runtime recommendation
- Runtime memory
- Reflection storage
- Private cognitive data

---

## InnerMirror Landing

Owns:

- GitHub discovery
- Repository connection
- Metadata loading
- Project context
- Project Intelligence
- Runtime request generation

Does not own:

- Educational content
- Runtime intelligence
- Reflection storage

---

## InnerMirror Runtime

Owns:

- Runtime analysis
- Recommendation
- Reflection interpretation
- Project evolution
- Runtime intelligence

Does not own:

- Starter projects
- Educational templates
- Learning documentation

---

# Template Contract

Every exported learner repository follows one common template lineage.

Current template identifier:

```text
fribot-learning-template-v1
```

The lineage is:

```text
Project Template

↓

Source Course

↓

Exported Repository
```

Current verified projects:

```text
class-concept-robot

tandem-dual-mcu
```

All preserve the same template contract.

---

# Template ID and Course ID

The MVP distinguishes two identifiers.

## templateId

Example:

```text
fribot-learning-template-v1
```

Defines the project template contract.

Answers:

> Which Fribot Learning template standard does this repository follow?

---

## courseId

Examples:

```text
class-concept-robot

tandem-dual-mcu
```

Defines the individual learning project.

Answers:

> Which learning project is this?

---

Relationship:

```text
templateId

↓

Shared Project Contract

courseId

↓

Individual Learning Project
```

---

# Project Export Verification

The following Project Export workflow has been verified.

```text
Fribot Learning

↓

Source Course

↓

Project Export

↓

Independent Learner Repository
```

Verified exported repository:

```text
class-concept-robot
```

Repository structure:

```text
README.md

01_START.md

02_RUN.md

03_MODIFY.md

04_UNDERSTAND.md

05_REFLECT.md

pbl/
manifest.json

starter-project/

references/
```

---

# Manifest Verification

Landing successfully detected:

```text
pbl/manifest.json
```

Verified metadata:

```text
Project Title

Class Concept Robot

Difficulty

beginner

Estimated Duration

4 weeks

Learning Goal

Understand why related state and behavior can be organized together through a class in robot programming.
```

Landing recognizes the repository through the manifest contract rather than
through repository name or directory heuristics.

---

# Project Intelligence Verification

Landing successfully generated Runtime Project Intelligence.

Verified information includes:

```text
Project Title

Project Kind

Difficulty

Estimated Duration

Learning Goal

Current Focus

Readiness

Project Summary
```

Project Intelligence is now derived from explicit project metadata.

---

# Runtime Request Verification

Analyze GitHub Project successfully generated a Runtime V2 request.

Verified Runtime Payload:

```text
project

repository

githubSnapshot

learningContext

projectHistory

projectRecommendationInput

trigger
```

Verified trigger:

```text
github-snapshot
```

---

# Recommendation Input Verification

Verified values:

```text
adapterVersion

v1

metadataSource

pbl-manifest

projectKind

pbl

difficulty

beginner

estimatedWeeks

4

learningGoal

Current Focus

Readiness
```

The exported learner repository now provides explicit educational context to
Runtime.

---

# End-to-End Verification

The following service flow has been verified.

```text
Fribot Learning

↓

Project Template

↓

Project Export

↓

Learner Repository

↓

PBL Manifest

↓

Landing

↓

Project Intelligence

↓

Runtime Request

↓

Runtime
```

This represents the first successful end-to-end execution of the intended MVP
architecture.

---

# Human Boundary

The learner remains the owner of Reflection.

The intended flow is:

```text
Project

↓

Learning Experience

↓

Human Reflection

↓

InnerMirror

↓

Runtime Interpretation
```

The Runtime interprets Reflection.

The Runtime does **not** generate Reflection on behalf of the learner.

---

# Repository Boundary Validation

Verified:

```text
Educational Content

↓

Fribot Learning
```

Verified:

```text
Learning Activity

↓

Learner Repository
```

Verified:

```text
Project Context

↓

Landing
```

Verified:

```text
Project Analysis

↓

Runtime
```

No repository assumes responsibilities belonging to another repository.

---

# Out of Scope

The MVP intentionally excludes:

- Arbitrary GitHub repository interpretation
- Automatic repository standardization
- Automatic manifest generation
- Repository onboarding wizard
- Automatic Project Export
- Adaptive coaching expansion
- Learning analytics
- Repository quality scoring

These capabilities belong to future development phases.

---

# Future Expansion

Future work may introduce:

```text
Any GitHub Repository

↓

Repository Onboarding

↓

Template Import

↓

Manifest Generation

↓

Landing

↓

Runtime
```

However, this functionality is intentionally outside the MVP scope.

The MVP validates only repositories derived from Fribot Learning templates.

---

# MVP Completion Statement

The MVP is considered complete when:

- Fribot Learning provides standardized project templates.
- Project Export produces learner-owned repositories.
- Exported repositories preserve the public PBL manifest contract.
- InnerMirror Landing correctly interprets the exported project.
- Runtime receives explicit project context.
- Reflection remains human-authored.
- Repository responsibilities remain clearly separated.

The verified MVP architecture is:

```text
Fribot Learning

↓

Project Template

↓

Project Export

↓

Learner-owned Repository

↓

InnerMirror Landing

↓

InnerMirror Runtime
```

This establishes the first complete **Template-Driven Repository** architecture
for the Fribot Learning ecosystem.

Rather than attempting to infer arbitrary repository intent, the MVP enables
human-authored project intent to flow consistently across repository
boundaries through a shared public contract.