'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation.js';

export function StartControl() {
  const router=useRouter(); const [state,setState]=useState<'idle'|'working'|'done'|'error'>('idle');
  async function start() { setState('working'); const response=await fetch('/api/control/start',{method:'POST'}); setState(response.ok?'done':'error'); router.refresh(); }
  return <button onClick={start} disabled={state==='working'}>▶ &nbsp; {state==='working'?'Starting…':'Start Now'}<small>{state==='error'?'Could not start—check System Health':'Run genuine public-source opportunity research'}</small></button>;
}

export function CandidateActions({approvalId,opportunityId}:{approvalId?:string|undefined;opportunityId:string}) {
  const router=useRouter(); const [busy,setBusy]=useState(false); const [message,setMessage]=useState('');
  async function decide(decision:'approve'|'reject'|'request_changes') { if(!approvalId)return; setBusy(true); setMessage(''); const response=await fetch('/api/control/decision',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({approvalId,opportunityId,decision})}); const body=await response.json().catch(()=>({message:'Request failed'})); setMessage(response.ok?(decision==='approve'?'Project created':'Decision saved'):(body.message??'Request failed')); setBusy(false); router.refresh(); }
  if(!approvalId)return <small>Decision already recorded</small>;
  return <div className="candidateActions"><button disabled={busy} onClick={()=>decide('approve')}>Approve</button><button disabled={busy} onClick={()=>decide('reject')}>Reject</button><button disabled={busy} onClick={()=>decide('request_changes')}>Request changes</button>{message&&<small>{message}</small>}</div>;
}
