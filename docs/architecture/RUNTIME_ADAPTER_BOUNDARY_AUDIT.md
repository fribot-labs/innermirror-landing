# Runtime Adapter Boundary Audit

This document records the result of the PR-001B repository boundary audit.

---

# Audit Purpose

The purpose of this audit is to verify whether `innermirror-landing` contains private Runtime intelligence.

The landing repository is allowed to contain:

- Runtime API adapter
- Runtime response mapping
- UI state management
- temporary local UI cache

It is not allowed to contain:

- private Reflection analysis
- PBL Coaching generation
- Decision Review logic
- Runtime orchestration
- proprietary AI reasoning

---

# Search Keywords

The following keywords were checked.

```text
generateSummary
generateQuestion
analyzeDecision
calculateCoaching
detectContinuity
continuity
coaching
decision
memory
```

---

# Audit Result

The search found Runtime-related code in the following categories.

## Runtime API Adapter

Examples:

```text
src/runtime-adapter/
```

This folder contains Runtime API communication, response validation, timeout handling, and Runtime-related hooks.

This is allowed.

---

## Runtime Response Mapping

Examples:

```text
src/runtime/
```

This folder maps Runtime responses into UI-friendly data structures.

This is allowed as long as it does not generate private intelligence locally.

---

## Runtime UI Components

Examples:

```text
src/components/runtime/
```

These components display Runtime-derived results such as memory timeline, continuity surfaces, and recovery state.

This is allowed.

---

## Temporary Local UI Cache

Examples:

```text
src/runtime-local/
```

This folder supports temporary local persistence and offline recovery UX.

This is allowed as client-side UI support.

It must not become private Runtime memory.

---

# Conclusion

No immediate removal is required.

The current implementation already follows a useful separation pattern.

The repository should preserve the following boundary:

```text
Landing

=

UI

+

Runtime API Adapter

+

Runtime Response Mapping

+

Temporary Local UI Cache
```

Landing must not evolve into a local Runtime.

---

# Follow-up Rule

Any future code added to `src/runtime/`, `src/runtime-adapter/`, or `src/runtime-local/` must preserve the boundary defined in:

```text
docs/architecture/REPOSITORY_BOUNDARY.md
```