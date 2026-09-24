const COOKIE="tkj_admin_session", MAX_AGE=28800;
function b64u(s){return btoa(s).replaceAll("+","-").replaceAll("/","_").replaceAll("=","")}
async function sign(secret,msg){
 const k=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 return b64u(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign("HMAC",k,new TextEncoder().encode(msg)))));
}
export async function makeSession(secret){const exp=Math.floor(Date.now()/1000)+MAX_AGE;const body=String(exp);return b64u(body)+"."+await sign(secret,body)}
export async function isAdmin(request,env){
 const c=request.headers.get("Cookie")||"",m=c.match(new RegExp(COOKIE+"=([^;]+)"));if(!m||!env.ADMIN_PASSWORD)return false;
 const p=m[1].split(".");if(p.length!==2)return false;
 let body;try{body=atob(p[0].replaceAll("-","+").replaceAll("_","/"));}catch{return false}
 if(Number(body)<Math.floor(Date.now()/1000))return false;
 return (await sign(env.ADMIN_PASSWORD,body))===p[1];
}
export function json(data,status=200,extra={}){return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8",...extra}})}
export function sameOrigin(req){const o=req.headers.get("Origin");return !o||o===new URL(req.url).origin}
export const sessionCookie=t=>`${COOKIE}=${t}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`;
export const clearCookie=()=>`${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
