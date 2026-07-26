# Runtime Recommendation Integration

The Runtime Recommendation Integration module provides the orchestration layer between the Runtime execution pipeline and the Recommendation Evolution domain.

This module does **not** implement Recommendation algorithms.

Instead, it coordinates existing Recommendation Evolution results into a single Runtime Integration Contract.

---

# Purpose

Recommendation Evolution already provides several independent analytical layers.

```text
Recommendation Comparison
        ↓
Observation Summary
        ↓
Executive Summary
```

The Runtime cannot efficiently consume these results individually.

This module provides one stable Runtime-facing integration boundary.

```text
Runtime Recommendation Integration Result
├── Runtime Next Action
├── Recommendation Comparison
├── Observation Summary
├── Executive Summary
└── Integration Diagnostics
```

---

# Responsibilities

This module is responsible for:

- defining the Runtime Recommendation Integration Contract
- orchestrating Recommendation Evolution execution
- coordinating existing Recommendation Evolution stages
- assembling the final Runtime Recommendation Integration Result
- preserving deterministic execution order
- normalizing a shared generated timestamp
- forwarding RuntimeNextAction into Recommendation Evolution
- collecting integration diagnostics
- exposing a stable Runtime-facing API

---

# Non-Responsibilities

This module intentionally does **not**:

- analyze Reflections
- generate RuntimeNextAction
- calculate Base Recommendation scores
- calculate Adaptive Recommendation scores
- resolve Adaptive Winners
- calculate Observation Statistics
- calculate Observation Stability
- calculate Observation Drift
- calculate Observation Confidence
- persist Observation History
- update Runtime Memory
- modify Runtime API responses
- create Landing UI View Models
- render Recommendation Evolution
- automatically replace Runtime Recommendations

Those responsibilities belong to other Runtime or Recommendation Evolution modules.

---

# Runtime Boundary

This module follows the **B-style Integration Boundary**.

The Runtime execution layer is responsible for creating:

```text
RuntimeNextAction
Base Recommendation
Adaptive Resolution
Observation Statistics
Observation Stability
Observation Drift
Observation Confidence
```

These results become the Pipeline inputs.

```text
Runtime
        │
        ▼
RuntimeNextAction
Base Winner
Adaptive Resolution
Observation Analytics
        │
        ▼
Runtime Recommendation Integration Pipeline
```

The Pipeline never creates RuntimeNextAction itself.

---

# Pipeline

The Runtime Recommendation Integration Pipeline executes the existing Recommendation Evolution stages in a fixed order.

```text
1. Recommendation Comparison
        ↓
2. Observation Summary
        ↓
3. Runtime Executive Summary
        ↓
4. Runtime Recommendation Integration Result
```

Each stage is executed exactly once.

The Pipeline does not duplicate Recommendation Evolution algorithms.

---

# Shared generatedAt

The Pipeline normalizes one generated timestamp.

The same timestamp is forwarded to every supported stage.

```text
Recommendation Comparison
generatedAt
        │
        ▼
Observation Summary
generatedAt
        │
        ▼
Executive Summary
generatedAt
        │
        ▼
Integration Result
generatedAt
```

This guarantees deterministic timestamps across one Runtime execution.

---

# Observation Summary Projection

The Observation Summary stage returns:

```text
summary
diagnostics
policy
```

Only the Summary itself is forwarded into Executive Summary.

```text
Observation Summary Result
        │
        ├── diagnostics
        ├── policy
        └── summary
               │
               ▼
Runtime Executive Summary
```

The complete wrapper is preserved only for diagnostics and testing.

---

# Dependency Injection

The Pipeline supports dependency injection.

Production execution uses:

```text
DEFAULT_RUNTIME_RECOMMENDATION_INTEGRATION_DEPENDENCIES
```

Unit tests may inject mocked implementations.

```text
compareRecommendations
createObservationSummary
createExecutiveSummary
createIntegrationResult
```

This allows the Pipeline to be tested independently from Recommendation algorithms.

---

# Error Policy

Expected Recommendation Evolution states are represented by existing domain results.

```text
complete

partial

insufficient-data
```

These are **not** treated as Runtime failures.

Unexpected programming errors are propagated.

```text
Comparison throws
        ▼
Pipeline stops

Observation Summary throws
        ▼
Pipeline stops

Executive Summary throws
        ▼
Pipeline stops

Integration Result throws
        ▼
Pipeline stops
```

The Pipeline intentionally does not swallow unexpected exceptions.

---

# Public API

Current public APIs:

```text
runRuntimeRecommendationIntegration(...)
```

Returns:

```text
RuntimeRecommendationIntegrationResult
```

Developer-oriented API:

```text
executeRuntimeRecommendationIntegrationPipeline(...)
```

Returns:

```text
recommendationComparison

observationSummaryResult

executiveSummaryResult

integrationResult
```

This API exists primarily for diagnostics and unit testing.

---

# Module Structure

```text
runtime-recommendation-integration/

README.md

runtimeRecommendationIntegrationTypes.ts

runtimeRecommendationIntegrationPipelineTypes.ts

createRuntimeRecommendationIntegrationResult.ts

runRuntimeRecommendationIntegration.ts

__tests__/
    createRuntimeRecommendationIntegrationResult.test.ts
    runRuntimeRecommendationIntegration.test.ts
```

---

# Current Validation

Current automated validation includes:

```text
Integration Contract

Availability Resolution

Status Resolution

Reason Resolution

Completed Stage Resolution

Warning Aggregation

Defensive Cloning

Pipeline Execution Order

Shared generatedAt

Policy Forwarding

Observation Summary Projection

Dependency Validation

Error Propagation
```

---

# Current Architecture

```text
Runtime
        │
        ▼
RuntimeNextAction
        │
        ▼
Recommendation Comparison
        │
        ▼
Observation Summary
        │
        ▼
Runtime Executive Summary
        │
        ▼
Runtime Recommendation Integration Result
```

Recommendation Evolution now executes through one deterministic Runtime Pipeline while preserving the responsibilities of each existing domain module.

---

# Next Step

The next Runtime Integration stage is:

```text
PR-RI03

Runtime Analysis Result Extension
```

At that stage the Runtime Recommendation Integration Result becomes part of the official Runtime Analysis Result returned by the Runtime.