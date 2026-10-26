import { Flame, Droplets, Mountain, Wind } from 'lucide-react';
import type { Element } from '../types/game';
export const elementLabel = (element?: Element) => ({fogo:'Fogo',agua:'Água',terra:'Terra',ar:'Ar'}[element || 'ar']);
export function ElementIcon({element}: {element?: Element}) {
  const Icon = {fogo:Flame,agua:Droplets,terra:Mountain,ar:Wind}[element || 'ar'];
  return <span className={`element-icon element-${element || 'ar'}`} role="img" aria-label={elementLabel(element)}><Icon size={22}/></span>;
}
