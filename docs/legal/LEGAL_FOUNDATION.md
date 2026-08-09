# LEGAL_FOUNDATION.md

> **Legal Foundation for the InnerMirror Service**

This document defines the legal foundation, service classification, operational principles, and compliance boundaries of the InnerMirror platform.

It is the highest-level legal architecture document for the service.

All future legal, privacy, security, and compliance documents must remain consistent with this foundation.

---

# 1. Service Classification

The current InnerMirror MVP is classified as:

```text
Online Reflection
&
Project Continuity Service
```

The purpose of the service is to help learners understand the long-term evolution of their projects, learning, and thinking.

InnerMirror is not a Git hosting platform.

InnerMirror is not a source code management platform.

InnerMirror does not replace GitHub.

GitHub remains the authoritative platform for software development.

InnerMirror remains the platform for Reflection and learning continuity.

---

# 2. Service Purpose

InnerMirror provides:

- Reflection
- Project continuity
- Learning continuity
- Project interpretation
- Runtime-assisted project understanding

The service exists to help learners better understand their own long-term project journey.

---

# 3. Service Operator

Service Operator

```text
Fribot Co., Ltd.

(주식회사 프라이봇)
```

Privacy Officer

```text
Wookjin Chung
(정욱진)
```

Contact

```text
mail@fribot.com
```

Business Address

```text
7F,
166-11 Donghae-daero,
Gangdong-myeon,
Gyeongju-si,
Gyeongsangbuk-do,
Republic of Korea
```

---

# 4. Current MVP Boundary

Current MVP

```text
GitHub OAuth

↓

Repository Selection

↓

Project

↓

Reflection

↓

Runtime

↓

Result Presentation
```

The current MVP does not continuously monitor learner activity.

Analysis begins only when explicitly requested by the learner.

Current MVP principles:

- No continuous monitoring
- No automatic background analysis
- No external LLM analysis

---

# 5. GitHub Relationship

GitHub remains completely independent from InnerMirror.

Connecting GitHub to InnerMirror does not transfer repository ownership.

InnerMirror never:

- owns GitHub repositories,
- modifies GitHub repositories,
- deletes GitHub repositories.

GitHub repositories always remain under the learner's ownership.

---

# 6. Authentication

The current MVP authenticates learners through GitHub OAuth.

Supabase Authentication establishes the authenticated identity.

The learner does not create a separate InnerMirror password.

GitHub authentication exists only to establish the learner's identity.

---

# 7. User Identity Policy

InnerMirror identifies learners using the authenticated identity.

Current MVP identity model:

```text
Supabase Auth User ID

↓

Authenticated InnerMirror User
```

The service intentionally does not merge different authenticated identities.

If a learner signs in with a different authenticated identity,

InnerMirror treats that identity as a different learner.

Identity continuity remains entirely under the learner's control.

---

# 8. Personal Information

The current MVP may process information including:

Identity

- GitHub Provider ID
- GitHub Username

Project

- Repository
- Project
- Template Origin

Reflection

- Reflection
- Learning Journey
- Current Focus
- Project Events

Current MVP does **not** intend to permanently store GitHub email addresses unless required for future service operation.

The service follows the principle of minimum necessary collection.

---

# 9. Data Ownership

Ownership remains with the learner.

The learner owns:

- GitHub repositories
- Reflection
- Projects
- Learning Journey

Runtime interpretations never change ownership.

---

# 10. Data Retention

Current policy

Active learner

↓

Records remain available to support learning continuity.

Inactive learner

↓

Records are removed after:

```text
3 years of inactivity
```

This period may be revised in future versions if required by law or service operation.

---

# 11. Account Deletion

Learners may request complete deletion of their InnerMirror records.

Deletion removes:

- Reflection
- Learning Journey
- Project History
- Runtime-derived learner information
- GitHub connection information

Deletion does **not** remove:

- GitHub repositories
- GitHub commits
- GitHub pull requests
- GitHub account

GitHub remains completely independent.

---

# 12. Service Transparency

The current MVP follows these principles.

```text
Analysis begins only when requested.

Analysis never starts automatically.

No continuous monitoring.

No automatic background analysis.

No external LLM analysis.
```

Future versions introducing AI-assisted interpretation must update this document before deployment.

---

# 13. Legal Readiness

The following documents are derived from this foundation.

```text
LEGAL_FOUNDATION.md

↓

LEGAL_READINESS.md

↓

PRIVACY.md

↓

DATA_OWNERSHIP.md

↓

TERMS.md

↓

ACCOUNT_DELETION.md

↓

DATABASE_SCHEMA.md

↓

SECURITY_POLICY.md
```

No document may contradict this foundation.

---

# 14. Open Items

The following items remain under review.

Supabase production region

Current status

```text
OPEN
```

International data transfer review

```text
OPEN
```

Production database persistence

```text
OPEN
```

Supabase Row Level Security

```text
OPEN
```

Production security verification

```text
OPEN
```

---

# Foundation Principles

InnerMirror is an online Reflection and Project Continuity service.

The learner owns every project.

The learner controls when analysis begins.

GitHub remains independent.

InnerMirror stores only the information required to provide its own service.

Trust comes before intelligence.

Ownership comes before analysis.

Compliance comes before persistence.