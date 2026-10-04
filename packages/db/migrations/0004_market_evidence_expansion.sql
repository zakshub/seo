ALTER TABLE evidence_items ADD COLUMN IF NOT EXISTS provider_id text;
ALTER TABLE evidence_items ADD COLUMN IF NOT EXISTS capability text;
ALTER TABLE evidence_items ADD COLUMN IF NOT EXISTS source_class text;
ALTER TABLE evidence_items ADD COLUMN IF NOT EXISTS subject text;
ALTER TABLE evidence_items ADD COLUMN IF NOT EXISTS measurement jsonb;
ALTER TABLE evidence_items ADD COLUMN IF NOT EXISTS limitations jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS modern_scorecard jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS topic_clusters jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS query_examples jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS competitor_observations jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS content_gaps jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS tool_gaps jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS product_formats jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS initial_information_architecture jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS phase2_readiness jsonb NOT NULL DEFAULT '{"ready":false,"blockers":["Not evaluated"]}'::jsonb;

CREATE TABLE IF NOT EXISTS market_study_provider_runs (
  id uuid PRIMARY KEY,
  market_study_id uuid NOT NULL REFERENCES market_studies(id),
  provider_id text NOT NULL,
  capability text NOT NULL,
  availability text NOT NULL CHECK (availability IN ('available','unavailable','blocked')),
  reason text NOT NULL,
  request_count integer NOT NULL DEFAULT 0 CHECK (request_count >= 0),
  paid_cost_cents integer NOT NULL DEFAULT 0 CHECK (paid_cost_cents = 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (market_study_id, provider_id)
);

CREATE TABLE IF NOT EXISTS open_source_tool_reviews (
  repository text PRIMARY KEY,
  name text NOT NULL,
  categories jsonb NOT NULL,
  license text NOT NULL,
  maintenance_status text NOT NULL,
  security_concerns text NOT NULL,
  runtime text NOT NULL,
  integration_difficulty text NOT NULL,
  recommendation text NOT NULL CHECK (recommendation IN ('USE','ADAPT','WATCH','REJECT')),
  rationale text NOT NULL,
  evidence_urls jsonb NOT NULL,
  reviewed_at date NOT NULL
);

CREATE TABLE IF NOT EXISTS research_heuristics (
  id text PRIMARY KEY,
  statement text NOT NULL,
  classification text NOT NULL CHECK (classification = 'HEURISTIC'),
  is_decision_rule boolean NOT NULL DEFAULT false CHECK (is_decision_rule = false),
  note text NOT NULL
);

INSERT INTO research_heuristics(id,statement,classification,note) VALUES
 ('legacy-volume-30000','Search volume > 30,000','HEURISTIC','Historical course threshold; not an SEO law and never inferred when provider data is absent.'),
 ('legacy-moz-kd-25','Moz KD < 25','HEURISTIC','Vendor-specific historical threshold; not a universal difficulty measure.'),
 ('legacy-semrush-kd-40','Semrush KD < 40','HEURISTIC','Vendor-specific historical threshold; no paid provider is configured.'),
 ('legacy-da-20','DA < 20','HEURISTIC','Third-party metric heuristic; not a Google metric or standalone decision rule.'),
 ('legacy-dr-20','DR < 20','HEURISTIC','Third-party metric heuristic; not a Google metric or standalone decision rule.'),
 ('legacy-domain-age','Domain age < 1 year','HEURISTIC','Possible observation only; age does not establish weak competition.'),
 ('legacy-pages-100','Pages < 100','HEURISTIC','Site-size observation only; page count does not establish opportunity.')
ON CONFLICT(id) DO NOTHING;

INSERT INTO open_source_tool_reviews(repository,name,categories,license,maintenance_status,security_concerns,runtime,integration_difficulty,recommendation,rationale,evidence_urls,reviewed_at) VALUES
 ('https://github.com/apify/crawlee','Crawlee','["crawling","javascript_rendering"]','Apache-2.0','Active; current TypeScript project and releases observed','Remote-content SSRF, untrusted browser execution, robots/terms compliance, egress and resource exhaustion require a sandbox and allowlists.','Node.js / TypeScript','MEDIUM','USE','Best fit for a future policy-governed crawler in the existing TypeScript stack; pin and review before installation.','["https://github.com/apify/crawlee","https://github.com/apify/crawlee/blob/master/LICENSE.md"]','2026-10-04'),
 ('https://github.com/microsoft/playwright','Playwright','["javascript_rendering"]','Apache-2.0','Active; frequent Microsoft releases observed','Browser sandboxing, downloads, SSRF, credential leakage and resource limits must be controlled.','Node.js with browser binaries','MEDIUM','ADAPT','Use behind Crawlee or a rendering adapter only when JavaScript rendering is necessary.','["https://github.com/microsoft/playwright","https://github.com/microsoft/playwright/releases"]','2026-10-04'),
 ('https://github.com/GoogleChrome/lighthouse','Lighthouse','["technical_seo_auditing","core_web_vitals"]','Apache-2.0','Active Google project','Audits execute a browser against untrusted pages; pin dependencies and isolate network/browser processes.','Node.js / Chrome','MEDIUM','USE','Established open audit engine for performance and technical diagnostics; field data remains a separate capability.','["https://github.com/GoogleChrome/lighthouse","https://github.com/GoogleChrome/lighthouse/blob/main/package.json"]','2026-10-04'),
 ('https://github.com/GoogleChrome/web-vitals','web-vitals','["core_web_vitals"]','Apache-2.0','Active; v6 releases observed in 2026','Client telemetry can collect URLs/user context; apply consent, minimization and redaction.','Browser JavaScript / TypeScript','LOW','USE','Small first-party field-metric library suitable after a public property exists.','["https://github.com/GoogleChrome/web-vitals","https://github.com/GoogleChrome/web-vitals/blob/main/CHANGELOG.md"]','2026-10-04'),
 ('https://github.com/eliasdabbas/advertools','advertools','["sitemap_robots_analysis","serp_processing","keyword_discovery"]','MIT','Active; v0.18.0 announced','Some features call third-party search APIs; credentials, terms, costs and data provenance must stay behind adapters.','Python','MEDIUM','ADAPT','Useful sitemap/robots and analysis components; isolate Python and do not enable commercial SERP calls by default.','["https://github.com/eliasdabbas/advertools"]','2026-10-04'),
 ('https://github.com/graphology/graphology','Graphology','["internal_link_analysis"]','MIT','Active; repository updated in 2026','Low direct risk; large crawl graphs need memory and tenant-boundary controls.','Node.js / TypeScript','LOW','USE','Good TypeScript graph primitive for self-built internal-link analysis.','["https://github.com/graphology/graphology","https://github.com/graphology/graphology/releases"]','2026-10-04'),
 ('https://github.com/scrapinghub/extruct','extruct','["schema_validation","content_extraction"]','BSD-3-Clause','Maintained but latest recorded history entry is 2024; no GitHub releases','Parses hostile HTML/RDF; lxml and RDF dependencies require patch monitoring and input limits.','Python','MEDIUM','WATCH','Strong structured-data extraction, but maintenance cadence and Python split need review; extraction is not full schema validation.','["https://github.com/scrapinghub/extruct","https://github.com/scrapinghub/extruct/blob/master/HISTORY.rst"]','2026-10-04'),
 ('https://github.com/adbar/trafilatura','Trafilatura','["content_extraction","sitemap_robots_analysis"]','Apache-2.0 for current versions; older than 1.8 GPL-3.0+','Maintenance concern raised in 2026; dependency response needs re-check','Hostile HTML/XML, decompression bombs and parser CVEs; pin current Apache-licensed versions only.','Python','MEDIUM','WATCH','Capable extraction but maintenance and lxml security concerns make immediate adoption premature.','["https://github.com/adbar/trafilatura","https://github.com/adbar/trafilatura/issues/846"]','2026-10-04'),
 ('https://github.com/explosion/spaCy','spaCy','["entity_extraction"]','MIT','Active; v3.8 releases observed in 2026','Model artifacts are separate supply-chain inputs; verify model licenses/hashes and isolate document content.','Python / Cython','HIGH','ADAPT','Mature multilingual NLP, but introduce only when rule-based extraction is insufficient.','["https://github.com/explosion/spaCy","https://github.com/explosion/spaCy/releases"]','2026-10-04'),
 ('https://github.com/huggingface/sentence-transformers','Sentence Transformers','["keyword_clustering","entity_extraction"]','Apache-2.0','Active; v6 releases observed','Downloaded models are supply-chain artifacts; model license, size, privacy and prompt/content leakage require review.','Python / PyTorch','HIGH','WATCH','Useful clustering embeddings, but resource and model-governance cost is high for the current phase.','["https://github.com/huggingface/sentence-transformers","https://github.com/huggingface/sentence-transformers/releases"]','2026-10-04'),
 ('https://github.com/googleapis/google-api-nodejs-client','Google APIs Node.js Client','["search_console_integration"]','Apache-2.0','Active Google-maintained client; supports maintained/current Node releases','OAuth refresh tokens and property data are sensitive secrets; scopes, encryption, redaction and revocation are mandatory.','Node.js / TypeScript','MEDIUM','ADAPT','Official client is appropriate once the owner connects a verified Search Console property.','["https://github.com/googleapis/google-api-nodejs-client","https://github.com/googleapis/google-api-nodejs-client/blob/main/README.md"]','2026-10-04'),
 ('https://github.com/towfiqi/serpbear','SerpBear','["rank_tracking","serp_processing"]','MIT','Active; v3.1.0 released 2026-03-27','Depends on scraping services/proxies or Google credentials; terms, cost, blocking and secret handling are material.','Node.js / Next.js','HIGH','WATCH','Architecture is informative, but direct adoption would introduce unapproved scraping/provider and credential dependencies.','["https://github.com/towfiqi/serpbear","https://github.com/towfiqi/serpbear/releases"]','2026-10-04')
ON CONFLICT(repository) DO UPDATE SET
 name=excluded.name,categories=excluded.categories,license=excluded.license,maintenance_status=excluded.maintenance_status,
 security_concerns=excluded.security_concerns,runtime=excluded.runtime,integration_difficulty=excluded.integration_difficulty,
 recommendation=excluded.recommendation,rationale=excluded.rationale,evidence_urls=excluded.evidence_urls,reviewed_at=excluded.reviewed_at;

CREATE INDEX IF NOT EXISTS market_study_provider_runs_study_idx ON market_study_provider_runs(market_study_id, created_at);
