export function initLocations({ commercialButton, financeButton, closePopup, reduced, closeDelivery }) {
 const locationScreen=document.getElementById('locations-screen');
 const locationOpen=document.getElementById('open-locations');
 const locationClose=document.getElementById('close-locations');
 const departmentChoice=document.getElementById('department-choice');
 const cityChoice=document.getElementById('city-choice');
 const result=document.getElementById('sena-location-result');
 const empty=document.getElementById('no-locations');
 const mapFrame=document.getElementById('map-frame-wrapper');
 const noMap=document.getElementById('map-not-available');
 const mapFooter=document.getElementById('destination-links');
 const mapHeading=document.querySelector('.map-live-pill');
 function renderPlaces(){
  const found=departmentChoice.value==='Antioquia';
  cityChoice.replaceChildren();
  const c=document.createElement('option');c.textContent=found?'Medellín':'Sin sede cargada';c.value=found?'Medellín':'';cityChoice.appendChild(c);cityChoice.disabled=!found;
  result.hidden=!found;empty.hidden=found;mapFrame.hidden=!found;noMap.hidden=found;mapFooter.hidden=!found;mapHeading.hidden=!found;
  document.getElementById('locations-count').textContent=found?'01':'00';
  document.getElementById('map-location-title').textContent=found?'Institución Universitaria Salazar y Herrera':'Sin ubicación registrada';
  document.getElementById('map-location-subtitle').textContent=found?'Medellín, Antioquia':departmentChoice.value;
  document.getElementById('map-selected-address').textContent=found?'Cra. 70 #52-49 · Medellín':departmentChoice.value;
 }
 departmentChoice.addEventListener('change',renderPlaces);
 document.getElementById('return-antioquia').addEventListener('click',()=>{
    departmentChoice.value='Antioquia';renderPlaces();
 });
 document.getElementById('focus-sena').addEventListener('click',()=>{
    const node=document.getElementById('sena-map');
    node.src='https://www.openstreetmap.org/export/embed.html?bbox=-75.589926%2C6.257159%2C-75.580726%2C6.263759&layer=mapnik&marker=6.260459199%2C-75.58532592';
    if(window.innerWidth<=1024)document.getElementById('map-scene').scrollIntoView({behavior:reduced?'auto':'smooth',block:'nearest'});
 });
 locationOpen.addEventListener('click',()=>{closeDelivery();closePopup();locationScreen.hidden=false;});
 locationClose.addEventListener('click',()=>{locationScreen.hidden=true;});
 [commercialButton,financeButton].forEach(b=>b.addEventListener('click',()=>{locationScreen.hidden=true;closeDelivery()}));
 window.addEventListener('keydown',e=>{if(e.key==='Escape'){locationScreen.hidden=true;closeDelivery()}});
 renderPlaces();

}
