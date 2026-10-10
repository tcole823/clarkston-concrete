// Track on this page only after a successful server response. No customer data.
if(validReceipt && !receipt.tracked && tracking && window.gtag) {
  window.gtag('event','generate_lead',{form_name:'estimate',transaction_id:receipt.id});
  if(config.ads&&config.conversion)window.gtag('event','conversion',{send_to:`${config.ads}/${config.conversion}`,transaction_id:receipt.id});
  receipt.tracked=true;sessionStorage.setItem('estimateReceipt',JSON.stringify(receipt));
}
