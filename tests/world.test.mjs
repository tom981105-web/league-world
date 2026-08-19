import test from "node:test";
import assert from "node:assert/strict";
import { LeagueWorld, Mulberry32Random, WorldClock } from "../dist/index.js";

function createWorld(seed = 2027) {
  const world = new LeagueWorld(
    new WorldClock("2027-01-01"),
    new Mulberry32Random(seed),
  );
  world.addCountry({ id: "country_kr", code: "KR", name: "Korea Republic" });
  world.addCountry({ id: "country_pw", code: "PW", name: "Pacific West" });
  world.addLeague({
    id: "league_kr1",
    countryId: "country_kr",
    name: "Korea Premier Baseball",
    level: 1,
    category: "PROFESSIONAL",
  });
  world.addLeague({
    id: "league_kr_futures",
    countryId: "country_kr",
    name: "Korea Futures Baseball",
    level: 2,
    category: "PROFESSIONAL",
  });
  world.addLeague({
    id: "league_kr_amateur",
    countryId: "country_kr",
    name: "Korea Amateur Baseball",
    level: 3,
    category: "AMATEUR",
  });
  world.addLeague({
    id: "league_kr_independent",
    countryId: "country_kr",
    name: "Korea Independent Baseball",
    level: 3,
    category: "INDEPENDENT",
  });
  world.addLeague({
    id: "league_pw1",
    countryId: "country_pw",
    name: "Pacific World Baseball",
    level: 1,
    category: "INTERNATIONAL",
  });
  world.addTeam({ id: "team_seoul", leagueId: "league_kr1", name: "Seoul Falcons", teamType: "CLUB" });
  world.addTeam({ id: "team_busan", leagueId: "league_kr1", name: "Busan Mariners", teamType: "CLUB" });
  world.addTeam({
    id: "team_seoul_futures",
    leagueId: "league_kr_futures",
    name: "Seoul Falcons Futures",
    teamType: "CLUB",
    parentTeamId: "team_seoul",
  });
  world.addTeam({ id: "team_river_high", leagueId: "league_kr_amateur", name: "River High", teamType: "SCHOOL" });
  world.addTeam({ id: "team_hanseong_univ", leagueId: "league_kr_amateur", name: "Hanseong University", teamType: "SCHOOL" });
  world.addTeam({ id: "team_steel_indie", leagueId: "league_kr_independent", name: "Steel Independents", teamType: "CLUB" });
  world.addTeam({ id: "team_harbor_abroad", leagueId: "league_pw1", name: "Harbor Voyagers", teamType: "CLUB" });
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
  world.advanceDays(10, { playerCareerOptions: () => [], managerCareerOptions: () => [] });
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
  world.advanceDays(30, { playerCareerOptions: () => [], managerCareerOptions: () => [] });
  world.releasePlayer("player_2", "로스터 정리");
  world.advanceDays(3, { playerCareerOptions: () => [], managerCareerOptions: () => [] });
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
  world.advanceDays(90, { playerCareerOptions: () => [], managerCareerOptions: () => [] });
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

    world.advanceDays(world.rng.int(1, 20), {
      playerCareerOptions: () => [],
      managerCareerOptions: () => [],
    });
    world.hireManager("mgr_seeded", "team_busan", "시즌 전 감독 선임");

    return {
      players: [...world.players.values()],
      managers: [...world.managers.values()],
      events: world.events,
    };
  }

  assert.deepEqual(runScenario(), runScenario());
});

test("advanceDay is the official path for one-day world time progression", () => {
  const world = createWorld();
  world.addPlayer({
    id: "player_student",
    name: "최민우",
    birthDate: "2014-06-01",
    nationalityCode: "KR",
    primaryPosition: "2B",
    status: "STUDENT",
    currentAbility: 18,
    potentialAbility: 44,
  });

  const date = world.advanceDay({
    playerCareerOptions: () => [
      { nextStatus: "RETIRED", weight: 1, reason: "중학생 선수 생활 중단" },
    ],
    managerCareerOptions: () => [],
  });

  const player = world.players.get("player_student");
  assert.equal(date, "2027-01-02");
  assert.equal(world.clock.now(), "2027-01-02");
  assert.equal(player?.status, "RETIRED");
  assert.equal(player?.careerEntries.at(-1)?.startDate, "2027-01-02");
  assert.equal(world.events.at(-1)?.date, "2027-01-02");
  assert.equal(world.events.at(-1)?.type, "PLAYER_RETIRED");
});

test("advanceDays can progress several days without autonomous changes when providers return no options", () => {
  const world = createWorld();

  assert.equal(
    world.advanceDays(7, { playerCareerOptions: () => [], managerCareerOptions: () => [] }),
    "2027-01-08",
  );
  assert.equal(world.events.length, 0);
});

test("chooseCareerOption is applied through LeagueWorld for non-linear player paths", () => {
  const studentToRetirement = createWorld();
  studentToRetirement.addPlayer({
    id: "same_start",
    name: "문지후",
    birthDate: "2014-01-15",
    nationalityCode: "KR",
    primaryPosition: "C",
    status: "STUDENT",
    currentAbility: 12,
    potentialAbility: 31,
  });
  studentToRetirement.advanceDay({
    playerCareerOptions: () => [
      { nextStatus: "RETIRED", weight: 1, reason: "야구 중단 선택" },
    ],
    managerCareerOptions: () => [],
  });

  const studentToAmateur = createWorld();
  studentToAmateur.addPlayer({
    id: "same_start",
    name: "문지후",
    birthDate: "2014-01-15",
    nationalityCode: "KR",
    primaryPosition: "C",
    status: "STUDENT",
    currentAbility: 12,
    potentialAbility: 31,
  });
  studentToAmateur.advanceDay({
    playerCareerOptions: () => [
      {
        nextStatus: "AMATEUR",
        toTeamId: "team_river_high",
        weight: 1,
        reason: "고교 진학",
      },
    ],
    managerCareerOptions: () => [],
  });

  assert.equal(studentToRetirement.players.get("same_start")?.status, "RETIRED");
  assert.equal(studentToRetirement.players.get("same_start")?.currentTeamId, undefined);
  assert.equal(studentToAmateur.players.get("same_start")?.status, "AMATEUR");
  assert.equal(studentToAmateur.players.get("same_start")?.currentTeamId, "team_river_high");
});

test("professional player can be promoted from futures team through daily career options", () => {
  const world = createWorld();
  world.addPlayer({
    id: "player_futures",
    name: "장태린",
    birthDate: "2004-12-03",
    nationalityCode: "KR",
    primaryPosition: "LF",
    status: "PROFESSIONAL",
    currentAbility: 51,
    potentialAbility: 77,
    currentTeamId: "team_seoul_futures",
  });

  world.advanceDay({
    playerCareerOptions: () => [
      {
        nextStatus: "PROFESSIONAL",
        toTeamId: "team_seoul",
        weight: 1,
        reason: "1군 콜업",
      },
    ],
    managerCareerOptions: () => [],
  });

  const player = world.players.get("player_futures");
  assert.equal(player?.currentTeamId, "team_seoul");
  assert.equal(player?.careerEntries.at(-2)?.endDate, "2027-01-02");
  assert.equal(player?.careerEntries.at(-1)?.organizationNameSnapshot, "Seoul Falcons");
  assert.equal(world.events.at(-1)?.type, "PLAYER_PROMOTED");
});

test("released player can move to independent league or retire without a fixed ladder", () => {
  const independentPath = createWorld();
  independentPath.addPlayer({
    id: "released_player",
    name: "오선재",
    birthDate: "2001-05-19",
    nationalityCode: "KR",
    primaryPosition: "1B",
    status: "FREE_AGENT",
    currentAbility: 43,
    potentialAbility: 55,
  });
  independentPath.advanceDay({
    playerCareerOptions: () => [
      {
        nextStatus: "INDEPENDENT",
        toTeamId: "team_steel_indie",
        weight: 1,
        reason: "독립리그 재도전",
      },
    ],
    managerCareerOptions: () => [],
  });

  const retirementPath = createWorld();
  retirementPath.addPlayer({
    id: "released_player",
    name: "오선재",
    birthDate: "2001-05-19",
    nationalityCode: "KR",
    primaryPosition: "1B",
    status: "FREE_AGENT",
    currentAbility: 43,
    potentialAbility: 55,
  });
  retirementPath.advanceDay({
    playerCareerOptions: () => [
      { nextStatus: "RETIRED", weight: 1, reason: "새 소속을 찾지 못해 은퇴" },
    ],
    managerCareerOptions: () => [],
  });

  assert.equal(independentPath.players.get("released_player")?.status, "INDEPENDENT");
  assert.equal(independentPath.players.get("released_player")?.currentTeamId, "team_steel_indie");
  assert.equal(retirementPath.players.get("released_player")?.status, "RETIRED");
  assert.equal(retirementPath.players.get("released_player")?.currentTeamId, undefined);
});

test("manager career can change during world time progression", () => {
  const world = createWorld();
  world.addManager({
    id: "mgr_daily",
    name: "서태겸",
    birthDate: "1979-10-22",
    nationalityCode: "KR",
    status: "UNEMPLOYED",
    reputation: 48,
  });

  world.advanceDay({
    playerCareerOptions: () => [],
    managerCareerOptions: () => [
      {
        nextStatus: "EMPLOYED",
        toTeamId: "team_busan",
        weight: 1,
        reason: "시즌 중 감독 제안 수락",
      },
    ],
  });

  const manager = world.managers.get("mgr_daily");
  assert.equal(manager?.status, "EMPLOYED");
  assert.equal(manager?.currentTeamId, "team_busan");
  assert.equal(manager?.careerEntries.at(-1)?.startDate, "2027-01-02");
  assert.equal(world.events.at(-1)?.type, "MANAGER_HIRED");
});

test("daily career decisions are deterministic with the same seed", () => {
  function run(seed) {
    const world = createWorld(seed);
    world.addPlayer({
      id: "player_branch",
      name: "강이준",
      birthDate: "2009-08-09",
      nationalityCode: "KR",
      primaryPosition: "RF",
      status: "AMATEUR",
      currentAbility: 38,
      potentialAbility: 81,
    });
    world.addManager({
      id: "mgr_branch",
      name: "노해준",
      birthDate: "1980-07-03",
      nationalityCode: "KR",
      status: "UNEMPLOYED",
      reputation: 39,
    });

    world.advanceDays(3, {
      playerCareerOptions: () => [
        { nextStatus: "AMATEUR", weight: 4, reason: "아마추어 잔류" },
        {
          nextStatus: "PROFESSIONAL",
          toTeamId: "team_seoul",
          weight: 3,
          reason: "국내 프로 계약",
        },
        {
          nextStatus: "PROFESSIONAL",
          toTeamId: "team_harbor_abroad",
          weight: 2,
          reason: "해외 구단 계약",
        },
        { nextStatus: "RETIRED", weight: 1, reason: "진로 변경으로 은퇴" },
      ],
      managerCareerOptions: () => [
        { nextStatus: "UNEMPLOYED", weight: 3, reason: "감독 시장 대기" },
        {
          nextStatus: "EMPLOYED",
          toTeamId: "team_busan",
          weight: 1,
          reason: "감독직 제안 수락",
        },
      ],
    });

    return {
      players: [...world.players.values()],
      managers: [...world.managers.values()],
      events: world.events,
      date: world.clock.now(),
    };
  }

  assert.deepEqual(run(1123), run(1123));
});

test("invariant validation catches contradictions between current state and career history", () => {
  const world = createWorld();
  world.addPlayer({
    id: "player_invariant",
    name: "백도현",
    birthDate: "2000-03-11",
    nationalityCode: "KR",
    primaryPosition: "3B",
    status: "AMATEUR",
    currentAbility: 36,
    potentialAbility: 50,
  });
  world.retirePlayer("player_invariant", "현역 생활 종료");

  const player = world.players.get("player_invariant");
  player.currentTeamId = "team_seoul";

  assert.throws(() => world.assertInvariants(), /World invariant violation/);
  assert.ok(world.validateInvariants().some((issue) => issue.includes("RETIRED")));
});
