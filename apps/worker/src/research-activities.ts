import { createHash } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { scoreOpportunity, scoreModernOpportunity, type DimensionAssessment, type ModernDimensionAssessment, type ModernOpportunityScore, type MarketEvidenceObservation } from '@venture/contracts';
import { StackExchangeResearchSource, WikimediaPageviewsSource, WorldBankMarketContextSource, BraveSearchSource, evidenceProviderManifests, type ResearchEvidence } from '@venture/providers';
import type { ResearchWorkflowInput } from './research-workflow.js';

const WORKSPACE_ID = '00000000-0000-4000-8000-000000000002';
const source = new StackExchangeResearchSource();
const topicSource = new WikimediaPageviewsSource();
const geographySource = new WorldBankMarketContextSource();
const serpSource = new BraveSearchSource(process.env.BRAVE_SEARCH_API_KEY);

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
  modernAssessments: Omit<ModernDimensionAssessment, 'evidenceIds'>[];
  discovery: {
    topicClusters: string[]; queryExamples: string[]; competitorObservations: string[]; contentGaps: string[];
    toolGaps: string[]; productFormats: string[]; informationArchitecture: string[];
  };
};

export function stableUuid(value: string) {
  const hex = createHash('sha256').update(value).digest('hex').slice(0,32).split('');
  hex[12] = '4'; hex[16] = ['8','9','a','b'][parseInt(hex[16] ?? '0',16) % 4] ?? '8';
  return `${hex.slice(0,8).join('')}-${hex.slice(8,12).join('')}-${hex.slice(12,16).join('')}-${hex.slice(16,20).join('')}-${hex.slice(20).join('')}`;
}

export function buildCandidates(items: ResearchEvidence[], topicEvidence: MarketEvidenceObservation[] = []): Candidate[] {
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
    const format = candidates.length === 0 ? 'interactive diagnostic and evidence library' : candidates.length === 1 ? 'decision-tree reference and validator' : 'public troubleshooting database';
    const label = tag==='seo' ? 'SEO improvement' : tag==='keywords' ? 'Title and keyword' : tag==='url' ? 'URL and localization' : `${tag} SEO`;
    const audience = tag==='url'
      ? 'Multilingual publishers, developers and site owners represented by the public Webmasters question audience.'
      : tag==='keywords'
        ? 'Content editors, publishers and site owners represented by the public Webmasters question audience.'
        : 'Small-site owners and SEO practitioners represented by the public Webmasters question audience.';
    const title = `${label} ${format}`;
    const topicClaim = topicEvidence.length
      ? `${topicEvidence.map(item=>`${item.subject} (${item.language}: ${item.measurement.value?.toLocaleString('en-US')} Wikipedia pageviews; ${item.measurement.definition.toLowerCase()})`).join('; ')}. This is topic interest, not search demand.`
      : 'No permitted topic-interest observation was available.';
    candidates.push({
      title,
      rationale: `A public Webmasters question about “${tag}” shows measurable problem engagement. This supports further validation only; search demand, SERP weakness and commercial viability remain unverified.`,
      evidence,
      profile: {
        problem: evidence.title,
        audience,
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
      ],
      modernAssessments: [
        {dimension:'demand',classification:'unknown',claim:'Authorized search-demand evidence is unavailable; public Q&A and Wikipedia pageviews are not search volume.',strength:null},
        {dimension:'intent',classification:'inference',claim:`The source question expresses a troubleshooting job around “${tag}”; representative search queries remain unvalidated.`,strength:0.4},
        {dimension:'serp_reality',classification:'unknown',claim:'No lawful live SERP provider is configured; composition, ranking positions and result quality are UNKNOWN.',strength:null},
        {dimension:'competitor_quality',classification:'unknown',claim:'No dated competitor-page observations have been captured.',strength:null},
        {dimension:'content_product_gap',classification:'inference',claim:`The question has ${answers} answers; this may indicate unresolved friction but does not establish a market gap.`,strength:gapStrength},
        {dimension:'topic_traffic_potential',classification:topicEvidence.length?'observation':'unknown',claim:topicClaim,strength:topicEvidence.length?0.45:null},
        {dimension:'click_potential',classification:'unknown',claim:'SERP features and no-click behavior have not been observed.',strength:null},
        {dimension:'solution_fit',classification:'inference',claim:`A ${format} could answer the observed troubleshooting job, subject to user and SERP validation.`,strength:0.55},
        {dimension:'authority_requirement',classification:'unknown',claim:'The trust, expertise and link requirements for this topic are UNKNOWN.',strength:null},
        {dimension:'build_feasibility',classification:'inference',claim:'A bounded public diagnostic/reference product is technically feasible without a paid data dependency.',strength:0.65},
        {dimension:'strategic_value',classification:'inference',claim:'The format could produce reusable structured evidence, but repeat use and distribution are unverified.',strength:0.4}
      ],
      discovery:{
        topicClusters:[tag,`${tag} diagnosis`,`${tag} implementation`,`${tag} mistakes`],
        queryExamples:[evidence.title,`how to diagnose ${tag} SEO`,`${tag} SEO checker`],
        competitorObservations:[],
        contentGaps:[`A step-by-step answer for the observed “${evidence.title}” problem is a hypothesis; no live result comparison exists.`],
        toolGaps:[`A repeatable ${tag} diagnostic is a hypothesis; tool availability and user demand are UNKNOWN.`],
        productFormats:[format,'reference pages','worked examples'],
        informationArchitecture:['Home / problem finder',`${tag} diagnostic`,`Evidence-backed ${tag} guides`,'Examples and limitations','Methodology and sources']
      }
    });
    if (candidates.length === 3) break;
  }
  return candidates;
}

async function insertEvent(client: PoolClient, runId: string, type: string, payload: object, suffix: string) {
  await client.query(`insert into outbox_events(id,aggregate_type,aggregate_id,event_type,event_version,payload,occurred_at) values($1,'workflow',$2,$3,1,$4::jsonb,now()) on conflict(id) do nothing`, [stableUuid(`${runId}:event:${suffix}`),runId,type,JSON.stringify(payload)]);
}

async function persistFindings(client: PoolClient, input: ResearchWorkflowInput, opportunityId: string, score: ModernOpportunityScore) {
  for (const item of score.dimensions) {
    await client.query(`insert into market_findings(id,market_study_id,opportunity_id,dimension,classification,claim,evidence_ids,confidence)
      values($1,$2,$3,$4,$5,$6,$7::uuid[],$8) on conflict(id) do nothing`,[
      stableUuid(`${input.runId}:finding:${opportunityId}:${item.dimension}`), input.marketStudyId, opportunityId, item.dimension,
      item.classification, item.claim, item.evidenceIds, item.strength ?? 0
    ]);
  }
}

export async function performResearch(input: ResearchWorkflowInput) {
  const [result, topicResult, geographyResult] = await Promise.all([
    source.research({ language:input.language, market:input.market, seed:input.brief }),
    topicSource.research([
      {article:'Search_engine_optimization',language:'en',label:'Search engine optimization'},
      {article:'Google_Search_Console',language:'en',label:'Google Search Console'},
      {article:'تلاش_انجن',language:'ur',label:'Search engines'}
    ]),
    geographySource.research('PAK')
  ]);
  const candidates=result.availability==='available'&&result.value?buildCandidates(result.value,topicResult.availability==='available'?topicResult.value??[]:[]):[];
  const serpQueries=candidates.map(candidate=>({query:candidate.discovery.queryExamples[0]!,country:'PK',language:'en',count:10}));
  const serpResult=await (input.budgetApprovalId?serpSource.searchMany({queries:serpQueries,budgetApproval:{approvalId:input.budgetApprovalId,approvedBudgetCents:input.paidBudgetCents,maxRequests:input.braveMaxRequests}}):serpSource.searchMany({queries:serpQueries}));
  const pool = new Pool({ connectionString:process.env.DATABASE_URL ?? 'postgresql://venture:venture@127.0.0.1:5432/venture_os' });
  const client = await pool.connect();
  try {
    await client.query('begin');
    await client.query(`update market_studies set status='researching',updated_at=now() where id=$1`,[input.marketStudyId]);
    for (const manifest of evidenceProviderManifests) {
      const actual = manifest.id===source.name ? result : manifest.id===topicSource.name ? topicResult : manifest.id===geographySource.name ? geographyResult : manifest.id===serpSource.name ? serpResult : undefined;
      const requestCount=manifest.id===source.name?1:manifest.id===topicSource.name?3:manifest.id===geographySource.name?1:manifest.id===serpSource.name?serpResult.attempt.requestCount:0;
      const resultStatus=manifest.id===serpSource.name?serpResult.attempt.outcome:actual?.availability==='available'&&actual.reason?.startsWith('Partial result:')?'partial':actual?.availability??manifest.availability;
      const actualAvailability=manifest.id===serpSource.name&&serpResult.value?.length?'available':actual?.availability??manifest.availability;
      await client.query(`insert into market_study_provider_runs(id,market_study_id,provider_id,capability,availability,reason,request_count,evidence_nature,geography,resolves_dimensions,documentation_url,limitations,observed_at,fresh_until)
        values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12::jsonb,now(),null) on conflict(market_study_id,provider_id) do update set availability=excluded.availability,reason=excluded.reason,request_count=excluded.request_count,evidence_nature=excluded.evidence_nature,geography=excluded.geography,resolves_dimensions=excluded.resolves_dimensions,documentation_url=excluded.documentation_url,limitations=excluded.limitations,observed_at=excluded.observed_at`,[
        stableUuid(`${input.runId}:provider:${manifest.id}`),input.marketStudyId,manifest.id,manifest.capability,actualAvailability,
        actual?.reason??manifest.reason,requestCount,manifest.evidenceNature,manifest.supportedMarkets.join(', '),JSON.stringify(manifest.resolvesDimensions),manifest.documentationUrl,JSON.stringify(manifest.limitations)
      ]);
      await client.query(`insert into provider_run_attempts(id,market_study_id,provider_id,capability,idempotency_key,result_status,reason,geography,evidence_nature,request_count,paid_cost_cents,started_at,completed_at,limitations,http_status,retry_after_seconds,estimated_cost_microusd,provider_request_id,budget_approval_id)
        values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,0,now(),now(),$11::jsonb,$12,$13,$14,$15,$16) on conflict(market_study_id,provider_id,idempotency_key) do nothing`,[
        stableUuid(`${input.runId}:provider-attempt:${manifest.id}:v1`),input.marketStudyId,manifest.id,manifest.capability,`${input.runId}:${manifest.id}:v1`,resultStatus,actual?.reason??manifest.reason,manifest.supportedMarkets.join(', '),manifest.evidenceNature,requestCount,JSON.stringify(manifest.limitations),manifest.id===serpSource.name?serpResult.attempt.httpStatus??null:null,manifest.id===serpSource.name?serpResult.attempt.retryAfterSeconds??null:null,manifest.id===serpSource.name?serpResult.attempt.estimatedCostMicrousd:0,manifest.id===serpSource.name?serpResult.attempt.providerRequestId??null:null,manifest.id===serpSource.name?input.budgetApprovalId??null:null
      ]);
      if (resultStatus==='rate_limited') await insertEvent(client,input.runId,'provider.rate_limited',{provider:manifest.id,capability:manifest.capability,reason:actual?.reason,retryAfterSeconds:serpResult.attempt.retryAfterSeconds},`provider:${manifest.id}`);
      else if (actualAvailability!=='available') await insertEvent(client,input.runId,'provider.unavailable',{provider:manifest.id,capability:manifest.capability,reason:actual?.reason??manifest.reason},`provider:${manifest.id}`);
    }
    if (result.availability !== 'available' || !result.value) {
      await client.query(`update workflow_runs set state='waiting',updated_at=now() where id=$1`,[input.runId]);
      await client.query(`update market_studies set status='failed',updated_at=now() where id=$1`,[input.marketStudyId]);
      await insertEvent(client,input.runId,'provider.unavailable',{ provider:source.name,capability:'public-research',reason:result.reason ?? 'Provider unavailable.' },'provider-unavailable');
      await client.query('commit');
      return { state:'waiting',providerAvailability:result.availability,opportunities:0 };
    }
    const topicObservations = topicResult.availability==='available' ? topicResult.value ?? [] : [];
    const geographyObservations=geographyResult.availability==='available'?geographyResult.value??[]:[];
    const topicEvidenceIds:string[]=[]; const geographyEvidenceIds:string[]=[];
    for (const observation of [...topicObservations,...geographyObservations]) {
      const evidenceId=stableUuid(`${input.runId}:evidence:${observation.providerId}:${observation.language}:${observation.subject}`);
      if(observation.capability==='topic_interest')topicEvidenceIds.push(evidenceId);else geographyEvidenceIds.push(evidenceId);
      const integrityHash=createHash('sha256').update(observation.reference).digest('hex');
      await client.query(`insert into evidence_items(id,workspace_id,source_url,captured_at,reference,language,market,confidence,retention,integrity_hash,provider_id,capability,source_class,subject,measurement,limitations,evidence_nature,geography,observed_at,fresh_until)
        values($1,$2,$3,$4,$5,$6,$7,$8,'active',$9,$10,$11,$12,$13,$14::jsonb,$15::jsonb,$16,$17,$18,$19) on conflict(id) do nothing`,[
        evidenceId,WORKSPACE_ID,observation.sourceUrl,observation.capturedAt,observation.reference,observation.language,observation.market,observation.confidence,integrityHash,
        observation.providerId,observation.capability,observation.sourceClass,observation.subject,JSON.stringify(observation.measurement),JSON.stringify(observation.limitations),observation.evidenceNature,observation.geography??observation.market,observation.observedAt,observation.freshUntil??null
      ]);
      await client.query(`update provider_run_attempts set evidence_ids=array_append(evidence_ids,$2::uuid) where market_study_id=$1 and provider_id=$3 and not ($2::uuid=any(evidence_ids))`,[input.marketStudyId,evidenceId,observation.providerId]);
    }
    const serpBatches=serpResult.value??[];const serpEvidenceByQuery=new Map<string,string>();
    for(const batch of serpBatches){
      const attemptId=stableUuid(`${input.runId}:provider-attempt:${serpSource.name}:v1`);const artifactId=stableUuid(`${input.runId}:brave-raw:${batch.summary.query}:PK:en`);const evidenceId=stableUuid(`${input.runId}:evidence:brave:${batch.summary.query}:PK:en`);serpEvidenceByQuery.set(batch.summary.query,evidenceId);
      await client.query(`insert into provider_raw_artifacts(id,provider_run_attempt_id,provider_id,query,endpoint,geography,language,requested_at,received_at,response_sha256,response_headers,response_body) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12::jsonb) on conflict(provider_run_attempt_id,query,geography,language) do nothing`,[artifactId,attemptId,serpSource.name,batch.summary.query,batch.provenance.endpoint,batch.summary.country,batch.summary.language,batch.provenance.requestedAt,batch.provenance.receivedAt,batch.provenance.responseSha256,JSON.stringify(batch.provenance.responseHeaders),JSON.stringify(batch.provenance.responseBody)]);
      await client.query(`insert into evidence_items(id,workspace_id,source_url,captured_at,reference,language,market,confidence,retention,integrity_hash,provider_id,capability,source_class,subject,measurement,limitations,evidence_nature,geography,observed_at,fresh_until) values($1,$2,$3,$4,$5,$6,$7,0.75,'active',$8,$9,'serp_observation','public_api',$10,$11::jsonb,$12::jsonb,'direct',$13,$4,$14) on conflict(id) do nothing`,[evidenceId,WORKSPACE_ID,batch.provenance.endpoint,batch.provenance.receivedAt,JSON.stringify({provider:serpSource.name,rawArtifactId:artifactId,responseSha256:batch.provenance.responseSha256,query:batch.summary.query}),batch.summary.language,batch.summary.country,batch.provenance.responseSha256,serpSource.name,batch.summary.query,JSON.stringify({kind:'ranked_serp_observation',unit:'ranked_results',value:batch.observations.length,features:batch.summary.serpFeatures,repeatedDomains:batch.summary.repeatedDomains,observedIntent:batch.summary.observedIntent,absoluteSearchDemand:false}),JSON.stringify(['Brave positions are not Google positions.','Snippet classification does not establish backlink authority, traffic or beatability.']),batch.summary.country,new Date(new Date(batch.provenance.receivedAt).getTime()+7*86400000).toISOString()]);
      await client.query(`update provider_run_attempts set evidence_ids=array_append(evidence_ids,$2::uuid) where id=$1 and not ($2::uuid=any(evidence_ids))`,[attemptId,evidenceId]);
    }
    for (const [index,candidate] of candidates.entries()) {
      const evidenceId=stableUuid(`${input.runId}:evidence:${candidate.evidence.url}`);
      const opportunityId=stableUuid(`${input.runId}:opportunity:${candidate.title}`);
      const integrityHash=createHash('sha256').update(candidate.evidence.reference).digest('hex');
      const candidateBatch=serpBatches.find(batch=>batch.summary.query===candidate.discovery.queryExamples[0]);const serpEvidenceId=serpEvidenceByQuery.get(candidate.discovery.queryExamples[0]!);const repeated=candidateBatch?.summary.repeatedDomains.length??0;const specialists=candidateBatch?.observations.filter(item=>item.siteSpecialization==='specialist').length??0;
      const modernAssessments = candidate.modernAssessments.map((item) => {
        if(candidateBatch&&serpEvidenceId&&item.dimension==='serp_reality')return{...item,classification:'observation' as const,claim:`Captured ${candidateBatch.observations.length} ranked Brave results for Pakistan with ${candidateBatch.summary.serpFeatures.join(', ')||'web-only'} composition.`,strength:0.7,evidenceIds:[serpEvidenceId],confidence:0.75};
        if(candidateBatch&&serpEvidenceId&&item.dimension==='competitor_quality')return{...item,classification:'observation' as const,claim:`Bounded snippet review found ${specialists} specialist results and ${repeated} repeated domains; depth, authority and beatability remain UNKNOWN.`,strength:0.4,evidenceIds:[serpEvidenceId],confidence:0.65};
        if(candidateBatch&&serpEvidenceId&&item.dimension==='click_potential')return{...item,classification:'inference' as const,claim:`Observed SERP features: ${candidateBatch.summary.serpFeatures.join(', ')||'web only'}. This bounds result composition but does not measure Google CTR.`,strength:0.35,evidenceIds:[serpEvidenceId],confidence:0.55};
        if(candidateBatch&&serpEvidenceId&&item.dimension==='intent')return{...item,classification:'observation' as const,claim:`Captured result composition indicates ${candidateBatch.summary.observedIntent.replaceAll('_',' ')} intent on Brave for Pakistan.`,strength:0.55,evidenceIds:[serpEvidenceId],confidence:0.65};
        return{...item,evidenceIds:item.strength===null?[]:item.dimension==='topic_traffic_potential'?topicEvidenceIds:[evidenceId]};
      });
      const modernScore = scoreModernOpportunity(modernAssessments);
      const legacyScore = scoreOpportunity(candidate.assessments.map((item)=>({...item,evidenceIds:item.strength===null?[]:[evidenceId]})));
      await client.query(`insert into evidence_items(id,workspace_id,source_url,captured_at,reference,language,market,confidence,retention,integrity_hash,provider_id,capability,source_class,subject,measurement,limitations,evidence_nature,geography,observed_at,fresh_until)
        values($1,$2,$3,$4,$5,'en','global',$6,'active',$7,$8,'problem_signal','public_api',$9,$10::jsonb,$11::jsonb,'proxy','global',$4,$12) on conflict(id) do nothing`,[
        evidenceId,WORKSPACE_ID,candidate.evidence.url,candidate.evidence.capturedAt,candidate.evidence.reference,candidate.evidence.confidence,integrityHash,source.name,candidate.evidence.title,
        JSON.stringify({kind:'public_question_engagement',value:candidate.evidence.metrics.views??null,unit:'source_page_views',definition:'Views reported by the source Q&A API.',absoluteSearchDemand:false}),JSON.stringify(candidate.evidence.limitations),new Date(new Date(candidate.evidence.capturedAt).getTime()+7*86400000).toISOString()
      ]);
      await client.query(`update provider_run_attempts set evidence_ids=array_append(evidence_ids,$2::uuid) where market_study_id=$1 and provider_id=$3 and not ($2::uuid=any(evidence_ids))`,[input.marketStudyId,evidenceId,source.name]);
      await client.query(`insert into opportunities(id,workspace_id,workflow_run_id,market_study_id,title,lifecycle,limitations,rationale,scorecard,modern_scorecard,problem,audience,search_demand_hypothesis,search_intent,search_surfaces,geography_language,product_type_hypothesis,monetization_hypothesis,traffic_potential,build_complexity,defensibility,risks,unknowns,confidence,recommendation,topic_clusters,query_examples,competitor_observations,content_gaps,tool_gaps,product_formats,initial_information_architecture,phase2_readiness)
        values($1,$2,$3,$4,$5,'scored',$6::jsonb,$7,$8::jsonb,$9::jsonb,$10,$11,$12,$13,$14::jsonb,$15,$16,$17,$18,$19,$20,$21::jsonb,$22::jsonb,$23,$24,$25::jsonb,$26::jsonb,$27::jsonb,$28::jsonb,$29::jsonb,$30::jsonb,$31::jsonb,$32::jsonb) on conflict(id) do nothing`,[
        opportunityId,WORKSPACE_ID,input.runId,input.marketStudyId,candidate.title,JSON.stringify(candidate.evidence.limitations),candidate.rationale,JSON.stringify(modernScore),JSON.stringify({legacy:legacyScore,modern:modernScore}),
        candidate.profile.problem,candidate.profile.audience,candidate.profile.searchDemandHypothesis,candidate.profile.searchIntent,JSON.stringify(candidate.profile.searchSurfaces),candidate.profile.geographyLanguage,candidate.profile.productTypeHypothesis,candidate.profile.monetizationHypothesis,candidate.profile.trafficPotential,candidate.profile.buildComplexity,candidate.profile.defensibility,JSON.stringify(candidate.profile.risks),JSON.stringify(modernScore.unknownDimensions),modernScore.evidenceCoverage,modernScore.recommendation,
        JSON.stringify(candidate.discovery.topicClusters),JSON.stringify(candidate.discovery.queryExamples),JSON.stringify(candidate.discovery.competitorObservations),JSON.stringify(candidate.discovery.contentGaps),JSON.stringify(candidate.discovery.toolGaps),JSON.stringify(candidate.discovery.productFormats),JSON.stringify(candidate.discovery.informationArchitecture),JSON.stringify({ready:modernScore.phase2Ready,blockers:modernScore.phase2Blockers})
      ]);
      for(const linkedEvidenceId of [evidenceId,...topicEvidenceIds,...geographyEvidenceIds,...(serpEvidenceId?[serpEvidenceId]:[])]) await client.query(`insert into opportunity_evidence(opportunity_id,evidence_id) values($1,$2) on conflict do nothing`,[opportunityId,linkedEvidenceId]);
      if(candidateBatch){const attemptId=stableUuid(`${input.runId}:provider-attempt:${serpSource.name}:v1`);const artifactId=stableUuid(`${input.runId}:brave-raw:${candidateBatch.summary.query}:PK:en`);for(const observation of candidateBatch.observations)await client.query(`insert into competitor_observations(id,market_study_id,opportunity_id,provider_run_attempt_id,query,geography,language,captured_at,ranking_position,domain,source_url,page_type,content_type,content_depth,site_specialization,visible_authority_signals,technical_quality,intent_match,business_model,strengths,weaknesses,beatable,evidence_nature,limitations,raw_artifact_id,snippet,extra_snippets,repeated_domain_count,serp_features,observed_intent,specialization_reason,specialization_confidence) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16::jsonb,$17,$18::jsonb,$19,$20::jsonb,$21::jsonb,$22,'direct',$23::jsonb,$24,$25,$26::jsonb,$27,$28::jsonb,$29,$30,$31) on conflict(provider_run_attempt_id,query,ranking_position) do nothing`,[stableUuid(`${input.runId}:competitor:${observation.query}:${observation.position}`),input.marketStudyId,opportunityId,attemptId,observation.query,observation.country,observation.language,observation.capturedAt,observation.position,observation.domain,observation.url,observation.pageType,observation.contentType,observation.contentDepth,observation.siteSpecialization,JSON.stringify(observation.visibleAuthoritySignals),observation.technicalQuality,JSON.stringify(observation.intentMatch),observation.businessModel,JSON.stringify(observation.strengths),JSON.stringify(observation.weaknesses),observation.beatable,JSON.stringify(observation.limitations),artifactId,observation.snippet,JSON.stringify(observation.extraSnippets),observation.repeatedDomainCount,JSON.stringify(observation.serpFeatures),observation.observedIntent,observation.specializationReason,observation.specializationConfidence]);}
      await client.query(`insert into opportunity_evaluations(id,opportunity_id,workflow_run_id,scorecard,recommendation) values($1,$2,$3,$4::jsonb,$5) on conflict(opportunity_id,workflow_run_id) do nothing`,[stableUuid(`${input.runId}:evaluation:${opportunityId}`),opportunityId,input.runId,JSON.stringify(modernScore),modernScore.recommendation]);
      await persistFindings(client,input,opportunityId,modernScore);
      await insertEvent(client,input.runId,'opportunity.discovered',{ marketStudyId:input.marketStudyId,opportunityId,title:candidate.title,provider:source.name,evidenceIds:[evidenceId,...topicEvidenceIds] },`discovered:${index}`);
      await insertEvent(client,input.runId,'opportunity.scored',{ marketStudyId:input.marketStudyId,opportunityId,recommendation:modernScore.recommendation,scorecard:modernScore,evidenceIds:[evidenceId,...topicEvidenceIds] },`scored:${index}`);
    }
    if (candidates.length < 3) {
      await client.query(`update workflow_runs set state='waiting',updated_at=now() where id=$1`,[input.runId]);
      await insertEvent(client,input.runId,'workflow.research_incomplete',{ marketStudyId:input.marketStudyId,provider:source.name,candidateCount:candidates.length,required:3 },'incomplete');
      await client.query('commit');
      return { state:'waiting',providerAvailability:'available',opportunities:candidates.length };
    }
    const candidateIds=candidates.map(candidate=>stableUuid(`${input.runId}:opportunity:${candidate.title}`));
    await client.query(`insert into approval_requests(id,workspace_id,workflow_run_id,action,input_snapshot,state,expires_at) values($1,$2,$3,'review_market_evidence',$4::jsonb,'pending',now()+interval '30 days') on conflict(id) do nothing`,[stableUuid(`${input.runId}:approval`),WORKSPACE_ID,input.runId,JSON.stringify({marketStudyId:input.marketStudyId,candidateIds,phase2Ready:false})]);
    await client.query(`update workflow_runs set state='awaiting_approval',updated_at=now() where id=$1`,[input.runId]);
    await client.query(`update market_studies set status='awaiting_review',updated_at=now() where id=$1`,[input.marketStudyId]);
    await insertEvent(client,input.runId,'market_study.completed',{ marketStudyId:input.marketStudyId,candidateCount:candidates.length,unknownsRetained:true,phase2Ready:false },'study-completed');
    await insertEvent(client,input.runId,'workflow.awaiting_approval',{ marketStudyId:input.marketStudyId,candidateCount:candidates.length,approvalAction:'review_market_evidence',phase2Ready:false },'awaiting-approval');
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
