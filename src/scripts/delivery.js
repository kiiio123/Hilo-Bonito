export function initDelivery() {
 const deliveryHolder=document.getElementById('delivery-holder');
 const deliveryTrigger=document.getElementById('delivery-trigger');
 const deliveryList=document.getElementById('delivery-list');
 const toast=document.getElementById('mini-toast');
 let toastTimer=0;
 function closeDelivery(){deliveryList.hidden=true;deliveryTrigger.setAttribute('aria-expanded','false')}
 function showToast(message){clearTimeout(toastTimer);toast.textContent=message;toast.hidden=false;toastTimer=setTimeout(()=>{toast.hidden=true},3500)}
 deliveryTrigger.addEventListener('click',()=>{
    const opening=deliveryList.hidden;deliveryList.hidden=!opening;deliveryTrigger.setAttribute('aria-expanded',String(opening));
 });
 deliveryList.querySelectorAll('[data-delivery]').forEach(b=>b.addEventListener('click',()=>{
     closeDelivery();showToast(b.dataset.delivery+' · Canal pendiente de configurar');
 }));
 document.addEventListener('click',e=>{if(!deliveryHolder.contains(e.target))closeDelivery()});

 return { closeDelivery };
}
