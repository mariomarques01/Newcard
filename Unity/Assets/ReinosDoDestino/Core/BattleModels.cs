using System;
using System.Collections.Generic;

namespace ReinosDoDestino.Core
{
    public enum Element { Fire, Water, Earth, Air }
    public enum Side { Player, Rival }
    public enum MatchResult { Playing, Victory, Defeat }
    [Serializable] public sealed class Ability
    {
        public int damage, splash, heal, shield, attack, defense, energy, attackDown, defenseDown, allyShield;
        public bool enemyAll, all, temporary, stun, attackDownAll;
    }
    [Serializable] public sealed class CreatureDefinition
    {
        public string id, name, title, artwork, abilityName, description, powerDescription;
        public Element element;
        public int maxHp, attack, defense, shield;
        public Ability power;
    }
    [Serializable] public sealed class SpellDefinition
    {
        public string id, name, artwork, description;
        public Element element;
        public int cost;
        public Ability ability;
    }
    [Serializable] public sealed class Catalog
    {
        public int schemaVersion, deckSize, openingHand, maxHand, maxEnergy, gloryToWin;
        public CreatureDefinition[] players, rivals;
        public SpellDefinition[] spells;
        public void Validate()
        {
            if (schemaVersion != 1 || players == null || players.Length != 3 || rivals == null || rivals.Length != 3 || spells == null || spells.Length == 0)
                throw new ArgumentException("Catálogo elemental incompleto.");
            if (maxEnergy <= 0 || maxHand < openingHand || openingHand <= 0 || deckSize < openingHand || gloryToWin <= 0)
                throw new ArgumentException("Configuração de partida inválida.");
            var ids = new HashSet<string>();
            foreach (var d in AllCreatures())
                if (string.IsNullOrEmpty(d.id) || !ids.Add(d.id) || d.maxHp <= 0 || d.attack < 0 || d.defense < 0 || d.power == null)
                    throw new ArgumentException("Criatura elemental inválida.");
            foreach (var c in spells)
                if (string.IsNullOrEmpty(c.id) || !ids.Add(c.id) || c.cost < 0 || c.ability == null || !c.id.StartsWith("elemental_", StringComparison.Ordinal))
                    throw new ArgumentException("Magia elemental inválida.");
        }
        public IEnumerable<CreatureDefinition> AllCreatures()
        {
            foreach (var d in players) yield return d;
            foreach (var d in rivals) yield return d;
        }
    }
    [Serializable] public sealed class CreatureState
    {
        public string id;
        public int hp, maxHp, attack, defense, shield, temporaryAttack, attackReduction, defenseReduction, evolutionCharge;
        public bool hasAttacked, defending, stunned, evolved;
        public bool Alive { get { return hp > 0; } }
        public static CreatureState From(CreatureDefinition d)
        {
            return new CreatureState { id = d.id, hp = d.maxHp, maxHp = d.maxHp, attack = d.attack, defense = d.defense, shield = d.shield };
        }
    }
    [Serializable] public sealed class SpellInstance { public string id, templateId; }
    [Serializable] public sealed class BattleState
    {
        public int version = 1, round = 1, playerEnergy = 5, rivalEnergy = 3, playerGlory, rivalGlory;
        public Side turn;
        public MatchResult result;
        public string selectedAlly, selectedEnemy;
        public List<CreatureState> players = new List<CreatureState>();
        public List<CreatureState> rivals = new List<CreatureState>();
        public List<SpellInstance> hand = new List<SpellInstance>();
        public List<SpellInstance> deck = new List<SpellInstance>();
        public List<SpellInstance> discard = new List<SpellInstance>();
    }
    public sealed class CombatEvent
    {
        public string sourceId, targetId, title, message;
        public Element element;
        public int hpLost, shieldLost, healed, shieldGained, attackChange, defenseChange;
        public bool stunned, defeated;
    }
    public sealed class ActionResult
    {
        public bool success;
        public string message;
        public readonly List<CombatEvent> events = new List<CombatEvent>();
        public static ActionResult Fail(string reason) { return new ActionResult { message = reason }; }
    }
}
