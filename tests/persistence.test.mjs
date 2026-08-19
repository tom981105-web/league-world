import test from "node:test";
import assert from "node:assert/strict";
import { deserializeWorld, serializeWorld } from "../dist/index.js";
import { createSmallSeedWorld } from "../dist/web/seedWorld.js";

function firstScheduledGame(world) {
  const game = [...world.games.values()].find((item) => item.status === "SCHEDULED");
  assert.ok(game);
  return game;
}

function prepareGame(world, game) {
  for (const teamId of [game.homeTeamId, game.awayTeamId]) {
    if (![...world.gameRosters.values()].some((roster) => roster.gameId === game.id && roster.teamId === teamId)) {
      world.autoGenerateLineup({ gameId: game.id, teamId });
    }
  }
}

function snapshotCore(world, bundle) {
  const manager = world.managers.get(bundle.userManagerId);
  const player = [...world.players.values()].find((item) => item.currentOrganizationId);
  const standings = world.getStandings(bundle.seasonId);
  return {
    date: world.clock.now(),
    managerOrg: manager?.currentOrganizationId,
    managerTeam: manager?.currentTeamId,
    managerContracts: manager?.contracts,
    playerOrg: player?.currentOrganizationId,
    playerTeam: player?.currentTeamId,
    standings,
    events: world.events.map((event) => event.type),
  };
}

test("new world serializes and deserializes with invariants intact", () => {
  const bundle = createSmallSeedWorld(77);
  const restored = deserializeWorld(serializeWorld(bundle.world));
  assert.deepEqual(restored.validateInvariants(), []);
  assert.deepEqual(snapshotCore(restored, bundle), snapshotCore(bundle.world, bundle));
});

test("completed game, standings, season stats, career entries, and events survive restore", () => {
  const bundle = createSmallSeedWorld(88);
  const game = firstScheduledGame(bundle.world);
  prepareGame(bundle.world, game);
  const completed = bundle.world.simulateGame(game.id);
  const batterId = Object.keys(completed.boxScore.batters)[0];
  const beforeStats = bundle.world.getPlayerBattingSeasonStats(batterId, bundle.seasonId);
  const beforeStandings = bundle.world.getStandings(bundle.seasonId);
  const restored = deserializeWorld(serializeWorld(bundle.world));
  assert.deepEqual(restored.games.get(game.id).result, bundle.world.games.get(game.id).result);
  assert.deepEqual(restored.getStandings(bundle.seasonId), beforeStandings);
  assert.deepEqual(restored.getPlayerBattingSeasonStats(batterId, bundle.seasonId), beforeStats);
  assert.equal(restored.events.length, bundle.world.events.length);
  assert.deepEqual(restored.managers.get(bundle.userManagerId).careerEntries, bundle.world.managers.get(bundle.userManagerId).careerEntries);
});

test("manager move and trade state survive restore", () => {
  const bundle = createSmallSeedWorld(99);
  const offer = bundle.world.managerContractOffers.get("manager_offer_osaka_2027");
  bundle.world.acceptManagerOffer(offer.id);
  const userPlayer = [...bundle.world.players.values()].find((player) => player.currentOrganizationId === "org_seoul" && player.primaryPosition !== "P");
  const targetPlayer = [...bundle.world.players.values()].find((player) => player.currentOrganizationId === "org_busan" && player.primaryPosition !== "P");
  const trade = bundle.world.proposeTrade({
    proposerOrganizationId: "org_seoul",
    targetOrganizationId: "org_busan",
    playersFromProposer: [userPlayer.id],
    playersFromTarget: [targetPlayer.id],
    cash: 2_000_000,
  });
  bundle.world.finalizeTrade(trade.id);
  const restored = deserializeWorld(serializeWorld(bundle.world));
  assert.equal(restored.managers.get(bundle.userManagerId).currentOrganizationId, "org_osaka");
  assert.equal(restored.players.get(userPlayer.id).currentOrganizationId, "org_busan");
  assert.equal(restored.players.get(targetPlayer.id).currentOrganizationId, "org_seoul");
  assert.equal(restored.tradeProposals.get(trade.id).status, "COMPLETED");
});

test("in-progress live game survives restore", () => {
  const bundle = createSmallSeedWorld(101);
  const game = firstScheduledGame(bundle.world);
  prepareGame(bundle.world, game);
  bundle.world.startGame(game.id);
  bundle.world.simulateNextPlateAppearance(game.id);
  const restored = deserializeWorld(serializeWorld(bundle.world));
  assert.deepEqual(restored.liveGames.get(game.id), bundle.world.liveGames.get(game.id));
  assert.equal(restored.games.get(game.id).status, "SCHEDULED");
});

test("restored RNG state reproduces future simulation", () => {
  const original = createSmallSeedWorld(123);
  const restored = createSmallSeedWorld(123);
  const save = serializeWorld(original.world);
  const loaded = deserializeWorld(save);
  const gameA = firstScheduledGame(original.world);
  const gameB = loaded.games.get(gameA.id);
  prepareGame(original.world, gameA);
  prepareGame(loaded, gameB);
  const resultA = original.world.simulateGame(gameA.id);
  const resultB = loaded.simulateGame(gameB.id);
  assert.deepEqual(resultB.boxScore.teams, resultA.boxScore.teams);
  assert.deepEqual(resultB.playByPlay, resultA.playByPlay);
  void restored;
});

test("unsupported saveVersion and corrupted data are rejected without mutating caller world", () => {
  const bundle = createSmallSeedWorld(55);
  const save = serializeWorld(bundle.world);
  assert.throws(() => deserializeWorld({ ...save, saveVersion: 999 }), /지원하지 않는 저장 버전/);
  const broken = structuredClone(save);
  broken.players[0].currentTeamId = "missing_team";
  assert.throws(() => deserializeWorld(broken), /World invariant violation|저장 데이터/);
  assert.deepEqual(bundle.world.validateInvariants(), []);
});
