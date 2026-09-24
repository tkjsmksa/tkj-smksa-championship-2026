import {json,isAdmin,sameOrigin} from "../_auth.js";
export async function onRequestPost({request,env}){
 if(!await isAdmin(request,env)||!sameOrigin(request))return json({error:"Unauthorized"},401);
 const teams=(await request.json()).teams||[];
 if(!Array.isArray(teams)||teams.length<1||teams.length>100)return json({error:"Jumlah tim tidak valid."},400);
 const names=new Set();
 for(const t of teams){const n=String(t.name||"").trim();if(!n||!["A","B"].includes(t.group_name))return json({error:"Nama/grup tim tidak valid."},400);if(names.has(n.toLowerCase()))return json({error:"Nama tim duplikat."},400);names.add(n.toLowerCase())}
 try{
  const old=(await env.DB.prepare("SELECT id FROM teams ORDER BY id").all()).results||[];
  for(let i=0;i<teams.length;i++){
   const t=teams[i],id=old[i]?.id;
   const v=[String(t.name).trim(),String(t.short_name||"").trim(),t.group_name,String(t.logo_url||"").trim(),t.active===false?0:1];
   if(id)await env.DB.prepare("UPDATE teams SET name=?,short_name=?,group_name=?,logo_url=?,active=? WHERE id=?").bind(...v,id).run();
   else await env.DB.prepare("INSERT INTO teams(name,short_name,group_name,logo_url,active) VALUES(?,?,?,?,?)").bind(...v).run();
  }
  if(old.length>teams.length)for(const x of old.slice(teams.length))await env.DB.prepare("UPDATE teams SET active=0 WHERE id=?").bind(x.id).run();
  await env.DB.prepare("INSERT INTO admin_audit(action,target,details) VALUES('UPDATE','teams',?)").bind(`saved ${teams.length} teams`).run();
  return json({ok:true});
 }catch(e){return json({error:e.message},500)}
}
