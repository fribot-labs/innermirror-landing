# Legal & Compliance Readiness

> This document tracks the legal and operational requirements required before the public release of InnerMirror.

The purpose of this document is not to provide legal advice.

Its purpose is to identify which legal requirements have been verified,
which remain under review,
and which must be completed before launch.

---

# Current Service Status

Current MVP

```text
Public Landing

↓

GitHub OAuth

↓

Repository Selection

↓

Reflection

↓

Runtime

↓

Result Presentation
```

Current MVP

- No payment
- No subscription
- No automatic monitoring
- No external LLM analysis
- No background analysis

---

# Compliance Checklist

## Personal Information Protection

Status

IN REVIEW

Current service stores or may store:

- GitHub Account
- GitHub Email
- Reflection
- Learning Journey
- Project History

Required before launch

- Privacy Policy
- Data Ownership Policy
- Account Deletion Policy
- User Consent

---

## Terms of Service

Status

NOT STARTED

Required

- Terms of Service
- User Responsibility
- Service Limitation
- Account Deletion
- Contact Information

---

## GitHub OAuth Compliance

Status

PARTIALLY VERIFIED

Current MVP

- GitHub OAuth Login
- Public Repository Access

Required

- Verify requested GitHub permissions
- Verify data retention policy
- Verify GitHub branding requirements

---

## AI Transparency

Status

CURRENT MVP VERIFIED

Current MVP

- No continuous monitoring
- No automatic background analysis
- No external LLM analysis

Future versions

- AI Transparency
- User Notification
- Explicit Analysis Request

---

## Data Ownership

Status

IMPLEMENTING

Required

- README
- PRIVACY.md
- DATA_OWNERSHIP.md

Current principle

GitHub repositories remain under the learner's ownership.

InnerMirror stores only information required to provide its own service.

---

## Data Deletion

Status

DESIGN COMPLETE

Current policy

Complete account deletion removes all learner-owned records stored by InnerMirror.

Partial deletion is intentionally not supported.

GitHub repositories remain unchanged.

---

## Supabase

Status

Authentication Only

Current MVP

- GitHub OAuth
- Session

Not yet implemented

- Database Tables
- Reflection Persistence
- RLS
- User Data Persistence

---

## Commercial Operation

Status

NOT YET REQUIRED

Current MVP

- Free service
- No payment
- No subscription

Review required before introducing paid services.

---

## Business Registration

Status

UNDER REVIEW

Review whether the planned service requires:

- Business Registration
- E-commerce Registration
- Additional online service requirements

This must be verified before commercial launch.

---

# Documents

Current

- README.md
- PRIVACY.md
- DATA_OWNERSHIP.md

Future

- TERMS.md
- COOKIE_POLICY.md
- ACCOUNT_DELETION.md

---

# Launch Gate

The public release of InnerMirror requires verification of:

□ Privacy

□ Terms

□ Data Ownership

□ Account Deletion

□ GitHub OAuth Compliance

□ Korean Legal Review

□ Supabase Persistence

□ Security Review

---

# Foundation Principle

Trust comes before intelligence.

Ownership comes before analysis.

Compliance comes before public release.