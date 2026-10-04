import {describe,expect,it,vi} from 'vitest';
import {BraveSearchSource} from '../src/brave-search.js';
import {GoogleAdsDemandSource} from '../src/google-ads.js';
import {WorldBankMarketContextSource} from '../src/world-bank.js';

describe('Phase 1.5 evidence providers',()=>{
  it('keeps paid live SERP unavailable without a credential and blocked without budget approval',async()=>{
    await expect(new BraveSearchSource(undefined).search({query:'seo audit',country:'PK',language:'en',approvedBudgetCents:0})).resolves.toMatchObject({availability:'unavailable'});
    await expect(new BraveSearchSource('configured').search({query:'seo audit',country:'PK',language:'en',approvedBudgetCents:0})).resolves.toMatchObject({availability:'blocked'});
  });
  it('records bounded SERP positions and honestly marks a partial response',async()=>{
    const fetcher=vi.fn(async()=>new Response(JSON.stringify({web:{results:[{title:'SEO audit guide',url:'https://example.com/guide/seo-audit',description:'How to run an SEO audit',type:'search_result'}]}}),{status:200}));
    const result=await new BraveSearchSource('token',fetcher as typeof fetch,()=>new Date('2026-10-04T00:00:00Z')).search({query:'seo audit',country:'PK',language:'en',count:3,approvedBudgetCents:5});
    expect(result).toMatchObject({availability:'available',reason:'Partial result: requested 3, received 1 usable web results.'});
    expect(result.value?.[0]).toMatchObject({position:1,domain:'example.com',country:'PK',pageType:'tool',contentDepth:'unknown',beatable:'unknown'});
  });
  it('persists provider failure instead of manufacturing SERP observations',async()=>{
    const result=await new BraveSearchSource('token',async()=>new Response('',{status:503})).search({query:'seo',country:'PK',language:'ur',approvedBudgetCents:5});
    expect(result).toEqual({availability:'unavailable',reason:'Brave Search API returned HTTP 503.'});
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
