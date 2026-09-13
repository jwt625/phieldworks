/** Versioned runtime starter recipe. The UI preview catalog in `src/ui/production-data.ts` is intentionally untouched. */
export interface ProcessRecipe {
 id:string;
 version:number;
 name:string;
 inputs:{assemblies:number;crystal:number};
 activeSeconds:number;
 usefulMin:number;
 usefulMax:number;
 guardFraction:number;
 reworkSeconds:number;
}
export const STARTER_RECIPE:ProcessRecipe={id:'standard-cell',version:1,name:'Standard precision cycle',inputs:{assemblies:2,crystal:1},activeSeconds:8,usefulMin:80,usefulMax:640,guardFraction:.10,reworkSeconds:8};
export const PROCESS_RECIPES:Record<string,ProcessRecipe>={[`${STARTER_RECIPE.id}@${STARTER_RECIPE.version}`]:STARTER_RECIPE};
export function recipeFor(id:string,version:number):ProcessRecipe|undefined{return PROCESS_RECIPES[`${id}@${version}`];}
