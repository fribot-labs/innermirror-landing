# PBL_PROJECT_DOMAIN_MODEL.md

This document defines the official Project Domain Model of the PBL Coding Education MVP.

The purpose of this model is to transform isolated Reflection into project-based learning.

From this version onward, Reflection is no longer an independent record.

Reflection belongs to a Project.

---

# Purpose

Traditional coding education evaluates completed source code.

The PBL Coding Education MVP evaluates how a learner's thinking evolves while completing a software project.

Therefore the Project becomes the primary learning unit.

Every learning activity belongs to a Project.

---

# Domain Hierarchy

The official domain structure is:

```text
Project

↓

Milestone

↓

Pull Request

↓

Reflection

↓

Runtime Coaching

↓

Decision Review
```

Each layer contributes one learning responsibility.

---

# Project

A Project represents one learning objective.

A Project owns:

- GitHub Repository
- Milestones
- Pull Requests
- Reflections
- Runtime Coaching
- Decision Review History

A learner may have multiple Projects.

Each Project evolves independently.

---

# Milestone

A Milestone represents one learning stage inside a Project.

Examples

- GitHub Learning Entry
- Runtime Contract V2
- Project Dashboard
- Reflection Integration

A Milestone groups together related development work.

Each Milestone may contain multiple Pull Requests.

---

# Pull Request

A Pull Request represents one development iteration.

The MVP records only lightweight Pull Request information.

Examples

- title
- status
- created date
- merged date

The Runtime uses Pull Request history as part of the learning context.

---

# Reflection

Reflection belongs to a Project.

Optionally, it may also belong to:

- one Milestone
- one Pull Request

Reflection records the learner's thinking during project development.

Reflection is no longer treated as an isolated artifact.

---

# Completion

Project Completion represents learning progress rather than task completion.

Completion is derived from:

- Milestone progress
- Pull Request activity
- Reflection activity

Future versions may also include Runtime learning signals.

Completion is intended to visualize learning momentum.

---

# Runtime Relationship

The Runtime receives Project Context together with Reflection.

```
Reflection

+

Project

+

GitHub Snapshot

+

Learning Context

↓

Runtime Context
```

The Runtime interprets the complete project situation rather than isolated Reflection.

---

# Landing Relationship

The Landing owns Project presentation.

Examples

- Project creation
- Project selection
- Current Milestone
- Progress visualization

Landing does not evaluate Project quality.

Landing presents Project information.

---

# Runtime Relationship

The Runtime owns Project interpretation.

Examples

- Summary
- Coaching
- Decision Review
- Learning Context Analysis

The Runtime does not own Project presentation.

---

# MVP Scope

The MVP intentionally keeps the Project model lightweight.

Included

- Project
- Milestone
- Pull Request reference
- Reflection ownership
- Completion percentage

Excluded

- Team Projects
- Organization Projects
- Multiple repositories
- Dependency graphs
- Automatic milestone generation

These belong to the post-MVP roadmap.

---

# Future Expansion

The Project model is designed for long-term growth.

Possible future extensions include:

- Team Projects
- Organization Learning
- Issue Tracking
- GitHub Discussions
- Review Comments
- Cross-project learning
- Portfolio aggregation

The core hierarchy remains unchanged.

---

# Relationship with Runtime Contract V2

Runtime Contract V2 receives:

- Reflection
- Project Context
- Repository Context
- GitHub Snapshot
- Learning Context

The Project Domain Model provides the Project Context portion of the Runtime Contract.

These two documents evolve together.

---

# Foundation Principle

A Reflection explains what the learner thinks.

A Pull Request explains what the learner changes.

A Milestone explains what the learner is currently trying to achieve.

A Project explains why the learner is building.

The Runtime understands learning only when these elements are interpreted together.

The Project Domain Model transforms individual coding activities into a coherent project-based learning journey.
