export type Suit = 'espadas' | 'copas' | 'ouros' | 'paus' | 'coringa';

export interface Hero {
  evolutionCharge?: number;
  evolved?: boolean;
  id: string;
  name: string;
  title: string;
  suit: Suit;
  rank: 'K' | 'Q' | 'J';
  image: string;
  maxHp: number;
  currentHp: number;
  atk: number;
  baseAtk: number;
  temporaryAttack?: number;
  def: number;
  baseDef: number;
  shield: number;
  hasAttacked: boolean;
  isDefending: boolean;
  isAlive: boolean;
  passiveName: string;
  passiveDescription: string;
  acePowerDescription: string;
  flavorQuote: string;
  defect?: string;
  qualities?: string[];
  defects?: string[];
}

export type ActionCardType = 'attack' | 'defense' | 'heal' | 'ace' | 'joker' | 'tactics';

export interface ActionCard {
  templateId?: string;
  id: string;
  name: string;
  suit: Suit;
  rank: string;
  cost: number;
  type: ActionCardType;
  badgeText: string;
  badgeColor: string; // e.g. 'purple', 'red', 'emerald', 'amber', 'blue'
  description: string;
  value: number;
  image?: string;
  pierce?: boolean;
  bonusPg?: number;
  flavorText?: string;
  skillName?: string;
  quote?: string;
  qualities?: string[];
  defects?: string[];
}

export interface CombatLogEntry {
  id: string;
  timestamp: string;
  type: 'attack' | 'defense' | 'heal' | 'ace' | 'card' | 'victory' | 'defeat' | 'system';
  speaker: string;
  text: string;
  detail?: string;
  pgChange?: number;
}

export interface FloatingNumber {
  id: string;
  x: number;
  y: number;
  value: string;
  type: 'damage' | 'heal' | 'shield' | 'pg' | 'crit';
}
