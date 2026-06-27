# Repository Boundary

This document defines the official repository boundary of `innermirror-landing`.

This repository is the public user interface layer of the InnerMirror experience.

It may communicate with the private Runtime, but it must not implement private Runtime intelligence.

---

# Repository Identity

`innermirror-landing` is the official **User Interface Repository** of the Fribot ecosystem.

Its responsibility is to collect user input, call Runtime APIs, and display returned results.

It is not responsible for generating the intelligence behind those results.

---

# This Repository Owns

`innermirror-landing` owns:

- Reflection input UI
- GitHub connection UI
- Repository selection UI
- "Reflect + GitHub Analyze" button
- Runtime API adapter
- Runtime response mapping
- Runtime result display
- Coaching result display
- Decision Review result display
- Portfolio display
- Loading state
- Error state
- Temporary local UI cache
- Offline recovery UI

---

# This Repository Does Not Own

`innermirror-landing` does not own:

- Reflection analysis
- GitHub Snapshot analysis
- PBL Coaching generation
- Decision Review logic
- Memory processing
- Continuity Intelligence
- Runtime orchestration
- Proprietary AI reasoning
- Prompt engineering
- Internal recommendation logic

These responsibilities belong to `innermirror-runtime-private`.

---

# Current Runtime-Related Folder Policy

This repository currently contains Runtime-related folders.

These folders are allowed only under strict responsibility boundaries.

---

## `src/runtime-adapter/`

Purpose:

Runtime API communication.

Allowed responsibilities:

- call Runtime API endpoints
- validate Runtime API responses
- handle Runtime request failures
- handle timeout recovery
- provide adapter hooks
- expose Runtime result data to UI components

Not allowed:

- generate Reflection analysis locally
- generate PBL Coaching locally
- generate Decision Review locally
- perform Runtime orchestration locally

---

## `src/runtime/`

Purpose:

Runtime response mapping for UI.

Allowed responsibilities:

- transform Runtime result into UI surface data
- prepare continuity surface display data
- prepare memory timeline display data
- prepare recovery surface display data
- normalize Runtime result for presentation

Not allowed:

- infer hidden learner psychology
- generate coaching logic
- generate decision intelligence
- replace private Runtime analysis

This folder may derive UI labels from Runtime results.

It must not become a local Runtime.

---

## `src/runtime-local/`

Purpose:

Temporary local UI cache and offline recovery support.

Allowed responsibilities:

- temporarily store local reflections
- support offline recovery UX
- clear local reflection cache
- refresh local reflection cache
- prepare client-side recovery state

Not allowed:

- long-term memory intelligence
- private cognitive processing
- decision history analysis
- coaching generation

Local cache is not Runtime memory.

---

# Allowed Runtime Interaction Pattern

Allowed pattern:

```ts
const result = await runtimeAdapter.analyzeReflectionWithGithub({
  reflectionText,
  projectId,
  repositoryId,
  githubSnapshot,
});
```

or equivalent Runtime API adapter calls.

The landing app may then map the returned result into UI surfaces.

---

# Disallowed Pattern

The following patterns are not allowed in `innermirror-landing`.

```ts
generateSummary(reflectionText);
generateQuestion(reflectionText);
analyzeDecision(reflectionText);
calculateCoaching(reflectionText);
detectContinuity(reflectionText);
generateDecisionReview(reflectionText);
generatePblCoaching(reflectionText);
```

If logic generates coaching, analyzes decisions, or evaluates learner state, it belongs to `innermirror-runtime-private`.

---

# Boundary with `fribot-learning`

`fribot-learning` owns the education platform.

Examples:

- PBL learning structure
- learning templates
- public educational documentation
- Foundation Documentation
- MVP roadmap

`innermirror-landing` may display learning-related UI, but it does not own the curriculum or long-term Foundation documentation.

---

# Boundary with `innermirror-runtime-private`

`innermirror-runtime-private` owns all private runtime intelligence.

Examples:

- Reflection analysis
- GitHub Snapshot analysis
- PBL Coaching
- Decision Review
- Senior Thinking Checkpoints
- Memory
- Continuity Intelligence

Landing requests analysis.

Runtime performs analysis.

Landing displays results.

---

# Boundary with `innermirror-engine-private`

`innermirror-engine-private` is a private research repository.

It may contain experimental decision intelligence or recommendation logic.

Landing should not depend directly on this repository.

Any production intelligence should flow through `innermirror-runtime-private`.

---

# Boundary with `fribot-flow-timeline`

`fribot-flow-timeline` is a historical development archive and sandbox.

Landing may reference UX ideas from it, but active MVP UI should be implemented in `innermirror-landing`.

---

# Feature Placement Guide

| Feature Type | Correct Repository |
|-------------|-------------------|
| Learning template | fribot-learning |
| Curriculum structure | fribot-learning |
| Reflection input UI | innermirror-landing |
| GitHub connection UI | innermirror-landing |
| Repository selector UI | innermirror-landing |
| Reflect + GitHub Analyze button | innermirror-landing |
| Coaching result display | innermirror-landing |
| Decision Review result display | innermirror-landing |
| Portfolio display | innermirror-landing |
| Runtime API adapter | innermirror-landing |
| Runtime response UI mapping | innermirror-landing |
| Temporary local UI cache | innermirror-landing |
| Reflection analysis | innermirror-runtime-private |
| GitHub Snapshot analysis | innermirror-runtime-private |
| PBL Coaching generation | innermirror-runtime-private |
| Decision Review generation | innermirror-runtime-private |
| Memory processing | innermirror-runtime-private |
| Experimental recommendation logic | innermirror-engine-private |
| Historical prototype reference | fribot-flow-timeline |

---

# Security Rule

`innermirror-landing` is public.

Therefore, it must never contain:

- proprietary prompts
- private Runtime logic
- cognitive analysis algorithms
- learner decision intelligence
- long-term memory processing

Public UI is allowed.

Private intelligence is not.

---

# Foundation Principle

`innermirror-landing` displays the learning experience.

It does not generate the intelligence behind the learning experience.

Clear separation between UI, adapter, and Runtime protects security, maintainability, and long-term service identity.