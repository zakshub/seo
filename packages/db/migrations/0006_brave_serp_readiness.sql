ALTER TABLE provider_run_attempts DROP CONSTRAINT IF EXISTS provider_run_attempts_result_status_check;
ALTER TABLE provider_run_attempts ADD CONSTRAINT provider_run_attempts_result_status_check
  CHECK (result_status IN ('available','partial','unavailable','blocked','failed','rate_limited'));
ALTER TABLE provider_run_attempts ADD COLUMN IF NOT EXISTS http_status integer;
ALTER TABLE provider_run_attempts ADD COLUMN IF NOT EXISTS retry_after_seconds integer CHECK (retry_after_seconds IS NULL OR retry_after_seconds >= 0);
ALTER TABLE provider_run_attempts ADD COLUMN IF NOT EXISTS estimated_cost_microusd bigint NOT NULL DEFAULT 0 CHECK (estimated_cost_microusd >= 0);
ALTER TABLE provider_run_attempts ADD COLUMN IF NOT EXISTS provider_request_id text;
ALTER TABLE provider_run_attempts ADD COLUMN IF NOT EXISTS budget_approval_id text;

ALTER TABLE market_studies DROP CONSTRAINT IF EXISTS market_studies_paid_budget_cents_check;
ALTER TABLE market_studies ADD CONSTRAINT market_studies_paid_budget_cents_check CHECK (paid_budget_cents >= 0);
ALTER TABLE market_studies ADD COLUMN IF NOT EXISTS paid_budget_approval_id text;

CREATE TABLE IF NOT EXISTS provider_raw_artifacts (
  id uuid PRIMARY KEY,
  provider_run_attempt_id uuid NOT NULL REFERENCES provider_run_attempts(id),
  provider_id text NOT NULL,
  query text NOT NULL,
  endpoint text NOT NULL,
  geography text NOT NULL,
  language text NOT NULL,
  requested_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL,
  response_sha256 text NOT NULL,
  response_headers jsonb NOT NULL DEFAULT '{}'::jsonb,
  response_body jsonb NOT NULL,
  retention text NOT NULL DEFAULT 'active' CHECK (retention IN ('active','expired','removed')),
  UNIQUE (provider_run_attempt_id, query, geography, language)
);

ALTER TABLE competitor_observations ADD COLUMN IF NOT EXISTS raw_artifact_id uuid REFERENCES provider_raw_artifacts(id);
ALTER TABLE competitor_observations ADD COLUMN IF NOT EXISTS snippet text NOT NULL DEFAULT '';
ALTER TABLE competitor_observations ADD COLUMN IF NOT EXISTS extra_snippets jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE competitor_observations ADD COLUMN IF NOT EXISTS repeated_domain_count integer NOT NULL DEFAULT 1 CHECK (repeated_domain_count > 0);
ALTER TABLE competitor_observations ADD COLUMN IF NOT EXISTS serp_features jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE competitor_observations ADD COLUMN IF NOT EXISTS observed_intent text NOT NULL DEFAULT 'unknown';
ALTER TABLE competitor_observations ADD COLUMN IF NOT EXISTS specialization_reason text NOT NULL DEFAULT 'Not yet classified.';
ALTER TABLE competitor_observations ADD COLUMN IF NOT EXISTS specialization_confidence numeric(4,3) NOT NULL DEFAULT 0 CHECK (specialization_confidence BETWEEN 0 AND 1);

CREATE INDEX IF NOT EXISTS provider_raw_artifacts_attempt_idx ON provider_raw_artifacts(provider_run_attempt_id,received_at DESC);
