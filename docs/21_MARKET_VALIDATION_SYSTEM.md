# Market Validation System

## Purpose

A `MarketStudy` asks whether a market, audience, problem, topic, or product direction deserves deeper investment. It extends the existing research workflow; it is not a second research engine. One study creates one durable workflow run and may produce multiple evidence-backed opportunity candidates.

## Runtime flow

1. The authenticated owner submits a 10–2,000 character brief.
2. The API atomically creates `market_studies`, `workflow_runs`, `market_study.created`, and `workflow.created` records with English/global scope, one public-source request, a 30-second source limit, and zero paid budget.
3. The API dispatches the existing Temporal `researchWorkflow` with the persisted study identity. A dispatch failure leaves the run inspectable and retryable.
4. The approved public-source adapter performs one bounded request. SEO briefs currently use the official Stack Exchange advanced-search API against the Webmasters community.
5. The worker persists source evidence before opportunities, links every supported finding to its evidence ID, scores each candidate, and writes idempotent events.
6. Three supported candidates move the study to `awaiting_review`. Fewer candidates leave it in research/waiting state. No product direction is silently selected.

## Authoritative entities

- `market_studies`: brief, locale, state, source policy, hard request/time limits, and zero paid budget.
- `workflow_runs.market_study_id`: durable orchestration correlation.
- `opportunities.market_study_id`: candidate membership plus audience, problem, intent, product, traffic, cost, defensibility, risks, unknowns, confidence, recommendation, and explainable score.
- `market_findings`: one dimension claim classified as `fact`, `observation`, `inference`, or `unknown`; supported findings carry evidence IDs.
- `evidence_items`: immutable provenance, capture time, locale, confidence, retention, reference details, and integrity hash.
- `outbox_events`: genuine activity projection; the UI never invents status.

## Current source policy

Only free public evidence is authorized. The Stack Exchange adapter is useful for problem-language and engagement signals, but cannot establish keyword volume, live SERP weakness, broad demand, geography, or willingness to pay. Those dimensions remain UNKNOWN. Search-engine scraping, paid APIs, copied data, and silent estimates are prohibited.

## Failure and retry behavior

Stable IDs make evidence, candidates, findings, evaluations, approvals, and events idempotent under Temporal activity retries. Provider restriction/failure creates an honest `provider.unavailable` event. A study with insufficient candidates does not advance to review.

## Open-source component registry policy

Potential crawler, audit, clustering, Search Console, browser, or extraction components may be reviewed later. Each review must record repository, exact license, maintenance evidence, security surface, runtime, integration effort, and accept/reject reason. No large component is integrated in Phase 1 merely because it exists.
