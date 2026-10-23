import React, { useState, useEffect, useRef } from 'react';
import { Hero, ActionCard, CombatLogEntry, FloatingNumber } from './types/game';
import { INITIAL_PLAYER_HEROES, INITIAL_RIVAL_HEROES, DECK_TEMPLATES } from './data/gameData';
import { sound } from './utils/audio';
import { ActionBar } from './components/ActionBar';
import { FloatingNumberOverlay } from './components/FloatingNumberOverlay';
import { CardInspectModal } from './components/CardInspectModal';
import { CardCompendiumModal } from './components/CardCompendiumModal';
import { RulesModal } from './components/RulesModal';
import { VictoryModal } from './components/VictoryModal';
import { CombatParticleCanvas, CombatParticleCanvasRef } from './components/CombatParticleCanvas';
import { TargetingArrow } from './components/TargetingArrow';
import { Crown } from 'lucide-react';
import { targetFor, makeDeck, resolveCard } from './game/cards';
import { ArenaHero, ArenaHand } from './components/MobileArena';
import './arena.css';
import './arena-royal-v3.css';
import './arena-mobile-v4.css';
import './arena-buttons-v5.css';
import './arena-status-v6.css';
import './arena-premium-v7.css';
import './arena-cinematics-v8.css';
import './arena-damage-v9.css';
import './arena-performance-v10.css';
import './arena-selection-v13.css';
import './arena-actions-v14.css';
import './arena-turn-energy-v15.css';
import './arena-hero-stats-v16.css';
import './arena-hand-v17.css';
import './arena-iphone-layout-v18.css';
import './arena-drag-feedback-v20.css';

const SAVE_KEY = 'newcard-match-v1';
const TURN_CHECKPOINT_KEY = 'newcard-turn-checkpoint-v1';
const PROFILE_KEY = 'newcard-player-profile-v1';
const CAMPAIGN_KEY = 'newcard-campaign-v1';
const CAMPAIGN_CHAPTERS = ['A Fronteira Esquecida','O Cerco das Sombras','A Coroa de Ferro','O Trono do Destino'];
const campaignRivals = (chapter:number):Hero[] => INITIAL_RIVAL_HEROES.map(hero=>({
  ...hero, maxHp:hero.maxHp+(chapter-1)*2,currentHp:hero.maxHp+(chapter-1)*2,
  atk:hero.atk+Math.floor((chapter-1)/2)
}));
const newMatchId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
type PlayerProfile = {wins:number; losses:number; bestRound:number; bestPg:number; matchIds:string[]};
const emptyProfile = ():PlayerProfile => ({wins:0,losses:0,bestRound:0,bestPg:0,matchIds:[]});

export default function App() {
  useEffect(() => () => { matchToken.current++; }, []);
  const particleCanvasRef = useRef<CombatParticleCanvasRef>(null);

  // Hearthstone-style Drag State
  const [draggingCard, setDraggingCard] = useState<ActionCard | null>(null);
  const [draggingHero, setDraggingHero] = useState<Hero | null>(null);
  const [dragOrigin, setDragOrigin] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);
  const [hoveredHeroId, setHoveredHeroId] = useState<string | null>(null);

  // Game State
  const [playerHeroes, setPlayerHeroes] = useState<Hero[]>(() => JSON.parse(JSON.stringify(INITIAL_PLAYER_HEROES)));
  const [rivalHeroes, setRivalHeroes] = useState<Hero[]>(() => JSON.parse(JSON.stringify(INITIAL_RIVAL_HEROES)));
  const [activePlayerHeroId, setActivePlayerHeroId] = useState<string>('p_rei_espadas');
  const [selectedRivalHeroId, setSelectedRivalHeroId] = useState<string | null>('r_valete_copas');

  const [playerHand, setPlayerHand] = useState<ActionCard[]>(() => makeDeck(DECK_TEMPLATES).slice(0,3));
  const [deck, setDeck] = useState<ActionCard[]>(() => makeDeck(DECK_TEMPLATES).slice(3));
  const [showLog, setShowLog] = useState(false);
  const [hint, setHint] = useState('Arraste uma carta até o alvo ou selecione e toque em Jogar.');
  const dragRef = useRef<{card?: ActionCard; hero?: Hero; x:number; y:number; moved:boolean; pointerId:number} | null>(null);
  const matchToken = useRef(0);
  const [discardPile, setDiscardPile] = useState<ActionCard[]>([]);

  const [playerPg, setPlayerPg] = useState<number>(1);
  const [rivalPg, setRivalPg] = useState<number>(0);
  const [playerEnergy, setPlayerEnergy] = useState<number>(5);
  const [rivalEnergy, setRivalEnergy] = useState<number>(3);
  const maxEnergy = 5;
  const [round, setRound] = useState<number>(1);
  const [currentTurn, setCurrentTurn] = useState<'player' | 'rival'>('player');

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [combatLogs, setCombatLogs] = useState<CombatLogEntry[]>([
    {
      id: 'log_init',
      timestamp: '09:00',
      type: 'system',
      speaker: 'Reinos do Destino',
      text: 'O combate entre as cortes reais se inicia! Conquiste 12 PG ou derrote todos os heróis rivais.',
    },
  ]);

  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);
  const [screenShake, setScreenShake] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [hitHeroId, setHitHeroId] = useState<string | null>(null);

  const triggerHeroDamageHit = (heroId: string) => {
    setHitHeroId(heroId);
    setTimeout(() => {
      setHitHeroId((current) => (current === heroId ? null : current));
    }, 420);
  };

  // Modals
  const [inspectingItem, setInspectingItem] = useState<Hero | ActionCard | null>(null);
  const [showCompendium, setShowCompendium] = useState<boolean>(false);
  const [showRules, setShowRules] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<'victory' | 'defeat' | null>(null);
  const [matchId,setMatchId] = useState(newMatchId);
  const [chapter,setChapter] = useState(1);
  const [unlockedChapter,setUnlockedChapter] = useState(()=>{
    try { return Math.min(4,Math.max(1,Number(localStorage.getItem(CAMPAIGN_KEY))||1)); }
    catch { return 1; }
  });
  const [showCampaign,setShowCampaign] = useState(false);
  const [showProfile,setShowProfile] = useState(false);
  const [profile,setProfile] = useState<PlayerProfile>(()=>{
    try { const p=JSON.parse(localStorage.getItem(PROFILE_KEY)||'null'); return p&&typeof p.wins==='number'&&typeof p.losses==='number'&&Array.isArray(p.matchIds)?p:emptyProfile(); }
    catch { return emptyProfile(); }
  });

  const activePlayerHero = playerHeroes.find((h) => h.id === activePlayerHeroId) || playerHeroes[0];
  const targetedRivalHero = rivalHeroes.find((h) => h.id === selectedRivalHeroId) || rivalHeroes.find((h) => h.isAlive);
  const selectedCard = playerHand.find((c) => c.id === selectedCardId) || null;

  // V21: persist a match locally so Safari reloads do not discard progress.
  const saveReady = useRef(false);
  const skipInitialSave = useRef(true);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const savedMatch = JSON.parse(raw);
        // A rival turn has delayed actions. Recover its pre-turn checkpoint
        // rather than granting a free turn after a partial rival attack.
        const checkpointRaw = savedMatch.currentTurn === 'rival' ? localStorage.getItem(TURN_CHECKPOINT_KEY) : null;
        const checkpoint = checkpointRaw ? JSON.parse(checkpointRaw) : null;
        const saved = checkpoint?.version === 1 && checkpoint?.round === savedMatch.round &&
          Array.isArray(checkpoint.playerHeroes) && Array.isArray(checkpoint.rivalHeroes) ? checkpoint : savedMatch;
        if (saved.version === 1 && Array.isArray(saved.playerHeroes) && Array.isArray(saved.rivalHeroes) &&
            Array.isArray(saved.playerHand) && Array.isArray(saved.deck) && Array.isArray(saved.discardPile) &&
            typeof saved.round === 'number' && saved.round >= 1 &&
            (saved.currentTurn === 'player' || saved.currentTurn === 'rival')) {
          matchToken.current++;
          if (typeof saved.matchId==='string') setMatchId(saved.matchId);
          if (Number.isInteger(saved.chapter) && saved.chapter>=1 && saved.chapter<=4) setChapter(saved.chapter);
          setPlayerHeroes(saved.playerHeroes);
          setRivalHeroes(saved.rivalHeroes);
          setPlayerHand(saved.playerHand);
          setDeck(saved.deck);
          setDiscardPile(saved.discardPile);
          setActivePlayerHeroId(saved.activePlayerHeroId);
          setSelectedRivalHeroId(saved.selectedRivalHeroId);
          setPlayerPg(saved.playerPg);
          setRivalPg(saved.rivalPg);
          setPlayerEnergy(saved.playerEnergy);
          setRivalEnergy(saved.rivalEnergy);
          setRound(saved.round);
          // A complete pre-turn checkpoint restores the player's pending decision.
          // Older saves without a checkpoint retain the previous recovery behavior.
          setCurrentTurn(saved.currentTurn === 'rival' ? 'player' : saved.currentTurn);
          setGameOver(saved.gameOver ?? null);
          setCombatLogs(Array.isArray(saved.combatLogs) ? saved.combatLogs : []);
          setSelectedCardId(null);
          setHint('Partida recuperada automaticamente neste dispositivo.');
        }
      }
    } catch { /* Private browsing or corrupted save: start a new match. */ }
    saveReady.current = true;
  }, []);

  useEffect(() => {
    if (!saveReady.current) return;
    if (skipInitialSave.current) { skipInitialSave.current = false; return; }
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        version:1, chapter,matchId,playerHeroes,rivalHeroes,playerHand,deck,discardPile,
        activePlayerHeroId,selectedRivalHeroId,playerPg,rivalPg,playerEnergy,rivalEnergy,
        round,currentTurn,gameOver,combatLogs
      }));
      if (currentTurn === 'player') localStorage.removeItem(TURN_CHECKPOINT_KEY);
    } catch { /* Storage can be unavailable on Safari. */ }
  }, [chapter,matchId,playerHeroes,rivalHeroes,playerHand,deck,discardPile,activePlayerHeroId,
      selectedRivalHeroId,playerPg,rivalPg,playerEnergy,rivalEnergy,round,currentTurn,gameOver,combatLogs]);

  // Record each completed match only once, including across reloads.
  useEffect(()=>{
    if (!saveReady.current || !gameOver) return;
    setProfile(previous=>{
      if(previous.matchIds.includes(matchId)) return previous;
      const next:PlayerProfile={wins:previous.wins+(gameOver==='victory'?1:0),losses:previous.losses+(gameOver==='defeat'?1:0),bestRound:Math.max(previous.bestRound,round),bestPg:Math.max(previous.bestPg,playerPg),matchIds:[...previous.matchIds,matchId].slice(-100)};
      try { localStorage.setItem(PROFILE_KEY,JSON.stringify(next)); } catch { /* Optional local profile. */ }
      return next;
    });
  },[gameOver,matchId,round,playerPg]);

  // Completing a campaign chapter unlocks the next one, once per victory.
  useEffect(()=>{
    if (!saveReady.current || gameOver!=='victory') return;
    const next=Math.min(4,chapter+1);
    setUnlockedChapter(previous=>{
      if(next<=previous) return previous;
      try { localStorage.setItem(CAMPAIGN_KEY,String(next)); } catch { /* Local progress optional. */ }
      return next;
    });
  },[gameOver,chapter]);

  // Sync sound manager enabled state
  useEffect(() => {
    sound.enabled = soundEnabled;
  }, [soundEnabled]);

  // Helper to trigger floating impact numbers
  const addFloatingNumber = (x: number, y: number, value: string, type: FloatingNumber['type']) => {
    const id = `fn_${Date.now()}_${Math.random()}`;
    setFloatingNumbers((prev) => [...prev, { id, x, y, value, type }]);
    setTimeout(() => {
      setFloatingNumbers((prev) => prev.filter((item) => item.id !== id));
    }, 1200);
  };

  // Helper to trigger screen shake
  const triggerScreenShake = () => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 320);
  };

  // Helper to add log
  const addLog = (
    speaker: string,
    text: string,
    type: CombatLogEntry['type'] = 'system',
    detail?: string,
    pgChange?: number
  ) => {
    const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newEntry: CombatLogEntry = {
      id: `log_${Date.now()}_${Math.random()}`,
      timestamp: timeStr,
      speaker,
      text,
      type,
      detail,
      pgChange,
    };
    setCombatLogs((prev) => [newEntry, ...prev]);
  };

  // Check victory / defeat conditions
  const checkWinConditions = (
    currentPglayer: number,
    currentPgRival: number,
    currentPheroes: Hero[],
    currentRheroes: Hero[]
  ) => {
    const allRivalsDead = currentRheroes.every((h) => !h.isAlive);
    const allPlayersDead = currentPheroes.every((h) => !h.isAlive);

    if (currentPglayer >= 12 || allRivalsDead) {
      setGameOver('victory');
      sound.playVictory();
      addLog('Vitória!', 'Seu Reino consagrou o triunfo supremo dos Reinos do Destino!', 'victory');
      return true;
    }

    if (currentPgRival >= 12 || allPlayersDead) {
      setGameOver('defeat');
      sound.playDefeat();
      addLog('Derrota!', 'Suas forças sucumbiram ao poderio do reino adversário.', 'defeat');
      return true;
    }

    return false;
  };

  // 1. SELECT PLAYER HERO
  const handleSelectPlayerHero = (hero: Hero) => {
    if (!hero.isAlive) return;
    setActivePlayerHeroId(hero.id);
    sound.playCardDraw();
  };

  // 2. SELECT RIVAL HERO TARGET
  const handleSelectRivalHero = (hero: Hero) => {
    if (!hero.isAlive) return;
    setSelectedRivalHeroId(hero.id);
    sound.playClick();
  };

  // 3. SELECT HAND CARD
  const handleSelectHandCard = (card: ActionCard) => {
    if (selectedCardId === card.id) {
      setSelectedCardId(null);
    } else {
      setSelectedCardId(card.id);
      sound.playCardDraw();
    }
  };

  // 4. EXECUTE CARD PLAY (via click or Hearthstone drag-and-drop)
  const executeCardPlay = (card: ActionCard, enemy = targetedRivalHero, ally = activePlayerHero) => {
    if (gameOver || currentTurn !== 'player' || playerEnergy < card.cost || !ally?.isAlive || !playerHand.some(c=>c.id===card.id)) return;
    if (targetFor(card) === 'enemy' && !enemy?.isAlive) return;
    const result = resolveCard(card, playerHeroes, rivalHeroes, ally.id, enemy?.id);
    const a = result.ability;
    const stolen = Math.min(rivalPg, a.steal || 0);
    const pg = Math.min(12,playerPg+(a.glory||0)+stolen+result.killGlory);
    const draws = deck.slice(0,a.draw||0);
    const remaining = [...playerHand.filter(c=>c.id!==card.id),...draws];
    setPlayerHand(remaining.slice(0,5));
    setDiscardPile(prev=>[card,...remaining.slice(5),...prev]);
    setDeck(deck.slice(draws.length));
    setPlayerEnergy(Math.min(maxEnergy,playerEnergy-card.cost+(a.energy||0)));
    setPlayerHeroes(result.allies); setRivalHeroes(result.enemies);
    setPlayerPg(pg); setRivalPg(rivalPg-stolen); setSelectedCardId(null);
    sound.playCardPlay();
    const sourceId=`hero-card-${ally.id}`;
    particleCanvasRef.current?.revealCard(card,sourceId);
    const fx=particleCanvasRef.current;
    if(a.all) fx?.triggerBoard(a.heal?'heal':a.shield?'shield':'arcane',card.skillName||card.name);
    if(a.damage&&enemy) fx?.triggerAttack(sourceId,`hero-card-${enemy.id}`,'pierce',`−${a.damage} VIDA`);
    result.allies.forEach((next,i)=>{
      const before=playerHeroes[i],id=`hero-card-${next.id}`;
      if(next.currentHp>before.currentHp) fx?.triggerAttack(sourceId,id,'heal',`+${next.currentHp-before.currentHp} VIDA`);
      if(next.shield>before.shield) fx?.triggerCardBurst(id,'shield',`+${next.shield-before.shield} ESCUDO`);
      if(next.atk>before.atk||next.def>before.def) fx?.triggerCardBurst(id,'gold_blast',next.atk>before.atk?`+${next.atk-before.atk} ATQ`:`+${next.def-before.def} DEF`);
    });
    if(!a.damage&&!a.heal&&!a.shield&&!a.attack&&!a.defense) fx?.triggerCardBurst(`hero-card-${ally.id}`,'arcane',a.energy?`+${a.energy} ENERGIA`:a.draw?`+${a.draw} CARTAS`:'GLÓRIA');
    if (a.damage && enemy) { triggerHeroDamageHit(enemy.id); triggerScreenShake(); }
    setHint(`${card.name} • ${card.description}`);
    addLog(card.name,card.description,'card');
    checkWinConditions(pg,rivalPg-stolen,result.allies,result.enemies);
  };

  const handleUseCard = () => {
    if (selectedCard) {
      executeCardPlay(selectedCard);
    }
  };

  // 5. EXECUTE ATTACK (via click or Hearthstone drag-to-attack)
  const executeAttack = (attackerParam?: Hero, targetRivalParam?: Hero) => {
    const attacker = attackerParam || activePlayerHero;
    const target = targetRivalParam || targetedRivalHero;

    if (gameOver || !attacker || !attacker.isAlive || attacker.hasAttacked || !target || !target.isAlive || currentTurn !== 'player') {
      return;
    }

    sound.playAttack();
    triggerScreenShake();
    triggerHeroDamageHit(target.id);

    // Trigger visual particles on targeted rival and attacker
    particleCanvasRef.current?.triggerAttack(`hero-card-${attacker.id}`,`hero-card-${target.id}`,'slash');
    if(target.shield>0) particleCanvasRef.current?.triggerCardBurst(`hero-card-${target.id}`,'shield','BLOQUEIO');

    // Calculate base damage: ATQ - floor(DEF / 2)
    let damage = Math.max(1, attacker.atk - Math.floor(target.def / 2));

    // Passive bonus: Rei de Espadas deals +2 damage against shielded or defending targets!
    if (attacker.id === 'p_rei_espadas' && (target.shield > 0 || target.isDefending)) {
      damage += 2;
    }

    // Shield absorption
    let currentShield = target.shield;
    let shieldDmg = Math.min(currentShield, damage);
    let remainingShield = currentShield - shieldDmg;
    let hpDmg = damage - shieldDmg;

    let newHp = Math.max(0, target.currentHp - hpDmg);
    let isDead = newHp === 0;

    let gainedPg = 0;
    if (isDead) {
      gainedPg = 2; // +2 PG for defeating a champion
    } else if (hpDmg >= 3) {
      gainedPg = 1; // +1 PG for decisive hit
    }

    const updatedRivalHeroes = rivalHeroes.map((h) => {
      if (h.id === target.id) {
        return {
          ...h,
          currentHp: newHp,
          shield: remainingShield,
          isAlive: !isDead,
        };
      }
      return h;
    });

    // Mark player attacker as hasAttacked
    const updatedPlayerHeroes = playerHeroes.map((h) => {
      if (h.id === attacker.id) {
        return { ...h, hasAttacked: true, atk: h.atk-(h.temporaryAttack||0), temporaryAttack: 0 };
      }
      return h;
    });

    const newPlayerPg = Math.min(12, playerPg + gainedPg);

    // Floating damage numbers
    addFloatingNumber(window.innerWidth / 2, 200, `-${damage} DANO`, hpDmg >= 3 ? 'crit' : 'damage');
    if (gainedPg > 0) {
      setTimeout(() => {
        addFloatingNumber(window.innerWidth / 2, 140, `+${gainedPg} PG`, 'pg');
      }, 250);
    }

    addLog(
      attacker.name,
      `atacou ${target.name}: infligiu ${hpDmg} de vida, ${shieldDmg} de escudo.${isDead ? ' Herói abatido!' : ''}`,
      'attack',
      isDead ? 'Derrota Heroica' : undefined,
      gainedPg
    );

    setPlayerHeroes(updatedPlayerHeroes);
    setRivalHeroes(updatedRivalHeroes);
    setPlayerPg(newPlayerPg);

    checkWinConditions(newPlayerPg, rivalPg, updatedPlayerHeroes, updatedRivalHeroes);
  };

  const handleAttack = () => {
    executeAttack();
  };

  // 6. DEFEND ACTION
  const handleDefend = () => {
    if (gameOver || !activePlayerHero || !activePlayerHero.isAlive || activePlayerHero.isDefending || currentTurn !== 'player') {
      return;
    }

    sound.playDefend();
    particleCanvasRef.current?.triggerCardBurst(`hero-card-${activePlayerHero.id}`, 'shield', '+3 ESCUDO');

    let bonusEnergy = 0;
    // Valete de Paus passive: generates +1 extra energy upon defending
    if (activePlayerHero.id === 'p_valete_paus') {
      bonusEnergy = 1;
      setPlayerEnergy((e) => Math.min(maxEnergy, e + 1));
    }

    const updatedPlayerHeroes = playerHeroes.map((h) => {
      if (h.id === activePlayerHero.id) {
        return {
          ...h,
          isDefending: true,
          shield: h.shield + 3,
          def: h.def + 1,
        };
      }
      return h;
    });

    addFloatingNumber(window.innerWidth / 2, window.innerHeight - 250, '+3 ESCUDO', 'shield');

    addLog(
      activePlayerHero.name,
      `assumiu postura defensiva (+3 Escudo, +1 DEF)${bonusEnergy > 0 ? ' e gerou +1 Energia!' : '.'}`,
      'defense'
    );

    setPlayerHeroes(updatedPlayerHeroes);
  };

  // 7. USE ACE SPECIAL POWER (COSTS 2 ENERGY)
  const handleUseAce = () => {
    if (gameOver || !activePlayerHero || !activePlayerHero.isAlive || playerEnergy < 2 || currentTurn !== 'player') {
      return;
    }

    sound.playAcePower();
    particleCanvasRef.current?.triggerBoard(activePlayerHero.rank==='Q'?'heal':activePlayerHero.rank==='J'?'pierce':'gold_blast',activePlayerHero.passiveName+' · PODER DE ÁS');
    triggerScreenShake();
    setPlayerEnergy((e) => e - 2);

    let updatedPlayerHeroes = [...playerHeroes];
    let updatedRivalHeroes = [...rivalHeroes];
    let newPlayerPg = playerPg;

    if (activePlayerHero.rank === 'K') {
      // King of Spades Ace: Draws 2 cards and gets +2 temporary ATQ
      particleCanvasRef.current?.triggerCardBurst(`hero-card-${activePlayerHero.id}`, 'gold_blast');
      const drawn = deck.slice(0, 2);
      const nextHand = [...playerHand, ...drawn];
      setPlayerHand(nextHand.slice(0,5));
      setDiscardPile(prev=>[...nextHand.slice(5),...prev]);
      setDeck(deck.slice(drawn.length));
      if(nextHand.length>5) setHint('Mão cheia: as cartas excedentes foram para o descarte.');
      updatedPlayerHeroes = updatedPlayerHeroes.map((h) => {
        if (h.id === activePlayerHero.id) {
          return { ...h, atk: h.atk + 2 };
        }
        return h;
      });
      addFloatingNumber(window.innerWidth / 2, window.innerHeight - 250, '+2 ATQ & 2 CARTAS', 'pg');
      addLog(activePlayerHero.name, 'ativou o Poder de Ás: Sacou 2 cartas de reforço e afiou sua espada (+2 ATQ)!', 'ace');
    } else if (activePlayerHero.rank === 'Q') {
      // Queen of Hearts Ace: Heals all player heroes by 4 HP
      sound.playHeal();
      playerHeroes.forEach((h) => {
        particleCanvasRef.current?.triggerCardBurst(`hero-card-${h.id}`, 'heal');
      });
      updatedPlayerHeroes = updatedPlayerHeroes.map((h) => {
        if (h.isAlive) {
          return { ...h, currentHp: Math.min(h.maxHp, h.currentHp + 4) };
        }
        return h;
      });
      addFloatingNumber(window.innerWidth / 2, window.innerHeight - 250, '+4 CURA GERAL', 'heal');
      addLog(activePlayerHero.name, 'ergueu o Cálice de Copas: Restaurou 4 de Vida a toda a corte!', 'heal');
    } else if (activePlayerHero.rank === 'J') {
      // Jack of Clubs Ace: 5 direct damage + 1 energy
      particleCanvasRef.current?.triggerCardBurst(`hero-card-${activePlayerHero.id}`, 'slash');
      if (targetedRivalHero && targetedRivalHero.isAlive) {
        triggerHeroDamageHit(targetedRivalHero.id);
        particleCanvasRef.current?.triggerAttack(`hero-card-${activePlayerHero.id}`,`hero-card-${targetedRivalHero.id}`, 'pierce', '−5 INVESTIDA');
        const dmg = 5;
        const newHp = Math.max(0, targetedRivalHero.currentHp - dmg);
        const isDead = newHp === 0;

        updatedRivalHeroes = updatedRivalHeroes.map((h) => {
          if (h.id === targetedRivalHero.id) {
            return { ...h, currentHp: newHp, isAlive: !isDead };
          }
          return h;
        });

        setPlayerEnergy((e) => Math.min(maxEnergy, e + 1));
        addFloatingNumber(window.innerWidth / 2, 200, '-5 INVESTIDA', 'crit');

        if (isDead) {
          newPlayerPg = Math.min(12, newPlayerPg + 2);
          addLog(activePlayerHero.name, `desferiu Investida Titânica fulminando ${targetedRivalHero.name}!`, 'ace', undefined, 2);
        } else {
          addLog(activePlayerHero.name, `desferiu Investida Titânica de 5 de dano em ${targetedRivalHero.name}!`, 'ace');
        }
      }
    }

    setPlayerHeroes(updatedPlayerHeroes);
    setRivalHeroes(updatedRivalHeroes);
    setPlayerPg(newPlayerPg);

    checkWinConditions(newPlayerPg, rivalPg, updatedPlayerHeroes, updatedRivalHeroes);
  };

  // 8. END TURN & AI RIVAL AUTOMATED PLAY
  const handleEndTurn = () => {
    if (gameOver || currentTurn !== 'player') return;
    const token=matchToken.current;
    try {
      localStorage.setItem(TURN_CHECKPOINT_KEY, JSON.stringify({
        version:1, matchId,playerHeroes,rivalHeroes,playerHand,deck,discardPile,
        activePlayerHeroId,selectedRivalHeroId,playerPg,rivalPg,playerEnergy,rivalEnergy,
        round,currentTurn:'player',gameOver,combatLogs
      }));
    } catch { /* Safari storage may be unavailable. */ }
    setCurrentTurn('rival'); setSelectedCardId(null); sound.playTurnChange();
    setHint('O rival está preparando seu ataque…');
    setTimeout(()=>{
      if (token!==matchToken.current) return;
      const livingRivals=rivalHeroes.filter(h=>h.isAlive);
      const livingPlayers=playerHeroes.filter(h=>h.isAlive);
      if (!livingRivals.length || !livingPlayers.length) return;
      const attacker=livingRivals[Math.floor(Math.random()*livingRivals.length)];
      const target=[...livingPlayers].sort((a,b)=>a.currentHp-b.currentHp)[0];
      const damage=Math.max(1,attacker.atk-Math.floor(target.def/2));
      const absorbed=Math.min(target.shield,damage);
      const hp=Math.max(0,target.currentHp-damage+absorbed);
      const gained=hp===0?2:damage-absorbed>=3?1:0;
      let nextPlayers=playerHeroes.map(h=>h.id===target.id?{...h,currentHp:hp,shield:h.shield-absorbed,isAlive:hp>0}:{...h});
      const nextRivals=rivalHeroes.map(h=>({...h,isDefending:false,def:h.def-(h.isDefending?1:0),shield:h.shield+(h.id===attacker.id&&h.id==='r_rei_ouros'?1:0)}));
      const pg=Math.min(12,rivalPg+gained);
      setPlayerHeroes(nextPlayers);setRivalHeroes(nextRivals);setRivalPg(pg);
      sound.playAttack();triggerHeroDamageHit(target.id);triggerScreenShake();
      particleCanvasRef.current?.triggerAttack(`hero-card-${attacker.id}`,`hero-card-${target.id}`,'slash');
      if(absorbed>0) particleCanvasRef.current?.triggerCardBurst(`hero-card-${target.id}`,'shield',`BLOQUEOU ${absorbed}`);
      if(attacker.id==='r_rei_ouros') particleCanvasRef.current?.triggerCardBurst(`hero-card-${attacker.id}`,'shield','COFRE RÉGIO');
      addLog(attacker.name,`Atacou ${target.name}: ${damage-absorbed} de dano.`,'attack');
      if(checkWinConditions(playerPg,pg,nextPlayers,nextRivals)) return;
      setTimeout(()=>{
        if(token!==matchToken.current) return;
        const guard=[...nextRivals].filter(h=>h.isAlive&&!h.isDefending).sort((a,b)=>a.currentHp-b.currentHp)[0];
        if(guard){
          setRivalHeroes(nextRivals.map(h=>h.id===guard.id?{...h,shield:h.shield+3,isDefending:true,def:h.def+1}:h));
          particleCanvasRef.current?.triggerCardBurst(`hero-card-${guard.id}`,'shield','+3 ESCUDO');sound.playDefend();
          addLog(guard.name,'Protegeu sua carta com +3 Escudo e +1 DEF.','defense');
        }
      },350);
      setTimeout(()=>{
        if(token!==matchToken.current) return;
        const queenAlive=nextPlayers.some(h=>h.id==='p_rainha_copas'&&h.isAlive);
        const wounded=nextPlayers.filter(h=>h.isAlive).sort((a,b)=>(b.maxHp-b.currentHp)-(a.maxHp-a.currentHp))[0];
        nextPlayers=nextPlayers.map(h=>({...h,hasAttacked:false,isDefending:false,def:h.def-(h.isDefending?1:0),atk:h.atk-(h.temporaryAttack||0),temporaryAttack:0,currentHp:queenAlive&&h.id===wounded?.id?Math.min(h.maxHp,h.currentHp+2):h.currentHp}));
        setPlayerHeroes(nextPlayers);
        if(queenAlive&&wounded&&wounded.currentHp<wounded.maxHp) particleCanvasRef.current?.triggerCardBurst(`hero-card-${wounded.id}`,'heal','GRAÇA SOBERANA');
        if(deck.length && playerHand.length<5){setPlayerHand([...playerHand,deck[0]]);setDeck(deck.slice(1));}
        setPlayerEnergy(maxEnergy);setCurrentTurn('player');setRound(round+1);
        setActivePlayerHeroId(nextPlayers.find(h=>h.id===activePlayerHeroId&&h.isAlive)?.id||nextPlayers.find(h=>h.isAlive)!.id);
        setHint('Seu turno. Arraste uma carta ou um herói até o alvo.');sound.playCardDraw();
      },700);
    },900);
  };

  const clearDrag = () => {
    dragRef.current = null;
    setDraggingCard(null); setDraggingHero(null); setDragOrigin(null); setDragCurrent(null); setHoveredHeroId(null);
  };
  const startDrag = (e: React.PointerEvent, card?: ActionCard, hero?: Hero) => {
    if (gameOver || currentTurn !== 'player') return;
    if (card) {
      setSelectedCardId(card.id); setHint(card.description);
      if (playerEnergy < card.cost) { setHint('Energia insuficiente para esta carta.'); return; }
    }
    if (hero && (!hero.isAlive || hero.hasAttacked)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current={card,hero,x:e.clientX,y:e.clientY,moved:false,pointerId:e.pointerId};
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    const d=dragRef.current; if (!d || d.pointerId!==e.pointerId) return;
    if (!d.moved && Math.hypot(e.clientX-d.x,e.clientY-d.y)<14) return;
    d.moved=true;
    setDraggingCard(d.card||null); setDraggingHero(d.hero||null);
    setDragOrigin({x:d.x,y:d.y}); setDragCurrent({x:e.clientX,y:e.clientY});
    const el=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-hero-id]');
    setHoveredHeroId(el?.getAttribute('data-hero-id')||null);
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    const d=dragRef.current;
    if (!d || d.pointerId!==e.pointerId) return;
    if (!d.moved) { clearDrag(); return; }
    const el=document.elementFromPoint(e.clientX,e.clientY);
    const id=el?.closest('[data-hero-id]')?.getAttribute('data-hero-id');
    const enemy=rivalHeroes.find(h=>h.id===id && h.isAlive);
    const ally=playerHeroes.find(h=>h.id===id && h.isAlive);
    if (d.hero && enemy) {setSelectedRivalHeroId(enemy.id);setActivePlayerHeroId(d.hero.id);executeAttack(d.hero,enemy);}
    else if (d.card) {
      const kind=targetFor(d.card);
      if (kind==='enemy' && enemy) {setSelectedRivalHeroId(enemy.id);executeCardPlay(d.card,enemy);}
      else if (kind==='ally' && ally) {setActivePlayerHeroId(ally.id);executeCardPlay(d.card,undefined,ally);}
      else if (kind==='board' && el?.closest('[data-battlefield]')) executeCardPlay(d.card);
      else setHint(kind==='enemy'?'Solte sobre um rival vivo.':kind==='ally'?'Solte sobre um aliado vivo.':'Solte dentro do tabuleiro.');
    }
    clearDrag();
  };

  // 10. RESTART GAME
  const handleRestartGame = (nextChapter = chapter) => {
    if (!gameOver && !window.confirm('Iniciar uma nova partida? O progresso atual será perdido.')) return;
    try { localStorage.removeItem(SAVE_KEY); localStorage.removeItem(TURN_CHECKPOINT_KEY); } catch { /* Storage unavailable. */ }
    matchToken.current++;
    particleCanvasRef.current?.clear();
    setFloatingNumbers([]);
    clearDrag();
    sound.playClick();
    setPlayerHeroes(JSON.parse(JSON.stringify(INITIAL_PLAYER_HEROES)));
    setRivalHeroes(campaignRivals(nextChapter));
    setChapter(nextChapter);
    setActivePlayerHeroId('p_rei_espadas');
    setSelectedRivalHeroId('r_valete_copas');
    setPlayerHand(makeDeck(DECK_TEMPLATES).slice(0,3));
    setDeck(makeDeck(DECK_TEMPLATES).slice(3));
    setDiscardPile([]);
    setPlayerPg(1);
    setRivalPg(0);
    setPlayerEnergy(5);
    setRivalEnergy(3);
    setRound(1);
    setCurrentTurn('player');
    setSelectedCardId(null);
    setGameOver(null);
    setMatchId(newMatchId());
    setCombatLogs([
      {
        id: `restart_${Date.now()}`,
        timestamp: '09:00',
        type: 'system',
        speaker: 'Reinos do Destino',
        text: 'Nova partida iniciada! Que a sabedoria e a bravura guiem suas cartas.',
      },
    ]);
  };

  const dragKind = draggingCard ? targetFor(draggingCard) : draggingHero ? 'enemy' : null;
  const dragValid = !!dragCurrent && (dragKind==='board' ? !!document.elementFromPoint(dragCurrent.x,dragCurrent.y)?.closest('[data-battlefield]') : [...playerHeroes,...rivalHeroes].some(h=>h.id===hoveredHeroId&&h.isAlive&&(dragKind==='enemy'?h.id.startsWith('r_'):dragKind==='ally'&&h.id.startsWith('p_'))));
  const selectionTarget = !gameOver && currentTurn === 'player' && selectedCard && playerEnergy >= selectedCard.cost ? targetFor(selectedCard) : null;
  const validHero = (hero: Hero) => !!dragKind && hero.isAlive && (dragKind==='enemy' ? hero.id.startsWith('r_') : dragKind==='ally' && hero.id.startsWith('p_'));
  return (
    <div className={`mobile-game ${screenShake ? 'animate-screen-shake' : ''}`} data-turn={gameOver?'over':currentTurn} data-selection-target={selectionTarget||'none'} data-drag-state={dragKind?(dragValid?'valid':'invalid'):'idle'} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={clearDrag}>
      <header className="arena-header">
        <div className="arena-brand"><Crown size={18}/><span>REINOS <small>DO DESTINO</small></span></div>
        <nav aria-label="Menu do jogo">
          <button onClick={()=>setShowCampaign(true)} aria-label="Campanha">⚑</button>
          <button onClick={()=>setShowProfile(true)} aria-label="Perfil e estatísticas">★</button>
          <button onClick={()=>setShowRules(true)} aria-label="Regras">?</button>
          <button onClick={()=>setShowCompendium(true)} aria-label="Coleção de cartas">♛</button>
          <button onClick={()=>setShowLog(true)} aria-label="Histórico da batalha">≡</button>
          <button onClick={()=>setSoundEnabled(!soundEnabled)} aria-label={soundEnabled?'Desativar som':'Ativar som'}>{soundEnabled?'♫':'♪'}</button>
          <button onClick={handleRestartGame} aria-label="Nova partida">↻</button>
        </nav>
      </header>
      <div className="arena-score" aria-label="Placar">
        <div className="score-side score-player" data-energy={playerEnergy===0?'empty':playerEnergy<=2?'low':'ready'}>
          <div className="score-head"><span>VOCÊ</span><strong>{playerPg}<small>/12 PG</small></strong></div>
          <div className="pg-track" role="img" aria-label={`Glória ${playerPg} de 12`}>{Array.from({length:12},(_,i)=><i key={i} className={i<playerPg?'on':''}/>)}</div>
          <div className="energy-track" role="img" aria-label={`Energia ${playerEnergy} de ${maxEnergy}`}>{Array.from({length:maxEnergy},(_,i)=><i key={i} className={i<playerEnergy?'on':''}/>)}<b>{playerEnergy}/{maxEnergy}</b></div>
        </div>
        <div className="score-turn" role="status" aria-label={`Rodada ${round}. ${gameOver ? 'Partida encerrada' : currentTurn === 'player' ? 'Sua vez de jogar' : 'Vez do adversário'}`}><small>RODADA</small><em>{round}</em><strong>{gameOver?'FIM':currentTurn==='player'?'SEU TURNO':'RIVAL'}</strong></div>
        <div className="score-side score-rival" data-energy={rivalEnergy===0?'empty':rivalEnergy<=2?'low':'ready'}>
          <div className="score-head"><span>RIVAL</span><strong>{rivalPg}<small>/12 PG</small></strong></div>
          <div className="pg-track" role="img" aria-label={`Glória do rival ${rivalPg} de 12`}>{Array.from({length:12},(_,i)=><i key={i} className={i<rivalPg?'on':''}/>)}</div>
          <div className="energy-track" role="img" aria-label={`Energia do rival ${rivalEnergy} de ${maxEnergy}`}>{Array.from({length:maxEnergy},(_,i)=><i key={i} className={i<rivalEnergy?'on':''}/>)}<b>{rivalEnergy}/{maxEnergy}</b></div>
        </div>
      </div>
      <main className="arena-board" data-battlefield="true">
        <div className="battle-atmosphere" aria-hidden="true"><i/><i/><i/><i/><i/><i/></div>
        <section className="arena-row enemy-row" aria-label="Campo rival">
          <div className="row-caption"><span>REINO ADVERSÁRIO</span><small>Arraste seu herói para atacar</small></div>
          <div className="hero-row">{rivalHeroes.map(hero=><ArenaHero key={hero.id} hero={hero} targeted={hero.id===selectedRivalHeroId} valid={validHero(hero)} hovered={hoveredHeroId===hero.id} hit={hitHeroId===hero.id} onSelect={()=>handleSelectRivalHero(hero)} onInspect={()=>setInspectingItem(hero)}/>)}</div>
        </section>
        <div className={`battle-divider ${dragKind==='board'?'board-ready':''}`}><span className="pile">BARALHO <b>{deck.length}</b></span><p role="status">{dragKind ? dragKind==='enemy'?'SOLTE SOBRE UM RIVAL':dragKind==='ally'?'SOLTE SOBRE UM ALIADO':'SOLTE NO TABULEIRO' : 'ARENA DOS REINOS'}</p><span className="pile">DESCARTE <b>{discardPile.length}</b></span></div>
        <section className="arena-row player-row" aria-label="Seu campo">
          <div className="row-caption"><span>SUA CORTE</span><small>{activePlayerHero?.name}</small></div>
          <div className="hero-row">{playerHeroes.map(hero=><ArenaHero key={hero.id} hero={hero} active={hero.id===activePlayerHeroId} valid={validHero(hero)} hovered={hoveredHeroId===hero.id} hit={hitHeroId===hero.id} onSelect={()=>handleSelectPlayerHero(hero)} onInspect={()=>setInspectingItem(hero)} onStart={e=>startDrag(e,undefined,hero)}/>)}</div>
        </section>
      </main>
      <section className="arena-hand" data-has-selection={!!selectedCard} aria-label="Cartas na mão">
        <div className="row-caption"><span>SUA MÃO · {playerHand.length}/5</span><small>Toque para escolher · arraste para jogar</small></div>
        <div className="hand-cards" data-count={playerHand.length}>{playerHand.map((card,index)=><ArenaHand key={card.id} card={card} index={index} count={playerHand.length} missingEnergy={Math.max(0,card.cost-playerEnergy)} selected={card.id===selectedCardId} affordable={playerEnergy>=card.cost} onSelect={()=>{setSelectedCardId(card.id);setHint(card.description);}} onInspect={()=>setInspectingItem(card)} onStart={e=>startDrag(e,card)}/>)}</div>
      </section>
      <div className={`arena-hint ${/insuficiente|inválid/i.test(hint)?'warn':''}`} role="status"><span>{hint}</span></div>
      <div className="arena-actions"><ActionBar selectedCard={selectedCard} activeHero={activePlayerHero} targetedRival={targetedRivalHero} playerEnergy={playerEnergy} currentTurn={gameOver?'rival':currentTurn} onUseCard={handleUseCard} onAttack={handleAttack} onDefend={handleDefend} onUseAce={handleUseAce} onEndTurn={handleEndTurn}/></div>
      <CombatParticleCanvas ref={particleCanvasRef}/><FloatingNumberOverlay items={floatingNumbers}/>
      {dragOrigin && dragCurrent && <TargetingArrow startX={dragOrigin.x} startY={dragOrigin.y} currentX={dragCurrent.x} currentY={dragCurrent.y} targetType={dragKind||'board'} isTargetValid={dragValid}/>}
      {dragKind && dragCurrent && <div className={`drag-drop-feedback ${dragValid?'valid':'invalid'}`} role="status" aria-live="off">{dragValid?'✓ SOLTE PARA EXECUTAR':dragKind==='enemy'?'MIRE EM UM RIVAL VIVO':dragKind==='ally'?'MIRE EM UM ALIADO VIVO':'MIRE NO TABULEIRO'}</div>}
      {draggingCard && dragCurrent && <div className="drag-card-ghost" style={{left:dragCurrent.x,top:dragCurrent.y}}><img src={draggingCard.image} alt=""/><span>{draggingCard.name}</span></div>}
      {showCampaign && <div className="arena-modal" role="dialog" aria-modal="true" aria-label="Campanha"><div><button className="close-log" onClick={()=>setShowCampaign(false)}>Fechar ×</button><h2>⚑ Campanha dos Quatro Reinos</h2><p>Conquiste cada capítulo para desbloquear o próximo. Os rivais ganham vida e ataque conforme a campanha avança.</p>{CAMPAIGN_CHAPTERS.map((name,index)=><p key={name}><button disabled={index+1>unlockedChapter} onClick={()=>{if(!gameOver&&!window.confirm('Começar este capítulo e substituir a partida atual?'))return;setShowCampaign(false);handleRestartGame(index+1);}}>{index+1>unlockedChapter?'🔒':'⚔'} Capítulo {index+1}: {name}{chapter===index+1?' · ATUAL':''}</button></p>)}<small>Progresso salvo neste navegador.</small></div></div>}
      {showProfile && <div className="arena-modal" role="dialog" aria-modal="true" aria-label="Perfil do jogador"><div><button className="close-log" onClick={()=>setShowProfile(false)}>Fechar ×</button><h2>★ Crônicas do Reino</h2><p>Partidas concluídas: <b>{profile.wins+profile.losses}</b></p><p>Vitórias: <b>{profile.wins}</b> · Derrotas: <b>{profile.losses}</b></p><p>Taxa de vitória: <b>{profile.wins+profile.losses?Math.round(profile.wins/(profile.wins+profile.losses)*100):0}%</b></p><p>Maior rodada alcançada: <b>{profile.bestRound}</b></p><p>Recorde de glória: <b>{profile.bestPg} PG</b></p><h3>Conquistas</h3><p>{profile.wins>=1?'🏆':'🔒'} Primeira vitória</p><p>{profile.wins>=5?'🏆':'🔒'} Veterano — 5 vitórias</p><p>{profile.wins>=10?'🏆':'🔒'} Lenda — 10 vitórias</p><p>{profile.bestPg>=12?'🏆':'🔒'} Glória máxima — 12 PG</p><small>Estatísticas salvas somente neste navegador.</small></div></div>}
      {showLog && <div className="arena-modal" role="dialog" aria-modal="true" aria-label="Histórico da batalha"><div><button className="close-log" onClick={()=>setShowLog(false)}>Fechar ×</button><h2>Registro de batalha</h2>{combatLogs.map(log=><p key={log.id}><b>{log.speaker}</b> {log.text}</p>)}</div></div>}
      {inspectingItem && <CardInspectModal item={inspectingItem} onClose={()=>setInspectingItem(null)}/>}
      {showCompendium && <CardCompendiumModal onClose={()=>setShowCompendium(false)} onInspect={item=>setInspectingItem(item)}/>}
      {showRules && <RulesModal onClose={()=>setShowRules(false)}/>}
      {gameOver==='victory' && chapter<4 && <div className="campaign-next"><button onClick={()=>{setGameOver(null);handleRestartGame(chapter+1);}}>⚑ Avançar ao capítulo {chapter+1}</button></div>}
      {gameOver && <VictoryModal status={gameOver} playerPg={playerPg} rivalPg={rivalPg} rounds={round} onPlayAgain={handleRestartGame}/>}
    </div>
  );
}
