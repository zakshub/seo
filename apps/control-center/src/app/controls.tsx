'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation.js';

export function StartControl() {
  const router=useRouter(); const [state,setState]=useState<'idle'|'working'|'done'|'error'>('idle');
  async function start() { setState('working'); const response=await fetch('/api/control/start',{method:'POST',headers:{'content-type':'application/json'},body:'{}'}); setState(response.ok?'done':'error'); router.refresh(); }
  return <button onClick={start} disabled={state==='working'}>▶ &nbsp; {state==='working'?'Starting…':'Start Now'}<small>{state==='error'?'Could not start—check System Health':'Run genuine public-source opportunity research'}</small></button>;
}

export function MarketStudyControl() {
  const router=useRouter();
  const [brief,setBrief]=useState('Find realistic organic-search opportunities for a public SEO web property that could attract meaningful traffic.');
  const [state,setState]=useState<'idle'|'working'|'done'|'error'>('idle');
  async function create() {
    setState('working');
    const response=await fetch('/api/control/start',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({brief})});
    setState(response.ok?'done':'error');
    router.refresh();
  }
  return <div className="studyControl">
    <label htmlFor="study-brief">Research brief</label>
    <textarea id="study-brief" value={brief} maxLength={2000} onChange={event=>setBrief(event.target.value)} />
    <div><small>English + Urdu topic check · Pakistan context · official/public evidence · 5-request ceiling · 90-second limit · $0 paid budget</small><button onClick={create} disabled={state==='working'||brief.trim().length<10}>{state==='working'?'Researching…':'Create Market Study'}</button></div>
    {state==='error'&&<em>Study could not start. Check System Health and try again.</em>}
    {state==='done'&&<em>Study was persisted and dispatched. Refreshing evidence view…</em>}
  </div>;
}

export function CandidateActions({approvalId,opportunityId,phase2Ready=true}:{approvalId?:string|undefined;opportunityId:string;phase2Ready?:boolean}) {
  const router=useRouter(); const [busy,setBusy]=useState(false); const [message,setMessage]=useState('');
  async function decide(decision:'approve'|'reject'|'request_changes') { if(!approvalId)return; setBusy(true); setMessage(''); const response=await fetch('/api/control/decision',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({approvalId,opportunityId,decision})}); const body=await response.json().catch(()=>({message:'Request failed'})); setMessage(response.ok?(decision==='approve'?'Project created':'Decision saved'):(body.message??'Request failed')); setBusy(false); router.refresh(); }
  if(!approvalId)return <small>Decision already recorded</small>;
  return <div className="candidateActions"><button disabled={busy||!phase2Ready} title={phase2Ready?'Create the approved project':'Required market evidence is still UNKNOWN'} onClick={()=>decide('approve')}>{phase2Ready?'Approve':'Phase 2 blocked'}</button><button disabled={busy} onClick={()=>decide('reject')}>Reject</button><button disabled={busy} onClick={()=>decide('request_changes')}>Request changes</button>{!phase2Ready&&<small>More evidence is required before project creation.</small>}{message&&<small>{message}</small>}</div>;
}
