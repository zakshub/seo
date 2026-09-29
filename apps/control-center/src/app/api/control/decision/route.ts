const apiBase=process.env.API_INTERNAL_URL ?? 'http://127.0.0.1:4000/api';
export async function POST(request:Request) {
  const token=process.env.LOCAL_OWNER_TOKEN; if(!token)return Response.json({message:'Local owner session is not configured.'},{status:503});
  const body=await request.json() as {approvalId?:string;opportunityId?:string;decision?:string};
  if(!body.approvalId)return Response.json({message:'Approval ID is required.'},{status:400});
  const response=await fetch(`${apiBase}/approvals/${body.approvalId}/decision`,{method:'POST',headers:{'content-type':'application/json','x-local-owner-token':token},body:JSON.stringify(body)});
  return Response.json(await response.json().catch(()=>({message:'API response unavailable'})),{status:response.status});
}
