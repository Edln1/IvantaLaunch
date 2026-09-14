(() => {
const tabs=[...document.querySelectorAll('.codex-tabs [role=tab]')],pages=[...document.querySelectorAll('.codex-book > .codex-page')],book=document.querySelector('.codex-book'),cover=document.querySelector('.codex-cover'),toggle=document.querySelector('#view-book-cover');
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),small=matchMedia('(max-width:900px)');let selected=0,busy=false,closed=false,revision=0;
const quiet=()=>reduced.matches||document.body.classList.contains('paused');
function sync(){tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===selected));tab.tabIndex=i===selected?0:-1;pages[i].hidden=i!==selected});document.querySelector('#codex-count').textContent=selected===0?'PROLOGUE':`0${selected} / 07`}
function jump(index,focus=false){revision++;book.getAnimations({subtree:true}).forEach(a=>a.cancel());book.querySelectorAll('.turn-leaf,.turn-static').forEach(e=>e.remove());busy=false;closed=false;book.classList.remove('book-closed','cover-folding','cover-moving');cover.hidden=true;cover.style.transform='rotateY(-180deg)';toggle.textContent='VIEW COVER';toggle.setAttribute('aria-expanded','true');selected=(index+tabs.length)%tabs.length;sync();book.setAttribute('aria-busy','false');if(focus)tabs[selected].focus({preventScroll:true})}
function snapshot(page,w,h){const node=page.cloneNode(true);node.hidden=false;node.classList.add('page-snapshot');node.removeAttribute('id');node.removeAttribute('aria-labelledby');node.removeAttribute('tabindex');node.setAttribute('aria-hidden','true');node.inert=true;node.style.width=w+'px';node.style.height=h+'px';node.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));return node}
function face(page,side,w,h,back){const node=document.createElement('div');node.className='turn-face '+(back?'back':'front');const copy=snapshot(page,w,h);copy.style.left=side==='right'?(-w/2)+'px':'0';node.append(copy);return node}
const assets=['assets/manuscript-spread.png','assets/manuscript-portraits.png','assets/archive-introduction.png','assets/archive-legend-cover.png'];
const ready=Promise.all([document.fonts.ready,...assets.map(src=>{const img=new Image();img.src=src;return img.decode().catch(()=>{})})]);
async function turn(index,focus=false){if(busy)return;const target=(index+tabs.length)%tabs.length;if(closed){const opening=revision+1;await setCover(false);if(revision!==opening)return;if(target!==selected)await turn(target,focus);return}if(target===selected)return;busy=true;const ticket=++revision;book.setAttribute('aria-busy','true');await ready;if(ticket!==revision)return;
const old=pages[selected],next=pages[target],forward=index>selected;let leaf,stationary;
try{if(!quiet()&&!small.matches){const {width:w,height:h}=book.getBoundingClientRect();stationary=document.createElement('div');stationary.className='turn-static';stationary.inert=true;stationary.style.clipPath=forward?'inset(0 50% 0 0)':'inset(0 0 0 50%)';stationary.append(snapshot(old,w,h));leaf=document.createElement('div');leaf.className='turn-leaf '+(forward?'forward':'backward');leaf.inert=true;leaf.setAttribute('aria-hidden','true');leaf.append(face(old,forward?'right':'left',w,h,false),face(next,forward?'left':'right',w,h,true));book.append(stationary,leaf);old.hidden=true;next.hidden=false;await leaf.animate([{transform:'rotateY(0deg)'},{transform:`rotateY(${forward?-180:180}deg)`}],{duration:1000,easing:'cubic-bezier(.3,.08,.25,1)',fill:'forwards'}).finished;leaf.classList.add('landed');await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));}else{old.hidden=true;next.hidden=false;}if(ticket===revision)selected=target;
}catch{if(ticket===revision)selected=target}finally{leaf?.remove();stationary?.remove();if(ticket===revision){sync();busy=false;book.setAttribute('aria-busy','false');if(focus)tabs[selected].focus({preventScroll:true})}}}
async function setCover(value){
if(busy||closed===value)return;busy=true;book.classList.add('cover-moving');const ticket=++revision;await ready;if(ticket!==revision)return;
const centered=small.matches?'translateX(0)':'translateX(-50%)';let leaf;
const animate=async(el,frames,duration)=>{if(quiet())return;await el.animate(frames,{duration,easing:'cubic-bezier(.3,.08,.25,1)',fill:'forwards'}).finished};
try{
if(value){
if(!small.matches&&!quiet()){
const {width:w,height:h}=book.getBoundingClientRect();leaf=document.createElement('div');leaf.className='turn-leaf cover-closing';leaf.inert=true;
const front=face(pages[selected],'left',w,h,false),back=document.createElement('div');back.className='turn-face back';const artwork=cover.cloneNode(true);artwork.hidden=false;artwork.removeAttribute('id');artwork.classList.add('cover-artwork');artwork.tabIndex=-1;back.append(artwork);leaf.append(front,back);book.append(leaf);book.classList.add('cover-folding');
await animate(leaf,[{transform:'rotateY(0deg)'},{transform:'rotateY(180deg)'}],900);if(ticket!==revision)return;
}
closed=true;book.classList.remove('cover-folding');book.classList.add('book-closed');cover.hidden=false;cover.style.transform='translateX(0) rotateY(0deg)';leaf?.remove();
await animate(cover,[{transform:'translateX(0) rotateY(0deg)'},{transform:centered+' rotateY(0deg)'}],450);if(ticket!==revision)return;
cover.getAnimations().forEach(a=>a.cancel());cover.style.transform=centered+' rotateY(0deg)';
}else{
await animate(cover,[{transform:centered+' rotateY(0deg)'},{transform:'translateX(0) rotateY(0deg)'}],400);if(ticket!==revision)return;
cover.getAnimations().forEach(a=>a.cancel());cover.style.transform='rotateY(0deg)';book.classList.remove('book-closed');
if(!small.matches&&!quiet()){
const {width:w,height:h}=book.getBoundingClientRect();leaf=document.createElement('div');leaf.className='turn-leaf cover-closing';leaf.inert=true;
const front=face(pages[selected],'left',w,h,false),back=document.createElement('div');back.className='turn-face back';const artwork=cover.cloneNode(true);artwork.hidden=false;artwork.classList.add('cover-artwork');artwork.tabIndex=-1;back.append(artwork);leaf.append(front,back);leaf.style.transform='rotateY(180deg)';book.append(leaf);book.classList.add('cover-folding');cover.hidden=true;
await animate(leaf,[{transform:'rotateY(180deg)'},{transform:'rotateY(0deg)'}],900);if(ticket!==revision)return;
}
book.classList.remove('cover-folding');
closed=false;cover.getAnimations().forEach(a=>a.cancel());cover.style.transform='rotateY(-180deg)';cover.hidden=true;
}
toggle.textContent=closed?'OPEN BOOK':'VIEW COVER';toggle.setAttribute('aria-expanded',String(!closed));(closed?cover:toggle).focus({preventScroll:true});
}catch{}finally{leaf?.remove();if(ticket===revision){book.classList.remove('cover-folding','cover-moving');busy=false}}
}
cover.addEventListener('click',()=>setCover(false));toggle.addEventListener('click',()=>setCover(!closed));
tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>jump(i));tab.addEventListener('keydown',e=>{const n={ArrowRight:selected+1,ArrowLeft:selected-1,Home:0,End:tabs.length-1}[e.key];if(n===undefined)return;e.preventDefault();jump(n,true)})});
document.querySelector('#codex-prev').addEventListener('click',()=>turn(selected-1));document.querySelector('#codex-next').addEventListener('click',()=>turn(selected+1));
let start=null;book.addEventListener('pointerdown',e=>{if(e.target.closest('button,a')||closed||busy)return;start={x:e.clientX,y:e.clientY}});book.addEventListener('pointerup',e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.5)turn(selected+(dx<0?1:-1))});book.addEventListener('pointercancel',()=>start=null);sync();
})();
