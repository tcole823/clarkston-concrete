const config = window.siteConfig || {};
// Analytics run only on the approved production host. No PII is sent in events.
const isConfirmation = location.pathname === '/thank-you/';
let receipt;try {receipt=JSON.parse(sessionStorage.getItem('estimateReceipt')||'null');}catch {}
const validReceipt = receipt && /^[0-9a-f-]{36}$/i.test(receipt.id) && Date.now()-receipt.at>=0 && Date.now()-receipt.at<86400000;
if(isConfirmation&&!validReceipt) location.replace('/#estimate');
const tracking = config.live && location.hostname === config.productionHost && (!isConfirmation||validReceipt);
if (tracking && (config.ga4 || config.ads)) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){ window.dataLayer.push(arguments); };
  gtag('js', new Date());
  if(config.ga4) gtag('config',config.ga4,{send_page_view:true});
  if(config.ads) gtag('config',config.ads);
  const script = document.createElement('script');script.async=true;
  script.src=`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.ga4||config.ads)}`;
  document.head.append(script);
}
function track(name, data = {}) { if(tracking && window.gtag) window.gtag('event',name,data); }
document.querySelectorAll('[data-track-call]').forEach(a=>a.addEventListener('click',()=>track('click_to_call')));
document.querySelectorAll('[data-project]').forEach(a=>a.addEventListener('click',()=>{document.getElementById('project').value=a.dataset.project;}));
const form = document.getElementById('estimate-form');
if(form) {
  let requestId = crypto.randomUUID();
  let token = '';
  let widget;
  const startedAt = Date.now();
  if(config.turnstileSiteKey) {
    window.onTurnstileLoad = () => {widget = window.turnstile.render('#spam-check',{sitekey:config.turnstileSiteKey,action:'estimate',callback:value=>token=value,'expired-callback':()=>token='','error-callback':()=>token=''});};
    const script = document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit';script.async=true;document.head.append(script);
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const status = document.getElementById('form-status');
    const button = form.querySelector('button[type=submit]');
    if(!form.reportValidity()) return;
    if(config.turnstileSiteKey && !token) {status.textContent='Please complete the verification and try again.';return;}
    button.disabled=true;status.textContent='Sending your request…';
    try {
      const payload={...Object.fromEntries(new FormData(form)),requestId,startedAt,turnstileToken:token};
      delete payload['cf-turnstile-response'];
      const response=await fetch('/api/estimate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const result=await response.json();
      if(!response.ok||!result.ok) throw new Error(result.message||'Your request could not be sent. Please try again.');
      try {sessionStorage.setItem('estimateReceipt',JSON.stringify({id:requestId,at:Date.now(),tracked:false}));}
      catch {status.textContent='Your project details were sent. Rob will follow up using the contact information you provided.';form.reset();button.hidden=true;return;}
      location.assign('/thank-you/');
    } catch(error) {status.textContent=error.message||'Your request could not be sent. Please try again.';}
    finally {button.disabled=false;if(window.turnstile&&widget!==undefined){window.turnstile.reset(widget);token='';}}
  });
}
const menu = document.querySelector('.menu-toggle');
const mobileNav = document.getElementById('mobile-nav');
if(menu && mobileNav) {
  menu.addEventListener('click',()=>{const expanded=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!expanded));mobileNav.hidden=expanded;});
  mobileNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');mobileNav.hidden=true;}));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!mobileNav.hidden){mobileNav.hidden=true;menu.setAttribute('aria-expanded','false');menu.focus();}});
}
if(isConfirmation && validReceipt) document.getElementById('confirmation-success')?.removeAttribute('hidden');
