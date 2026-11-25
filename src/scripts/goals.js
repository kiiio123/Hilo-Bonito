export function initGoals({ reduced, clamp, makeMovableWindow, closeAnimatedWindow }) {
 const hbGoalsData=[{"name":"Cumplimiento y Puntualidad","tabBadge":"Meta 1 · Puntualidad","tabTitle":"Entregas a Tiempo (98 %)","tag":"Meta 1 · Cumplimiento y Puntualidad","progress":0,"target":98,"slider":"Entregas a Tiempo (%)","statement":"Entregar al menos el 98 % de los uniformes y pedidos en la fecha pactada durante el inicio del primer trimestre académico de 2027.","formula":"(Pedidos entregados en la fecha acordada / Total de pedidos recibidos) × 100","leader":"Geraldine Ardila Buitrago y Any Tatiana Barrera (Gestión comercial y despacho)","targetLabel":"≥ 98 % de puntualidad en entregas","timeline":"Primer trimestre académico 2027 · Medición semanal","actionTitle":"Acción para garantizar entregas puntuales","actions":["Organizar una agenda digital con fechas límite por pedido y alertas previas de despacho.","Distribuir equitativamente las cargas de corte, confección y empacado entre los dos operarios según prioridad de entrega.","Mantener stock preventivo de telas base y ejecutar mantenimiento preventivo de las máquinas planas y fileteadoras antes de semanas pico."]},{"name":"Calidad y Acabados Impecables","tabBadge":"Meta 2 · Calidad","tabTitle":"Cero Reprocesos (95 %)","tag":"Meta 2 · Calidad y Acabados Impecables","progress":0,"target":95,"slider":"Prendas aprobadas sin reprocesos (%)","statement":"Garantizar un 95 % de aprobación en el control de calidad a la primera entrega, sin fallas en costuras, horma o desigualdad en los tonos de tela.","formula":"(Prendas aprobadas sin reprocesos en primera revisión / Total de prendas confeccionadas) × 100","leader":"Operario 1 y Operario 2 junto con supervisión de fundadoras","targetLabel":"≥ 95 % de prendas aprobadas a la primera","timeline":"Enero – Marzo 2027 · Revisión por cada lote producido","actionTitle":"Acción para asegurar calidad y uniformidad de tonos","actions":["Verificar el lote y tono exacto de cada rollo de tela con los proveedores de Medellín antes de iniciar el corte.","Aplicar una lista de chequeo obligatoria antes del empaque: revisión de medidas, tensión de puntadas, botones y limpieza de hebras.","Realizar planchado industrial a vapor en cada prenda terminada para asegurar presentación impecable y horma perfecta."]},{"name":"Posicionamiento y Satisfacción","tabBadge":"Meta 3 · Crecimiento","tabTitle":"150 Clientes SENA (90 %)","tag":"Meta 3 · Posicionamiento y Satisfacción","progress":0,"target":90,"slider":"Avance del indicador de clientes (%)","statement":"Captar los primeros 150 aprendices y clientes frecuentes alrededor del Complejo Central SENA en el primer trimestre de operación, logrando al menos 90 % de satisfacción.","formula":"(Número de clientes nuevos atendidos y encuestados con calificación positiva / 150 clientes meta) × 100","leader":"Geraldine Ardila Buitrago y Any Tatiana Barrera (Atención al cliente y mercadeo)","targetLabel":"150 clientes SENA y ≥ 90 % de satisfacción","timeline":"Enero – Marzo 2027 · Seguimiento quincenal","actionTitle":"Acción para atraer aprendices y fidelizar clientes","actions":["Exhibir muestras físicas de uniformes con acabados limpios en el local estratégico cercano a la Sede Buenos Aires del SENA.","Lanzar campañas en redes sociales con combos de uniformes institucionales y descuentos por referidos entre aprendices.","Brindar asesoría personalizada y transparente sobre tallas, telas y precios justos, aplicando una encuesta breve posventa."]}];
 const hbGoalsDialog=document.getElementById('hb-goals-dialog');
 const hbGoalsOpen=document.getElementById('hb-goals-open');
 const hbGoalsSelect=document.getElementById('hb-goals-select');
 const hbGoalsSlider=document.getElementById('hb-goals-slider');
 const hbGoalsArc=document.getElementById('hb-goals-arc');
 const hbGoalsMarker=document.getElementById('hb-goals-target-marker');
 const hbGoalsProgress=hbGoalsData.map(goal=>goal.progress);
 const goalText=(id,value)=>{document.getElementById(id).textContent=value??'Por confirmar';};
 function renderHbGoal(changeGoal=false){
  const index=Number(hbGoalsSelect.value),goal=hbGoalsData[index];
  if(changeGoal)hbGoalsSlider.value=String(hbGoalsProgress[index]);
  const progress=Number(hbGoalsSlider.value);
  hbGoalsProgress[index]=progress;
  const t=clamp((progress-60)/(Math.max(goal.target,61)-60),0,1);
  const pink=[230,170,194],mint=[124,185,155];
  const color='rgb('+pink.map((v,i)=>Math.round(v+(mint[i]-v)*t)).join(',')+')';
  hbGoalsDialog.querySelector('.hb-goals-inner').style.setProperty('--hb-goal-color',color);
  hbGoalsSlider.style.setProperty('--hb-goal-progress',progress+'%');
  hbGoalsArc.style.stroke=color;
  hbGoalsArc.style.strokeDashoffset=String(100-progress);
  hbGoalsArc.style.opacity=progress===0?'0':'1';
  hbGoalsMarker.style.display=goal.target===null?'none':'';
  if(goal.target!==null){
   const angle=Math.PI*(1-goal.target/100);
   hbGoalsMarker.setAttribute('cx',180+140*Math.cos(angle));
   hbGoalsMarker.setAttribute('cy',153-140*Math.sin(angle));
  }
  goalText('hb-goals-percent',progress+' %');
  goalText('hb-goals-target',goal.target===null?'Objetivo: por confirmar':'Objetivo: '+goal.target+' %');
  goalText('hb-goals-gauge-title',goal.name+': '+progress+' % de avance simulado');
  goalText('hb-goals-output',progress+' %');
  goalText('hb-goals-status',progress>=goal.target?'¡Meta alcanzada!':progress>60?'Transición activa hacia verde menta (>60 %)':'Etapa inicial (≤ 60 %)');
  if(changeGoal){
   goalText('hb-goals-name',goal.tag);
   goalText('hb-goals-target-label',goal.targetLabel);
   const statement=document.getElementById('hb-goals-statement');
   statement.textContent=goal.statement??'';
   statement.hidden=!goal.statement;
   goalText('hb-goals-timeline',goal.timeline);
   goalText('hb-goals-formula',goal.formula);
   goalText('hb-goals-leader',goal.leader);
   goalText('hb-goals-slider-label',goal.slider);
   goalText('hb-goals-action-caption','¿Cómo alcanzaremos esta meta?');
   goalText('hb-goals-action-title',goal.actionTitle);
   const list=document.getElementById('hb-goals-action-list');list.replaceChildren();
   goal.actions.forEach(action=>{const li=document.createElement('li');li.textContent=action;list.append(li);});
   if(!reduced&&hbGoalsDialog.open&&hbGoalsDialog.querySelector('.hb-goals-meta').animate){
    [hbGoalsDialog.querySelector('.hb-goals-meta'),hbGoalsDialog.querySelector('.hb-goals-actions')].forEach(node=>{
     node.getAnimations().forEach(a=>a.cancel());node.animate([{opacity:.6,transform:'translateY(3px)'},{opacity:1,transform:'translateY(0)'}],{duration:200,easing:'ease-out'});
    });
   }
  }
 }
 hbGoalsSelect.addEventListener('change',()=>renderHbGoal(true));
 hbGoalsSlider.addEventListener('input',()=>renderHbGoal());
 makeMovableWindow(hbGoalsDialog);
 hbGoalsOpen.addEventListener('click',()=>{if(!hbGoalsDialog.open){renderHbGoal(true);hbGoalsDialog.showModal();}});
 hbGoalsDialog.querySelector('.hb-activities-close').addEventListener('click',()=>closeAnimatedWindow(hbGoalsDialog));
 hbGoalsDialog.addEventListener('cancel',event=>{event.preventDefault();closeAnimatedWindow(hbGoalsDialog);});
 hbGoalsDialog.addEventListener('click',event=>{if(event.target!==hbGoalsDialog)return;const r=hbGoalsDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeAnimatedWindow(hbGoalsDialog);});
 hbGoalsDialog.addEventListener('close',()=>hbGoalsOpen.focus());
 renderHbGoal(true);

}
