import {describe,expect,it,vi} from 'vitest';
import {BraveSearchSource} from '../src/brave-search.js';
import {GoogleAdsDemandSource} from '../src/google-ads.js';
import {WorldBankMarketContextSource} from '../src/world-bank.js';

describe('Phase 1.5 evidence providers',()=>{
  it('keeps paid live SERP unavailable without a credential and blocked without budget approval',async()=>{
    await expect(new BraveSearchSource(undefined).search({query:'seo audit',country:'PK',language:'en'})).resolves.toMatchObject({availability:'unavailable',attempt:{requestCount:0}});
    await expect(new BraveSearchSource('configured').search({query:'seo audit',country:'PK',language:'en'})).resolves.toMatchObject({availability:'blocked',attempt:{estimatedCostMicrousd:0}});
  });
  it('requires a positive budget, approval reference and enough approved cost before egress',async()=>{
    const fetcher=vi.fn();const source=new BraveSearchSource('token',fetcher);
    await expect(source.search({query:'seo',country:'PK',language:'en',budgetApproval:{approvalId:'approved-1',approvedBudgetCents:0,maxRequests:1}})).resolves.toMatchObject({availability:'blocked',attempt:{requestCount:0,estimatedCostMicrousd:0}});
    await expect(source.search({query:'seo',country:'PK',language:'en',budgetApproval:{approvalId:'',approvedBudgetCents:1,maxRequests:1}})).resolves.toMatchObject({availability:'blocked',attempt:{requestCount:0}});
    await expect(source.searchMany({queries:[{query:'one',country:'PK',language:'en'},{query:'two',country:'PK',language:'en'},{query:'three',country:'PK',language:'en'}],budgetApproval:{approvalId:'approved-1',approvedBudgetCents:1,maxRequests:3}})).resolves.toMatchObject({availability:'blocked',attempt:{requestCount:0}});
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('records ranked results, features, repeated domains and raw provenance',async()=>{
    const fetcher=vi.fn(async()=>new Response(JSON.stringify({query:{more_results_available:true},news:{results:[{}]},web:{results:[{title:'SEO audit guide',url:'https://seo.example/guide/seo-audit',description:'How to run an SEO audit',type:'search_result',extra_snippets:['Technical checklist']},{title:'SEO audit tool',url:'https://seo.example/tools/audit',description:'SEO checker tool',type:'search_result'}]}}),{status:200,headers:{'x-request-id':'req-1'}}));
    const result=await new BraveSearchSource('token',fetcher as typeof fetch,()=>new Date('2026-10-04T00:00:00Z')).search({query:'seo audit',country:'PK',language:'en',count:3,budgetApproval:{approvalId:'approved-1',approvedBudgetCents:1,maxRequests:1}});
    expect(result.availability).toBe('available');
    expect(result.reason).toContain('Partial result:');
    expect(result.value?.[0]?.observations[0]).toMatchObject({position:1,domain:'seo.example',country:'PK',pageType:'tool',contentDepth:'unknown',beatable:'unknown',repeatedDomainCount:2,siteSpecialization:'specialist'});
    expect(result.value?.[0]?.summary).toMatchObject({serpFeatures:['web','news'],repeatedDomains:[{domain:'seo.example',count:2}],observedIntent:'informational'});
    expect(result.value?.[0]?.provenance).toMatchObject({providerRequestId:'req-1',responseSha256:expect.any(String),responseBody:expect.any(Object)});
    expect(result.value?.[0]?.provenance.responseHeaders).toMatchObject({'x-request-id':'req-1'});
    expect(JSON.stringify(result.value?.[0]?.provenance)).not.toContain('token');
    expect(result.attempt).toMatchObject({outcome:'partial',requestCount:1,estimatedCostMicrousd:5000});
  });
  it('retains completed batches when a later request fails without retrying it',async()=>{
    const fetcher=vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({web:{results:[{title:'Guide',url:'https://specialist.example/guide',description:'How to learn SEO'}]}}),{status:200}))
      .mockResolvedValueOnce(new Response('',{status:503}));
    const result=await new BraveSearchSource('token',fetcher as typeof fetch).searchMany({queries:[{query:'learn seo',country:'PK',language:'en',count:1},{query:'seo pricing',country:'PK',language:'en',count:1}],budgetApproval:{approvalId:'approved-1',approvedBudgetCents:1,maxRequests:2}});
    expect(result).toMatchObject({availability:'available',reason:'Partial result: Brave Search API returned HTTP 503.',attempt:{outcome:'partial',requestCount:2,estimatedCostMicrousd:10_000,httpStatus:503}});
    expect(result.value).toHaveLength(1);
    expect(result.value?.[0]?.summary).toMatchObject({query:'learn seo',observedIntent:'informational'});
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it('persists provider failure instead of manufacturing SERP observations',async()=>{
    const result=await new BraveSearchSource('token',async()=>new Response('',{status:503})).search({query:'seo',country:'PK',language:'ur',budgetApproval:{approvalId:'approved-1',approvedBudgetCents:1,maxRequests:1}});
    expect(result).toMatchObject({availability:'unavailable',reason:'Brave Search API returned HTTP 503.',attempt:{outcome:'failed',httpStatus:503}});
  });
  it('captures rate limits and refuses requests beyond the approved scope',async()=>{
    const rateLimited=await new BraveSearchSource('token',async()=>new Response('{}',{status:429,headers:{'retry-after':'30'}})).search({query:'seo',country:'PK',language:'en',budgetApproval:{approvalId:'approved-1',approvedBudgetCents:1,maxRequests:1}});
    expect(rateLimited).toMatchObject({availability:'unavailable',attempt:{outcome:'rate_limited',retryAfterSeconds:30,httpStatus:429}});
    const fetcher=vi.fn();const blocked=await new BraveSearchSource('token',fetcher).searchMany({queries:[{query:'one',country:'PK',language:'en'},{query:'two',country:'PK',language:'en'}],budgetApproval:{approvalId:'approved-1',approvedBudgetCents:1,maxRequests:1}});
    expect(blocked.availability).toBe('blocked');expect(fetcher).not.toHaveBeenCalled();
  });
  it('maps official Pakistan context as proxy evidence with freshness and limitations',async()=>{
    const fetcher=async()=>new Response(JSON.stringify([{},[{country:{value:'Pakistan'},countryiso3code:'PAK',date:'2024',value:27.4,indicator:{id:'IT.NET.USER.ZS'}}]]),{status:200});
    const result=await new WorldBankMarketContextSource(fetcher as typeof fetch,()=>new Date('2026-10-04T00:00:00Z')).research();
    expect(result.value?.[0]).toMatchObject({geography:'Pakistan',evidenceNature:'proxy',observedAt:'2024-12-31T00:00:00.000Z',measurement:{value:27.4,absoluteSearchDemand:false}});
  });
  it('keeps Google Ads unavailable without approved credentials and maps direct metrics when configured',async()=>{
    const unavailable=await new GoogleAdsDemandSource({}).historicalMetrics({keywords:['seo'],languageResource:'languageConstants/1000',geoTargetResources:['geoTargetConstants/2586']});
    expect(unavailable.availability).toBe('unavailable');
    const fetcher=async()=>new Response(JSON.stringify({results:[{text:'seo audit',keywordMetrics:{avgMonthlySearches:'1200',competitionIndex:'54',lowTopOfPageBidMicros:'1000000',highTopOfPageBidMicros:'3000000',monthlySearchVolumes:[{year:'2026',month:'SEPTEMBER',monthlySearches:'1100'}]}}]}),{status:200});
    const available=await new GoogleAdsDemandSource({developerToken:'d',accessToken:'a',customerId:'c'},fetcher as typeof fetch,()=>new Date('2026-10-04T00:00:00Z')).historicalMetrics({keywords:['seo audit'],languageResource:'languageConstants/1000',geoTargetResources:['geoTargetConstants/2586']});
    expect(available.value?.[0]).toMatchObject({keyword:'seo audit',averageMonthlySearches:1200,competitionIndex:54,directMetric:true});
  });
});
