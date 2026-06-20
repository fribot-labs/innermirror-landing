# Runtime Boundary

The public landing repository must not contain private runtime orchestration logic.

---

# Public Repository Responsibilities

The public landing repository may include:

- landing UI
- onboarding flow
- workflow interaction UX
- reflection input surfaces
- runtime adapter client
- runtime response rendering
- loading/error states
- public-safe runtime contracts

---

# Private Runtime Responsibilities

The private runtime repository is responsible for:

- runtime orchestration
- continuity analysis
- adaptive processing
- memory persistence
- diagnostics internals
- autonomous runtime execution
- deep cognitive processing

---

# Boundary Principle

The public landing layer may communicate with the private runtime through stable API contracts.

Example:

```text
POST /runtime/reflection
````

The public repository must not directly import or duplicate private runtime internals.

---

# Environment Principle

Environment-specific runtime configuration must remain outside committed public source code.

Examples:

```text
.env.local
runtime URLs
private deployment configuration
```

---

# Final Principle

Public workflow openness and private cognition protection must remain intentionally separated.
