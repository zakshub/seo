import { describe,expect,it } from 'vitest';
import { legacyCourseHeuristics, modernOpportunityDimensions, scoreModernOpportunity } from '../src/market-evidence.js';

describe('modern opportunity evidence model',()=>{
  it('blocks Phase 2 and recommends more research while critical market evidence is UNKNOWN',()=>{
    const score=scoreModernOpportunity([{dimension:'build_feasibility',classification:'inference',claim:'Small build.',evidenceIds:[],strength:0.8}]);
    expect(score.phase2Ready).toBe(false);
    expect(score.recommendation).toBe('research_more');
    expect(score.phase2Blockers).toContain('serp_reality: evidence is UNKNOWN');
    expect(score.dimensions).toHaveLength(modernOpportunityDimensions.length);
  });
  it('stores legacy course thresholds only as non-binding heuristics',()=>{
    expect(legacyCourseHeuristics).toHaveLength(7);
    expect(legacyCourseHeuristics.every(item=>item.status==='heuristic'&&!item.decisionRule)).toBe(true);
  });
  it('refuses stale and conflicting required evidence',()=>{
    const stale=scoreModernOpportunity([{dimension:'demand',classification:'fact',claim:'Old demand.',evidenceIds:['old'],strength:0.9,confidence:0.9,freshUntil:'2025-01-01T00:00:00.000Z'}],new Date('2026-10-04T00:00:00.000Z'));
    expect(stale.staleEvidenceCount).toBe(1);expect(stale.unknownDimensions).toContain('demand');expect(stale.phase2Ready).toBe(false);
    const conflict=scoreModernOpportunity([
      {dimension:'demand',classification:'fact',claim:'Demand exists.',evidenceIds:['a'],strength:0.8,confidence:0.9,polarity:'supports'},
      {dimension:'demand',classification:'fact',claim:'Demand absent.',evidenceIds:['b'],strength:0.2,confidence:0.8,polarity:'contradicts'}
    ]);
    expect(conflict.conflictDimensions).toContain('demand');expect(conflict.unknownDimensions).toContain('demand');
  });
  it('uses evidence confidence and permits Phase 2 only when every required gate genuinely passes',()=>{
    const assessments=modernOpportunityDimensions.map(dimension=>({dimension,classification:'fact' as const,claim:'Fresh supported evidence.',evidenceIds:[dimension],strength:0.9,confidence:0.9,polarity:'supports' as const,freshUntil:'2027-01-01T00:00:00.000Z'}));
    const result=scoreModernOpportunity(assessments,new Date('2026-10-04T00:00:00.000Z'));
    expect(result.total).toBeGreaterThanOrEqual(65);expect(result.evidenceCoverage).toBe(1);expect(result.phase2Ready).toBe(true);expect(result.recommendation).toBe('go');
    const lowConfidence=scoreModernOpportunity(assessments.map(item=>({...item,confidence:0.1})),new Date('2026-10-04T00:00:00.000Z'));
    expect(lowConfidence.phase2Ready).toBe(false);expect(lowConfidence.total).toBeLessThan(65);
  });
});
