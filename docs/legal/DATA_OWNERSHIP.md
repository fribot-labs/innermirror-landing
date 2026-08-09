# DATA_OWNERSHIP.md

# InnerMirror Data Ownership Policy

> **Your projects remain yours.**
>
> **Analysis begins only when you choose.**

This document defines the ownership, control, persistence, and deletion boundaries of data processed by the InnerMirror service.

It applies to the current InnerMirror MVP operated by:

```text
Fribot Co., Ltd.
주식회사 프라이봇
```

Privacy Officer:

```text
Wookjin Chung
정욱진
```

Contact:

```text
mail@fribot.com
```

Business Address:

```text
경상북도 경주시 강동면 동해대로 166-11, 7층
대한민국
```

---

# 1. Purpose

InnerMirror is an online Reflection and Project Continuity service.

The service is designed to help learners understand:

- their projects,
- their learning journey,
- their Reflection,
- their decisions,
- and how these change over time.

InnerMirror does not replace GitHub.

InnerMirror does not become the owner of learner-created projects.

InnerMirror exists to preserve and interpret continuity while leaving ownership with the learner.

---

# 2. Core Ownership Principle

The fundamental ownership model is:

```text
Learner

↓

Owns the Project

Owns the Reflection

Owns the Learning Journey

Controls Analysis

Controls Deletion
```

Using InnerMirror does not transfer ownership of learner-created information to InnerMirror.

---

# 3. GitHub Ownership

GitHub repositories remain under the learner's ownership and control.

InnerMirror does not become the owner of:

- repositories,
- source code,
- commits,
- branches,
- pull requests,
- issues,
- or GitHub accounts.

The current MVP does not modify GitHub repositories as part of the analysis workflow.

The current MVP does not delete GitHub repositories.

---

# 4. GitHub Independence

GitHub and InnerMirror are separate services.

Their responsibilities are intentionally separated.

```text
GitHub

↓

Software Project Source

Repository

Commit History

Pull Requests


InnerMirror

↓

Reflection

Project Context

Learning Continuity

Long-Term Understanding
```

GitHub remains the authoritative source for the software project.

InnerMirror remains the service for learner continuity and Reflection.

---

# 5. InnerMirror-Owned Service Infrastructure

InnerMirror operates the technical infrastructure required to provide the service.

This may include:

- authentication state,
- internal user identifiers,
- project linkage records,
- Reflection storage,
- continuity records,
- Runtime processing,
- service logs,
- security records.

Operating the infrastructure does not transfer ownership of learner-created content to InnerMirror.

InnerMirror acts as the service operator and processor of information required to provide the service.

---

# 6. User Identity Boundary

The current MVP identifies users through authenticated identity.

The intended identity model is:

```text
Supabase Auth User ID

↓

InnerMirror User Identity
```

Additional provider identity may include:

```text
GitHub Provider ID
```

GitHub email is not intended to be used as the permanent primary identity for the current MVP.

---

# 7. Identity Continuity

InnerMirror does not attempt to infer that different authentication identities belong to the same person.

If a learner uses a different supported authentication identity,
InnerMirror treats that identity as a different InnerMirror user.

InnerMirror does not automatically merge users based on:

- name,
- email similarity,
- repository ownership,
- project similarity,
- behavioral similarity,
- Reflection similarity,
- or inferred personal characteristics.

A learner who wishes to preserve long-term continuity must continue using the same supported authentication identity.

---

# 8. Identity Choice Remains with the Learner

The learner controls which supported authentication identity is used to access InnerMirror.

If the learner intentionally or unintentionally uses a different identity,
InnerMirror does not attempt to reconstruct or infer the previous identity.

This policy prevents hidden identity correlation.

```text
Same Authentication Identity

↓

Same InnerMirror Continuity


Different Authentication Identity

↓

Different InnerMirror User
```

---

# 9. Categories of Learner-Owned Data

Learner-owned information may include the following categories.

## 9.1 Reflection

Examples:

- Reflection text
- questions
- concerns
- decisions
- observations
- unfinished thoughts

Reflection is considered learner-created information.

---

## 9.2 Project Context

Examples:

- project identity
- current focus
- project state
- project events
- repository association

---

## 9.3 Learning Journey

Examples:

- learning progression
- project progression
- significant project transitions
- Reflection history
- continuity events

---

## 9.4 Fribot Learning Context

For projects originating from Fribot Learning:

- template identifier
- course identifier
- learning goal
- difficulty
- estimated duration
- starting project structure

These records describe the original learning context of the project.

---

# 10. GitHub-Derived Information

InnerMirror may temporarily process GitHub-derived information when the learner explicitly requests analysis.

Examples may include:

- repository identity
- repository metadata
- default branch
- recent commits
- recent pull requests

GitHub-derived information does not become InnerMirror-owned project content.

The current architecture should avoid permanently duplicating information that can reasonably be retrieved again from GitHub unless persistence is necessary for a defined service purpose.

---

# 11. Runtime-Derived Information

Runtime may produce information derived from learner-provided context.

Examples include:

- summary
- recommendation
- continuity interpretation
- project analysis
- pattern detection
- future analysis outputs

These outputs are service-derived information.

They do not transfer ownership of the underlying learner information.

---

# 12. Source Data and Derived Data

InnerMirror distinguishes between:

```text
Human-Created Source Data

and

Service-Derived Information
```

Human-created source data may include:

- Reflection
- project decisions
- project focus
- learning journey records

Service-derived information may include:

- summaries
- recommendations
- continuity analysis
- interpretations
- predictions

The distinction must remain clear in future database architecture.

---

# 13. Data Minimization

InnerMirror follows the principle:

> Store only what is reasonably necessary to provide the service.

Information should not be stored merely because it is technically available.

Particular attention must be given to:

- GitHub email
- source code
- complete repository history
- unrelated GitHub activity
- sensitive learner information

The MVP should prefer minimal storage.

---

# 14. Email Policy

The current MVP does not intend to use GitHub email as the primary persistent user identifier.

If user identification can be reliably maintained using:

```text
Supabase Auth User ID

+

GitHub Provider ID
```

GitHub email should not be persistently stored merely for identification purposes.

If email becomes necessary in a future version,
the purpose and retention policy must be separately reviewed.

---

# 15. Analysis Control

Analysis belongs under learner control.

The current MVP follows this rule:

```text
No learner request

↓

No analysis
```

Analysis may begin when the learner explicitly uses actions such as:

- Analyze GitHub Project
- Reflect
- Reflect + GitHub

InnerMirror does not continuously analyze GitHub activity.

InnerMirror does not automatically begin background analysis.

---

# 16. Current MVP AI Boundary

The current MVP does not send learner information to an external LLM for analysis.

Current MVP principles:

```text
No continuous monitoring

No automatic background analysis

No external LLM analysis
```

Future introduction of external AI or LLM processing requires a separate legal, privacy, security, and data ownership review before deployment.

---

# 17. Persistence Principle

InnerMirror may persist learner information required for long-term continuity.

Persistence does not alter ownership.

```text
Stored by InnerMirror

does not mean

Owned by InnerMirror
```

The learner remains the controlling subject of their InnerMirror history.

---

# 18. Retention Policy

For active users, information required for project and Reflection continuity may remain stored while the service relationship continues.

For inactive users:

```text
3 years of inactivity
```

is the current retention policy.

After this period, InnerMirror intends to remove associated learner records unless another applicable legal basis requires retention.

The three-year period is an InnerMirror service policy and is not represented as a statutory retention period.

---

# 19. Complete Deletion Principle

A learner may request deletion of their entire InnerMirror history.

The current service philosophy is:

```text
One Learner Identity

↓

One Continuous InnerMirror History

↓

One Complete Deletion Boundary
```

Deletion is intended to remove all learner-associated InnerMirror records within that identity boundary.

---

# 20. Partial Deletion

The current MVP does not intend to provide selective deletion by:

- individual Reflection,
- project,
- repository,
- date,
- time period,
- or derived analysis category.

The learner chooses whether the InnerMirror history connected to the authenticated identity continues to exist.

This product policy remains subject to applicable legal rights and obligations.

---

# 21. What Complete InnerMirror Deletion Includes

Complete deletion is intended to remove InnerMirror-controlled records such as:

- InnerMirror user identity records
- Reflection
- project records
- project continuity
- learning journey
- project history
- retained GitHub connection metadata
- retained Runtime-derived learner information

The exact production deletion scope must match the implemented database schema.

---

# 22. What InnerMirror Deletion Does Not Include

Deleting InnerMirror information does not delete information independently stored by GitHub.

InnerMirror deletion does not delete:

- GitHub repositories
- GitHub commits
- GitHub pull requests
- GitHub branches
- GitHub organizations
- GitHub accounts

GitHub resources remain under the learner's control.

---

# 23. Disconnecting GitHub Is Different from Deleting InnerMirror Data

The service must distinguish between:

```text
Disconnect GitHub

and

Delete My InnerMirror Data
```

Disconnect GitHub means:

- stop or remove the GitHub connection,
- do not delete the GitHub repository,
- do not automatically imply deletion of all InnerMirror history.

Delete My InnerMirror Data means:

- remove the learner's InnerMirror history within the applicable user identity boundary.

These actions must not be presented as equivalent.

---

# 24. Ownership After Account Deletion

After InnerMirror data deletion:

```text
InnerMirror Records

↓

Removed


GitHub Repository

↓

Unchanged
```

No InnerMirror account deletion operation transfers, modifies, or destroys ownership of the original GitHub project.

---

# 25. Sensitive Reflection Information

Reflection is free-form information.

A learner may voluntarily write information concerning:

- health,
- personal relationships,
- emotional state,
- beliefs,
- political opinions,
- or other highly personal matters.

InnerMirror does not require such information for the current MVP.

The service should avoid intentionally requesting sensitive information unless it becomes necessary for a clearly defined and lawfully reviewed purpose.

---

# 26. Users Under 14

The current InnerMirror MVP is intended only for users aged:

```text
14 years or older
```

The current MVP does not intentionally support users under 14.

Any future expansion to younger users requires a separate legal and consent review before implementation.

---

# 27. Infrastructure Does Not Define Ownership

Technical storage location does not determine ownership.

For example:

```text
Supabase

Vercel

Runtime Infrastructure

GitHub
```

may technically process or transport service information.

Their technical role does not change the learner ownership principles defined by this document.

Production infrastructure providers must nevertheless be reviewed separately for:

- data processing roles,
- security,
- retention,
- processing locations,
- and international transfers.

---

# 28. Current Supabase Boundary

The current MVP uses Supabase primarily for authentication.

Long-term production persistence is not yet finalized.

Current status:

```text
Supabase Auth

IMPLEMENTED


Production Learner Database

NOT YET FINALIZED


Production RLS

NOT YET VERIFIED


Production Deletion Workflow

NOT YET IMPLEMENTED
```

Any previous experimental Supabase records created before the production InnerMirror persistence architecture may be removed as test data.

---

# 29. Future Database Architecture

Future database schema must preserve the ownership model defined here.

Every learner-owned record should ultimately have a clear relationship to an authenticated InnerMirror user identity.

Conceptually:

```text
user_id

↓

projects

↓

reflections

↓

project_events

↓

learning_journey

↓

derived_information
```

The exact table structure will be defined separately.

This document defines ownership, not database implementation.

---

# 30. Security and Ownership

Ownership is meaningful only when access is properly isolated.

Before production persistence is enabled, InnerMirror must verify:

- authenticated access
- user-level authorization
- Row Level Security
- administrative access boundaries
- credential security
- transport security
- deletion behavior
- backup behavior

A learner must not be able to access another learner's private InnerMirror records.

---

# 31. Data Portability and Export

The current MVP does not yet define a formal personal-data export feature.

Status:

```text
OPEN
```

If export functionality is introduced,
the service should provide learner-owned records in a reasonably understandable format where appropriate.

This feature must be reviewed separately from deletion.

---

# 32. No Hidden Identity Reconstruction

InnerMirror must not attempt to reconstruct a deleted or changed learner identity through hidden correlation.

The service should not use:

- repository similarity,
- writing style,
- behavioral patterns,
- Reflection semantics,
- or inferred characteristics

to silently reconnect a new authenticated identity to a previous InnerMirror history.

This principle protects learner control over identity continuity.

---

# 33. No Ownership Through Analysis

Analysis does not create ownership.

If Runtime analyzes:

```text
Reflection

+

Project Context

+

GitHub Evidence
```

the resulting interpretation does not transfer ownership of the source information to InnerMirror.

---

# 34. Documentation Consistency

The following documents must remain consistent with this Data Ownership Policy:

```text
LEGAL_FOUNDATION.md

PRIVACY.md

LEGAL_READINESS.md

DATA_OWNERSHIP.md

Future TERMS.md

Future ACCOUNT_DELETION.md

Future SECURITY_POLICY.md

Future DATABASE_SCHEMA.md
```

If actual system behavior differs from these documents,
the discrepancy must be resolved before production deployment.

---

# 35. Public Trust Statement

The Landing may communicate this policy through a short Trust Layer:

```text
Your projects remain yours.

Analysis begins only when you choose.
```

Expanded:

```text
YOUR OWNERSHIP

✓ GitHub repositories remain under your ownership.

✓ InnerMirror never modifies GitHub repositories.


SERVICE TRANSPARENCY

✓ Analysis begins only when you explicitly request it.

✓ Analysis never starts automatically.


CURRENT MVP

✓ No continuous monitoring

✓ No automatic background analysis

✓ No external LLM analysis
```

---

# 36. Governance Rule

Future functionality must not silently weaken the ownership principles defined in this document.

Before introducing features such as:

- external LLM processing,
- private repository analysis,
- automated GitHub synchronization,
- background monitoring,
- cross-account identity linking,
- third-party analytics,
- long-term behavioral profiling,

InnerMirror must review:

```text
Legal

Privacy

Ownership

Security

Transparency
```

before production deployment.

---

# Foundation Statement

The learner owns the project.

The learner owns the Reflection.

The learner controls identity continuity.

The learner controls when analysis begins.

InnerMirror never becomes the owner of GitHub repositories.

InnerMirror never silently merges different learner identities.

Deleting InnerMirror history never deletes the learner's GitHub repositories.

Storage does not create ownership.

Analysis does not create ownership.

Trust comes before intelligence.

Ownership comes before analysis.