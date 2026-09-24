import {json,isAdmin,sameOrigin} from "../_auth.js";
const keys=["event_name","organizer","subtitle","location","status","primary_color","secondary_color","win_points","draw_points","loss_points","advance_per_group","public_refresh_seconds"];
export async function onRequestPost({request,env}){
 if(!await isAdmin(request,env)||!sameOrigin(request))return json({error:"Unauthorized"},401);
 try{
  const s=(await request.json()).settings||{};
  for(const k of keys)if(s[k]!==undefined){
   const v=String(s[k]).trim();
   if(["win_points","draw_points","loss_points","advance_per_group","public_refresh_seconds"].includes(k)&&!/^\d+$/.test(v))return json({error:`${k} harus angka.`},400);
   if(["primary_color","secondary_color"].includes(k)&&!/^#[0-9a-fA-F]{6}$/.test(v))return json({error:"Format warna harus #RRGGBB."},400);
   await env.DB.prepare("INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(k,v).run();
  }
  await env.DB.prepare("INSERT INTO admin_audit(action,target,details) VALUES('UPDATE','settings','settings updated')").run();
  return json({ok:true});
 }catch(e){return json({error:e.message},500)}
}
