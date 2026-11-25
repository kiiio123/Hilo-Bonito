export function initBudget({ makeMovableWindow, closeAnimatedWindow }) {
 const budgetDialog=document.getElementById('hb-budget-dialog');

 const budgetFormat=value=>'$ '+value.toLocaleString('es-CO');
 const budgetCloud=budgetDialog.querySelector('.hb-budget-cloud');
 const budgetCloudPoints=[...budgetCloud.querySelectorAll('.hb-budget-cloud-point')];
 const budgetGroupControls=[...budgetDialog.querySelectorAll('[data-budget-group]')].map(master=>({master,items:[...budgetDialog.querySelectorAll('.hb-budget-item[data-category="'+master.dataset.budgetGroup+'"]')]}));
 function layoutBudgetCloud(){
  const w=budgetCloud.clientWidth,h=budgetCloud.clientHeight;
  if(w<30||h<30)return;
  const max=Math.max(1,...budgetCloudPoints.map(p=>Number(p.dataset.amount)));
  const nodes=budgetCloudPoints.map((point,i)=>({point,i,value:Number(point.dataset.amount),r:Number(point.dataset.amount)>0?92*Math.sqrt(Number(point.dataset.amount)/max):23}));
  nodes.sort((a,b)=>b.r-a.r||a.i-b.i);
  const gap=9,placed=[];
  function bounds(list){return {left:Math.min(...list.map(n=>n.x-n.r)),right:Math.max(...list.map(n=>n.x+n.r)),top:Math.min(...list.map(n=>n.y-n.r)),bottom:Math.max(...list.map(n=>n.y+n.r))};}
  nodes.forEach((node,index)=>{
   if(!index){node.x=0;node.y=0;placed.push(node);return;}
   let best=null;
   placed.forEach(anchor=>{
    for(let i=0;i<48;i++){
     const angle=(i/48)*Math.PI*2;
     const d=anchor.r+node.r+gap;
     const candidate={...node,x:anchor.x+Math.cos(angle)*d,y:anchor.y+Math.sin(angle)*d};
     if(placed.some(p=>Math.hypot(candidate.x-p.x,candidate.y-p.y)<candidate.r+p.r+gap-.01))continue;
     const box=bounds([...placed,candidate]);
     const score=Math.max((box.right-box.left)/(w-20),(box.bottom-box.top)/(h-20))+.0001*Math.hypot(candidate.x,candidate.y);
     if(!best||score<best.score)best={...candidate,score};
    }
   });
   if(best){node.x=best.x;node.y=best.y;}
   else{const box=bounds(placed);node.x=box.right+node.r+gap;node.y=0;}
   placed.push(node);
  });
  const box=bounds(placed),width=box.right-box.left,height=box.bottom-box.top;
  const scale=Math.min((w-20)/width,(h-20)/height,1.1);
  placed.forEach(node=>{
   const diameter=2*node.r*scale;
   node.point.style.setProperty('--cloud-x',(w/2+(node.x-(box.left+box.right)/2)*scale)+'px');
   node.point.style.setProperty('--cloud-y',(h/2+(node.y-(box.top+box.bottom)/2)*scale)+'px');
   node.point.style.setProperty('--cloud-diameter',diameter+'px');
   node.point.dataset.labelSize=diameter>=102?'full':diameter>=52?'compact':'tiny';
  });
 }
 function updateBudget(){
  const sums={humanos:0,fisicos:0,tecnologicos:0,financieros:0};
  budgetDialog.querySelectorAll('.hb-budget-item[data-value][aria-pressed=true]').forEach(item=>{sums[item.dataset.category]+=Number(item.dataset.value);});
  const total=Object.values(sums).reduce((a,b)=>a+b,0);
  budgetGroupControls.forEach(({master,items})=>{
   const checked=items.filter(item=>item.getAttribute('aria-pressed')==='true').length;
   master.setAttribute('aria-pressed',checked===items.length?'true':checked===0?'false':'mixed');
  });
  budgetDialog.querySelector('.hb-budget-total').textContent=budgetFormat(total)+' COP';
  budgetDialog.querySelector('.hb-budget-bar').style.visibility='visible';
  Object.entries(sums).forEach(([category,value])=>{
   budgetDialog.querySelector('[data-subtotal="'+category+'"]').textContent=budgetFormat(value);
   budgetDialog.querySelector('[data-legend="'+category+'"]').textContent=budgetFormat(value);
   budgetDialog.querySelector('[data-bar="'+category+'"]').style.width=(total?value/total*100:0)+'%';
   const point=budgetDialog.querySelector('[data-cloud="'+category+'"]');
   const key=budgetDialog.querySelector('[data-cloud-link="'+category+'"]');
   const share=total?value/total*100:0;
   const shareText=share.toLocaleString('es-CO',{maximumFractionDigits:1})+'%';
   point.dataset.amount=String(value);
   point.classList.toggle('hb-cloud-empty',value===0);
   point.querySelector('.hb-budget-cloud-percent').textContent=shareText;
   key.querySelector('.hb-budget-cloud-value').textContent=budgetFormat(value);
   key.querySelector('.hb-cloud-key-share').textContent=shareText;
   const label=point.querySelector('.hb-budget-cloud-name').textContent+': '+budgetFormat(value)+', '+shareText+'. Ver recursos.';
   point.setAttribute('aria-label',label);point.title=label;
  });
  layoutBudgetCloud();
 }
 budgetDialog.querySelectorAll('button.hb-budget-item[data-value]').forEach(button=>button.addEventListener('click',()=>{
  button.setAttribute('aria-pressed',String(button.getAttribute('aria-pressed')!=='true'));
  updateBudget();
 }));
 budgetGroupControls.forEach(({master,items})=>master.addEventListener('click',()=>{
  const include=master.getAttribute('aria-pressed')!=='true';
  items.forEach(item=>item.setAttribute('aria-pressed',String(include)));
  updateBudget();
 }));
 budgetDialog.querySelectorAll('.hb-budget-cloud-point,.hb-budget-cloud-link').forEach(point=>point.addEventListener('click',()=>{
  const tab=budgetDialog.querySelector('[role=tab][data-category="'+(point.dataset.cloud||point.dataset.cloudLink)+'"]');
  if(tab){tab.click();tab.focus({preventScroll:true});}
 }));
 if(typeof ResizeObserver==='function')new ResizeObserver(()=>layoutBudgetCloud()).observe(budgetCloud);
 else window.addEventListener('resize',layoutBudgetCloud);
 [[budgetDialog,'hb-budget']].forEach(([dialog,prefix])=>{
  const trigger=document.getElementById(prefix+'-open');
  const tabs=[...dialog.querySelectorAll('[role=tab]')];
  function activate(tab){
   tabs.forEach(t=>{
    const selected=t===tab;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;
    document.getElementById(t.getAttribute('aria-controls')).hidden=!selected;
   });
   budgetDialog.querySelectorAll('.hb-budget-cloud-point,.hb-budget-cloud-link').forEach(point=>point.setAttribute('aria-pressed',String((point.dataset.cloud||point.dataset.cloudLink)===tab.dataset.category)));
  }
  tabs.forEach((tab,index)=>{
   tab.addEventListener('click',()=>activate(tab));
   tab.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();
    const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
    activate(tabs[next]);tabs[next].focus();
   });
  });
  makeMovableWindow(dialog);
  trigger.addEventListener('click',()=>{if(!dialog.open){dialog.showModal();if(dialog===budgetDialog)updateBudget();}});
  dialog.querySelector('.hb-activities-close').addEventListener('click',()=>closeAnimatedWindow(dialog));
  dialog.addEventListener('cancel',event=>{event.preventDefault();closeAnimatedWindow(dialog);});
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeAnimatedWindow(dialog);});
  dialog.addEventListener('close',()=>trigger.focus());
 });
 updateBudget();

}
