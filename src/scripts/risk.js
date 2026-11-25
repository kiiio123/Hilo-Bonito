export function initRisk({ reduced, clamp, makeMovableWindow, closeAnimatedWindow }) {
 const hbRiskData=[{"title":"Desabastecimiento de telas","category":"Abastecimiento","risk":"Desabastecimiento de telas en los tonos institucionales exactos o demoras por parte de los proveedores en temporadas de alta demanda académica.","plan":"Contar con una red de proveedores principales y de respaldo en Medellín, manteniendo un stock preventivo de materia prima básica antes del inicio de cada trimestre.","p":4,"i":4,"metric":null,"assumed":true},{"title":"Cuellos de botella en producción","category":"Operativo","risk":"Acumulación de pedidos en semanas pico (inicio de trimestre académico) o fallas mecánicas en las máquinas de coser que retrasen las entregas.","plan":"Establecer un cronograma estricto de mantenimiento preventivo para las máquinas y distribuir la carga entre las fundadoras y los dos operarios según fechas límite de entrega.","p":4,"i":4,"metric":45,"unit":"pedidos atrasados","assumed":false},{"title":"Baja visibilidad comercial","category":"Comercial","risk":"Que los aprendices sigan comprando por costumbre en los dos talleres tradicionales cercanos al Complejo Central SENA al desconocer la nueva oferta.","plan":"Implementar campañas activas en redes sociales, exhibición de muestras físicas de alta calidad en el local y promociones de lanzamiento por referidos o combos de uniformes.","p":4,"i":3,"metric":60,"assumed":false},{"title":"Incremento en costos de insumos","category":"Financiero","risk":"Incremento inesperado en el precio de las telas, hilos o servicios públicos que reduzca el margen de ganancia frente a los precios justos prometidos.","plan":"Negociar compras por volumen con los proveedores principales y mantener el fondo de reserva financiero destinado a contingencias de materia prima.","p":3,"i":4,"metric":null,"assumed":true}];
 const hbRiskDialog=document.getElementById('hb-risk-dialog');
 const hbRiskOpen=document.getElementById('hb-risk-open');
 const hbRiskSelect=document.getElementById('hb-risk-select');
 const hbRiskPressure=document.getElementById('hb-risk-pressure');
 const hbRiskToggles=[...hbRiskDialog.querySelectorAll('[data-mitigated]')];
 let hbRiskMitigated=false;
 let hbRiskManualCell=null;
 const hbRiskCells=[...hbRiskDialog.querySelectorAll('.hb-risk-cell')];
 let hbRiskVisualPosition=null,hbRiskMotionFrame=null,hbRiskLastSelection=null;
 const hbRiskPoint=document.getElementById('hb-risk-point');
 const hbRiskLineX=document.getElementById('hb-risk-cross-x');
 const hbRiskLineY=document.getElementById('hb-risk-cross-y');
 function paintHbRiskPosition(x,y){
  hbRiskVisualPosition={x,y};
  hbRiskPoint.style.transform='translate('+x+'px,'+y+'px)';
  hbRiskLineX.setAttribute('y1',y);hbRiskLineX.setAttribute('y2',y);hbRiskLineX.setAttribute('x2',x);
  hbRiskLineY.setAttribute('x1',x);hbRiskLineY.setAttribute('x2',x);hbRiskLineY.setAttribute('y1',y);
 }
 function moveHbRiskPoint(x,y){
  if(hbRiskMotionFrame!==null){cancelAnimationFrame(hbRiskMotionFrame);hbRiskMotionFrame=null;}
  if(reduced||!hbRiskVisualPosition||!hbRiskDialog.open){paintHbRiskPosition(x,y);return;}
  const start={...hbRiskVisualPosition};
  if(start.x===x&&start.y===y)return;
  let first=null;
  function step(time){
   if(first===null)first=time;
   const t=Math.min(1,(time-first)/270),eased=1-Math.pow(1-t,3);
   paintHbRiskPosition(start.x+(x-start.x)*eased,start.y+(y-start.y)*eased);
   hbRiskMotionFrame=t<1?requestAnimationFrame(step):null;
  }
  hbRiskMotionFrame=requestAnimationFrame(step);
 }
 function hbRiskText(id,value){
  const node=document.getElementById(id);
  if(node.textContent===value)return;
  node.textContent=value;
  if(!reduced&&hbRiskDialog.open&&node.animate&&['hb-risk-severity','hb-risk-metric','hb-risk-status'].includes(id)){
   node.getAnimations().forEach(animation=>animation.cancel());
   node.animate([{opacity:.55,transform:'translateY(2px)'},{opacity:1,transform:'translateY(0)'}],{duration:180,easing:'ease-out'});
  }
 }
 function renderHbRisk(){
  const risk=hbRiskData[Number(hbRiskSelect.value)];
  const pressure=Number(hbRiskPressure.value);
  const baseP=clamp(risk.p+Math.round((pressure-50)/25),1,5);
  const baseI=clamp(risk.i+Math.round((pressure-50)/50),1,5);
  const p=hbRiskManualCell?hbRiskManualCell.p:hbRiskMitigated?Math.ceil(baseP/2):baseP;
  const i=hbRiskManualCell?hbRiskManualCell.i:hbRiskMitigated?Math.ceil(baseI/2):baseI;
  const score=p*i;
  const level=score<=5?'low':score>=12?'critical':'medium';
  const severity=document.getElementById('hb-risk-severity');
  hbRiskText('hb-risk-severity',level==='low'?'Bajo':level==='critical'?'Crítico':'Moderado');
  severity.dataset.state=level;
  const metric=risk.metric===null?null:Math.round(risk.metric*(score/(risk.p*risk.i))*(.5+pressure/100)*(hbRiskMitigated?.7:1));
  document.getElementById('hb-risk-metric-label').textContent=metric===null?'Índice de riesgo':'Métrica estimada';
  hbRiskText('hb-risk-metric',metric===null?score+'/25':String(metric));
  hbRiskCells.forEach(cell=>cell.setAttribute('aria-pressed',String(Number(cell.dataset.probability)===p&&Number(cell.dataset.impact)===i)));
  document.getElementById('hb-risk-current').textContent=(hbRiskManualCell?'Escenario seleccionado · ':'Escenario simulado · ')+'Probabilidad: '+p+'/5 · Impacto: '+i+'/5 · Índice: '+score+'/25';
  const status=document.getElementById('hb-risk-status');
  hbRiskText('hb-risk-status',hbRiskMitigated?'Mitigado':'Activo');status.dataset.state=hbRiskMitigated?'low':'critical';
  const x=68+(p-.5)*104,y=20+(5-i+.5)*48;
  moveHbRiskPoint(x,y);
  document.getElementById('hb-risk-point-label').textContent=risk.category;
  hbRiskPoint.dataset.state=level;
  document.getElementById('hb-risk-matrix-title').textContent=risk.category+': probabilidad '+p+' de 5, impacto '+i+' de 5. '+severity.textContent;
  hbRiskText('hb-risk-event',risk.risk);
  hbRiskText('hb-risk-action',risk.plan);
  if(hbRiskLastSelection!==risk.category){
   hbRiskLastSelection=risk.category;
   if(!reduced&&hbRiskDialog.open)hbRiskDialog.querySelectorAll('.hb-risk-details article').forEach(article=>{
    if(!article.animate)return;
    article.getAnimations().forEach(animation=>animation.cancel());
    article.animate([{opacity:.55,transform:'translateY(3px)'},{opacity:1,transform:'translateY(0)'}],{duration:210,easing:'ease-out'});
   });
  }
  document.getElementById('hb-risk-base-i').textContent=risk.i+'/5';
  document.getElementById('hb-risk-base-p').textContent=risk.p+'/5';
  document.getElementById('hb-risk-base-metric-label').textContent=risk.metric===null?'Índice base provisional:':'Métrica crítica esperada:';
  document.getElementById('hb-risk-base-metric').textContent=risk.metric===null?(risk.p*risk.i)+'/25':risk.metric+(risk.unit?' '+risk.unit:'');
  document.getElementById('hb-risk-note').textContent=risk.assumed?'Simulación ilustrativa: valores base provisionales. El índice es probabilidad × impacto; la métrica específica está pendiente de confirmar.':'Simulación ilustrativa: valores base de la referencia; variaciones según presión y contingencia estimadas.';
  document.getElementById('hb-risk-pressure-value').textContent=pressure+' %';
  hbRiskPressure.style.setProperty('--hb-risk-progress',pressure+'%');
  hbRiskDialog.querySelector('.hb-risk-toggle').dataset.applied=String(hbRiskMitigated);
  hbRiskToggles.forEach(button=>button.setAttribute('aria-pressed',String((button.dataset.mitigated==='true')===hbRiskMitigated)));
 }
 function resetHbRiskScenario(){hbRiskManualCell=null;renderHbRisk();}
 hbRiskSelect.addEventListener('change',resetHbRiskScenario);
 hbRiskPressure.addEventListener('input',resetHbRiskScenario);
 hbRiskToggles.forEach(button=>button.addEventListener('click',()=>{hbRiskMitigated=button.dataset.mitigated==='true';resetHbRiskScenario();}));
 hbRiskCells.forEach(cell=>{
  function selectCell(){
   hbRiskManualCell={p:Number(cell.dataset.probability),i:Number(cell.dataset.impact)};
   renderHbRisk();
  }
  cell.addEventListener('click',selectCell);
  cell.addEventListener('keydown',event=>{
   if(event.key==='Enter'||event.key===' '){event.preventDefault();selectCell();}
   const step={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,1],ArrowDown:[0,-1]}[event.key];
   if(!step)return;
   event.preventDefault();
   const p=clamp(Number(cell.dataset.probability)+step[0],1,5),i=clamp(Number(cell.dataset.impact)+step[1],1,5);
   const neighbor=hbRiskCells.find(c=>Number(c.dataset.probability)===p&&Number(c.dataset.impact)===i);
   if(neighbor)neighbor.focus();
  });
 });
 makeMovableWindow(hbRiskDialog);
 hbRiskOpen.addEventListener('click',()=>{if(!hbRiskDialog.open){renderHbRisk();hbRiskDialog.showModal();}});
 hbRiskDialog.querySelector('.hb-activities-close').addEventListener('click',()=>closeAnimatedWindow(hbRiskDialog));
 hbRiskDialog.addEventListener('cancel',event=>{event.preventDefault();closeAnimatedWindow(hbRiskDialog);});
 hbRiskDialog.addEventListener('click',event=>{if(event.target!==hbRiskDialog)return;const r=hbRiskDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeAnimatedWindow(hbRiskDialog);});
 hbRiskDialog.addEventListener('close',()=>hbRiskOpen.focus());
 renderHbRisk();

}
