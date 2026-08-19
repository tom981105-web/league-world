import assert from "node:assert/strict";
import test from "node:test";
import { performance } from "node:perf_hooks";
import { createStandardSeedWorld, seedOrganizations } from "../dist/web/seedWorld.js";
import { generatePersonName, supportedNameCountries } from "../dist/web/nameGenerator.js";

test("standard web seed world has complete Korean professional ecosystem data", () => {
  const startedAt = performance.now();
  const first = createStandardSeedWorld(20270403);
  const elapsedMs = performance.now() - startedAt;
  const second = createStandardSeedWorld(20270403);
  const world = first.world;

  const topTeams = [...world.teams.values()].filter((team) => team.leagueId === "league_kr1" && team.isTopLevel);
  const futuresTeams = [...world.teams.values()].filter((team) => team.leagueId === "league_kr_futures");
  const proPlayers = [...world.players.values()].filter((player) => player.status === "PROFESSIONAL");
  const freeAgents = [...world.players.values()].filter((player) => player.status === "FREE_AGENT");
  const middleSchool = stagePlayers(world, "중학교 선수");
  const highSchool = stagePlayers(world, "고등학교 선수");
  const college = stagePlayers(world, "대학 선수");
  const independent = stagePlayers(world, "독립/기타 선수");
  const ids = [...world.players.keys()];

  assert.doesNotThrow(() => world.assertInvariants());
  assert.equal(seedOrganizations.length, 10);
  assert.equal(topTeams.length, 10);
  assert.equal(futuresTeams.length, 10);
  assert.ok(proPlayers.length >= 550 && proPlayers.length <= 650, `professional players: ${proPlayers.length}`);
  assert.equal(middleSchool.length, 50);
  assert.equal(highSchool.length, 90);
  assert.equal(college.length, 70);
  assert.equal(independent.length, 40);
  assert.ok(freeAgents.length >= 30 && freeAgents.length <= 50, `free agents: ${freeAgents.length}`);
  assert.ok(world.players.size >= 850 && world.players.size <= 1000, `total players: ${world.players.size}`);
  assert.ok(world.managers.size >= 10);
  assert.ok(world.scouts.size >= 30);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok([...world.players.values()].every((player) => player.name.trim().length > 0));

  for (const org of seedOrganizations) {
    const teams = [...world.teams.values()].filter((team) => team.organizationId === org.id);
    assert.equal(teams.filter((team) => team.isTopLevel).length, 1);
    assert.equal(teams.filter((team) => !team.isTopLevel).length, 1);
    assert.ok([...world.managers.values()].some((manager) => manager.currentOrganizationId === org.id && manager.status === "EMPLOYED"));
    assert.ok([...world.scouts.values()].filter((scout) => scout.organizationId === org.id).length >= 2);
    const orgPlayers = proPlayers.filter((player) => player.currentOrganizationId === org.id);
    assert.ok(orgPlayers.length >= 55 && orgPlayers.length <= 65, `${org.id}: ${orgPlayers.length}`);
    for (const position of ["P", "C", "1B", "2B", "3B", "SS", "LF", "CF", "RF"]) {
      assert.ok(orgPlayers.some((player) => player.primaryPosition === position), `${org.id} missing ${position}`);
    }
  }

  assert.ok(proPlayers.some((player) => player.nationalityCode !== "KR"));
  assert.ok(freeAgents.some((player) => player.nationalityCode !== "KR"));
  assert.equal([...supportedNameCountries].sort().join(","), "AU,CA,DO,JP,KR,MX,TW,US,VE");
  assert.equal(generatePersonName("KR", 1, "scope", 1).name.includes(" "), false);
  assert.equal(generatePersonName("US", 1, "scope", 1).name.includes(" "), true);
  assert.deepEqual(
    [...first.world.players.values()].slice(0, 40).map((player) => `${player.name}:${player.nationalityCode}`),
    [...second.world.players.values()].slice(0, 40).map((player) => `${player.name}:${player.nationalityCode}`),
  );
  assert.ok(elapsedMs < 5000, `standard seed took ${elapsedMs.toFixed(1)}ms`);
});

function stagePlayers(world, reason) {
  return [...world.players.values()].filter((player) => player.careerEntries.some((entry) => entry.reason === reason));
}
