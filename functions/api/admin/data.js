import {json,isAdmin} from "../_auth.js";

export async function onRequestGet({request,env}){
  if(!await isAdmin(request,env)){
    return json({error:"Unauthorized"},401);
  }

  const [s,g,gr,t,m,a]=await Promise.all([
    env.DB.prepare("SELECT key,value FROM settings ORDER BY key").all(),

    env.DB.prepare(
      "SELECT * FROM games ORDER BY display_order,name"
    ).all(),

    env.DB.prepare(
      "SELECT * FROM groups_ ORDER BY game_id,display_order,id"
    ).all(),

    env.DB.prepare(`
      SELECT
        t.*,
        gr.name group_name,
        g.name game_name
      FROM teams t
      JOIN games g ON g.id=t.game_id
      LEFT JOIN groups_ gr ON gr.id=t.group_id
      ORDER BY t.game_id,gr.display_order,t.name
    `).all(),

    env.DB.prepare(
      "SELECT * FROM matches ORDER BY date,time,id"
    ).all(),

    env.DB.prepare(
      "SELECT * FROM articles ORDER BY id DESC"
    ).all()
  ]);

  const settings={};

  for(const r of s.results||[]){
    settings[r.key]=r.value;
  }

  return json({
    settings,
    games:g.results||[],
    groups:gr.results||[],
    teams:t.results||[],
    matches:m.results||[],
    articles:a.results||[]
  });
}
