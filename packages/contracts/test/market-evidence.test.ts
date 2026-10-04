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
});
