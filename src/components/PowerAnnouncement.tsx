import './power-announcement.css';
import type {CSSProperties} from 'react';
import {ELEMENT_TONES,type ArcaneSchool} from '../game/spellPresentation';
import {ElementIcon} from './ElementIcon';
export type PowerAnnouncementData={id:number;title:string;summary:string;image?:string;kind:'elemental'|'hero'|'evolution';school:ArcaneSchool;y:number};
export function PowerAnnouncement({power}:{power:PowerAnnouncementData}){
 return <div className="power-announcement" data-special={power.kind} data-school={power.school} style={{top:power.y,'--power-tone':ELEMENT_TONES[power.school]} as CSSProperties}>
  <ElementIcon element={power.school}/>{power.image&&<img src={power.image} alt="" draggable={false}/>}<div><small>{power.kind==='evolution'?'EVOLUÇÃO ELEMENTAL':power.kind==='hero'?'HABILIDADE ELEMENTAL':'MAGIA ELEMENTAL'}</small><strong>{power.title}</strong><span>{power.summary}</span></div><i className="power-announcement-progress" aria-hidden="true"/>
 </div>;
}
