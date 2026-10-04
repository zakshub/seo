ALTER TABLE evidence_items ADD COLUMN IF NOT EXISTS evidence_nature text CHECK (evidence_nature IN ('direct','proxy'));
ALTER TABLE evidence_items ADD COLUMN IF NOT EXISTS geography text;
ALTER TABLE evidence_items ADD COLUMN IF NOT EXISTS observed_at timestamptz;
ALTER TABLE evidence_items ADD COLUMN IF NOT EXISTS fresh_until timestamptz;

ALTER TABLE market_study_provider_runs ADD COLUMN IF NOT EXISTS evidence_nature text CHECK (evidence_nature IN ('direct','proxy'));
ALTER TABLE market_study_provider_runs ADD COLUMN IF NOT EXISTS geography text;
ALTER TABLE market_study_provider_runs ADD COLUMN IF NOT EXISTS resolves_dimensions jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE market_study_provider_runs ADD COLUMN IF NOT EXISTS documentation_url text;
ALTER TABLE market_study_provider_runs ADD COLUMN IF NOT EXISTS limitations jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE market_study_provider_runs ADD COLUMN IF NOT EXISTS observed_at timestamptz;
ALTER TABLE market_study_provider_runs ADD COLUMN IF NOT EXISTS fresh_until timestamptz;

CREATE TABLE IF NOT EXISTS provider_run_attempts (
  id uuid PRIMARY KEY,
  market_study_id uuid NOT NULL REFERENCES market_studies(id),
  provider_id text NOT NULL,
  capability text NOT NULL,
  idempotency_key text NOT NULL,
  result_status text NOT NULL CHECK (result_status IN ('available','partial','unavailable','blocked','failed')),
  reason text NOT NULL,
  geography text,
  evidence_nature text NOT NULL CHECK (evidence_nature IN ('direct','proxy')),
  request_count integer NOT NULL DEFAULT 0 CHECK (request_count >= 0),
  paid_cost_cents integer NOT NULL DEFAULT 0 CHECK (paid_cost_cents >= 0),
  started_at timestamptz NOT NULL,
  completed_at timestamptz NOT NULL,
  evidence_ids uuid[] NOT NULL DEFAULT '{}',
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  UNIQUE (market_study_id, provider_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS competitor_observations (
  id uuid PRIMARY KEY,
  market_study_id uuid NOT NULL REFERENCES market_studies(id),
  opportunity_id uuid REFERENCES opportunities(id),
  provider_run_attempt_id uuid NOT NULL REFERENCES provider_run_attempts(id),
  query text NOT NULL,
  geography text NOT NULL,
  language text NOT NULL,
  captured_at timestamptz NOT NULL,
  ranking_position integer CHECK (ranking_position > 0),
  domain text NOT NULL,
  source_url text NOT NULL,
  page_type text NOT NULL,
  content_type text NOT NULL,
  content_depth text NOT NULL,
  site_specialization text NOT NULL,
  visible_authority_signals jsonb NOT NULL DEFAULT '[]'::jsonb,
  technical_quality text NOT NULL,
  intent_match jsonb NOT NULL,
  business_model text NOT NULL,
  strengths jsonb NOT NULL DEFAULT '[]'::jsonb,
  weaknesses jsonb NOT NULL DEFAULT '[]'::jsonb,
  beatable text NOT NULL,
  evidence_nature text NOT NULL CHECK (evidence_nature IN ('direct','proxy')),
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  UNIQUE (provider_run_attempt_id, query, ranking_position)
);

CREATE INDEX IF NOT EXISTS provider_run_attempts_study_idx ON provider_run_attempts(market_study_id,started_at DESC);
CREATE INDEX IF NOT EXISTS competitor_observations_study_idx ON competitor_observations(market_study_id,captured_at DESC);
