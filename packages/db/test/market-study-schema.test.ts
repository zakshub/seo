import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(new URL('../migrations/0003_market_studies.sql', import.meta.url), 'utf8');
const expansion = readFileSync(new URL('../migrations/0004_market_evidence_expansion.sql', import.meta.url), 'utf8');

describe('market study durable schema', () => {
  it('persists studies, findings, workflow correlation and evidence classifications', () => {
    expect(migration).toContain('CREATE TABLE IF NOT EXISTS market_studies');
    expect(migration).toContain('market_study_id uuid REFERENCES market_studies');
    expect(migration).toContain('CREATE TABLE IF NOT EXISTS market_findings');
    expect(migration).toContain("classification IN ('fact','observation','inference','unknown')");
  });

  it('hard limits studies to zero paid-provider budget', () => {
    expect(migration).toContain('CHECK (paid_budget_cents = 0)');
  });
  it('persists provider availability, normalized measurements, readiness and open-source reviews',()=>{
    expect(expansion).toContain('market_study_provider_runs');
    expect(expansion).toContain('open_source_tool_reviews');
    expect(expansion).toContain('phase2_readiness');
    expect(expansion).toContain('measurement jsonb');
    expect(expansion).toContain("classification = 'HEURISTIC'");
  });
});
