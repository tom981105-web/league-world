import test from "node:test";
import assert from "node:assert/strict";
import { LeagueWorld, Mulberry32Random, WorldClock } from "../dist/index.js";

function createWorld() {
  const world = new LeagueWorld(
    new WorldClock("2027-01-01"),
    new Mulberry32Random(2027),
  );
  world.addCountry({ id: "country_kr", code: "KR", name: "Korea Republic" });
  world.addLeague({
    id: "league_kr1",
    countryId: "country_kr",
    name: "Korea Premier Baseball",
    level: 1,
    category: "PROFESSIONAL",
  });
  world.addTeam({ id: "team_seoul", leagueId: "league_kr1", name: "Seoul Falcons", teamType: "CLUB" });
  world.addTeam({ id: "team_busan", leagueId: "league_kr1", name: "Busan Mariners", teamType: "CLUB" });
  return world;
}

test("countries and leagues are owned by the world before teams are added", () => {
  const world = createWorld();

  assert.equal(world.countries.get("country_kr")?.code, "KR");
  assert.equal(world.leagues.get("league_kr1")?.countryId, "country_kr");
  assert.throws(
    () => world.addTeam({ id: "team_orphan", leagueId: "missing", name: "No League Club", teamType: "CLUB" }),
    /League not found/,
  );
});

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
  world.clock.advanceDays(10);
  world.hireManager("mgr_1", "team_busan", "타 구단 감독직 제안 수락");

  const manager = world.managers.get("mgr_1");
  assert.equal(manager?.currentTeamId, "team_busan");
  assert.equal(manager?.careerEntries.length, 2);
  assert.deepEqual(
    manager?.careerEntries.map((entry) => ({
      teamId: entry.teamId,
      startDate: entry.startDate,
      endDate: entry.endDate,
      reason: entry.reason,
    })),
    [
      {
        teamId: "team_seoul",
        startDate: "2027-01-01",
        endDate: "2027-01-11",
        reason: "첫 프로 감독 계약; ended: 타 구단 감독직 제안 수락",
      },
      {
        teamId: "team_busan",
        startDate: "2027-01-11",
        endDate: undefined,
        reason: "타 구단 감독직 제안 수락",
      },
    ],
  );
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

  const player = world.players.get("player_1");
  assert.equal(player?.status, "RETIRED");
  assert.deepEqual(player?.careerEntries, [
    {
      id: "career_1",
      personId: "player_1",
      personType: "PLAYER",
      organizationNameSnapshot: "Retired",
      role: "SS",
      status: "RETIRED",
      startDate: "2027-01-01",
      reason: "중학교 재학 중 선수 생활 중단",
    },
  ]);
  assert.equal(world.events.at(-1)?.type, "PLAYER_RETIRED");
});

test("player movement, release, and retirement write career entries with events", () => {
  const world = createWorld();
  world.addPlayer({
    id: "player_2",
    name: "박하준",
    birthDate: "2005-07-21",
    nationalityCode: "KR",
    primaryPosition: "RHP",
    status: "AMATEUR",
    currentAbility: 45,
    potentialAbility: 71,
  });

  world.movePlayer("player_2", "team_seoul", "육성 선수 계약");
  world.clock.advanceDays(30);
  world.releasePlayer("player_2", "로스터 정리");
  world.clock.advanceDays(3);
  world.retirePlayer("player_2", "독립리그 제안을 거절하고 은퇴");

  const player = world.players.get("player_2");
  assert.equal(player?.currentTeamId, undefined);
  assert.equal(player?.status, "RETIRED");
  assert.deepEqual(
    player?.careerEntries.map((entry) => ({
      teamId: entry.teamId,
      organizationNameSnapshot: entry.organizationNameSnapshot,
      status: entry.status,
      startDate: entry.startDate,
      endDate: entry.endDate,
    })),
    [
      {
        teamId: "team_seoul",
        organizationNameSnapshot: "Seoul Falcons",
        status: "PROFESSIONAL",
        startDate: "2027-01-01",
        endDate: "2027-01-31",
      },
      {
        teamId: undefined,
        organizationNameSnapshot: "Free Agent",
        status: "FREE_AGENT",
        startDate: "2027-01-31",
        endDate: "2027-02-03",
      },
      {
        teamId: undefined,
        organizationNameSnapshot: "Retired",
        status: "RETIRED",
        startDate: "2027-02-03",
        endDate: undefined,
      },
    ],
  );
  assert.deepEqual(
    world.events.map((event) => event.type),
    ["PLAYER_CREATED", "PLAYER_MOVED", "PLAYER_RELEASED", "PLAYER_RETIRED"],
  );
});

test("manager firing writes unemployment history and event", () => {
  const world = createWorld();
  world.addManager({
    id: "mgr_2",
    name: "이서진",
    birthDate: "1987-02-12",
    nationalityCode: "KR",
    status: "UNEMPLOYED",
    reputation: 34,
  });

  world.hireManager("mgr_2", "team_seoul", "리빌딩 프로젝트 계약");
  world.clock.advanceDays(90);
  world.fireManager("mgr_2", "프런트 방향성 차이");

  const manager = world.managers.get("mgr_2");
  assert.equal(manager?.status, "UNEMPLOYED");
  assert.equal(manager?.currentTeamId, undefined);
  assert.equal(manager?.careerEntries.at(-1)?.organizationNameSnapshot, "Unemployed");
  assert.equal(world.events.at(-1)?.type, "MANAGER_FIRED");
});

test("same seed and same command order produce identical world history", () => {
  function runScenario() {
    const world = createWorld();
    world.addPlayer({
      id: "player_seeded",
      name: "윤태오",
      birthDate: "2008-09-17",
      nationalityCode: "KR",
      primaryPosition: "CF",
      status: "AMATEUR",
      currentAbility: 39,
      potentialAbility: 69,
    });
    world.addManager({
      id: "mgr_seeded",
      name: "한민재",
      birthDate: "1982-03-08",
      nationalityCode: "KR",
      status: "UNEMPLOYED",
      reputation: 42,
    });

    if (world.rng.chance(0.7)) {
      world.movePlayer("player_seeded", "team_seoul", "스카우트 추천 계약");
    } else {
      world.retirePlayer("player_seeded", "프로 제안 부재");
    }

    world.clock.advanceDays(world.rng.int(1, 20));
    world.hireManager("mgr_seeded", "team_busan", "시즌 전 감독 선임");

    return {
      players: [...world.players.values()],
      managers: [...world.managers.values()],
      events: world.events,
    };
  }

  assert.deepEqual(runScenario(), runScenario());
});
