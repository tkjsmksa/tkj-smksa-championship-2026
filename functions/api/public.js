import {json} from "./_auth.js";
export async function onRequestGet({env}){
 try{
  const [s,t,m]=await Promise.all([
   env.DB.prepare("SELECT key,value FROM settings").all(),
   env.DB.prepare("SELECT id,name,short_name,group_name,logo_url,active FROM teams WHERE active=1 ORDER BY group_name,name").all(),
   env.DB.prepare(`SELECT m.*,a.name team_a_name,a.short_name team_a_short,a.logo_url team_a_logo,
                   b.name team_b_name,b.short_name team_b_short,b.logo_url team_b_logo
                   FROM matches m LEFT JOIN teams a ON a.id=m.team_a_id
                   LEFT JOIN teams b ON b.id=m.team_b_id
                   ORDER BY m.date,m.time,m.id`).all()
  ]);
  const settings={};for(const r of s.results||[])settings[r.key]=r.value;
  return json({settings,teams:t.results||[],matches:m.results||[],server_time:new Date().toISOString()});
 }catch(e){return json({error:e.message},500)}
}
