import { motion, clamp, springStep, normalizeWheel, snapChapter } from './motion.js';

export function initNavigation() {
 const titles=['Inicio','Historia','Filosofía','Misión','Visión','Valores','Objetivos','Marca'];
 const chapters=[...document.querySelectorAll('.chapter')];
 const desktopStage=document.querySelector('.desktop-stage');
 const commercial=document.getElementById('commercial');
 const finance=document.getElementById('finance');
 const commercialButton=document.getElementById('button-commercial');
 const financeButton=document.getElementById('button-finance');
 const mobileView=document.getElementById('mobile-view');
 const mobileStrip=document.getElementById('mobile-strip');
 const mobileCurrent=document.getElementById('mobile-current-label');
 const mobileNext=document.getElementById('mobile-next-label');
 const mobileNextButton=document.getElementById('mobile-next-button');
 const overview=document.getElementById('overview');
 const modal=document.getElementById('popup');
 const modalTitle=document.getElementById('popup-title');
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const count=chapters.length;
 const chapterTabs=chapters.map(chapter=>chapter.querySelector('.chapter-tab'));
 const paintedPositions=chapters.map(()=>null);
 let paintedMobilePosition=null;
 let current=0,target=0,velocity=0,lastTime=0,frame=null;
 let stiffness=motion.spring;
 let mode='commercial',width=0,readWidth=0,tabWidth=0,viewWidth=0,mobile=false,chosen=-1;

 chapters.forEach((chapter,i)=>{
   chapter.style.zIndex=String(i);
   chapterTabs[i].addEventListener('click',()=>go(i));
   const slide=document.createElement('article');
   slide.className='mobile-slide '+(chapter.classList.contains('mint')?'mint':'rose');
   slide.setAttribute('aria-label',titles[i]);
   slide.appendChild(chapter.querySelector('.panel-body').cloneNode(true));
   mobileStrip.appendChild(slide);
   const item=document.createElement('button');item.type='button';item.textContent=titles[i];item.addEventListener('click',()=>{closePopup();go(i)});
   overview.appendChild(item);
 });
 function paint(){
  if(mobile){
   const x=Math.round(-current*viewWidth*100)/100;
   if(paintedMobilePosition!==x){
    paintedMobilePosition=x;
    mobileStrip.style.transform=`translate3d(${x}px,0,0)`;
   }
  }else{
   for(let i=0;i<count;i++){
    const x=Math.round((i*tabWidth+readWidth*clamp(i-current,0,1))*100)/100;
    if(paintedPositions[i]===x)continue;
    paintedPositions[i]=x;
    chapters[i].style.transform=`translate3d(${x}px,0,0)`;
   }
  }
  const index=clamp(Math.round(current),0,count-1);
  if(index!==chosen){
    chosen=index;
    chapterTabs.forEach((tab,i)=>tab.setAttribute('aria-expanded',String(i===index)));
    Array.from(mobileStrip.children).forEach((slide,i)=>slide.classList.toggle('is-current',i===index));
    mobileCurrent.textContent=titles[index];
    mobileNext.textContent=titles[Math.min(index+1,count-1)];
    mobileNextButton.style.opacity=index===count-1?'.3':'1';
    mobileNextButton.disabled=index===count-1;
    mobileNextButton.setAttribute('aria-label',index===count-1?'Último apartado':`Abrir ${titles[index+1]}`);
  }
 }
 function stop(){if(frame!==null){cancelAnimationFrame(frame);frame=null}lastTime=0}
 function tick(time){
  const dt=lastTime?Math.max(0,Math.min((time-lastTime)/1000,.08)):1/60;lastTime=time;
  if(reduced){current=target;velocity=0}
  else{
   const next=springStep(current,velocity,target,dt,stiffness);
   current=next.position;
   velocity=next.velocity;
  }
  if(current<0||current>count-1){current=clamp(current,0,count-1);velocity=0;}
  if(Math.abs(target-current)<motion.epsilon && Math.abs(velocity)<motion.speedEpsilon){current=target;velocity=0;paint();frame=null;lastTime=0;return}
  paint();frame=requestAnimationFrame(tick);
 }
 function render(){if(frame===null){if(reduced){current=target;velocity=0;paint();}else if(current!==target||Math.abs(velocity)>.025){frame=requestAnimationFrame(tick);}}}
 let settleTimer=null,wheelAnchor=null,wheelSpeed=0,wheelTime=0;
 function cancelSettle(){
  if(settleTimer!==null)clearTimeout(settleTimer);
  settleTimer=null;wheelAnchor=null;wheelSpeed=0;wheelTime=0;
 }
 function go(i){
  cancelSettle();stiffness=motion.spring;
  target=clamp(i,0,count-1);render();
 }
 function addDelta(delta){
  const now=performance.now();
  if(wheelAnchor===null){wheelAnchor=Math.round(target);wheelSpeed=0;}
  const dt=wheelTime?Math.max((now-wheelTime)/1000,0.012):0.04;
  wheelSpeed=wheelSpeed*.55+clamp(delta/dt,-4,4)*.45;
  wheelTime=now;
  stiffness=motion.wheelSpring;
  target=clamp(target+delta,0,count-1);render();
  if(settleTimer!==null)clearTimeout(settleTimer);
  settleTimer=setTimeout(()=>{
   go(snapChapter(target,wheelAnchor,wheelSpeed,count-1,motion.wheelProjection));
  },motion.wheelIdle);
 }
 function resize(){
   const wasMobile=mobile;
   mobile=window.matchMedia('(max-width: 1024px)').matches;
   tabWidth=mobile?40:(chapters[0].querySelector('.chapter-tab').offsetWidth||70);
   width=desktopStage.getBoundingClientRect().width;
   readWidth=Math.max(1,width-tabWidth*count);
   document.documentElement.style.setProperty('--read',`${readWidth}px`);
   viewWidth=mobileView.getBoundingClientRect().width;
   document.documentElement.style.setProperty('--view',`${viewWidth}px`);
   for(const slide of mobileStrip.children)slide.style.width=`${viewWidth}px`;
   if(wasMobile!==mobile)chosen=-1;
   paintedPositions.fill(null);paintedMobilePosition=null;
   paint();
 }
 function switchMode(next){
  mode=next;commercial.hidden=next!=='commercial';finance.hidden=next!=='finance';
  commercialButton.setAttribute('aria-pressed',String(next==='commercial'));
  financeButton.setAttribute('aria-pressed',String(next==='finance'));
  closePopup();if(next==='commercial')requestAnimationFrame(()=>{resize();render();});else{cancelSettle();stop();target=Math.round(target);}
 }
 commercialButton.addEventListener('click',()=>switchMode('commercial'));
 financeButton.addEventListener('click',()=>switchMode('finance'));
 window.addEventListener('wheel',e=>{
  if(mode!=='commercial'||!modal.hidden||!document.getElementById('locations-screen').hidden||e.ctrlKey||e.metaKey)return;
  const vertical=Math.abs(e.deltaY)>=Math.abs(e.deltaX);
  if(mobile&&vertical&&e.target.closest('.mobile-slide'))return;
  const readingArea=e.target.closest('.values-scroll');
  if(vertical&&readingArea&&readingArea.scrollHeight>readingArea.clientHeight+2){
   const canScroll=e.deltaY>0?readingArea.scrollTop+readingArea.clientHeight<readingArea.scrollHeight-2:e.deltaY<0&&readingArea.scrollTop>2;
   if(canScroll)return;
  }
  let delta=vertical?e.deltaY:e.deltaX;
  if(!delta)return;
  e.preventDefault();
  delta=normalizeWheel(delta,e.deltaMode,window.innerHeight);
  const distance=mobile?Math.max(viewWidth*.76,255):clamp(width*.32,275,420);
  addDelta(clamp(delta,-240,240)/distance);
 },{passive:false});
 let start=null;
 function finishDrag(cancelled=false){
  if(!start)return;
  const gesture=start;
  start=null;stage.classList.remove('is-dragging');
  if(gesture.dragged){
   const speed=cancelled||performance.now()-gesture.time>110?0:gesture.speed;
   go(snapChapter(target,Math.round(gesture.position),speed,count-1,motion.dragProjection,.15));
  }
  if(stage.hasPointerCapture?.(gesture.id))stage.releasePointerCapture(gesture.id);
 }
 const stage=document.getElementById('commercial');
 stage.addEventListener('pointerdown',e=>{
  if(e.target.closest('button,summary,a,input,select,textarea')||(!mobile&&e.target.closest('.values-scroll'))||modal.hidden===false||e.button!==0)return;
  if(mobile&&!e.target.closest('.mobile-view'))return;
  cancelSettle();
  start={id:e.pointerId,x:e.clientX,y:e.clientY,position:current,type:e.pointerType,dragged:false,lastX:e.clientX,time:performance.now(),speed:0};
 });
 stage.addEventListener('pointermove',e=>{
  if(!start||e.pointerId!==start.id)return;
  const dx=e.clientX-start.x,dy=e.clientY-start.y;
  if(!start.dragged&&mobile&&start.type==='touch'&&Math.abs(dy)>9&&Math.abs(dy)>Math.abs(dx)){finishDrag(true);return;}
  if(!start.dragged&&(Math.abs(dx)<6||Math.abs(dx)<Math.abs(dy)))return;
  const now=performance.now();
  const distance=mobile?Math.max(viewWidth*.79,185):Math.max(readWidth*.72,350);
  if(!start.dragged){
   start.dragged=true;
   stop();velocity=0;
   stage.classList.add('is-dragging');
   stage.setPointerCapture?.(e.pointerId);
  }
  const dt=Math.max((now-start.time)/1000,.008);
  start.speed=start.speed*.48+clamp((start.lastX-e.clientX)/distance/dt,-5,5)*.52;
  start.lastX=e.clientX;start.time=now;
  current=target=clamp(start.position-dx/distance,0,count-1);
  paint();
 });
 stage.addEventListener('pointerup',e=>{if(start?.id===e.pointerId)finishDrag();});
 stage.addEventListener('pointercancel',e=>{if(start?.id===e.pointerId)finishDrag(true);});
 stage.addEventListener('lostpointercapture',e=>{if(start?.id===e.pointerId)finishDrag(true);});
 document.getElementById('mobile-current-button').addEventListener('click',()=>openPopup('Apartados'));
 mobileNextButton.addEventListener('click',()=>go(clamp(Math.round(target)+1,0,count-1)));
 document.getElementById('mobile-back').addEventListener('click',()=>{
    if(target>.03)go(Math.max(0,Math.round(target)-1));else openPopup('Apartados');
 });
 document.getElementById('desktop-back').addEventListener('click',()=>{
    if(target>.03)go(Math.max(0,Math.round(target)-1));else openPopup('Apartados');
 });
 document.querySelectorAll('[data-placeholder]').forEach(b=>b.addEventListener('click',()=>openPopup(b.dataset.placeholder)));
 function openPopup(title){modalTitle.textContent=title;overview.hidden=title!=='Apartados';modal.hidden=false}
 function closePopup(){modal.hidden=true}
 document.getElementById('popup-close').addEventListener('click',closePopup);
 modal.addEventListener('click',e=>{if(e.target===modal)closePopup()});
 window.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closePopup();return}
  if(mode!=='commercial'||!modal.hidden||!document.getElementById('locations-screen').hidden||e.target.closest?.('input,select,textarea,[contenteditable=true]'))return;
  if(['ArrowRight','ArrowLeft','PageDown','PageUp','Home','End'].includes(e.key)){
    e.preventDefault();if(e.key==='Home')go(0);else if(e.key==='End')go(count-1);
    else go(clamp(Math.round(target)+(e.key==='ArrowLeft'||e.key==='PageUp'?-1:1),0,count-1));
  }
 });
 window.addEventListener('resize',()=>{if(mode==='commercial'){resize();render();}},{passive:true});
 return { resize, reduced, clamp, commercialButton, financeButton, closePopup };
}
