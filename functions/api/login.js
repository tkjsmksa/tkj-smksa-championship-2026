import {json,makeSession,sessionCookie} from "./_auth.js";
export async function onRequestPost({request,env}){
 if(!env.ADMIN_PASSWORD)return json({error:"ADMIN_PASSWORD belum diset."},500);
 try{
  const b=await request.json();
  if(String(b.password||"")!==env.ADMIN_PASSWORD)return json({error:"Password salah."},401);
  const token=await makeSession(env.ADMIN_PASSWORD);
  return json({ok:true},200,{"set-cookie":sessionCookie(token)});
 }catch(e){return json({error:e.message},400)}
}
