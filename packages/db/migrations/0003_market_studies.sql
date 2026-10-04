CREATE TABLE IF NOT EXISTS market_studies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id),
  brief text NOT NULL CHECK (char_length(brief) BETWEEN 10 AND 2000),
  language text NOT NULL,
  market text NOT NULL,
  status text NOT NULL,
  source_policy text NOT NULL DEFAULT 'free_public_web',
  paid_budget_cents integer NOT NULL DEFAULT 0 CHECK (paid_budget_cents = 0),
  request_limit integer NOT NULL CHECK (request_limit BETWEEN 1 AND 20),
  time_limit_seconds integer NOT NULL CHECK (time_limit_seconds BETWEEN 10 AND 600),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE workflow_runs ADD COLUMN IF NOT EXISTS market_study_id uuid REFERENCES market_studies(id);
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS market_study_id uuid REFERENCES market_studies(id);
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS problem text;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS audience text;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS search_demand_hypothesis text;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS search_intent text;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS search_surfaces jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS geography_language text;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS product_type_hypothesis text;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS monetization_hypothesis text;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS traffic_potential text;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS build_complexity text;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS defensibility text;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS risks jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS unknowns jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS confidence numeric CHECK (confidence BETWEEN 0 AND 1);
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS recommendation text;

CREATE TABLE IF NOT EXISTS market_findings (
  id uuid PRIMARY KEY,
  market_study_id uuid NOT NULL REFERENCES market_studies(id),
  opportunity_id uuid REFERENCES opportunities(id),
  dimension text NOT NULL,
  classification text NOT NULL CHECK (classification IN ('fact','observation','inference','unknown')),
  claim text NOT NULL,
  evidence_ids uuid[] NOT NULL DEFAULT '{}',
  confidence numeric NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS market_studies_workspace_idx ON market_studies(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS workflow_runs_market_study_idx ON workflow_runs(market_study_id);
CREATE INDEX IF NOT EXISTS opportunities_market_study_idx ON opportunities(market_study_id);
CREATE INDEX IF NOT EXISTS market_findings_study_idx ON market_findings(market_study_id, created_at);
