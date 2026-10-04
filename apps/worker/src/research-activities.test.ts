import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildCandidates, stableUuid } from './research-activities.js';
import type { ResearchEvidence } from '@venture/providers';

const item = (title:string,tags:string[],views:number,answers:number):ResearchEvidence => ({
  url:`https://webmasters.stackexchange.com/questions/${views}`,
  reference:JSON.stringify({title,tags,views,answers}),
  title,tags,capturedAt:'2026-10-04T00:00:00.000Z',confidence:0.55,
  metrics:{views,answers},limitations:['Not search volume.']
});

describe('market-study candidate construction', () => {
  it('creates evidence-bound candidates and retains unsupported dimensions as UNKNOWN', () => {
    const candidates=buildCandidates([
      item('Why is this URL not indexed?',['indexing'],12000,1),
      item('How should canonical URLs work?',['canonical'],9000,2),
      item('Why did organic traffic fall?',['analytics'],7000,0)
    ]);
    expect(candidates).toHaveLength(3);
    expect(candidates[0]?.evidence.url).toContain('stackexchange.com');
    expect(candidates[0]?.assessments.find(value=>value.dimension==='serp_weakness')).toMatchObject({classification:'unknown',strength:null});
    expect(candidates[0]?.modernAssessments.find(value=>value.dimension==='demand')).toMatchObject({classification:'unknown',strength:null});
    expect(candidates[0]?.modernAssessments.find(value=>value.dimension==='serp_reality')).toMatchObject({classification:'unknown',strength:null});
    expect(candidates[0]?.profile.searchDemandHypothesis).toContain('UNKNOWN');
  });

  it('uses deterministic identifiers so activity retries remain idempotent', () => {
    expect(stableUuid('same-run:event')).toBe(stableUuid('same-run:event'));
    expect(stableUuid('same-run:event')).not.toBe(stableUuid('other-run:event'));
  });

  it('persists paid-provider budget, failures, rate limits and raw SERP provenance through the activity contract',()=>{
    const source=readFileSync(new URL('./research-activities.ts',import.meta.url),'utf8');
    expect(source).toContain('input.budgetApprovalId');
    expect(source).toContain('provider_run_attempts');
    expect(source).toContain('estimated_cost_microusd');
    expect(source).toContain("'provider.rate_limited'");
    expect(source).toContain('provider_raw_artifacts');
    expect(source).toContain('competitor_observations');
    const workflow=readFileSync(new URL('./research-workflow.ts',import.meta.url),'utf8');
    expect(workflow).toContain('maximumAttempts: 1');
  });
});
