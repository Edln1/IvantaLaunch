(() => {
const rail=document.querySelector('.astral-voyage'),path=document.querySelector('#voyage-path'),symbol=document.querySelector('#voyage-symbol'),glyph=document.querySelector('#voyage-glyph'),orbit=document.querySelector('#voyage-orbit');
const stops=[['home','01 / ASTRAL HOST',5],['city','02 / STREETS',2],['gameplay','03 / GAMEPLAY',3],['departure','DEPARTURE',4],['orbit','STARBASE',4],['space-gameplay','04 / SPACE GAMEPLAY',4],['horizons','05 / WORLDS',2],['world','HOMEWORLD',2],['journey','FLIGHT',4],['story','THE STORY',1],['character','THE HOST',5],['companions','THE ASTRAL ARCHIVE',5],['lore','UNIVERSAL CURRENT',6],['convergence','INTEGRATION',6]];
const sections=stops.map(([id])=>document.getElementById(id));
const length=path.getTotalLength();let scheduled=false,positions=[];
function measure(){positions=sections.map(e=>e.getBoundingClientRect().top+scrollY);rail.querySelector('.voyage-stations').replaceChildren()}
function points(kind){return Array.from({length:32},(_,i)=>{const a=i/32*Math.PI*2-Math.PI/2;let r=21;
if(kind===1)r=15+7*Math.pow(Math.cos(2*a),8);
if(kind===2)r=20;
if(kind===3)r=16+8*Math.pow(Math.cos(4*a),10);
if(kind===4)r=16+8*Math.pow(Math.cos(2*a),10);
if(kind===5)r=12+12*Math.pow(Math.cos(2*a),12);
if(kind===6)r=18+5*Math.cos(6*a);
return [Math.cos(a)*r,Math.sin(a)*r]})}
function update(){scheduled=false;const y=scrollY+innerHeight*.3;let index=0;while(index<positions.length-1&&y>=positions[index+1])index++;
const next=Math.min(index+1,stops.length-1),span=Math.max(1,(positions[next]||positions[index]+1)-positions[index]);let t=next===index?0:Math.max(0,Math.min(1,(y-positions[index])/span));t=t*t*(3-2*t);
const total=Math.max(1,document.documentElement.scrollHeight-innerHeight);const progress=Math.max(0,Math.min(1,scrollY/total));const paused=document.body.classList.contains('paused')||matchMedia('(prefers-reduced-motion: reduce)').matches;
rail.setAttribute('aria-valuenow',String(Math.round(progress*100)));rail.setAttribute('aria-valuetext',stops[index][1]);rail.querySelector('.voyage-label').textContent=stops[index][1];
rail.classList.toggle('voyage-start',progress<.015);rail.classList.toggle('still',paused);
const phase=progress;const loc=path.getPointAtLength(length*phase);symbol.setAttribute('transform',`translate(${loc.x} ${loc.y})`);path.style.strokeDasharray=`${phase} 1`;
const a=points(stops[index][2]),b=points(stops[next][2]);const mix=paused?0:t;glyph.setAttribute('points',a.map((p,i)=>`${(p[0]+(b[i][0]-p[0])*mix).toFixed(2)},${(p[1]+(b[i][1]-p[1])*mix).toFixed(2)}`).join(' '));
orbit.setAttribute('transform',`rotate(${paused?0:progress*540})`);
}
function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(update)}}
rail.removeAttribute('href');rail.setAttribute('role','slider');rail.tabIndex=0;rail.setAttribute('aria-label','Page position: drag or click the trail');rail.setAttribute('aria-valuemin','0');rail.setAttribute('aria-valuemax','100');rail.setAttribute('aria-orientation','vertical');orbit.setAttribute('rx','25');orbit.setAttribute('ry','25');
const samples=Array.from({length:257},(_,i)=>{const p=path.getPointAtLength(length*i/256);return {y:p.y,f:i/256}});
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
let dragging=false,moved=false,startY=0,pendingY=null,dragFrame=0,inverse=null;
let glideTimer;
function glideTo(top){
 clearTimeout(glideTimer);document.documentElement.classList.add('rail-gliding');
 scrollTo({top,behavior:reduce.matches?'instant':'smooth'});
 glideTimer=setTimeout(()=>document.documentElement.classList.remove('rail-gliding'),1800);
}

function targetAt(y){const local=new DOMPoint(0,y).matrixTransform(inverse);let low=0,high=256;while(high-low>1){const mid=(low+high)>>1;if(samples[mid].y<local.y)low=mid;else high=mid}const a=samples[low],b=samples[high];const t=Math.max(0,Math.min(1,(local.y-a.y)/(b.y-a.y)));return (a.f+(b.f-a.f)*t)*Math.max(0,document.documentElement.scrollHeight-innerHeight)}
function flushDrag(){dragFrame=0;if(pendingY===null)return;scrollTo({top:targetAt(pendingY),behavior:'instant'});pendingY=null}
rail.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();inverse=rail.querySelector('svg').getScreenCTM().inverse();dragging=true;moved=false;startY=e.clientY;rail.setPointerCapture(e.pointerId)});
rail.addEventListener('pointermove',e=>{if(!dragging)return;if(Math.abs(e.clientY-startY)>3)moved=true;if(!moved)return;rail.classList.add('dragging');pendingY=e.clientY;if(!dragFrame)dragFrame=requestAnimationFrame(flushDrag)});
rail.addEventListener('pointerup',e=>{if(!dragging)return;if(moved){pendingY=e.clientY;if(dragFrame)cancelAnimationFrame(dragFrame);flushDrag()}else glideTo(targetAt(e.clientY));dragging=false;rail.classList.remove('dragging')});
function cancelDrag(){dragging=false;pendingY=null;if(dragFrame)cancelAnimationFrame(dragFrame);dragFrame=0;rail.classList.remove('dragging')}
rail.addEventListener('pointercancel',cancelDrag);rail.addEventListener('lostpointercapture',cancelDrag);rail.addEventListener('click',e=>e.preventDefault());
rail.addEventListener('keydown',e=>{const total=document.documentElement.scrollHeight-innerHeight;let y;if(e.key==='Home')y=0;else if(e.key==='End')y=total;else if(['ArrowDown','ArrowRight','PageDown'].includes(e.key))y=scrollY+innerHeight*.8;else if(['ArrowUp','ArrowLeft','PageUp'].includes(e.key))y=scrollY-innerHeight*.8;else return;e.preventDefault();scrollTo({top:y,behavior:reduce.matches?'instant':'smooth'})});
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',()=>{measure();schedule()},{passive:true});addEventListener('load',()=>{measure();schedule()});document.querySelector('#motion').addEventListener('click',schedule);new ResizeObserver(()=>{measure();schedule()}).observe(document.querySelector('main'));measure();update();
// Reveal only after initial geometry and scroll position have been applied.
requestAnimationFrame(()=>{measure();update();rail.style.visibility="visible"});
})();
