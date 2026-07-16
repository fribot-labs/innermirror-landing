# InnerMirror Landing Information Architecture

This document defines the official information hierarchy of the InnerMirror Landing MVP.

It complements:

- `docs/TERMINOLOGY.md`
- `src/constants/runtimeTerminology.ts`
- `src/constants/informationArchitecture.ts`

The purpose is to prevent new panels, labels, and analysis results from being placed at an unclear conceptual level.

---

## 1. User Input Layer

### Reflection

A Reflection is a thought, decision, question, concern, or unfinished idea entered directly by the user.

Primary UI:

- Project Reflection
- Save Thought
- Thought + Project Analyze
- Next Question

A Reflection is the beginning of the user-controlled analysis flow.

---

## 2. Memory Layer

### Reflection Memory

Reflection Memory is the collection of Reflection records stored and maintained by Runtime.

It is data, not a visual component.

Primary events:

- Reflection recorded
- Reflection Memory updated
- Continuity merged

### Memory Timeline

Memory Timeline is the time-ordered presentation of Reflection Memory.

Relationship:

```text
Reflection
↓
Reflection Memory
↓
Memory Timeline
```

---

## 3. Project Activity Layer

### Project Activity

Project Activity consists of observable GitHub and analysis events connected to the selected learning project.

Examples:

- Commits
- Pull requests
- GitHub project analysis
- Thought + Project analysis

### Project Timeline

Project Timeline is the time-ordered presentation of Project Activity.

Relationship:

```text
GitHub Repository
↓
Project Activity
↓
Project Timeline
```

Project Timeline should not be described as memory unless a separate project-memory model is explicitly introduced.

---

## 4. Project Interpretation Layer

### Project Flow

Project Flow explains how Project Activity and Reflection are becoming connected over time.

Primary signals:

- Continuity
- Repeated patterns
- Events reviewed
- Suggested next action

Project Flow is interpretation, not raw history.

Relationship:

```text
Reflection
+
Project Activity
↓
Project Flow
```

The term Flow should primarily be reserved for this project-level interpretation.

---

## 5. Runtime Interpretation Layer

### Runtime Interpretation

Runtime Interpretation is the synthesized understanding generated from:

- Reflection
- Reflection Memory
- Project Activity
- Project Flow
- Compressed project knowledge

Primary interpretation areas:

1. Project Identity
2. Knowledge Compression
3. Project Evolution
4. Decision Evolution

Relationship:

```text
Reflection Memory
+
Project Timeline
+
Project Flow
↓
Runtime Interpretation
```

---

## 6. Pattern Layer

### Recurring Theme

A Recurring Theme is a topic or interest that appears repeatedly across Reflection Memory.

It is derived from Reflection Memory, but presented as a focused pattern surface.

### Identity Drift

Identity Drift describes meaningful movement between previous and current perspectives.

Use:

- Previous perspective
- Current perspective
- Directional shift

Avoid:

- Previous thought flow
- Current thought flow

---

## 7. Official Landing Sequence

The primary conceptual sequence is:

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

Reflection Memory + Project Timeline + Project Flow
↓
Runtime Interpretation

Reflection Memory
↓
Recurring Theme / Identity Drift
```

This is a conceptual hierarchy, not necessarily a strict visual order for every screen state.

---

## 8. Placement Rule for New Features

Before adding a new visible panel, determine:

1. Is it user input?
2. Is it stored memory?
3. Is it a time-ordered representation?
4. Is it raw project activity?
5. Is it project-level interpretation?
6. Is it Runtime-level interpretation?
7. Is it a recurring or directional pattern?

A feature should be assigned to one primary layer.

Avoid creating a new top-level concept when an existing layer already represents the same meaning.

---

## 9. Contract Boundary Rule

Landing UI models and Runtime response records must remain distinct.

Examples:

- RuntimeMemoryTimelineRecord
    - Runtime/server response record
- RuntimeMemoryTimelineItem
    - Landing presentation item

Do not merge server response records directly into UI component types.

Use adapter or mapping functions between the layers.

---

## 10. Documentation Rule

When terminology or hierarchy changes, review:

- docs/TERMINOLOGY.md
- docs/INFORMATION_ARCHITECTURE.md
- src/constants/runtimeTerminology.ts
- src/constants/informationArchitecture.ts

The same concept should not acquire a second user-facing name without an explicit architecture decision.