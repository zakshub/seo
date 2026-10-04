# ADR 0008: Evidence quality, freshness, conflict and credentialed providers

Status: Accepted on 2026-10-04.

Phase 1.5 distinguishes direct evidence from proxies. A direct metric observes the decision concept itself for a named source and scope—for example a captured Brave result position or Google Ads historical search metric. A proxy is contextual—for example Wikipedia topic interest, Stack Exchange problem engagement, lexical intent match, or national internet adoption. A proxy cannot silently satisfy a direct-evidence gate.

Every normalized observation carries provider, capability, source class, direct/proxy nature, capture time, observation time, freshness limit where applicable, geography, confidence and limitations. Stale required evidence is treated as UNKNOWN. Fresh, materially conflicting evidence makes the affected dimension UNKNOWN until reconciled. Confidence scales score contribution; low-confidence completeness cannot pass the minimum score.

Provider attempts are append-only and idempotent. Available, partial, unavailable, blocked and failed attempts are retained. The current snapshot table remains a UI projection; it is not the attempt history.

Brave Search is the selected live-search adapter because it exposes a documented search API with language and country targeting. It is a paid subscription product, so the zero-budget workflow blocks it even if a credential appears. Adding a key is insufficient: a positive, scoped budget approval is also required. Its ranking positions are Brave positions, not Google rankings.

The earlier provisional selection of direct Google Ads Keyword Planner is superseded by the proposed practical recommendation in ADR 0009. The existing adapter remains dormant. No credential-dependent demand provider may execute until the owner approves one provider and a scoped budget. Average monthly searches remain targeted historical estimates; bid and advertising competition metrics are commercial-intent evidence, not organic difficulty.

The World Bank Indicators API is enabled without credentials for Pakistan internet-adoption context. This is a geographic digital-access proxy only and cannot satisfy demand, click, SERP, competitor or commercial-intent gates.

Authority/backlink difficulty remains unavailable. Common Crawl can support later discovery and page retrieval, but crawl presence is not equivalent to backlink quality, DR, DA or ranking difficulty.

References:

- [Brave Web Search API](https://api-dashboard.search.brave.com/api-reference/web/search/post)
- [Brave API plans](https://brave.com/search/api/)
- [Google Ads historical keyword metrics](https://developers.google.com/google-ads/api/docs/keyword-planning/generate-historical-metrics)
- [World Bank Indicators API access](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392)
- [Common Crawl access](https://commoncrawl.org/get-started)
