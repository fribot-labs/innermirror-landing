<p align="center">
  <img src="assets/logo/IM_LOGO.png" width="96" />
</p>

<h1 align="center">InnerMirror Landing</h1>

<p align="center">
  Public PBL Learning Entry and Presentation Layer for the InnerMirror + Fribot ecosystem.
</p>

---

## Purpose

This repository is the official public application of the Fribot ecosystem.

The Landing provides the learner experience by:

- starting GitHub-based learning
- managing Project workflows
- collecting learner Reflection
- capturing GitHub Snapshots
- communicating with the private Runtime
- presenting Runtime intelligence
- visualizing project progress

The Landing presents learning.

The Runtime interprets learning.

---

## Data Ownership

> GitHub repositories always remain
>
> under the learner's ownership.
>
> InnerMirror stores only the information
>
> required to provide its own service.
>
> Deleting InnerMirror data
>
> never deletes GitHub repositories.

---

# Service Transparency

The current MVP is intentionally simple.

The current MVP does not continuously monitor learner activity.

The current MVP does not perform background analysis.

The current MVP does not connect learner information to external LLM services.

Analysis begins only when the learner explicitly requests one of the following actions:

- Analyze GitHub Project
- Reflect
- Reflect + GitHub

The learner always decides:

- when GitHub is connected,
- when Reflection is recorded,
- when Runtime is executed,
- and when analysis begins.

Future versions may introduce optional AI-assisted interpretation.

Any future AI capabilities will continue to follow the same principles:

- learner ownership
- explicit user action
- transparent analysis
- complete data deletion
- GitHub independence

---

# Service Trust Documents

InnerMirror places legal transparency before implementation.

The following public documents explain how the service operates and how learner
rights are protected.

```text
PRIVACY.md
```

Defines:

- personal information processing
- learner rights
- retention
- deletion
- service transparency

```text
docs/legal/LEGAL_FOUNDATION.md
```

Defines:

- legal identity of the service
- service classification
- MVP legal boundary

```text
docs/legal/DATA_OWNERSHIP.md
```

Defines:

- ownership
- GitHub independence
- learner continuity
- deletion boundary

```text
docs/legal/PERSONAL_DATA_INVENTORY.md
```

Defines:

- every category of learner information
- persistence classification
- minimum necessary collection

---

# Choose Your Starting Point

InnerMirror supports two project entry paths.

The learner may begin with a structured Fribot Learning project or connect an
existing GitHub repository directly.

## Option 1 — Start a New Learning Project

Choose a project from Fribot Learning.

```text
Fribot Learning
        ↓
Choose a Project
        ↓
Export Repository
        ↓
Your GitHub Repository
        ↓
InnerMirror
        ↓
Project Analyze
Reflect
Reflect + GitHub
```

Fribot Learning provides a structured starting point.

Each learning project is exported into an independent learner-owned GitHub
repository.

For the MVP:

```text
One Fribot Learning Project
=
One Exported Repository
=
One GitHub Project
```

The template is used only once when the project begins.

After export, the learner owns the repository completely.

The learner may freely continue development using commits, branches,
pull requests, documentation, experiments, and new ideas.

InnerMirror interprets how the project evolves rather than requiring the
template to remain unchanged.

---

## Option 2 — Analyze an Existing Project

Fribot Learning is optional.

A learner who already has a GitHub repository may connect it directly to
InnerMirror.

```text
Existing GitHub Repository
        ↓
InnerMirror
        ↓
Project Analyze
Reflect
Reflect + GitHub
```

Existing repositories receive Runtime analysis using the available GitHub
context.

Repositories originating from Fribot Learning additionally provide explicit
PBL metadata, allowing richer initial project understanding.

---

## Relationship Between Fribot Learning and InnerMirror

The two services have different responsibilities.

```text
Fribot Learning
        ↓
Defines where a project begins.

────────────────────────────

InnerMirror
        ↓
Understands where the project chooses to go.
```

Fribot Learning introduces the learner to a structured project.

InnerMirror follows the learner's own project evolution.

The learner is free to extend the exported repository beyond the original
template.

Reflection, Git history, pull requests, and project direction are interpreted
together as one continuous learning journey.

---

## Project Philosophy

The exported repository belongs to the learner.

Templates provide the initial project context.

They do not constrain future development.

GitHub records how the project changes.

InnerMirror interprets how the learner grows.

---

## Architecture Boundary

```text
Learner
        ↓
GitHub Learning Entry
        ↓
Repository Selection
        ↓
Project
        ↓
Reflection
        ↓
Reflect + GitHub Analyze
        ↓
Runtime API
        ↓
Private Runtime
        ↓
Structured Runtime Response
        ↓
Landing Presentation
```

The Landing owns the learner experience.

The Runtime owns learning intelligence.

---

## Repository Identity

The Landing owns:

- GitHub Learning Entry
- GitHub Connection
- Repository Selection
- Project Creation
- Project Summary
- Reflection Input
- Reflection Editor
- Manual GitHub Snapshot Capture
- Runtime API Adapter
- Runtime Response Mapping
- UI State Management
- Progress Visualization
- Portfolio Presentation
- Coaching Presentation
- Decision Review Presentation

The Landing does **not** own:

- Reflection Analysis
- GitHub Interpretation
- Runtime Context
- Runtime Contract Interpretation
- Runtime Summary Generation
- Runtime Question Generation
- Runtime Coaching Generation
- Decision Review Generation
- Continuity Intelligence
- Runtime Memory
- Runtime Orchestration

Runtime intelligence belongs exclusively to:

```text
innermirror-runtime-private
```

---

## Landing Architecture

The Landing follows the architecture below.

```text
GitHub Learning Entry
        ↓
Project
        ↓
Reflection
        ↓
GitHub Snapshot
        ↓
Runtime API Adapter
        ↓
Runtime Response Mapping
        ↓
Presentation Components
        ↓
Learner Experience
```

The Landing captures learning context.

The Runtime interprets learning context.

---

## Manual GitHub Snapshot

The MVP intentionally avoids continuous GitHub synchronization.

GitHub data is collected only when the learner explicitly requests analysis.

Official workflow:

```text
Reflect + GitHub Analyze
        ↓
Capture GitHub Snapshot
        ↓
Runtime
```

The MVP intentionally excludes:

- GitHub Webhook
- Scheduler
- Polling
- Background synchronization

This keeps the learner in complete control of when project context is analyzed.

---

## Repository Visibility Policy

The MVP intentionally analyzes **public GitHub repositories only**.

Private repositories are intentionally excluded from:

- repository discovery
- repository selection
- GitHub Snapshot generation
- Runtime project analysis

Repository visibility policy:

```text
Public Repository
        ↓
Repository Selection
        ↓
GitHub Snapshot
        ↓
Runtime Analysis
```

Private repositories are never returned to the Landing.

This policy:

- protects private source code,
- minimizes requested GitHub permissions,
- reduces unnecessary repository access,
- keeps the learning workflow transparent.

Future versions may introduce optional private repository support.

The MVP intentionally focuses on public software projects to provide
transparent learning, minimal permissions, and clear repository ownership.

---

## Runtime GitHub Session Recovery

GitHub authentication and Runtime authorization are separate states.

A learner may remain signed in to GitHub while the temporary Runtime
GitHub session has expired.

When this occurs:

- GitHub identity remains connected,
- repository access is suspended,
- verified organization repositories are cleared,
- the learner may reconnect the Runtime session without immediately
  revoking the entire GitHub authorization.

If the GitHub provider token is no longer available, the learner must
renew GitHub authorization.

---

## PBL Project Model

The Landing organizes learning around Projects.

Official hierarchy:

```text
Project
        ↓
Milestone
        ↓
Pull Request
        ↓
Reflection
```

Reflection is no longer treated as an isolated record.

Reflection belongs to a Project.

---

## Runtime Relationship

The Landing prepares Runtime Contract V2 inputs.

Current Runtime Context includes:

- Reflection
- Project Context
- Repository Context
- GitHub Snapshot
- Learning Context

The Landing submits this context to the private Runtime.

The Runtime returns:

- Summary
- Question
- Coaching
- Decision Review

Landing never generates these outputs locally.

---

## Architecture Governance

The Landing follows strict architectural governance.

Core principles:

- Landing owns presentation.
- Runtime owns intelligence.
- Learning Platform owns education.
- GitHub communication belongs to the Landing.
- GitHub interpretation belongs to the Runtime.
- Runtime reasoning must never exist inside the Landing.
- Presentation must remain independent from Runtime implementation.

These principles preserve long-term architectural consistency.

---

## Database Migration Authority

The Landing repository does not own Supabase database migrations.

The authoritative Supabase migration sequence is maintained exclusively in:

```text
fribot-labs/innermirror-runtime-private
└─ supabase/
   └─ migrations/
```

The private Runtime repository owns the executable migration history for:

- public InnerMirror database schema
- Row Level Security
- database functions
- deletion functions
- Product Observation schema
- Product Observation private access
- Runtime database access

The Landing may use Supabase through approved browser-facing authentication and
persistence boundaries, but it does not define or version the production
database schema.

```text
innermirror-landing
        ↓
browser application
        ↓
learner experience
        ↓
authenticated public Supabase access
        ↓
Runtime communication
        ↓
no migration authority


innermirror-runtime-private
        ↓
private Runtime
        ↓
authoritative Supabase migrations
        ↓
database access governance
```

Do not add new Supabase migration files to this repository.

Any future database migration must be introduced through:

```text
fribot-labs/innermirror-runtime-private/supabase/migrations/
```

---

## Architecture Documents

Detailed documentation is available under:

```text
docs/architecture/

README.md
ARCHITECTURE_GOVERNANCE.md
PBL_PROJECT_DOMAIN_MODEL.md
GITHUB_SNAPSHOT_INTEGRATION.md
LANDING_RESPONSIBILITY_AUDIT.md
LANDING_RESPONSIBILITY_MATRIX.md
PERSISTENCE_DOMAIN_MODEL.md
DATABASE_SCHEMA.md
RLS_SECURITY_MODEL.md
SUPABASE_MIGRATION_PLAN.md
```

Developers should review these documents before introducing new Landing functionality.

---

## Legal Documentation

Legal architecture is maintained separately from implementation.

```text
docs/legal/

README.md
LEGAL_FOUNDATION.md
LEGAL_READINESS.md
DATA_OWNERSHIP.md
PERSONAL_DATA_INVENTORY.md
```

The legal documents define:

- service classification
- ownership
- privacy
- compliance
- learner rights

Implementation must remain consistent with these documents.

---

## Current Status

Current Phase

```text
Phase 1

✓ GitHub Learning Entry
        ↓
✓ Repository Selection
        ↓
✓ Project Domain
        ↓
✓ Manual GitHub Snapshot
        ↓
Runtime Contract V2 Ready
```

Next Phase

```text
Phase 2

Landing
        ↓
Runtime Contract V2
        ↓
Runtime V2 Pipeline
        ↓
Project-based Runtime Intelligence
```

---

## Foundation Principle

The Learning Platform provides education.

The Landing provides project-based learning experiences.

The Runtime provides learning intelligence.

GitHub provides public development evidence.

Projects provide learning structure.

Reflection provides learner thinking.

Together they create one coherent Project-Based Learning experience.

---

## Production Deployment

The InnerMirror Landing application is built with Vite.

### Local Verification

```bash
npm install

npm run dev

npm run build

npm run preview
```

### Build Configuration

```text
Build Command: npm run build

Output Directory: dist
```

### Environment Variables

The current Landing application uses:

```text
VITE_RUNTIME_API_URL

VITE_RUNTIME_REQUEST_TIMEOUT_MS

VITE_RUNTIME_RETRY_COUNT
```

Local values should be stored in:

```text
.env.local
```

Public variable names and example values are documented in:

```text
.env.example
```

Variables prefixed with `VITE_` are included in the client-side application
bundle and must not contain private credentials or server-only secrets.

### Deployment Target

The current production deployment target is Vercel.

GitHub OAuth, Supabase authentication, authenticated Reflection persistence,
and private Runtime integration are maintained according to the current
Landing / Runtime architecture boundaries.

Executable Supabase database migrations are maintained exclusively in
`innermirror-runtime-private`.

```text
Supabase Foundation
        ↓
Environment
        ↓
Client
        ↓
Authentication
```

---

# Foundation Statement

InnerMirror is an online Reflection and Project Continuity service.

The learner owns the project.

The learner controls when analysis begins.

GitHub remains independent.

InnerMirror stores only the information required to provide its own service.

Legal architecture defines the service.

Technical architecture implements the service.

Trust comes before intelligence.

Ownership comes before analysis.

Compliance comes before implementation.