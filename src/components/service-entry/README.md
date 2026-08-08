# Service Entry Experience

## Purpose

The Service Entry components explain how a learner can begin using the
InnerMirror ecosystem.

The MVP supports two entry paths.

```text
New Learning Project
↓
Fribot Learning
↓
Project Export
↓
InnerMirror
```

or

```text
Existing GitHub Project
↓
InnerMirror
```

## Components

### ServiceEntryNavigation

Owns the overall explanation of the two supported entry paths.

### ServiceEntryCard

Displays one entry path and its primary action.

## Responsibilities

These components may:

- explain service entry paths,
- link to Fribot Learning,
- navigate toward the existing GitHub workflow,
- explain the relationship between Fribot Learning and InnerMirror.

## Out of Scope

These components must not own:

- GitHub authentication,
- GitHub repository state,
- Runtime requests,
- Reflection state,
- PBL metadata,
- Project Intelligence,
- recommendation logic.

## Principle

> Fribot Learning defines where a project begins. InnerMirror understands where that project chooses to go.

Fribot Learning is optional for users who already have a GitHub project.

Template-driven projects provide richer initial project context, while
InnerMirror remains independently usable with existing GitHub repositories.