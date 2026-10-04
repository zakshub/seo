# ADR 0006: MarketStudy extends the research workflow

Status: Accepted.

Phase 1 adds `MarketStudy` as a durable aggregate correlated to the existing `workflow_runs`, evidence, opportunity, evaluation, approval, and outbox model. It does not create a parallel research engine. Findings are dimension-level claims classified as fact, observation, inference, or unknown.

Scores are deterministic and explainable. UNKNOWN values earn no points and reduce evidence coverage; they are never silently converted into estimates. A recommendation cannot be `GO` with critical search-surface, SERP, or product-gap unknowns. The existing owner approval boundary remains authoritative and no Phase 2 action is automatic.
