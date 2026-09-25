import {json,isAdmin,sameOrigin} from "../_auth.js";
function slugify(s){return String(s||"").trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")||"game"}
const num=v=>Number.isFinite(Number(v))?Number(v):0;
export async function onRequestPost({request,env}){
  if(!await isAdmin(request,env)||!sameOrigin(request))return json({error:"Unauthorized"},401);
  try{
    const b=await request.json(),a=b.action,g=b.game||{},id=Number(g.id)||0;
    if(a==="delete"){
      const gid=Number(b.id);
      if(!gid)return json({error:"ID game tidak valid."},400);
      await env.DB.prepare("UPDATE games SET active=0 WHERE id=?").bind(gid).run();
      await env.DB.prepare("INSERT INTO admin_audit(action,target,details) VALUES('UPDATE','game','game deactivated')").run();
      return json({ok:true});
    }
    if(a!=="save")return json({error:"Action tidak dikenal."},400);
    const name=String(g.name||"").trim();
    if(!name)return json({error:"Nama game wajib diisi."},400);
    let slug=String(g.slug||"").trim()||slugify(name);
    const vals=[name,String(g.short_name||""),slug,String(g.logo_url||""),num(g.display_order),String(g.rules_text||""),String(g.format_text||""),num(g.win_points??3),num(g.draw_points??1),num(g.loss_points??0)];
    if(vals[8]<0)return json({error:"Poin kalah tidak boleh negatif."},400);
    if(id){
      await env.DB.prepare("UPDATE games SET name=?,short_name=?,slug=?,logo_url=?,display_order=?,rules_text=?,format_text=?,win_points=?,draw_points=?,loss_points=?,active=1 WHERE id=?").bind(...vals,id).run();
    }else{
      await env.DB.prepare("INSERT INTO games(name,short_name,slug,logo_url,display_order,rules_text,format_text,win_points,draw_points,loss_points) VALUES(?,?,?,?,?,?,?,?,?,?)").bind(...vals).run();
    }
    await env.DB.prepare("INSERT INTO admin_audit(action,target,details) VALUES('UPDATE','game','game saved')").run();
    return json({ok:true});
  }catch(e){return json({error:e.message},500)}
}