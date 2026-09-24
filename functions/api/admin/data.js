import {json,isAdmin} from "../_auth.js";
export async function onRequestGet({request,env}){
 if(!await isAdmin(request,env))return json({error:"Unauthorized"},401);
 const [s,t,m]=await Promise.all([
  env.DB.prepare("SELECT key,value FROM settings ORDER BY key").all(),
  env.DB.prepare("SELECT * FROM teams ORDER BY group_name,name").all(),
  env.DB.prepare("SELECT * FROM matches ORDER BY date,time,id").all()
 ]);
 const settings={};for(const r of s.results||[])settings[r.key]=r.value;
 return json({settings,teams:t.results||[],matches:m.results||[]});
}
