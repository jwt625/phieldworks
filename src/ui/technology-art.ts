// URL metadata is bundled; illustrations decode only when a visible panel requests them.
import review from '../../assets/technology/art-review-status.json';
const files=import.meta.glob('../../assets/technology/nodes/*.png',{eager:true,query:'?url',import:'default'}) as Record<string,string>;
export function technologyArt(id:string,hero=false){const entry=(review.entries as Record<string,{path:string;status:string}>)[`tech-${id}`];const url=entry?.status==='reviewed-concept'?files[`../../${entry.path}`]:undefined;return url?`<img class="technology-art${hero?' hero':''}" src="${url}" alt="" loading="lazy" decoding="async">`:'';}
