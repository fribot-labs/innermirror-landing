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

The following logic belongs in `innermirror-engine-private`:

* adaptive orchestration
* scoring logic
* weighting systems
* recommendation runtime
* continuity intelligence
* trajectory analysis
* Cognitive OS internals

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

innermirror-engine-private
= Private Cognitive Runtime Layer

fribot-flow-timeline
= Original full working source / internal reference repository
```

---

## Final Principle

InnerMirror grows strongest when workflow openness and cognition protection remain intentionally balanced.
