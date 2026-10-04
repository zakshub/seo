import type { MarketEvidenceObservation,ProviderResult } from '@venture/contracts';
type FetchLike=typeof fetch;
type Datum={country?:{value?:string};countryiso3code?:string;date?:string;value?:number|null;indicator?:{id?:string;value?:string}};

export class WorldBankMarketContextSource {
  readonly name='world-bank-indicators-api';
  constructor(private readonly fetcher:FetchLike=fetch,private readonly now:()=>Date=()=>new Date()){}
  async research(country='PAK'):Promise<ProviderResult<MarketEvidenceObservation[]>>{
    const url=`https://api.worldbank.org/v2/country/${country}/indicator/IT.NET.USER.ZS?format=json&mrnev=1&per_page=1`;
    try{
      const response=await this.fetcher(url,{headers:{accept:'application/json','user-agent':'AutonomousWebVentureOS/0.3 (market context)'},signal:AbortSignal.timeout(15000)});
      if(!response.ok)return{availability:'unavailable',reason:`World Bank API returned HTTP ${response.status}.`};
      const body=await response.json() as [unknown,Datum[]?]; const datum=body[1]?.find(item=>typeof item.value==='number');
      if(!datum||datum.value==null)return{availability:'unavailable',reason:'World Bank API returned no recent non-empty Pakistan internet-use observation.'};
      const captured=this.now(); const year=Number(datum.date); const freshUntil=new Date(Date.UTC(Number.isFinite(year)?year+3:captured.getUTCFullYear()+1,0,1));
      return{availability:'available',value:[{providerId:this.name,capability:'geographic_market_context',sourceClass:'official',sourceUrl:url,subject:'Individuals using the Internet (% of population)',capturedAt:captured.toISOString(),observedAt:`${datum.date}-12-31T00:00:00.000Z`,freshUntil:freshUntil.toISOString(),language:'en',market:'Pakistan',geography:'Pakistan',evidenceNature:'proxy',measurement:{kind:'internet_users_population_percent',value:datum.value,unit:'percent_of_population',definition:`World Bank indicator IT.NET.USER.ZS for Pakistan, year ${datum.date}.`,absoluteSearchDemand:false},confidence:0.8,limitations:['This is national digital-access context, not SEO search demand, keyword volume, willingness to pay, or click potential.','Annual indicators may lag the current market.'],reference:JSON.stringify({provider:this.name,indicator:'IT.NET.USER.ZS',country:datum.countryiso3code??country,year:datum.date,capturedAt:captured.toISOString()})}]};
    }catch(error){return{availability:'unavailable',reason:`World Bank request failed: ${error instanceof Error?error.message:'Unknown network failure'}`};}
  }
}
