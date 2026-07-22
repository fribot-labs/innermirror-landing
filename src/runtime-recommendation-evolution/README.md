# Runtime Recommendation Evolution

The Runtime Recommendation Evolution layer enables Runtime recommendations to improve through accumulated project history.

Unlike the Runtime Action History module, which records recommendation lifecycles, this module analyzes historical outcomes and gradually improves how Runtime selects future recommendations.

---

# Purpose

Runtime Recommendation Evolution does **not** evaluate users.

Its purpose is to continuously improve the Runtime Recommendation Engine itself.

The system observes:

- which recommendations are completed
- which recommendations are repeatedly replaced
- which recommendations remain unresolved
- which recommendations repeatedly return
- how recommendation quality changes over time

The result is a Runtime that gradually learns how its own recommendations perform within each project.

---

# Design Principle

Recommendation Evolution follows one principle:

```text
History informs Recommendation.

History never controls Recommendation.
```

History provides additional evidence.

The current project state always remains the primary source of recommendation selection.

Adaptive behavior may adjust recommendation priority, but it never replaces the Runtime Recommendation Engine.

---

# Architecture

```text
Runtime Signals

↓

Recommendation Candidates

↓

History Analysis

↓

Recommendation Quality

↓

Recommendation Stability

↓

Adaptive Recommendation Scoring

↓

Recommendation Evolution

↓

Runtime Recommendation
```

Each stage has a single responsibility.

---

# Module Responsibilities

## runtimeRecommendationQualityTypes.ts

Defines all data contracts used throughout Recommendation Evolution.

Includes:

- History Features
- Quality Profile
- Quality Signals
- Quality Policy
- Diagnostics
- Project Quality Summary

This file contains no business logic.

---

## runtimeRecommendationQualityPolicy.ts

Provides configurable thresholds for Recommendation Quality analysis.

Examples:

- minimum history required
- completion threshold
- unresolved threshold
- superseded threshold
- repetition threshold

The policy is intentionally separated so future Runtime versions can experiment without changing builders.

---

## createRuntimeRecommendationHistoryFeatures.ts

Transforms Runtime Action History into normalized History Features.

Responsibilities:

- aggregate occurrences
- calculate counts
- calculate rates
- calculate averages
- calculate temporal features
- identify latest recommendation state

This builder records observable facts only.

No recommendation quality decisions are made here.

---

## createRuntimeRecommendationQualityProfile.ts

Interprets History Features.

Responsibilities:

- determine confidence
- determine quality outcome
- create structured quality signals
- produce Recommendation Quality Profile

This builder performs analysis only.

It does not modify Runtime Recommendation scores.

---

# Recommendation Evolution Roadmap

The Recommendation Evolution system is intentionally introduced in several stages.

---

## PR-046A

### Recommendation Quality Analysis Foundation

Purpose

```text
History

↓

History Features

↓

Quality Profile
```

Completed responsibilities

- History feature extraction
- Recommendation quality analysis
- Diagnostics foundation
- Configurable quality policies

This stage is read-only.

No Runtime behavior changes.

---

## PR-046B

### Recommendation Stability Foundation

Purpose

Prevent unstable recommendation switching.

Introduces

- stable recommendation
- challenger recommendation
- hysteresis
- observation threshold
- minimum dwell time

Goal

```text
Current Recommendation

↓

Stable Recommendation
```

The Runtime Recommendation should not change simply because a slightly better candidate appears momentarily.

---

## PR-046C

### Adaptive Recommendation Scoring

Purpose

Apply small History-based score adjustments.

Architecture

```text
Base Score

+

Adaptive Modifier

↓

Final Score
```

History provides a bounded modifier.

Current project context always remains dominant.

---

## PR-046D

### Unresolved Recommendation Learning

Purpose

Avoid repeating ineffective recommendations indefinitely.

The Runtime begins recognizing patterns such as:

- repeated recommendation
- visited without completion
- unresolved recommendation
- frequently replaced recommendation

The goal is not to judge the learner.

The goal is to improve Runtime recommendations.

---

## PR-046E

### Recommendation Evolution Controller

Purpose

Combine every previous layer into one Recommendation Evolution pipeline.

Architecture

```text
History

↓

Quality

↓

Stability

↓

Adaptive Score

↓

Evolution Controller

↓

Runtime Recommendation
```

This becomes the primary Recommendation orchestration layer.

---

# Current Development Boundary

The current implementation stops after Recommendation Quality Analysis.

Current Runtime behavior is intentionally unchanged.

```text
History

↓

History Features

↓

Quality Profile
```

The following capabilities are **not yet active**:

- Recommendation stabilization
- Adaptive scoring
- Recommendation replacement
- Recommendation evolution

These responsibilities belong to later PRs.

---

# Long-Term Vision

The Recommendation Evolution layer enables Runtime to continuously refine its coaching behavior.

Future Runtime versions will gradually answer questions such as:

```text
Which recommendations consistently help?

Which recommendations frequently fail?

Which recommendations repeat without progress?

Which recommendation order produces better project continuity?
```

The objective is not to make Runtime more opinionated.

The objective is to make Runtime increasingly consistent, explainable, and adaptive while respecting the current project context.

---

# Design Philosophy

Runtime Recommendation Evolution does not attempt to predict what the user wants.

Instead, it continuously improves how Runtime understands the effectiveness of its own recommendations.

```text
Project State

↓

Recommendation

↓

Observed Result

↓

Recommendation Quality

↓

Improved Recommendation
```

Recommendation Evolution is therefore a feedback system for Runtime itself, not an evaluation system for the learner.