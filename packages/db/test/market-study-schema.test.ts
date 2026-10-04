import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(new URL('../migrations/0003_market_studies.sql', import.meta.url), 'utf8');
const expansion = readFileSync(new URL('../migrations/0004_market_evidence_expansion.sql', import.meta.url), 'utf8');
const quality = readFileSync(new URL('../migrations/0005_evidence_quality_and_provider_attempts.sql', import.meta.url), 'utf8');
const brave = readFileSync(new URL('../migrations/0006_brave_serp_readiness.sql', import.meta.url), 'utf8');

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
  it('keeps provider attempts, partial results and duplicates durable and idempotent',()=>{
    expect(quality).toContain('provider_run_attempts');expect(quality).toContain("'partial'");
    expect(quality).toContain('UNIQUE (market_study_id, provider_id, idempotency_key)');
    expect(quality).toContain('competitor_observations');expect(quality).toContain('ranking_position');
  });
  it('persists Brave rate limits, raw provenance, budget approval and bounded SERP detail',()=>{
    expect(brave).toContain("'rate_limited'");expect(brave).toContain('estimated_cost_microusd');
    expect(brave).toContain('budget_approval_id');expect(brave).toContain('paid_budget_approval_id');
    expect(brave).toContain('CREATE TABLE IF NOT EXISTS provider_raw_artifacts');expect(brave).toContain('response_sha256');
    expect(brave).toContain('repeated_domain_count');expect(brave).toContain('serp_features');
  });
});
