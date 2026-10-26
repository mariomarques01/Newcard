using System;
using System.Collections.Generic;
using System.Linq;

namespace ReinosDoDestino.Core
{
    // Pure C#: shared by Unity, EditMode tests and the standalone verification runner.
    public sealed class BattleEngine
    {
        public Catalog Catalog { get; private set; }
        public BattleState State { get; private set; }
        readonly Dictionary<string, CreatureDefinition> creatures;
        readonly Dictionary<string, SpellDefinition> spells;
        readonly Random random;
        public BattleEngine(Catalog catalog, int seed = 1)
        {
            catalog.Validate(); Catalog = catalog; random = new Random(seed);
            creatures = catalog.AllCreatures().ToDictionary(d => d.id);
            spells = catalog.spells.ToDictionary(d => d.id);
            NewMatch();
        }
        public CreatureDefinition Definition(string id) { return creatures[id]; }
        public SpellDefinition Spell(string id) { return spells[id]; }
        public void NewMatch()
        {
            State = new BattleState { playerEnergy = Catalog.maxEnergy };
            State.players.AddRange(Catalog.players.Select(CreatureState.From));
            State.rivals.AddRange(Catalog.rivals.Select(CreatureState.From));
            State.selectedAlly = State.players[1].id; State.selectedEnemy = State.rivals[2].id;
            for (int i = 0; i < Catalog.deckSize; i++)
            {
                string template = Catalog.spells[i % Catalog.spells.Length].id;
                State.deck.Add(new SpellInstance { id = template + "__" + i, templateId = template });
            }
            for (int i = 0; i < Catalog.openingHand; i++) Draw();
        }
        public bool Restore(BattleState saved)
        {
            if (saved == null || saved.version != 1 || saved.players == null || saved.rivals == null || saved.hand == null || saved.deck == null || saved.discard == null || saved.round < 1) return false;
            if (!ValidCourt(saved.players, Catalog.players) || !ValidCourt(saved.rivals, Catalog.rivals)) return false;
            if (saved.playerEnergy < 0 || saved.playerEnergy > Catalog.maxEnergy || saved.rivalEnergy < 0 || saved.rivalEnergy > Catalog.maxEnergy || saved.hand.Count > Catalog.maxHand) return false;
            if (saved.turn != Side.Player && saved.turn != Side.Rival) return false;
            var ids = new HashSet<string>();
            foreach (var card in saved.hand.Concat(saved.deck).Concat(saved.discard))
                if (card == null || !spells.ContainsKey(card.templateId ?? "") || string.IsNullOrEmpty(card.id) || !ids.Add(card.id)) return false;
            if (saved.turn == Side.Rival) return false; // Save only complete player-turn checkpoints.
            State = saved; RepairSelection(); CheckResult(); return true;
        }
        bool ValidCourt(List<CreatureState> court, CreatureDefinition[] definitions)
        {
            if (court.Count != definitions.Length || court.Any(c => c == null)) return false;
            for (int i = 0; i < court.Count; i++)
            {
                var c = court[i];
                if (c.id != definitions[i].id || c.maxHp < definitions[i].maxHp || c.hp < 0 || c.hp > c.maxHp || c.attack < 0 || c.defense < 0 || c.shield < 0 || c.attackReduction < 0 || c.defenseReduction < 0 || c.temporaryAttack < 0) return false;
            }
            return true;
        }
        public bool SelectAlly(string id)
        {
            if (!State.players.Any(c => c.id == id && c.Alive)) return false;
            State.selectedAlly = id; return true;
        }
        public bool SelectEnemy(string id)
        {
            if (!State.rivals.Any(c => c.id == id && c.Alive)) return false;
            State.selectedEnemy = id; return true;
        }
        bool CanAct { get { return State.turn == Side.Player && State.result == MatchResult.Playing; } }
        public ActionResult Attack()
        {
            if (!CanAct) return ActionResult.Fail("Aguarde sua vez.");
            var source = State.players.Find(c => c.id == State.selectedAlly);
            var target = State.rivals.Find(c => c.id == State.selectedEnemy);
            if (source == null || target == null || !source.Alive || !target.Alive || source.hasAttacked || source.stunned) return ActionResult.Fail("Selecione criaturas aptas a atacar.");
            var result = Success("Ataque elemental");
            Hit(source, target, Math.Max(1, source.attack - target.defense / 2), false, result, "Ataque elemental");
            source.hasAttacked = true; Progress(source, result); CheckResult(); return result;
        }
        public ActionResult Defend()
        {
            if (!CanAct) return ActionResult.Fail("Aguarde sua vez.");
            var source = State.players.Find(c => c.id == State.selectedAlly);
            if (source == null || !source.Alive || source.defending) return ActionResult.Fail("Esta criatura já está defendendo.");
            var result = Success("Defesa elemental");
            source.defending = true; source.shield += 3; source.defense++;
            if (source.id == "p_valete_paus") State.playerEnergy = Math.Min(Catalog.maxEnergy, State.playerEnergy + 1);
            result.events.Add(Event(source, source, "Defesa elemental", shield: 3, defense: 1));
            Progress(source, result); return result;
        }
        public ActionResult Play(string instanceId)
        {
            if (!CanAct) return ActionResult.Fail("Aguarde sua vez.");
            var card = State.hand.Find(c => c.id == instanceId);
            if (card == null || !spells.ContainsKey(card.templateId)) return ActionResult.Fail("Carta indisponível.");
            var definition = spells[card.templateId];
            var source = State.players.Find(c => c.id == State.selectedAlly);
            var enemy = State.rivals.Find(c => c.id == State.selectedEnemy);
            if (source == null || !source.Alive || State.playerEnergy < definition.cost) return ActionResult.Fail("Energia insuficiente ou aliado inválido.");
            if (definition.ability.damage > 0 && !definition.ability.enemyAll && (enemy == null || !enemy.Alive)) return ActionResult.Fail("Escolha um inimigo vivo.");
            State.playerEnergy -= definition.cost; State.hand.Remove(card); State.discard.Insert(0, card);
            var result = Success(definition.name);
            Resolve(source, source, enemy, State.players, State.rivals, definition.ability, definition.element, result, definition.name);
            Progress(source, result); CheckResult(); return result;
        }
        public ActionResult UsePower()
        {
            if (!CanAct) return ActionResult.Fail("Aguarde sua vez.");
            var source = State.players.Find(c => c.id == State.selectedAlly);
            var enemy = State.rivals.Find(c => c.id == State.selectedEnemy);
            if (source == null || !source.Alive || State.playerEnergy < 2) return ActionResult.Fail("A habilidade exige 2 de energia.");
            var definition = creatures[source.id];
            if (definition.power.damage > 0 && (enemy == null || !enemy.Alive)) return ActionResult.Fail("Escolha um inimigo vivo.");
            State.playerEnergy -= 2;
            var result = Success(definition.abilityName);
            Resolve(source, source, enemy, State.players, State.rivals, definition.power, definition.element, result, definition.abilityName);
            CheckResult(); return result;
        }
        public ActionResult EndTurn()
        {
            if (!CanAct) return ActionResult.Fail("A partida não pode avançar agora.");
            State.turn = Side.Rival;
            foreach (var c in State.players) Expire(c);
            var result = Success("Turno rival");
            var living = State.rivals.Where(c => c.Alive).ToArray();
            var target = State.players.Where(c => c.Alive).OrderBy(c => c.hp).FirstOrDefault();
            if (living.Length == 0 || target == null) { CheckResult(); State.turn = Side.Player; return result; }
            var attacker = living[random.Next(living.Length)];
            if (!attacker.stunned)
            {
                if (State.rivalEnergy >= 2)
                {
                    State.rivalEnergy -= 2; var d = creatures[attacker.id];
                    Resolve(attacker, attacker, target, State.rivals, State.players, d.power, d.element, result, d.abilityName);
                }
                else Hit(attacker, target, Math.Max(1, attacker.attack - target.defense / 2), false, result, "Ataque rival");
                Progress(attacker, result);
            }
            else result.events.Add(Event(attacker, attacker, "Ataque impedido"));
            foreach (var c in State.rivals) { Expire(c); ClearGuard(c); }
            CheckResult();
            if (State.result == MatchResult.Playing)
            {
                var guard = State.rivals.Where(c => c.Alive).OrderBy(c => c.hp).FirstOrDefault();
                if (guard != null)
                {
                    guard.shield += 3; guard.defense++; guard.defending = true;
                    result.events.Add(Event(guard, guard, "Defesa rival", shield: 3, defense: 1)); Progress(guard, result);
                }
                var ent = State.players.Find(c => c.id == "p_rainha_copas" && c.Alive);
                var wounded = State.players.Where(c => c.Alive).OrderByDescending(c => c.maxHp - c.hp).FirstOrDefault();
                if (ent != null && wounded != null && wounded.hp < wounded.maxHp)
                {
                    int healed = Math.Min(2, wounded.maxHp - wounded.hp); wounded.hp += healed;
                    result.events.Add(Event(ent, wounded, "Renovação da floresta", healed: healed));
                }
                foreach (var c in State.players) { c.hasAttacked = false; ClearGuard(c); c.attack -= c.temporaryAttack; c.temporaryAttack = 0; }
                Draw(); State.round++; State.playerEnergy = Catalog.maxEnergy; State.rivalEnergy = Catalog.maxEnergy;
            }
            State.turn = Side.Player; RepairSelection(); return result;
        }
        public ActionResult ResolveForVerification(string sourceId, string allyId, string enemyId, Ability ability, Side side = Side.Player)
        {
            var allies = side == Side.Player ? State.players : State.rivals;
            var enemies = side == Side.Player ? State.rivals : State.players;
            var source = allies.Find(c => c.id == sourceId); var ally = allies.Find(c => c.id == allyId); var enemy = enemies.Find(c => c.id == enemyId);
            if (source == null || ally == null) return ActionResult.Fail("Alvo inválido.");
            var result = Success("Verificação"); Resolve(source, ally, enemy, allies, enemies, ability, creatures[source.id].element, result, "Verificação"); CheckResult(); return result;
        }
        void Resolve(CreatureState source, CreatureState ally, CreatureState enemy, List<CreatureState> allies, List<CreatureState> enemies, Ability ability, Element element, ActionResult result, string title)
        {
            foreach (var c in allies)
            {
                if (!c.Alive || (!ability.all && c != ally)) continue;
                int healed = Math.Min(ability.heal, c.maxHp - c.hp); c.hp += healed;
                c.shield += ability.shield; c.attack += ability.attack; c.defense += ability.defense;
                if (ability.temporary) c.temporaryAttack += ability.attack;
                if (healed + ability.shield + ability.attack + ability.defense > 0)
                    result.events.Add(Event(source, c, title, healed: healed, shield: ability.shield, attack: ability.attack, defense: ability.defense, element: element));
            }
            if (ability.allyShield > 0)
            {
                var other = allies.Find(c => c.Alive && c != source);
                if (other != null) { other.shield += ability.allyShield; result.events.Add(Event(source, other, title, shield: ability.allyShield, element: element)); }
            }
            foreach (var c in enemies)
            {
                if (!c.Alive) continue;
                bool selected = ability.enemyAll || c == enemy;
                int damage = selected ? ability.damage : ability.splash;
                if (damage > 0) Hit(source, c, damage, true, result, title, element);
                int atkLoss = (selected || ability.attackDownAll) && c.Alive ? Math.Min(c.attack, ability.attackDown) : 0;
                int defLoss = selected && c.Alive ? Math.Min(c.defense, ability.defenseDown) : 0;
                c.attack -= atkLoss; c.attackReduction += atkLoss; c.defense -= defLoss; c.defenseReduction += defLoss;
                if (selected && ability.stun && c.Alive) c.stunned = true;
                if (atkLoss + defLoss > 0 || (selected && ability.stun && c.Alive))
                    result.events.Add(Event(source, c, title, attack: -atkLoss, defense: -defLoss, stunned: selected && ability.stun && c.Alive, element: element));
            }
            if (allies == State.players) State.playerEnergy = Math.Min(Catalog.maxEnergy, State.playerEnergy + ability.energy);
            else State.rivalEnergy = Math.Min(Catalog.maxEnergy, State.rivalEnergy + ability.energy);
        }
        void Hit(CreatureState source, CreatureState target, int damage, bool direct, ActionResult result, string title, Element? element = null)
        {
            int shieldLost = direct ? 0 : Math.Min(target.shield, damage);
            int hpLost = Math.Min(target.hp, damage - shieldLost);
            target.shield -= shieldLost; target.hp -= hpLost;
            int glory = !target.Alive ? 2 : !direct && hpLost >= 3 ? 1 : 0;
            if (State.players.Contains(source)) State.playerGlory = Math.Min(Catalog.gloryToWin, State.playerGlory + glory);
            else State.rivalGlory = Math.Min(Catalog.gloryToWin, State.rivalGlory + glory);
            var e = Event(source, target, title, element: element); e.hpLost = hpLost; e.shieldLost = shieldLost; e.defeated = !target.Alive; result.events.Add(e);
        }
        CombatEvent Event(CreatureState source, CreatureState target, string title, int healed = 0, int shield = 0, int attack = 0, int defense = 0, bool stunned = false, Element? element = null)
        {
            return new CombatEvent { sourceId = source.id, targetId = target.id, title = title, element = element ?? creatures[source.id].element, healed = healed, shieldGained = shield, attackChange = attack, defenseChange = defense, stunned = stunned };
        }
        static ActionResult Success(string title) { return new ActionResult { success = true, message = title }; }
        static void ClearGuard(CreatureState c) { if (c.defending) c.defense = Math.Max(0, c.defense - 1); c.defending = false; }
        static void Expire(CreatureState c) { c.attack += c.attackReduction; c.defense += c.defenseReduction; c.attackReduction = c.defenseReduction = 0; c.stunned = false; }
        void Progress(CreatureState c, ActionResult result)
        {
            if (c.evolved || !c.Alive) return;
            if (++c.evolutionCharge < 3) return;
            c.evolved = true; c.attack++; c.shield += 2;
            result.events.Add(Event(c, c, "Evolução elemental", shield: 2, attack: 1));
        }
        void Draw()
        {
            if (State.hand.Count >= Catalog.maxHand || State.deck.Count == 0) return;
            State.hand.Add(State.deck[0]); State.deck.RemoveAt(0);
        }
        void RepairSelection()
        {
            if (!State.players.Any(c => c.Alive && c.id == State.selectedAlly)) State.selectedAlly = State.players.FirstOrDefault(c => c.Alive)?.id;
            if (!State.rivals.Any(c => c.Alive && c.id == State.selectedEnemy)) State.selectedEnemy = State.rivals.FirstOrDefault(c => c.Alive)?.id;
        }
        void CheckResult()
        {
            if (State.playerGlory >= Catalog.gloryToWin || State.rivals.All(c => !c.Alive)) State.result = MatchResult.Victory;
            else if (State.rivalGlory >= Catalog.gloryToWin || State.players.All(c => !c.Alive)) State.result = MatchResult.Defeat;
        }
    }
}
