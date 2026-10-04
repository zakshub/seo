# ADR 0007: Provider-independent market evidence capabilities

Status: Accepted on 2026-10-04.

Market research integrates capabilities, not vendor brands. Each adapter declares its capability, source class, availability, credential/cost requirements, supported locale, official documentation and limitations. A study persists the actual provider run—even when unavailable—so absence cannot silently become a favorable score.

The zero-paid default sources are the official Stack Exchange API for public problem-language signals and the official Wikimedia Analytics API for directional article topic interest. Stack Exchange views and Wikimedia pageviews are never called search volume. Google Trends is recorded as unavailable until this installation receives verified alpha access. Search Console is first-party evidence and stays unavailable until an owner connects a verified property. No Google result scraping is an approved fallback; Google Custom Search JSON API is closed to new customers and therefore is not the default SERP source.

Phase 1.5 uses 11 dimensions: demand, intent, SERP reality, competitor quality, content/product gap, topic traffic potential, click potential, solution fit, authority requirement, build feasibility and strategic value. Search demand, SERP reality and competitor evidence remain UNKNOWN when no lawful source exists. UNKNOWN earns no points. Phase 2 cannot be approved while any required evidence gate is unknown.

Historical course thresholds for volume, KD, DA, DR, domain age and page count are persisted only as non-binding `HEURISTIC` records. They are not Google facts and cannot independently select a product.

Open-source projects are reviewed before adoption and classified USE, ADAPT, WATCH or REJECT with repository, license, maintenance, security, runtime and integration difficulty. A USE decision means “preferred candidate for a future bounded adapter,” not “installed or authorized now.”

Primary references:

- [Google Trends API alpha](https://developers.google.com/search/apis/trends)
- [Google Custom Search JSON API status](https://developers.google.com/custom-search/v1/overview)
- [Google Search Console API](https://developers.google.com/webmaster-tools)
- [Wikimedia Analytics API](https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/documentation/getting-started.html)
- [Stack Exchange advanced search API](https://api.stackexchange.com/docs/advanced-search)
