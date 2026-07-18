# Landing Architecture

The Landing application is the public entry point of the InnerMirror platform.

Its responsibility is **not** to perform Runtime intelligence.

Instead, Landing collects user inputs, communicates with the Runtime, translates Runtime responses into human-friendly guidance, and presents the results through a structured user experience.

---

# Core Philosophy

The Runtime thinks.

Landing communicates.

Runtime produces analysis.

Landing helps people understand what to do with that analysis.

---

# System Architecture

```text
User

│

├──────────────────────────────┐
│                              │
│ Reflection                   │
│ Project                      │
│ GitHub                       │
│
▼

Landing

│
├── Project Setup
├── Reflection Input
├── Runtime API Client
├── Runtime Response Translation
├── Runtime Next Action Foundation
└── Presentation Layer

▼

Runtime API

▼

Runtime-private

├── Reflection Analysis
├── Continuity Analysis
├── Identity Interpretation
├── Adaptive Coaching
├── Decision Review
├── Knowledge Compression
└── Runtime Responses

▼

Landing

▼

Human-readable Experience

```

---

# Layer Responsibilities

## 1. User Input Layer

Collects:

- Reflection
- Project information
- GitHub repository
- Runtime execution requests

Landing never interprets these inputs directly.

---

## 2. Runtime Communication Layer

Responsible for:

- Runtime API requests
- request contracts
- response validation
- Runtime availability handling

This layer never changes Runtime intelligence.

---

## 3. Runtime Response Translation Layer

Converts Runtime responses into structures suitable for the user interface.

Examples:

- Project Snapshot
- Runtime Interpretation
- Project Flow
- Timeline
- Runtime Next Action

This layer does not create new intelligence.

It only reorganizes Runtime outputs.

---

## 4. Runtime Next Action Foundation

Introduced in PR-041A.

Purpose:

Transform multiple Runtime signals into one clear recommendation.

Instead of presenting many equally important sections:

```text
Recommended Focus

Adaptive Coaching

Decision Review

Next Question
```

Landing first answers:

```text
What should I do next?
```

The recommendation is then supported by the detailed Runtime analysis.

---

## 5. Presentation Layer

Responsible for:

- page layout
- component composition
- visual hierarchy
- recommendation emphasis
- user interaction

Presentation never modifies Runtime meaning.

---

# Repository Boundary

Landing owns:

- User Experience
- Runtime communication
- Runtime translation
- Recommendation presentation
- Project workflow
- Reflection workflow

Landing does not own:

- AI reasoning
- Reflection interpretation
- GitHub interpretation
- Identity analysis
- Memory generation
- Coaching intelligence

Those responsibilities remain inside Runtime-private.

---

# Runtime Translation Flow

```text
Runtime-private

↓

Runtime Response

↓

Landing Translation

↓

Runtime Next Action

↓

Detailed Runtime Analysis

↓

Learner
```

Landing always recommends before explaining.

---

# Runtime Next Action

Runtime Next Action is the first presentation layer built on top of Runtime intelligence.

Its purpose is not to replace Runtime.

Its purpose is to help learners immediately understand the most important next step.

Current recommendation priority:

1. Missing Reflection
2. Missing GitHub Context
3. Recommended Focus
4. Adaptive Coaching
5. Next Question
6. Early Continuity
7. Fallback

Only one recommendation is returned.

---

# Design Principles

## Runtime remains authoritative

Runtime owns interpretation.

Landing never changes Runtime meaning.

---

## One recommendation

Landing recommends only one next action.

Humans should not have to choose between many equally important Runtime sections.

---

## Recommendation before explanation

Landing first presents:

```text
What should I do next?
```

Then explains:

- why
- supporting Runtime evidence
- detailed analysis

---

## Human-first

Landing translates Runtime structures into language that learners can immediately act upon.

---

## Deterministic behavior

The same Runtime response should always produce the same recommendation.

Landing should never introduce randomness.

---

# Long-term Vision

Landing evolves through three stages.

### Stage 1

Runtime Viewer

Displays Runtime analysis.

---

### Stage 2

Runtime Coach

Recommends the next action.

Guides learner attention.

(Current architecture.)

---

### Stage 3

Adaptive Learning Workspace

Coordinates:

- Reflection
- GitHub
- Project
- Timeline
- Coaching

into one continuous learning experience.

---

# Architectural Principle

Runtime generates intelligence.

Landing transforms intelligence into action.

This separation keeps both repositories independently maintainable while allowing the user experience to evolve without changing the Runtime itself.