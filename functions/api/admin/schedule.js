import {json,isAdmin,sameOrigin} from "../_auth.js";

const STAGE="Group", STATUS="Scheduled";
function parseDate(s){
  const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s||""));
  if(!m)return null;
  const d=new Date(Date.UTC(Number(m[1]),Number(m[2])-1,Number(m[3])));
  if(d.getUTCFullYear()!==Number(m[1])||d.getUTCMonth()!==Number(m[2])-1||d.getUTCDate()!==Number(m[3]))return null;
  return d;
}
function dateStr(d){return d.toISOString().slice(0,10)}
function addDays(d,n){const x=new Date(d);x.setUTCDate(x.getUTCDate()+n);return x}
function key(a,b){a=Number(a);b=Number(b);return a<b?a+":"+b:b+":"+a}
function roundRobin(ids){
  const arr=ids.slice();
  if(arr.length<2)return [];
  if(arr.length%2)arr.push(null);
  const n=arr.length,rounds=[];
  for(let r=0;r<n-1;r++){
    const pairs=[];
    for(let i=0;i<n/2;i++){
      const a=arr[i],b=arr[n-1-i];
      if(a!==null&&b!==null)pairs.push({a,b,round:r+1});
    }
    rounds.push(pairs);
    arr.splice(1,0,arr.pop());
  }
  return rounds;
}
function buildPairs(groups){
  const out=[];
  for(const gr of groups){
    for(const round of roundRobin(gr.teamIds))
      for(const p of round)out.push({group_id:gr.id,a:p.a,b:p.b,round:p.round});
  }
  return out;
}
function firstWeekday(start,weekday){
  const d=new Date(start);
  while(d.getUTCDay()!==weekday)d.setUTCDate(d.getUTCDate()+1);
  return d;
}

export async function onRequestPost({request,env}){
  if(!await isAdmin(request,env)||!sameOrigin(request))return json({error:"Unauthorized"},401);
  try{
    const b=await request.json();
    const gameId=Number(b.game_id)||0;
    const start=parseDate(b.start_date);
    const weeks=Math.min(52,Math.max(1,Number(b.weeks)||1));
    const perWeek=Math.min(8,Math.max(1,Number(b.matches_per_week)||2));
    const weekday=Number(b.weekday);
    const venue=String(b.venue||"").trim();
    const times=Array.isArray(b.times)?b.times.map(x=>String(x||"").trim()).filter(Boolean):[];
    function normalizeSkipDate(s){
      const m=/^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(s||"").trim());
      if(!m)return null;
      const normalized=m[1]+"-"+m[2].padStart(2,"0")+"-"+m[3].padStart(2,"0");
      const d=parseDate(normalized);
      return d?dateStr(d):null;
    }
    const skip=new Set(
      (Array.isArray(b.skip_dates)?b.skip_dates:[])
        .map(normalizeSkipDate)
        .filter(Boolean)
    );
    if(!gameId)return json({error:"Game tidak valid."},400);
    if(!start)return json({error:"Tanggal mulai tidak valid."},400);
    if(!Number.isInteger(weekday)||weekday<0||weekday>6)return json({error:"Hari tidak valid."},400);
    if(times.length<perWeek)return json({error:"Jam pertandingan belum lengkap."},400);
    if(!times.every(t=>/^([01]\d|2[0-3]):[0-5]\d$/.test(t)))return json({error:"Format jam harus HH:MM."},400);

    const [gameQ,groupQ,teamQ,matchQ]=await Promise.all([
      env.DB.prepare("SELECT id,name FROM games WHERE id=? AND active=1").bind(gameId).all(),
      env.DB.prepare("SELECT id,name,display_order FROM groups_ WHERE game_id=? ORDER BY display_order,id").bind(gameId).all(),
      env.DB.prepare("SELECT id,group_id,name FROM teams WHERE game_id=? AND active=1 ORDER BY group_id,id").bind(gameId).all(),
      env.DB.prepare("SELECT id,group_id,team_a_id,team_b_id,date,time,status,stage FROM matches WHERE game_id=? ORDER BY date,time,id").bind(gameId).all()
    ]);
    if(!(gameQ.results||[]).length)return json({error:"Game tidak ditemukan."},404);

    const groups=groupQ.results||[];
    const teams=teamQ.results||[];
    const byGroup=new Map(groups.map(g=>[Number(g.id),[]]));
    for(const t of teams){
      if(!byGroup.has(Number(t.group_id)))return json({error:"Tim "+t.name+" belum memiliki grup."},400);
      byGroup.get(Number(t.group_id)).push(Number(t.id));
    }

    const existing=matchQ.results||[];
    const existingPairs=new Set();
    for(const m of existing){
      if(m.stage===STAGE&&m.team_a_id&&m.team_b_id)
        existingPairs.add(Number(m.group_id)+":"+key(m.team_a_id,m.team_b_id));
    }

    const replace=Boolean(b.replace_scheduled);
    const deleteRows=replace?existing.filter(m=>m.stage===STAGE&&m.status===STATUS):[];
    for(const m of deleteRows){
      if(m.team_a_id&&m.team_b_id)
        existingPairs.delete(Number(m.group_id)+":"+key(m.team_a_id,m.team_b_id));
    }

    const groupsData=groups.map(g=>({id:Number(g.id),teamIds:byGroup.get(Number(g.id))||[]}));
    const pending=buildPairs(groupsData)
      .filter(p=>!existingPairs.has(p.group_id+":"+key(p.a,p.b)))
      .sort((a,b)=>a.round-b.round||a.group_id-b.group_id||a.a-b.a||a.b-b.b);

    const created=[];
    let cursor=firstWeekday(start,weekday);
    let weekIndex=0;
    let matchNo=0;
    while(weekIndex<weeks&&created.length<pending.length){
      const ds=dateStr(cursor);
      if(!skip.has(ds)){
        const count=Math.min(perWeek,pending.length-created.length);
        for(let i=0;i<count;i++){
          const p=pending[created.length];
          matchNo++;
          created.push({
            game_id:gameId,group_id:p.group_id,stage:STAGE,round_name:"Round "+p.round,
            match_no:matchNo,date:ds,time:times[i],venue,
            team_a_id:p.a,team_b_id:p.b,status:STATUS,notes:""
          });
        }
        weekIndex++;
      }
      cursor=addDays(cursor,7);
    }

    const remaining=pending.length-created.length;
    if(!deleteRows.length&&!created.length)return json({ok:true,created:0,remaining,deleted:0});

    const statements=[];
    for(const m of deleteRows)statements.push(env.DB.prepare("DELETE FROM matches WHERE id=?").bind(Number(m.id)));
    for(const m of created)statements.push(env.DB.prepare("INSERT INTO matches(game_id,group_id,stage,round_name,match_no,date,time,venue,team_a_id,team_b_id,status,notes) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)").bind(m.game_id,m.group_id,m.stage,m.round_name,m.match_no,m.date,m.time,m.venue,m.team_a_id,m.team_b_id,m.status,m.notes));
    statements.push(env.DB.prepare("INSERT INTO admin_audit(action,target,details) VALUES('UPDATE','matches',?)").bind("generated schedule game "+gameId+": "+created.length+" created, "+deleteRows.length+" replaced"));
    await env.DB.batch(statements);
    return json({ok:true,created:created.length,remaining,deleted:deleteRows.length});
  }catch(e){
    return json({error:e.message||"Gagal membuat jadwal."},500);
  }
}
