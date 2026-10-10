import company from '../src/company.mjs';
const reply = (res,status,message,ok=false)=>res.status(status).json({ok,message});
const text = (v,max)=>typeof v==='string'&&v.length<=max?v.trim():null;
export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST'){res.setHeader('Allow','POST');return reply(res,405,'Please submit the estimate form.');}
  const allowed=new Set([`https://${company.previewHost}`,...(company.productionHost?[`https://${company.productionHost}`]:[]),...(process.env.FORM_ALLOWED_ORIGINS||'').split(',').map(s=>s.trim()).filter(Boolean)]);
  if(!allowed.has(req.headers.origin)) return reply(res,403,'Please submit from the Clarkston Concrete website.');
  if(!req.headers['content-type']?.startsWith('application/json')) return reply(res,415,'Please use the estimate form.');
  if(Number(req.headers['content-length']||0)>12000) return reply(res,413,'Please shorten your project details.');
  let body=req.body;
  try {if(typeof body==='string')body=JSON.parse(body);}catch{return reply(res,400,'Please check your information.');}
  if(!body||typeof body!=='object'||Array.isArray(body)||JSON.stringify(body).length>12000) return reply(res,400,'Please check your information.');
  if(body.website) return reply(res,400,'Your request could not be sent.');
  const name=text(body.name,100),phone=text(body.phone,30),email=text(body.email??'',254),city=text(body.city,100),project=text(body.project,100),message=text(body.message??'',3000);
  const squareFeet=text(body.squareFeet??'',20);
  if(squareFeet===null||(squareFeet!==''&&(!/^\d+(?:\.\d+)?$/.test(squareFeet)||Number(squareFeet)<1||Number(squareFeet)>100000))) return reply(res,400,'Please enter an approximate project size of at least 1 square foot, or leave it blank.');
  const projects=new Set(['Not sure yet',...company.services.map(x=>x.name),'Another project']);
  if(!name||!city||!phone||phone.replace(/\D/g,'').length<7||phone.replace(/\D/g,'').length>15||email===null||message===null||!projects.has(project)||/[\r\n]/.test(name+phone+email+city)||(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return reply(res,400,'Please check your name, phone, location, and email.');
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.requestId??'')) return reply(res,400,'Please refresh the page and try again.');
  if(!Number.isFinite(body.startedAt)||Date.now()-body.startedAt<1500||Date.now()-body.startedAt>86400000) return reply(res,400,'Please take a moment to complete the form, or refresh and try again.');
  if(!process.env.RESEND_API_KEY||!process.env.ESTIMATE_TO||!process.env.ESTIMATE_FROM) return reply(res,503,'Online requests are not available yet. Please call (248) 535-1598.');
  // Public hosted forms require Turnstile, including the client preview.
  if((process.env.SITE_LIVE==='true'||process.env.VERCEL==='1')&&!process.env.TURNSTILE_SECRET_KEY) return reply(res,503,'Online requests are temporarily unavailable. Please try again later.');
  try {
    if(process.env.TURNSTILE_SECRET_KEY) {
      const token=text(body.turnstileToken,2048);
      if(!token)return reply(res,400,'Please complete the verification.');
      const verification=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:process.env.TURNSTILE_SECRET_KEY,response:token}),signal:AbortSignal.timeout(8000)});
      const result=await verification.json();
      if(!result.success||result.hostname!==new URL(req.headers.origin).hostname||result.action!=='estimate')return reply(res,400,'Verification expired. Please try again.');
    }
    const notification=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`estimate/${body.requestId}`},body:JSON.stringify({from:process.env.ESTIMATE_FROM,to:process.env.ESTIMATE_TO.split(',').map(s=>s.trim()).filter(Boolean),...(email?{reply_to:email}:{}),subject:`${company.name} estimate request`,text:`New estimate request\n\nName: ${name}\nPhone: ${phone}\nEmail: ${email||'Not provided'}\nCity / ZIP: ${city}\nProject: ${project}\nApproximate project size: ${squareFeet?`${squareFeet} square feet`:'Not provided'}\n\nDetails:\n${message||'Not provided'}\n\nRequest ID: ${body.requestId}`}),signal:AbortSignal.timeout(10000)});
    const result=await notification.json();
    if(!notification.ok||!result.id)return reply(res,502,'Your request could not be sent. Please try again or call (248) 535-1598.');
    return reply(res,200,'Estimate request sent.',true);
  } catch {return reply(res,502,'Your request could not be sent. Please try again or call (248) 535-1598.');}
}
