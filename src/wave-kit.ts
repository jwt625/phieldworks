/**
 * Pass-11 runtime kit registration (P2/P7). Only the four straight-basic poses are on the promoted
 * allowlist; the asset package's `runtimePromotedKeys` is intentionally empty because promotion is the
 * coding agent's render step. World scale: 0.0075 tile/source pixel, so 32 px = 0.24-tile guide width
 * and the 128 px source square repeats every 0.96 tile. Never stretch a sprite to an installed length.
 */
export const WAVE_KIT_ATLAS_ID='connected-kit-atlas';
export interface WaveSpriteRect {
 /** Source rectangle in atlas pixels. `gutter` is sampling extrusion, not physical padding. */
 rect:[number,number,number,number];
 gutter:number;
 axis:'x'|'y';
 /** World repeat period in tiles. */
 period:number;
 /** Source pixels per tile. */
 pixelsPerTile:number;
}
const PIXELS_PER_TILE=1/0.0075;
export const STRAIGHT_SPRITES:Record<'h'|'v',WaveSpriteRect>={
 h:{rect:[2,2,128,128],gutter:2,axis:'x',period:.96,pixelsPerTile:PIXELS_PER_TILE},
 v:{rect:[134,2,128,128],gutter:2,axis:'y',period:.96,pixelsPerTile:PIXELS_PER_TILE},
};
/** Horizontal straights use rotation 0/2; vertical rotation 1/3. */
export const straightSprite=(rotation:number):WaveSpriteRect=>(rotation%2===0?STRAIGHT_SPRITES.h:STRAIGHT_SPRITES.v);
/** True when this piece has a registered, seam-reviewed sprite (only intact basic straights today). */
export const hasRegisteredSprite=(piece:{category:string;tier:string;condition:number}):boolean=>piece.category==='straight'&&piece.tier==='basic'&&piece.condition===0;
