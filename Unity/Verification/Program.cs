using System;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Collections.Generic;
using ReinosDoDestino.Core;

[Serializable] public sealed class FixtureSet { public Fixture[] fixtures; }
[Serializable] public sealed class Fixture
{
    public string name, spellId, allyId, enemyId;
    public CreatureState[] alliesBefore, enemiesBefore, alliesAfter, enemiesAfter;
    public int killGlory;
}
public static class Program
{
    static int assertions;
    static readonly JsonSerializerOptions Json = new JsonSerializerOptions { IncludeFields = true, IgnoreReadOnlyProperties = true };
    static void Check(bool condition, string message) { assertions++; if (!condition) throw new Exception(message); }
    static T Clone<T>(T value) { return JsonSerializer.Deserialize<T>(JsonSerializer.Serialize(value, Json), Json); }
    public static void Main(string[] args)
    {
        var root = args.Length > 0 ? args[0] : "Unity";
        var catalog = JsonSerializer.Deserialize<Catalog>(File.ReadAllText(Path.Combine(root,"Assets/Resources/Elemental/catalog.json")), Json);
        var fixtures = JsonSerializer.Deserialize<FixtureSet>(File.ReadAllText(Path.Combine(root,"Verification/parity-fixtures.json")), Json);
        catalog.Validate();
        foreach (var f in fixtures.fixtures)
        {
            var engine = new BattleEngine(catalog);
            engine.State.players = f.alliesBefore.Select(Clone).ToList();
            engine.State.rivals = f.enemiesBefore.Select(Clone).ToList();
            var result = engine.ResolveForVerification(f.allyId,f.allyId,f.enemyId,engine.Spell(f.spellId).ability);
            Check(result.success, f.name+": falhou");
            Compare(engine.State.players,f.alliesAfter,f.name);
            Compare(engine.State.rivals,f.enemiesAfter,f.name);
            Check(engine.State.playerGlory == f.killGlory, f.name+": glória divergente");
            Console.WriteLine("PARIDADE: "+f.name);
        }
        var game = new BattleEngine(catalog, 7);
        Check(game.State.hand.Count == 4 && game.State.deck.Count == 30,"Abertura 4/30");
        Check(game.Attack().success,"Ataque inicial");
        Check(!game.Attack().success,"Não pode atacar duas vezes");
        Check(game.Defend().success && !game.Defend().success,"Uma defesa por rodada");
        var before = game.State.playerEnergy;
        Check(game.UsePower().success && game.State.playerEnergy == before-2,"Habilidade custa 2");
        Check(game.EndTurn().success && game.State.round == 2 && game.State.turn == Side.Player,"Turno rival completo");
        Check(game.State.playerEnergy == 5 && !game.State.players[1].hasAttacked,"Recarga e ações");
        var saved = Clone(game.State); Check(game.Restore(saved),"Save válido");
        saved.hand.Add(new SpellInstance { id="old",templateId="card_as_copas" });Check(!game.Restore(saved),"Save antigo rejeitado");
        var tornado = new BattleEngine(catalog);var target = tornado.State.rivals[2];
        tornado.ResolveForVerification(tornado.State.players[0].id,tornado.State.players[0].id,target.id,tornado.Spell("elemental_tornado").ability);
        Check(target.stunned,"Tornado bloqueia ataque"); tornado.EndTurn();Check(!target.stunned,"Tornado expira");
        var gryphon = new BattleEngine(catalog);gryphon.SelectAlly(gryphon.State.players[0].id);
        gryphon.UsePower();Check(gryphon.State.players[0].temporaryAttack == 1,"Bônus temporário do Grifo");gryphon.EndTurn();Check(gryphon.State.players[0].temporaryAttack == 0,"Bônus termina na próxima rodada");
        var dragon = new BattleEngine(catalog);var d = dragon.State.rivals[0];
        int[] hp = dragon.State.players.Select(c=>c.hp).ToArray();dragon.ResolveForVerification(d.id,d.id,dragon.State.players[0].id,dragon.Definition(d.id).power,Side.Rival);
        Check(hp[0]-dragon.State.players[0].hp==4 && hp[1]-dragon.State.players[1].hp==1,"Sopro com dano colateral");
        var golem = new BattleEngine(catalog);var g = golem.State.rivals[2];golem.ResolveForVerification(g.id,g.id,null,golem.Definition(g.id).power,Side.Rival);
        Check(g.shield==2 && golem.State.rivals[0].shield==1,"Golem protege aliado");
        var dry = new BattleEngine(catalog);dry.State.playerEnergy=0;var snapshot=JsonSerializer.Serialize(dry.State,Json);Check(!dry.Play(dry.State.hand[0].id).success && JsonSerializer.Serialize(dry.State,Json)==snapshot,"Jogada inválida não muta estado");
        var victory = new BattleEngine(catalog);victory.State.playerGlory=11;victory.SelectAlly(victory.State.players[0].id);victory.State.rivals[2].hp=1;victory.Attack();Check(victory.State.result==MatchResult.Victory,"Vitória detectada");Check(!victory.UsePower().success,"Sem ações após vitória");
        Console.WriteLine("PASS: "+assertions+" verificações C#; "+fixtures.fixtures.Length+" cenários de paridade TypeScript.");
    }
    static void Compare(List<CreatureState> actual,CreatureState[] expected,string scenario)
    {
        Check(actual.Count==expected.Length,scenario+": tamanho");
        for(int i=0;i<expected.Length;i++)
        {
            var a=actual[i];var e=expected[i];
            Check(a.id==e.id && a.hp==e.hp && a.maxHp==e.maxHp && a.attack==e.attack && a.defense==e.defense && a.shield==e.shield && a.temporaryAttack==e.temporaryAttack && a.attackReduction==e.attackReduction && a.defenseReduction==e.defenseReduction && a.stunned==e.stunned,scenario+": divergência em "+e.id);
        }
    }
}
