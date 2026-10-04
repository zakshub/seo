# Opportunity Scoring Model

The score is a prioritization aid, not mathematical truth. The owner sees every dimension, weight, claim, classification, points, evidence coverage, unknown, and recommendation.

| Dimension | Weight | Current meaning |
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
