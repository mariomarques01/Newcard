using NUnit.Framework;
using ReinosDoDestino.Core;
using UnityEngine;

namespace ReinosDoDestino.Tests
{
    public sealed class BattleEngineTests
    {
        BattleEngine Game(){return new BattleEngine(JsonUtility.FromJson<Catalog>(Resources.Load<TextAsset>("Elemental/catalog").text),7);}
        [Test] public void OpeningIsElementalAndHasFourCards(){var g=Game();Assert.AreEqual(4,g.State.hand.Count);Assert.AreEqual(30,g.State.deck.Count);Assert.AreEqual(7,g.Catalog.spells.Length);Assert.AreEqual(3,g.State.players.Count);}
        [TestCase("elemental_fire",4)] [TestCase("elemental_eruption",4)] [TestCase("elemental_tornado",4)] [TestCase("elemental_air",6)]
        public void DirectSpellsIgnoreShield(string id,int damage){var g=Game();var target=g.State.rivals[2];target.shield=20;int hp=target.hp;var source=g.State.players[0];g.ResolveForVerification(source.id,source.id,target.id,g.Spell(id).ability);Assert.AreEqual(hp-damage,target.hp);Assert.AreEqual(20,target.shield);}
        [Test] public void NoDoubleAttack(){var g=Game();Assert.IsTrue(g.Attack().success);Assert.IsFalse(g.Attack().success);}
        [Test] public void TornadoExpiresAfterRivalTurn(){var g=Game();var source=g.State.players[0];var target=g.State.rivals[2];g.ResolveForVerification(source.id,source.id,target.id,g.Spell("elemental_tornado").ability);Assert.IsTrue(target.stunned);g.EndTurn();Assert.IsFalse(target.stunned);Assert.AreEqual(2,g.State.round);}
        [Test] public void NativeSaveRoundTrip(){var g=Game();g.Attack();var saved=JsonUtility.FromJson<BattleState>(JsonUtility.ToJson(g.State));Assert.IsTrue(g.Restore(saved));Assert.AreEqual(4,g.State.hand.Count);}
    }
}
