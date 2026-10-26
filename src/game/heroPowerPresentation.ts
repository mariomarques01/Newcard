import type {Hero} from '../types/game';
import {schoolForElement} from './spellPresentation';
import {creaturePower} from './cards';
export type HeroPowerTarget={id:string;type:'gold_blast'|'heal'|'pierce'|'shield';label:string};
export function heroPowerPresentation(hero:Hero){
 return {school:schoolForElement(hero.element),title:hero.passiveName,summary:hero.acePowerDescription,needsEnemy:['p_rei_espadas','p_valete_paus','r_rei_ouros','r_rainha_paus'].includes(hero.id)};
}
/** Read the same resolved outcomes used by gameplay; never infer powers from ranks. */
export function heroPowerTargets(hero:Hero,allies:Hero[],enemy?:Hero,enemies:Hero[]=enemy?[enemy]:[]):HeroPowerTarget[]{
 if(heroPowerPresentation(hero).needsEnemy&&!enemy?.isAlive)return [];
 const result=creaturePower(hero,allies,enemies,enemy?.id),targets:HeroPowerTarget[]=[];
 result.enemies.forEach((h,i)=>{const lost=enemies[i].currentHp-h.currentHp;if(lost>0)targets.push({id:h.id,type:'pierce',label:`−${lost} VIDA`});});
 result.allies.forEach((h,i)=>{const before=allies[i];if(h.shield>before.shield)targets.push({id:h.id,type:'shield',label:`+${h.shield-before.shield} ESCUDO`});if(h.currentHp>before.currentHp)targets.push({id:h.id,type:'heal',label:`+${h.currentHp-before.currentHp} VIDA`});if(h.atk>before.atk)targets.push({id:h.id,type:'gold_blast',label:`+${h.atk-before.atk} ATQ`});});
 return targets;
}
