import {json,isAdmin,sameOrigin} from "../_auth.js";

export async function onRequestGet({request,env}){
  if(!await isAdmin(request,env)){
    return json({error:"Unauthorized"},401);
  }

  const [s,g,gr,t,m,a]=await Promise.all([
    env.DB.prepare("SELECT key,value FROM settings ORDER BY key").all(),
    env.DB.prepare("SELECT * FROM games ORDER BY display_order,name").all(),
    env.DB.prepare("SELECT * FROM groups_ ORDER BY game_id,display_order,id").all(),
    env.DB.prepare(`
      SELECT t.*,gr.name group_name,g.name game_name
      FROM teams t
      JOIN games g ON g.id=t.game_id
      LEFT JOIN groups_ gr ON gr.id=t.group_id
      ORDER BY t.game_id,gr.display_order,t.name
    `).all(),
    env.DB.prepare("SELECT * FROM matches ORDER BY date,time,id").all(),
    env.DB.prepare("SELECT * FROM articles ORDER BY id DESC").all()
  ]);
  const settings={};
  for(const r of s.results||[])settings[r.key]=r.value;
  return json({settings,games:g.results||[],groups:gr.results||[],teams:t.results||[],matches:m.results||[],articles:a.results||[]});
}

export async function onRequestPost({request,env}){
  if(!await isAdmin(request,env)||!sameOrigin(request))return json({error:"Unauthorized"},401);
  try{
    const b=await request.json(),a=b.action;
    if(a==="delete"){
      await env.DB.prepare("DELETE FROM articles WHERE id=?").bind(Number(b.id)).run();
      return json({ok:true});
    }
    if(a!=="save")return json({error:"Action tidak dikenal."},400);
    const x=b.article||{},id=Number(x.id)||0,title=String(x.title||"").trim();
    if(!title)return json({error:"Judul artikel wajib diisi."},400);
    const excerpt=String(x.excerpt||""),content=String(x.content||""),image=String(x.image_url||""),published=x.published===false?0:1;
    if(id){
      await env.DB.prepare("UPDATE articles SET title=?,excerpt=?,content=?,image_url=?,published=?,published_at=CASE WHEN ?=1 AND published_at IS NULL THEN CURRENT_TIMESTAMP WHEN ?=0 THEN NULL ELSE published_at END,updated_at=CURRENT_TIMESTAMP WHERE id=?")
        .bind(title,excerpt,content,image,published,published,published,id).run();
    }else{
      await env.DB.prepare("INSERT INTO articles(title,excerpt,content,image_url,published,published_at) VALUES(?,?,?,?,?,CASE WHEN ?=1 THEN CURRENT_TIMESTAMP ELSE NULL END)")
        .bind(title,excerpt,content,image,published,published).run();
    }
    await env.DB.prepare("INSERT INTO admin_audit(action,target,details) VALUES('UPDATE','articles',?)").bind(id?("article "+id+" updated"):"article created").run();
    return json({ok:true});
  }catch(e){return json({error:e.message},500)}
}