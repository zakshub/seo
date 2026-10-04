# Data Model Reference

All aggregate tables use UUID primary keys, workspace ID, created/updated timestamps, optimistic version, and audit correlation. `EvidenceItem` includes subject, source kind/URL/provider, capturedAt, excerpt/reference, locale, confidence, retention status, and integrity hash. `Opportunity` references evidence and holds lifecycle status. `Evaluation` is versioned and references its opportunity/evidence. `Project` originates from one approved opportunity.

`WorkflowRun`, `WorkflowStep`, and `AgentRun` retain state, temporal workflow identifiers, idempotency keys, attempts, timestamps, and failure references. `ApprovalRequest` snapshots material inputs and policy result; `ApprovalDecision` is immutable. `OutboxEvent` is append-only and published at least once; consumers deduplicate by event ID.

Migration `0004` adds normalized evidence capability/provider/source class/subject/measurement/limitations, per-study provider runs (including unavailable results), a modern opportunity scorecard, topic/query/gap/product-format/IA fields, and a persisted Phase 2 readiness result. `open_source_tool_reviews` is a dated governance registry; `research_heuristics` explicitly prevents historical thresholds from becoming decision rules.

Migration `0005` adds evidence nature, geography, observation/freshness times, append-only idempotent `provider_run_attempts`, and bounded `competitor_observations`. A provider snapshot is the latest UI projection; attempt rows retain available, partial, unavailable, blocked and failed outcomes.

Migration `0006` adds scoped budget approval references, HTTP/rate-limit outcomes and micro-USD estimates to provider attempts. `provider_raw_artifacts` retains the sanitized Brave response body, response hash, selected non-secret headers, query, country/language and request/receipt times. Expanded competitor observations retain snippets, extra snippets, repeated-domain counts, SERP features, observed intent and explained specialist/broad classifications. Provider tokens and authorization headers are never stored.
