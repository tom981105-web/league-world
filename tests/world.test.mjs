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

function createRegularSeason(world, overrides = {}) {
  const season = world.createSeason({
    id: "season_kr_2027",
    leagueId: "league_kr1",
    year: 2027,
    name: "2027 Korea Premier Baseball",
    startDate: "2027-01-02",
    regularSeasonEndDate: "2027-10-01",
    postseasonEndDate: "2027-11-01",
    allowDraws: true,
    hasPostseason: true,
    ...overrides,
  });
  const competition = world.createCompetition({
    id: "competition_kr_regular_2027",
    seasonId: season.id,
    leagueId: season.leagueId,
    name: "2027 Korea Premier Regular Season",
    type: "REGULAR_SEASON",
    startDate: season.startDate,
    endDate: season.regularSeasonEndDate,
    participatingTeamIds: ["team_seoul", "team_busan"],
  });
  return { season, competition };
}

const lineupPositionsWithDh = ["C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH"];
const lineupPositionsWithoutDh = ["P", "C", "1B", "2B", "3B", "SS", "LF", "CF", "RF"];

function createScheduledGame(world, scheduledDate = "2027-01-01") {
  const season = world.createSeason({
    id: `season_lineup_${scheduledDate}`,
    leagueId: "league_kr1",
    year: Number(scheduledDate.slice(0, 4)),
    name: `Lineup Test ${scheduledDate}`,
    startDate: "2027-01-01",
    regularSeasonEndDate: "2027-10-01",
    allowDraws: true,
  });
  const competition = world.createCompetition({
    id: `competition_lineup_${scheduledDate}`,
    seasonId: season.id,
    leagueId: season.leagueId,
    name: `Lineup Competition ${scheduledDate}`,
    type: "REGULAR_SEASON",
    startDate: season.startDate,
    endDate: season.regularSeasonEndDate,
    participatingTeamIds: ["team_seoul", "team_busan"],
  });
  return world.scheduleGame({
    seasonId: season.id,
    competitionId: competition.id,
    homeTeamId: "team_seoul",
    awayTeamId: "team_busan",
    scheduledDate,
  });
}

function seedTeamPlayers(world, teamId, prefix, positions = lineupPositionsWithDh, extraPitchers = 2) {
  const playerIds = [];
  for (const [index, position] of positions.entries()) {
    const playerId = `${prefix}_${position}_${index}`.replaceAll("-", "_");
    world.addPlayer(createPlayer({
      id: playerId,
      name: `${prefix} ${position}`,
      birthDate: "2001-05-01",
      status: "PROFESSIONAL",
      primaryPosition: position === "DH" ? "1B" : position,
      secondaryPositions: position === "DH" ? ["DH"] : [],
      currentAbility: 45 + index,
      potentialAbility: 70,
      battingRatings: {
        contact: 45 + index,
        power: 42 + index,
        plateDiscipline: 40 + index,
        speed: 44,
        fielding: 43,
        arm: 43,
      },
      pitchingRatings: {
        velocity: position === "P" ? 70 : 20,
        control: position === "P" ? 68 : 20,
        movement: position === "P" ? 66 : 20,
        stamina: position === "P" ? 72 : 20,
        pitchQuality: position === "P" ? 67 : 20,
        repertoire: [{ name: "Fastball", quality: position === "P" ? 70 : 20 }],
      },
    }));
    world.assignPlayerToRoster(playerId, teamId, "ACTIVE", "경기 테스트 로스터 등록");
    playerIds.push(playerId);
  }
  for (let index = 0; index < extraPitchers; index += 1) {
    const playerId = `${prefix}_P_extra_${index}`;
    world.addPlayer(createPlayer({
      id: playerId,
      name: `${prefix} Pitcher ${index}`,
      birthDate: "2000-03-03",
      status: "PROFESSIONAL",
      primaryPosition: "P",
      currentAbility: 58 + index,
      potentialAbility: 75,
      pitchingRatings: {
        velocity: 72 + index,
        control: 70 + index,
        movement: 68 + index,
        stamina: 74 + index,
        pitchQuality: 71 + index,
        repertoire: [{ name: "Fastball", quality: 72 + index }],
      },
    }));
    world.assignPlayerToRoster(playerId, teamId, "ACTIVE", "투수 테스트 로스터 등록");
    playerIds.push(playerId);
  }
  return playerIds;
}

function lineupFrom(playerIds, positions) {
  return positions.map((defensivePosition, index) => ({
    battingOrder: index + 1,
    playerId: playerIds[index],
    defensivePosition,
    positionFit: 100,
    outOfPosition: false,
  }));
}

function createReadyGame(world, options = {}) {
  if (options.league) {
    Object.assign(world.leagues.get("league_kr1"), options.league);
  }
  const game = createScheduledGame(world, options.scheduledDate ?? "2027-01-01");
  const seoulPlayers = seedTeamPlayers(world, "team_seoul", options.homePrefix ?? "engine_home");
  const busanPlayers = seedTeamPlayers(world, "team_busan", options.awayPrefix ?? "engine_away");
  world.createGameRoster({
    gameId: game.id,
    teamId: "team_seoul",
    activePlayerIds: seoulPlayers,
    startingLineup: lineupFrom(seoulPlayers, lineupPositionsWithDh),
    startingPitcherId: seoulPlayers.at(-1),
    benchPlayerIds: [seoulPlayers.at(-2), seoulPlayers.at(-1)],
    bullpenPlayerIds: [seoulPlayers.at(-2)],
    rules: { maxActivePlayers: 26, battingOrderSize: 9, usesDH: true },
  });
  world.createGameRoster({
    gameId: game.id,
    teamId: "team_busan",
    activePlayerIds: busanPlayers,
    startingLineup: lineupFrom(busanPlayers, lineupPositionsWithDh),
    startingPitcherId: busanPlayers.at(-1),
    benchPlayerIds: [busanPlayers.at(-2), busanPlayers.at(-1)],
    bullpenPlayerIds: [busanPlayers.at(-2)],
    rules: { maxActivePlayers: 26, battingOrderSize: 9, usesDH: true },
  });
  return { game, homePlayers: seoulPlayers, awayPlayers: busanPlayers };
}

function scheduleSameSeasonGame(world, firstGame, scheduledDate) {
  return world.scheduleGame({
    seasonId: firstGame.seasonId,
    competitionId: firstGame.competitionId,
    homeTeamId: "team_seoul",
    awayTeamId: "team_busan",
    scheduledDate,
  });
}

function prepareRosterForExistingGame(world, game, teamId, playerIds) {
  const lineupPlayerIds = playerIds.slice(0, lineupPositionsWithDh.length);
  const benchPlayerIds = playerIds.filter((playerId) => !lineupPlayerIds.includes(playerId));
  world.createGameRoster({
    gameId: game.id,
    teamId,
    activePlayerIds: playerIds,
    startingLineup: lineupFrom(lineupPlayerIds, lineupPositionsWithDh),
    startingPitcherId: playerIds.at(-1),
    benchPlayerIds,
    bullpenPlayerIds: benchPlayerIds.filter((playerId) => world.players.get(playerId)?.primaryPosition === "P"),
    rules: { maxActivePlayers: 26, battingOrderSize: 9, usesDH: true },
  });
}

function playOneInningScriptedGame(world, gameId, awayResults, homeResults = ["GROUND_OUT", "FLY_OUT", "LINE_OUT"]) {
  world.startGame(gameId);
  for (const result of awayResults) world.applyPlateAppearanceResult(gameId, result);
  for (const result of homeResults) world.applyPlateAppearanceResult(gameId, result);
  return world.liveGames.get(gameId);
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
    ["PLAYER_CREATED", "PLAYER_MOVED", "PLAYER_RELEASED", "PLAYER_BECAME_FREE_AGENT", "PLAYER_RETIRED"],
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
  assert.equal(player?.careerEntries.length, 1);
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
  assert.ok(world.events.some((event) => event.type === "PLAYER_CONTRACT_REGISTERED"));
  assert.ok(world.events.some((event) => event.type === "PLAYER_SIGNED"));
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

test("season creation stores league year calendar and initial standings", () => {
  const world = createWorld();
  const { season, competition } = createRegularSeason(world);

  assert.equal(season.status, "PRESEASON");
  assert.equal(season.allowDraws, true);
  assert.equal(season.hasPostseason, true);
  assert.equal(world.seasons.get(season.id)?.leagueId, "league_kr1");
  assert.equal(world.competitions.get(competition.id)?.type, "REGULAR_SEASON");
  assert.deepEqual(world.getStandings(season.id).map((record) => record.teamId).sort(), [
    "team_busan",
    "team_seoul",
  ]);
});

test("duplicate season for the same league and year is rejected", () => {
  const world = createWorld();
  createRegularSeason(world);

  assert.throws(
    () => world.createSeason({
      leagueId: "league_kr1",
      year: 2027,
      name: "Duplicate 2027 Season",
      startDate: "2027-03-01",
      regularSeasonEndDate: "2027-09-01",
    }),
    /Season already exists/,
  );
});

test("round-robin schedule generation creates balanced home and away fixtures", () => {
  const world = createWorld(3);
  const season = world.createSeason({
    id: "season_rr_2027",
    leagueId: "league_kr1",
    year: 2027,
    name: "Round Robin Test",
    startDate: "2027-01-02",
    regularSeasonEndDate: "2027-02-28",
    allowDraws: true,
  });
  const competition = world.createCompetition({
    id: "competition_rr_2027",
    seasonId: season.id,
    leagueId: season.leagueId,
    name: "Round Robin Regular Season",
    type: "REGULAR_SEASON",
    startDate: season.startDate,
    endDate: season.regularSeasonEndDate,
    participatingTeamIds: ["team_seoul", "team_busan"],
  });

  const fixtures = world.generateRoundRobinSchedule({
    seasonId: season.id,
    competitionId: competition.id,
    teamIds: ["team_seoul", "team_busan"],
    gamesPerOpponent: 4,
    startDate: "2027-01-02",
  });
  const homeCounts = fixtures.reduce((counts, game) => {
    counts[game.homeTeamId] = (counts[game.homeTeamId] ?? 0) + 1;
    return counts;
  }, {});

  assert.equal(fixtures.length, 4);
  assert.equal(homeCounts.team_seoul, 2);
  assert.equal(homeCounts.team_busan, 2);
  assert.ok(fixtures.every((game) => game.status === "SCHEDULED"));
});

test("same team cannot be scheduled for two games on the same date", () => {
  const world = createWorld();
  const { season, competition } = createRegularSeason(world);
  world.scheduleGame({
    seasonId: season.id,
    competitionId: competition.id,
    homeTeamId: "team_seoul",
    awayTeamId: "team_busan",
    scheduledDate: "2027-04-01",
  });

  assert.throws(
    () => world.scheduleGame({
      seasonId: season.id,
      competitionId: competition.id,
      homeTeamId: "team_busan",
      awayTeamId: "team_seoul",
      scheduledDate: "2027-04-01",
    }),
    /already has a game/,
  );
});

test("game result input completes fixture and updates standings", () => {
  const world = createWorld();
  const { season, competition } = createRegularSeason(world);
  const game = world.scheduleGame({
    seasonId: season.id,
    competitionId: competition.id,
    homeTeamId: "team_seoul",
    awayTeamId: "team_busan",
    scheduledDate: "2027-04-02",
    venue: "Falcons Park",
  });

  const completed = world.recordGameResult(game.id, { homeScore: 5, awayScore: 3 });
  const standings = world.getStandings(season.id);
  const seoul = standings.find((record) => record.teamId === "team_seoul");
  const busan = standings.find((record) => record.teamId === "team_busan");

  assert.equal(completed.status, "COMPLETED");
  assert.deepEqual(completed.result, { homeScore: 5, awayScore: 3 });
  assert.equal(seoul?.wins, 1);
  assert.equal(seoul?.winningPercentage, 1);
  assert.equal(busan?.losses, 1);
  assert.equal(busan?.gamesBehind, 1);
  assert.equal(world.events.at(-1)?.type, "GAME_COMPLETED");
});

test("draw results are supported when the season allows draws", () => {
  const world = createWorld();
  const { season, competition } = createRegularSeason(world);
  const game = world.scheduleGame({
    seasonId: season.id,
    competitionId: competition.id,
    homeTeamId: "team_seoul",
    awayTeamId: "team_busan",
    scheduledDate: "2027-04-03",
  });

  world.completeGame(game.id, { homeScore: 2, awayScore: 2 });
  const standings = world.getStandings(season.id);

  assert.equal(standings.find((record) => record.teamId === "team_seoul")?.draws, 1);
  assert.equal(standings.find((record) => record.teamId === "team_busan")?.winningPercentage, 0.5);
});

test("season status advances with WorldClock dates", () => {
  const world = createWorld();
  const { season } = createRegularSeason(world, {
    id: "season_short",
    year: 2028,
    startDate: "2027-01-02",
    regularSeasonEndDate: "2027-01-03",
    postseasonEndDate: "2027-01-05",
  });

  world.advanceDay({ injuries: false, development: false, playerCareerOptions: () => [], managerCareerOptions: () => [] });
  assert.equal(world.seasons.get(season.id)?.status, "REGULAR_SEASON");
  world.advanceDays(2, { injuries: false, development: false, playerCareerOptions: () => [], managerCareerOptions: () => [] });
  assert.equal(world.seasons.get(season.id)?.status, "POSTSEASON");
  world.advanceDays(2, { injuries: false, development: false, playerCareerOptions: () => [], managerCareerOptions: () => [] });
  assert.equal(world.seasons.get(season.id)?.status, "COMPLETED");
  assert.ok(world.events.some((event) => event.type === "SEASON_STARTED"));
  assert.ok(world.events.some((event) => event.type === "REGULAR_SEASON_ENDED"));
  assert.ok(world.events.some((event) => event.type === "POSTSEASON_STARTED"));
  assert.ok(world.events.some((event) => event.type === "SEASON_COMPLETED"));
});

test("round-robin schedule is reproducible with the same seed", () => {
  function run(seed) {
    const world = createWorld(seed);
    const { season, competition } = createRegularSeason(world);
    return world.generateRoundRobinSchedule({
      seasonId: season.id,
      competitionId: competition.id,
      teamIds: ["team_seoul", "team_busan"],
      gamesPerOpponent: 6,
      startDate: "2027-03-01",
      restDaysBetweenRounds: 1,
    });
  }

  assert.deepEqual(run(777), run(777));
});

test("schedule and standings invariants catch invalid local mutations", () => {
  const world = createWorld();
  const { season, competition } = createRegularSeason(world);
  const game = world.scheduleGame({
    seasonId: season.id,
    competitionId: competition.id,
    homeTeamId: "team_seoul",
    awayTeamId: "team_busan",
    scheduledDate: "2027-04-04",
  });
  world.completeGame(game.id, { homeScore: 8, awayScore: 4 });

  world.games.get(game.id).awayTeamId = "team_seoul";
  world.getStandings(season.id);
  world.standings.get(season.id).get("team_seoul").wins = 99;

  const issues = world.validateInvariants();
  assert.ok(issues.some((issue) => issue.includes("same home and away")));
  assert.ok(issues.some((issue) => issue.includes("do not match completed games")));
  assert.throws(() => world.assertInvariants(), /World invariant violation/);
});

test("completed games cannot be completed twice", () => {
  const world = createWorld();
  const { season, competition } = createRegularSeason(world);
  const game = world.scheduleGame({
    seasonId: season.id,
    competitionId: competition.id,
    homeTeamId: "team_seoul",
    awayTeamId: "team_busan",
    scheduledDate: "2027-04-05",
  });
  world.completeGame(game.id, { homeScore: 1, awayScore: 0 });

  assert.throws(() => world.completeGame(game.id, { homeScore: 2, awayScore: 0 }), /already completed/);
});

test("game roster accepts a normal 9-player DH lineup", () => {
  const world = createWorld();
  const game = createScheduledGame(world);
  const seoulPlayers = seedTeamPlayers(world, "team_seoul", "seoul_dh");
  const busanPlayers = seedTeamPlayers(world, "team_busan", "busan_dh");

  const roster = world.createGameRoster({
    gameId: game.id,
    teamId: "team_seoul",
    activePlayerIds: seoulPlayers,
    startingLineup: lineupFrom(seoulPlayers, lineupPositionsWithDh),
    startingPitcherId: seoulPlayers.at(-1),
    benchPlayerIds: [seoulPlayers.at(-2), seoulPlayers.at(-1)],
    bullpenPlayerIds: [seoulPlayers.at(-2)],
    rules: { maxActivePlayers: 26, battingOrderSize: 9, usesDH: true },
  });
  world.createGameRoster({
    gameId: game.id,
    teamId: "team_busan",
    activePlayerIds: busanPlayers,
    startingLineup: lineupFrom(busanPlayers, lineupPositionsWithDh),
    startingPitcherId: busanPlayers.at(-1),
    benchPlayerIds: [busanPlayers.at(-2), busanPlayers.at(-1)],
    bullpenPlayerIds: [busanPlayers.at(-2)],
    rules: { maxActivePlayers: 26, battingOrderSize: 9, usesDH: true },
  });

  assert.equal(roster.startingLineup.length, 9);
  assert.equal(roster.startingLineup.some((slot) => slot.defensivePosition === "DH"), true);
  assert.deepEqual(world.validateGameReady(game.id), []);
  assert.ok(world.events.some((event) => event.type === "GAME_ROSTER_CREATED"));
});

test("game roster supports a no-DH lineup with the pitcher batting", () => {
  const world = createWorld();
  const game = createScheduledGame(world);
  const players = seedTeamPlayers(world, "team_seoul", "seoul_nodh", lineupPositionsWithoutDh, 1);

  const roster = world.createGameRoster({
    gameId: game.id,
    teamId: "team_seoul",
    activePlayerIds: players,
    startingLineup: lineupFrom(players, lineupPositionsWithoutDh),
    startingPitcherId: players[0],
    benchPlayerIds: [players.at(-1)],
    bullpenPlayerIds: [players.at(-1)],
    rules: { maxActivePlayers: 26, battingOrderSize: 9, usesDH: false },
  });

  assert.equal(roster.startingLineup[0].defensivePosition, "P");
  assert.deepEqual(world.validateGameRoster(game.id, "team_seoul"), []);
});

test("game roster rejects duplicate lineup players and duplicate batting orders", () => {
  const world = createWorld();
  const game = createScheduledGame(world);
  const players = seedTeamPlayers(world, "team_seoul", "dup_lineup");
  const lineup = lineupFrom(players, lineupPositionsWithDh);
  lineup[1].playerId = lineup[0].playerId;
  lineup[2].battingOrder = lineup[1].battingOrder;

  assert.throws(
    () => world.createGameRoster({
      gameId: game.id,
      teamId: "team_seoul",
      activePlayerIds: players,
      startingLineup: lineup,
      startingPitcherId: players.at(-1),
      rules: { maxActivePlayers: 26, battingOrderSize: 9, usesDH: true },
    }),
    /duplicate/,
  );
});

test("game roster rejects players from another team", () => {
  const world = createWorld();
  const game = createScheduledGame(world);
  const seoulPlayers = seedTeamPlayers(world, "team_seoul", "wrong_team_seoul");
  const busanPlayers = seedTeamPlayers(world, "team_busan", "wrong_team_busan");
  const lineup = lineupFrom(seoulPlayers, lineupPositionsWithDh);
  lineup[3].playerId = busanPlayers[0];

  assert.throws(
    () => world.createGameRoster({
      gameId: game.id,
      teamId: "team_seoul",
      activePlayerIds: [...seoulPlayers, busanPlayers[0]],
      startingLineup: lineup,
      startingPitcherId: seoulPlayers.at(-1),
      rules: { maxActivePlayers: 26, battingOrderSize: 9, usesDH: true },
    }),
    /not on team/,
  );
});

test("game roster rejects injured and retired players", () => {
  const injuredWorld = createWorld();
  const injuredGame = createScheduledGame(injuredWorld);
  const injuredPlayers = seedTeamPlayers(injuredWorld, "team_seoul", "injured_lineup");
  const injured = injuredWorld.players.get(injuredPlayers[2]);
  injured.injury = {
    status: "INJURED",
    severity: "MODERATE",
    expectedRecoveryDays: 30,
    daysRemaining: 30,
    startedOn: "2027-01-01",
  };
  injured.gameCondition.availableForGame = false;
  injured.rosterStatus = "INJURED";
  injured.rosterAssignments.at(-1).rosterStatus = "INJURED";

  assert.throws(
    () => injuredWorld.createGameRoster({
      gameId: injuredGame.id,
      teamId: "team_seoul",
      activePlayerIds: injuredPlayers,
      startingLineup: lineupFrom(injuredPlayers, lineupPositionsWithDh),
      startingPitcherId: injuredPlayers.at(-1),
      rules: { maxActivePlayers: 26, battingOrderSize: 9, usesDH: true },
    }),
    /not available/,
  );

  const retiredWorld = createWorld();
  const retiredGame = createScheduledGame(retiredWorld);
  const retiredPlayers = seedTeamPlayers(retiredWorld, "team_seoul", "retired_lineup");
  const retired = retiredWorld.players.get(retiredPlayers[4]);
  retired.status = "RETIRED";

  const issues = retiredWorld.validateInvariants();
  assert.ok(issues.some((issue) => issue.includes("retired")));
  assert.throws(
    () => retiredWorld.createGameRoster({
      gameId: retiredGame.id,
      teamId: "team_seoul",
      activePlayerIds: retiredPlayers,
      startingLineup: lineupFrom(retiredPlayers, lineupPositionsWithDh),
      startingPitcherId: retiredPlayers.at(-1),
      rules: { maxActivePlayers: 26, battingOrderSize: 9, usesDH: true },
    }),
    /retired|not available/,
  );
});

test("pitching rotation cycles through 4, 5, and 6 starters", () => {
  for (const size of [4, 5, 6]) {
    const world = createWorld(size);
    const pitchers = seedTeamPlayers(world, "team_seoul", `rotation_${size}`, ["P"], size - 1);
    world.setPitchingRotation("team_seoul", pitchers);

    const turns = Array.from({ length: size + 1 }, () => world.selectNextStartingPitcher("team_seoul"));

    assert.deepEqual(turns.slice(0, size), pitchers);
    assert.equal(turns.at(-1), pitchers[0]);
    assert.equal(world.pitchingRotations.get("team_seoul").nextStarterIndex, 1);
  }
});

test("manager can manually override the starting pitcher", () => {
  const world = createWorld();
  const game = createScheduledGame(world);
  const players = seedTeamPlayers(world, "team_seoul", "manual_sp");
  const manualStarter = players.at(-2);
  world.createGameRoster({
    gameId: game.id,
    teamId: "team_seoul",
    activePlayerIds: players,
    startingLineup: lineupFrom(players, lineupPositionsWithDh),
    startingPitcherId: players.at(-1),
    rules: { maxActivePlayers: 26, battingOrderSize: 9, usesDH: true },
  });

  const roster = world.setStartingPitcher(game.id, "team_seoul", manualStarter);

  assert.equal(roster.startingPitcherId, manualStarter);
  assert.equal(world.events.at(-1).type, "STARTING_PITCHER_SET");
});

test("bullpen roles can store multiple role candidates", () => {
  const world = createWorld();
  const pitchers = seedTeamPlayers(world, "team_seoul", "bullpen_roles", ["P"], 2);

  const assignment = world.assignBullpenRole("team_seoul", pitchers[1], ["SETUP", "MIDDLE_RELIEF"]);

  assert.deepEqual(assignment.roles, ["SETUP", "MIDDLE_RELIEF"]);
  assert.equal(world.bullpenAssignments.get("team_seoul").get(pitchers[1]).teamId, "team_seoul");
});

test("auto lineup generation creates valid rosters and is reproducible with the same seed", () => {
  function run(seed) {
    const world = createWorld(seed);
    const game = createScheduledGame(world);
    seedTeamPlayers(world, "team_seoul", "auto_seoul");
    const roster = world.autoGenerateLineup({
      gameId: game.id,
      teamId: "team_seoul",
      rules: { maxActivePlayers: 26, battingOrderSize: 9, usesDH: true },
    });
    return {
      lineup: roster.startingLineup.map((slot) => ({
        order: slot.battingOrder,
        playerId: slot.playerId,
        position: slot.defensivePosition,
      })),
      startingPitcherId: roster.startingPitcherId,
      issues: world.validateGameRoster(game.id, "team_seoul"),
    };
  }

  const first = run(909);
  assert.equal(first.lineup.length, 9);
  assert.deepEqual(first.issues, []);
  assert.deepEqual(first, run(909));
});

test("validateGameReady reports missing and valid game-day state", () => {
  const world = createWorld();
  const game = createScheduledGame(world, "2027-01-02");
  const seoulPlayers = seedTeamPlayers(world, "team_seoul", "ready_seoul");
  const busanPlayers = seedTeamPlayers(world, "team_busan", "ready_busan");

  assert.ok(world.validateGameReady(game.id).some((issue) => issue.includes("scheduled for")));
  world.advanceDay({ injuries: false, development: false, playerCareerOptions: () => [], managerCareerOptions: () => [] });
  assert.ok(world.validateGameReady(game.id).some((issue) => issue.includes("Game roster missing")));

  for (const [teamId, players] of [["team_seoul", seoulPlayers], ["team_busan", busanPlayers]]) {
    world.createGameRoster({
      gameId: game.id,
      teamId,
      activePlayerIds: players,
      startingLineup: lineupFrom(players, lineupPositionsWithDh),
      startingPitcherId: players.at(-1),
      rules: { maxActivePlayers: 26, battingOrderSize: 9, usesDH: true },
    });
  }

  assert.deepEqual(world.validateGameReady(game.id), []);
});

test("game roster invariants catch invalid local mutations", () => {
  const world = createWorld();
  const game = createScheduledGame(world);
  const players = seedTeamPlayers(world, "team_seoul", "bad_game_roster");
  const roster = world.createGameRoster({
    gameId: game.id,
    teamId: "team_seoul",
    activePlayerIds: players,
    startingLineup: lineupFrom(players, lineupPositionsWithDh),
    startingPitcherId: players.at(-1),
    rules: { maxActivePlayers: 26, battingOrderSize: 9, usesDH: true },
  });

  world.gameRosters.get(roster.id).teamId = "team_busan";
  world.gameRosters.get(roster.id).startingLineup[0].defensivePosition = "XX";
  world.gameRosters.get(roster.id).startingLineup[1].playerId = world.gameRosters.get(roster.id).startingLineup[0].playerId;

  const issues = world.validateInvariants();
  assert.ok(issues.some((issue) => issue.includes("not on team")));
  assert.ok(issues.some((issue) => issue.includes("invalid position")));
  assert.ok(issues.some((issue) => issue.includes("duplicate lineup player")));
});

test("live game starts from a ready fixture with first batter and pitcher", () => {
  const world = createWorld();
  const { game, homePlayers, awayPlayers } = createReadyGame(world);

  const liveGame = world.startGame(game.id);

  assert.equal(liveGame.status, "IN_PROGRESS");
  assert.equal(liveGame.inning, 1);
  assert.equal(liveGame.half, "TOP");
  assert.equal(liveGame.currentBatterId, awayPlayers[0]);
  assert.equal(liveGame.currentPitcherId, homePlayers.at(-1));
  assert.equal(world.events.at(-1).type, "GAME_STARTED");
});

test("game start fails when rosters are not ready", () => {
  const world = createWorld();
  const game = createScheduledGame(world);

  assert.throws(() => world.startGame(game.id), /Game is not ready/);
});

test("same seed produces the same simulated game result and play-by-play", () => {
  function run(seed) {
    const world = createWorld(seed);
    const { game } = createReadyGame(world, { homePrefix: `same_home_${seed}`, awayPrefix: `same_away_${seed}` });
    const liveGame = world.simulateGame(game.id);
    return {
      result: world.games.get(game.id).result,
      plays: liveGame.playByPlay.map((play) => [play.inning, play.half, play.batterId, play.pitcherId, play.result, play.scoreAfter]),
    };
  }

  assert.deepEqual(run(303), run(303));
});

test("plate appearance probabilities respond to batter and pitcher ability", () => {
  const world = createWorld(404);
  world.addPlayer(createPlayer({
    id: "elite_batter",
    birthDate: "1999-01-01",
    battingRatings: { contact: 95, power: 92, plateDiscipline: 90, speed: 70, fielding: 40, arm: 40 },
  }));
  world.addPlayer(createPlayer({
    id: "weak_batter",
    birthDate: "1999-01-01",
    battingRatings: { contact: 20, power: 18, plateDiscipline: 20, speed: 35, fielding: 40, arm: 40 },
  }));
  world.addPlayer(createPlayer({
    id: "elite_pitcher",
    birthDate: "1995-01-01",
    primaryPosition: "P",
    pitchingRatings: { velocity: 95, control: 92, movement: 94, stamina: 88, pitchQuality: 95, repertoire: [{ name: "Fastball", quality: 95 }] },
  }));
  world.addPlayer(createPlayer({
    id: "weak_pitcher",
    birthDate: "1995-01-01",
    primaryPosition: "P",
    pitchingRatings: { velocity: 25, control: 22, movement: 25, stamina: 40, pitchQuality: 24, repertoire: [{ name: "Fastball", quality: 24 }] },
  }));

  const strongOffense = { hits: 0, homeRuns: 0, strikeouts: 0 };
  const weakOffense = { hits: 0, homeRuns: 0, strikeouts: 0 };
  for (let index = 0; index < 600; index += 1) {
    const strongResult = world.simulatePlateAppearance("elite_batter", "weak_pitcher");
    if (["SINGLE", "DOUBLE", "TRIPLE", "HOME_RUN"].includes(strongResult)) strongOffense.hits += 1;
    if (strongResult === "HOME_RUN") strongOffense.homeRuns += 1;
    if (strongResult === "STRIKEOUT") strongOffense.strikeouts += 1;

    const weakResult = world.simulatePlateAppearance("weak_batter", "elite_pitcher");
    if (["SINGLE", "DOUBLE", "TRIPLE", "HOME_RUN"].includes(weakResult)) weakOffense.hits += 1;
    if (weakResult === "HOME_RUN") weakOffense.homeRuns += 1;
    if (weakResult === "STRIKEOUT") weakOffense.strikeouts += 1;
  }

  assert.ok(strongOffense.hits > weakOffense.hits);
  assert.ok(strongOffense.homeRuns > weakOffense.homeRuns);
  assert.ok(weakOffense.strikeouts > strongOffense.strikeouts);
});

test("hits advance runners and score with simple base running rules", () => {
  const world = createWorld();
  const { game, awayPlayers } = createReadyGame(world);
  world.startGame(game.id);

  world.applyPlateAppearanceResult(game.id, "SINGLE");
  assert.deepEqual(world.liveGames.get(game.id).bases, { first: awayPlayers[0], second: null, third: null });
  world.applyPlateAppearanceResult(game.id, "DOUBLE");
  assert.deepEqual(world.liveGames.get(game.id).bases, { first: null, second: awayPlayers[1], third: awayPlayers[0] });
  const triple = world.applyPlateAppearanceResult(game.id, "TRIPLE");
  assert.equal(triple.runsScored, 2);
  assert.deepEqual(world.liveGames.get(game.id).bases, { first: null, second: null, third: awayPlayers[2] });
  const homer = world.applyPlateAppearanceResult(game.id, "HOME_RUN");
  assert.equal(homer.runsScored, 2);
  assert.deepEqual(world.liveGames.get(game.id).bases, { first: null, second: null, third: null });
  assert.equal(world.liveGames.get(game.id).awayScore, 4);
});

test("walk forces in a run with the bases loaded", () => {
  const world = createWorld();
  const { game, awayPlayers } = createReadyGame(world);
  world.startGame(game.id);

  world.applyPlateAppearanceResult(game.id, "WALK");
  world.applyPlateAppearanceResult(game.id, "WALK");
  world.applyPlateAppearanceResult(game.id, "WALK");
  const event = world.applyPlateAppearanceResult(game.id, "WALK");

  assert.equal(event.runsScored, 1);
  assert.equal(world.liveGames.get(game.id).awayScore, 1);
  assert.deepEqual(world.liveGames.get(game.id).bases, {
    first: awayPlayers[3],
    second: awayPlayers[2],
    third: awayPlayers[1],
  });
});

test("three outs switch half innings and lineup order cycles", () => {
  const world = createWorld();
  const { game, awayPlayers } = createReadyGame(world);
  world.startGame(game.id);

  world.applyPlateAppearanceResult(game.id, "GROUND_OUT");
  world.applyPlateAppearanceResult(game.id, "FLY_OUT");
  world.applyPlateAppearanceResult(game.id, "STRIKEOUT");
  const liveGame = world.liveGames.get(game.id);

  assert.equal(liveGame.half, "BOTTOM");
  assert.equal(liveGame.inning, 1);
  assert.equal(liveGame.outs, 0);
  assert.equal(liveGame.awayLineupIndex, 3);

  world.applyPlateAppearanceResult(game.id, "SINGLE");
  for (let index = 0; index < 8; index += 1) {
    world.applyPlateAppearanceResult(game.id, "GROUND_OUT");
    if (world.liveGames.get(game.id).half === "TOP") break;
  }
  assert.equal(world.liveGames.get(game.id).currentBatterId, awayPlayers[3]);
});

test("a tied game can complete after nine innings when the league allows draws", () => {
  const world = createWorld();
  const { game } = createReadyGame(world);
  world.startGame(game.id);
  const liveGame = world.liveGames.get(game.id);
  liveGame.inning = 9;
  liveGame.half = "BOTTOM";
  liveGame.currentBatterId = [...world.gameRosters.values()].find((roster) => roster.teamId === "team_seoul").startingLineup[0].playerId;
  liveGame.currentPitcherId = [...world.gameRosters.values()].find((roster) => roster.teamId === "team_busan").startingPitcherId;

  world.applyPlateAppearanceResult(game.id, "GROUND_OUT");
  world.applyPlateAppearanceResult(game.id, "FLY_OUT");
  world.applyPlateAppearanceResult(game.id, "LINE_OUT");

  assert.equal(world.liveGames.get(game.id).status, "COMPLETED");
  assert.deepEqual(world.games.get(game.id).result, { homeScore: 0, awayScore: 0 });
});

test("a tied no-draw game advances to extra innings", () => {
  const world = createWorld();
  const { game } = createReadyGame(world);
  world.seasons.get(game.seasonId).allowDraws = false;
  world.leagues.get("league_kr1").allowExtraInnings = true;
  world.startGame(game.id);
  const liveGame = world.liveGames.get(game.id);
  liveGame.inning = 9;
  liveGame.half = "BOTTOM";
  liveGame.currentBatterId = [...world.gameRosters.values()].find((roster) => roster.teamId === "team_seoul").startingLineup[0].playerId;
  liveGame.currentPitcherId = [...world.gameRosters.values()].find((roster) => roster.teamId === "team_busan").startingPitcherId;

  world.applyPlateAppearanceResult(game.id, "GROUND_OUT");
  world.applyPlateAppearanceResult(game.id, "FLY_OUT");
  world.applyPlateAppearanceResult(game.id, "LINE_OUT");

  assert.equal(world.liveGames.get(game.id).status, "IN_PROGRESS");
  assert.equal(world.liveGames.get(game.id).inning, 10);
  assert.equal(world.liveGames.get(game.id).half, "TOP");
});

test("home team lead skips the bottom of the ninth", () => {
  const world = createWorld();
  const { game } = createReadyGame(world);
  world.startGame(game.id);
  const liveGame = world.liveGames.get(game.id);
  liveGame.inning = 9;
  liveGame.half = "TOP";
  liveGame.homeScore = 2;
  liveGame.awayScore = 1;
  liveGame.boxScore.teams.home.runs = 2;
  liveGame.boxScore.teams.away.runs = 1;

  world.applyPlateAppearanceResult(game.id, "GROUND_OUT");
  world.applyPlateAppearanceResult(game.id, "FLY_OUT");
  world.applyPlateAppearanceResult(game.id, "LINE_OUT");

  assert.equal(world.liveGames.get(game.id).status, "COMPLETED");
  assert.deepEqual(world.games.get(game.id).result, { homeScore: 2, awayScore: 1 });
});

test("walk-off scoring completes the game immediately", () => {
  const world = createWorld();
  const { game } = createReadyGame(world);
  world.startGame(game.id);
  const liveGame = world.liveGames.get(game.id);
  liveGame.inning = 9;
  liveGame.half = "BOTTOM";
  liveGame.homeScore = 3;
  liveGame.awayScore = 3;
  liveGame.boxScore.teams.home.runs = 3;
  liveGame.boxScore.teams.away.runs = 3;
  liveGame.currentBatterId = [...world.gameRosters.values()].find((roster) => roster.teamId === "team_seoul").startingLineup[0].playerId;
  liveGame.currentPitcherId = [...world.gameRosters.values()].find((roster) => roster.teamId === "team_busan").startingPitcherId;
  world.applyPlateAppearanceResult(game.id, "HOME_RUN");

  assert.equal(world.liveGames.get(game.id).status, "COMPLETED");
  assert.deepEqual(world.games.get(game.id).result, { homeScore: 4, awayScore: 3 });
});

test("simulated game completes with box score, player lines, play-by-play, and standings", () => {
  const world = createWorld(515);
  const { game } = createReadyGame(world);

  const liveGame = world.simulateGame(game.id);
  const boxScore = world.boxScores.get(game.id);
  const standings = world.getStandings(game.seasonId);

  assert.equal(liveGame.status, "COMPLETED");
  assert.equal(world.games.get(game.id).status, "COMPLETED");
  assert.deepEqual(world.games.get(game.id).result, {
    homeScore: boxScore.teams.home.runs,
    awayScore: boxScore.teams.away.runs,
  });
  assert.ok(Object.values(boxScore.batters).some((line) => line.plateAppearances > 0));
  assert.ok(Object.values(boxScore.pitchers).some((line) => line.battersFaced > 0));
  assert.ok(liveGame.playByPlay.length > 0);
  assert.equal(standings.reduce((sum, record) => sum + record.gamesPlayed, 0), 2);
  assert.equal(world.events.at(-1).type, "GAME_COMPLETED");
});

test("completed games cannot be restarted", () => {
  const world = createWorld();
  const { game } = createReadyGame(world);
  world.simulateGame(game.id);

  assert.throws(() => world.startGame(game.id), /Completed game cannot be started/);
});

test("live game invariants catch invalid local mutations", () => {
  const world = createWorld();
  const { game, awayPlayers } = createReadyGame(world);
  world.startGame(game.id);
  const liveGame = world.liveGames.get(game.id);
  liveGame.outs = 4;
  liveGame.bases.first = awayPlayers[0];
  liveGame.bases.second = awayPlayers[0];
  liveGame.currentBatterId = awayPlayers[0];
  liveGame.currentPitcherId = awayPlayers[1];
  liveGame.boxScore.teams.away.runs = 99;

  const issues = world.validateInvariants();
  assert.ok(issues.some((issue) => issue.includes("invalid outs")));
  assert.ok(issues.some((issue) => issue.includes("same runner")));
  assert.ok(issues.some((issue) => issue.includes("current batter is already on base")));
  assert.ok(issues.some((issue) => issue.includes("current pitcher is not on active roster")));
  assert.ok(issues.some((issue) => issue.includes("box score runs do not match")));
});

test("completed box score accumulates single-game batting and pitching season stats", () => {
  const world = createWorld();
  const { game, awayPlayers, homePlayers } = createReadyGame(world, {
    league: { regulationInnings: 1, allowExtraInnings: false },
  });

  playOneInningScriptedGame(world, game.id, ["SINGLE", "DOUBLE", "HOME_RUN", "STRIKEOUT", "GROUND_OUT", "FLY_OUT"]);

  const firstBatter = world.getPlayerBattingSeasonStats(awayPlayers[0], game.seasonId)[0];
  const homerBatter = world.getPlayerBattingSeasonStats(awayPlayers[2], game.seasonId)[0];
  const pitcher = world.getPlayerPitchingSeasonStats(homePlayers.at(-1), game.seasonId)[0];

  assert.equal(firstBatter.games, 1);
  assert.equal(firstBatter.plateAppearances, 1);
  assert.equal(firstBatter.atBats, 1);
  assert.equal(firstBatter.hits, 1);
  assert.equal(firstBatter.runs, 1);
  assert.equal(firstBatter.average, 1);
  assert.equal(homerBatter.homeRuns, 1);
  assert.equal(homerBatter.runsBattedIn, 3);
  assert.equal(homerBatter.sluggingPercentage, 4);
  assert.equal(pitcher.games, 1);
  assert.equal(pitcher.gamesStarted, 1);
  assert.equal(pitcher.battersFaced, 6);
  assert.equal(pitcher.outsRecorded, 3);
  assert.equal(pitcher.hits, 3);
  assert.equal(pitcher.earnedRunAverage, 27);
  assert.equal(pitcher.walksHitsPerInningPitched, 3);
});

test("multiple games accumulate and game logs are queryable", () => {
  const world = createWorld();
  const { game, awayPlayers, homePlayers } = createReadyGame(world, {
    league: { regulationInnings: 1, allowExtraInnings: false },
  });
  playOneInningScriptedGame(world, game.id, ["SINGLE", "STRIKEOUT", "GROUND_OUT", "FLY_OUT"]);

  const secondGame = scheduleSameSeasonGame(world, game, "2027-01-02");
  prepareRosterForExistingGame(world, secondGame, "team_seoul", homePlayers);
  prepareRosterForExistingGame(world, secondGame, "team_busan", awayPlayers);
  world.advanceDay({ injuries: false, development: false, playerCareerOptions: () => [], managerCareerOptions: () => [] });
  playOneInningScriptedGame(world, secondGame.id, ["DOUBLE", "STRIKEOUT", "GROUND_OUT", "FLY_OUT"]);

  const total = world.getPlayerBattingSeasonStats(awayPlayers[0], game.seasonId)[0];
  const logs = world.getPlayerGameLogs(awayPlayers[0]);

  assert.equal(total.games, 2);
  assert.equal(total.atBats, 2);
  assert.equal(total.hits, 2);
  assert.equal(total.doubles, 1);
  assert.equal(total.sluggingPercentage, 1.5);
  assert.equal(logs.batting.length, 2);
  assert.deepEqual(logs.batting.map((log) => log.gameId), [game.id, secondGame.id]);
});

test("season transfer keeps team splits and total season stats", () => {
  const world = createWorld();
  const { game, awayPlayers, homePlayers } = createReadyGame(world, {
    league: { regulationInnings: 1, allowExtraInnings: false },
  });
  const playerId = awayPlayers[0];
  playOneInningScriptedGame(world, game.id, ["SINGLE", "STRIKEOUT", "GROUND_OUT", "FLY_OUT"]);

  world.movePlayer(playerId, "team_seoul", "시즌 중 트레이드 테스트");
  world.assignPlayerToRoster(playerId, "team_seoul", "ACTIVE", "이적 후 로스터 등록");
  const secondGame = scheduleSameSeasonGame(world, game, "2027-01-02");
  const newHomePlayers = [playerId, ...homePlayers.filter((id) => id !== playerId)];
  prepareRosterForExistingGame(world, secondGame, "team_seoul", newHomePlayers);
  prepareRosterForExistingGame(world, secondGame, "team_busan", awayPlayers.filter((id) => id !== playerId));
  world.advanceDay({ injuries: false, development: false, playerCareerOptions: () => [], managerCareerOptions: () => [] });
  playOneInningScriptedGame(world, secondGame.id, ["GROUND_OUT", "FLY_OUT", "LINE_OUT"], ["DOUBLE", "GROUND_OUT", "FLY_OUT", "LINE_OUT"]);

  const stats = world.getPlayerBattingSeasonStats(playerId, game.seasonId);
  const total = stats.find((line) => line.split === "TOTAL");
  const splits = stats.filter((line) => line.split === "TEAM");

  assert.equal(total.games, 2);
  assert.equal(total.hits, 2);
  assert.deepEqual(splits.map((line) => [line.teamId, line.hits]).sort(), [["team_busan", 1], ["team_seoul", 1]]);
});

test("new seasons keep player stats separate while career totals combine them", () => {
  const world = createWorld();
  const { game, awayPlayers, homePlayers } = createReadyGame(world, {
    league: { regulationInnings: 1, allowExtraInnings: false },
  });
  const playerId = awayPlayers[0];
  playOneInningScriptedGame(world, game.id, ["SINGLE", "GROUND_OUT", "FLY_OUT", "LINE_OUT"]);

  const season2 = world.createSeason({
    id: "season_lineup_2028-01-01",
    leagueId: "league_kr1",
    year: 2028,
    name: "Lineup Test 2028",
    startDate: "2028-01-01",
    regularSeasonEndDate: "2028-10-01",
    allowDraws: true,
  });
  const competition2 = world.createCompetition({
    id: "competition_lineup_2028-01-01",
    seasonId: season2.id,
    leagueId: season2.leagueId,
    name: "Lineup Competition 2028",
    type: "REGULAR_SEASON",
    startDate: season2.startDate,
    endDate: season2.regularSeasonEndDate,
    participatingTeamIds: ["team_seoul", "team_busan"],
  });
  const game2 = world.scheduleGame({
    seasonId: season2.id,
    competitionId: competition2.id,
    homeTeamId: "team_seoul",
    awayTeamId: "team_busan",
    scheduledDate: "2028-01-01",
  });
  prepareRosterForExistingGame(world, game2, "team_seoul", homePlayers);
  prepareRosterForExistingGame(world, game2, "team_busan", awayPlayers);
  world.advanceDays(365, { injuries: false, development: false, playerCareerOptions: () => [], managerCareerOptions: () => [] });
  playOneInningScriptedGame(world, game2.id, ["HOME_RUN", "GROUND_OUT", "FLY_OUT", "LINE_OUT"]);

  assert.equal(world.getPlayerBattingSeasonStats(playerId, game.seasonId)[0].homeRuns, 0);
  assert.equal(world.getPlayerBattingSeasonStats(playerId, season2.id)[0].homeRuns, 1);
  assert.equal(world.getPlayerCareerStats(playerId).batting.hits, 2);
  assert.equal(world.getPlayerCareerStats(playerId, { leagueId: "league_kr1" }).batting.homeRuns, 1);
});

test("leaderboards sort batting and pitching categories with qualifications and stable ties", () => {
  const world = createWorld();
  const { game, awayPlayers, homePlayers } = createReadyGame(world, {
    league: {
      regulationInnings: 1,
      allowExtraInnings: false,
      battingQualificationPlateAppearances: 2,
      pitchingQualificationOuts: 3,
    },
  });
  playOneInningScriptedGame(world, game.id, ["HOME_RUN", "HOME_RUN", "SINGLE", "STRIKEOUT", "GROUND_OUT", "FLY_OUT"]);

  const hrLeaders = world.getBattingLeaders(game.seasonId, "HR");
  const qualifiedAvgLeaders = world.getBattingLeaders(game.seasonId, "AVG", { qualifiedOnly: true });
  const eraLeaders = world.getPitchingLeaders(game.seasonId, "ERA", { qualifiedOnly: true });
  const strikeoutLeaders = world.getPitchingLeaders(game.seasonId, "SO");

  assert.deepEqual(hrLeaders.slice(0, 2).map((entry) => entry.playerId), [awayPlayers[1], awayPlayers[0]]);
  assert.deepEqual(qualifiedAvgLeaders, []);
  assert.equal(eraLeaders.at(-1).playerId, homePlayers.at(-1));
  assert.equal(strikeoutLeaders[0].stats.strikeouts, 1);
});

test("manual score completion without a box score does not create player stats", () => {
  const world = createWorld();
  const { season, competition } = createRegularSeason(world);
  const game = world.scheduleGame({
    seasonId: season.id,
    competitionId: competition.id,
    homeTeamId: "team_seoul",
    awayTeamId: "team_busan",
    scheduledDate: "2027-04-06",
  });

  world.completeGame(game.id, { homeScore: 4, awayScore: 2 });

  assert.equal(world.battingSeasonStats.size, 0);
  assert.equal(world.pitchingSeasonStats.size, 0);
  assert.equal(world.getStandings(season.id).reduce((sum, record) => sum + record.gamesPlayed, 0), 2);
});

test("completed game cannot be accumulated twice", () => {
  const world = createWorld();
  const { game } = createReadyGame(world, {
    league: { regulationInnings: 1, allowExtraInnings: false },
  });
  world.simulateGame(game.id);

  assert.equal(world.accumulatedGameIds.has(game.id), true);
  assert.throws(() => world.completeGame(game.id, { homeScore: 99, awayScore: 1 }), /already completed/);
});

test("milestone events are recorded for first hit, first homer, and first win", () => {
  const world = createWorld();
  const { game, awayPlayers, homePlayers } = createReadyGame(world, {
    league: { regulationInnings: 1, allowExtraInnings: false },
  });
  playOneInningScriptedGame(world, game.id, ["HOME_RUN", "GROUND_OUT", "FLY_OUT", "LINE_OUT"]);

  const milestones = world.events.filter((event) => event.type === "PLAYER_MILESTONE");
  assert.ok(milestones.some((event) => event.subjectId === awayPlayers[0] && event.reason === "프로 첫 안타"));
  assert.ok(milestones.some((event) => event.subjectId === awayPlayers[0] && event.reason === "프로 첫 홈런"));
  assert.ok(milestones.some((event) => event.subjectId === awayPlayers[0] && event.reason === "시즌 10홈런") === false);
  assert.ok(milestones.some((event) => event.subjectId === awayPlayers[0] && event.reason === "통산 100안타") === false);
  assert.ok(milestones.some((event) => event.subjectId === awayPlayers.at(-1)) || milestones.some((event) => event.subjectId === homePlayers.at(-1)));
});

test("season stats invariants catch invalid local mutations", () => {
  const world = createWorld();
  const { game, awayPlayers } = createReadyGame(world, {
    league: { regulationInnings: 1, allowExtraInnings: false },
  });
  playOneInningScriptedGame(world, game.id, ["SINGLE", "GROUND_OUT", "FLY_OUT", "LINE_OUT"]);
  const total = world.getPlayerBattingSeasonStats(awayPlayers[0], game.seasonId)[0];
  world.battingSeasonStats.get(`${game.seasonId}:${awayPlayers[0]}:TOTAL:TOTAL`).hits = 10;
  world.battingSeasonStats.get(`${game.seasonId}:${awayPlayers[0]}:TOTAL:TOTAL`).average = 99;

  const issues = world.validateInvariants();
  assert.ok(issues.some((issue) => issue.includes("H > AB")));
  assert.ok(issues.some((issue) => issue.includes("derived rates are stale")));
  assert.ok(issues.some((issue) => issue.includes("TOTAL hits does not match team splits")));
  assert.equal(total.hits, 1);
});

test("manager can replace a pitcher and pitcher lines stay separate", () => {
  const world = createWorld();
  const { game, homePlayers } = createReadyGame(world);
  world.startGame(game.id);
  const starter = homePlayers.at(-1);
  const reliever = homePlayers.at(-2);

  world.applyPlateAppearanceResult(game.id, "SINGLE");
  const action = world.replacePitcher(game.id, "team_seoul", reliever, { managerId: "mgr_home", reason: "불펜 투입" });
  world.applyPlateAppearanceResult(game.id, "STRIKEOUT");

  const liveGame = world.liveGames.get(game.id);
  assert.equal(action.type, "PITCHING_CHANGE");
  assert.equal(liveGame.currentPitcherId, reliever);
  assert.equal(liveGame.boxScore.pitchers[starter].battersFaced, 1);
  assert.equal(liveGame.boxScore.pitchers[reliever].battersFaced, 1);
  assert.ok(liveGame.removedPlayerIds.includes(starter));
});

test("pinch hitter keeps batting order slot", () => {
  const world = createWorld();
  const { game, awayPlayers } = createReadyGame(world);
  world.startGame(game.id);
  const oldBatter = awayPlayers[0];
  const pinchHitter = awayPlayers.at(-2);

  const action = world.usePinchHitter(game.id, "team_busan", pinchHitter, { defensivePosition: "LF" });
  world.applyPlateAppearanceResult(game.id, "SINGLE");

  const roster = [...world.gameRosters.values()].find((candidate) => candidate.gameId === game.id && candidate.teamId === "team_busan");
  const firstSlot = roster.startingLineup.find((slot) => slot.battingOrder === 1);
  assert.equal(action.type, "PINCH_HITTER");
  assert.equal(firstSlot.playerId, pinchHitter);
  assert.equal(firstSlot.battingOrder, 1);
  assert.equal(world.liveGames.get(game.id).boxScore.batters[pinchHitter].hits, 1);
  assert.ok(world.liveGames.get(game.id).removedPlayerIds.includes(oldBatter));
});

test("pinch runner takes over the base and owns the later run", () => {
  const world = createWorld();
  const { game, awayPlayers } = createReadyGame(world);
  world.startGame(game.id);
  world.applyPlateAppearanceResult(game.id, "SINGLE");
  const runnerOut = awayPlayers[0];
  const runnerIn = awayPlayers.at(-2);

  const action = world.usePinchRunner(game.id, "team_busan", runnerOut, runnerIn);
  world.applyPlateAppearanceResult(game.id, "HOME_RUN");

  const liveGame = world.liveGames.get(game.id);
  assert.equal(action.type, "PINCH_RUNNER");
  assert.equal(liveGame.boxScore.batters[runnerOut].runs, 0);
  assert.equal(liveGame.boxScore.batters[runnerIn].runs, 1);
  assert.ok(liveGame.removedPlayerIds.includes(runnerOut));
});

test("defensive substitution and position changes update current defense", () => {
  const world = createWorld();
  const { game, homePlayers } = createReadyGame(world);
  world.startGame(game.id);
  const playerOut = homePlayers[0];
  const playerIn = homePlayers.at(-2);

  const sub = world.makeDefensiveSubstitution(game.id, "team_seoul", playerOut, playerIn, "RF");
  const move = world.changeDefensivePosition(game.id, "team_seoul", playerIn, "LF");

  const defense = world.liveGames.get(game.id).currentDefense.team_seoul;
  assert.equal(sub.type, "DEFENSIVE_SUBSTITUTION");
  assert.equal(move.type, "POSITION_CHANGE");
  assert.ok(defense.some((slot) => slot.playerId === playerIn && slot.defensivePosition === "LF"));
  assert.ok(world.liveGames.get(game.id).removedPlayerIds.includes(playerOut));
});

test("substitution rejects re-entry, other-team players, and non-bullpen pitchers", () => {
  const world = createWorld();
  const { game, homePlayers, awayPlayers } = createReadyGame(world);
  world.startGame(game.id);
  const oldBatter = awayPlayers[0];
  const bench = awayPlayers.at(-2);
  world.usePinchHitter(game.id, "team_busan", bench);

  assert.throws(() => world.usePinchHitter(game.id, "team_busan", oldBatter), /not on the bench|already left/);
  assert.throws(() => world.usePinchHitter(game.id, "team_busan", homePlayers[0]), /not on team/);
  assert.throws(() => world.replacePitcher(game.id, "team_seoul", homePlayers[0]), /not in the bullpen/);
});

test("game play adds fatigue and advanceDay recovers it", () => {
  const world = createWorld();
  const { game, homePlayers, awayPlayers } = createReadyGame(world);
  world.startGame(game.id);
  const pitcher = homePlayers.at(-1);
  const batter = awayPlayers[0];

  world.applyPlateAppearanceResult(game.id, "HOME_RUN");
  const pitcherFatigue = world.players.get(pitcher).gameCondition.fatigue;
  const batterFatigue = world.players.get(batter).gameCondition.fatigue;
  world.advanceDay({ injuries: false, development: false, playerCareerOptions: () => [], managerCareerOptions: () => [] });

  assert.ok(pitcherFatigue > 0);
  assert.ok(batterFatigue > 0);
  assert.ok(world.players.get(pitcher).gameCondition.fatigue < pitcherFatigue);
});

function createAiBullpenGame(seed, scoreState) {
  const world = createWorld(seed);
  const game = createScheduledGame(world);
  const homePlayers = seedTeamPlayers(world, "team_seoul", `ai_home_${seed}`, lineupPositionsWithDh, 4);
  const awayPlayers = seedTeamPlayers(world, "team_busan", `ai_away_${seed}`, lineupPositionsWithDh, 2);
  const homeBench = homePlayers.slice(9);
  const awayBench = awayPlayers.slice(9);
  world.createGameRoster({
    gameId: game.id,
    teamId: "team_seoul",
    activePlayerIds: homePlayers,
    startingLineup: lineupFrom(homePlayers, lineupPositionsWithDh),
    startingPitcherId: homePlayers.at(-1),
    benchPlayerIds: homeBench,
    bullpenPlayerIds: homeBench.slice(0, -1),
    rules: { maxActivePlayers: 26, battingOrderSize: 9, usesDH: true },
  });
  world.createGameRoster({
    gameId: game.id,
    teamId: "team_busan",
    activePlayerIds: awayPlayers,
    startingLineup: lineupFrom(awayPlayers, lineupPositionsWithDh),
    startingPitcherId: awayPlayers.at(-1),
    benchPlayerIds: awayBench,
    bullpenPlayerIds: awayBench.slice(0, -1),
    rules: { maxActivePlayers: 26, battingOrderSize: 9, usesDH: true },
  });
  const [longRelief, setup, closer] = homeBench;
  world.assignBullpenRole("team_seoul", longRelief, ["LONG_RELIEF"]);
  world.assignBullpenRole("team_seoul", setup, ["SETUP"]);
  world.assignBullpenRole("team_seoul", closer, ["CLOSER"]);
  world.startGame(game.id);
  const liveGame = world.liveGames.get(game.id);
  liveGame.inning = scoreState.inning;
  liveGame.half = "TOP";
  liveGame.homeScore = scoreState.homeScore;
  liveGame.awayScore = scoreState.awayScore;
  liveGame.boxScore.teams.home.runs = scoreState.homeScore;
  liveGame.boxScore.teams.away.runs = scoreState.awayScore;
  world.players.get(liveGame.currentPitcherId).gameCondition.fatigue = 90;
  return { world, game, longRelief, setup, closer };
}

test("manager AI selects closer, setup, and long relief by game context", () => {
  const close = createAiBullpenGame(701, { inning: 9, homeScore: 4, awayScore: 2 });
  const closeAction = close.world.runManagerAi(close.game.id, "team_seoul");
  assert.equal(closeAction.playerInId, close.closer);

  const setup = createAiBullpenGame(702, { inning: 7, homeScore: 3, awayScore: 3 });
  const setupAction = setup.world.runManagerAi(setup.game.id, "team_seoul");
  assert.equal(setupAction.playerInId, setup.setup);

  const early = createAiBullpenGame(703, { inning: 3, homeScore: 1, awayScore: 4 });
  const earlyAction = early.world.runManagerAi(early.game.id, "team_seoul");
  assert.equal(earlyAction.playerInId, early.longRelief);
});

test("manager AI avoids closer in a blowout and is deterministic with the same seed", () => {
  function run(seed) {
    const { world, game, closer } = createAiBullpenGame(seed, { inning: 9, homeScore: 10, awayScore: 1 });
    const action = world.runManagerAi(game.id, "team_seoul");
    return { action, closer };
  }

  const first = run(808);
  assert.notEqual(first.action.playerInId, first.closer);
  assert.deepEqual(first, run(808));
});

test("game action history records manager interventions", () => {
  const world = createWorld();
  const { game, homePlayers, awayPlayers } = createReadyGame(world);
  world.startGame(game.id);
  world.warmUpPitcher(game.id, "team_seoul", homePlayers.at(-2), "mgr_home");
  world.usePinchHitter(game.id, "team_busan", awayPlayers.at(-2), { managerId: "mgr_away" });
  world.applyPlateAppearanceResult(game.id, "SINGLE");
  world.usePinchRunner(game.id, "team_busan", awayPlayers.at(-2), awayPlayers.at(-1), { managerId: "mgr_away" });

  const history = world.liveGames.get(game.id).actionHistory;
  assert.deepEqual(history.map((action) => action.type), ["PITCHING_CHANGE", "PINCH_HITTER", "PINCH_RUNNER"]);
  assert.equal(history[0].metadata.warmUpOnly, true);
});

test("substitution invariants catch invalid local mutations", () => {
  const world = createWorld();
  const { game, awayPlayers } = createReadyGame(world);
  world.startGame(game.id);
  const liveGame = world.liveGames.get(game.id);
  liveGame.removedPlayerIds.push(awayPlayers[0]);
  liveGame.currentDefense.team_busan[1].playerId = liveGame.currentDefense.team_busan[0].playerId;
  liveGame.strategies.team_busan.bullpenAggression = 200;

  const issues = world.validateInvariants();
  assert.ok(issues.some((issue) => issue.includes("removed player")));
  assert.ok(issues.some((issue) => issue.includes("multiple defensive positions")));
  assert.ok(issues.some((issue) => issue.includes("strategy bullpenAggression")));
});

function addScout(world, id, organizationId, grade) {
  return world.addScout({
    id,
    name: `${id} Scout`,
    organizationId,
    abilityEvaluation: grade,
    potentialEvaluation: grade,
    regionalKnowledge: grade,
    experience: grade,
  });
}

function addDraftProspect(world, id, overrides = {}) {
  world.addPlayer(createPlayer({
    id,
    name: `${id} Prospect`,
    status: "AMATEUR",
    birthDate: "2009-03-01",
    currentAbility: 42,
    potentialAbility: 78,
    trueCurrentAbility: overrides.trueCurrentAbility ?? overrides.currentAbility ?? 42,
    truePotentialAbility: overrides.truePotentialAbility ?? overrides.potentialAbility ?? 78,
    ...overrides,
  }));
  return world.players.get(id);
}

function declareForDraft(world, playerId, leagueId = "league_kr1", year = 2027) {
  const eligibility = world.evaluateDraftEligibility(playerId, leagueId, year);
  world.players.get(playerId).draftEligibility = {
    ...eligibility,
    declared: true,
    status: "DECLARED",
    decision: "DECLARE",
    reason: "테스트 드래프트 참가 선언",
  };
}

function createDraftSeason(world) {
  const { season, competition } = createRegularSeason(world, {
    id: "season_draft_2027",
    name: "2027 Draft Season",
  });
  return { season, competition };
}

test("scout quality changes estimate accuracy while true and estimated ability stay separate", () => {
  const world = createWorld(9101);
  addDraftProspect(world, "prospect_accuracy", {
    trueCurrentAbility: 58,
    truePotentialAbility: 92,
    currentAbility: 40,
    potentialAbility: 70,
  });
  const low = addScout(world, "scout_low", "org_seoul", 10);
  const high = addScout(world, "scout_high", "org_busan", 95);

  const lowReport = world.createScoutingReport(low.id, "prospect_accuracy");
  const highReport = world.createScoutingReport(high.id, "prospect_accuracy");
  const player = world.players.get("prospect_accuracy");
  const lowError = Math.abs(lowReport.estimatedCA - player.trueCurrentAbility);
  const highError = Math.abs(highReport.estimatedCA - player.trueCurrentAbility);
  const highMid = (highReport.estimatedPARange.low + highReport.estimatedPARange.high) / 2;

  assert.ok(highError <= lowError);
  assert.notEqual(highMid, player.truePotentialAbility);
  assert.equal("truePotentialAbility" in highReport, false);
});

test("repeated scouting increases confidence and narrows potential range", () => {
  const world = createWorld(9102);
  addDraftProspect(world, "prospect_repeat", { truePotentialAbility: 55 });
  const scout = addScout(world, "scout_repeat", "org_seoul", 70);

  const first = world.createScoutingReport(scout.id, "prospect_repeat");
  const second = world.createScoutingReport(scout.id, "prospect_repeat");
  const width = (report) => report.estimatedPARange.high - report.estimatedPARange.low;

  assert.ok(second.confidence > first.confidence);
  assert.ok(width(second) < width(first));
});

test("scouting and AI draft decisions are reproducible with the same seed", () => {
  function run(seed) {
    const world = createWorld(seed);
    const { season } = createDraftSeason(world);
    addScout(world, "scout_seed", "org_seoul", 72);
    for (const id of ["seed_a", "seed_b", "seed_c"]) {
      addDraftProspect(world, id, { truePotentialAbility: id === "seed_b" ? 90 : 70 });
      declareForDraft(world, id);
      world.createScoutingReport("scout_seed", id);
    }
    const draft = world.createDraft({
      id: "draft_seed",
      leagueId: "league_kr1",
      seasonId: season.id,
      year: 2027,
      rounds: 1,
      draftOrder: ["org_seoul", "org_busan"],
    });
    const pick = world.autoDraftPick(draft.id, "org_seoul");
    return {
      reports: [...world.scoutingReports.values()],
      pick,
    };
  }

  assert.deepEqual(run(9103), run(9103));
});

test("prospect rankings use scouting view and support position filters", () => {
  const world = createWorld(9104);
  addScout(world, "scout_rank", "org_seoul", 75);
  addDraftProspect(world, "rank_ss", { primaryPosition: "SS", truePotentialAbility: 86 });
  addDraftProspect(world, "rank_c", { primaryPosition: "C", truePotentialAbility: 78 });
  addDraftProspect(world, "rank_p", { primaryPosition: "P", truePotentialAbility: 90 });
  for (const id of ["rank_ss", "rank_c", "rank_p"]) {
    declareForDraft(world, id);
    world.createScoutingReport("scout_rank", id);
  }

  const all = world.getProspectRankings({ organizationId: "org_seoul", limit: 3 });
  const catchers = world.getProspectRankings({ organizationId: "org_seoul", positions: ["C"] });

  assert.deepEqual(all.map((entry) => entry.rank), [1, 2, 3]);
  assert.equal(catchers.length, 1);
  assert.equal(catchers[0].playerId, "rank_c");
});

test("draft eligibility and declaration can branch away from automatic entry", () => {
  const world = createWorld(1);
  addDraftProspect(world, "eligible_player", { birthDate: "2009-03-01" });
  addDraftProspect(world, "too_young_player", { birthDate: "2015-03-01" });
  addDraftProspect(world, "declaration_star", {
    birthDate: "2007-01-01",
    trueCurrentAbility: 80,
    truePotentialAbility: 95,
  });

  const eligible = world.evaluateDraftEligibility("eligible_player", "league_kr1", 2027);
  const tooYoung = world.evaluateDraftEligibility("too_young_player", "league_kr1", 2027);
  const decision = world.decideDraftDeclaration("eligible_player", "league_kr1", 2027);
  const declared = world.decideDraftDeclaration("declaration_star", "league_kr1", 2027);

  assert.equal(eligible.eligible, true);
  assert.equal(tooYoung.eligible, false);
  assert.equal(typeof decision.declared, "boolean");
  assert.ok(["DECLARE", "STAY_SCHOOL", "GO_ABROAD", "INDEPENDENT", "STOP_PLAYING"].includes(decision.decision));
  assert.equal(declared.status, "DECLARED");
  assert.ok(world.events.some((event) => event.type === "DRAFT_DECLARED" && event.subjectId === "declaration_star"));
});

test("draft order defaults to reverse standings", () => {
  const world = createWorld();
  const { season, competition } = createDraftSeason(world);
  world.scheduleGame({
    id: "draft_order_game",
    seasonId: season.id,
    competitionId: competition.id,
    homeTeamId: "team_seoul",
    awayTeamId: "team_busan",
    scheduledDate: "2027-01-03",
  });
  world.completeGame("draft_order_game", { homeScore: 8, awayScore: 1 });

  const draft = world.createDraft({
    id: "draft_reverse",
    leagueId: "league_kr1",
    seasonId: season.id,
    year: 2027,
    rounds: 1,
  });

  assert.deepEqual(draft.draftOrder, ["org_busan", "org_seoul"]);
});

test("manual and AI draft picks support multiple rounds and block duplicate selections", () => {
  const world = createWorld(9106);
  const { season } = createDraftSeason(world);
  addScout(world, "scout_manual", "org_seoul", 85);
  addScout(world, "scout_ai", "org_busan", 65);
  for (const [id, pa] of [["draft_a", 88], ["draft_b", 82], ["draft_c", 72]]) {
    addDraftProspect(world, id, { truePotentialAbility: pa });
    declareForDraft(world, id);
    world.createScoutingReport("scout_manual", id);
    world.createScoutingReport("scout_ai", id);
  }
  const draft = world.createDraft({
    id: "draft_multi",
    leagueId: "league_kr1",
    seasonId: season.id,
    year: 2027,
    rounds: 2,
    draftOrder: ["org_seoul", "org_busan"],
  });

  const manual = world.makeDraftPick(draft.id, "org_seoul", "draft_a");
  assert.equal(manual.round, 1);
  assert.throws(() => world.makeDraftPick(draft.id, "org_busan", "draft_a"), /already selected/);
  const ai = world.autoDraftPick(draft.id, "org_busan");
  assert.equal(ai.round, 1);
  assert.equal(world.drafts.get(draft.id).picks.length, 4);
});

test("runDraft marks drafted and undrafted players without signing contracts", () => {
  const world = createWorld(9107);
  const { season } = createDraftSeason(world);
  addScout(world, "scout_run", "org_seoul", 80);
  for (const id of ["run_a", "run_b", "run_c"]) {
    addDraftProspect(world, id, { truePotentialAbility: id === "run_a" ? 92 : 60 });
    declareForDraft(world, id);
    world.createScoutingReport("scout_run", id);
  }
  const draft = world.createDraft({
    id: "draft_run",
    leagueId: "league_kr1",
    seasonId: season.id,
    year: 2027,
    rounds: 1,
    draftOrder: ["org_seoul", "org_busan"],
  });

  const completed = world.runDraft(draft.id);
  const draftedIds = completed.picks.flatMap((pick) => pick.playerId ? [pick.playerId] : []);
  const undrafted = ["run_a", "run_b", "run_c"].find((id) => !draftedIds.includes(id));

  assert.equal(completed.status, "COMPLETED");
  assert.equal(draftedIds.length, 2);
  assert.equal(world.players.get(draftedIds[0]).draftEligibility.status, "DRAFTED");
  assert.equal(world.players.get(undrafted).draftEligibility.status, "UNDRAFTED");
  assert.equal(world.players.get(draftedIds[0]).contracts.length, 0);
  assert.ok(world.players.get(draftedIds[0]).careerEntries.some((entry) => entry.status === "DRAFTED" && entry.endDate));
  assert.ok(world.events.some((event) => event.type === "PLAYER_DRAFTED"));
  assert.ok(world.events.some((event) => event.type === "PLAYER_UNDRAFTED"));
});

test("draft commands reject ineligible players, missing organizations, and completed drafts", () => {
  const world = createWorld();
  const { season } = createDraftSeason(world);
  addDraftProspect(world, "draft_invalid");
  const draft = world.createDraft({
    id: "draft_invalid",
    leagueId: "league_kr1",
    seasonId: season.id,
    year: 2027,
    rounds: 1,
    draftOrder: ["org_seoul"],
  });

  assert.throws(() => world.makeDraftPick(draft.id, "org_seoul", "draft_invalid"), /not eligible/);
  declareForDraft(world, "draft_invalid");
  assert.throws(() => world.makeDraftPick(draft.id, "org_missing", "draft_invalid"), /Organization not found/);
  world.runDraft(draft.id);
  assert.throws(() => world.makeDraftPick(draft.id, "org_seoul", "draft_invalid"), /Completed draft/);
});

test("scouting and draft invariants catch corrupted local state", () => {
  const world = createWorld();
  const { season } = createDraftSeason(world);
  addDraftProspect(world, "bad_report_player");
  declareForDraft(world, "bad_report_player");
  addScout(world, "bad_scout", "org_seoul", 50);
  const report = world.createScoutingReport("bad_scout", "bad_report_player");
  const draft = world.createDraft({
    id: "bad_draft",
    leagueId: "league_kr1",
    seasonId: season.id,
    year: 2027,
    rounds: 1,
    draftOrder: ["org_seoul"],
  });
  world.scoutingReports.get(report.id).estimatedPARange.low = 90;
  world.scoutingReports.get(report.id).estimatedPARange.high = 40;
  world.drafts.get(draft.id).picks[0].overallPick = 2;
  world.drafts.get(draft.id).picks[0].playerId = "missing_player";

  const issues = world.validateInvariants();
  assert.ok(issues.some((issue) => issue.includes("estimated PA range is inverted")));
  assert.ok(issues.some((issue) => issue.includes("overallPick is inconsistent")));
  assert.ok(issues.some((issue) => issue.includes("missing player")));
});

function signPlayerToOrganization(world, playerId, organizationId, teamId) {
  world.registerContract({
    playerId,
    organizationId,
    startDate: "2027-01-01",
    endDate: "2029-12-31",
    salary: 500000,
    currency: "USD",
    contractStatus: "ACTIVE",
  });
  if (teamId) world.assignPlayerToRoster(playerId, teamId, "ACTIVE", "시장 테스트 로스터 등록");
}

function addMarketPlayer(world, id, organizationId, teamId, overrides = {}) {
  world.addPlayer(createPlayer({
    id,
    name: `${id} Player`,
    status: organizationId ? "PROFESSIONAL" : "FREE_AGENT",
    birthDate: "2003-04-01",
    currentAbility: 55,
    potentialAbility: 70,
    trueCurrentAbility: 55,
    truePotentialAbility: 70,
    freeAgentStatus: organizationId ? undefined : {
      eligible: true,
      becameFreeAgentOn: "2027-01-01",
      type: "RELEASED",
    },
    ...overrides,
  }));
  if (organizationId) signPlayerToOrganization(world, id, organizationId, teamId);
  return world.players.get(id);
}

function makeBasicOffer(world, playerId, organizationId, overrides = {}) {
  return world.makeContractOffer({
    playerId,
    organizationId,
    salary: 900000,
    currency: "USD",
    startDate: "2027-01-01",
    endDate: "2029-12-31",
    ...overrides,
  });
}

test("drafted players can sign or fail a post-draft contract without automatic roster assignment", () => {
  const world = createWorld(9201);
  const { season } = createDraftSeason(world);
  addDraftProspect(world, "draft_sign", { truePotentialAbility: 88 });
  addDraftProspect(world, "draft_fail", { truePotentialAbility: 70 });
  declareForDraft(world, "draft_sign");
  declareForDraft(world, "draft_fail");
  const draft = world.createDraft({
    id: "draft_contracts",
    leagueId: "league_kr1",
    seasonId: season.id,
    year: 2027,
    rounds: 2,
    draftOrder: ["org_seoul"],
  });
  world.makeDraftPick(draft.id, "org_seoul", "draft_sign");
  world.makeDraftPick(draft.id, "org_seoul", "draft_fail");

  const acceptedOffer = makeBasicOffer(world, "draft_sign", "org_seoul", { draftId: draft.id });
  const contract = world.acceptContractOffer(acceptedOffer.id);
  const rejectedOffer = makeBasicOffer(world, "draft_fail", "org_seoul", { draftId: draft.id, salary: 10000 });
  world.rejectContractOffer(rejectedOffer.id, "계약금 이견");

  assert.equal(contract.organizationId, "org_seoul");
  assert.equal(world.players.get("draft_sign").draftEligibility.status, "SIGNED");
  assert.equal(world.players.get("draft_sign").currentTeamId, undefined);
  assert.equal(world.players.get("draft_fail").draftEligibility.status, "UNSIGNED_DRAFTEE");
});

test("free agents can receive multiple offers and choose non-highest money based on preferences", () => {
  const world = createWorld(9202);
  addMarketPlayer(world, "fa_choice");
  world.setPlayerContractDemand("fa_choice", {
    desiredSalary: 1000000,
    desiredYears: 2,
    minimumSalary: 500000,
    minimumYears: 1,
    preferredRole: "SS",
    preferredCountryIds: ["country_kr"],
  });
  const domestic = makeBasicOffer(world, "fa_choice", "org_seoul", {
    id: "offer_domestic",
    salary: 900000,
    preferredRole: "SS",
  });
  const overseas = makeBasicOffer(world, "fa_choice", "org_harbor", {
    id: "offer_overseas",
    salary: 950000,
    preferredRole: "BENCH",
  });

  const chosen = world.chooseBestContractOffer("fa_choice");
  world.acceptContractOffer(chosen.offerId);

  assert.equal(chosen.offerId, domestic.id);
  assert.equal(world.contractOffers.get(overseas.id).status, "REJECTED");
  assert.equal(world.players.get("fa_choice").currentOrganizationId, "org_seoul");
  assert.ok(world.events.some((event) => event.type === "CONTRACT_OFFERED"));
  assert.ok(world.events.some((event) => event.type === "PLAYER_SIGNED"));
});

test("contract expiry and player release create free agency state and events", () => {
  const world = createWorld();
  addMarketPlayer(world, "expire_player", "org_seoul", "team_seoul", {
    currentAbility: 45,
    potentialAbility: 50,
  });
  world.players.get("expire_player").contracts[0].startDate = "2026-01-01";
  world.players.get("expire_player").contracts[0].endDate = "2026-12-31";
  world.expireContracts("2027-01-01");

  assert.equal(world.players.get("expire_player").status, "FREE_AGENT");
  assert.equal(world.players.get("expire_player").freeAgentStatus.type, "CONTRACT_EXPIRED");

  addMarketPlayer(world, "release_market", "org_busan", "team_busan");
  world.releasePlayer("release_market", "전력 외 방출");
  assert.equal(world.players.get("release_market").contracts[0].contractStatus, "TERMINATED");
  assert.equal(world.players.get("release_market").freeAgentStatus.type, "RELEASED");
  assert.ok(world.events.filter((event) => event.type === "PLAYER_BECAME_FREE_AGENT").length >= 2);
});

test("trades support one-for-one, multi-player structures, AI rejection and counter", () => {
  const world = createWorld(9203);
  addMarketPlayer(world, "seoul_star", "org_seoul", "team_seoul", { currentAbility: 82, potentialAbility: 84 });
  addMarketPlayer(world, "seoul_depth", "org_seoul", "team_seoul_futures", { currentAbility: 48, potentialAbility: 55 });
  addMarketPlayer(world, "busan_star", "org_busan", "team_busan", { currentAbility: 80, potentialAbility: 82 });
  addMarketPlayer(world, "busan_depth", "org_busan", "team_busan", { currentAbility: 42, potentialAbility: 52 });

  const fair = world.proposeTrade({
    id: "trade_fair",
    proposerOrganizationId: "org_seoul",
    targetOrganizationId: "org_busan",
    playersFromProposer: ["seoul_star"],
    playersFromTarget: ["busan_star"],
  });
  assert.equal(world.evaluateTradeProposal(fair.id).decision, "ACCEPT");
  world.finalizeTrade(fair.id);
  assert.equal(world.players.get("seoul_star").currentOrganizationId, "org_busan");
  assert.equal(world.players.get("seoul_star").currentTeamId, undefined);
  assert.equal(world.players.get("seoul_star").contracts.at(-1).organizationId, "org_busan");

  const bad = world.proposeTrade({
    id: "trade_bad",
    proposerOrganizationId: "org_seoul",
    targetOrganizationId: "org_busan",
    playersFromProposer: ["seoul_depth"],
    playersFromTarget: ["seoul_star", "busan_depth"],
  });
  const evaluation = world.evaluateTradeProposal(bad.id, "org_busan");
  assert.ok(["REJECT", "COUNTER"].includes(evaluation.decision));
  if (evaluation.decision === "COUNTER") assert.equal(evaluation.counterProposal.status, "COUNTERED");
  assert.throws(() => world.proposeTrade({
    proposerOrganizationId: "org_seoul",
    targetOrganizationId: "org_busan",
    playersFromProposer: ["seoul_depth"],
    playersFromTarget: ["seoul_depth"],
  }), /both sides/);
});

test("posting supports overseas contract success and rejected offers leave the player home", () => {
  const world = createWorld(9204);
  addMarketPlayer(world, "posting_success", "org_seoul", "team_seoul", { currentAbility: 78, potentialAbility: 82 });
  const posting = world.requestPosting({
    id: "posting_success_req",
    playerId: "posting_success",
    currentOrganizationId: "org_seoul",
    sourceLeagueId: "league_kr1",
    targetLeagueIds: ["league_pw1"],
    compensationFee: 500000,
  });
  const offer = makeBasicOffer(world, "posting_success", "org_harbor", {
    postingRequestId: posting.id,
    salary: 1500000,
  });
  world.acceptContractOffer(offer.id);
  assert.equal(world.postingRequests.get(posting.id).status, "COMPLETED");
  assert.equal(world.players.get("posting_success").currentOrganizationId, "org_harbor");

  addMarketPlayer(world, "posting_reject", "org_busan", "team_busan", { currentAbility: 70, potentialAbility: 72 });
  const rejectedPosting = world.requestPosting({
    id: "posting_reject_req",
    playerId: "posting_reject",
    currentOrganizationId: "org_busan",
    sourceLeagueId: "league_kr1",
    targetLeagueIds: ["league_pw1"],
  });
  const rejectedOffer = makeBasicOffer(world, "posting_reject", "org_harbor", {
    postingRequestId: rejectedPosting.id,
    salary: 10000,
  });
  world.rejectContractOffer(rejectedOffer.id, "해외 조건 거절");
  assert.equal(world.postingRequests.get(rejectedPosting.id).status, "FAILED");
  assert.equal(world.players.get("posting_reject").currentOrganizationId, "org_busan");
});

test("market value and negotiations are deterministic with the same seed", () => {
  function run(seed) {
    const world = createWorld(seed);
    addMarketPlayer(world, "market_seed");
    const offer = makeBasicOffer(world, "market_seed", "org_seoul", { salary: 750000 });
    return {
      evaluation: world.evaluateContractOffer(offer.id),
      value: world.calculatePlayerMarketValue("market_seed", "org_seoul"),
    };
  }

  assert.deepEqual(run(9205), run(9205));
});

test("market invariants catch conflicting contracts, trade ownership, and posting contradictions", () => {
  const world = createWorld();
  addMarketPlayer(world, "bad_market", "org_seoul", "team_seoul");
  world.players.get("bad_market").contracts.push({
    id: "bad_contract_extra",
    playerId: "bad_market",
    organizationId: "org_busan",
    startDate: "2027-01-01",
    endDate: "2028-12-31",
    years: 2,
    salary: 1,
    currency: "USD",
    contractStatus: "ACTIVE",
  });
  world.tradeProposals.set("bad_trade", {
    id: "bad_trade",
    proposerOrganizationId: "org_seoul",
    targetOrganizationId: "org_busan",
    playersFromProposer: ["bad_market"],
    playersFromTarget: ["bad_market"],
    cash: 0,
    draftPickIds: [],
    status: "PROPOSED",
    proposedOn: "2027-01-01",
    reason: "bad",
  });
  world.postingRequests.set("bad_posting", {
    id: "bad_posting",
    playerId: "bad_market",
    currentOrganizationId: "org_busan",
    sourceLeagueId: "league_kr1",
    targetLeagueIds: ["league_pw1"],
    requestedOn: "2027-01-01",
    status: "FAILED",
    reason: "bad",
  });

  const issues = world.validateInvariants();
  assert.ok(issues.some((issue) => issue.includes("multiple active contracts")));
  assert.ok(issues.some((issue) => issue.includes("organization does not match player currentOrganizationId")));
  assert.ok(issues.some((issue) => issue.includes("same player on both sides")));
  assert.ok(issues.some((issue) => issue.includes("failed but player left source organization")));
});
