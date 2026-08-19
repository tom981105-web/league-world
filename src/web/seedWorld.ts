import {
  LeagueWorld,
  Mulberry32Random,
  WorldClock,
  type BaseballPosition,
  type BullpenRole,
  type EntityId,
  type ISODate,
  type Player,
} from "../index.js";

export interface SeedWorldResult {
  world: LeagueWorld;
  userManagerId: EntityId;
  userTeamId: EntityId;
  seasonId: EntityId;
  competitionId: EntityId;
  draftId: EntityId;
  seed: number;
}

export interface SeedWorldOptions {
  managerName?: string;
  managerNationalityCode?: string;
  startMode?: "UNEMPLOYED" | "CLUB";
  organizationId?: EntityId;
}

const firstLevelPositions: BaseballPosition[] = ["C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH"];
const pitcherRoles: BullpenRole[] = ["CLOSER", "SETUP", "MIDDLE_RELIEF", "LONG_RELIEF", "FLEXIBLE"];

export const seedOrganizations = [
  { id: "org_seoul", name: "Seoul Falcons", city: "Seoul" },
  { id: "org_busan", name: "Busan Tides", city: "Busan" },
  { id: "org_incheon", name: "Incheon Waves", city: "Incheon" },
  { id: "org_daejeon", name: "Daejeon Sparks", city: "Daejeon" },
] as const;

const organizations = [
  ...seedOrganizations,
  { id: "org_suwon", name: "Suwon Shields", city: "Suwon" },
  { id: "org_gwangju", name: "Gwangju Suns", city: "Gwangju" },
] as const;

const names = [
  "한지완",
  "서민준",
  "강도하",
  "윤태서",
  "박이준",
  "최리안",
  "백선우",
  "문해준",
  "임건우",
  "장율",
  "오시안",
  "신하루",
  "고이안",
  "남도윤",
  "류태인",
  "안지수",
  "주현",
  "하은호",
  "차로한",
  "손예준",
  "김도윤",
  "이서준",
  "박하준",
  "정민재",
  "최강준",
  "오준서",
  "윤시후",
  "임태오",
  "문지호",
  "권우진",
  "홍유찬",
  "배건",
  "조하람",
  "노시온",
  "민준영",
  "서지안",
  "강라온",
  "유하민",
  "신이든",
  "양도겸",
  "백이현",
  "전해솔",
  "심건",
  "차민율",
  "고태겸",
  "남윤재",
  "류은재",
  "안시우",
  "주도현",
  "하태윤",
  "손다온",
  "송재하",
  "황이안",
  "장유준",
  "구연우",
  "나온유",
  "마준",
  "방시윤",
  "설지후",
  "원라율",
  "도현준",
  "표유성",
  "천지율",
  "진하겸",
  "허준휘",
  "기서율",
  "라건우",
  "봉태린",
  "여민성",
  "추이준",
  "탁선재",
  "편이솔",
  "도하진",
  "곽윤호",
  "문서율",
  "연도진",
  "차은결",
  "한로운",
  "서태건",
  "김리우",
  "이찬결",
  "박도겸",
  "정유건",
  "최시안",
  "오하율",
  "윤재윤",
  "임서호",
  "문건율",
  "권이준",
  "홍준휘",
  "배시온",
  "조민율",
  "노라온",
  "민유준",
  "서은호",
  "강태서",
  "유지완",
  "신도하",
  "양이준",
];

export function createSeedWorld(seed = 20270403, options: SeedWorldOptions = {}): SeedWorldResult {
  const world = new LeagueWorld(new WorldClock("2027-04-03"), new Mulberry32Random(seed));
  world.addCountry({ id: "country_kr", code: "KR", name: "Korea Republic" });
  world.addCountry({ id: "country_pw", code: "PW", name: "Pacific West" });
  world.addCountry({ id: "country_jp", code: "JP", name: "Japan Archipelago" });
  world.addLeague({
    id: "league_kr1",
    countryId: "country_kr",
    name: "Korea Premier League",
    level: 1,
    category: "PROFESSIONAL",
    usesDH: true,
    allowDraws: true,
    regulationInnings: 9,
    allowExtraInnings: true,
    maxInnings: 12,
    battingQualificationPlateAppearances: 20,
    pitchingQualificationOuts: 18,
    gameRosterRules: { maxActivePlayers: 26, battingOrderSize: 9, usesDH: true },
  });
  world.addLeague({
    id: "league_kr_futures",
    countryId: "country_kr",
    name: "Korea Futures League",
    level: 2,
    category: "PROFESSIONAL",
    usesDH: true,
  });
  world.addLeague({
    id: "league_pw1",
    countryId: "country_pw",
    name: "Pacific Global League",
    level: 1,
    category: "INTERNATIONAL",
    usesDH: true,
  });
  world.addLeague({
    id: "league_jp1",
    countryId: "country_jp",
    name: "Japan Frontier League",
    level: 1,
    category: "PROFESSIONAL",
    usesDH: true,
  });

  for (const org of organizations) {
    world.addOrganization({ id: org.id, name: `${org.name} Organization`, countryId: "country_kr" });
    world.addTeam({
      id: teamIdFor(org.id, "top"),
      leagueId: "league_kr1",
      organizationId: org.id,
      name: org.name,
      teamType: "CLUB",
      rosterLevel: 1,
      rosterLevelName: "1군",
      isTopLevel: true,
    });
    world.addTeam({
      id: teamIdFor(org.id, "futures"),
      leagueId: "league_kr_futures",
      organizationId: org.id,
      name: `${org.name} Futures`,
      teamType: "CLUB",
      parentTeamId: teamIdFor(org.id, "top"),
      rosterLevel: 2,
      rosterLevelName: "퓨처스",
    });
  }
  world.addOrganization({ id: "org_harbor", name: "Harbor Voyagers Organization", countryId: "country_pw" });
  world.addTeam({
    id: "team_harbor",
    leagueId: "league_pw1",
    organizationId: "org_harbor",
    name: "Harbor Voyagers",
    teamType: "CLUB",
    rosterLevel: 1,
    rosterLevelName: "1군",
    isTopLevel: true,
  });
  world.addOrganization({ id: "org_osaka", name: "Osaka Suns Organization", countryId: "country_jp" });
  world.addTeam({
    id: "team_osaka",
    leagueId: "league_jp1",
    organizationId: "org_osaka",
    name: "Osaka Suns",
    teamType: "CLUB",
    rosterLevel: 1,
    rosterLevelName: "1군",
    isTopLevel: true,
  });

  const season = world.createSeason({
    id: "season_2027",
    leagueId: "league_kr1",
    year: 2027,
    name: "2027 Korea Premier League",
    startDate: "2027-04-01",
    regularSeasonEndDate: "2027-10-05",
    postseasonEndDate: "2027-11-03",
    status: "REGULAR_SEASON",
    allowDraws: true,
    hasPostseason: true,
  });
  const competition = world.createCompetition({
    id: "competition_regular_2027",
    seasonId: season.id,
    leagueId: season.leagueId,
    name: "2027 Regular Season",
    type: "REGULAR_SEASON",
    startDate: season.startDate,
    endDate: season.regularSeasonEndDate,
    participatingTeamIds: organizations.map((org) => teamIdFor(org.id, "top")),
  });

  for (const org of organizations) {
    seedOrganization(world, seed, org.id);
    const isUserManager = org.id === (options.organizationId ?? "org_seoul") && options.startMode !== "UNEMPLOYED";
    world.addManager({
      id: `mgr_${org.id}`,
      name: isUserManager ? (options.managerName ?? `${org.city} Manager`) : `${org.city} Manager`,
      birthDate: "1979-02-10",
      nationality: countryNameForCode(isUserManager ? options.managerNationalityCode : "KR"),
      nationalityCode: isUserManager ? (options.managerNationalityCode ?? "KR") : "KR",
      status: "EMPLOYED",
      reputation: org.id === "org_seoul" ? 72 : 58,
      currentTeamId: teamIdFor(org.id, "top"),
      contracts: [{
        id: `mgr_contract_${org.id}_2027`,
        managerId: `mgr_${org.id}`,
        organizationId: org.id,
        teamId: teamIdFor(org.id, "top"),
        role: "MANAGER",
        startDate: "2027-01-01",
        endDate: org.id === "org_seoul" ? "2029-12-31" : "2028-12-31",
        salary: org.id === "org_seoul" ? 900000 : 620000,
        currency: "USD",
        status: "ACTIVE",
      }],
    });
    world.addScout({
      id: `scout_${org.id}`,
      name: `${org.city} Area Scout`,
      organizationId: org.id,
      abilityEvaluation: 62 + org.city.length,
      potentialEvaluation: 67 + org.city.length,
      regionalKnowledge: 75,
      experience: 58,
    });
  }

  seedProspects(world);
  seedFreeAgents(world);

  world.generateRoundRobinSchedule({
    seasonId: season.id,
    competitionId: competition.id,
    teamIds: organizations.map((org) => teamIdFor(org.id, "top")),
    gamesPerOpponent: 2,
    startDate: "2027-04-03",
    restDaysBetweenRounds: 0,
  });

  const draft = world.createDraft({
    id: "draft_2027",
    leagueId: "league_kr1",
    seasonId: season.id,
    year: 2027,
    rounds: 3,
    draftOrder: ["org_gwangju", "org_daejeon", "org_suwon", "org_incheon", "org_busan", "org_seoul"],
  });

  world.openManagerJobVacancy({
    id: "vacancy_harbor_2027",
    organizationId: "org_harbor",
    teamId: "team_harbor",
    minimumReputation: 45,
    preferredReputation: 68,
    salaryRange: { min: 550000, max: 1250000, currency: "USD" },
    contractYearsRange: { min: 2, max: 4 },
    expectations: "국제 리그 포스트시즌 경쟁",
  });
  world.openManagerJobVacancy({
    id: "vacancy_osaka_2027",
    organizationId: "org_osaka",
    teamId: "team_osaka",
    minimumReputation: 55,
    preferredReputation: 72,
    salaryRange: { min: 70000000, max: 190000000, currency: "JPY" },
    contractYearsRange: { min: 2, max: 3 },
    expectations: "젊은 선수 육성과 상위권 도약",
  });
  world.makeManagerOffer({
    id: "manager_offer_osaka_2027",
    vacancyId: "vacancy_osaka_2027",
    managerId: "mgr_org_seoul",
    organizationId: "org_osaka",
    teamId: "team_osaka",
    salary: 145000000,
    currency: "JPY",
    years: 3,
    startDate: "2027-04-04",
    endDate: "2029-12-31",
    expectations: "3년 안에 우승권 진입",
    reason: "해외 구단 감독 제안",
  });

  let userManagerId = `mgr_${options.organizationId ?? "org_seoul"}`;
  let userTeamId = teamIdFor(options.organizationId ?? "org_seoul", "top");
  if (options.startMode === "UNEMPLOYED") {
    userManagerId = "mgr_user";
    userTeamId = "team_org_seoul_top";
    world.addManager({
      id: userManagerId,
      name: options.managerName ?? "새 감독",
      birthDate: "1984-03-01",
      nationality: countryNameForCode(options.managerNationalityCode),
      nationalityCode: options.managerNationalityCode ?? "KR",
      status: "UNEMPLOYED",
      reputation: 45,
    });
  }

  return {
    world,
    userManagerId,
    userTeamId,
    seasonId: season.id,
    competitionId: competition.id,
    draftId: draft.id,
    seed,
  };
}

function countryNameForCode(code = "KR"): string {
  if (code === "JP") return "일본";
  if (code === "PW") return "퍼시픽 웨스트";
  return "대한민국";
}

function seedOrganization(world: LeagueWorld, seed: number, organizationId: EntityId): void {
  const topTeamId = teamIdFor(organizationId, "top");
  const futuresTeamId = teamIdFor(organizationId, "futures");
  const topPlayers: EntityId[] = [];
  const futuresPlayers: EntityId[] = [];
  const hitterPositions: BaseballPosition[] = ["C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH", "C", "IF" as BaseballPosition, "OF" as BaseballPosition, "1B", "SS"];
  hitterPositions.forEach((position, index) => {
    const id = `${organizationId}_bat_${index + 1}`;
    const primaryPosition = position === ("IF" as BaseballPosition) ? firstLevelPositions[(index + 1) % 5]! : position === ("OF" as BaseballPosition) ? firstLevelPositions[5 + (index % 3)]! : position;
    world.addPlayer(makePlayer(id, uniqueName(organizationId, index + seed), primaryPosition, {
      currentAbility: 42 + (index % 9) * 3,
      potentialAbility: 55 + (index % 10) * 3,
      birthDate: `${1997 + (index % 10)}-05-${String((index % 27) + 1).padStart(2, "0")}` as ISODate,
    }));
    signAndAssign(world, id, organizationId, topTeamId, 360000 + index * 45000);
    topPlayers.push(id);
  });
  for (let index = 0; index < 12; index += 1) {
    const id = `${organizationId}_pit_${index + 1}`;
    world.addPlayer(makePlayer(id, uniqueName(organizationId, index + 31 + seed), "P", {
      currentAbility: 41 + (index % 8) * 4,
      potentialAbility: 56 + (index % 9) * 3,
      birthDate: `${1994 + (index % 11)}-03-${String((index % 27) + 1).padStart(2, "0")}` as ISODate,
    }));
    signAndAssign(world, id, organizationId, topTeamId, 420000 + index * 52000);
    topPlayers.push(id);
  }
  for (let index = 0; index < 20; index += 1) {
    const position = index < 8 ? "P" : firstLevelPositions[(index + 2) % firstLevelPositions.length]!;
    const id = `${organizationId}_fut_${index + 1}`;
    world.addPlayer(makePlayer(id, uniqueName(organizationId, index + 59 + seed), position, {
      currentAbility: 30 + (index % 10) * 2,
      potentialAbility: 52 + (index % 12) * 3,
      birthDate: `${2003 + (index % 7)}-07-${String((index % 27) + 1).padStart(2, "0")}` as ISODate,
    }));
    signAndAssign(world, id, organizationId, futuresTeamId, 180000 + index * 12000);
    futuresPlayers.push(id);
  }
  world.setPitchingRotation(topTeamId, topPlayers.filter((id) => id.includes("_pit_")).slice(0, 5));
  topPlayers.filter((id) => id.includes("_pit_")).slice(1).forEach((playerId, index) => {
    world.assignBullpenRole(topTeamId, playerId, [pitcherRoles[index % pitcherRoles.length]!]);
  });
  void futuresPlayers;
}

function seedProspects(world: LeagueWorld): void {
  for (let index = 0; index < 72; index += 1) {
    const position = index % 5 === 0 ? "P" : firstLevelPositions[index % firstLevelPositions.length]!;
    const id = `prospect_${index + 1}`;
    world.addPlayer(makePlayer(id, uniqueName("prospect", index + 101), position, {
      status: index % 4 === 0 ? "STUDENT" : "AMATEUR",
      currentAbility: 28 + (index % 8) * 3,
      potentialAbility: 58 + (index % 7) * 5,
      trueCurrentAbility: 28 + (index % 8) * 3,
      truePotentialAbility: 58 + (index % 7) * 5,
      birthDate: `${2008 + (index % 3)}-09-1${index % 9}` as ISODate,
    }));
    const eligibility = world.evaluateDraftEligibility(id, "league_kr1", 2027);
    if (eligibility.eligible) {
      const player = world.players.get(id);
      if (player) {
        player.draftEligibility = {
          ...eligibility,
          declared: true,
          status: "DECLARED",
          decision: "DECLARE",
          reason: "개발 시드 드래프트 참가 선언",
        };
      }
    }
    for (const org of organizations) {
      world.createScoutingReport(`scout_${org.id}`, id);
    }
  }
}

function seedFreeAgents(world: LeagueWorld): void {
  for (let index = 0; index < 18; index += 1) {
    const id = `free_agent_${index + 1}`;
    world.addPlayer(makePlayer(id, uniqueName("free_agent", index + 211), index % 4 === 0 ? "P" : firstLevelPositions[index % firstLevelPositions.length]!, {
      status: "FREE_AGENT",
      currentAbility: 38 + (index % 9) * 4,
      potentialAbility: 46 + (index % 10) * 4,
      birthDate: `${1992 + (index % 12)}-01-${String((index % 27) + 1).padStart(2, "0")}` as ISODate,
      freeAgentStatus: {
        eligible: true,
        becameFreeAgentOn: "2027-03-20",
        previousOrganizationId: index % 2 === 0 ? "org_busan" : "org_incheon",
        type: "RELEASED",
      },
      contractDemand: {
        desiredSalary: 450000 + index * 120000,
        desiredYears: index < 2 ? 2 : 1,
        minimumSalary: 250000 + index * 70000,
        minimumYears: 1,
        preferredRole: index === 0 ? "P" : firstLevelPositions[index]!,
        preferredCountryIds: ["country_kr"],
      },
    }));
  }
}

function uniqueName(scope: EntityId, index: number): string {
  const scopeOffset = [...scope].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const resolvedIndex = Math.abs(index + scopeOffset);
  const base = names[resolvedIndex % names.length] ?? `선수 ${index}`;
  const number = Math.floor(resolvedIndex / names.length) + 1;
  return `${base}${number > 1 ? ` ${number}` : ""}`;
}

function makePlayer(
  id: EntityId,
  name: string,
  position: BaseballPosition,
  overrides: Partial<Player> = {},
): Player {
  const currentAbility = overrides.currentAbility ?? 45;
  const potentialAbility = overrides.potentialAbility ?? Math.min(95, currentAbility + 18);
  const isPitcher = position === "P";
  return {
    id,
    name,
    birthDate: overrides.birthDate ?? "2002-04-01",
    age: overrides.age ?? 25,
    nationality: overrides.nationality ?? "대한민국",
    nationalityCode: overrides.nationalityCode ?? "KR",
    bats: overrides.bats ?? "R",
    throws: overrides.throws ?? "R",
    primaryPosition: position,
    secondaryPositions: overrides.secondaryPositions ?? (isPitcher ? [] : ["DH"]),
    status: overrides.status ?? "AMATEUR",
    trueCurrentAbility: overrides.trueCurrentAbility ?? currentAbility,
    truePotentialAbility: overrides.truePotentialAbility ?? potentialAbility,
    currentAbility,
    potentialAbility,
    battingRatings: overrides.battingRatings ?? {
      contact: isPitcher ? 18 : currentAbility + 4,
      power: isPitcher ? 16 : currentAbility,
      plateDiscipline: isPitcher ? 18 : currentAbility - 2,
      speed: isPitcher ? 28 : currentAbility,
      fielding: isPitcher ? 38 : currentAbility + 1,
      arm: isPitcher ? 58 : currentAbility + 2,
    },
    pitchingRatings: overrides.pitchingRatings ?? {
      velocity: isPitcher ? currentAbility + 10 : 20,
      control: isPitcher ? currentAbility + 2 : 20,
      movement: isPitcher ? currentAbility + 4 : 20,
      stamina: isPitcher ? currentAbility + 5 : 25,
      pitchQuality: isPitcher ? currentAbility + 3 : 20,
      repertoire: [{ name: "Fastball", quality: isPitcher ? currentAbility + 3 : 20 }],
    },
    developmentProfile: overrides.developmentProfile ?? {
      developmentRate: 55,
      consistency: 60,
      durability: 66,
      peakAgeRange: { start: 24, end: 30 },
      declineRate: 42,
    },
    injury: overrides.injury ?? { status: "HEALTHY" },
    gameCondition: overrides.gameCondition ?? { fatigue: 0, readiness: 100, availableForGame: true },
    rosterAssignments: overrides.rosterAssignments ?? [],
    contracts: overrides.contracts ?? [],
    careerEntries: overrides.careerEntries ?? [],
    ...(overrides.freeAgentStatus ? { freeAgentStatus: overrides.freeAgentStatus } : {}),
    ...(overrides.contractDemand ? { contractDemand: overrides.contractDemand } : {}),
    ...(overrides.draftEligibility ? { draftEligibility: overrides.draftEligibility } : {}),
  };
}

function signAndAssign(
  world: LeagueWorld,
  playerId: EntityId,
  organizationId: EntityId,
  teamId: EntityId,
  salary: number,
): void {
  world.registerContract({
    playerId,
    organizationId,
    startDate: "2027-01-01",
    endDate: "2029-12-31",
    salary,
    currency: "USD",
    contractStatus: "ACTIVE",
  });
  world.assignPlayerToRoster(playerId, teamId, "ACTIVE", "시드 로스터 배정");
}

function teamIdFor(organizationId: EntityId, level: "top" | "futures"): EntityId {
  return `team_${organizationId}_${level}`;
}
