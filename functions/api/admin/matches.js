import {json,isAdmin,sameOrigin} from "../_auth.js";
const sports=["Mobile Legends","PES"],stages=["Group","Semifinal","Final","Third Place","Exhibition"],statuses=["Scheduled","Live","Finished","Postponed","Cancelled"];
const num=v=>(v===null||v===undefined||v==="")?null:Number(v);
export async function onRequestPost({request,env}){
 if(!await isAdmin(request,env)||!sameOrigin(request))return json({error:"Unauthorized"},401);
 const b=await request.json(),a=b.action;
 try{
  if(a==="delete"){await env.DB.prepare("DELETE FROM matches WHERE id=?").bind(Number(b.id)).run();return json({ok:true})}
  if(a!=="save")return json({error:"Action tidak dikenal."},400);
  const m=b.match||{},id=Number(m.id)||0;
  if(!sports.includes(m.sport)||!stages.includes(m.stage)||!statuses.includes(m.status))return json({error:"Sport/stage/status tidak valid."},400);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(m.date||""))return json({error:"Tanggal harus YYYY-MM-DD."},400);
  const vals=[m.sport,m.stage,String(m.group_name||""),String(m.round_name||""),Number(m.match_no)||0,m.date,String(m.time||"15:00"),String(m.venue||""),m.team_a_id?Number(m.team_a_id):null,m.team_b_id?Number(m.team_b_id):null,num(m.score_a),num(m.score_b),m.status,String(m.notes||"")];
  if(id)await env.DB.prepare(`UPDATE matches SET sport=?,stage=?,group_name=?,round_name=?,match_no=?,date=?,time=?,venue=?,team_a_id=?,team_b_id=?,score_a=?,score_b=?,status=?,notes=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(...vals,id).run();
  else await env.DB.prepare(`INSERT INTO matches(sport,stage,group_name,round_name,match_no,date,time,venue,team_a_id,team_b_id,score_a,score_b,status,notes) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(...vals).run();
  return json({ok:true});
 }catch(e){return json({error:e.message},500)}
}
