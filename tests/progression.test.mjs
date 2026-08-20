import test from "node:test";
import assert from "node:assert/strict";
import { deserializeWorld, serializeWorld } from "../dist/index.js";
import { createSmallSeedWorld } from "../dist/web/seedWorld.js";

const stableOptions = {
  playerCareerOptions: () => [],
  managerCareerOptions: () => [],
  injuryChance: () => 0,
};

function completedSeasonGames(world, seasonId) {
  return [...world.games.values()].filter((game) => game.seasonId === seasonId && game.status === "COMPLETED");
}

function scheduledPastGames(world) {
  const today = world.clock.now();
  return [...world.games.values()].filter((game) => game.scheduledDate < today && game.status === "SCHEDULED");
}

function assertProgressionStable(world, seasonId) {
  assert.deepEqual(world.validateInvariants(), []);
  assert.deepEqual(scheduledPastGames(world).map((game) => game.id), []);
  const completed = completedSeasonGames(world, seasonId);
  assert.equal(new Set(completed.map((game) => game.id)).size, completed.length);
  assert.equal(world.accumulatedGameIds.size, completed.length);
  const standingsGames = world.getStandings(seasonId).reduce((sum, row) => sum + row.gamesPlayed, 0);
  assert.equal(standingsGames, completed.length * 2);
}

function driveRegularSeason(world, bundle, options = {}) {
  const season = world.seasons.get(bundle.seasonId);
  assert.ok(season);
  let guard = 0;
  while (world.clock.now() <= season.regularSeasonEndDate) {
    const before = world.clock.now();
    const result = world.advancePlayableDays(1, { ...stableOptions, ...options });
    assert.equal(result.stoppedForUserGame, false, result.message);
    assert.equal(result.daysAdvanced, 1, result.message);
    assert.ok(world.clock.now() > before);
    guard += 1;
    assert.ok(guard < 250, "regular season progression guard tripped");
  }
  assertProgressionStable(world, bundle.seasonId);
}

test("playable date pipeline blocks an unfinished user-team game and ignores postponed games", () => {
  const bundle = createSmallSeedWorld(6101);
  const pending = bundle.world.getPendingGamesForCurrentDate({ userManagerId: bundle.userManagerId });
  assert.equal(pending.some((game) => game.control === "USER_GAME"), true);

  const blocked = bundle.world.advancePlayableDays(7, { ...stableOptions, userManagerId: bundle.userManagerId });
  assert.equal(blocked.daysAdvanced, 0);
  assert.equal(blocked.stoppedForUserGame, true);
  assert.match(blocked.message, /직접 진행해야 할 경기/);
  assert.equal(bundle.world.clock.now(), "2027-04-03");

  const userGame = bundle.world.games.get(pending.find((game) => game.control === "USER_GAME").gameId);
  userGame.status = "POSTPONED";
  const unblocked = bundle.world.advancePlayableDays(1, { ...stableOptions, userManagerId: bundle.userManagerId });
  assert.equal(unblocked.daysAdvanced, 1);
  assert.equal(bundle.world.clock.now(), "2027-04-04");
  assertProgressionStable(bundle.world, bundle.seasonId);
});

test("unemployed manager can long-run the regular season with every game handled by AI", () => {
  const bundle = createSmallSeedWorld(6201, { startMode: "UNEMPLOYED" });
  driveRegularSeason(bundle.world, bundle, { userManagerId: bundle.userManagerId });
  assert.equal(bundle.world.managers.get(bundle.userManagerId).status, "UNEMPLOYED");
});

test("club manager can continue the season by explicitly auto-completing user games", () => {
  const bundle = createSmallSeedWorld(6301);
  driveRegularSeason(bundle.world, bundle, { userManagerId: bundle.userManagerId, autoPlayUserGames: true });
  assert.equal(bundle.world.getUserControlledTeamId(bundle.userManagerId), bundle.userTeamId);
});

test("manager move and firing immediately change which games block date progression", () => {
  const bundle = createSmallSeedWorld(6401);
  const blocked = bundle.world.advancePlayableDays(1, { ...stableOptions, userManagerId: bundle.userManagerId });
  assert.equal(blocked.stoppedForUserGame, true);

  const offer = bundle.world.managerContractOffers.get("manager_offer_osaka_2027");
  assert.ok(offer);
  bundle.world.acceptManagerOffer(offer.id);
  assert.equal(bundle.world.getUserControlledTeamId(bundle.userManagerId), "team_osaka");
  const afterMove = bundle.world.advancePlayableDays(1, { ...stableOptions, userManagerId: bundle.userManagerId });
  assert.equal(afterMove.stoppedForUserGame, false);
  assert.equal(afterMove.daysAdvanced, 1);

  bundle.world.fireManager(bundle.userManagerId, "진행 테스트 경질");
  assert.equal(bundle.world.getUserControlledTeamId(bundle.userManagerId), undefined);
  const afterFiring = bundle.world.advancePlayableDays(7, { ...stableOptions, userManagerId: bundle.userManagerId });
  assert.equal(afterFiring.stoppedForUserGame, false);
  assert.equal(afterFiring.daysAdvanced, 7);
  assertProgressionStable(bundle.world, bundle.seasonId);
});

test("saved world restores current-day progression state and can finish the season", () => {
  const bundle = createSmallSeedWorld(6501);
  const early = bundle.world.advancePlayableDays(3, {
    ...stableOptions,
    userManagerId: bundle.userManagerId,
    autoPlayUserGames: true,
  });
  assert.equal(early.daysAdvanced, 3);
  const restored = deserializeWorld(serializeWorld(bundle.world));
  assert.equal(restored.clock.now(), bundle.world.clock.now());
  assert.deepEqual(restored.getStandings(bundle.seasonId), bundle.world.getStandings(bundle.seasonId));
  driveRegularSeason(restored, bundle, { userManagerId: bundle.userManagerId, autoPlayUserGames: true });
});
