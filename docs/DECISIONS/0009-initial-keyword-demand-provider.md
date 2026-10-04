# ADR 0009: Initial keyword-demand provider recommendation

Status: Proposed on 2026-10-04; owner approval required before implementation or credential use.

## Decision

Recommend **DataForSEO Keywords Data — Google Ads Search Volume Live** as the first direct keyword-demand provider. Do not integrate or call it until the owner approves the provider and spending. The existing Google Ads adapter remains dormant and must not execute merely because credentials appear.

This recommendation prioritizes practical access to location- and language-targeted Google Ads-derived history for a small private research system. It is not a claim that DataForSEO volume equals exact organic demand or future traffic.

## Comparison

| Option | Setup | Cost | Geography / Pakistan | Metric quality | API and limits | Policy / long-term fit |
|---|---|---|---|---|---|---|
| DataForSEO Google Ads Search Volume Live | Low: account plus API login/password | Listed example cost $0.075 per live request containing up to 1,000 keywords; $1 trial credit; $50 minimum paid top-up | Location name/code/coordinates and language; provider locations follow Google Ads targeting, to be verified for Pakistan before first paid run | Google Ads-derived approximate volume, monthly history, CPC and ad competition; similar keywords may be grouped | Documented REST API; 12 Google Ads Live requests/minute/account | Best initial practicality; commercial dependency and provider terms require review; cost returned per task supports ledger reconciliation |
| Direct Google Ads Keyword Planner API | High: Ads manager/customer, Cloud project, developer token, OAuth and approved production access | No separate per-request API price documented; an active Ads account is strongly recommended for useful metrics | First-party geo-target constants and languages, including country/city targeting where enabled; Pakistan target must be resolved at setup | Official Google Search historical estimates and ad bid/competition fields | Keyword planning is 1 request/second per customer; Explorer access restricts KeywordPlanIdeaService, so Basic/Standard approval may be required | Strongest provenance but slowest setup and intended for Google Ads keyword planning; permissible-use/account requirements need confirmation |
| Google Trends API alpha | High/unavailable without alpha admission | No public production price established | Geographic trend interest where supported | Normalized relative interest, not search volume | Restricted alpha access | Useful later for trend direction, but cannot close the direct-demand blocker |
| Search Console API | Requires a verified, already-launched property and OAuth | No per-call charge documented | First-party property/country/device data | Best first-party impressions/clicks after launch | API quotas apply | Excellent post-launch evidence; cannot validate a product that does not exist |

## Minimum bounded first run after approval

One live DataForSEO request can carry the existing candidate keyword set. Expected API usage cost is approximately **$0.075** at the currently documented example rate. A new account advertises $1 trial credit; the minimum later top-up is $50 and the balance does not expire. Auto-recharge must remain disabled, and the platform budget should be capped before any request.

## Required controls before implementation

- Owner approval naming DataForSEO and a maximum budget.
- License/terms review for internal market research and retained normalized metrics.
- API login/password stored only in local environment/secret management.
- Pakistan location and English/Urdu language identifiers resolved from the provider's own location/language endpoints.
- Preflight projected-cost check, idempotency key, returned task-cost reconciliation, daily cap and redacted attempt history.
- `UNKNOWN` retained for missing or grouped metrics; CPC/ad competition labeled commercial-intent evidence, never organic difficulty.

## Sources

- [DataForSEO Google Ads Search Volume Live](https://docs.dataforseo.com/v3/keywords_data/google_ads/search_volume/live/)
- [DataForSEO minimum payment](https://dataforseo.com/help-center/minimum-payment)
- [Google Ads historical keyword metrics](https://developers.google.com/google-ads/api/docs/keyword-planning/generate-historical-metrics)
- [Google Ads API limits and quotas](https://developers.google.com/google-ads/api/docs/best-practices/quotas)
- [Google Ads access levels and permissible use](https://developers.google.com/google-ads/api/docs/api-policy/access-levels)
- [Google Ads developer starter checklist](https://developers.google.com/google-ads/api/starter-checklist)
