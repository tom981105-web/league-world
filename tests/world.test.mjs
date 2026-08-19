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
  world.addCountry({ id: "country_us", code: "US", name: "United States" });
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
  world.addLeague({ id: "league_us_mlb", countryId: "country_us", name: "Continental Major Baseball", level: 1, category: "PROFESSIONAL" });
  world.addLeague({ id: "league_us_aaa", countryId: "country_us", name: "Continental Triple A", level: 2, category: "PROFESSIONAL" });
  world.addLeague({ id: "league_us_aa", countryId: "country_us", name: "Continental Double A", level: 3, category: "PROFESSIONAL" });
  world.addLeague({ id: "league_us_high_a", countryId: "country_us", name: "Continental High A", level: 4, category: "PROFESSIONAL" });
  world.addLeague({ id: "league_us_a", countryId: "country_us", name: "Continental A", level: 5, category: "PROFESSIONAL" });
  world.addLeague({ id: "league_us_rookie", countryId: "country_us", name: "Continental Rookie", level: 6, category: "PROFESSIONAL" });
  world.addOrganization({ id: "org_seoul", name: "Seoul Falcons Organization", countryId: "country_kr" });
  world.addOrganization({ id: "org_busan", name: "Busan Mariners Organization", countryId: "country_kr" });
  world.addOrganization({ id: "org_harbor", name: "Harbor Voyagers Organization", countryId: "country_pw" });
  world.addOrganization({ id: "org_knights", name: "New York Knights Organization", countryId: "country_us" });
  world.addTeam({
    id: "team_seoul",
    leagueId: "league_kr1",
    organizationId: "org_seoul",
    name: "Seoul Falcons",
    teamType: "CLUB",
    rosterLevel: 1,
    rosterLevelName: "1군",
    isTopLevel: true,
  });
  world.addTeam({
    id: "team_busan",
    leagueId: "league_kr1",
    organizationId: "org_busan",
    name: "Busan Mariners",
    teamType: "CLUB",
    rosterLevel: 1,
    rosterLevelName: "1군",
    isTopLevel: true,
  });
  world.addTeam({
    id: "team_seoul_futures",
    leagueId: "league_kr_futures",
    organizationId: "org_seoul",
    name: "Seoul Falcons Futures",
    teamType: "CLUB",
    parentTeamId: "team_seoul",
    rosterLevel: 2,
    rosterLevelName: "Futures",
  });
  world.addTeam({ id: "team_river_high", leagueId: "league_kr_amateur", name: "River High", teamType: "SCHOOL" });
  world.addTeam({ id: "team_hanseong_univ", leagueId: "league_kr_amateur", name: "Hanseong University", teamType: "SCHOOL" });
  world.addTeam({ id: "team_steel_indie", leagueId: "league_kr_independent", name: "Steel Independents", teamType: "CLUB" });
  world.addTeam({
    id: "team_harbor_abroad",
    leagueId: "league_pw1",
    organizationId: "org_harbor",
    name: "Harbor Voyagers",
    teamType: "CLUB",
    rosterLevel: 1,
    rosterLevelName: "Top",
    isTopLevel: true,
  });
  world.addTeam({ id: "team_knights_mlb", leagueId: "league_us_mlb", organizationId: "org_knights", name: "New York Knights MLB", teamType: "CLUB", rosterLevel: 1, rosterLevelName: "MLB", isTopLevel: true });
  world.addTeam({ id: "team_knights_aaa", leagueId: "league_us_aaa", organizationId: "org_knights", name: "New York Knights AAA", teamType: "CLUB", parentTeamId: "team_knights_mlb", rosterLevel: 2, rosterLevelName: "AAA" });
  world.addTeam({ id: "team_knights_aa", leagueId: "league_us_aa", organizationId: "org_knights", name: "New York Knights AA", teamType: "CLUB", parentTeamId: "team_knights_aaa", rosterLevel: 3, rosterLevelName: "AA" });
  world.addTeam({ id: "team_knights_high_a", leagueId: "league_us_high_a", organizationId: "org_knights", name: "New York Knights High-A", teamType: "CLUB", parentTeamId: "team_knights_aa", rosterLevel: 4, rosterLevelName: "High-A" });
  world.addTeam({ id: "team_knights_a", leagueId: "league_us_a", organizationId: "org_knights", name: "New York Knights A", teamType: "CLUB", parentTeamId: "team_knights_high_a", rosterLevel: 5, rosterLevelName: "A" });
  world.addTeam({ id: "team_knights_rookie", leagueId: "league_us_rookie", organizationId: "org_knights", name: "New York Knights Rookie", teamType: "CLUB", parentTeamId: "team_knights_a", rosterLevel: 6, rosterLevelName: "Rookie" });
  return world;
}

function createPlayer(overrides = {}) {
  return {
    id: "player_model",
    name: "이하람",
    birthDate: "2010-04-15",
    nationality: "Korea Republic",
    nationalityCode: "KR",
    bats: "R",
    throws: "R",
    primaryPosition: "SS",
    secondaryPositions: ["2B"],
    status: "AMATEUR",
    currentAbility: 35,
    potentialAbility: 75,
    battingRatings: {
      contact: 35,
      power: 30,
      plateDiscipline: 34,
      speed: 43,
      fielding: 41,
      arm: 39,
    },
    pitchingRatings: {
      velocity: 20,
      control: 22,
      movement: 18,
      stamina: 25,
      pitchQuality: 19,
      repertoire: [{ name: "Fastball", quality: 20 }],
    },
    developmentProfile: {
      developmentRate: 75,
      consistency: 80,
      durability: 70,
      peakAgeRange: { start: 24, end: 30 },
      declineRate: 45,
    },
    injury: { status: "HEALTHY" },
    ...overrides,
  };
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

test("player model fills age, handedness, ratings, development profile, and injury defaults", () => {
  const world = createWorld();
  world.addPlayer({
    id: "player_defaults",
    name: "신우진",
    birthDate: "2010-04-15",
    nationalityCode: "KR",
    primaryPosition: "CF",
    status: "AMATEUR",
    currentAbility: 40,
    potentialAbility: 70,
  });

  const player = world.players.get("player_defaults");
  assert.equal(player?.age, 16);
  assert.equal(player?.nationality, "KR");
  assert.equal(player?.bats, "R");
  assert.equal(player?.throws, "R");
  assert.deepEqual(player?.secondaryPositions, []);
  assert.equal(player?.battingRatings.contact, 40);
  assert.equal(player?.pitchingRatings.pitchQuality, 40);
  assert.equal(player?.developmentProfile.peakAgeRange.start, 24);
  assert.deepEqual(player?.injury, { status: "HEALTHY" });
});

test("player age is synchronized when LeagueWorld advances time", () => {
  const world = new LeagueWorld(new WorldClock("2027-04-14"), new Mulberry32Random(1));
  world.addCountry({ id: "country_kr", code: "KR", name: "Korea Republic" });
  world.addLeague({
    id: "league_kr1",
    countryId: "country_kr",
    name: "Korea Premier Baseball",
    level: 1,
    category: "PROFESSIONAL",
  });
  world.addTeam({ id: "team_seoul", leagueId: "league_kr1", name: "Seoul Falcons", teamType: "CLUB" });
  world.addPlayer(createPlayer({ id: "birthday_player", birthDate: "2010-04-15" }));

  assert.equal(world.players.get("birthday_player")?.age, 16);
  world.advanceDay({
    injuries: false,
    development: false,
    playerCareerOptions: () => [],
    managerCareerOptions: () => [],
  });

  assert.equal(world.players.get("birthday_player")?.age, 17);
});

test("player development is deterministic with the same seed", () => {
  function run(seed) {
    const world = createWorld(seed);
    world.addPlayer(createPlayer({
      id: "deterministic_dev",
      currentAbility: 32,
      potentialAbility: 82,
      developmentProfile: {
        developmentRate: 100,
        consistency: 90,
        durability: 80,
        peakAgeRange: { start: 24, end: 30 },
        declineRate: 40,
      },
    }));

    world.advanceDays(180, {
      injuries: false,
      playerCareerOptions: () => [],
      managerCareerOptions: () => [],
    });

    const player = world.players.get("deterministic_dev");
    return {
      currentAbility: player?.currentAbility,
      battingRatings: player?.battingRatings,
      pitchingRatings: player?.pitchingRatings,
      events: world.events,
    };
  }

  assert.deepEqual(run(701), run(701));
});

test("young players can grow through daily development ticks", () => {
  const world = createWorld(11);
  world.addPlayer(createPlayer({
    id: "young_growth",
    birthDate: "2010-01-01",
    currentAbility: 25,
    potentialAbility: 80,
    developmentProfile: {
      developmentRate: 100,
      consistency: 100,
      durability: 85,
      peakAgeRange: { start: 24, end: 30 },
      declineRate: 30,
    },
  }));

  world.advanceDays(120, {
    injuries: false,
    playerCareerOptions: () => [],
    managerCareerOptions: () => [],
  });

  assert.ok(world.players.get("young_growth")?.currentAbility > 25);
});

test("major development jumps are recorded as world events", () => {
  const world = createWorld(7);
  world.addPlayer(createPlayer({
    id: "jump_player",
    currentAbility: 10,
    potentialAbility: 95,
    developmentProfile: {
      developmentRate: 100,
      consistency: 100,
      durability: 100,
      peakAgeRange: { start: 24, end: 30 },
      declineRate: 1,
    },
  }));

  world.advanceDays(5, {
    injuries: false,
    playerCareerOptions: () => [],
    managerCareerOptions: () => [],
  });

  const event = world.events.find((candidate) => candidate.type === "PLAYER_DEVELOPED");
  assert.equal(event?.subjectId, "jump_player");
  assert.equal(event?.payload?.delta, 5);
});

test("veteran players can decline after their peak window", () => {
  const world = createWorld(9);
  world.addPlayer(createPlayer({
    id: "veteran_decline",
    birthDate: "1990-01-01",
    currentAbility: 72,
    potentialAbility: 78,
    developmentProfile: {
      developmentRate: 10,
      consistency: 60,
      durability: 10,
      peakAgeRange: { start: 24, end: 29 },
      declineRate: 100,
    },
  }));

  world.advanceDays(180, {
    injuries: false,
    playerCareerOptions: () => [],
    managerCareerOptions: () => [],
  });

  assert.ok(world.players.get("veteran_decline")?.currentAbility < 72);
});

test("high potential ability does not force growth success", () => {
  const world = createWorld(19);
  world.addPlayer(createPlayer({
    id: "growth_failure",
    currentAbility: 20,
    potentialAbility: 95,
    developmentProfile: {
      developmentRate: 0,
      consistency: 100,
      durability: 70,
      peakAgeRange: { start: 24, end: 30 },
      declineRate: 20,
    },
  }));

  world.advanceDays(365, {
    injuries: false,
    playerCareerOptions: () => [],
    managerCareerOptions: () => [],
  });

  assert.equal(world.players.get("growth_failure")?.currentAbility, 20);
});

test("low evaluated late bloomers can improve after the normal peak start", () => {
  const world = createWorld(15);
  world.addPlayer(createPlayer({
    id: "late_bloomer",
    birthDate: "1999-01-01",
    currentAbility: 28,
    potentialAbility: 72,
    developmentProfile: {
      developmentRate: 100,
      consistency: 0,
      durability: 80,
      peakAgeRange: { start: 22, end: 26 },
      declineRate: 5,
    },
  }));

  world.advanceDays(900, {
    injuries: false,
    playerCareerOptions: () => [],
    managerCareerOptions: () => [],
  });

  assert.ok(world.players.get("late_bloomer")?.currentAbility > 28);
});

test("injury occurrence and recovery are driven by seeded world progression", () => {
  const world = createWorld(88);
  world.addPlayer(createPlayer({
    id: "injury_player",
    status: "PROFESSIONAL",
    currentTeamId: "team_seoul",
    developmentProfile: {
      developmentRate: 30,
      consistency: 70,
      durability: 0,
      peakAgeRange: { start: 24, end: 30 },
      declineRate: 30,
    },
  }));

  world.advanceDay({
    development: false,
    injuryChance: () => 1,
    playerCareerOptions: () => [],
    managerCareerOptions: () => [],
  });
  const injured = world.players.get("injury_player");
  const recoveryDays = injured?.injury.expectedRecoveryDays;

  assert.equal(injured?.injury.status, "INJURED");
  assert.equal(world.events.at(-1)?.type, "PLAYER_INJURED");
  assert.ok(recoveryDays > 0);

  world.advanceDays(recoveryDays + 20, {
    development: false,
    injuryChance: () => 0,
    playerCareerOptions: () => [],
    managerCareerOptions: () => [],
  });

  assert.equal(world.players.get("injury_player")?.injury.status, "HEALTHY");
  assert.equal(world.events.at(-1)?.type, "PLAYER_RECOVERED");
});

test("injured players keep coherent team, status, injury, and career state", () => {
  const world = createWorld(44);
  world.addPlayer(createPlayer({
    id: "coherent_injury",
    status: "PROFESSIONAL",
    currentTeamId: "team_busan",
  }));

  world.advanceDay({
    development: false,
    injuryChance: () => 1,
    playerCareerOptions: () => [],
    managerCareerOptions: () => [],
  });

  const player = world.players.get("coherent_injury");
  assert.equal(player?.status, "PROFESSIONAL");
  assert.equal(player?.currentTeamId, "team_busan");
  assert.equal(player?.careerEntries.at(-1)?.teamId, "team_busan");
  assert.equal(player?.injury.status, "INJURED");
  assert.deepEqual(world.validateInvariants(), []);
});

test("player model invariant catches invalid ratings, age, and injury data", () => {
  const world = createWorld();
  world.addPlayer(createPlayer({
    id: "invalid_model",
    currentAbility: 45,
    potentialAbility: 60,
  }));

  const player = world.players.get("invalid_model");
  player.age = 99;
  player.battingRatings.contact = 120;
  player.injury = {
    status: "INJURED",
    severity: "MAJOR",
    expectedRecoveryDays: 10,
    daysRemaining: 11,
    startedOn: "2027-01-01",
  };

  const issues = world.validateInvariants();
  assert.ok(issues.some((issue) => issue.includes("age")));
  assert.ok(issues.some((issue) => issue.includes("contact")));
  assert.ok(issues.some((issue) => issue.includes("injury days remaining")));
  assert.throws(() => world.assertInvariants(), /World invariant violation/);
});

test("organization can group a top team and futures roster", () => {
  const world = createWorld();

  assert.equal(world.organizations.get("org_seoul")?.name, "Seoul Falcons Organization");
  assert.equal(world.teams.get("team_seoul")?.organizationId, "org_seoul");
  assert.equal(world.teams.get("team_seoul_futures")?.organizationId, "org_seoul");
  assert.equal(world.teams.get("team_seoul_futures")?.parentTeamId, "team_seoul");
});

test("2군 to 1군 call-up records roster history and event without adding career entries", () => {
  const world = createWorld();
  world.addPlayer(createPlayer({
    id: "callup_player",
    status: "PROFESSIONAL",
  }));
  world.registerContract({
    playerId: "callup_player",
    organizationId: "org_seoul",
    startDate: "2027-01-01",
    endDate: "2027-12-31",
    salary: 30000000,
    currency: "KRW",
    contractStatus: "ACTIVE",
  });
  world.assignPlayerToRoster("callup_player", "team_seoul_futures", "ACTIVE", "Futures 개막 로스터 등록");
  const careerEntriesBefore = world.players.get("callup_player")?.careerEntries.length;

  world.promotePlayer("callup_player", "team_seoul", "1군 콜업");

  const player = world.players.get("callup_player");
  assert.equal(player?.currentOrganizationId, "org_seoul");
  assert.equal(player?.currentTeamId, "team_seoul");
  assert.equal(player?.rosterAssignments.length, 2);
  assert.equal(player?.rosterAssignments.at(0)?.endDate, "2027-01-01");
  assert.equal(player?.rosterAssignments.at(-1)?.teamId, "team_seoul");
  assert.equal(player?.careerEntries.length, careerEntriesBefore);
  assert.equal(world.events.at(-1)?.type, "PLAYER_PROMOTED");
});

test("1군 to 2군 demotion is a roster move, not a transfer", () => {
  const world = createWorld();
  world.addPlayer(createPlayer({
    id: "demotion_player",
    status: "PROFESSIONAL",
  }));
  world.registerContract({
    playerId: "demotion_player",
    organizationId: "org_seoul",
    startDate: "2027-01-01",
    endDate: "2027-12-31",
    salary: 45000000,
    currency: "KRW",
    contractStatus: "ACTIVE",
  });
  world.assignPlayerToRoster("demotion_player", "team_seoul", "ACTIVE", "1군 로스터 등록");

  world.demotePlayer("demotion_player", "team_seoul_futures", "Futures 말소");

  const player = world.players.get("demotion_player");
  assert.equal(player?.currentTeamId, "team_seoul_futures");
  assert.equal(player?.currentOrganizationId, "org_seoul");
  assert.equal(player?.careerEntries.length, 0);
  assert.equal(world.events.at(-1)?.type, "PLAYER_DEMOTED");
});

test("US style multi-level minor roster movement stays inside one organization", () => {
  const world = createWorld();
  world.addPlayer(createPlayer({
    id: "minor_player",
    status: "PROFESSIONAL",
  }));
  world.registerContract({
    playerId: "minor_player",
    organizationId: "org_knights",
    startDate: "2027-01-01",
    endDate: "2032-12-31",
    salary: 90000,
    currency: "USD",
    contractStatus: "ACTIVE",
  });
  world.assignPlayerToRoster("minor_player", "team_knights_rookie", "ACTIVE", "Rookie 배치");

  world.promotePlayer("minor_player", "team_knights_a", "A 승격");
  world.promotePlayer("minor_player", "team_knights_high_a", "High-A 승격");
  world.promotePlayer("minor_player", "team_knights_aa", "AA 승격");
  world.promotePlayer("minor_player", "team_knights_aaa", "AAA 승격");
  world.promotePlayer("minor_player", "team_knights_mlb", "MLB 콜업");

  const player = world.players.get("minor_player");
  assert.equal(player?.currentOrganizationId, "org_knights");
  assert.equal(player?.currentTeamId, "team_knights_mlb");
  assert.equal(player?.rosterAssignments.length, 6);
  assert.deepEqual(player?.rosterAssignments.map((assignment) => assignment.teamId), [
    "team_knights_rookie",
    "team_knights_a",
    "team_knights_high_a",
    "team_knights_aa",
    "team_knights_aaa",
    "team_knights_mlb",
  ]);
});

test("same player cannot have duplicate active roster assignments", () => {
  const world = createWorld();
  world.addPlayer(createPlayer({ id: "duplicate_roster", status: "PROFESSIONAL" }));
  world.registerContract({
    playerId: "duplicate_roster",
    organizationId: "org_seoul",
    startDate: "2027-01-01",
    endDate: "2027-12-31",
    salary: 10000000,
    currency: "KRW",
    contractStatus: "ACTIVE",
  });
  world.assignPlayerToRoster("duplicate_roster", "team_seoul", "ACTIVE", "1군 등록");

  assert.throws(
    () => world.assignPlayerToRoster("duplicate_roster", "team_seoul_futures", "RESERVE", "중복 등록"),
    /already has an active roster assignment/,
  );
});

test("retired players cannot be assigned to active rosters", () => {
  const world = createWorld();
  world.addPlayer(createPlayer({ id: "retired_roster", status: "AMATEUR" }));
  world.retirePlayer("retired_roster", "선수 생활 종료");

  assert.throws(
    () => world.assignPlayerToRoster("retired_roster", "team_seoul", "ACTIVE", "복귀 없이 등록"),
    /Retired player cannot be assigned/,
  );
});

test("roster move cannot bring in a player from another organization", () => {
  const world = createWorld();
  world.addPlayer(createPlayer({ id: "other_org_player", status: "PROFESSIONAL" }));
  world.registerContract({
    playerId: "other_org_player",
    organizationId: "org_busan",
    startDate: "2027-01-01",
    endDate: "2027-12-31",
    salary: 25000000,
    currency: "KRW",
    contractStatus: "ACTIVE",
  });
  world.assignPlayerToRoster("other_org_player", "team_busan", "ACTIVE", "부산 1군 등록");

  assert.throws(
    () => world.movePlayerWithinOrganization("other_org_player", "team_seoul", "ACTIVE", "타 조직 로스터 이동 시도"),
    /cannot cross organizations/,
  );
});

test("roster removal closes assignment history and records event", () => {
  const world = createWorld();
  world.addPlayer(createPlayer({ id: "remove_roster", status: "PROFESSIONAL" }));
  world.registerContract({
    playerId: "remove_roster",
    organizationId: "org_seoul",
    startDate: "2027-01-01",
    endDate: "2027-12-31",
    salary: 12000000,
    currency: "KRW",
    contractStatus: "ACTIVE",
  });
  world.assignPlayerToRoster("remove_roster", "team_seoul", "RESERVE", "예비 명단 등록");
  world.advanceDays(2, {
    injuries: false,
    development: false,
    playerCareerOptions: () => [],
    managerCareerOptions: () => [],
  });

  world.removePlayerFromRoster("remove_roster", "로스터 제외");

  const player = world.players.get("remove_roster");
  assert.equal(player?.currentTeamId, undefined);
  assert.equal(player?.currentOrganizationId, "org_seoul");
  assert.equal(player?.currentRosterAssignmentId, undefined);
  assert.equal(player?.rosterAssignments.at(0)?.endDate, "2027-01-03");
  assert.equal(world.events.at(-1)?.type, "PLAYER_ROSTER_REMOVED");
});

test("contract registration stores minimal contract data and first professional date", () => {
  const world = createWorld();
  world.addPlayer(createPlayer({ id: "contract_player", status: "AMATEUR" }));

  const contract = world.registerContract({
    playerId: "contract_player",
    organizationId: "org_seoul",
    startDate: "2027-02-01",
    endDate: "2030-01-31",
    salary: 50000000,
    currency: "KRW",
    contractStatus: "ACTIVE",
  });

  const player = world.players.get("contract_player");
  assert.equal(contract.id, "contract_1");
  assert.equal(player?.contracts.length, 1);
  assert.equal(player?.contracts.at(0)?.organizationId, "org_seoul");
  assert.equal(player?.firstProfessionalDate, "2027-02-01");
  assert.equal(player?.firstTopLevelAppearanceDate, undefined);
  assert.equal(world.events.at(-1)?.type, "PLAYER_CONTRACT_REGISTERED");
});

test("current team and organization invariant catches roster contradictions", () => {
  const world = createWorld();
  world.addPlayer(createPlayer({ id: "bad_roster_state", status: "PROFESSIONAL" }));
  world.registerContract({
    playerId: "bad_roster_state",
    organizationId: "org_seoul",
    startDate: "2027-01-01",
    endDate: "2027-12-31",
    salary: 15000000,
    currency: "KRW",
    contractStatus: "ACTIVE",
  });
  world.assignPlayerToRoster("bad_roster_state", "team_seoul", "ACTIVE", "1군 등록");

  const player = world.players.get("bad_roster_state");
  player.currentOrganizationId = "org_busan";

  const issues = world.validateInvariants();
  assert.ok(issues.some((issue) => issue.includes("current team organization")));
  assert.ok(issues.some((issue) => issue.includes("currentOrganizationId does not match open roster assignment")));
  assert.throws(() => world.assertInvariants(), /World invariant violation/);
});

test("injury and roster status contradictions are caught by invariants", () => {
  const world = createWorld();
  world.addPlayer(createPlayer({ id: "injury_roster_mismatch", status: "PROFESSIONAL" }));
  world.registerContract({
    playerId: "injury_roster_mismatch",
    organizationId: "org_seoul",
    startDate: "2027-01-01",
    endDate: "2027-12-31",
    salary: 18000000,
    currency: "KRW",
    contractStatus: "ACTIVE",
  });
  world.assignPlayerToRoster("injury_roster_mismatch", "team_seoul", "ACTIVE", "1군 등록");

  const player = world.players.get("injury_roster_mismatch");
  player.injury = {
    status: "INJURED",
    severity: "MODERATE",
    expectedRecoveryDays: 30,
    daysRemaining: 30,
    startedOn: "2027-01-01",
  };

  const issues = world.validateInvariants();
  assert.ok(issues.some((issue) => issue.includes("is injured but rosterStatus is ACTIVE")));
  assert.throws(() => world.assertInvariants(), /World invariant violation/);
});
