# LANDING_RUNTIME_PRESENTATION_BOUNDARY.md

This document defines the boundary between Runtime-like code inside the Landing repository and the private Runtime itself.

The Landing repository may contain folders with Runtime-related names because it communicates with the Runtime and presents Runtime results.

However, these folders must remain presentation, adapter, mapping, or temporary local cache layers.

They must never become private Runtime intelligence.

---

# Purpose

The purpose of this document is to prevent confusion between:

- Runtime Intelligence
- Runtime API Adapter
- Runtime Response Mapping
- Runtime Presentation Components
- Temporary Local UI Cache

The Landing may handle Runtime results.

The Landing must not generate Runtime intelligence.

---

# Current Landing Runtime-Like Folders

The following folders exist inside the Landing repository.

```text
src/runtime/
src/runtime-adapter/
src/runtime-local/
src/components/runtime/
```