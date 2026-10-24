import './power-announcement.css';
import type {CSSProperties} from 'react';
import type {ArcaneSchool} from '../game/spellPresentation';
export type PowerAnnouncementData={id:number;title:string;summary:string;image?:string;kind:'ace'|'joker'|'hero'|'evolution';school:ArcaneSchool;y:number};
const tones:Record<ArcaneSchool,string>={steel:'#8bdcff',nature:'#79efb4',solar:'#ffcf68',storm:'#bb93ff',wild:'#ff9edb'};
export function PowerAnnouncement({power}:{power:PowerAnnouncementData}){
 return <div className="power-announcement" data-special={power.kind} data-school={power.school} style={{top:power.y,'--power-tone':tones[power.school]} as CSSProperties}>
  <span className="power-announcement-gem" aria-hidden="true">{power.kind==='evolution'?'✧':power.kind==='joker'?'✦':power.kind==='hero'?'♛':'A'}</span>
  {power.image&&<img src={power.image} alt="" draggable={false}/>}
  <div><small>{power.kind==='evolution'?'EVOLUÇÃO DESPERTADA':power.kind==='hero'?'PODER REAL':power.kind==='joker'?'CORINGA DESPERTADO':'PODER DE ÁS'}</small><strong>{power.title}</strong><span>{power.summary}</span></div>
  <i className="power-announcement-progress" aria-hidden="true"/>
 </div>;
}
