// URL metadata is bundled; illustrations decode only when a visible panel requests them.
const files=import.meta.glob('../../assets/technology/nodes/*.png',{eager:true,query:'?url',import:'default'}) as Record<string,string>;
export function technologyArt(id:string,hero=false){const url=files[`../../assets/technology/nodes/${id}-v2.png`]??files[`../../assets/technology/nodes/${id}-v1.png`];return url?`<img class="technology-art${hero?' hero':''}" src="${url}" alt="" loading="lazy" decoding="async">`:'';}
