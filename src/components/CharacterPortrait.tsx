import {useEffect,useRef,useState} from 'react';
import type {Hero} from '../types/game';
import {CHARACTER_EVENT,type CharacterCue,type CharacterAction} from '../game/characterMotion';
import {isElement} from '../game/spellPresentation';
import './character-portrait.css';
export function CharacterPortrait({hero}:{hero:Hero}){
 const [action,setAction]=useState<CharacterAction>('idle');
 const timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 useEffect(()=>{const receive=(event:Event)=>{const cue=(event as CustomEvent<CharacterCue>).detail;if(cue.heroId!==hero.id)return;clearTimeout(timer.current);setAction(cue.action);timer.current=setTimeout(()=>setAction('idle'),1500);};window.addEventListener(CHARACTER_EVENT,receive);return()=>{window.removeEventListener(CHARACTER_EVENT,receive);clearTimeout(timer.current);};},[hero.id]);
 if(!isElement(hero.element))return null;
 return <span className={`character-stage element-${hero.element}`} data-character={hero.id} data-action={!hero.isAlive?'fallen':action} role="img" aria-label={hero.name}><img className="portrait-fallback" src={hero.image} alt="" draggable={false}/></span>;
}
