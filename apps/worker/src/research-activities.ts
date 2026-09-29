import { createHash } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { StackExchangeResearchSource, type ResearchEvidence } from '@venture/providers';
import type { ResearchWorkflowInput } from './research-workflow.js';

const WORKSPACE_ID = '00000000-0000-4000-8000-000000000002';
const source = new StackExchangeResearchSource();
export type Candidate = { title: string; rationale: string; evidence: ResearchEvidence; scorecard: Record<string, number | string>; recommendation: 'watch' | 'research_further' };

function stableUuid(value: string) {
  const hex = createHash('sha256').update(value).digest('hex').slice(0,32).split('');
  hex[12] = '4'; hex[16] = ['8','9','a','b'][parseInt(hex[16] ?? '0',16) % 4] ?? '8';
  return `${hex.slice(0,8).join('')}-${hex.slice(8,12).join('')}-${hex.slice(12,16).join('')}-${hex.slice(16,20).join('')}-${hex.slice(20).join('')}`;
}

export function buildCandidates(items: ResearchEvidence[]): Candidate[] {
  const seen = new Set<string>(); const candidates: Candidate[] = [];
  for (const evidence of items) {
    const tag = evidence.tags.find(value => !seen.has(value)); if (!tag) continue; seen.add(tag);
    const views = evidence.metrics.views ?? 0; const answers = evidence.metrics.answers ?? 0;
    const demandSignal = Math.min(20, Math.max(1, Math.round(Math.log10(views + 1) * 5)));
    const marketGap = answers === 0 ? 12 : answers < 3 ? 8 : 3;
    const total = demandSignal + 8 + 2 + marketGap + 4 + 10 + 7 + 5;
    candidates.push({ title:`${tag} troubleshooting utility and reference`, rationale:`A highly voted recent Stack Overflow question indicates recurring developer friction around “${tag}”. This is a research candidate, not validated search demand.`, evidence,
      scorecard:{ demandSignal,intentFit:8,serpCompetitorEvidence:2,marketGap,monetizationHypothesis:4,feasibility:10,risk:7,confidence:5,total,scale:100 }, recommendation:total >= 55 ? 'research_further' : 'watch' });
    if (candidates.length === 3) break;
  }
  return candidates;
}

async function insertEvent(client: PoolClient, runId: string, type: string, payload: object, suffix: string) {
  await client.query(`insert into outbox_events(id,aggregate_type,aggregate_id,event_type,event_version,payload,occurred_at) values($1,'workflow',$2,$3,1,$4::jsonb,now()) on conflict(id) do nothing`, [stableUuid(`${runId}:event:${suffix}`),runId,type,JSON.stringify(payload)]);
}

export async function performResearch(input: ResearchWorkflowInput) {
  const result = await source.research({ language:input.language, market:input.market });
  const pool = new Pool({ connectionString:process.env.DATABASE_URL ?? 'postgresql://venture:venture@127.0.0.1:5432/venture_os' }); const client = await pool.connect();
  try {
    await client.query('begin');
    if (result.availability !== 'available' || !result.value) {
      await client.query(`update workflow_runs set state='waiting',updated_at=now() where id=$1`,[input.runId]);
      await insertEvent(client,input.runId,'provider.unavailable',{ provider:source.name,capability:'public-research',reason:result.reason ?? 'Provider unavailable.' },'provider-unavailable');
      await client.query('commit'); return { state:'waiting',providerAvailability:result.availability,opportunities:0 };
    }
    const candidates = buildCandidates(result.value);
    for (const [index,candidate] of candidates.entries()) {
      const evidenceId=stableUuid(`${input.runId}:evidence:${candidate.evidence.url}`); const opportunityId=stableUuid(`${input.runId}:opportunity:${candidate.title}`);
      const integrityHash=createHash('sha256').update(candidate.evidence.reference).digest('hex');
      await client.query(`insert into evidence_items(id,workspace_id,source_url,captured_at,reference,language,market,confidence,retention,integrity_hash) values($1,$2,$3,$4,$5,'en','global',$6,'active',$7) on conflict(id) do nothing`,[evidenceId,WORKSPACE_ID,candidate.evidence.url,candidate.evidence.capturedAt,candidate.evidence.reference,candidate.evidence.confidence,integrityHash]);
      await client.query(`insert into opportunities(id,workspace_id,workflow_run_id,title,lifecycle,limitations,rationale,scorecard) values($1,$2,$3,$4,'scored',$5::jsonb,$6,$7::jsonb) on conflict(id) do nothing`,[opportunityId,WORKSPACE_ID,input.runId,candidate.title,JSON.stringify(candidate.evidence.limitations),candidate.rationale,JSON.stringify(candidate.scorecard)]);
      await client.query(`insert into opportunity_evidence(opportunity_id,evidence_id) values($1,$2) on conflict do nothing`,[opportunityId,evidenceId]);
      await client.query(`insert into opportunity_evaluations(id,opportunity_id,workflow_run_id,scorecard,recommendation) values($1,$2,$3,$4::jsonb,$5) on conflict(opportunity_id,workflow_run_id) do nothing`,[stableUuid(`${input.runId}:evaluation:${opportunityId}`),opportunityId,input.runId,JSON.stringify(candidate.scorecard),candidate.recommendation]);
      await insertEvent(client,input.runId,'opportunity.discovered',{ opportunityId,title:candidate.title,provider:source.name,evidenceIds:[evidenceId] },`discovered:${index}`);
      await insertEvent(client,input.runId,'opportunity.scored',{ opportunityId,recommendation:candidate.recommendation,scorecard:candidate.scorecard,evidenceIds:[evidenceId] },`scored:${index}`);
    }
    if (candidates.length < 3) {
      await client.query(`update workflow_runs set state='waiting',updated_at=now() where id=$1`,[input.runId]);
      await insertEvent(client,input.runId,'workflow.research_incomplete',{ provider:source.name,candidateCount:candidates.length,required:3 },'incomplete');
      await client.query('commit'); return { state:'waiting',providerAvailability:'available',opportunities:candidates.length };
    }
    const candidateIds=candidates.map(candidate=>stableUuid(`${input.runId}:opportunity:${candidate.title}`));
    await client.query(`insert into approval_requests(id,workspace_id,workflow_run_id,action,input_snapshot,state,expires_at) values($1,$2,$3,'select_opportunity',$4::jsonb,'pending',now()+interval '30 days') on conflict(id) do nothing`,[stableUuid(`${input.runId}:approval`),WORKSPACE_ID,input.runId,JSON.stringify({candidateIds})]);
    await client.query(`update workflow_runs set state='awaiting_approval',updated_at=now() where id=$1`,[input.runId]);
    await insertEvent(client,input.runId,'workflow.awaiting_approval',{ candidateCount:candidates.length,approvalAction:'select_opportunity' },'awaiting-approval');
    await client.query('commit'); return { state:'awaiting_approval',providerAvailability:'available',opportunities:candidates.length };
  } catch(error) { await client.query('rollback'); throw error; } finally { client.release(); await pool.end(); }
}
