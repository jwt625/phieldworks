import manifest from '../assets/manifest.json';
const urls=import.meta.glob(['../assets/sprites/*.png','../assets/world/*.png','../assets/map/*.png','../assets/animations/*.png','../assets/states/*.png'],{eager:true,query:'?url',import:'default'}) as Record<string,string>;
const promoted=import.meta.glob([
 '../assets/production/pass-07/extractor-severe-r0-cycle-v3.png',
 '../assets/production/pass-07/assembler-light-r0-cycle-v3.png',
 '../assets/production/pass-07/assembler-severe-r0-cycle-v4.png',
 '../assets/production/pass-07/generator-r0-cycle-v3.png',
 '../assets/production/pass-07/sentry-r0-fire-v3.png',
],{eager:true,query:'?url',import:'default'}) as Record<string,string>;
// Pass 08 reference/dump pilots: only the explicitly reviewed v2 clips, never whole folders.
const promoted08=import.meta.glob([
 '../assets/production/pass-08/reference-r0-cycle-v2.png',
 '../assets/production/pass-08/dump-r0-cycle-v2.png',
],{eager:true,query:'?url',import:'default'}) as Record<string,string>;
// Pass 11 runtime kit: only the reviewed straight-basic atlas is on the candidate allowlist.
const waveKit=import.meta.glob([
 '../assets/production/pass-11-runtime-kit/connected-kit-atlas.png',
],{eager:true,query:'?url',import:'default'}) as Record<string,string>;
export const spriteUrls:Record<string,string>=Object.fromEntries(manifest.assets.map(a=>[a.id,urls[`../assets/${a.path}`]]));
for(const [path,url] of Object.entries(urls))if(!path.includes('/sprites/'))spriteUrls[path.split('/').at(-1)!.replace('.png','')]=url;
for(const [path,url] of Object.entries(promoted))spriteUrls[path.split('/').at(-1)!.replace('.png','')]=url;
for(const [path,url] of Object.entries(promoted08))spriteUrls[path.split('/').at(-1)!.replace('.png','')]=url;
for(const [path,url] of Object.entries(waveKit))spriteUrls[path.split('/').at(-1)!.replace('.png','')]=url;
export const sprites:Record<string,HTMLImageElement>={};
export async function loadSprites(){await Promise.all(Object.entries(spriteUrls).map(([id,url])=>new Promise<void>((resolve,reject)=>{const im=new Image();im.onload=()=>{sprites[id]=im;resolve();};im.onerror=()=>reject(new Error(`Could not load ${id}`));im.src=url;})));}
