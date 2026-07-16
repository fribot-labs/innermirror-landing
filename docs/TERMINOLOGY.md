# InnerMirror Landing Terminology

This document defines the official user-facing terminology used by the InnerMirror Landing MVP.

The same concept should always use the same term across Landing UI, Runtime messages, documentation, and future feature development.

---

## Reflection

A thought, decision, question, concern, or unfinished idea entered directly by the user.

Use:

- Reflection
- Current Reflection
- Save Thought
- Project Reflection

Avoid:

- Thought record
- Reflection flow
- Current thought flow

---

## Reflection Memory

Reflection records stored and maintained by Runtime.

Reflection Memory is the stored data itself.

Use:

- Reflection Memory
- Reflection Memory updated
- Stored in Reflection Memory

Avoid:

- Memory Flow
- Thought Memory
- Reflection history store

---

## Memory Timeline

The time-ordered presentation of Reflection Memory.

Memory Timeline is a UI representation, not the stored memory itself.

Use:

- Memory Timeline
- Reflection Memory arranged by time
- Older memory records

Avoid:

- Memory Flow
- Reflection Flow
- Thought Timeline

---

## Project Activity

Observable GitHub activity associated with the selected project.

Examples:

- Commits
- Pull requests
- Project Analyze events

Use:

- Project Activity
- Recent GitHub activity
- Activity captured

---

## Project Timeline

The time-ordered presentation of Project Activity and project analysis events.

Use:

- Project Timeline
- Project Activity arranged by analysis time
- Older project events

---

## Project Flow

Runtime's interpretation of the relationship between Project Activity, Reflection, continuity, and recurring patterns.

Use:

- Project Flow
- Project continuity
- Project pattern
- View Project Flow details

Flow should primarily be reserved for this project-level concept.

---

## Runtime Merge

The process that connects Reflection, Reflection Memory, and Project Activity.

Use:

- Runtime Merge
- Reflection Memory updated
- Analysis flow completed

---

## Runtime Interpretation

Runtime's synthesized understanding of project identity, knowledge, decisions, and direction.

Use:

- Runtime Interpretation
- Current Runtime Understanding
- Identity and knowledge analysis

---

## Recurring Theme

A topic or interest that appears repeatedly across Reflection Memory.

Use:

- Recurring Theme
- This theme is returning
- Recurring pattern detected

---

## Identity Drift

A meaningful movement in perspective or decision direction.

Use:

- Identity Drift
- Previous perspective
- Current perspective
- Directional shift

Avoid:

- Previous thought flow
- Current thought flow

---

## Source

The system or input path from which a record originated.

Examples:

- Landing
- Runtime
- GitHub Snapshot

Use:

- Source: Landing

Do not label a source as a repository unless repository data is explicitly available.

---

## Repository

The GitHub repository selected as the learning project.

Examples:

- fribot-labs/innermirror-landing
- fribot-labs/innermirror-runtime-private

Use repository terminology only when owner and repository name are available.

---

## Terminology Rule

Before adding a new user-facing term:

1. Check whether an existing term already represents the concept.
2. Reuse the existing official term whenever possible.
3. Do not use `Flow`, `Memory`, `Timeline`, or `Context` interchangeably.
4. Update this document when a genuinely new concept is introduced.