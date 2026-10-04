import type { ProviderResult } from '@venture/contracts';
export type SearchDemandObservation={providerId:string;keyword:string;geography:string;language:string;capturedAt:string;averageMonthlySearches:number|null;monthlySearchVolumes:Array<{month:string;searches:number|null}>;competitionIndex:number|null;lowTopOfPageBidMicros:number|null;highTopOfPageBidMicros:number|null;directMetric:true;limitations:string[]};
export type GoogleAdsConfig={developerToken?:string|undefined;accessToken?:string|undefined;customerId?:string|undefined;loginCustomerId?:string|undefined};
export class GoogleAdsDemandSource{
  readonly name='google-ads-keyword-planner';
  constructor(private readonly config:GoogleAdsConfig,private readonly fetcher:typeof fetch=fetch,private readonly now:()=>Date=()=>new Date()){}
  async historicalMetrics(input:{keywords:string[];languageResource:string;geoTargetResources:string[]}):Promise<ProviderResult<SearchDemandObservation[]>>{
    if(!this.config.developerToken||!this.config.accessToken||!this.config.customerId)return{availability:'unavailable',reason:'Google Ads developer token, OAuth access token and customer ID are required.'};
    const url=`https://googleads.googleapis.com/v22/customers/${this.config.customerId}:generateKeywordHistoricalMetrics`;
    const headers:Record<string,string>={'content-type':'application/json',authorization:`Bearer ${this.config.accessToken}`,'developer-token':this.config.developerToken};if(this.config.loginCustomerId)headers['login-customer-id']=this.config.loginCustomerId;
    try{
      const response=await this.fetcher(url,{method:'POST',headers,body:JSON.stringify({keywords:input.keywords.slice(0,100),language:input.languageResource,geoTargetConstants:input.geoTargetResources,keywordPlanNetwork:'GOOGLE_SEARCH'}),signal:AbortSignal.timeout(20000)});
      if(!response.ok)return{availability:'unavailable',reason:`Google Ads API returned HTTP ${response.status}.`};
      const body=await response.json() as {results?:Array<{text?:string;keywordMetrics?:{avgMonthlySearches?:string|number;competitionIndex?:string|number;lowTopOfPageBidMicros?:string|number;highTopOfPageBidMicros?:string|number;monthlySearchVolumes?:Array<{month?:string;year?:string|number;monthlySearches?:string|number}>}}>} ;
      const values=(body.results??[]).flatMap(result=>{if(!result.text)return[];const metrics=result.keywordMetrics??{};return[{providerId:this.name,keyword:result.text,geography:input.geoTargetResources.join(','),language:input.languageResource,capturedAt:this.now().toISOString(),averageMonthlySearches:numberOrNull(metrics.avgMonthlySearches),monthlySearchVolumes:(metrics.monthlySearchVolumes??[]).map(item=>({month:`${item.year??'unknown'}-${item.month??'unknown'}`,searches:numberOrNull(item.monthlySearches)})),competitionIndex:numberOrNull(metrics.competitionIndex),lowTopOfPageBidMicros:numberOrNull(metrics.lowTopOfPageBidMicros),highTopOfPageBidMicros:numberOrNull(metrics.highTopOfPageBidMicros),directMetric:true as const,limitations:['Average monthly searches are Google Ads historical estimates for the requested targeting, not guaranteed organic traffic.','Ads competition and bid ranges are commercial advertising signals, not organic ranking difficulty.']}];});
      return values.length?{availability:'available',value:values}:{availability:'unavailable',reason:'Google Ads returned no keyword historical metrics.'};
    }catch(error){return{availability:'unavailable',reason:`Google Ads request failed: ${error instanceof Error?error.message:'Unknown network failure'}`};}
  }
}
function numberOrNull(value:string|number|undefined){if(value===undefined)return null;const parsed=Number(value);return Number.isFinite(parsed)?parsed:null;}
