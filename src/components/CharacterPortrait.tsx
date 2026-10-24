import {useEffect,useRef,useState,type CSSProperties} from 'react';
import type {Hero} from '../types/game';
import {CHARACTER_EVENT,CHARACTER_ROWS,type CharacterCue,type CharacterAction} from '../game/characterMotion';
import './character-portrait.css';
const atlas=`${import.meta.env.BASE_URL}assets/characters/royal-actions.webp`;
export function CharacterPortrait({hero}:{hero:Hero}){
  const [motion,setMotion]=useState<{action:CharacterAction;serial:number}>({action:'idle',serial:0});
  const [ready,setReady]=useState(false);
  const timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
  useEffect(()=>{
    const receive=(event:Event)=>{
      const {heroId,action}=(event as CustomEvent<CharacterCue>).detail;
      if(heroId!==hero.id)return;
      clearTimeout(timer.current);
      setMotion(prev=>({action,serial:prev.serial+1}));
      timer.current=setTimeout(()=>setMotion(prev=>({...prev,action:'idle'})),action==='hurt'?700:1500);
    };
    window.addEventListener(CHARACTER_EVENT,receive);
    return()=>{window.removeEventListener(CHARACTER_EVENT,receive);clearTimeout(timer.current);};
  },[hero.id]);
  const row=CHARACTER_ROWS[hero.id]||0;
  const bounds=[[0,245],[245,486],[486,726],[726,956],[956,1214],[1214,1536]][row];
  const cellHeight=bounds[1]-bounds[0];
  const action=!hero.isAlive?'fallen':motion.action==='idle'&&hero.isDefending?'guarding':motion.action;
  return <span className={`character-stage suit-${hero.suit} ${hero.isAlive?'living':''} ${hero.evolved?'character-evolved':''}`} data-character={hero.id} data-action={action} role="img" aria-label={hero.name}>
    <img className="portrait-loader" src={atlas} alt="" onLoad={()=>setReady(true)} onError={()=>setReady(false)}/>
    <img className="portrait-fallback" src={hero.image} alt="" draggable={false}/>{ready&&<><span className="character-backdrop"/><span className="character-runes">✦ · ✧ · ✦</span><span key={motion.serial} className={`character-body action-${action}`} style={{'--sprite-aspect':256/cellHeight,'--sprite-row':`${bounds[0]/(1536-cellHeight)*100}%`,backgroundImage:`url("${atlas}")`,backgroundSize:`400% ${1536/cellHeight*100}%`} as CSSProperties}/><span className="character-magic"/><span className="character-vignette"/></>}
  </span>;
}
