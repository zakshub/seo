import { glossary } from '../control-center.js';
import { CandidateActions, MarketStudyControl, StartControl } from './controls.js';

const nav = [
  ['⌂','Dashboard','Overview of everything'],['◇','Market Studies','Evidence-backed validation'],['♙','AI Team','See what each agent does'],['♨','Opportunities','New website ideas'],['□','Projects','All websites (new & live)'],['↗','SEO Growth','Track and improve SEO'],['▥','Analytics','Traffic, revenue, keywords'],['➤','Deployments','Domains, server, status'],['＄','Finances','Costs and earnings'],['▣','Knowledge Base','What AI has learned'],['⚙','Settings','Control and limits']
] as const;
const agents = [
  ['1','Researcher','Finds niches, keywords and market opportunities.','blue'],['2','Strategist','Decides what to build and how to make money.','violet'],['3','Designer','Creates accessible designs in Figma.','pink'],['4','Reviewer','Checks intent, usability and readiness.','orange'],['5','Developer','Builds approved websites in GitHub.','cyan'],['6','QA & SEO','Tests the website and technical SEO.','teal'],['7','DevOps','Handles approved VPS deployments.','indigo'],['8','Growth SEO','Improves sites from real evidence.','green'],['9','Monetization','Tracks costs, revenue and opportunities.','gold']
] as const;
type Overview = { workflows: number; opportunities: number; projects: number; approvals: number };
type Health = { database: string; temporal: string; researchProvider: string; reason: string };
type Activity = { runs: Array<{ id:string; state:string; updatedAt:string }>; events: Array<{ id:string; eventType:string; aggregateId:string; payload:Record<string,string>; occurredAt:string }> };
type Opportunity = { id:string; title:string; lifecycle:string; rationale:string; approvalId?:string; scorecard:{total?:number}; limitations:string[]; evidence:Array<{sourceUrl:string;capturedAt:string;confidence:number}> };
type Finding = {id:string;dimension:string;classification:'fact'|'observation'|'inference'|'unknown';claim:string;confidence:number;evidenceIds:string[]};
type StudyOpportunity = {id:string;title:string;rationale:string;recommendation:string;confidence:number;unknowns:string[];problem:string;audience:string;searchDemandHypothesis:string;searchIntent:string;productTypeHypothesis:string;monetizationHypothesis:string;trafficPotential:string;buildComplexity:string;defensibility:string;risks:string[];scorecard:{total:number;evidenceCoverage:number;dimensions:Array<{dimension:string;classification:string;points:number;weight:number}>};findings:Finding[];evidence:Array<{id:string;sourceUrl:string;capturedAt:string;confidence:number}>};
type MarketStudy = {id:string;brief:string;status:string;sourcePolicy:string;paidBudgetCents:number;requestLimit:number;timeLimitSeconds:number;createdAt:string;workflowState:string;opportunities:StudyOpportunity[]};
const apiBase = process.env.API_INTERNAL_URL ?? 'http://127.0.0.1:4000/api';
async function runtime() {
  try {
    const [overview,health,activity,opportunities,studies] = await Promise.all([
      fetch(`${apiBase}/overview`,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error();return r.json() as Promise<Overview>}),
      fetch(`${apiBase}/health`,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error();return r.json() as Promise<Health>}),
      fetch(`${apiBase}/activity`,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error();return r.json() as Promise<Activity>}),
      fetch(`${apiBase}/opportunities`,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error();return r.json() as Promise<Opportunity[]>}),
      fetch(`${apiBase}/market-studies`,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error();return r.json() as Promise<MarketStudy[]>})
    ]);
    return { overview,health,activity,opportunities,studies,available:true as const };
  } catch { return { overview:{workflows:0,opportunities:0,projects:0,approvals:0},health:null,activity:{runs:[],events:[]},opportunities:[],studies:[],available:false as const }; }
}

export default async function Dashboard(){const data=await runtime(); const active=data.activity.runs[0]; const kpis = [['◎',String(data.overview.projects),'Projects','Persisted projects'],['♜',String(data.overview.workflows),'Workflow Runs','Persisted workflow history'],['♧',String(data.overview.opportunities),'Opportunities Found','Evidence-backed only'],['✓',String(data.overview.approvals),'Pending Approvals','Owner decisions needed'],['$','$0','Total Revenue','No recorded revenue']] as const; return <div className="shell">
  <aside className="sidebar">
    <div className="logo"><i>◉</i><span><b>AI Web Company</b><small>Find • Build • Rank • Grow</small></span></div>
    <nav>{nav.map(([icon,label,sub],i)=><a className={i===0?'active':''} href="#" key={label}><i>{icon}</i><span><b>{label}</b><small>{sub}</small></span></a>)}</nav>
    <div className="help"><i>?</i><span><b>Need Help?</b><small>Click any item to see a simple explanation.</small></span></div>
  </aside>
  <main>
    <header className="topbar">
      <div className="prompt"><i>✦</i><span>Tell the AI what you want or just click Start<small>e.g. “Find and build a new website” or “Improve SEO for all sites”</small></span></div>
      <div className="modes"><button className="chosen"><b>♟ Manual</b><small>You approve every step</small></button><button><b>◉ Supervised</b><small>AI works, asks for approvals</small></button><button className="auto"><b>ϟ Auto Pilot</b><small>Unavailable until limits are set</small></button></div>
      <button className="circle" aria-label="Notifications">♟</button><button className="circle owner" aria-label="Owner">●</button>
    </header>

    <section className="hero card">
      <div className="start"><div className="title"><i>ϟ</i><span><h1>Start the AI Web Company</h1><p>Let the AI find opportunities, design, build, deploy and grow websites for you.</p></span></div>{data.available?<StartControl/>:<button disabled>Runtime unavailable<small>Start local services first</small></button>}</div>
      <div className="journey find"><i>⌕</i><b>Find Opportunities</b><p>AI searches permitted public sources for evidence-backed ideas.</p></div>
      <div className="journey build"><i>‹/›</i><b>Build &amp; Launch</b><p>AI designs and develops only after your approval.</p></div>
      <div className="journey grow"><i>↗</i><b>Rank &amp; Grow</b><p>AI improves projects using genuine performance data.</p></div>
      <div className="kpis">{kpis.map(([icon,value,label,sub])=><article key={label}><i>{icon}</i><span><strong>{value}</strong><b>{label}</b><small>{sub}</small></span></article>)}</div>
    </section>

    <section className="market card" id="market-studies">
      <div className="head"><div><h2>Market Validation</h2><p>Compare evidence, uncertainty and product hypotheses before selecting what to build.</p></div><em>● {data.studies[0]?.status ?? 'No study yet'}</em></div>
      {data.available&&<MarketStudyControl/>}
      {data.studies[0]?<MarketStudyView study={data.studies[0]}/>:<div className="noStudy"><b>No Market Study has been created.</b><span>Create one above. The system will preserve unavailable metrics as UNKNOWN—not estimate them.</span></div>}
    </section>

    <section className="team card"><div className="head"><h2>AI Team <span>(Your Virtual Company)</span></h2><em>● {data.available?'Runtime connected':'Runtime unavailable'}</em><button>View Team Details ›</button></div><div className="flow">{agents.map(([num,name,desc,color],i)=><div className="agentWrap" key={name}><article className={`agent ${color}`}><div><i>{num}</i><b>{name}</b></div><span><i>○</i><em>{name==='Researcher'&&active?active.state:'Unavailable'}</em></span><p>{desc}</p></article>{i<agents.length-1&&<b className="arrow">›</b>}</div>)}</div></section>

    <div className="grid">
      <section className="card current"><div className="head"><h2>Current Activity</h2><em className="paused">○ {active?.state ?? 'Not started'}</em></div><div className="empty"><i>⌕</i><h3>{active?'Latest persisted workflow':'No workflow is running'}</h3><p>{active?`Run ${active.id.slice(0,8)} is ${active.state}. No opportunity is claimed until evidence is persisted.`:'Real agent events appear here after a permitted research source is connected.'}</p><div className="steps"><span><b>Database</b><small>{data.health?.database ?? 'Unavailable'}</small></span><span><b>Temporal</b><small>{data.health?.temporal ?? 'Unavailable'}</small></span><span><b>Research provider</b><small>{data.health?.researchProvider ?? 'Unavailable'}</small></span><span><b>Paid budget</b><small>$0</small></span></div></div></section>
      <section className="card portfolio"><div className="head"><h2>Opportunity Candidates</h2><button>View All ›</button></div>{data.opportunities.length?data.opportunities.slice(0,3).map(item=><div className="candidate" key={item.id}><span><b>{item.title}</b><small>{item.rationale}</small></span><em>{item.scorecard.total ?? '—'}/100</em><a href={item.evidence[0]?.sourceUrl} target="_blank" rel="noreferrer">Evidence ↗</a><CandidateActions approvalId={item.approvalId} opportunityId={item.id}/></div>):<div className="noProject"><i>□</i><span><b>No opportunities yet</b><small>A real research run must store attributed evidence first.</small></span></div>}<Provider name="Research source" detail="Stack Exchange public API; public Q&A problem signal only" state={data.health?.researchProvider ?? 'Unavailable'} off={data.health?.researchProvider!=='available'}/></section>
      <section className="card recent"><div className="head"><h2>Recent Activity</h2><button>View All Activity ›</button></div>{data.activity.events.length?data.activity.events.slice(0,4).map(event=><div className="event" key={event.id}><i>✓</i><span><b>{event.eventType}</b><small>{event.payload.reason ?? `Workflow ${event.aggregateId?.slice(0,8) ?? ''}`}</small></span><time>{new Date(event.occurredAt).toLocaleString('en-GB',{timeZone:'Asia/Karachi'})}</time></div>):<div className="event muted"><i>○</i><span><b>No runtime events yet</b><small>This feed never displays simulated agent activity</small></span></div>}</section>
      <section className="card performance"><div className="head"><h2>SEO &amp; Performance <span>(All Websites)</span></h2><div className="range"><b>7D</b><b className="on">30D</b><b>90D</b></div></div><div className="perf"><Metric value="—" label="Total Clicks" detail="Search Console not connected"/><Metric value="—" label="Impressions" detail="No measured data"/><Metric value="—" label="Average CTR" detail={glossary.ctr}/><Metric value="0" label="Keywords Ranking" detail="No live websites"/></div></section>
    </div>
  </main>
</div>}

function Provider({name,detail,state,off=false}:{name:string;detail:string;state:string;off?:boolean}){return <div className="provider"><span><b>{name}</b><small>{detail}</small></span><em className={off?'off':''}>{state}</em></div>}
function Metric({value,label,detail}:{value:string;label:string;detail:string}){return <div><b>{value}</b><small>{label}</small><span>{detail}</span></div>}

function MarketStudyView({study}:{study:MarketStudy}) {
  const dimensions=['audience','search_surfaces','geography_language','serp_weakness','product_gap','traffic_potential','build_cost','defensibility'];
  return <div className="studyView">
    <div className="studyMeta"><span><b>Study brief</b><small>{study.brief}</small></span><span><b>Limits</b><small>{study.sourcePolicy.replaceAll('_',' ')} · {study.requestLimit} request · {study.timeLimitSeconds}s · ${study.paidBudgetCents/100}</small></span><span><b>Workflow</b><small>{study.workflowState}</small></span></div>
    {study.opportunities.length?<div className="comparison" role="region" aria-label="Opportunity comparison" tabIndex={0}>
      <table><thead><tr><th>Validation dimension</th>{study.opportunities.map(item=><th key={item.id}><b>{item.title}</b><span className={`recommendation ${item.recommendation}`}>{item.recommendation.replace('_',' ')}</span><small>{item.scorecard.total}/100 · {Math.round(item.scorecard.evidenceCoverage*100)}% evidence coverage</small></th>)}</tr></thead>
      <tbody>{dimensions.map(dimension=><tr key={dimension}><th>{dimension.replaceAll('_',' ')}<small>{termHelp(dimension)}</small></th>{study.opportunities.map(item=>{const finding=item.findings.find(entry=>entry.dimension===dimension);return <td key={item.id}><span className={`claim ${finding?.classification??'unknown'}`}>{finding?.classification??'unknown'}</span><p>{finding?.claim??'No permitted evidence captured.'}</p></td>})}</tr>)}</tbody></table>
    </div>:<div className="noStudy"><b>Research is {study.status}.</b><span>Evidence-backed candidates will appear here only after the worker persists them.</span></div>}
    {study.opportunities.map(item=><details className="candidateDetail" key={item.id}><summary><b>{item.title}</b><span>{item.recommendation.replace('_',' ')} · {item.unknowns.length} unknown dimensions</span></summary><div><p><b>Problem:</b> {item.problem}</p><p><b>Audience:</b> {item.audience}</p><p><b>Search hypothesis:</b> {item.searchDemandHypothesis}</p><p><b>Product:</b> {item.productTypeHypothesis}</p><p><b>Monetization:</b> {item.monetizationHypothesis}</p><p><b>Traffic:</b> {item.trafficPotential}</p><p><b>Build:</b> {item.buildComplexity}</p><p><b>Defensibility:</b> {item.defensibility}</p><p><b>Risks:</b> {item.risks.join(' · ')}</p><p><b>Evidence:</b> {item.evidence.map((entry,index)=><span key={entry.id}>{index>0?' · ':''}<a href={entry.sourceUrl} target="_blank" rel="noreferrer">Source {index+1} ↗</a></span>)}</p></div></details>)}
  </div>;
}

function termHelp(term:string){return ({audience:'Who has the problem.',search_surfaces:'Where people may discover it.',geography_language:'Markets represented by evidence.',serp_weakness:'Whether current search results leave a gap.',product_gap:'What existing solutions may not solve.',traffic_potential:'Evidence of possible reach—not a guarantee.',build_cost:'Relative implementation effort.',defensibility:'Why a product may remain valuable versus copies.'} as Record<string,string>)[term]}
