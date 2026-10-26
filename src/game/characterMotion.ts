import type {Hero} from '../types/game';
export type CharacterAction='idle'|'attack'|'cast'|'guard'|'hurt';
export const CHARACTER_EVENT='elemental-character-action';
export type CharacterCue={heroId:string;action:CharacterAction};
export function cueCharacter(elementId:string,action:CharacterAction){
 const heroId=elementId.replace(/^hero-card-/,'');
 window.dispatchEvent(new CustomEvent<CharacterCue>(CHARACTER_EVENT,{detail:{heroId,action}}));
}
export function attackFlavor(hero:Pick<Hero,'element'>){return hero.element;}
export const CHARACTER_PERSONALITY:Record<string,{attack:string;guard:string;habit:string;cry:string}>={
 p_rei_espadas:{attack:'INVESTIDA AÉREA',guard:'BARREIRA DOS VENTOS',habit:'Abre as asas',cry:'Pelos céus!'},
 p_rainha_copas:{attack:'FÚRIA DA FLORESTA',guard:'CASCA ANCESTRAL',habit:'Firma suas raízes',cry:'A floresta resiste!'},
 p_valete_paus:{attack:'PRESA FLAMEJANTE',guard:'GUARDA DAS BRASAS',habit:'Ergue suas chamas',cry:'Sinta as chamas!'},
 r_rei_ouros:{attack:'SOPRO FLAMEJANTE',guard:'ESCAMAS ÍGNEAS',habit:'Concentra fogo',cry:'Arda!'},
 r_rainha_paus:{attack:'MARÉ IMPACTANTE',guard:'BARREIRA DAS MARÉS',habit:'Invoca as ondas',cry:'Das profundezas!'},
 r_valete_copas:{attack:'IMPACTO DE PEDRA',guard:'BALUARTE TERRENO',habit:'Fortalece sua rocha',cry:'A montanha permanece!'},
};
