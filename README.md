<p align="center">
  <img src="assets/logo/fribot-logo.png" width="96" />
</p>

<h1 align="center">InnerMirror Landing</h1>

<p align="center">
  Public product narrative and workflow UX surface for the InnerMirror + Fribot PBL ecosystem.
</p>

---

## What is this repository?

`innermirror-landing` is the public-facing landing and workflow UX repository for InnerMirror.

This repository focuses on:

- product narrative
- public onboarding
- workflow reflection UX
- lightweight interaction surfaces
- public timeline and reflection previews
- runtime adapter interface

It does **not** contain private cognitive runtime logic.

---

## Architecture Principle

```text
Public Workflow UX
        ↓
Runtime Adapter Interface
        ↓
Private Cognitive Runtime
````

Public workflow UX may be open.
Private cognitive orchestration remains protected.

---

## Public Scope

This repository may include:

* landing page
* onboarding flow
* reflection input UX
* public workflow preview
* timeline interaction surface
* design system
* runtime adapter client

---

## Private Runtime Boundary

Private runtime orchestration is maintained outside this repository.

This public repository may communicate with the private runtime through a stable runtime adapter layer, but does not include private runtime internals.

Examples of private runtime responsibilities include:

* orchestration execution
* continuity analysis
* adaptive runtime processing
* runtime diagnostics
* long-term memory processing

---

## Current PR Scope

### PR-L01: Reset and Public App Rebuild

This PR resets the previous test-level implementation and rebuilds this repository as a React/Vite public app skeleton.

Included:

* React/Vite app structure
* public landing page skeleton
* component-based layout
* public/private runtime boundary notice
* runtime adapter placeholder
* updated repository README

---

## Built with

* React
* TypeScript
* Vite
* CSS

---

## Development

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

---

## Repository Role

```text
innermirror-landing
= Public Product Narrative + Public Workflow UX Layer

innermirror-runtime-private
= Private Cognitive Runtime Layer

fribot-flow-timeline
= Original full working source / internal reference repository
```

---

## Repository Boundary

`innermirror-landing` is the public user interface repository of the InnerMirror experience.

This repository is responsible for:

- Reflection input UI
- GitHub connection UI
- Repository selection UI
- "Reflect + GitHub Analyze" button
- Runtime API adapter
- Runtime response mapping for UI
- Coaching result display
- Decision Review result display
- Portfolio display
- Temporary local UI cache

This repository is **not** responsible for:

- Reflection analysis
- PBL Coaching generation
- Decision Review logic
- Memory processing
- Continuity Intelligence
- Runtime orchestration
- Proprietary AI reasoning
- Prompt engineering

Private runtime intelligence belongs to `innermirror-runtime-private`.

---

## Runtime Boundary

The landing app may call Runtime APIs and transform Runtime responses into UI-friendly data.

Allowed:

```text
User Input

↓

Runtime Adapter

↓

Runtime API

↓

Runtime Response

↓

UI Mapping

↓

React Components
```

Not allowed:

```text
User Input

↓

Local AI Reasoning

↓

Local Coaching Generation

↓

Local Decision Review
```

In this repository:

- `src/runtime-adapter/` means Runtime API communication.
- `src/runtime/` means Runtime response mapping for UI.
- `src/runtime-local/` means temporary local UI cache and offline recovery support.

No folder in this repository should contain the private Runtime intelligence itself.

---

## Final Principle

InnerMirror grows strongest when workflow openness and cognition protection remain intentionally balanced.

