import assert from "node:assert/strict";
import test from "node:test";
import { createSeedWorld } from "../dist/web/seedWorld.js";

test("standard web seed world has expanded deterministic baseball data", () => {
  const first = createSeedWorld(20270403);
  const second = createSeedWorld(20270403);

  assert.equal(first.world.validateInvariants().length, 0);
  assert.equal(first.world.organizations.size, 8);
  assert.equal([...first.world.teams.values()].filter((team) => team.leagueId === "league_kr1").length, 6);
  assert.ok(first.world.players.size >= 350);
  assert.ok([...first.world.players.values()].filter((player) => player.status === "FREE_AGENT").length >= 18);
  assert.ok(first.world.getAvailableDraftPlayers(first.draftId).length >= 50);
  assert.deepEqual(
    [...first.world.players.values()].slice(0, 24).map((player) => player.name),
    [...second.world.players.values()].slice(0, 24).map((player) => player.name),
  );
  assert.deepEqual(
    [...first.world.games.values()].map((game) => `${game.scheduledDate}:${game.awayTeamId}:${game.homeTeamId}`),
    [...second.world.games.values()].map((game) => `${game.scheduledDate}:${game.awayTeamId}:${game.homeTeamId}`),
  );
});
