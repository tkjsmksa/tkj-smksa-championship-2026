function esc(v=""){
  return String(v)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#39;");
}

export async function onRequestGet({request,env,params}){
  const id=Number(params?.id);
  if(!Number.isInteger(id)||id<1){
    return new Response("Artikel tidak ditemukan.",{status:404});
  }

  try{
    const article=await env.DB.prepare(
      "SELECT id,title,excerpt,content,image_url,published,published_at,created_at FROM articles WHERE id=? AND published=1 LIMIT 1"
    ).bind(id).first();

    if(!article){
      return new Response("Artikel tidak ditemukan.",{status:404});
    }

    const origin=new URL(request.url).origin;
    const articleUrl=origin+"/artikel/"+article.id;
    const image=article.image_url?String(article.image_url):"";
    const title=String(article.title||"TKJ SMKSA Championship 2026");
    const description=String(article.excerpt||article.content||"");
    const html=`<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} - TKJ SMKSA Championship 2026</title>
<meta name="description" content="${esc(description.slice(0,160))}">
<link rel="canonical" href="${esc(articleUrl)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="TKJ SMKSA Championship 2026">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description.slice(0,200))}">
<meta property="og:url" content="${esc(articleUrl)}">
${image?`<meta property="og:image" content="${esc(image)}">
<meta property="og:image:alt" content="${esc(title)}">`:""}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description.slice(0,200))}">
${image?`<meta name="twitter:image" content="${esc(image)}">`:""}
<meta http-equiv="refresh" content="0;url=/?artikel=${article.id}">
</head>
<body>
<p>Membuka artikel...</p>
<p><a href="/?artikel=${article.id}">Buka artikel</a></p>
</body>
</html>`;

    return new Response(html,{status:200,headers:{
      "content-type":"text/html; charset=utf-8",
      "Cache-Control":"public, max-age=60"
    }});
  }catch(e){
    return new Response("Terjadi kesalahan server.",{status:500});
  }
}