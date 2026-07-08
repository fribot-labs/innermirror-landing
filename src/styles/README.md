# Styles Architecture

The `styles` directory contains the visual presentation layer for the InnerMirror Landing application.

Each stylesheet owns a specific UI domain so that visual changes remain isolated and easy to maintain.

---

# Structure

```
styles/

├── global.css
├── base.css
├── landing.css
├── runtime.css
├── github.css
├── project.css
├── reflection.css
└── responsive.css
```

---

# File Responsibilities

## global.css

Entry point for all styles.

This file should only import the individual style modules.

```
global.css

↓

base.css
landing.css
runtime.css
github.css
project.css
reflection.css
responsive.css
```

No component-specific styling should be added here.

---

## base.css

Application-wide styles.

Includes:

- CSS reset
- Root variables
- Typography
- Default element styling
- Global animations

---

## landing.css

Landing page presentation.

Includes:

- Hero section
- Landing layout
- Marketing sections
- Boundary section

---

## runtime.css

Runtime V2 user interface.

Includes:

- Runtime Result Panel
- Runtime Insight
- Project Evolution
- Decision Evolution
- Decision Landscape
- Project Identity
- Knowledge Compression
- Runtime Strategy
- Runtime cards

This is the largest Runtime UI stylesheet.

---

## github.css

GitHub integration UI.

Includes:

- GitHub learning entry
- Repository selector
- GitHub snapshot
- Repository cards
- GitHub connection status

---

## project.css

Project management UI.

Includes:

- Project start
- Current project
- Project summary
- Project timeline
- Project continuity
- Project pattern

---

## reflection.css

Reflection and memory experience.

Includes:

- Reflection continuity
- Returning theme
- Long gap recovery
- Identity drift
- Runtime memory timeline
- Reflection feedback

---

## responsive.css

Responsive layout rules.

Includes:

- Mobile layout
- Tablet layout
- Shared media queries

No component-specific desktop styling should be added here.

---

# Design Principles

Each stylesheet should own a single UI domain.

Avoid placing unrelated styles into another module.

Example:

Runtime Insight

→ runtime.css

Repository Selector

→ github.css

Project Timeline

→ project.css

Reflection Memory

→ reflection.css

---

# Architecture

```
Landing Components

↓

Feature Stylesheet

↓

global.css

↓

Browser
```

Component responsibility:

```
Component

↓

Behavior
```

Stylesheet responsibility:

```
Stylesheet

↓

Presentation
```

This separation keeps Runtime reasoning independent from UI styling.

---

# Future Direction

As Runtime grows, new visual features should be added to the appropriate stylesheet instead of expanding `global.css`.

Example:

New Runtime panel

→ runtime.css

New GitHub screen

→ github.css

New Reflection visualization

→ reflection.css

This keeps the CSS architecture modular, maintainable, and scalable for long-term Runtime development.