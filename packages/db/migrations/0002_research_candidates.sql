ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS rationale text;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS scorecard jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS opportunity_evidence (
  opportunity_id uuid NOT NULL REFERENCES opportunities(id),
  evidence_id uuid NOT NULL REFERENCES evidence_items(id),
  PRIMARY KEY (opportunity_id, evidence_id)
);

CREATE TABLE IF NOT EXISTS opportunity_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES opportunities(id),
  workflow_run_id uuid NOT NULL REFERENCES workflow_runs(id),
  scorecard jsonb NOT NULL,
  recommendation text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (opportunity_id, workflow_run_id)
);

CREATE INDEX IF NOT EXISTS opportunities_workflow_idx ON opportunities(workflow_run_id);
