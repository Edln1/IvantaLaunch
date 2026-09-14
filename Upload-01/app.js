const scene=document.querySelector('#horizons');
const atmosphere=document.querySelector('#atmosphere');
const motion=document.querySelector('#motion');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let night=false;
const sunIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>';
const moonIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 15.4A8.5 8.5 0 0 1 8.6 4a8.5 8.5 0 1 0 11.4 11.4Z"/></svg>';
function setNight(value){scene.classList.toggle('twilight',value);document.body.classList.toggle('moonlit',value);atmosphere.setAttribute('aria-label',value?'Switch to golden daylight':'Switch to moonlight');atmosphere.setAttribute('aria-pressed',String(value));atmosphere.title=value?'Moonlight · switch to daylight':'Daylight · switch to moonlight';atmosphere.textContent=value?'☾':'☼'}
atmosphere.addEventListener('click',()=>{night=!night;setNight(night)});
function setPaused(paused){document.body.classList.toggle('paused',paused);motion.setAttribute('aria-pressed',String(paused));motion.innerHTML=paused?'RESUME MOTION <span>▷</span>':'PAUSE MOTION <span>Ⅱ</span>';setNight(night)}
setPaused(reducedMotion.matches);
motion.addEventListener('click',()=>setPaused(!document.body.classList.contains('paused')));
const header=document.querySelector('.site-header');
addEventListener('scroll',()=>header.classList.toggle('scrolled',scrollY>70),{passive:true});
header.classList.toggle('scrolled',scrollY>70);
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.08});
document.querySelectorAll('.reveal').forEach(el=>{el.classList.add('ready');observer.observe(el)});
let navigationLock=null;
const navObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting&&!navigationLock){document.querySelectorAll('.site-header nav a').forEach(a=>{if(a.hash==='#'+entry.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})}}),{rootMargin:'-15% 0px -65% 0px',threshold:0});
document.querySelectorAll('#story,#world,#character,#companions,#lore,#city,#gameplay,#flight-arrival,#home').forEach(el=>navObserver.observe(el));
const portraits={close:['assets/host-convergence.png','Close-up artwork of the Astral Host with warm gold light and violet shadow.'],front:['assets/host-front.png','The Astral Host faces forward in black and plum clothing with gold constellation details and violet crystals.'],back:['assets/host-back.png','Side and back view of the Astral Host, showing her plum cape, gold filigree and suspended violet crystals.']};
document.querySelectorAll('[data-portrait]').forEach(button=>button.addEventListener('click',()=>{const image=document.querySelector('#host-image');[image.src,image.alt]=portraits[button.dataset.portrait];image.classList.toggle('close-portrait',button.dataset.portrait==='close');document.querySelectorAll('[data-portrait]').forEach(b=>{const selected=b===button;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected))})}));
const currents={
light:{nature:'CREATION · ORDER · REVELATION',title:'The force that gives form.',copy:'Light brings growth, connection and clarity. It creates and reveals. Yet without its counterpart, order can harden into control, and the desire for perfection can leave no room for change.',cost:'Too much Light can become a world without freedom.',art:'assets/astral-light.png'},
integration:{nature:'THE POINT OF CONVERGENCE',title:'The power to become whole.',copy:'Most vessels cannot endure the collision of the two currents. She can contain them—but containment is not harmony. Her purpose is to reconcile their opposing forces within one living soul.',cost:'Beyond balance lies the possibility of the Unified Current: Light and Dark, wielded together.',art:'assets/astral-integration.png'},
dark:{nature:'ENTROPY · INSTINCT · TRANSFORMATION',title:'The force that makes change possible.',copy:'Dark conceals, dissolves and transforms. It is the instinct beneath reason and the ending that makes another beginning possible. Feared as corruption, it is an essential half of existence.',cost:'Without balance, transformation becomes destruction.',art:'assets/astral-dark.png'}
};
const currentTabs=[...document.querySelectorAll('[role=tab][data-current]')];
function selectCurrent(button){const key=button.dataset.current,data=currents[key];document.querySelector('#lore').dataset.current=key;document.querySelector('#current-panel').setAttribute('aria-labelledby',button.id);document.querySelector('#current-nature').textContent=data.nature;document.querySelector('#current-title').textContent=data.title;document.querySelector('#current-copy').textContent=data.copy;document.querySelector('#current-cost').textContent=data.cost;document.querySelector('#current-art').src=data.art;currentTabs.forEach(b=>{const selected=b===button;b.classList.toggle('active',selected);b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1})}
currentTabs.forEach((button,index)=>{button.addEventListener('click',()=>selectCurrent(button));button.addEventListener('keydown',event=>{let target;if(event.key==='ArrowRight')target=(index+1)%3;else if(event.key==='ArrowLeft')target=(index+2)%3;else if(event.key==='Home')target=0;else if(event.key==='End')target=2;else return;event.preventDefault();selectCurrent(currentTabs[target]);currentTabs[target].focus()})});
const cityScenes=[
{src:'assets/grand-street.png',name:'The grand avenue',description:'Beneath gold-trimmed balconies, the city opens toward the sky.',alt:'Ivanta’s heroine walks beneath astral banners on a grand stone-and-gold city street.'},
{src:'assets/quiet-lane.png',name:'The quiet quarter',description:'Dappled light and familiar footsteps, away from the towering skyline.',alt:'The Astral Host walks along a tree-shaded Ivanta lane beside ornate homes and a carriage.'},
{src:'assets/living-square.png',name:'The living square',description:'An ordinary afternoon, alive with people, performance and possibility.',alt:'A busy Ivanta square with a street performance, residents, stalls and the heroine in the foreground.'}
];
let cityIndex=0;function selectCity(index){cityIndex=(index+cityScenes.length)%cityScenes.length;const data=cityScenes[cityIndex],image=document.querySelector('#city-image');image.src=data.src;image.alt=data.alt;document.querySelector('#city-name').textContent=data.name;document.querySelector('#city-description').textContent=data.description;document.querySelector('#city-number').textContent=`0${cityIndex+1} / 03`;document.querySelectorAll('[data-city]').forEach(b=>{const selected=Number(b.dataset.city)===cityIndex;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected))})}
document.querySelectorAll('[data-city]').forEach(button=>button.addEventListener('click',()=>selectCity(Number(button.dataset.city))));
document.querySelector('#city-prev').addEventListener('click',()=>selectCity(cityIndex-1));document.querySelector('#city-next').addEventListener('click',()=>selectCity(cityIndex+1));
const buildScenes=['plaza','stairs','quarter'];
function updateBuild(index){const img=document.querySelector('#build-image');img.src=`assets/target-${buildScenes[index]}.png`;img.alt='Ivanta city visual concept with refined stone-and-gold architecture and the brunette Astral Host.';document.querySelectorAll('[data-build-scene]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.buildScene)===index)))}
document.querySelectorAll('[data-build-scene]').forEach(b=>b.addEventListener('click',()=>updateBuild(Number(b.dataset.buildScene))));


let navigationRun=0;
function markNavigation(hash){document.querySelectorAll('.site-header nav a').forEach(a=>{if(a.hash===hash)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})}
for(const hash of ['#flight-arrival','#companions'])document.querySelector('.site-header nav a[href="'+hash+'"]').addEventListener('click',async event=>{
event.preventDefault();const run=++navigationRun;navigationLock=hash;markNavigation(hash);history.pushState(null,'',hash);
const target=document.querySelector(hash==='#companions'?'#companions .section-heading':hash);target.classList.add('visible');
const pending=[...document.images].filter(img=>!img.complete&&(img.compareDocumentPosition(target)&Node.DOCUMENT_POSITION_FOLLOWING));pending.forEach(img=>{img.loading='eager'});
await Promise.all(pending.map(img=>img.decode().catch(()=>{})).concat(document.fonts.ready));if(run!==navigationRun)return;
const from=scrollY,start=performance.now(),duration=reducedMotion.matches?0:1100;
function frame(now){if(run!==navigationRun)return;const r=target.getBoundingClientRect(),offset=hash==='#companions'?130:Math.max(140,innerHeight-r.height-70),to=scrollY+r.top-offset,t=duration?Math.min(1,(now-start)/duration):1,e=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;scrollTo({top:from+(to-from)*e,behavior:'instant'});if(t<1)requestAnimationFrame(frame);else markNavigation(hash)}requestAnimationFrame(frame);
});
for(const type of ['wheel','touchstart'])addEventListener(type,()=>{navigationRun++;navigationLock=null},{passive:true});
document.querySelectorAll('.site-header nav a').forEach(a=>a.addEventListener('click',()=>{if(!['#flight-arrival','#companions'].includes(a.hash)){navigationRun++;navigationLock=null}}));
