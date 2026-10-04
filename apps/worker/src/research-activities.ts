import { createHash } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { scoreOpportunity, type DimensionAssessment, type OpportunityScore } from '@venture/contracts';
import { StackExchangeResearchSource, type ResearchEvidence } from '@venture/providers';
import type { ResearchWorkflowInput } from './research-workflow.js';

const WORKSPACE_ID = '00000000-0000-4000-8000-000000000002';
const source = new StackExchangeResearchSource();

export type Candidate = {
  title: string;
  rationale: string;
  evidence: ResearchEvidence;
  profile: {
    problem: string; audience: string; searchDemandHypothesis: string; searchIntent: string; searchSurfaces: string[];
    geographyLanguage: string; productTypeHypothesis: string; monetizationHypothesis: string; trafficPotential: string;
    buildComplexity: string; defensibility: string; risks: string[];
  };
  assessments: Omit<DimensionAssessment, 'evidenceIds'>[];
};

export function stableUuid(value: string) {
  const hex = createHash('sha256').update(value).digest('hex').slice(0,32).split('');
  hex[12] = '4'; hex[16] = ['8','9','a','b'][parseInt(hex[16] ?? '0',16) % 4] ?? '8';
  return `${hex.slice(0,8).join('')}-${hex.slice(8,12).join('')}-${hex.slice(12,16).join('')}-${hex.slice(16,20).join('')}-${hex.slice(20).join('')}`;
}

export function buildCandidates(items: ResearchEvidence[]): Candidate[] {
  const seen = new Set<string>();
  const candidates: Candidate[] = [];
  for (const evidence of items) {
    const tag = evidence.tags.find((value) => !seen.has(value));
    if (!tag) continue;
    seen.add(tag);
    const views = evidence.metrics.views ?? 0;
    const answers = evidence.metrics.answers ?? 0;
    const trafficStrength = Math.min(0.75, Math.max(0.2, Math.log10(views + 1) / 6));
    const gapStrength = answers === 0 ? 0.75 : answers < 3 ? 0.55 : 0.25;
    const title = `${tag} SEO diagnostic utility and evidence library`;
    candidates.push({
      title,
      rationale: `A public Webmasters question about “${tag}” shows measurable problem engagement. This supports further validation only; search demand, SERP weakness and commercial viability remain unverified.`,
      evidence,
      profile: {
        problem: evidence.title,
        audience: 'Website owners and practitioners represented by the public Webmasters question audience.',
        searchDemandHypothesis: `People may search for help diagnosing ${tag}-related SEO problems; keyword demand is UNKNOWN.`,
        searchIntent: 'Likely informational/problem-solving; transactional intent is UNKNOWN.',
        searchSurfaces: ['Public Webmasters Q&A'],
        geographyLanguage: 'English evidence; geography is UNKNOWN.',
        productTypeHypothesis: 'A diagnostic utility with an evidence-backed reference library.',
        monetizationHypothesis: 'Freemium utility or qualified lead generation; willingness to pay is UNKNOWN.',
        trafficPotential: `${views.toLocaleString('en-US')} recorded source-page views; this is not search volume.`,
        buildComplexity: 'Small-to-medium web utility hypothesis; integration and data requirements are not yet validated.',
        defensibility: 'UNKNOWN until competitor, proprietary-data and repeat-use research is completed.',
        risks: ['No keyword-volume evidence', 'No live SERP comparison', 'Single public-community source', 'Commercial intent unverified']
      },
      assessments: [
        { dimension:'audience', classification:'observation', claim:`The source question has ${views} recorded views and ${answers} answers.`, strength:Math.min(0.8,trafficStrength + 0.1) },
        { dimension:'search_surfaces', classification:'unknown', claim:'Google and other search-surface demand has not been measured.', strength:null },
        { dimension:'geography_language', classification:'observation', claim:'The captured source is English; visitor geography is unavailable.', strength:0.35 },
        { dimension:'serp_weakness', classification:'unknown', claim:'No permitted live SERP analysis has been captured.', strength:null },
        { dimension:'product_gap', classification:'inference', claim:`The question has ${answers} answers; lower answer coverage may indicate unresolved friction, but does not prove a product gap.`, strength:gapStrength },
        { dimension:'traffic_potential', classification:'observation', claim:`The source page reports ${views} views; this is a directional engagement signal, not keyword volume.`, strength:trafficStrength },
        { dimension:'build_cost', classification:'inference', claim:'A focused diagnostic utility appears technically feasible, subject to data-source validation.', strength:0.65 },
        { dimension:'defensibility', classification:'unknown', claim:'No defensibility evidence has been captured.', strength:null }
      ]
    });
    if (candidates.length === 3) break;
  }
  return candidates;
}

async function insertEvent(client: PoolClient, runId: string, type: string, payload: object, suffix: string) {
  await client.query(`insert into outbox_events(id,aggregate_type,aggregate_id,event_type,event_version,payload,occurred_at) values($1,'workflow',$2,$3,1,$4::jsonb,now()) on conflict(id) do nothing`, [stableUuid(`${runId}:event:${suffix}`),runId,type,JSON.stringify(payload)]);
}

async function persistFindings(client: PoolClient, input: ResearchWorkflowInput, opportunityId: string, evidenceId: string, score: OpportunityScore) {
  for (const item of score.dimensions) {
    await client.query(`insert into market_findings(id,market_study_id,opportunity_id,dimension,classification,claim,evidence_ids,confidence)
      values($1,$2,$3,$4,$5,$6,$7::uuid[],$8) on conflict(id) do nothing`,[
      stableUuid(`${input.runId}:finding:${opportunityId}:${item.dimension}`), input.marketStudyId, opportunityId, item.dimension,
      item.classification, item.claim, item.strength === null ? '{}' : `{${evidenceId}}`, item.strength ?? 0
    ]);
  }
}

export async function performResearch(input: ResearchWorkflowInput) {
  const result = await source.research({ language:input.language, market:input.market, seed:input.brief });
  const pool = new Pool({ connectionString:process.env.DATABASE_URL ?? 'postgresql://venture:venture@127.0.0.1:5432/venture_os' });
  const client = await pool.connect();
  try {
    await client.query('begin');
    await client.query(`update market_studies set status='researching',updated_at=now() where id=$1`,[input.marketStudyId]);
    if (result.availability !== 'available' || !result.value) {
      await client.query(`update workflow_runs set state='waiting',updated_at=now() where id=$1`,[input.runId]);
      await client.query(`update market_studies set status='failed',updated_at=now() where id=$1`,[input.marketStudyId]);
      await insertEvent(client,input.runId,'provider.unavailable',{ provider:source.name,capability:'public-research',reason:result.reason ?? 'Provider unavailable.' },'provider-unavailable');
      await client.query('commit');
      return { state:'waiting',providerAvailability:result.availability,opportunities:0 };
    }
    const candidates = buildCandidates(result.value);
    for (const [index,candidate] of candidates.entries()) {
      const evidenceId=stableUuid(`${input.runId}:evidence:${candidate.evidence.url}`);
      const opportunityId=stableUuid(`${input.runId}:opportunity:${candidate.title}`);
      const integrityHash=createHash('sha256').update(candidate.evidence.reference).digest('hex');
      const assessments = candidate.assessments.map((item) => ({ ...item, evidenceIds:item.strength === null ? [] : [evidenceId] }));
      const score = scoreOpportunity(assessments);
      await client.query(`insert into evidence_items(id,workspace_id,source_url,captured_at,reference,language,market,confidence,retention,integrity_hash) values($1,$2,$3,$4,$5,'en','global',$6,'active',$7) on conflict(id) do nothing`,[evidenceId,WORKSPACE_ID,candidate.evidence.url,candidate.evidence.capturedAt,candidate.evidence.reference,candidate.evidence.confidence,integrityHash]);
      await client.query(`insert into opportunities(id,workspace_id,workflow_run_id,market_study_id,title,lifecycle,limitations,rationale,scorecard,problem,audience,search_demand_hypothesis,search_intent,search_surfaces,geography_language,product_type_hypothesis,monetization_hypothesis,traffic_potential,build_complexity,defensibility,risks,unknowns,confidence,recommendation)
        values($1,$2,$3,$4,$5,'scored',$6::jsonb,$7,$8::jsonb,$9,$10,$11,$12,$13::jsonb,$14,$15,$16,$17,$18,$19,$20::jsonb,$21::jsonb,$22,$23) on conflict(id) do nothing`,[
        opportunityId,WORKSPACE_ID,input.runId,input.marketStudyId,candidate.title,JSON.stringify(candidate.evidence.limitations),candidate.rationale,JSON.stringify(score),
        candidate.profile.problem,candidate.profile.audience,candidate.profile.searchDemandHypothesis,candidate.profile.searchIntent,JSON.stringify(candidate.profile.searchSurfaces),candidate.profile.geographyLanguage,candidate.profile.productTypeHypothesis,candidate.profile.monetizationHypothesis,candidate.profile.trafficPotential,candidate.profile.buildComplexity,candidate.profile.defensibility,JSON.stringify(candidate.profile.risks),JSON.stringify(score.unknownDimensions),score.evidenceCoverage,score.recommendation
      ]);
      await client.query(`insert into opportunity_evidence(opportunity_id,evidence_id) values($1,$2) on conflict do nothing`,[opportunityId,evidenceId]);
      await client.query(`insert into opportunity_evaluations(id,opportunity_id,workflow_run_id,scorecard,recommendation) values($1,$2,$3,$4::jsonb,$5) on conflict(opportunity_id,workflow_run_id) do nothing`,[stableUuid(`${input.runId}:evaluation:${opportunityId}`),opportunityId,input.runId,JSON.stringify(score),score.recommendation]);
      await persistFindings(client,input,opportunityId,evidenceId,score);
      await insertEvent(client,input.runId,'opportunity.discovered',{ marketStudyId:input.marketStudyId,opportunityId,title:candidate.title,provider:source.name,evidenceIds:[evidenceId] },`discovered:${index}`);
      await insertEvent(client,input.runId,'opportunity.scored',{ marketStudyId:input.marketStudyId,opportunityId,recommendation:score.recommendation,scorecard:score,evidenceIds:[evidenceId] },`scored:${index}`);
    }
    if (candidates.length < 3) {
      await client.query(`update workflow_runs set state='waiting',updated_at=now() where id=$1`,[input.runId]);
      await insertEvent(client,input.runId,'workflow.research_incomplete',{ marketStudyId:input.marketStudyId,provider:source.name,candidateCount:candidates.length,required:3 },'incomplete');
      await client.query('commit');
      return { state:'waiting',providerAvailability:'available',opportunities:candidates.length };
    }
    const candidateIds=candidates.map(candidate=>stableUuid(`${input.runId}:opportunity:${candidate.title}`));
    await client.query(`insert into approval_requests(id,workspace_id,workflow_run_id,action,input_snapshot,state,expires_at) values($1,$2,$3,'select_opportunity',$4::jsonb,'pending',now()+interval '30 days') on conflict(id) do nothing`,[stableUuid(`${input.runId}:approval`),WORKSPACE_ID,input.runId,JSON.stringify({marketStudyId:input.marketStudyId,candidateIds})]);
    await client.query(`update workflow_runs set state='awaiting_approval',updated_at=now() where id=$1`,[input.runId]);
    await client.query(`update market_studies set status='awaiting_review',updated_at=now() where id=$1`,[input.marketStudyId]);
    await insertEvent(client,input.runId,'market_study.completed',{ marketStudyId:input.marketStudyId,candidateCount:candidates.length,unknownsRetained:true },'study-completed');
    await insertEvent(client,input.runId,'workflow.awaiting_approval',{ marketStudyId:input.marketStudyId,candidateCount:candidates.length,approvalAction:'select_opportunity' },'awaiting-approval');
    await client.query('commit');
    return { state:'awaiting_approval',providerAvailability:'available',opportunities:candidates.length };
  } catch(error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}
