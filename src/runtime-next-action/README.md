# Runtime Next Action Foundation

The `runtime-next-action` module translates Runtime analysis into one concrete next action that the learner can immediately understand and execute.

This module belongs to the Landing presentation layer.

It does **not** generate new Runtime intelligence.

Instead, it converts existing Runtime signals into a single human-oriented recommendation.

---

# Why this module exists

Runtime currently produces many valuable analysis results.

Examples include:

- Recommended Focus
- Adaptive Coaching
- Decision Review
- Next Question
- Project Flow
- Knowledge Compression

Each result is meaningful.

However, learners naturally ask a different question first.

> **"What should I do next?"**

This module answers that question.

---

# Design Philosophy

Runtime thinks like an analyzer.

Humans think like decision makers.

Therefore the Landing should transform:

```text
Runtime Analysis

↓

One Next Action

↓

Detailed Explanation
```

instead of presenting every Runtime signal with equal priority.

---

# Responsibility

This module owns:

- selecting the highest-priority action
- translating Runtime analysis into human actions
- determining recommendation priority
- producing a single actionable result
- preserving Runtime reasoning

This module does **not** own:

- Runtime inference
- Reflection analysis
- GitHub analysis
- Project Flow generation
- Memory generation
- Runtime contracts

---

# Architecture

```text
Runtime-private

↓

Runtime Responses

↓

Runtime Next Action Foundation

↓

Landing Presentation

↓

Learner
```

The Runtime remains responsible for intelligence.

Landing becomes responsible for communication.

---

# Current Files

## runtimeNextActionTypes.ts

Defines:

- RuntimeNextAction
- RuntimeNextActionKind
- RuntimeNextActionTarget
- RuntimeNextActionConfidence
- RuntimeNextActionSource

---

## runtimeNextActionRules.ts

Contains independent recommendation rules.

Each rule attempts to generate one RuntimeNextAction.

Examples:

- Missing Reflection
- Missing GitHub Context
- Recommended Focus
- Adaptive Coaching
- Next Question
- Continuity
- Fallback

Rules should remain independent and reusable.

---

## createRuntimeNextAction.ts

Coordinates rule priority.

It does not contain recommendation logic.

Its responsibility is:

```text
Rule A

↓

Rule B

↓

Rule C

↓

Fallback
```

The first matching action becomes the Runtime Next Action.

---

# Rule Priority

Current recommendation order:

1. Missing Reflection
2. Missing GitHub Context
3. Recommended Focus
4. Adaptive Coaching
5. Next Question
6. Continuity
7. Fallback

Only one Runtime Next Action should be returned.

---

# Output Model

Every recommendation contains:

- title
- description
- reason
- confidence
- source
- target
- actionable state

Landing should always display:

```text
What to do next

↓

Why

↓

Detailed Runtime Analysis
```

instead of exposing every Runtime signal equally.

---

# Design Principles

## 1. One Action

Runtime may generate many insights.

Landing should recommend only one next action.

---

## 2. Human-first

Recommendations must describe actions.

Not internal Runtime structures.

Good:

```text
Write one Reflection explaining why the latest project change was necessary.
```

Avoid:

```text
Adaptive Coaching recommends Reflection.
```

---

## 3. Runtime remains unchanged

This module never changes Runtime intelligence.

It only changes how humans understand it.

---

## 4. Recommendation before Detail

Users should first understand:

```text
What should I do?
```

Only afterwards should they explore:

- Recommended Focus
- Adaptive Coaching
- Decision Review
- Knowledge Compression
- Project Flow

---

# Long-term Goal

Landing gradually evolves from:

```text
Runtime Viewer
```

to

```text
Runtime Coach
```

The Runtime Next Action Foundation is the first layer that enables this transition.

---

# Maintenance Rules

When adding a new Runtime recommendation:

1. Create an independent rule.
2. Keep the rule focused on one recommendation.
3. Do not duplicate existing rules.
4. Preserve deterministic priority.
5. Return at most one RuntimeNextAction.
6. Update this README whenever the recommendation model changes.

---

# MVP Boundary

This module intentionally avoids:

- automatic button execution
- automatic Reflection creation
- automatic GitHub analysis
- Runtime contract changes
- AI inference

The learner always makes the final decision.

Landing only recommends the next action.