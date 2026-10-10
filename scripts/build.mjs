import {mkdir,rm,cp,writeFile,readFile} from 'node:fs/promises';
import company from '../src/company.mjs';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const live=process.env.SITE_LIVE==='true';
if(live&&!company.productionHost)throw new Error('Confirm a permanent domain in src/company.mjs before launch.');
const origin=`https://${live?company.productionHost:company.previewHost}`;
const ga=process.env.PUBLIC_GA4_ID||'',ads=process.env.PUBLIC_ADS_ID||'',conversion=process.env.PUBLIC_ADS_CONVERSION_LABEL||'';
for(const [label,value,pattern] of [['GA4',ga,/^G-[A-Z0-9]+$/],['Ads',ads,/^AW-\d+$/],['conversion',conversion,/^[A-Za-z0-9_-]+$/]])if(value&&!pattern.test(value))throw new Error(`Invalid ${label} ID`);
const mark='<svg class="brand-mark" viewBox="0 0 48 48" aria-hidden="true"><path d="M7 18 24 8l17 10v12L24 40 7 30Z" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="m7 18 17 10 17-10M24 28v12M16 13l17 10M15 23v12" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>';
const brand=mark+'<span class="brand-text">CLARKSTON<span>CONCRETE</span></span>';
const arrow='<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>';
const fields={BRAND:brand,ARROW:arrow,ORIGIN:origin,YEAR:new Date().getFullYear(),ROBOTS:live?'index, follow':'noindex, nofollow',CARDS:company.services.map((s,i)=>`<article class="service"><span class="service-index">0${i+1}</span><h3>${escape(s.name)}</h3><p>${escape(s.detail)}</p></article>`).join(''),OPTIONS:company.services.map(s=>`<option>${escape(s.name)}</option>`).join(''),FAQS:company.faqs.map(([q,a])=>`<details><summary>${escape(q)}<span aria-hidden="true">+</span></summary><p>${escape(a)}</p></details>`).join(''),SCHEMA:JSON.stringify({'@context':'https://schema.org','@type':'Organization',name:company.name,url:origin,logo:origin+'/brand/logo-dark.svg',telephone:'+12485351598'}).replace(/</g,'\\u003c')};
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});await cp('public','dist',{recursive:true});
for(const [source,destination] of [['src/page.html','dist/index.html'],['public/thank-you/index.html','dist/thank-you/index.html'],['public/privacy.html','dist/privacy.html']]){
 const html=(await readFile(source,'utf8')).replace(/\{\{(\w+)\}\}/g,(_,key)=>fields[key]??'');await writeFile(destination,html);
}
await writeFile('dist/config.js',`window.siteConfig=${JSON.stringify({live,productionHost:company.productionHost,ga4:ga,ads,conversion,turnstileSiteKey:process.env.PUBLIC_TURNSTILE_SITE_KEY||''})};`);
await writeFile('dist/robots.txt',live?`User-agent: *\nAllow: /\nDisallow: /thank-you/\nSitemap: ${origin}/sitemap.xml\n`:'User-agent: *\nDisallow: /\n');
await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${live?`<url><loc>${origin}/</loc></url>`:''}</urlset>`);
await writeFile('dist/404.html',`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page not found | Clarkston Concrete</title><link rel="stylesheet" href="/styles.css"></head><body><main class="wrap utility-page"><h1>That page is not here.</h1><a class="button" href="/">Back to Clarkston Concrete</a></main></body></html>`);
console.log(`Built ${live?'live':'review'} site: ${origin}`);
