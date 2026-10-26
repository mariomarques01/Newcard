import type {Hero, ActionCard, Element, Suit} from '../types/game';

const art = (name: string) => `${import.meta.env.BASE_URL}assets/elemental/${name}.jpg`;
// Stable IDs preserve existing elemental saves; suit/rank are internal animation metadata.
function creature(id: string, name: string, title: string, element: Element, image: string, hp: number, atk: number, def: number, suit: Suit, rank: Hero['rank'], passiveName: string, passiveDescription: string, acePowerDescription: string): Hero {
  return {id,name,title,element,image:['ent','lobo'].includes(image)?art('creatures').replace('.jpg','.png'):art(image),maxHp:hp,currentHp:hp,atk,baseAtk:atk,def,baseDef:def,suit,rank,shield:0,hasAttacked:false,isDefending:false,isAlive:true,passiveName,passiveDescription,acePowerDescription,flavorQuote:title};
}
export const INITIAL_PLAYER_HEROES: Hero[] = [
  creature('p_rei_espadas','Grifo do Vento','Sentinela dos Céus','ar','grifo',9,4,3,'espadas','K','Investida Aérea','Causa 3 de dano ao alvo e concede +1 de ataque a si mesmo por uma rodada.','Causa 3 de dano ao alvo e concede +1 de ataque a si mesmo por uma rodada.'),
  creature('p_rainha_copas','Ent Ancestral','Guardião da Floresta','terra','ent',12,3,5,'copas','Q','Guardião da Floresta','Ao entrar em campo, concede +2 de escudo a todas as suas criaturas. Restaura 2 de vida ao aliado mais ferido a cada rodada.','Restaura até 4 de vida a todas as criaturas aliadas vivas.'),
  creature('p_valete_paus','Lobo Flamejante','Caçador das Brasas','fogo','lobo',9,3,2,'paus','J','Ímpeto Flamejante','Recebe +1 de energia ao defender.','Causa 5 de dano direto ao alvo e recupera 1 de energia.'),
].map(hero=>({...hero,shield:2}));
export const INITIAL_RIVAL_HEROES: Hero[] = [
  creature('r_rei_ouros','Dragão Ígneo','Soberano das Chamas','fogo','dragao',12,4,2,'ouros','K','Sopro Flamejante','Causa 4 de dano ao alvo e 1 de dano em todos os outros inimigos.','Causa 4 de dano ao alvo e 1 de dano em todos os outros inimigos.'),
  creature('r_rainha_paus','Leviatã Aquático','Terror das Profundezas','agua','leviata',10,3,3,'paus','Q','Maré Impactante','Causa 3 de dano ao alvo e reduz em 1 o ataque de todos os inimigos por uma rodada.','Causa 3 de dano ao alvo e reduz em 1 o ataque de todos os inimigos por uma rodada.'),
  creature('r_valete_copas','Golem de Pedra','Bastião da Montanha','terra','golem',11,2,4,'copas','J','Baluarte Terreno','Concede +2 de escudo a si mesmo e +1 de escudo a um aliado.','Concede +2 de escudo a si mesmo e +1 de escudo a um aliado.'),
];

export const ELEMENTAL_CARDS: ActionCard[] = [
  {id:'elemental_fire',name:'Explosão Ígnea',element:'fogo',suit:'paus',rank:'5',cost:1,type:'attack',badgeText:'FOGO',badgeColor:'red',description:'Causa 4 de dano direto a um inimigo.',value:4,image:art('explosao')},
  {id:'elemental_water',name:'Fonte de Cura',element:'agua',suit:'copas',rank:'5',cost:2,type:'heal',badgeText:'ÁGUA',badgeColor:'blue',description:'Restaura até 4 de vida à criatura aliada selecionada.',value:4,image:art('onda')},
  {id:'elemental_earth',name:'Armadura de Terra',element:'terra',suit:'paus',rank:'8',cost:2,type:'defense',badgeText:'TERRA',badgeColor:'emerald',description:'Concede +4 de escudo e +1 de defesa à criatura aliada selecionada.',value:4,image:art('erupcao')},
  {id:'elemental_air',name:'Tempestade de Ventos',element:'ar',suit:'espadas',rank:'10',cost:4,type:'attack',badgeText:'AR',badgeColor:'blue',description:'Causa 6 de dano direto à criatura rival selecionada.',value:6,image:art('tornado')},
];
export const EXTRA_ELEMENTAL_CARDS: ActionCard[] = [
{id:'elemental_wave',name:'Onda Avassaladora',element:'agua',suit:'copas',rank:'6',cost:2,type:'attack',badgeText:'ÁGUA',badgeColor:'blue',description:'Causa 3 de dano a todos os inimigos e reduz seu ataque em 1 por uma rodada.',value:3,image:art('onda')},
{id:'elemental_eruption',name:'Erupção Terrestre',element:'terra',suit:'paus',rank:'7',cost:3,type:'attack',badgeText:'TERRA',badgeColor:'emerald',description:'Causa 4 de dano a um inimigo e reduz sua defesa em 2 por uma rodada.',value:4,image:art('erupcao')},
{id:'elemental_tornado',name:'Tornado Ventoso',element:'ar',suit:'espadas',rank:'8',cost:4,type:'attack',badgeText:'AR',badgeColor:'blue',description:'Causa 4 de dano a um inimigo e impede seu ataque por uma rodada.',value:4,image:art('tornado')},
];
export const DECK_TEMPLATES: ActionCard[] = [ELEMENTAL_CARDS[0], ...EXTRA_ELEMENTAL_CARDS, ...ELEMENTAL_CARDS.slice(1)];
