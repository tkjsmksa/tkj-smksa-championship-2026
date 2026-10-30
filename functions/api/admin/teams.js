import {json,isAdmin,sameOrigin} from "../_auth.js";
export async function onRequestPost({request,env}){
 if(!await isAdmin(request,env)||!sameOrigin(request))return json({error:"Unauthorized"},401);
 try{
  const b=await request.json();
  if(b.action==="delete"){
   const id=Number(b.id)||0;
   if(!id)return json({error:"ID tim tidak valid."},400);
   const q=await env.DB.prepare("SELECT id FROM teams WHERE id=?").bind(id).first();
   if(!q)return json({error:"Tim tidak ditemukan."},404);
   await env.DB.prepare("DELETE FROM teams WHERE id=?").bind(id).run();
   await env.DB.prepare("INSERT INTO admin_audit(action,target,details) VALUES('DELETE','team',?)").bind("deleted team "+id).run();
   return json({ok:true});
  }
  const teams=b.teams||[];
  if(!Array.isArray(teams)||teams.length>0&&teams.length>100)return json({error:"Jumlah tim tidak valid."},400);
  for(const t of teams){
   const id=Number(t.id)||0,name=String(t.name||"").trim();
   if(!Number(t.game_id)||!name)return json({error:"Game dan nama tim wajib diisi."},400);
   if(id)await env.DB.prepare("UPDATE teams SET game_id=?,group_id=?,name=?,short_name=?,logo_url=?,institution=?,captain=?,participant_info=?,active=? WHERE id=?").bind(Number(t.game_id),t.group_id?Number(t.group_id):null,name,String(t.short_name||""),String(t.logo_url||""),String(t.institution||""),String(t.captain||""),String(t.participant_info||""),t.active===false?0:1,id).run();
   else await env.DB.prepare("INSERT INTO teams(game_id,group_id,name,short_name,logo_url,institution,captain,participant_info,active) VALUES(?,?,?,?,?,?,?,?,?)").bind(Number(t.game_id),t.group_id?Number(t.group_id):null,name,String(t.short_name||""),String(t.logo_url||""),String(t.institution||""),String(t.captain||""),String(t.participant_info||""),t.active===false?0:1).run();
  }
  return json({ok:true});
 }catch(e){return json({error:e.message},500)}
}