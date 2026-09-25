import {json,isAdmin,sameOrigin} from "../_auth.js";
export async function onRequestPost({request,env}){
  if(!await isAdmin(request,env)||!sameOrigin(request))return json({error:"Unauthorized"},401);
  try{
    const b=await request.json(),a=b.action,g=b.group||{},id=Number(g.id)||0;
    if(a==="delete"){
      if(!id)return json({error:"ID grup tidak valid."},400);
      await env.DB.prepare("DELETE FROM groups_ WHERE id=?").bind(id).run();
      await env.DB.prepare("INSERT INTO admin_audit(action,target,details) VALUES('DELETE','group','group deleted')").run();
      return json({ok:true});
    }
    if(a!=="save")return json({error:"Action tidak dikenal."},400);
    const gameId=Number(g.game_id)||0,name=String(g.name||"").trim();
    if(!gameId||!name)return json({error:"Game dan nama grup wajib diisi."},400);
    const vals=[gameId,name,Number(g.display_order)||0,Math.max(0,Number(g.advance_count)||0)];
    if(id)await env.DB.prepare("UPDATE groups_ SET game_id=?,name=?,display_order=?,advance_count=? WHERE id=?").bind(...vals,id).run();
    else await env.DB.prepare("INSERT INTO groups_(game_id,name,display_order,advance_count) VALUES(?,?,?,?)").bind(...vals).run();
    await env.DB.prepare("INSERT INTO admin_audit(action,target,details) VALUES('UPDATE','group','group saved')").run();
    return json({ok:true});
  }catch(e){return json({error:e.message},500)}
}