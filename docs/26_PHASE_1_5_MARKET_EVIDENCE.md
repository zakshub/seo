# Phase 1.5 — Real Market Evidence Expansion

## Objective

Answer a narrower question truthfully: what public SEO product deserves further research? The study brief is “Find realistic organic-search opportunities for a public SEO web property that could attract meaningful traffic.” It compares multiple problem-derived product formats and checks English plus an Urdu topic surface without assuming that an academy, Urdu site, tool suite, free commercial-tool clone or AI product is correct.

## Capability matrix

| Capability | Current source | Status | What it proves | What it does not prove |
|---|---|---|---|---|
| Problem signal | Stack Exchange Webmasters official API | Available | Public question wording and source-page engagement | Search volume, geography, SERP weakness, revenue |
| Topic interest | Wikimedia Analytics official API | Available | Dated pageviews for specified Wikipedia articles/languages | Search demand, query volume, click potential |
| Trend interest | Google Trends API alpha | Unavailable | Nothing until access is verified | No value is estimated |
| Keyword discovery | No approved demand API | Unavailable | Question titles are retained only as problem language | Volume, KD and rankings stay UNKNOWN |
| Live SERP | No approved free lawful provider | Unavailable | Nothing | Composition, ranking positions and result weakness stay UNKNOWN |
| Competitors | Depends on live result discovery and bounded crawl | Unavailable | Nothing | DR, DA, backlinks and traffic stay UNKNOWN |
| First-party performance | Search Console | Unavailable until a property exists and OAuth is approved | Nothing for a pre-product market | No metrics are simulated |

## Decision model and readiness

The scorecard covers demand, intent, SERP reality, competitor quality, content/product gap, topic traffic potential, click potential, solution fit, authority requirement, build feasibility and strategic value. Each dimension contains classification, plain-language claim, evidence IDs, strength or UNKNOWN, weight and points. Phase 2 requires non-UNKNOWN evidence for demand, intent, SERP reality, competitors, gap, topic traffic potential, click potential, solution fit and build feasibility, at least 80% overall coverage, score at least 65, and a separate owner approval.

The current authorized sources cannot satisfy those gates. The expected outcome is `RESEARCH_MORE`, not a selected project. The approval endpoint independently refuses project creation when `phase2_readiness.ready` is false; disabling the browser button is only a convenience.

## Open-source capability review

Migration `0004_market_evidence_expansion.sql` records reviewed candidates for all requested categories. Current preferences are Crawlee for policy-governed crawling, Playwright for bounded JavaScript rendering, Lighthouse for technical audits, web-vitals for field measurement, Graphology for internal-link graphs, advertools as a possible isolated sitemap/robots adapter, the official Google Node client for future Search Console, and cautious WATCH decisions for rank tracking, model-heavy clustering and projects with maintenance/security concerns. None is installed by this phase.

Every future adoption requires a pinned version, license confirmation, dependency/security scan, resource and egress limits, robots/terms evaluation, redacted events, explicit capability declaration and cost/policy evaluation.

## Honest limitations

This phase deliberately cannot claim search volume, traffic forecasts, keyword difficulty, DR, DA, backlinks, rankings, SERP weakness, competitor quality or commercial viability. Wikimedia and Q&A observations improve topic/problem context, but they do not justify Phase 2 by themselves.
