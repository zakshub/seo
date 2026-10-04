import { randomUUID } from 'node:crypto';
const apiBase=process.env.API_INTERNAL_URL ?? 'http://127.0.0.1:4000/api';
export async function POST(request:Request) {
  const token=process.env.LOCAL_OWNER_TOKEN;
  if(!token)return Response.json({message:'Local owner session is not configured.'},{status:503});
  const input=await request.json().catch(()=>({})) as {brief?:string};
  const response=await fetch(`${apiBase}/workflows/research`,{method:'POST',headers:{'content-type':'application/json','x-local-owner-token':token,'idempotency-key':randomUUID()},body:JSON.stringify({language:'en',market:'global',brief:input.brief})});
  return Response.json(await response.json().catch(()=>({message:'API response unavailable'})),{status:response.status});
}
