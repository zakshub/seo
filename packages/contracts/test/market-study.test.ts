import { describe, expect, it } from 'vitest';
import { scoreOpportunity, type DimensionAssessment } from '../src/market-study.js';

describe('market opportunity scoring', () => {
  it('keeps unsupported metrics UNKNOWN instead of inventing zero-valued evidence', () => {
    const result = scoreOpportunity([{ dimension: 'audience', classification: 'observation', claim: 'A public question has measurable engagement.', evidenceIds: ['e1'], strength: 0.6 }]);
    expect(result.unknownDimensions).toContain('serp_weakness');
    expect(result.dimensions.find((item) => item.dimension === 'serp_weakness')).toMatchObject({ classification: 'unknown', strength: null, points: 0 });
    expect(result.recommendation).toBe('research_more');
  });

  it('explains every weighted point and can recommend GO only with broad evidence coverage', () => {
    const assessments = [
      ['audience', 0.9], ['search_surfaces', 0.8], ['geography_language', 0.8], ['serp_weakness', 0.8],
      ['product_gap', 0.9], ['traffic_potential', 0.8], ['build_cost', 0.8], ['defensibility', 0.8]
    ].map(([dimension, strength]) => ({ dimension, strength, classification: 'observation', claim: 'Evidence-backed assessment.', evidenceIds: ['e1'] })) as DimensionAssessment[];
    const result = scoreOpportunity(assessments);
    expect(result.total).toBeGreaterThanOrEqual(70);
    expect(result.evidenceCoverage).toBe(1);
    expect(result.recommendation).toBe('go');
    expect(result.dimensions.reduce((sum, item) => sum + item.points, 0)).toBe(result.total);
  });

  it('rejects invalid evidence strength', () => {
    expect(() => scoreOpportunity([{ dimension: 'audience', classification: 'fact', claim: 'Bad input', evidenceIds: [], strength: 1.1 }])).toThrow(/between 0 and 1/);
  });
});
