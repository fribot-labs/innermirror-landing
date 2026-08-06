# Runtime Project Identity

## Purpose

Runtime Project Identity is the first abstraction layer that transforms a GitHub repository into a long-lived Runtime project.

Until PR-LA08, Runtime recognized only a selected GitHub repository.

After this layer, Runtime recognizes an ongoing project that can accumulate Reflection, GitHub activity, PBL progress, and future Runtime intelligence.

---

# Philosophy

A GitHub repository is a storage resource.

A Runtime Project Identity is an analytical identity.

The two concepts intentionally have different lifecycles.

```
GitHub Repository
        │
        ▼
Runtime Project Identity
        │
        ▼
Reflection
GitHub Activity
PBL Progress
Runtime Intelligence
```

---

# Responsibilities

This module is responsible for:

- creating a deterministic Runtime Project Identity
- persisting the current Project Identity
- restoring Project Identity
- validating stored Project Identity
- clearing Project Identity when GitHub identity changes

This module is **not** responsible for:

- Runtime Session
- GitHub OAuth
- Reflection
- Recommendation
- PBL curriculum
- GitHub repository synchronization

---

# Architecture

```
GitHub Repository
        │
        ▼
createRuntimeProjectIdentity()
        │
        ▼
RuntimeProjectIdentity
        │
        ▼
runtimeProjectIdentityStore
        │
        ▼
Landing Runtime State
```

---

# Project Identity

Runtime Project Identity consists of:

- projectId
- source
- kind
- repository
- createdAt

Example

```ts
{
  projectId:
    "github:wookjin-chung:pbl-coaching-system-design",

  source:
    "github-repository",

  kind:
    "general",

  repository: {
    owner:
      "wookjin-chung",

    name:
      "pbl-coaching-system-design",

    fullName:
      "wookjin-chung/pbl-coaching-system-design",

    defaultBranch:
      "main",

    htmlUrl:
      "https://github.com/wookjin-chung/pbl-coaching-system-design"
  },

  createdAt:
    "2026-08-07T00:00:00.000Z"
}
```

---

# Project ID

Project IDs are deterministic.

The same repository always produces the same Runtime Project ID.

```
github:{owner}:{repository}
```

Example

```
github:wookjin-chung:pbl-coaching-system-design
```

Advantages

- reproducible
- stable
- human-readable
- independent from Runtime Session
- independent from browser refresh

---

# Storage

The current Runtime Project Identity is stored locally.

Storage key

```
innermirror.runtimeProjectIdentity
```

Stored data includes only public project metadata.

Never stored

- GitHub access token
- OAuth provider token
- Runtime Session ID
- Reflection
- Runtime Recommendation
- private repository contents

---

# Lifecycle

## GitHub repository selected

```
Repository selected

↓

Project Identity created

↓

Stored locally

↓

Landing Runtime updated
```

---

## Browser refresh

```
Landing starts

↓

Project Identity restored

↓

Current project recovered
```

---

## Repository changed

```
Repository A

↓

Project Identity A

↓

Repository B selected

↓

Project Identity B
```

---

## Runtime unavailable

```
Runtime unavailable

↓

Project Identity preserved
```

Project Identity is independent from Runtime Session.

---

## GitHub sign out

```
GitHub sign out

↓

Runtime Session removed

↓

Project Identity removed
```

---

# Validation

Every restored Project Identity is validated.

Checks include:

- object structure
- projectId consistency
- repository consistency
- source
- kind
- createdAt
- GitHub URL

Invalid stored values are discarded automatically.

---

# Security

localStorage is treated as an untrusted persistence boundary.

Every restored object is normalized before use.

No authentication credentials are ever persisted.

---

# Repository Boundary

Landing owns:

- Project Identity creation
- Project Identity persistence
- Project Identity presentation

Runtime owns:

- Runtime Session
- Runtime Recommendation
- Runtime Intelligence
- Runtime Memory

---

# Future

Runtime Project Identity will become the common identifier shared across:

- Reflection
- Runtime Recommendation
- Runtime Memory
- GitHub Activity
- PBL Progress
- Learning Analytics

This layer establishes the long-term project identity that future Runtime intelligence will use.