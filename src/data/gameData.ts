import { Hero, ActionCard } from '../types/game';
import { ALL_HEROES_CATALOG, ALL_ACTION_CARDS_CATALOG } from './allCardsCatalog';

export { ALL_HEROES_CATALOG, ALL_ACTION_CARDS_CATALOG };

const LEGACY_PLAYER_HEROES: Hero[] = [
  {
    id: 'p_rei_espadas',
    name: 'Rei de Espadas',
    title: 'O Monarca Sábio e Justo',
    suit: 'espadas',
    rank: 'K',
    image: `${import.meta.env.BASE_URL}assets/aistudio/684F8EC7-49CE-4F3E-850F-A3C194D6EF25_1e0f278d.png`,
    maxHp: 14,
    currentHp: 14,
    atk: 4,
    baseAtk: 4,
    def: 3,
    baseDef: 3,
    shield: 0,
    hasAttacked: false,
    isDefending: false,
    isAlive: true,
    passiveName: 'Lâmina da Justiça',
    passiveDescription: '+2 de dano contra alvos com escudo ou em postura defensiva.',
    acePowerDescription: 'Compra 2 cartas de reforço e afia sua espada com +2 ATQ.',
    flavorQuote: 'Autoritário, Estratégico, Sério. Valoriza a justiça, a ordem e a tradição.',
    defect: 'Rigoroso e por vezes implacável, podendo ser distante emocionalmente.',
  },
  {
    id: 'p_rainha_copas',
    name: 'Rainha de Copas',
    title: 'Empática, Generosa e Intuitiva',
    suit: 'copas',
    rank: 'Q',
    image: `${import.meta.env.BASE_URL}assets/aistudio/BBA3FD41-1CAA-4856-80E6-51F67BEB9B40_1405fce2.png`,
    maxHp: 11,
    currentHp: 11,
    atk: 2,
    baseAtk: 2,
    def: 2,
    baseDef: 2,
    shield: 0,
    hasAttacked: false,
    isDefending: false,
    isAlive: true,
    passiveName: 'Graça Soberana',
    passiveDescription: 'Restaura 2 de vida ao herói mais ferido no início de cada rodada.',
    acePowerDescription: 'Ergue o Cálice de Copas: restaura 4 de Vida a toda a corte!',
    flavorQuote: 'Valoriza as emoções, os relacionamentos e o bem-estar do seu reino.',
    defect: 'Pode ser excessivamente emocional e se deixar levar pelos sentimentos.',
  },
  {
    id: 'p_valete_paus',
    name: 'Valete de Paus',
    title: 'Criativo, Destemido e Determinado',
    suit: 'paus',
    rank: 'J',
    image: `${import.meta.env.BASE_URL}assets/aistudio/C05ABC18-08B5-4554-82F2-5FAFBD394861_ba78122e.png`,
    maxHp: 9,
    currentHp: 9,
    atk: 3,
    baseAtk: 3,
    def: 1,
    baseDef: 1,
    shield: 0,
    hasAttacked: false,
    isDefending: false,
    isAlive: true,
    passiveName: 'Ímpeto de Vanguarda',
    passiveDescription: 'Gera +1 Energia extra sempre que adotar postura defensiva.',
    acePowerDescription: 'Investida rápida causando 5 de dano e recuperando 1 energia.',
    flavorQuote: 'Tem iniciativa, energia e sabe transformar ideias em ações na vanguarda.',
    defect: 'Pode ser impulsivo, impaciente e assumir riscos desnecessários.',
  },
];

const LEGACY_RIVAL_HEROES: Hero[] = [
  {
    id: 'r_rei_ouros',
    name: 'Rei de Ouros',
    title: 'O Monarca Próspero e Realizador',
    suit: 'ouros',
    rank: 'K',
    image: `${import.meta.env.BASE_URL}assets/aistudio/01583ED9-28A8-4725-97DD-1C56923D2627_a24d5d3a.png`,
    maxHp: 14,
    currentHp: 14,
    atk: 4,
    baseAtk: 4,
    def: 3,
    baseDef: 3,
    shield: 0,
    hasAttacked: false,
    isDefending: false,
    isAlive: true,
    passiveName: 'Cofre Régio',
    passiveDescription: 'Gera +1 de Escudo permanentemente após desferir um ataque.',
    acePowerDescription: 'Concede +4 de Escudo a toda a corte adversária.',
    flavorQuote: 'Prático, Ambicioso, Disciplinado. Constrói um legado sólido.',
    defect: 'Pode ser excessivamente apegado ao lucro acima das pessoas.',
  },
  {
    id: 'r_rainha_paus',
    name: 'Rainha de Paus',
    title: 'Criativa, Corajosa e Inspiradora',
    suit: 'paus',
    rank: 'Q',
    image: `${import.meta.env.BASE_URL}assets/aistudio/FEB41E7E-D30A-4831-BB8F-523EAA959E13_225e8ff1.png`,
    maxHp: 11,
    currentHp: 11,
    atk: 2,
    baseAtk: 2,
    def: 2,
    baseDef: 2,
    shield: 0,
    hasAttacked: false,
    isDefending: false,
    isAlive: true,
    passiveName: 'Manto de Espinhos',
    passiveDescription: 'Reflete 1 de dano direto para o herói agressor.',
    acePowerDescription: 'Causa 3 de dano a dois heróis aleatórios com fúria ancestral.',
    flavorQuote: 'Sabe motivar, liderar com entusiasmo e transformar ideias em poder.',
    defect: 'Pode ser impulsiva, impaciente e teimosa.',
  },
  {
    id: 'r_valete_copas',
    name: 'Valete de Copas',
    title: 'Sensível, Carismático e Conciliador',
    suit: 'copas',
    rank: 'J',
    image: `${import.meta.env.BASE_URL}assets/aistudio/33C3AF60-09E2-4A6A-91FA-F586684577E0_053b7f29.png`,
    maxHp: 9,
    currentHp: 9,
    atk: 3,
    baseAtk: 3,
    def: 1,
    baseDef: 1,
    shield: 0,
    hasAttacked: false,
    isDefending: false,
    isAlive: true,
    passiveName: 'Toque Charmoso',
    passiveDescription: 'Rouba 1 de vida ao desferir um golpe.',
    acePowerDescription: 'Golpe preciso diplomático ignorando parte da armadura.',
    flavorQuote: 'Valoriza relacionamentos, cria conexões e inspira confiança.',
    defect: 'Pode ser indeciso e se envolver em dilemas emocionais.',
  },
];

// Active action deck templates using the genuine illustrated cards
const art = (name: string) => `${import.meta.env.BASE_URL}assets/elemental/${name}.jpg`;
const creature = (base: Hero, name: string, title: string, element: Hero['element'], image: string, hp: number, atk: number, def: number): Hero => ({...base, name, title, element, image: ['ent','lobo'].includes(image) ? art('creatures').replace('.jpg','.png') : art(image), maxHp: hp, currentHp: hp, atk, baseAtk: atk, def, baseDef: def});
export const INITIAL_PLAYER_HEROES: Hero[] = [
  creature(LEGACY_PLAYER_HEROES[0], 'Grifo do Vento', 'Sentinela dos Céus', 'ar', 'grifo', 9, 4, 3),
  {...creature(LEGACY_PLAYER_HEROES[1], 'Ent Ancestral', 'Guardião da Floresta', 'terra', 'ent', 12, 3, 5), passiveName: 'Guardião da Floresta', passiveDescription: 'Ao entrar em campo, concede +2 de Escudo a todas as suas criaturas. Restaura 2 de vida ao aliado mais ferido a cada rodada.'},
  creature(LEGACY_PLAYER_HEROES[2], 'Lobo Flamejante', 'Caçador das Brasas', 'fogo', 'lobo', 9, 3, 2),
].map(hero => ({...hero, shield: 2}));
export const INITIAL_RIVAL_HEROES: Hero[] = [
  creature(LEGACY_RIVAL_HEROES[0], 'Dragão Ígneo', 'Soberano das Chamas', 'fogo', 'dragao', 12, 4, 2),
  creature(LEGACY_RIVAL_HEROES[1], 'Leviatã Aquático', 'Terror das Profundezas', 'agua', 'leviata', 10, 3, 3),
  creature(LEGACY_RIVAL_HEROES[2], 'Golem de Pedra', 'Bastião da Montanha', 'terra', 'golem', 11, 2, 4),
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


const powers: Record<string,[string,string]> = {
 'r_rei_ouros':['Sopro Flamejante','Causa 4 de dano ao alvo e 1 de dano em todos os outros inimigos.'],
 'r_rainha_paus':['Maré Impactante','Causa 3 de dano ao alvo e reduz em 1 o ataque de todos os inimigos por uma rodada.'],
 'r_valete_copas':['Baluarte Terreno','Concede +2 de escudo a si mesmo e +1 de escudo a um aliado.'],
 'p_rei_espadas':['Investida Aérea','Causa 3 de dano ao alvo e concede +1 de ataque a si mesmo por uma rodada.'],
};
for (const hero of [...INITIAL_PLAYER_HEROES,...INITIAL_RIVAL_HEROES]) {
 const power = powers[hero.id];
 if(power){hero.passiveName=power[0];hero.passiveDescription=power[1];hero.acePowerDescription=power[1];}
}
