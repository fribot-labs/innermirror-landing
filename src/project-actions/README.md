# Project Actions

The `project-actions` module defines the guided action states used by the InnerMirror Landing project workflow.

It converts the current project, repository, Reflection, GitHub Snapshot, and loading states into user-facing action guidance.

---

## Purpose

This module determines whether each project action is:

- `recommended`
- `available`
- `disabled`

The resulting guidance is consumed by Landing components such as:

- `ProjectStartPanel`
- `ProjectReflectionPanel`

The module does not execute project actions.

It only determines how actions should be presented to the learner.

---

## Files

### `projectActionGuidanceTypes.ts`

Defines shared action guidance types.

Key types include:

- `ActionAvailability`
- `GuidedProjectAction`
- `GuidedActionPresentation`
- `ProjectActionGuidance`

### `resolveProjectActionGuidance.ts`

Resolves the current Landing state into guidance for:

- Start Project
- Update Project Focus
- Analyze GitHub Project
- Reflection Only
- Reflection + GitHub

The resolver centralizes action-state logic so that individual UI components do not duplicate availability rules.

---

## Guidance Model

### Recommended

The action is currently the most natural next step.

Example:

```text
Current Focus entered
→ Start Project is Recommended
```

### Available

The action can be performed, but it is not the primary recommendation.

Example:

```text
Active project exists
→ Update Project Focus is Available
```


### Disabled

The action cannot currently be performed because a required condition is missing or another action is running.

Example:

```text
No Reflection entered
→ Reflection Only is Disabled
→ Reflection + GitHub is Disabled
```

---

## Current Workflow

```text
Repository selected
↓
Current Focus entered
↓
Start Project
↓
Analyze GitHub Project
↓
Enter Reflection
↓
Choose one analysis scope:
- Reflection Only
- Reflection + GitHub
```

---

## Design Principle

Action guidance should recommend without forcing.

The learner may choose an available alternative action when it better matches their current intent.

The resolver should therefore distinguish between:

```text
recommended
available
disabled
```

rather than reducing all actions to only enabled or disabled.

---

## Responsibility Boundary

This module owns:

- action availability
- action priority
- disabled-state reasons
- recommended-state reasons

This module does not own:

- button execution
- Runtime API calls
- GitHub Snapshot capture
- Reflection persistence
- project persistence
- UI styling

Execution remains in the Landing page and related hooks.

---

## Maintenance Rules

When adding or changing an action:

1. Update the shared types if necessary.
2. Update `resolveProjectActionGuidance.ts`.
3. Keep action rules centralized.
4. Do not duplicate resolver rules inside UI components.
5. Preserve the distinction between recommendation and permission.
6. Update this README when the workflow changes.