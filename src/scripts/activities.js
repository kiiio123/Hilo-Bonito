export function initActivities({ reduced }) {
 const activitiesDialog=document.getElementById('hb-activities-dialog');
 const activitiesOpen=document.getElementById('hb-activities-open');
 const activityScroll=document.getElementById('hb-activity-scroll');
 const activityCards=[...activitiesDialog.querySelectorAll('.hb-stage-card')];
 const activitySelectors=[...activitiesDialog.querySelectorAll('.hb-stage-select')];
 let activityIndex=0;
 function selectActivity(index,scroll=true){
  activityIndex=Math.max(0,Math.min(activityCards.length-1,index));
  const card=activityCards[activityIndex];
  activitySelectors.forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.stage)===activityIndex)));
  if(scroll){
   const bounds=card.getBoundingClientRect(),viewport=activityScroll.getBoundingClientRect();
   if(bounds.left<viewport.left||bounds.right>viewport.right){
    activityScroll.scrollTo({left:activityScroll.scrollLeft+bounds.left-viewport.left-(viewport.width-bounds.width)/2,behavior:reduced?'auto':'smooth'});
   }
  }
 }
 const activityDetailDialog=document.getElementById('hb-activity-detail-dialog');

 function makeMovableWindow(dialog){
  const handle=dialog.querySelector('.hb-window-handle');
  const grip=handle.querySelector('.hb-window-grip');
  let x=0,y=0,drag=null;
  const margin=6;
  function move(nextX,nextY){
   const rect=dialog.getBoundingClientRect();
   const baseLeft=rect.left-x,baseTop=rect.top-y;
   const minX=margin-baseLeft,maxX=window.innerWidth-margin-rect.width-baseLeft;
   const minY=margin-baseTop,maxY=window.innerHeight-margin-rect.height-baseTop;
   x=maxX<minX?(minX+maxX)/2:Math.max(minX,Math.min(maxX,nextX));
   y=maxY<minY?(minY+maxY)/2:Math.max(minY,Math.min(maxY,nextY));
   dialog.style.setProperty('--hb-window-x',x+'px');
   dialog.style.setProperty('--hb-window-y',y+'px');
  }
  function reset(){
   x=0;y=0;drag=null;
   dialog.style.removeProperty('--hb-window-x');
   dialog.style.removeProperty('--hb-window-y');
   dialog.classList.remove('hb-window-dragging');
  }
  handle.addEventListener('pointerdown',event=>{
   if(!event.isPrimary||event.button!==0||event.target.closest('.hb-activities-close'))return;
   if(!dialog.classList.contains('hb-window-closing'))dialog.getAnimations?.().forEach(animation=>{if(animation.animationName==='hb-polished-window-enter')animation.finish();});
   drag={id:event.pointerId,startX:event.clientX,startY:event.clientY,x,y};
   handle.setPointerCapture(event.pointerId);
   dialog.classList.add('hb-window-dragging');
   event.preventDefault();
  });
  handle.addEventListener('pointermove',event=>{
   if(!drag||drag.id!==event.pointerId)return;
   move(drag.x+event.clientX-drag.startX,drag.y+event.clientY-drag.startY);
  });
  function endDrag(event){
   if(!drag||drag.id!==event.pointerId)return;
   drag=null;dialog.classList.remove('hb-window-dragging');
   if(handle.hasPointerCapture(event.pointerId))handle.releasePointerCapture(event.pointerId);
  }
  ['pointerup','pointercancel','lostpointercapture'].forEach(type=>handle.addEventListener(type,endDrag));
  grip.addEventListener('keydown',event=>{
   const deltas={ArrowLeft:[-16,0],ArrowRight:[16,0],ArrowUp:[0,-16],ArrowDown:[0,16]};
   if(!deltas[event.key])return;
   event.preventDefault();event.stopPropagation();
   const [dx,dy]=deltas[event.key];move(x+dx,y+dy);
  });
  window.addEventListener('resize',()=>{if(dialog.open)move(x,y)});
  dialog.addEventListener('close',reset);
 }
 function closeAnimatedWindow(dialog){
  if(!dialog.open||dialog.classList.contains('hb-window-closing'))return;
  if(reduced||!dialog.animate){dialog.close();return;}
  const workspace=dialog.classList.contains('hb-bubble-workspace');
  const style=getComputedStyle(dialog),opacity=Number(style.opacity),transform=style.transform;
  dialog.classList.add('hb-window-closing');
  const motions=[];
  if(workspace){
   const bubbles=[...dialog.querySelectorAll('.hb-detail-bubble')].filter(b=>b.dataset.closing!=='true');
   bubbles.forEach((bubble,index)=>{
    const state=getComputedStyle(bubble);
    motions.push(bubble.animate([{opacity:state.opacity,transform:state.transform},{opacity:0,transform:'translateY(9px) scale(.965)'}],{duration:180,delay:Math.min(index*18,72),easing:'cubic-bezier(.4,0,1,1)',fill:'forwards'}));
   });
   const footer=dialog.querySelector('.hb-bubble-footer');
   if(footer)motions.push(footer.animate([{opacity:1},{opacity:0}],{duration:180,fill:'forwards'}));
  }
  const motion=dialog.animate([{opacity,transform:workspace?'none':transform},{opacity:0,transform:workspace?'none':'translateY(8px) scale(.975)'}],{duration:workspace?260:220,easing:'cubic-bezier(.4,0,1,1)',fill:'forwards'});
  motions.push(motion);
  Promise.allSettled(motions.map(animation=>animation.finished)).then(()=>{
   if(dialog.open)dialog.close();
   motions.forEach(animation=>animation.cancel());
   dialog.classList.remove('hb-window-closing');
  });
 }
 [activitiesDialog].forEach(dialog=>{
  makeMovableWindow(dialog);
  dialog.addEventListener('cancel',event=>{event.preventDefault();closeAnimatedWindow(dialog)});
 });


 const bubbleScroll=activityDetailDialog.querySelector('.hb-bubble-scroll');
 const bubbleCanvas=activityDetailDialog.querySelector('.hb-bubble-canvas');
 const openBubbles=new Map();
 const hbBubbleMoves=new WeakMap();
 let bubbleLayer=1,detailReturnIndex=0;
 function closeBubbleMenus(except=null){
  openBubbles.forEach(bubble=>{
   if(bubble===except)return;
   bubble.querySelector('.hb-bubble-menu').hidden=true;
   bubble.querySelector('.hb-window-grip').setAttribute('aria-expanded','false');
  });
 }
 function raiseBubble(bubble){bubble.style.zIndex=String(++bubbleLayer);}
 function refreshBubbleMenus(){
  openBubbles.forEach(bubble=>{
   const menu=bubble.querySelector('.hb-bubble-menu');
   menu.querySelectorAll('button').forEach(button=>{
    button.hidden=openBubbles.has(Number(button.dataset.index));
   });
   const available=Array.from(menu.querySelectorAll('button')).some(button=>!button.hidden);
   if(!available){
    menu.hidden=true;
    bubble.querySelector('.hb-window-grip').setAttribute('aria-expanded','false');
   }
  });
 }
 function layoutBubbles(animate=true){
  if(!activityDetailDialog.open)return;
  const bubbles=[...openBubbles.values()];
  const n=bubbles.length;
  if(!n)return;
  const previous=new Map();
  bubbles.forEach(bubble=>{
   if(animate&&!reduced&&bubble.style.left&&bubble.animate&&!bubble.classList.contains('hb-window-dragging'))previous.set(bubble,bubble.getBoundingClientRect());
   const motion=hbBubbleMoves.get(bubble);
   if(motion){motion.cancel();hbBubbleMoves.delete(bubble);}
  });
  const available=bubbleScroll.clientWidth;
  const viewportHeight=bubbleScroll.clientHeight;
  const pad=available<600?12:Math.min(44,Math.max(18,available*.032));
  const gap=available<600?14:22;
  const usable=Math.max(1,available-2*pad);
  const capacity=Math.min(n,Math.max(1,Math.floor((usable+gap)/(310+gap))));
  const preferredRows=n>=4?2:n===3&&viewportHeight>=620?2:1;
  const plans=[];
  for(let columns=1;columns<=capacity;columns++){
   const width=Math.min(n===1?420:460,Math.floor((usable-(columns-1)*gap)/columns));
   bubbles.forEach(bubble=>bubble.style.setProperty('--hb-bubble-width',Math.max(1,width)+'px'));
   const rowCount=Math.ceil(n/columns),rows=[];
   let cursor=0;
   for(let row=0;row<rowCount;row++){
    const take=Math.ceil((n-cursor)/(rowCount-row));
    let members=bubbles.slice(cursor,cursor+take);
    if(row%2)members=members.reverse();
    rows.push({members,height:Math.max(...members.map(bubble=>bubble.offsetHeight))});
    cursor+=take;
   }
   const required=2*pad+rows.reduce((total,row)=>total+row.height,0)+gap*(rowCount-1);
   const overflow=Math.max(0,required-viewportHeight);
   plans.push({width,rows,required,score:overflow*100+Math.abs(rowCount-preferredRows)*65+(460-width)*.12});
  }
  const plan=plans.sort((a,b)=>a.score-b.score)[0];
  const {rows,width}=plan;
  bubbles.forEach(bubble=>bubble.style.setProperty('--hb-bubble-width',Math.max(1,width)+'px'));
  rows.forEach(row=>row.height=Math.max(...row.members.map(bubble=>bubble.offsetHeight)));
  const minHeight=2*pad+rows.reduce((sum,row)=>sum+row.height,0)+gap*(rows.length-1);
  const height=Math.max(viewportHeight,minHeight);
  bubbleCanvas.style.height=height+'px';
  const spare=Math.max(0,height-minHeight);
  const stagger=rows.length===1?Math.min(spare,180):Math.min(82,spare/(rows.length*2));
  const extraGap=rows.length>1?Math.max(0,spare-stagger*rows.length)/(rows.length-1):0;
  let y=n===1?Math.max(pad,(height-rows[0].height)/2):pad;
  rows.forEach((row,r)=>{
   const count=row.members.length;
   const freeX=Math.max(0,usable-count*width-gap*(count-1));
   row.members.forEach((bubble,i)=>{
    const fraction=count===1?(n===1?.5:r%2?.82:.18):i/(count-1);
    const x=pad+i*(width+gap)+freeX*fraction;
    const wave=count===1?0:((r+i)%2===0?.08:.92);
    const room=Math.max(0,row.height-bubble.offsetHeight);
    const vertical=n===1?y:y+wave*(stagger+room);
    bubble.style.left=Math.round(x)+'px';bubble.style.top=Math.round(vertical)+'px';
   });
   y+=row.height+stagger+gap+extraGap;
  });
  previous.forEach((before,bubble)=>{
   const after=bubble.getBoundingClientRect(),dx=before.left-after.left,dy=before.top-after.top;
   if(Math.hypot(dx,dy)<1)return;
   const motion=bubble.animate([{translate:dx+'px '+dy+'px'},{translate:'0px 0px'}],{duration:340,easing:'cubic-bezier(.22,1,.36,1)'});
   hbBubbleMoves.set(bubble,motion);
   motion.finished.then(()=>{if(hbBubbleMoves.get(bubble)===motion)hbBubbleMoves.delete(bubble);},()=>{});
  });
 }
 function toggleBubbleMenu(bubble){
  const menu=bubble.querySelector('.hb-bubble-menu');
  refreshBubbleMenus();
  if(!Array.from(menu.querySelectorAll('button')).some(button=>!button.hidden))return;
  const show=menu.hidden;
  closeBubbleMenus(bubble);raiseBubble(bubble);
  menu.hidden=!show;
  bubble.querySelector('.hb-window-grip').setAttribute('aria-expanded',String(show));
 }
 function closeActivityBubble(index){
  const bubble=openBubbles.get(index);
  if(!bubble||bubble.dataset.closing==='true'||activityDetailDialog.classList.contains('hb-window-closing'))return;
  bubble.dataset.closing='true';closeBubbleMenus();
  const finish=()=>{
   if(openBubbles.get(index)!==bubble)return;
   bubble.remove();openBubbles.delete(index);refreshBubbleMenus();
   if(openBubbles.size===0)closeAnimatedWindow(activityDetailDialog);
   else{layoutBubbles();const last=[...openBubbles.values()].pop();last.querySelector('.hb-window-grip').focus({preventScroll:true});}
  };
  if(reduced||!bubble.animate){finish();return;}
  const state=getComputedStyle(bubble);
  bubble.animate([{opacity:state.opacity,transform:state.transform},{opacity:0,transform:'translateY(8px) scale(.965)'}],{duration:185,easing:'cubic-bezier(.4,0,1,1)',fill:'forwards'}).finished.then(finish,finish);
 }
 function enableBubbleDrag(bubble){
  const handle=bubble.querySelector('.hb-window-handle'),grip=bubble.querySelector('.hb-window-grip');
  let drag=null;
  function move(x,y){
   bubble.style.left=Math.max(6,Math.min(Math.max(6,bubbleCanvas.clientWidth-bubble.offsetWidth-6),x))+'px';
   bubble.style.top=Math.max(6,Math.min(Math.max(6,bubbleCanvas.clientHeight-bubble.offsetHeight-6),y))+'px';
  }
  bubble.addEventListener('pointerdown',()=>raiseBubble(bubble));
  handle.addEventListener('pointerdown',event=>{
   if(!event.isPrimary||event.button!==0||event.target.closest('.hb-activities-close'))return;
   const moving=hbBubbleMoves.get(bubble);
   if(moving){
    const current=bubble.getBoundingClientRect(),canvas=bubbleCanvas.getBoundingClientRect();
    moving.cancel();hbBubbleMoves.delete(bubble);
    bubble.style.left=(current.left-canvas.left)+'px';bubble.style.top=(current.top-canvas.top)+'px';
   }
   bubble.classList.remove('hb-bubble-enter');
   const rect=bubble.getBoundingClientRect(),canvasRect=bubbleCanvas.getBoundingClientRect();
   drag={id:event.pointerId,startX:event.clientX,startY:event.clientY,x:rect.left-canvasRect.left,y:rect.top-canvasRect.top,fromGrip:!!event.target.closest('.hb-window-grip'),moved:false};
   handle.setPointerCapture(event.pointerId);
   event.preventDefault();
  });
  handle.addEventListener('pointermove',event=>{
   if(!drag||drag.id!==event.pointerId)return;
   const dx=event.clientX-drag.startX,dy=event.clientY-drag.startY;
   if(!drag.moved&&Math.hypot(dx,dy)<5)return;
   if(!drag.moved){drag.moved=true;closeBubbleMenus();bubble.classList.add('hb-window-dragging');}
   move(drag.x+dx,drag.y+dy);
  });
  function end(event){
   if(!drag||drag.id!==event.pointerId)return;
   const tap=event.type==='pointerup'&&!drag.moved&&drag.fromGrip;
   drag=null;bubble.classList.remove('hb-window-dragging');
   if(handle.hasPointerCapture(event.pointerId))handle.releasePointerCapture(event.pointerId);
   if(tap){toggleBubbleMenu(bubble);grip.focus({preventScroll:true});}
  }
  ['pointerup','pointercancel','lostpointercapture'].forEach(type=>handle.addEventListener(type,end));
  grip.addEventListener('click',event=>{if(event.detail===0)toggleBubbleMenu(bubble);});
  grip.addEventListener('keydown',event=>{
   const delta={ArrowLeft:[-16,0],ArrowRight:[16,0],ArrowUp:[0,-16],ArrowDown:[0,16]}[event.key];
   if(!delta)return;
   event.preventDefault();event.stopPropagation();move(bubble.offsetLeft+delta[0],bubble.offsetTop+delta[1]);
  });
 }
 function openActivityDetail(index){
  if(activityDetailDialog.classList.contains('hb-window-closing'))return;
  index=Math.max(0,Math.min(activityCards.length-1,index));
  selectActivity(index);
  const existing=openBubbles.get(index);
  closeBubbleMenus();
  if(existing){raiseBubble(existing);existing.querySelector('.hb-window-grip').focus({preventScroll:true});existing.scrollIntoView({block:'nearest',inline:'nearest',behavior:reduced?'auto':'smooth'});return;}
  const card=activityCards[index];
  const bubble=document.createElement('article');
  bubble.className='hb-detail-bubble'+(index%2?' hb-detail-pink':'');
  bubble.setAttribute('aria-labelledby','hb-bubble-title-'+index);
  bubble.innerHTML='<div class="hb-activity-detail-inner"><div class="hb-activity-detail-top hb-window-handle"><span class="eyebrow">PASO '+(index+1)+'</span><button type="button" class="hb-window-grip" aria-label="Abrir menú de actividades o arrastrar ventana" aria-expanded="false" title="Clic: otras actividades. Arrastra para mover."><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><circle cx="8" cy="6" r="1.5"/><circle cx="16" cy="6" r="1.5"/><circle cx="8" cy="12" r="1.5"/><circle cx="16" cy="12" r="1.5"/><circle cx="8" cy="18" r="1.5"/><circle cx="16" cy="18" r="1.5"/></svg></button><button type="button" class="hb-activities-close" aria-label="Cerrar detalle">×</button></div><div class="hb-bubble-menu" aria-label="Otras actividades" hidden></div><h3 id="hb-bubble-title-'+index+'"></h3><p class="hb-bubble-description"></p><div class="hb-activity-detail-meta"><span class="hb-activity-detail-label">Fecha</span><p class="hb-bubble-date"></p><span class="hb-activity-detail-label">Responsables</span><p class="hb-bubble-responsible"></p></div></div>';
  bubble.querySelector('h3').textContent=card.querySelector('.hb-stage-name').textContent;
  bubble.querySelector('.hb-bubble-description').textContent=card.dataset.detail;
  bubble.querySelector('.hb-bubble-date').textContent=card.dataset.date;
  bubble.querySelector('.hb-bubble-responsible').textContent=card.dataset.responsible;
  const menu=bubble.querySelector('.hb-bubble-menu');
  activityCards.forEach((other,i)=>{
   if(i===index)return;
   const button=document.createElement('button');
   button.type='button';button.textContent=String(i+1);button.dataset.index=String(i);
   button.setAttribute('aria-label','Abrir '+other.querySelector('.hb-stage-name').textContent);
   button.addEventListener('click',()=>openActivityDetail(i));
   menu.append(button);
  });
  bubble.querySelector('.hb-activities-close').addEventListener('click',()=>closeActivityBubble(index));
  openBubbles.set(index,bubble);bubbleCanvas.append(bubble);enableBubbleDrag(bubble);raiseBubble(bubble);refreshBubbleMenus();
  if(!activityDetailDialog.open){detailReturnIndex=index;activityDetailDialog.showModal();bubbleScroll.scrollTop=0;}
  layoutBubbles(openBubbles.size>1);
  bubble.classList.add('hb-bubble-enter');
  bubble.addEventListener('animationend',()=>bubble.classList.remove('hb-bubble-enter'),{once:true});
  bubble.querySelector('.hb-window-grip').focus({preventScroll:true});
  if(bubble.offsetTop+bubble.offsetHeight>bubbleScroll.scrollTop+bubbleScroll.clientHeight){
   bubbleScroll.scrollTo({top:Math.max(0,bubble.offsetTop-14),behavior:reduced?'auto':'smooth'});
  }
 }
 activitySelectors.forEach(button=>button.addEventListener('click',()=>openActivityDetail(Number(button.dataset.stage))));
 document.getElementById('hb-close-all-bubbles').addEventListener('click',()=>{
  if(!activityDetailDialog.open||activityDetailDialog.classList.contains('hb-window-closing'))return;
  closeBubbleMenus();
  closeAnimatedWindow(activityDetailDialog);
 });
 activityDetailDialog.addEventListener('cancel',event=>{
  event.preventDefault();
  const entries=[...openBubbles.entries()].sort((a,b)=>Number(b[1].style.zIndex)-Number(a[1].style.zIndex));
  if(!entries.length){activityDetailDialog.close();return;}
  const [index,bubble]=entries[0];
  if(!bubble.querySelector('.hb-bubble-menu').hidden){closeBubbleMenus();return;}
  closeActivityBubble(index);
 });
 activityDetailDialog.addEventListener('click',event=>{
  if(event.target===bubbleCanvas||event.target===bubbleScroll)closeBubbleMenus();
 });
 activityDetailDialog.addEventListener('close',()=>{
  openBubbles.clear();bubbleCanvas.replaceChildren();bubbleCanvas.style.removeProperty('height');
  activityCards[detailReturnIndex].focus({preventScroll:true});
 });
 window.addEventListener('resize',()=>{if(activityDetailDialog.open)layoutBubbles(false);});

 function bindControls() {
 activitiesOpen.addEventListener('click',()=>{
  if(!activitiesDialog.open){activitiesDialog.showModal();activityScroll.scrollLeft=0;activityIndex=0;activitySelectors.forEach(button=>button.setAttribute('aria-pressed','false'));}
 });
 document.getElementById('hb-activities-close').addEventListener('click',()=>closeAnimatedWindow(activitiesDialog));
 activitiesDialog.addEventListener('click',event=>{
  if(event.target!==activitiesDialog)return;
  const box=activitiesDialog.getBoundingClientRect();
  if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)closeAnimatedWindow(activitiesDialog);
 });
 activitiesDialog.addEventListener('close',()=>activitiesOpen.focus());
 activitiesDialog.addEventListener('keydown',event=>{
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();selectActivity(activityIndex+(event.key==='ArrowRight'?1:-1));}
 });

 }
 return { makeMovableWindow, closeAnimatedWindow, bindControls };
}
