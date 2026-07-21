# Runtime Recommendation Engine

The `runtime-next-action` module converts Runtime analysis into **one meaningful recommendation** that a learner can immediately understand and execute.

This module belongs to the Landing presentation layer.

It does **not** generate new Runtime intelligence.

Instead, it evaluates multiple Runtime recommendations, project state, and Reflection context, then compresses them into one actionable next step.

---

# Why this module exists

Runtime produces multiple independent coaching signals.

Examples include:

- Recommended Focus
- Adaptive Coaching
- Decision Review
- Next Question
- Next Interpretation
- Project Continuity
- GitHub Context

Each signal is individually useful.

However, learners naturally ask a different question first.

> **"What should I do next?"**

The Runtime Recommendation Engine answers that question.

---

# Design Philosophy

Runtime thinks like an analyzer.

Humans think like decision makers.

Landing should therefore transform:

```text
Multiple Runtime Signals

↓

Recommendation Candidates

↓

Recommendation Engine

↓

One Next Action

↓

Detailed Runtime Explanation
```

rather than presenting every Runtime signal with equal importance.

---

# Responsibility

This module owns:

- collecting recommendation candidates
- evaluating recommendation priority
- preserving blocking project states
- resolving conflicting recommendations
- merging compatible Runtime signals
- producing one Runtime Next Action

This module does **not** own:

- Runtime inference
- Reflection analysis
- GitHub analysis
- Project Flow generation
- Memory generation
- Runtime contracts
- AI reasoning

---

# Architecture

```text
Runtime-private

↓

Runtime Responses

↓

Recommendation Rules

↓

Recommendation Candidates

↓

Recommendation Engine

↓

RuntimeNextAction

↓

Landing Presentation

↓

Learner
```

Runtime remains responsible for intelligence.

Landing becomes responsible for recommendation.

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

## runtimeRecommendationCandidateTypes.ts

Defines the internal Recommendation Engine model.

Includes:

- RuntimeRecommendationCandidate
- RuntimeRecommendationCategory
- RuntimeRecommendationSpecificity
- ScoredRuntimeRecommendationCandidate
- RuntimeRecommendationResolution

These types are internal to the Recommendation Engine.

They are never shown directly to the learner.

---

## runtimeNextActionRules.ts

Contains independent recommendation rules.

Each rule produces **one Recommendation Candidate**.

Examples:

- Missing GitHub Snapshot
- Missing Reflection
- Missing GitHub Context
- Recommended Focus
- Adaptive Coaching
- Next Question
- Decision Review
- Next Interpretation
- Continuity
- Reflection Draft
- Current Focus Fallback
- Insufficient Context

Rules remain independent and reusable.

---

## collectRuntimeRecommendationCandidates.ts

Runs every recommendation rule.

Returns every valid Recommendation Candidate.

```text
Rules

↓

Candidate[]

```

No prioritization occurs here.

---

## scoreRuntimeRecommendationCandidate.ts

Evaluates Recommendation Candidates.

Current scoring considers:

- base priority
- blocking state
- actionability
- Runtime confidence
- recommendation specificity
- fallback penalty

Scores are internal ordering values.

They never represent learner performance.

---

## normalizeRuntimeRecommendationCandidates.ts

Groups compatible recommendation candidates.

Current normalization uses:

- category
- action kind
- navigation target

Future Runtime semantic grouping can extend this module.

---

## resolveRuntimeRecommendation.ts

The Recommendation Engine.

Responsibilities include:

- blocking-state filtering
- priority comparison
- conflict resolution
- supporting recommendation merge
- confidence resolution

Returns:

```text
Candidate[]

↓

RuntimeRecommendationResolution

↓

RuntimeNextAction
```

---

## createRuntimeNextAction.ts

Acts as the Recommendation Engine facade.

Coordinates:

```text
Normalize Input

↓

Collect Candidates

↓

Resolve Recommendation

↓

RuntimeNextAction
```

The public Landing API remains unchanged.

---

# Recommendation Flow

Current flow:

```text
Runtime Signals

↓

Recommendation Rules

↓

Recommendation Candidates

↓

Candidate Scoring

↓

Blocking Resolution

↓

Conflict Resolution

↓

Supporting Merge

↓

RuntimeNextAction
```

Only one RuntimeNextAction is returned.

---

# Blocking Recommendation

Some recommendations represent missing project evidence.

Examples:

- Missing GitHub Snapshot
- Missing Reflection
- Missing GitHub Context

These recommendations are marked as:

```text
isBlocking = true
```

When any blocking candidate exists, strategic coaching recommendations are temporarily ignored until the required evidence has been collected.

---

# Candidate Priority

Recommendation candidates include:

- basePriority
- confidence
- specificity
- actionability
- blocking state

These values determine recommendation ordering.

---

# Conflict Resolution

Recommendations are grouped by action direction.

Examples:

```text
Continue Project Work

vs

Review Project Direction
```

Conflicting actions are never merged.

Only the strongest candidate becomes the primary recommendation.

---

# Supporting Recommendation Merge

Compatible Runtime recommendations may support one primary recommendation.

Examples:

```text
Recommended Focus

+

Adaptive Coaching

+

Next Question

↓

One RuntimeNextAction
```

Supporting recommendations strengthen confidence and reasoning without creating duplicate learner actions.

---

# Output Model

Every RuntimeNextAction contains:

- title
- description
- reason
- confidence
- source
- target
- actionable state

Landing always presents:

```text
What should I do?

↓

Why should I do it?

↓

Detailed Runtime Analysis
```

---

# Design Principles

## 1. One Recommendation

Runtime may produce many signals.

Landing recommends only one action.

---

## 2. Human-first

Recommendations describe actions.

Not Runtime implementation.

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

The Recommendation Engine never modifies Runtime intelligence.

It only determines how Runtime information should be presented.

---

## 4. Blocking before Strategy

Missing project evidence must be resolved before strategic coaching.

State recovery always has priority over optimization.

---

## 5. Recommendation before Detail

Users should first understand:

```text
What should I do next?
```

Only afterwards should they explore:

- Recommended Focus
- Adaptive Coaching
- Decision Review
- Next Interpretation
- Knowledge Compression
- Project Flow

---

# Long-term Goal

Landing evolves gradually from:

```text
Runtime Viewer
```

to

```text
Runtime Coach
```

The Runtime Recommendation Engine becomes the decision layer that enables this transition.

---

# Maintenance Rules

When adding a new recommendation:

1. Create one independent rule.
2. Keep the rule focused on one recommendation.
3. Do not duplicate existing rules.
4. Return Recommendation Candidates.
5. Preserve deterministic scoring.
6. Preserve blocking-state behavior.
7. Avoid conflicting recommendation merges.
8. Update this README whenever the Recommendation Engine changes.

---

# MVP Boundary

This module intentionally avoids:

- automatic button execution
- automatic Reflection creation
- automatic GitHub analysis
- Runtime contract changes
- Runtime inference
- AI-generated recommendation rules

The learner always makes the final decision.

Landing only recommends the most meaningful next action.

---

## Runtime Evidence Layer

The Runtime Evidence Layer exposes the concrete project-state
and Runtime observations supporting the selected recommendation.

It displays:

- Evidence summary
- Primary Evidence
- Supporting Evidence
- Project Context
- Signal count

The Evidence panel is collapsed by default.

The Evidence Layer does not expose:

- candidate scores
- internal candidate IDs
- conflict groups
- raw Runtime payloads
- Recommendation Engine implementation details