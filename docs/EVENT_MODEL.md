# Event Model Reference

Event names are past-tense facts: `opportunity.discovered`, `opportunity.researched`, `opportunity.scored`, `opportunity.rejected`, `opportunity.approved`, `project.created`, `design.started`, `design.completed`, `design.review_failed`, `design.approved`, `build.started`, `build.completed`, `build.failed`, `qa.started`, `qa.failed`, `qa.passed`, `deployment.requested`, `deployment.approved`, `deployment.completed`, `deployment.failed`, `seo.issue_detected`, `seo.change_proposed`, `seo.change_applied`, `experiment.started`, `experiment.completed`, `learning.proposed`, `learning.validated`, and `learning.deprecated`.

Also emit workflow lifecycle, agent status, approval, policy, provider availability, cost, and audit events. The envelope is versioned and sanitized; consumers must accept unknown fields and reject unsupported major versions.

Phase 1.5 emits `provider.unavailable` separately for each missing capability, while `market_study.completed` and `opportunity.scored` include `phase2Ready: false` or the complete readiness result. An unavailable source is an event and provider-run record, not a successful observation.

Provider attempt persistence distinguishes `available`, `partial`, `unavailable`, `blocked`, and `failed`. Duplicate Temporal activity delivery reuses the same provider-attempt idempotency key. Evidence conflicts and staleness are included in the scorecard result rather than overwritten or averaged away.

Credentialed SERP execution adds `provider.rate_limited` with a sanitized retry delay. Raw provider bodies are evidence artifacts, not event payloads; activity events carry only safe identifiers, status and bounded explanations. Network and server errors persist as `failed` attempts.
