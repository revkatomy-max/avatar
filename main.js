// Roblox Avatar Renderer - Deno Deploy (halaman + proxy API Roblox + SEO)
const DEFAULT_OG_IMAGE = ''; // isi URL gambar 1200x630 (opsional) untuk preview link halaman utama
const SITE = 'Avatar Renderer';

const json = (o, s = 200, c = 'public, max-age=300') =>
  new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json;charset=utf-8', 'cache-control': c } });
const validName = (n) => /^[A-Za-z0-9_]{3,20}$/.test(n || '');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function getUser(name) {
  const r = await fetch('https://users.roblox.com/v1/usernames/users', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ usernames: [name], excludeBannedUsers: false }),
  });
  if (!r.ok) throw new Error('roblox');
  return ((await r.json()).data || [])[0] || null;
}

async function thumb(kind, id, size) {
  for (let i = 0; i < 6; i++) {
    const r = await fetch(`https://thumbnails.roblox.com/v1/users/${kind}?userIds=${id}&size=${size}&format=Png&isCircular=false`);
    const d = r.ok ? ((await r.json()).data || [])[0] : null;
    if (d && d.state === 'Completed') return d.imageUrl;
    await new Promise((x) => setTimeout(x, 500));
  }
  return null;
}

async function lookup(name) {
  const u = await getUser(name);
  if (!u) return null;
  const [full, bust, head] = await Promise.all([
    thumb('avatar', u.id, '720x720'),
    thumb('avatar-bust', u.id, '420x420'),
    thumb('avatar-headshot', u.id, '720x720'),
  ]);
  return { id: u.id, name: u.name, displayName: u.displayName, images: { full, bust, head } };
}

const HTML = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{{TITLE}}</title>
<meta name="description" content="{{DESC}}">
<meta name="keywords" content="render avatar roblox, avatar roblox hd, roblox avatar viewer, download avatar roblox, roblox skin render, roblox character">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="theme-color" content="#1b1640">
<link rel="canonical" href="{{CANON}}">
<link rel="alternate" hreflang="id" href="{{CANON}}">
<link rel="alternate" hreflang="x-default" href="{{CANON}}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE}">
<meta property="og:locale" content="id_ID">
<meta property="og:title" content="{{TITLE}}">
<meta property="og:description" content="{{DESC}}">
<meta property="og:url" content="{{CANON}}">
{{IMG_TAGS}}
<meta name="twitter:card" content="{{CARD}}">
<meta name="twitter:title" content="{{TITLE}}">
<meta name="twitter:description" content="{{DESC}}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;800&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%A7%8D%3C/text%3E%3C/svg%3E">
<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"WebApplication","name":"${SITE}","url":"{{ORIGIN}}/","applicationCategory":"EntertainmentApplication","operatingSystem":"Web","inLanguage":"id","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},"description":"Render avatar Roblox HD dari username, dengan zoom dan closeup."},{"@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Bagaimana cara render avatar Roblox?","acceptedAnswer":{"@type":"Answer","text":"Ketik username Roblox, tekan Render, lalu zoom atau geser gambarnya sesuai kebutuhan."}},{"@type":"Question","name":"Apakah gambar bisa diunduh?","acceptedAnswer":{"@type":"Answer","text":"Bisa. Tombol Unduh PNG menyimpan render dengan latar transparan."}},{"@type":"Question","name":"Apakah perlu login Roblox?","acceptedAnswer":{"@type":"Answer","text":"Tidak perlu. Cukup username publik."}}]}]}</script>
<style>
:root{--ink:#1b1640;--ink2:#2a2360;--paper:#f6f3ff;--mute:#a9a3d6;--pop:#ffb938;--line:rgba(255,255,255,.14);--r:20px;
--bg-a:#2a2360;--bg-b:#16123a;color-scheme:dark}
*{box-sizing:border-box;margin:0}
html{-webkit-text-size-adjust:100%}
body{font-family:'DM Sans',system-ui,sans-serif;background:radial-gradient(900px 500px at 80% -10%,#4a3bb0 0,transparent 60%),var(--ink);color:var(--paper);min-height:100vh;padding:max(20px,env(safe-area-inset-top)) 20px max(32px,env(safe-area-inset-bottom))}
.wrap{max-width:1040px;margin:0 auto}
header{display:flex;justify-content:space-between;align-items:center;padding:6px 0 26px}
.brand{font:800 20px 'Bricolage Grotesque',sans-serif;letter-spacing:-.02em;color:var(--paper);text-decoration:none}
h1{font:800 clamp(34px,6vw,64px)/1.02 'Bricolage Grotesque',sans-serif;letter-spacing:-.03em;max-width:14ch}
.sub{color:var(--mute);margin:14px 0 26px;max-width:46ch;line-height:1.55}
form{display:flex;gap:10px;max-width:560px}
.field{flex:1;display:flex;align-items:center;background:rgba(255,255,255,.08);border:1px solid var(--line);border-radius:14px;padding:0 14px}
.field:focus-within{border-color:var(--pop);box-shadow:0 0 0 3px rgba(255,185,56,.25)}
.field span{color:var(--mute);margin-right:4px}
input{flex:1;min-width:0;background:none;border:0;color:var(--paper);font:500 17px 'DM Sans',sans-serif;padding:15px 0;outline:0}
button,.btn{font:700 15px 'DM Sans',sans-serif;border:0;border-radius:14px;cursor:pointer;color:var(--ink);background:var(--pop);padding:0 22px;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:46px}
button:focus-visible,.btn:focus-visible,input:focus-visible{outline:2px solid #fff;outline-offset:2px}
.ghost{background:rgba(255,255,255,.1);color:var(--paper);border:1px solid var(--line)}
#err{color:#ff9aa8;margin-top:12px;min-height:22px;font-size:14px}
.stage{display:grid;grid-template-columns:1fr 300px;gap:18px;margin-top:22px}
@media(max-width:820px){.stage{grid-template-columns:1fr}form{flex-direction:column}}
.view{position:relative;border-radius:var(--r);overflow:hidden;aspect-ratio:1/1;border:1px solid var(--line);background:radial-gradient(circle at 50% 35%,var(--bg-a),var(--bg-b));touch-action:none;cursor:grab}
.view.t{background:conic-gradient(#3a3566 25%,#2c2755 0 50%,#3a3566 0 75%,#2c2755 0) 0 0/28px 28px}
.view:active{cursor:grabbing}
#img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;transform-origin:center;user-select:none;-webkit-user-drag:none;transition:opacity .25s}
#ph{position:absolute;inset:0;display:grid;place-items:center;color:var(--mute);text-align:center;padding:30px;line-height:1.5}
.tabs{position:absolute;top:12px;left:12px;display:flex;gap:6px;background:rgba(14,10,40,.6);backdrop-filter:blur(10px);padding:5px;border-radius:14px}
.tabs button{min-height:34px;padding:0 14px;background:none;color:var(--paper);font-size:14px}
.tabs button[aria-pressed=true]{background:var(--pop);color:var(--ink)}
.zoom{position:absolute;bottom:12px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:6px;background:rgba(14,10,40,.6);backdrop-filter:blur(10px);padding:5px;border-radius:14px}
.zoom button{min-height:34px;min-width:38px;padding:0 10px;background:none;color:var(--paper);font-size:18px}
.zoom output{min-width:48px;text-align:center;font-size:13px;color:var(--mute)}
.side{display:flex;flex-direction:column;gap:12px}
.card{background:rgba(255,255,255,.07);border:1px solid var(--line);border-radius:var(--r);padding:16px}
.who b{font:800 22px 'Bricolage Grotesque',sans-serif;display:block;word-break:break-all}
.who small{color:var(--mute)}
.sw{display:flex;gap:8px;margin-top:8px}
.sw button{width:34px;height:34px;min-height:0;padding:0;border-radius:50%;border:2px solid var(--line)}
.sw button[aria-pressed=true]{border-color:#fff}
.lbl{font-size:13px;color:var(--mute)}
.acts{display:grid;gap:8px}
#recent{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
#recent button{min-height:30px;padding:0 12px;font-size:13px}
section.faq{margin-top:56px;max-width:68ch}
section.faq h2{font:800 26px 'Bricolage Grotesque',sans-serif;margin-bottom:14px}
section.faq h3{font-size:16px;margin:16px 0 4px}
section.faq p{color:var(--mute);line-height:1.6}
footer{margin-top:44px;color:var(--mute);font-size:13px}
@media(prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
</head>
<body>
<div class="wrap">
<header><a class="brand" href="/">${SITE}</a></header>
<main>
<h1>{{H1}}</h1>
<p class="sub">Ketik username Roblox, lihat avatarnya dalam resolusi tinggi. Zoom ke wajah atau mundur lihat seluruh badan.</p>
<form id="f" autocomplete="off">
<label class="field"><span>@</span><input id="u" name="username" placeholder="username Roblox" maxlength="20" autocapitalize="off" spellcheck="false" aria-label="Username Roblox" required></label>
<button type="submit">Render</button>
</form>
<div id="err" role="alert"></div>
<div class="stage">
<div class="view" id="view">
<img id="img" alt="" hidden draggable="false">
<div id="ph">Avatar muncul di sini setelah kamu memasukkan username.</div>
<div class="tabs" role="group" aria-label="Sudut pandang">
<button type="button" data-m="full" aria-pressed="true">Full body</button>
<button type="button" data-m="bust" aria-pressed="false">Bust</button>
<button type="button" data-m="head" aria-pressed="false">Wajah</button>
</div>
<div class="zoom">
<button type="button" id="zo" aria-label="Zoom out">−</button>
<output id="zv">100%</output>
<button type="button" id="zi" aria-label="Zoom in">+</button>
<button type="button" id="zr" aria-label="Reset" style="font-size:13px">Reset</button>
</div>
</div>
<aside class="side">
<div class="card who" id="who"><b>—</b><small>Belum ada avatar</small></div>
<div class="card"><div class="lbl">Latar</div>
<div class="sw" id="sw">
<button type="button" data-bg="dusk" aria-pressed="true" aria-label="Dusk" style="background:linear-gradient(#2a2360,#16123a)"></button>
<button type="button" data-bg="sun" aria-pressed="false" aria-label="Sun" style="background:linear-gradient(#ffb938,#ff6b6b)"></button>
<button type="button" data-bg="mint" aria-pressed="false" aria-label="Mint" style="background:linear-gradient(#7ae7c7,#2b8a8f)"></button>
<button type="button" data-bg="t" aria-pressed="false" aria-label="Transparan" style="background:conic-gradient(#999 25%,#ddd 0 50%,#999 0 75%,#ddd 0) 0 0/12px 12px"></button>
</div></div>
<div class="acts">
<a class="btn" id="dl" href="#" hidden>Unduh PNG</a>
<button class="ghost" id="cp" type="button" hidden>Salin link</button>
<a class="btn ghost" id="tw" href="#" target="_blank" rel="noopener" hidden>Bagikan ke X</a>
</div>
<div class="card"><div class="lbl">Terakhir dicari</div><div id="recent"></div></div>
</aside>
</div>
</main>
<section class="faq">
<h2>Pertanyaan umum</h2>
<h3>Bagaimana cara render avatar Roblox?</h3><p>Ketik username Roblox, tekan Render, lalu zoom atau geser gambarnya sesuai kebutuhan.</p>
<h3>Apakah gambar bisa diunduh?</h3><p>Bisa. Tombol Unduh PNG menyimpan render dengan latar transparan.</p>
<h3>Apakah perlu login Roblox?</h3><p>Tidak perlu. Cukup username publik.</p>
</section>
<footer>Situs penggemar, tidak berafiliasi dengan Roblox Corporation.</footer>
</div>
<script>
var BOOT={{BOOT}};
var $=function(s){return document.querySelector(s)};
var st={d:null,m:'full',z:1,x:0,y:0};
var img=$('#img'),view=$('#view');
var BG={dusk:['#2a2360','#16123a'],sun:['#ffb938','#ff6b6b'],mint:['#7ae7c7','#2b8a8f']};
function apply(){img.style.transform='translate('+st.x+'px,'+st.y+'px) scale('+st.z+')';$('#zv').textContent=Math.round(st.z*100)+'%'}
function zoom(z){st.z=Math.min(6,Math.max(.6,z));if(st.z<=1){st.x=0;st.y=0}apply()}
function reset(){st.z=1;st.x=0;st.y=0;apply()}
$('#zi').onclick=function(){zoom(st.z*1.3)};
$('#zo').onclick=function(){zoom(st.z/1.3)};
$('#zr').onclick=reset;
view.addEventListener('wheel',function(e){e.preventDefault();zoom(st.z*(e.deltaY<0?1.12:.89))},{passive:false});
var pts={},last=null,d0=0,z0=1;
view.addEventListener('pointerdown',function(e){view.setPointerCapture(e.pointerId);pts[e.pointerId]=e;last={x:e.clientX,y:e.clientY}});
view.addEventListener('pointermove',function(e){
 if(!pts[e.pointerId])return;pts[e.pointerId]=e;var k=Object.keys(pts);
 if(k.length===2){var a=pts[k[0]],b=pts[k[1]],d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);if(!d0){d0=d;z0=st.z}zoom(z0*d/d0);return}
 if(st.z>1){st.x+=e.clientX-last.x;st.y+=e.clientY-last.y;apply()}last={x:e.clientX,y:e.clientY}});
function up(e){delete pts[e.pointerId];d0=0;last=null}
view.addEventListener('pointerup',up);view.addEventListener('pointercancel',up);
document.querySelectorAll('.tabs button').forEach(function(b){b.onclick=function(){st.m=b.dataset.m;show()}});
document.querySelectorAll('#sw button').forEach(function(b){b.onclick=function(){
 document.querySelectorAll('#sw button').forEach(function(x){x.setAttribute('aria-pressed',x===b)});
 var k=b.dataset.bg;view.classList.toggle('t',k==='t');if(BG[k]){view.style.setProperty('--bg-a',BG[k][0]);view.style.setProperty('--bg-b',BG[k][1])}}});
function show(){
 var d=st.d;if(!d)return;
 document.querySelectorAll('.tabs button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.m===st.m)});
 var src=d.images[st.m]||d.images.full;img.hidden=false;$('#ph').hidden=true;img.src=src;
 img.alt='Avatar Roblox '+d.name+' ('+st.m+')';reset();
 var dl=$('#dl');dl.hidden=false;dl.href='/api/img?u='+encodeURIComponent(src)+'&name='+d.name+'-'+st.m+'.png';
}
function recent(n){
 try{var l=JSON.parse(localStorage.getItem('rr')||'[]');if(n){l=[n].concat(l.filter(function(x){return x!==n})).slice(0,6);localStorage.setItem('rr',JSON.stringify(l))}
 var box=$('#recent');box.innerHTML='';l.forEach(function(x){var b=document.createElement('button');b.type='button';b.className='ghost';b.textContent=x;b.onclick=function(){go(x)};box.appendChild(b)})}catch(e){}
}
async function go(name,noPush){
 name=(name||'').trim().replace(/^@/,'');var err=$('#err');err.textContent='';
 if(!/^[A-Za-z0-9_]{3,20}$/.test(name)){err.textContent='Username harus 3-20 karakter: huruf, angka, atau underscore.';return}
 $('#u').value=name;$('#ph').hidden=false;$('#ph').textContent='Memuat avatar...';img.hidden=true;
 try{
  var r=await fetch('/api/avatar?username='+encodeURIComponent(name));var d=await r.json();
  if(!r.ok||!d.id){$('#ph').textContent='Avatar tidak ditemukan.';err.textContent=d.error||'Username tidak ditemukan. Cek ejaannya lalu coba lagi.';return}
  st.d=d;st.m='full';show();recent(d.name);
  $('#who').innerHTML='<b></b><small></small>';$('#who b').textContent=d.displayName;$('#who small').textContent='@'+d.name+' · ID '+d.id;
  var link=location.origin+'/u/'+d.name;
  if(!noPush)history.pushState(null,'','/u/'+d.name);document.title='Avatar Roblox '+d.name+' - Render HD';
  $('#cp').hidden=false;$('#cp').onclick=function(){navigator.clipboard.writeText(link).then(function(){$('#cp').textContent='Link tersalin';setTimeout(function(){$('#cp').textContent='Salin link'},1500)})};
  var tw=$('#tw');tw.hidden=false;tw.href='https://twitter.com/intent/tweet?text='+encodeURIComponent('Avatar Roblox '+d.name+' dalam HD')+'&url='+encodeURIComponent(link);
 }catch(e){$('#ph').textContent='Gagal memuat.';err.textContent='Koneksi bermasalah. Coba lagi sebentar lagi.'}
}
$('#f').onsubmit=function(e){e.preventDefault();go($('#u').value)};
window.addEventListener('popstate',function(){var m=location.pathname.match(/^\\/u\\/(\\w+)/);if(m)go(m[1],true)});
recent();if(BOOT)go(BOOT,true);
</script>
</body>
</html>`;

function render(origin, { title, desc, canon, image, boot, h1 }) {
  const imgTags = image
    ? `<meta property="og:image" content="${esc(image)}">\n<meta property="og:image:alt" content="${esc(title)}">\n<meta name="twitter:image" content="${esc(image)}">`
    : '';
  const vals = {
    TITLE: esc(title), DESC: esc(desc), CANON: esc(canon), ORIGIN: esc(origin), H1: esc(h1),
    IMG_TAGS: imgTags,
    CARD: image && boot ? 'summary' : image ? 'summary_large_image' : 'summary',
    BOOT: JSON.stringify(boot || null).replace(/</g, '\\u003c'),
  };
  return new Response(HTML.replace(/\{\{(\w+)\}\}/g, (_, k) => vals[k]), {
    headers: { 'content-type': 'text/html;charset=utf-8', 'cache-control': 'public, max-age=300' },
  });
}

const worker = {
  async fetch(req) {
    const url = new URL(req.url);
    const p = url.pathname;
    const origin = url.origin;

    if (p === '/api/avatar') {
      const name = url.searchParams.get('username');
      if (!validName(name)) return json({ error: 'Username tidak valid.' }, 400);
      try {
        const d = await lookup(name);
        return d ? json(d) : json({ error: 'Username tidak ditemukan.' }, 404);
      } catch (e) {
        return json({ error: 'Roblox sedang tidak merespons.' }, 502, 'no-store');
      }
    }

    if (p === '/api/img') {
      let u;
      try { u = new URL(url.searchParams.get('u')); } catch (e) { return new Response('bad', { status: 400 }); }
      if (u.protocol !== 'https:' || !u.hostname.endsWith('.rbxcdn.com')) return new Response('forbidden', { status: 403 });
      const r = await fetch(u.toString());
      const fn = (url.searchParams.get('name') || 'avatar.png').replace(/[^\w.-]/g, '_');
      return new Response(r.body, {
        status: r.status,
        headers: { 'content-type': r.headers.get('content-type') || 'image/png', 'content-disposition': `attachment; filename="${fn}"`, 'cache-control': 'public, max-age=86400' },
      });
    }

    if (p === '/robots.txt')
      return new Response(`User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${origin}/sitemap.xml\n`, { headers: { 'content-type': 'text/plain' } });

    if (p === '/sitemap.xml')
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url></urlset>`,
        { headers: { 'content-type': 'application/xml' } }
      );

    const m = p.match(/^\/u\/([A-Za-z0-9_]{3,20})\/?$/);
    if (m) {
      let d = null;
      try { d = await lookup(m[1]); } catch (e) {}
      const n = d ? d.name : m[1];
      return render(origin, {
        title: `Avatar Roblox ${n} - Render HD, Zoom & Closeup | ${SITE}`,
        desc: `Lihat avatar Roblox ${n}${d ? ` (${d.displayName})` : ''} dalam resolusi tinggi. Zoom, closeup wajah, dan unduh PNG transparan.`,
        canon: `${origin}/u/${n}`,
        image: d && d.images.full,
        boot: n,
        h1: `Avatar ${n}`,
      });
    }

    if (p === '/')
      return render(origin, {
        title: `Render Avatar Roblox HD - Zoom, Closeup & Unduh PNG | ${SITE}`,
        desc: 'Render avatar Roblox resolusi tinggi hanya dengan username. Zoom, closeup wajah, ganti latar, unduh PNG transparan, dan bagikan ke X (Twitter).',
        canon: `${origin}/`,
        image: DEFAULT_OG_IMAGE,
        boot: null,
        h1: 'Render avatar Roblox, tajam sampai ke detail',
      });

    return new Response('Not found', { status: 404 });
  },
};

Deno.serve((req) => worker.fetch(req));
