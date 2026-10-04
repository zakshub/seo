# Opportunity Scoring Model

The score is a prioritization aid, not mathematical truth. The owner sees every dimension, weight, claim, classification, points, evidence coverage, unknown, and recommendation.

The original eight-dimension model below is retained in stored Phase 1 records for audit compatibility, but Phase 1.5 decisions use the modern model that follows.

| Legacy dimension | Weight | Historical meaning |
|---|---:|---|
| Audience | 10 | Evidence that a recognizable group has the problem |
| Search surfaces | 15 | Evidence of where discovery/search demand occurs |
| Geography and language | 5 | Markets actually represented by evidence |
| SERP weakness | 15 | Evidence that current search results are weak or mismatched |
| Product gap | 15 | Evidence/inference that existing answers or products do not solve the need |
| Traffic potential | 15 | Directional reach, breadth, repeat use, or expansion evidence |
| Build cost | 10 | Feasibility after engineering, content, data, infrastructure, and maintenance |
| Defensibility | 15 | Evidence for durable advantage |

Each known dimension has evidence strength from 0 to 1 and earns `round(strength × weight)`. An UNKNOWN has `strength = null`, earns no points, and reduces evidence coverage; it is not treated as observed failure. Evidence coverage is the fraction of dimensions with captured support.

Recommendation rules:

- `RESEARCH_MORE`: coverage is below 50%, or search surfaces, SERP weakness, or product gap is UNKNOWN.
- `GO`: at least 70/100, at least 75% coverage, and no critical unknown.
- `WATCH`: at least 40/100 after research sufficiency rules pass.
- `REJECT`: below 40/100 after research sufficiency rules pass.

Phase 1’s current source normally yields `RESEARCH_MORE`: public Q&A can support audience/problem engagement and limited product-gap/traffic observations, while keyword demand and SERP weakness remain UNKNOWN. This conservative result is intentional.

Changing weights or thresholds requires an ADR, regression examples, and evidence that the old model caused a material decision error. No proprietary metrics such as DR, DA, KD, search volume, backlinks, rankings, or traffic may be estimated.

## Phase 1.5 modern model

| Dimension | Weight | Evidence question |
|---|---:|---|
| Demand | 13 | Is there authorized evidence people seek this problem? |
| Intent | 10 | What job is the audience trying to complete? |
| SERP reality | 12 | What is present in live results and how are features composed? |
| Competitor quality | 8 | How well do specialists and substitutes solve the job? |
| Content/product gap | 12 | What specific unmet need is observed? |
| Topic traffic potential | 10 | How broad/deep is the topic, without inventing volume? |
| Click potential | 8 | Can a result plausibly earn a click after SERP features/no-click answers? |
| Solution fit | 8 | Does the proposed product format fit the observed job? |
| Authority requirement | 6 | What trust, expertise and link requirements apply? |
| Build feasibility | 7 | Can a bounded version be built and maintained lawfully? |
| Strategic value | 6 | Does it create reusable learning, distribution or portfolio value? |

Phase 2 readiness additionally requires known demand, intent, SERP reality, competitor quality, gap, topic traffic potential, click potential, solution fit and build feasibility; at least 80% coverage; and at least 65/100. These are conservative research gates, not guarantees of success. Owner approval remains separate.
