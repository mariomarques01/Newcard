import type {Hero} from '../types/game';
/** A dedicated art window keeps the printed frame and statistics out of the live card. */
export function CreatureArtwork({hero}:{hero:Pick<Hero,'id'|'image'>}) {
 const atlas=hero.id==='p_rainha_copas'||hero.id==='p_valete_paus';
 const focal=hero.id==='r_rei_ouros'?'68% 23%':hero.id==='p_rei_espadas'?'62% 23%':hero.id==='r_rainha_paus'?'62% 23%':'50% 23%';
 return <span className="creature-artwork" aria-hidden="true" style={{backgroundImage:`url("${hero.image}")`,backgroundSize:atlas?'300% 200%':'230% auto',backgroundPosition:atlas?(hero.id==='p_rainha_copas'?'50% 100%':'100% 100%'):focal}}/>;
}
