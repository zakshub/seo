import { glossary } from '../control-center.js';

const nav = [
  ['⌂','Dashboard','Overview of everything'],['♙','AI Team','See what each agent does'],['♨','Opportunities','New website ideas'],['□','Projects','All websites (new & live)'],['↗','SEO Growth','Track and improve SEO'],['▥','Analytics','Traffic, revenue, keywords'],['➤','Deployments','Domains, server, status'],['＄','Finances','Costs and earnings'],['▣','Knowledge Base','What AI has learned'],['⚙','Settings','Control and limits']
] as const;
const agents = [
  ['1','Researcher','Finds niches, keywords and market opportunities.','blue'],['2','Strategist','Decides what to build and how to make money.','violet'],['3','Designer','Creates accessible designs in Figma.','pink'],['4','Reviewer','Checks intent, usability and readiness.','orange'],['5','Developer','Builds approved websites in GitHub.','cyan'],['6','QA & SEO','Tests the website and technical SEO.','teal'],['7','DevOps','Handles approved VPS deployments.','indigo'],['8','Growth SEO','Improves sites from real evidence.','green'],['9','Monetization','Tracks costs, revenue and opportunities.','gold']
] as const;
type Overview = { workflows: number; opportunities: number; projects: number; approvals: number };
type Health = { database: string; temporal: string; researchProvider: string; reason: string };
type Activity = { runs: Array<{ id:string; state:string; updatedAt:string }>; events: Array<{ id:string; eventType:string; aggregateId:string; payload:Record<string,string>; occurredAt:string }> };
type Opportunity = { id:string; title:string; lifecycle:string; rationale:string; scorecard:{total?:number}; limitations:string[]; evidence:Array<{sourceUrl:string;capturedAt:string;confidence:number}> };
const apiBase = process.env.API_INTERNAL_URL ?? 'http://127.0.0.1:4000/api';
async function runtime() {
  try {
    const [overview,health,activity,opportunities] = await Promise.all([
      fetch(`${apiBase}/overview`,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error();return r.json() as Promise<Overview>}),
      fetch(`${apiBase}/health`,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error();return r.json() as Promise<Health>}),
      fetch(`${apiBase}/activity`,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error();return r.json() as Promise<Activity>}),
      fetch(`${apiBase}/opportunities`,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error();return r.json() as Promise<Opportunity[]>})
    ]);
    return { overview,health,activity,opportunities,available:true as const };
  } catch { return { overview:{workflows:0,opportunities:0,projects:0,approvals:0},health:null,activity:{runs:[],events:[]},opportunities:[],available:false as const }; }
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
      <div className="start"><div className="title"><i>ϟ</i><span><h1>Start the AI Web Company</h1><p>Let the AI find opportunities, design, build, deploy and grow websites for you.</p></span></div><button disabled>▶ &nbsp; Start Now<small>{data.available?'Owner-facing start control is the next milestone':'Local API is unavailable'}</small></button></div>
      <div className="journey find"><i>⌕</i><b>Find Opportunities</b><p>AI searches permitted public sources for evidence-backed ideas.</p></div>
      <div className="journey build"><i>‹/›</i><b>Build &amp; Launch</b><p>AI designs and develops only after your approval.</p></div>
      <div className="journey grow"><i>↗</i><b>Rank &amp; Grow</b><p>AI improves projects using genuine performance data.</p></div>
      <div className="kpis">{kpis.map(([icon,value,label,sub])=><article key={label}><i>{icon}</i><span><strong>{value}</strong><b>{label}</b><small>{sub}</small></span></article>)}</div>
    </section>

    <section className="team card"><div className="head"><h2>AI Team <span>(Your Virtual Company)</span></h2><em>● {data.available?'Runtime connected':'Runtime unavailable'}</em><button>View Team Details ›</button></div><div className="flow">{agents.map(([num,name,desc,color],i)=><div className="agentWrap" key={name}><article className={`agent ${color}`}><div><i>{num}</i><b>{name}</b></div><span><i>○</i><em>{name==='Researcher'&&active?active.state:'Unavailable'}</em></span><p>{desc}</p></article>{i<agents.length-1&&<b className="arrow">›</b>}</div>)}</div></section>

    <div className="grid">
      <section className="card current"><div className="head"><h2>Current Activity</h2><em className="paused">○ {active?.state ?? 'Not started'}</em></div><div className="empty"><i>⌕</i><h3>{active?'Latest persisted workflow':'No workflow is running'}</h3><p>{active?`Run ${active.id.slice(0,8)} is ${active.state}. No opportunity is claimed until evidence is persisted.`:'Real agent events appear here after a permitted research source is connected.'}</p><div className="steps"><span><b>Database</b><small>{data.health?.database ?? 'Unavailable'}</small></span><span><b>Temporal</b><small>{data.health?.temporal ?? 'Unavailable'}</small></span><span><b>Research provider</b><small>{data.health?.researchProvider ?? 'Unavailable'}</small></span><span><b>Paid budget</b><small>$0</small></span></div></div></section>
      <section className="card portfolio"><div className="head"><h2>Opportunity Candidates</h2><button>View All ›</button></div>{data.opportunities.length?data.opportunities.slice(0,3).map(item=><div className="candidate" key={item.id}><span><b>{item.title}</b><small>{item.rationale}</small></span><em>{item.scorecard.total ?? '—'}/100</em><a href={item.evidence[0]?.sourceUrl} target="_blank" rel="noreferrer">Evidence ↗</a></div>):<div className="noProject"><i>□</i><span><b>No opportunities yet</b><small>A real research run must store attributed evidence first.</small></span></div>}<Provider name="Research source" detail="Stack Exchange public API; developer demand signal only" state={data.health?.researchProvider ?? 'Unavailable'} off={data.health?.researchProvider!=='available'}/></section>
      <section className="card recent"><div className="head"><h2>Recent Activity</h2><button>View All Activity ›</button></div>{data.activity.events.length?data.activity.events.slice(0,4).map(event=><div className="event" key={event.id}><i>✓</i><span><b>{event.eventType}</b><small>{event.payload.reason ?? `Workflow ${event.aggregateId?.slice(0,8) ?? ''}`}</small></span><time>{new Date(event.occurredAt).toLocaleString('en-GB',{timeZone:'Asia/Karachi'})}</time></div>):<div className="event muted"><i>○</i><span><b>No runtime events yet</b><small>This feed never displays simulated agent activity</small></span></div>}</section>
      <section className="card performance"><div className="head"><h2>SEO &amp; Performance <span>(All Websites)</span></h2><div className="range"><b>7D</b><b className="on">30D</b><b>90D</b></div></div><div className="perf"><Metric value="—" label="Total Clicks" detail="Search Console not connected"/><Metric value="—" label="Impressions" detail="No measured data"/><Metric value="—" label="Average CTR" detail={glossary.ctr}/><Metric value="0" label="Keywords Ranking" detail="No live websites"/></div></section>
    </div>
  </main>
</div>}

function Provider({name,detail,state,off=false}:{name:string;detail:string;state:string;off?:boolean}){return <div className="provider"><span><b>{name}</b><small>{detail}</small></span><em className={off?'off':''}>{state}</em></div>}
function Metric({value,label,detail}:{value:string;label:string;detail:string}){return <div><b>{value}</b><small>{label}</small><span>{detail}</span></div>}
