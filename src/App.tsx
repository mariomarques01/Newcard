import React, { useState, useEffect, useRef } from 'react';
import { Hero, ActionCard, CombatLogEntry, FloatingNumber } from './types/game';
import { INITIAL_PLAYER_HEROES, INITIAL_RIVAL_HEROES, DECK_TEMPLATES } from './data/gameData';
import { sound } from './utils/audio';
import { TopBar } from './components/TopBar';
import { MatchHud } from './components/MatchHud';
import { HeroCard } from './components/HeroCard';
import { HandCard } from './components/HandCard';
import { ActiveHeroBanner } from './components/ActiveHeroBanner';
import { ActionBar } from './components/ActionBar';
import { CombatLog } from './components/CombatLog';
import { FloatingNumberOverlay } from './components/FloatingNumberOverlay';
import { CardInspectModal } from './components/CardInspectModal';
import { CardCompendiumModal } from './components/CardCompendiumModal';
import { RulesModal } from './components/RulesModal';
import { VictoryModal } from './components/VictoryModal';
import { CombatParticleCanvas, CombatParticleCanvasRef } from './components/CombatParticleCanvas';
import { TargetingArrow } from './components/TargetingArrow';
import { Crown, Sparkles, Shield, Swords, Move, Target } from 'lucide-react';

export default function App() {
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

  const [playerHand, setPlayerHand] = useState<ActionCard[]>([
    DECK_TEMPLATES[0], // Coringa Místico
    DECK_TEMPLATES[1], // 5 de Espadas
    DECK_TEMPLATES[2], // 7 de Copas
  ]);
  const [deck, setDeck] = useState<ActionCard[]>(() => {
    // Fill deck with remaining templates and duplicates
    return [...DECK_TEMPLATES.slice(3), ...DECK_TEMPLATES, ...DECK_TEMPLATES];
  });
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

  const activePlayerHero = playerHeroes.find((h) => h.id === activePlayerHeroId) || playerHeroes[0];
  const targetedRivalHero = rivalHeroes.find((h) => h.id === selectedRivalHeroId) || rivalHeroes.find((h) => h.isAlive);
  const selectedCard = playerHand.find((c) => c.id === selectedCardId) || null;

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
  const executeCardPlay = (cardToPlay: ActionCard, customRivalTarget?: Hero) => {
    if (playerEnergy < cardToPlay.cost || currentTurn !== 'player') return;

    sound.playCardPlay();
    const newEnergy = playerEnergy - cardToPlay.cost;
    setPlayerEnergy(newEnergy);

    const targetEnemy = customRivalTarget || targetedRivalHero;

    // Apply card effects
    let updatedPlayerHeroes = [...playerHeroes];
    let updatedRivalHeroes = [...rivalHeroes];
    let newPlayerPg = playerPg;
    let newRivalPg = rivalPg;

    if (cardToPlay.suit === 'coringa') {
      // Coringa: +3 ATQ, +3 Shield, steals 1 PG
      particleCanvasRef.current?.triggerCardBurst(`hero-card-${activePlayerHeroId}`, 'arcane');
      if (targetEnemy) {
        particleCanvasRef.current?.triggerCardBurst(`hero-card-${targetEnemy.id}`, 'arcane');
      }
      updatedPlayerHeroes = updatedPlayerHeroes.map((h) => {
        if (h.id === activePlayerHeroId) {
          return { ...h, atk: h.atk + 3, shield: h.shield + 3 };
        }
        return h;
      });
      newPlayerPg = Math.min(12, newPlayerPg + 1);
      newRivalPg = Math.max(0, newRivalPg - 1);
      addFloatingNumber(window.innerWidth / 2, window.innerHeight / 2, '+1 PG ROUBADO', 'pg');
      addLog('Coringa Místico', 'Canalizou o caos estelar: +3 ATQ, +3 Escudo e roubou 1 PG do rival!', 'ace', undefined, 1);
    } else if (cardToPlay.type === 'attack') {
      // Direct Pierce attack
      if (targetEnemy && targetEnemy.isAlive) {
        triggerScreenShake();
        triggerHeroDamageHit(targetEnemy.id);
        particleCanvasRef.current?.triggerCardBurst(`hero-card-${targetEnemy.id}`, 'pierce');
        particleCanvasRef.current?.triggerCardBurst(`hero-card-${activePlayerHeroId}`, 'slash');
        const dmg = cardToPlay.value;
        const newHp = Math.max(0, targetEnemy.currentHp - dmg);
        const isDead = newHp === 0;

        updatedRivalHeroes = updatedRivalHeroes.map((h) => {
          if (h.id === targetEnemy.id) {
            return { ...h, currentHp: newHp, isAlive: !isDead };
          }
          return h;
        });

        addFloatingNumber(window.innerWidth / 2, 180, `-${dmg} PERFURA`, 'crit');
        if (isDead) {
          newPlayerPg = Math.min(12, newPlayerPg + 2);
          addLog(
            cardToPlay.name,
            `Perfurou a guarda de ${targetEnemy.name} causando ${dmg} de dano letal! O campeão rival foi abatido!`,
            'attack',
            undefined,
            2
          );
        } else {
          addLog(
            cardToPlay.name,
            `Golpe perfurante causou ${dmg} de dano ignorando armadura em ${targetEnemy.name}.`,
            'attack'
          );
        }
      }
    } else if (cardToPlay.type === 'heal') {
      // Heal active hero or all
      sound.playHeal();
      particleCanvasRef.current?.triggerCardBurst(`hero-card-${activePlayerHeroId}`, 'heal');
      updatedPlayerHeroes = updatedPlayerHeroes.map((h) => {
        if (h.id === activePlayerHeroId) {
          const healedHp = Math.min(h.maxHp, h.currentHp + cardToPlay.value);
          return { ...h, currentHp: healedHp };
        }
        return h;
      });
      addFloatingNumber(window.innerWidth / 2, window.innerHeight - 250, `+${cardToPlay.value} VIDA`, 'heal');
      addLog(cardToPlay.name, `Fontes sagradas curaram ${cardToPlay.value} de vida do ${activePlayerHero.name}.`, 'heal');
    } else if (cardToPlay.type === 'defense') {
      // Shield
      sound.playDefend();
      particleCanvasRef.current?.triggerCardBurst(`hero-card-${activePlayerHeroId}`, 'shield');
      updatedPlayerHeroes = updatedPlayerHeroes.map((h) => {
        if (h.id === activePlayerHeroId) {
          return { ...h, shield: h.shield + cardToPlay.value, def: h.def + 1 };
        }
        return h;
      });
      addFloatingNumber(window.innerWidth / 2, window.innerHeight - 250, `+${cardToPlay.value} ESCUDO`, 'shield');
      addLog(cardToPlay.name, `Baluarte de ferro concedeu +${cardToPlay.value} de escudo e +1 DEF.`, 'defense');
    } else if (cardToPlay.type === 'ace') {
      // Ace effect
      sound.playAcePower();
      particleCanvasRef.current?.triggerCardBurst(`hero-card-${activePlayerHeroId}`, 'gold_blast');
      if (cardToPlay.bonusPg) {
        newPlayerPg = Math.min(12, newPlayerPg + cardToPlay.bonusPg);
        addFloatingNumber(window.innerWidth / 2, 150, `+${cardToPlay.bonusPg} PG`, 'pg');
        addLog(cardToPlay.name, `Tributo glorioso garantiu +${cardToPlay.bonusPg} PG rumo à soberania real!`, 'ace', undefined, cardToPlay.bonusPg);
      } else {
        // Draw 2 cards
        if (deck.length >= 2) {
          const drawn = deck.slice(0, 2);
          setPlayerHand((prev) => [...prev, ...drawn]);
          setDeck((prev) => prev.slice(2));
          setPlayerEnergy((e) => Math.min(maxEnergy, e + 1));
          addLog(cardToPlay.name, 'Compradas 2 cartas do baralho e recuperou +1 de Energia.', 'ace');
        }
      }
    } else if (cardToPlay.type === 'tactics') {
      // Restore energy
      particleCanvasRef.current?.triggerCardBurst(`hero-card-${activePlayerHeroId}`, 'arcane');
      setPlayerEnergy((e) => Math.min(maxEnergy, e + cardToPlay.value));
      addFloatingNumber(window.innerWidth / 2, window.innerHeight - 250, `+${cardToPlay.value} ENERGIA`, 'heal');
      addLog(cardToPlay.name, `Reforço tático concedeu +${cardToPlay.value} cristais de energia!`, 'ace');
    }

    // Move to discard
    setDiscardPile((prev) => [cardToPlay, ...prev]);
    setPlayerHand((prev) => prev.filter((c) => c.id !== cardToPlay.id));
    setSelectedCardId(null);

    setPlayerHeroes(updatedPlayerHeroes);
    setRivalHeroes(updatedRivalHeroes);
    setPlayerPg(newPlayerPg);
    setRivalPg(newRivalPg);

    checkWinConditions(newPlayerPg, newRivalPg, updatedPlayerHeroes, updatedRivalHeroes);
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

    if (!attacker || !attacker.isAlive || attacker.hasAttacked || !target || !target.isAlive || currentTurn !== 'player') {
      return;
    }

    sound.playAttack();
    triggerScreenShake();
    triggerHeroDamageHit(target.id);

    // Trigger visual particles on targeted rival and attacker
    particleCanvasRef.current?.triggerCardBurst(`hero-card-${target.id}`, 'slash');
    particleCanvasRef.current?.triggerCardBurst(`hero-card-${attacker.id}`, 'slash');

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
        return { ...h, hasAttacked: true };
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
    if (!activePlayerHero || !activePlayerHero.isAlive || activePlayerHero.isDefending || currentTurn !== 'player') {
      return;
    }

    sound.playDefend();
    particleCanvasRef.current?.triggerCardBurst(`hero-card-${activePlayerHero.id}`, 'shield');

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
    if (!activePlayerHero || !activePlayerHero.isAlive || playerEnergy < 2 || currentTurn !== 'player') {
      return;
    }

    sound.playAcePower();
    triggerScreenShake();
    setPlayerEnergy((e) => e - 2);

    let updatedPlayerHeroes = [...playerHeroes];
    let updatedRivalHeroes = [...rivalHeroes];
    let newPlayerPg = playerPg;

    if (activePlayerHero.rank === 'K') {
      // King of Spades Ace: Draws 2 cards and gets +2 temporary ATQ
      particleCanvasRef.current?.triggerCardBurst(`hero-card-${activePlayerHero.id}`, 'gold_blast');
      if (deck.length >= 2) {
        const drawn = deck.slice(0, 2);
        setPlayerHand((prev) => [...prev, ...drawn]);
        setDeck((prev) => prev.slice(2));
      }
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
        particleCanvasRef.current?.triggerCardBurst(`hero-card-${targetedRivalHero.id}`, 'pierce');
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
    if (currentTurn !== 'player') return;

    sound.playTurnChange();
    setCurrentTurn('rival');
    addLog('Seu Turno', 'Turno finalizado. A corte rival inicia suas táticas de guerra...', 'system');

    // AI Turn simulation with delays for realistic, suspenseful gameplay
    setTimeout(() => {
      // Find living rival heroes and living player heroes
      setRivalHeroes((currentRivals) => {
        setPlayerHeroes((currentPlayers) => {
          const livingRivals = currentRivals.filter((h) => h.isAlive);
          const livingPlayers = currentPlayers.filter((h) => h.isAlive);

          if (livingRivals.length === 0 || livingPlayers.length === 0) {
            return currentPlayers;
          }

          // Pick an active rival attacker
          const attacker = livingRivals[Math.floor(Math.random() * livingRivals.length)];
          // Pick a target player hero (prioritize most wounded or active)
          const target = livingPlayers.sort((a, b) => a.currentHp - b.currentHp)[0];

          // Compute damage
          sound.playAttack();
          triggerScreenShake();
          triggerHeroDamageHit(target.id);
          particleCanvasRef.current?.triggerCardBurst(`hero-card-${target.id}`, 'slash');
          particleCanvasRef.current?.triggerCardBurst(`hero-card-${attacker.id}`, 'slash');

          let dmg = Math.max(1, attacker.atk - Math.floor(target.def / 2));
          let currentShield = target.shield;
          let shieldDmg = Math.min(currentShield, dmg);
          let hpDmg = dmg - shieldDmg;

          let newHp = Math.max(0, target.currentHp - hpDmg);
          let isDead = newHp === 0;

          let gainedRivalPg = isDead ? 2 : hpDmg >= 3 ? 1 : 0;

          addFloatingNumber(window.innerWidth / 2, window.innerHeight - 250, `-${dmg} GOLPE RIVAL`, 'damage');

          addLog(
            attacker.name,
            `contra-atacou ${target.name}: causou ${hpDmg} de dano.${isDead ? ' Seu herói foi abatido!' : ''}`,
            'attack',
            undefined,
            gainedRivalPg
          );

          // Update rival PG
          setRivalPg((pg) => {
            const nextPg = Math.min(12, pg + gainedRivalPg);
            checkWinConditions(playerPg, nextPg, currentPlayers, currentRivals);
            return nextPg;
          });

          // Return updated player heroes
          return currentPlayers.map((h) => {
            if (h.id === target.id) {
              return {
                ...h,
                currentHp: newHp,
                shield: currentShield - shieldDmg,
                isAlive: !isDead,
              };
            }
            return h;
          });
        });

        // Rival King of Diamonds passive: generates +1 shield after attacking
        return currentRivals.map((h) => {
          if (h.id === 'r_rei_ouros') {
            return { ...h, shield: h.shield + 1 };
          }
          return h;
        });
      });

      // After rival move, start player's new turn
      setTimeout(() => {
        sound.playCardDraw();
        setCurrentTurn('player');
        setRound((r) => r + 1);
        setPlayerEnergy(maxEnergy);
        setRivalEnergy(3);

        // Draw 1 card if hand < 5
        setDeck((prevDeck) => {
          if (prevDeck.length > 0) {
            const [nextCard, ...rest] = prevDeck;
            setPlayerHand((hand) => (hand.length < 5 ? [...hand, nextCard] : hand));
            return rest;
          }
          return prevDeck;
        });

        // Reset hasAttacked and refresh passive effects
        setPlayerHeroes((heroes) => {
          return heroes.map((h) => {
            let updated = { ...h, hasAttacked: false, isDefending: false };
            // Rainha de Copas passive: automatically heals 2 HP on lowest ally
            if (h.id === 'p_rainha_copas' && h.isAlive) {
              // will heal the lowest ally
            }
            return updated;
          });
        });

        addLog('Sua Rodada', `Rodada iniciada! Energia restabelecida (${maxEnergy} ⚡) e reforços recebidos.`, 'system');
      }, 1000);
    }, 1100);
  };

  // 9. HEARTHSTONE-STYLE DRAG & DROP HANDLERS
  const handleDragStartCard = (card: ActionCard, e: React.PointerEvent) => {
    if (playerEnergy < card.cost || currentTurn !== 'player') return;
    setDraggingCard(card);
    setSelectedCardId(card.id);
    setDragOrigin({ x: e.clientX, y: e.clientY });
    setDragCurrent({ x: e.clientX, y: e.clientY });
    sound.playCardDraw();
  };

  const handleDragStartAttack = (hero: Hero, e: React.PointerEvent) => {
    if (!hero.isAlive || hero.hasAttacked || currentTurn !== 'player') return;
    setDraggingHero(hero);
    setActivePlayerHeroId(hero.id);
    setDragOrigin({ x: e.clientX, y: e.clientY });
    setDragCurrent({ x: e.clientX, y: e.clientY });
    sound.playClick();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingCard && !draggingHero) return;
    setDragCurrent({ x: e.clientX, y: e.clientY });

    // Detect hovered hero element
    const elem = document.elementFromPoint(e.clientX, e.clientY);
    const heroCardElem = elem?.closest('[id^="hero-card-"]');
    if (heroCardElem) {
      const heroId = heroCardElem.id.replace('hero-card-', '');
      setHoveredHeroId(heroId);
    } else {
      setHoveredHeroId(null);
    }
  };

  const handlePointerUp = () => {
    if (draggingHero) {
      if (hoveredHeroId && hoveredHeroId.startsWith('r_')) {
        const targetRival = rivalHeroes.find((h) => h.id === hoveredHeroId && h.isAlive);
        if (targetRival && draggingHero.isAlive && !draggingHero.hasAttacked) {
          setSelectedRivalHeroId(targetRival.id);
          setActivePlayerHeroId(draggingHero.id);
          executeAttack(draggingHero, targetRival);
        }
      }
    } else if (draggingCard) {
      // Check if dropped onto target hero or battlefield
      if (hoveredHeroId && hoveredHeroId.startsWith('r_') && draggingCard.type === 'attack') {
        const targetRival = rivalHeroes.find((h) => h.id === hoveredHeroId && h.isAlive);
        if (targetRival) {
          setSelectedRivalHeroId(targetRival.id);
          executeCardPlay(draggingCard, targetRival);
        }
      } else if (hoveredHeroId && hoveredHeroId.startsWith('p_') && draggingCard.type === 'heal') {
        executeCardPlay(draggingCard);
      } else if (dragOrigin && dragCurrent && dragOrigin.y - dragCurrent.y > 65) {
        // Dragged up into battlefield arena
        executeCardPlay(draggingCard);
      }
    }

    setDraggingCard(null);
    setDraggingHero(null);
    setDragOrigin(null);
    setDragCurrent(null);
    setHoveredHeroId(null);
  };

  // 10. RESTART GAME
  const handleRestartGame = () => {
    sound.playClick();
    setPlayerHeroes(JSON.parse(JSON.stringify(INITIAL_PLAYER_HEROES)));
    setRivalHeroes(JSON.parse(JSON.stringify(INITIAL_RIVAL_HEROES)));
    setActivePlayerHeroId('p_rei_espadas');
    setSelectedRivalHeroId('r_valete_copas');
    setPlayerHand([DECK_TEMPLATES[0], DECK_TEMPLATES[1], DECK_TEMPLATES[2]]);
    setDeck([...DECK_TEMPLATES.slice(3), ...DECK_TEMPLATES, ...DECK_TEMPLATES]);
    setDiscardPile([]);
    setPlayerPg(1);
    setRivalPg(0);
    setPlayerEnergy(5);
    setRivalEnergy(3);
    setRound(1);
    setCurrentTurn('player');
    setSelectedCardId(null);
    setGameOver(null);
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

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`min-h-screen flex flex-col bg-[#050811] text-slate-100 transition-transform select-none ${
        screenShake ? 'animate-screen-shake' : ''
      }`}
      style={{
        backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(30, 58, 138, 0.25), transparent), radial-gradient(ellipse 60% 40% at 50% 120%, rgba(180, 83, 9, 0.15), transparent)`,
      }}
    >
      {/* Top Bar Navigation */}
      <TopBar
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onOpenCompendium={() => setShowCompendium(true)}
        onOpenRules={() => setShowRules(true)}
        onOpenLog={() => {}}
        onNewGame={handleRestartGame}
      />

      {/* Particles and Floating impact numbers overlay */}
      <CombatParticleCanvas ref={particleCanvasRef} />
      <FloatingNumberOverlay items={floatingNumbers} />

      {/* Hearthstone Dynamic Curved Targeting Arrow Overlay */}
      {dragOrigin && dragCurrent && (
        <TargetingArrow
          startX={dragOrigin.x}
          startY={dragOrigin.y}
          currentX={dragCurrent.x}
          currentY={dragCurrent.y}
          targetType={
            draggingHero
              ? 'enemy'
              : draggingCard?.type === 'attack'
              ? 'enemy'
              : draggingCard?.type === 'heal'
              ? 'ally'
              : 'board'
          }
          isTargetValid={
            Boolean(
              (draggingHero && hoveredHeroId && hoveredHeroId.startsWith('r_')) ||
              (draggingCard?.type === 'attack' && hoveredHeroId && hoveredHeroId.startsWith('r_')) ||
              (draggingCard?.type === 'heal' && hoveredHeroId && hoveredHeroId.startsWith('p_')) ||
              (draggingCard && dragOrigin.y - dragCurrent.y > 65)
            )
          }
        />
      )}

      {/* Hearthstone Drag Dropzone Prompt Banner */}
      {(draggingCard || draggingHero) && (
        <div className="fixed inset-x-0 bottom-36 sm:bottom-44 z-30 pointer-events-none flex justify-center animate-fadeIn px-2">
          <div className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-full bg-slate-950/95 border-2 border-amber-400 text-amber-200 font-royal font-bold text-[10px] sm:text-xs uppercase tracking-wider shadow-[0_0_24px_rgba(251,191,36,0.7)] animate-bounce flex items-center gap-1.5 sm:gap-2 backdrop-blur-md text-center max-w-[90vw]">
            <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
            <span className="truncate">
              {draggingHero
                ? 'Solte sobre o rival para ATACAR!'
                : draggingCard?.type === 'attack'
                ? 'Mire no rival para perfurar!'
                : 'Solte no campo para JOGAR a carta!'}
            </span>
          </div>
        </div>
      )}

      {/* Main Game Arena */}
      <main className="flex-1 flex flex-col items-center justify-between max-w-5xl w-full mx-auto px-1 sm:px-2 md:px-4 py-1 sm:py-2 overflow-x-hidden">
        {/* Match HUD Strip */}
        <MatchHud
          playerPg={playerPg}
          rivalPg={rivalPg}
          maxPg={12}
          playerEnergy={playerEnergy}
          maxEnergy={maxEnergy}
          rivalEnergy={rivalEnergy}
          round={round}
          currentTurn={currentTurn}
          deckCount={deck.length}
          discardCount={discardPile.length}
          rivalHandCount={3}
        />

        {/* SECTION 1: REINO ADVERSÁRIO (Opponent's Realm with Fog of War) */}
        <section className="relative w-full my-0.5 sm:my-1 rounded-xl sm:rounded-2xl overflow-hidden p-1.5 sm:p-2.5 bg-gradient-to-b from-slate-950/90 via-slate-900/40 to-slate-950/80 border border-rose-950/40 shadow-inner">
          {/* Animated Fog of War Layers */}
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-xl sm:rounded-2xl select-none">
            {/* Drifting Mist Layer 1 */}
            <div className="absolute -inset-12 fog-war-layer-1 filter blur-2xl" />
            {/* Counter Drifting Mist Layer 2 */}
            <div className="absolute -inset-12 fog-war-layer-2 filter blur-3xl" />
            {/* Dark Vignette and Rim Light */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-red-950/20" />
            {/* Atmospheric Mist Crests */}
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-slate-950/60 to-transparent" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between px-1 sm:px-2 mb-1">
              <span className="font-royal text-[10px] sm:text-xs font-bold tracking-widest text-rose-300/90 uppercase flex items-center gap-1 sm:gap-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                <Swords className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-400" />
                REINO ADVERSÁRIO
                <span className="text-[8px] sm:text-[9px] font-sans font-medium text-purple-300/80 bg-purple-950/50 border border-purple-500/30 px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded-full hidden sm:inline-block">
                  Névoa de Guerra
                </span>
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-400 truncate max-w-[150px]">
                {targetedRivalHero ? `Alvo: ${targetedRivalHero.name.split(' ')[0]}` : 'Selecione alvo'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1 sm:gap-3 md:gap-4 justify-items-center">
              {rivalHeroes.map((hero, idx) => (
                <HeroCard
                  key={hero.id}
                  hero={hero}
                  isPlayer={false}
                  isTargeted={hero.id === selectedRivalHeroId}
                  isHoveredAsTarget={hoveredHeroId === hero.id}
                  isHit={hitHeroId === hero.id}
                  enterDelay={idx * 75}
                  onClick={() => handleSelectRivalHero(hero)}
                  onInspect={(h) => setInspectingItem(h)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 2: SEUS HERÓIS (Your Heroes) */}
        <section className="w-full my-0.5 sm:my-1">
          <div className="flex items-center justify-between px-1 sm:px-2 mb-1">
            <span className="font-royal text-[10px] sm:text-xs font-bold tracking-widest text-cyan-300/80 uppercase flex items-center gap-1 sm:gap-1.5">
              <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
              SEUS HERÓIS DA COROA
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-400 hidden xs:inline">
              Toque ou arraste para atacar
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1 sm:gap-3 md:gap-4 justify-items-center">
            {playerHeroes.map((hero, idx) => (
              <HeroCard
                key={hero.id}
                hero={hero}
                isPlayer={true}
                isActive={hero.id === activePlayerHeroId}
                isHoveredAsTarget={hoveredHeroId === hero.id}
                isHit={hitHeroId === hero.id}
                enterDelay={idx * 75}
                onClick={() => handleSelectPlayerHero(hero)}
                onInspect={(h) => setInspectingItem(h)}
                onDragStartAttack={(h, e) => handleDragStartAttack(h, e)}
              />
            ))}
          </div>
        </section>

        {/* SECTION 3: HERÓI ATIVO (Active Hero Commander Console) */}
        <section className="w-full my-0.5 sm:my-1">
          <ActiveHeroBanner hero={activePlayerHero} onInspect={(h) => setInspectingItem(h)} />
        </section>

        {/* SECTION 4: SUA MÃO (Your Hand Cards) */}
        <section className="w-full my-0.5 sm:my-1">
          <div className="flex items-center justify-between px-1 sm:px-2 mb-1">
            <span className="font-royal text-[10px] sm:text-xs font-bold tracking-widest text-amber-300/80 uppercase flex items-center gap-1 sm:gap-1.5">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
              SUA MÃO ({playerHand.length})
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-400">
              Energia: <strong className="text-cyan-300 font-mono">{playerEnergy}⚡</strong>
            </span>
          </div>

          {/* Hand Cards Arc/Flex Row with smooth touch scrolling and snap */}
          <div className="w-full overflow-x-auto pb-1.5 px-1 flex items-center justify-start sm:justify-center gap-1.5 sm:gap-3 min-h-[162px] sm:min-h-[185px] scroll-smooth snap-x">
            {playerHand.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 w-full">
                Sua mão está vazia. Encerre o turno para comprar reforços.
              </div>
            ) : (
              playerHand.map((card, idx) => (
                <HandCard
                  key={card.id}
                  card={card}
                  isSelected={card.id === selectedCardId}
                  canAfford={playerEnergy >= card.cost}
                  isDragging={draggingCard?.id === card.id}
                  enterDelay={idx * 60}
                  onClick={() => handleSelectHandCard(card)}
                  onInspect={(c) => setInspectingItem(c)}
                  onDragStartAction={(c, e) => handleDragStartCard(c, e)}
                />
              ))
            )}
          </div>
        </section>

        {/* SECTION 5: ACTION BAR */}
        <ActionBar
          selectedCard={selectedCard}
          activeHero={activePlayerHero}
          targetedRival={targetedRivalHero}
          playerEnergy={playerEnergy}
          currentTurn={currentTurn}
          onUseCard={handleUseCard}
          onAttack={handleAttack}
          onDefend={handleDefend}
          onUseAce={handleUseAce}
          onEndTurn={handleEndTurn}
        />

        {/* SECTION 6: COMBAT LOG & BOTTOM NAV */}
        <CombatLog
          logs={combatLogs}
          onOpenCompendium={() => setShowCompendium(true)}
          onNewGame={handleRestartGame}
          onOpenRules={() => setShowRules(true)}
        />
      </main>

      {/* MODALS */}
      {inspectingItem && (
        <CardInspectModal item={inspectingItem} onClose={() => setInspectingItem(null)} />
      )}

      {showCompendium && (
        <CardCompendiumModal
          onClose={() => setShowCompendium(false)}
          onInspect={(item) => setInspectingItem(item)}
        />
      )}

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      {gameOver && (
        <VictoryModal
          status={gameOver}
          playerPg={playerPg}
          rivalPg={rivalPg}
          rounds={round}
          onPlayAgain={handleRestartGame}
        />
      )}
    </div>
  );
}
