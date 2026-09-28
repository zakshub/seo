import { glossary, navigation } from '../control-center.js';

const stages = [
  ['Opportunities discovered', '0'], ['Projects researching', '0'], ['Awaiting approval', '0'], ['Live websites', '0']
] as const;

export default function Dashboard() {
  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><span className="mark">V</span><div><strong>Venture OS</strong><small>Control Center</small></div></div>
      <nav aria-label="Primary navigation">{navigation.map((item, index) => <a className={index === 0 ? 'active' : ''} href="#" key={item}><span>{item.slice(0, 1)}</span>{item}</a>)}</nav>
      <div className="owner"><span>ZO</span><div><strong>Owner</strong><small>Local workspace</small></div></div>
    </aside>
    <main>
      <header><div><p className="eyebrow">AUTONOMOUS WEB VENTURE OPERATING SYSTEM</p><h1>Good morning. Your company is safely paused.</h1><p>Start becomes available after the workflow infrastructure and a permitted research source are connected.</p></div><button disabled title="PostgreSQL, Temporal, and a research source are unavailable">Start system</button></header>
      <section className="statusbar"><div><i></i><span><strong>Operating mode</strong> Manual</span></div><div><i className="amber"></i><span><strong>System status</strong> Setup required</span></div><div><span><strong>Active agents</strong> 0 of 10</span></div><div><span><strong>Paid-provider budget</strong> $0.00</span></div></section>
      <section className="metrics" aria-label="Portfolio summary">{stages.map(([label, value]) => <article key={label}><small>{label}</small><strong>{value}</strong><span>No recorded activity</span></article>)}</section>
      <div className="grid">
        <section className="panel activity"><div className="panelhead"><div><p className="eyebrow">LIVE OPERATIONS</p><h2>Agent activity</h2></div><span className="tag">Persisted events only</span></div><div className="empty"><div className="pulse">⌁</div><h3>No agents are running</h3><p>Activity will appear only when a real workflow creates persisted events. Nothing is simulated.</p></div></section>
        <section className="panel"><div className="panelhead"><div><p className="eyebrow">READINESS</p><h2>Before the first run</h2></div><span className="progress">1 / 4</span></div><ol className="checklist"><li className="done"><b>✓</b><span><strong>Repository foundation</strong><small>Contracts and safety policy verified</small></span></li><li><b>2</b><span><strong>Runtime infrastructure</strong><small>PostgreSQL, Redis and Temporal</small></span></li><li><b>3</b><span><strong>Owner authentication</strong><small>Local session setup</small></span></li><li><b>4</b><span><strong>Research source</strong><small>Permitted public evidence adapter</small></span></li></ol></section>
      </div>
      <section className="panel terminology"><div><p className="eyebrow">PLAIN ENGLISH</p><h2>Terms you will see</h2></div><dl><div><dt>Indexing</dt><dd>{glossary.indexing}</dd></div><div><dt>CTR</dt><dd>{glossary.ctr}</dd></div><div><dt>Canonical URL</dt><dd>{glossary.canonicalUrl}</dd></div></dl></section>
    </main>
  </div>;
}
