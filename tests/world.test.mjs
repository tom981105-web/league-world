import test from "node:test";
import assert from "node:assert/strict";
import { LeagueWorld, Mulberry32Random, WorldClock } from "../dist/index.js";

function createWorld() {
  const world = new LeagueWorld(
    new WorldClock("2027-01-01"),
    new Mulberry32Random(2027),
  );
  world.addTeam({ id: "team_seoul", leagueId: "league_kr1", name: "Seoul Falcons", teamType: "CLUB" });
  world.addTeam({ id: "team_busan", leagueId: "league_kr1", name: "Busan Mariners", teamType: "CLUB" });
  return world;
}

test("manager moves are kept as history", () => {
  const world = createWorld();
  world.addManager({
    id: "mgr_1",
    name: "조계원",
    birthDate: "1998-11-05",
    nationalityCode: "KR",
    status: "UNEMPLOYED",
    reputation: 10,
  });

  world.hireManager("mgr_1", "team_seoul", "첫 프로 감독 계약");
  world.hireManager("mgr_1", "team_busan", "타 구단 감독직 제안 수락");

  assert.equal(world.managers.get("mgr_1")?.currentTeamId, "team_busan");
  assert.ok(world.events.some((event) => event.type === "MANAGER_MOVED"));
});

test("a player may retire without completing a fixed career ladder", () => {
  const world = createWorld();
  world.addPlayer({
    id: "player_1",
    name: "김도윤",
    birthDate: "2012-04-10",
    nationalityCode: "KR",
    primaryPosition: "SS",
    status: "STUDENT",
    currentAbility: 28,
    potentialAbility: 63,
  });

  world.retirePlayer("player_1", "중학교 재학 중 선수 생활 중단");

  assert.equal(world.players.get("player_1")?.status, "RETIRED");
  assert.equal(world.events.at(-1)?.type, "PLAYER_RETIRED");
});
