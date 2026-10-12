(()=>{'use strict';
const data=JSON.parse(document.querySelector('#film-data').textContent),track=document.querySelector('.film-track'),stage=document.querySelector('.film-stage'),dlg=document.querySelector('#film-dialog');let current=0,velocity=0,last=0,raf=0,trigger;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');const stopped=()=>reduced.matches||document.body.classList.contains('pause-motion')||dlg.open||document.hidden;
function step(t){if(last&&!stopped())track.scrollLeft+=velocity*Math.min(t-last,40)/1000;last=t;if(velocity&&!stopped())raf=requestAnimationFrame(step);else{raf=0;last=0}}
function stop(){velocity=0;cancelAnimationFrame(raf);raf=0;last=0}
stage.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||stopped())return;if(dragging)return;const r=stage.getBoundingClientRect(),x=e.clientX-r.left,edge=Math.min(150,r.width*.18);velocity=x<edge?-520*(1-x/edge):x>r.width-edge?520*(1-(r.width-x)/edge):0;if(velocity&&!raf)raf=requestAnimationFrame(step);if(!velocity)stop()});stage.addEventListener('pointerleave',stop);stage.addEventListener('pointerdown',()=>{stop();track.scrollTo({left:track.scrollLeft,behavior:'instant'})});stage.addEventListener('focusin',stop);document.addEventListener('visibilitychange',stop);document.querySelector('#motion-toggle')?.addEventListener('click',stop);
let dragging=false,dragStart=0,dragLeft=0,dragMoved=false;
track.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;stop();dragging=true;dragMoved=false;dragStart=e.clientX;dragLeft=track.scrollLeft;});
addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-dragStart;if(Math.abs(dx)>7){dragMoved=true;track.classList.add('is-dragging');track.scrollTo({left:dragLeft-dx,behavior:'instant'});e.preventDefault();}},{passive:false});
const endDrag=()=>{dragging=false;track.classList.remove('is-dragging')};addEventListener('pointerup',endDrag);addEventListener('pointercancel',endDrag);addEventListener('blur',endDrag);
track.addEventListener('click',e=>{if(dragMoved){e.preventDefault();e.stopImmediatePropagation();dragMoved=false;}},true);
track.addEventListener('dragstart',e=>e.preventDefault());
track.addEventListener('wheel',()=>stop(),{passive:true});
const move=x=>{stop();track.scrollBy({left:x,behavior:reduced.matches||document.body.classList.contains('pause-motion')?'instant':'smooth'})};document.querySelector('#film-prev').onclick=()=>move(-620);document.querySelector('#film-next').onclick=()=>move(620);track.addEventListener('keydown',e=>{if(e.target!==track)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?310:-310)}});
const cards=Array.from(track.children),ruler=document.querySelector('#film-ruler');
function progress(){const origin=cards[0].offsetLeft;let first=cards.findIndex(c=>c.offsetLeft-origin+c.offsetWidth>track.scrollLeft+2);if(first<0)first=cards.length-1;let end=first;cards.forEach((c,i)=>{if(c.offsetLeft-origin<track.scrollLeft+track.clientWidth-2)end=i});document.querySelector('#film-progress').textContent=`第${first+1}—${end+1}条 / ${data.length}`;document.querySelector('#film-prev').disabled=track.scrollLeft<1;document.querySelector('#film-next').disabled=track.scrollLeft+track.clientWidth>=track.scrollWidth-2;document.querySelectorAll('.film-year').forEach(b=>b.setAttribute('aria-pressed',String(data[first].published_at.startsWith(b.dataset.year))));document.querySelector('#film-month').value=track.scrollLeft<1?'':data[first].published_at.slice(0,7);if(ruler){ruler.value=String(Math.round(track.scrollLeft/Math.max(1,track.scrollWidth-track.clientWidth)*100));ruler.setAttribute('aria-valuetext',`第${first+1}条，${data[first].published_at.slice(0,10)}`)}}track.addEventListener('scroll',progress,{passive:true});progress();addEventListener('resize',progress);
const jump=i=>{stop();track.scrollTo({left:cards[i].offsetLeft-cards[0].offsetLeft,behavior:reduced.matches||document.body.classList.contains('pause-motion')?'instant':'smooth'})};
if(ruler)ruler.addEventListener('input',e=>{stop();const ratio=Number(e.target.value)/100;track.scrollTo({left:ratio*(track.scrollWidth-track.clientWidth),behavior:'instant'})});
document.querySelectorAll('.film-year').forEach(b=>b.onclick=()=>jump(Math.max(0,data.findIndex(w=>w.published_at.startsWith(b.dataset.year)))));
document.querySelector('#film-month').onchange=e=>jump(Math.max(0,data.findIndex(w=>w.published_at.startsWith(e.target.value))));
function show(i){current=Math.max(0,Math.min(data.length-1,i));const w=data[current];const cover=cards[current].querySelector('.film-cover');document.querySelector('#film-modal-cover').src=cover.src;document.querySelector('#film-modal-cover').alt=cover.alt;document.querySelector('#film-title').textContent=w.title_without_hashtags;document.querySelector('#film-meta').textContent=`${String(w.order).padStart(3,'0')} · ${w.published_at} · ${w.type}`;const summary=document.querySelector('#film-content-summary');summary.textContent=w.content_summary||'';summary.hidden=!w.content_summary;document.querySelector('#film-link').href=w.url;if(!dlg.open)dlg.showModal();dlg.scrollTop=0}
track.querySelectorAll('button').forEach(b=>b.onclick=()=>{trigger=b;stop();show(Number(b.dataset.i))});const random=document.querySelector('.hero-random');if(random)random.onclick=()=>{trigger=random;stop();show(Math.floor(Math.random()*data.length))};document.querySelectorAll('.hero-preview').forEach(b=>b.onclick=()=>{trigger=b;stop();show(Number(b.dataset.videoIndex))});document.querySelector('#film-close').onclick=()=>dlg.close();dlg.addEventListener('close',()=>trigger?.focus({preventScroll:true}));dlg.addEventListener('click',e=>{if(e.target===dlg){const r=dlg.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dlg.close()}});
})();

(()=>{
 const links=[...document.querySelectorAll('.outline-link')],sections=links.map(a=>document.querySelector(a.hash)).filter(Boolean);let scheduled=false;
 const update=()=>{scheduled=false;const margin=document.querySelector('header').getBoundingClientRect().height+100;let current=sections[0];for(const section of sections){if(section.getBoundingClientRect().top<=margin)current=section;}links.forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})};
 addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update)}},{passive:true});addEventListener('resize',update);update();
})();

(()=>{
 const header=document.querySelector('header'),nav=document.querySelector('.side');
 const sizes=()=>{document.documentElement.style.setProperty('--header-height',header.getBoundingClientRect().height+'px');document.documentElement.style.setProperty('--nav-height',nav.getBoundingClientRect().height+'px')};
 new ResizeObserver(sizes).observe(header);new ResizeObserver(sizes).observe(nav);sizes();
 const dialogs=[...document.querySelectorAll('dialog')];
 const sync=()=>document.documentElement.classList.toggle('dialog-open',dialogs.some(d=>d.open));
 dialogs.forEach(d=>{new MutationObserver(sync).observe(d,{attributes:true,attributeFilter:['open']});d.addEventListener('close',sync)});
})();

(()=>{const gallery=document.querySelector('.hero-gallery'),inner=document.querySelector('.hero-gallery-inner');if(!gallery||!inner)return;const reduce=matchMedia('(prefers-reduced-motion: reduce)');gallery.addEventListener('pointermove',e=>{if(gallery.classList.contains('hero-profile')||e.pointerType!=='mouse'||reduce.matches||document.body.classList.contains('pause-motion'))return;const r=gallery.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;inner.style.transform=`rotateY(${x*8}deg) rotateX(${-y*6}deg) translate3d(${x*8}px,${y*5}px,0)`});const hero=document.querySelector('.modern-hero');hero.addEventListener('pointermove',e=>{if(reduce.matches||document.body.classList.contains('pause-motion'))return;const r=hero.getBoundingClientRect();hero.style.setProperty('--light-x',`${(e.clientX-r.left)/r.width*100}%`);hero.style.setProperty('--light-y',`${(e.clientY-r.top)/r.height*100}%`)});const reset=()=>inner.style.transform='';gallery.addEventListener('pointerleave',reset);document.querySelector('#motion-toggle')?.addEventListener('click',reset);reduce.addEventListener('change',reset);})();

(()=>{
 const data=JSON.parse(document.querySelector('#film-data').textContent),cards=[...document.querySelectorAll('.film-card')],dlg=document.querySelector('#image-dialog'),image=document.querySelector('#zoom-image');let trigger;
 document.querySelectorAll('.image-zoom').forEach(b=>b.onclick=()=>{trigger=b;const img=b.querySelector('img');image.src=img.src;image.alt=img.alt;dlg.showModal();dlg.scrollTop=0});
 document.querySelector('#image-close').onclick=()=>dlg.close();dlg.addEventListener('close',()=>trigger?.focus({preventScroll:true}));
 dlg.addEventListener('click',e=>{if(e.target!==dlg)return;const r=dlg.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dlg.close()});
 document.querySelectorAll('[data-work]').forEach(b=>b.onclick=()=>{const i=data.findIndex(w=>w.video_id===b.dataset.work);cards[i]?.click()});
 addEventListener('scroll',()=>{const max=document.documentElement.scrollHeight-innerHeight;document.querySelector('.progress').style.width=(max>0?scrollY/max*100:0)+'%'},{passive:true});
 history.scrollRestoration='manual';addEventListener('pageshow',()=>{if(!location.hash)scrollTo({top:0,behavior:'instant'})});
})();
