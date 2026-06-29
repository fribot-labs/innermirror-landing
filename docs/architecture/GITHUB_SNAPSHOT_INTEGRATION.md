# GITHUB_SNAPSHOT_INTEGRATION.md

This document defines the GitHub Snapshot Integration model of the PBL Coding Education MVP.

The purpose of GitHub Snapshot is not continuous repository monitoring.

Its purpose is to capture a lightweight and intentional development context that can be interpreted together with Reflection.

GitHub Snapshot becomes one component of the Runtime Context.

---

# Purpose

Reflection explains what the learner thinks.

GitHub Snapshot explains what the learner recently changed.

The Runtime combines these perspectives into one learning context.

The goal is to understand the learner's thinking in relation to actual development activity.

---

# MVP Principle

The MVP intentionally avoids automatic synchronization.

GitHub data is captured only when the learner explicitly requests analysis.

Official workflow:

```text
Reflect + GitHub Analyze

↓

Capture GitHub Snapshot

↓

Runtime Context

↓

Runtime Analysis
```

This minimizes implementation complexity while preserving educational value.

---

# Manual Synchronization Policy

The following features are intentionally excluded from the MVP.

Not Included

- GitHub Webhook
- Scheduler
- Polling
- Background synchronization
- Real-time monitoring

These features belong to the post-MVP roadmap.

---

# GitHub Snapshot Scope

The MVP captures only lightweight repository activity.

Current scope

```text
Recent 10 Commits

+

Recent 3 Pull Requests
```

The Runtime does not analyze the entire repository.

The snapshot provides sufficient development context for project-based coaching.

---

# Snapshot Structure

GitHub Snapshot consists of:

```text
Repository

↓

Recent Commits

↓

Recent Pull Requests

↓

Captured Time
```

The Snapshot represents one point in time.

It is not intended to become a permanent repository mirror.

---

# Runtime Relationship

GitHub Snapshot becomes one input of Runtime Contract V2.

```
Reflection

+

Project Context

+

Repository Context

+

GitHub Snapshot

+

Learning Context

↓

Runtime Context
```

The Runtime analyzes the complete learning situation rather than isolated Reflection.

---

# Landing Responsibilities

The Landing owns:

- GitHub connection
- Repository selection
- Snapshot capture
- Snapshot presentation

The Landing does not interpret Snapshot data.

It only collects and forwards the Snapshot.

---

# Runtime Responsibilities

The Runtime owns:

- Snapshot interpretation
- Learning context analysis
- Reflection analysis
- PBL Coaching
- Decision Review

The Runtime never communicates directly with GitHub.

GitHub communication remains inside the Landing.

---

# Current MVP Flow

The learner experience is:

```text
GitHub Login

↓

Repository Selection

↓

Project Start

↓

Reflection

↓

Reflect + GitHub Analyze

↓

GitHub Snapshot

↓

Runtime
```

The Snapshot is always captured immediately before Runtime analysis.

---

# Future Expansion

Future versions may expand GitHub Snapshot to include:

- Issues
- Discussions
- Review Comments
- Releases
- Tags
- Branch History

The MVP intentionally limits the Snapshot to recent development activity.

---

# Architectural Boundary

Landing owns GitHub communication.

Runtime owns GitHub interpretation.

This separation preserves repository boundaries and prevents Runtime from becoming dependent on external GitHub APIs.

---

# Foundation Principle

GitHub records code evolution.

Reflection records thinking.

Project records learning.

GitHub Snapshot connects these perspectives into one coherent Runtime Context.

The purpose of GitHub Snapshot is not to monitor repositories.

The purpose is to help the Runtime understand the learner within the context of real software development.
