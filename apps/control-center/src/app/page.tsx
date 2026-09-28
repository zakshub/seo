import { glossary } from '../control-center.js';

const nav = [
  ['⌂','Dashboard','Overview of everything'],['♙','AI Team','See what each agent does'],['♨','Opportunities','New website ideas'],['□','Projects','All websites (new & live)'],['↗','SEO Growth','Track and improve SEO'],['▥','Analytics','Traffic, revenue, keywords'],['➤','Deployments','Domains, server, status'],['＄','Finances','Costs and earnings'],['▣','Knowledge Base','What AI has learned'],['⚙','Settings','Control and limits']
] as const;
const agents = [
  ['1','Researcher','Finds niches, keywords and market opportunities.','blue'],['2','Strategist','Decides what to build and how to make money.','violet'],['3','Designer','Creates accessible designs in Figma.','pink'],['4','Reviewer','Checks intent, usability and readiness.','orange'],['5','Developer','Builds approved websites in GitHub.','cyan'],['6','QA & SEO','Tests the website and technical SEO.','teal'],['7','DevOps','Handles approved VPS deployments.','indigo'],['8','Growth SEO','Improves sites from real evidence.','green'],['9','Monetization','Tracks costs, revenue and opportunities.','gold']
] as const;
const kpis = [['◎','0','Live Websites','None deployed'],['♜','0','In Development','No active build'],['♧','0','Opportunities Found','No research run'],['↗','—','Organic Growth','Analytics unavailable'],['$','$0','Total Revenue','No recorded revenue']] as const;

export default function Dashboard(){return <div className="shell">
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
      <div className="start"><div className="title"><i>ϟ</i><span><h1>Start the AI Web Company</h1><p>Let the AI find opportunities, design, build, deploy and grow websites for you.</p></span></div><button disabled>▶ &nbsp; Start Now<small>Connect runtime infrastructure and a research source first</small></button></div>
      <div className="journey find"><i>⌕</i><b>Find Opportunities</b><p>AI searches permitted public sources for evidence-backed ideas.</p></div>
      <div className="journey build"><i>‹/›</i><b>Build &amp; Launch</b><p>AI designs and develops only after your approval.</p></div>
      <div className="journey grow"><i>↗</i><b>Rank &amp; Grow</b><p>AI improves projects using genuine performance data.</p></div>
      <div className="kpis">{kpis.map(([icon,value,label,sub])=><article key={label}><i>{icon}</i><span><strong>{value}</strong><b>{label}</b><small>{sub}</small></span></article>)}</div>
    </section>

    <section className="team card"><div className="head"><h2>AI Team <span>(Your Virtual Company)</span></h2><em>● Setup required</em><button>View Team Details ›</button></div><div className="flow">{agents.map(([num,name,desc,color],i)=><div className="agentWrap" key={name}><article className={`agent ${color}`}><div><i>{num}</i><b>{name}</b></div><span><i>○</i><em>Unavailable</em></span><p>{desc}</p></article>{i<agents.length-1&&<b className="arrow">›</b>}</div>)}</div></section>

    <div className="grid">
      <section className="card current"><div className="head"><h2>Current Activity</h2><em className="paused">○ Paused</em></div><div className="empty"><i>⌕</i><h3>No workflow is running</h3><p>Real agent events appear here after PostgreSQL, Temporal and a permitted research source are connected.</p><div className="steps"><span><b>Research</b><small>Not started</small></span><span><b>Strategy</b><small>Waiting</small></span><span><b>Design</b><small>Waiting for approval</small></span><span><b>Development</b><small>Waiting</small></span></div></div></section>
      <section className="card portfolio"><div className="head"><h2>My Websites <span>(Portfolio)</span></h2><button>View All ›</button></div><div className="noProject"><i>□</i><span><b>No projects yet</b><small>An approved opportunity will become your first project.</small></span></div><Provider name="GitHub" detail="Connected for source control" state="Available"/><Provider name="Figma" detail="Canonical workspace planned for Phase 4" state="Not configured" off/><Provider name="Deployment" detail="No VPS or domain connection" state="Unavailable" off/></section>
      <section className="card recent"><div className="head"><h2>Recent Activity</h2><button>View All Activity ›</button></div><div className="event"><i>✓</i><span><b>Repository foundation verified</b><small>Contracts, safety policy and Control Center build passed</small></span><time>Verified state</time></div><div className="event muted"><i>○</i><span><b>No runtime events yet</b><small>This feed never displays simulated agent activity</small></span></div></section>
      <section className="card performance"><div className="head"><h2>SEO &amp; Performance <span>(All Websites)</span></h2><div className="range"><b>7D</b><b className="on">30D</b><b>90D</b></div></div><div className="perf"><Metric value="—" label="Total Clicks" detail="Search Console not connected"/><Metric value="—" label="Impressions" detail="No measured data"/><Metric value="—" label="Average CTR" detail={glossary.ctr}/><Metric value="0" label="Keywords Ranking" detail="No live websites"/></div></section>
    </div>
  </main>
</div>}

function Provider({name,detail,state,off=false}:{name:string;detail:string;state:string;off?:boolean}){return <div className="provider"><span><b>{name}</b><small>{detail}</small></span><em className={off?'off':''}>{state}</em></div>}
function Metric({value,label,detail}:{value:string;label:string;detail:string}){return <div><b>{value}</b><small>{label}</small><span>{detail}</span></div>}
