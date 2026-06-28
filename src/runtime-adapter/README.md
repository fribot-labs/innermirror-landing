# Runtime Adapter Layer

This folder belongs to the Landing repository.

It contains the client-side adapter used to communicate with the private Runtime.

---

## Purpose

The Runtime Adapter sends structured requests to the private Runtime and receives structured Runtime responses.

It does not generate Runtime intelligence locally.

---

## Allowed Responsibilities

This folder may contain:

- Runtime API calls
- request construction
- response validation
- timeout handling
- error handling
- adapter hooks
- Runtime availability checks
- Runtime response normalization for Landing consumption

---

## Not Allowed

This folder must not contain:

- Reflection analysis
- Summary generation
- Runtime question generation
- Decision Review generation
- PBL Coaching generation
- Continuity Intelligence
- Runtime Memory processing
- Runtime orchestration
- proprietary AI reasoning

---

## Boundary Rule

Landing may request Runtime intelligence.

Runtime must generate Runtime intelligence.

The adapter is a communication boundary, not a local Runtime.