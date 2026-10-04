import type { ProviderResult } from '@venture/contracts';
type FetchLike=typeof fetch;
type BraveResult={title?:string;url?:string;description?:string;type?:string};
type BraveResponse={web?:{results?:BraveResult[]};mixed?:{main?:unknown[]}};
export type SerpObservation={providerId:string;query:string;country:string;language:string;capturedAt:string;position:number;domain:string;url:string;title:string;snippet:string;pageType:string;contentType:string;contentDepth:'unknown';siteSpecialization:'unknown';visibleAuthoritySignals:string[];technicalQuality:'unknown';intentMatch:{kind:'proxy';confidence:number;reason:string};businessModel:'unknown';strengths:string[];weaknesses:string[];beatable:'unknown';limitations:string[]};

export class BraveSearchSource{
  readonly name='brave-search-api';
  constructor(private readonly token:string|undefined,private readonly fetcher:FetchLike=fetch,private readonly now:()=>Date=()=>new Date()){}
  async search(input:{query:string;country:string;language:string;count?:number;approvedBudgetCents:number}):Promise<ProviderResult<SerpObservation[]>>{
    if(!this.token)return{availability:'unavailable',reason:'Brave Search credential is not configured.'};
    if(input.approvedBudgetCents<=0)return{availability:'blocked',reason:'Brave Search is a paid subscription API; explicit positive budget approval is required.'};
    const url=new URL('https://api.search.brave.com/res/v1/web/search');url.search=new URLSearchParams({q:input.query,country:input.country,search_lang:input.language,count:String(Math.min(20,Math.max(1,input.count??10))),safesearch:'moderate'}).toString();
    try{
      const response=await this.fetcher(url,{headers:{accept:'application/json','x-subscription-token':this.token},signal:AbortSignal.timeout(15000)});
      if(!response.ok)return{availability:'unavailable',reason:`Brave Search API returned HTTP ${response.status}.`};
      const body=await response.json() as BraveResponse; const results=body.web?.results??[];
      const mapped=results.flatMap((item,index)=>{if(!item.url||!item.title)return[];const parsed=new URL(item.url);const queryTerms=input.query.toLowerCase().split(/\s+/).filter(term=>term.length>2);const haystack=`${item.title} ${item.description??''}`.toLowerCase();const matched=queryTerms.filter(term=>haystack.includes(term)).length;return[{providerId:this.name,query:input.query,country:input.country,language:input.language,capturedAt:this.now().toISOString(),position:index+1,domain:parsed.hostname,url:item.url,title:item.title,snippet:item.description??'',pageType:inferPageType(parsed.pathname,item.title),contentType:item.type??'web',contentDepth:'unknown' as const,siteSpecialization:'unknown' as const,visibleAuthoritySignals:[],technicalQuality:'unknown' as const,intentMatch:{kind:'proxy' as const,confidence:queryTerms.length?Number((matched/queryTerms.length).toFixed(2)):0,reason:'Lexical overlap in result title/snippet; page review is still required.'},businessModel:'unknown' as const,strengths:['Ranks in the captured Brave result set.'],weaknesses:['Content depth, technical quality and authority are not established from a snippet.'],beatable:'unknown' as const,limitations:['Position is from Brave Search for the captured country/language/time, not Google.','Snippet-level observation cannot establish page quality, backlinks, traffic, DR, DA or organic difficulty.']}];});
      if(!mapped.length)return{availability:'unavailable',reason:'Brave Search returned no usable web results.'};
      return mapped.length<(input.count??10)?{availability:'available',value:mapped,reason:`Partial result: requested ${input.count??10}, received ${mapped.length} usable web results.`}:{availability:'available',value:mapped};
    }catch(error){return{availability:'unavailable',reason:`Brave Search request failed: ${error instanceof Error?error.message:'Unknown network failure'}`};}
  }
}
function inferPageType(path:string,title:string){const text=`${path} ${title}`.toLowerCase();if(/tool|checker|audit|calculator/.test(text))return'tool';if(/guide|learn|how|what|why/.test(text))return'guide';if(/category|directory|list/.test(text))return'directory';return'page_unknown';}
