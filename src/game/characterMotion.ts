import type { Hero } from '../types/game';
export type CharacterAction = 'idle'|'attack'|'cast'|'guard'|'hurt';
export const CHARACTER_ROWS: Record<string,number> = {p_rei_espadas:0,p_rainha_copas:1,p_valete_paus:2,r_rei_ouros:3,r_rainha_paus:4,r_valete_copas:5};
export const CHARACTER_EVENT='royal-character-action';
export type CharacterCue={heroId:string;action:CharacterAction};
export function cueCharacter(elementId:string,action:CharacterAction){
  const heroId=elementId.replace(/^hero-card-/,'');
  if(heroId in CHARACTER_ROWS) window.dispatchEvent(new CustomEvent<CharacterCue>(CHARACTER_EVENT,{detail:{heroId,action}}));
}
export function attackFlavor(hero: Pick<Hero,'suit'|'rank'>): 'blade'|'flame'|'coin'|'heart'|'thorn'{
  return hero.suit==='espadas'?'blade':hero.suit==='ouros'?'coin':hero.suit==='copas'?'heart':hero.rank==='Q'?'thorn':'flame';
}
export const CHARACTER_PERSONALITY:Record<string,{attack:string;guard:string;habit:string;cry:string}>={
 p_rei_espadas:{attack:'LÂMINA DA JUSTIÇA',guard:'JURAMENTO DE AÇO',habit:'Afia a lâmina e encara o rival',cry:'Pela justiça!'},
 p_rainha_copas:{attack:'FÚRIA DO CÁLICE',guard:'BÊNÇÃO SOBERANA',habit:'Ergue o cálice com elegância',cry:'Sinta o poder de Copas!'},
 p_valete_paus:{attack:'INVESTIDA DE VANGUARDA',guard:'GUARDA DAS CHAMAS',habit:'Exibe o cajado, impaciente',cry:'Abra caminho!'},
 r_rei_ouros:{attack:'DECRETO DOURADO',guard:'FORTALEZA DO TESOURO',habit:'Exibe sua moeda de ouro',cry:'Tudo tem seu preço!'},
 r_rainha_paus:{attack:'FÚRIA DOS ESPINHOS',guard:'MANTO DE ESPINHOS',habit:'Concentra magia no cajado',cry:'Curvem-se ao meu poder!'},
 r_valete_copas:{attack:'ENCANTO RUBRO',guard:'VÉU DO ENCANTO',habit:'Brinda com um sorriso provocador',cry:'Um brinde à sua derrota!'},
};
export function spriteGeometry(heroId:string){
 const bounds=[[0,245],[245,486],[486,726],[726,956],[956,1214],[1214,1536]][CHARACTER_ROWS[heroId]||0];
 const height=bounds[1]-bounds[0];return {row:`${bounds[0]/(1536-height)*100}%`,size:`400% ${1536/height*100}%`,aspect:256/height};
}
