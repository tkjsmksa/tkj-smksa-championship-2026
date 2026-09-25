import {json} from "./_auth.js";

export async function onRequestGet({env}){
  try{
    const [s,g,gr,t,m,a]=await Promise.all([
      env.DB.prepare("SELECT key,value FROM settings").all(),

      env.DB.prepare(
        "SELECT * FROM games WHERE active=1 ORDER BY display_order,name"
      ).all(),

      env.DB.prepare(
        "SELECT * FROM groups_ ORDER BY game_id,display_order,id"
      ).all(),

      env.DB.prepare(
        "SELECT t.*,g.name game_name,g.short_name game_short,gr.name group_name FROM teams t JOIN games g ON g.id=t.game_id LEFT JOIN groups_ gr ON gr.id=t.group_id WHERE t.active=1 ORDER BY t.game_id,gr.display_order,t.name"
      ).all(),

      env.DB.prepare(`
        SELECT m.*,
          g.name game_name,
          gr.name group_name,
          a.name team_a_name,
          a.short_name team_a_short,
          a.logo_url team_a_logo,
          b.name team_b_name,
          b.short_name team_b_short,
          b.logo_url team_b_logo
        FROM matches m
        JOIN games g ON g.id=m.game_id
        LEFT JOIN groups_ gr ON gr.id=m.group_id
        LEFT JOIN teams a ON a.id=m.team_a_id
        LEFT JOIN teams b ON b.id=m.team_b_id
        ORDER BY m.date,m.time,m.id
      `).all(),

      env.DB.prepare(
        "SELECT * FROM articles WHERE published=1 ORDER BY COALESCE(published_at,created_at) DESC,id DESC LIMIT 12"
      ).all()
    ]);

    const settings={};
    for(const r of s.results||[]) settings[r.key]=r.value;

    return json({
      settings,
      games:g.results||[],
      groups:gr.results||[],
      teams:t.results||[],
      matches:m.results||[],
      articles:a.results||[],
      server_time:new Date().toISOString()
    });

  }catch(e){
    return json({error:e.message},500)
  }
}
