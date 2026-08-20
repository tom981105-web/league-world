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
import { countryNameForCode, generatePersonName, type NameCountryCode } from "./nameGenerator.js";

export type SeedWorldPreset = "SMALL" | "STANDARD";

export interface SeedWorldResult {
  world: LeagueWorld;
  userManagerId: EntityId;
  userTeamId: EntityId;
  seasonId: EntityId;
  competitionId: EntityId;
  draftId: EntityId;
  seed: number;
  preset: SeedWorldPreset;
}

export interface SeedWorldOptions {
  managerName?: string;
  managerNationalityCode?: string;
  startMode?: "UNEMPLOYED" | "CLUB";
  organizationId?: EntityId;
  preset?: SeedWorldPreset;
}

interface SeedOrganizationConfig {
  id: EntityId;
  name: string;
  city: string;
  tier: "CONTENDER" | "UPPER" | "MID" | "LOWER" | "REBUILDING";
}

interface AmateurStageConfig {
  key: "MIDDLE_SCHOOL" | "HIGH_SCHOOL" | "COLLEGE" | "INDEPENDENT";
  label: string;
  count: number;
  status: Player["status"];
  birthYearStart: number;
  birthYearSpan: number;
}

const firstLevelPositions: BaseballPosition[] = ["C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH"];
const topHitters: BaseballPosition[] = ["C", "C", "1B", "1B", "2B", "2B", "3B", "3B", "SS", "SS", "LF", "CF", "RF", "LF", "RF"];
const futuresHitters: BaseballPosition[] = ["C", "C", "C", "1B", "1B", "2B", "2B", "3B", "3B", "SS", "SS", "LF", "LF", "CF", "CF", "RF"];
const pitcherRoles: BullpenRole[] = ["CLOSER", "SETUP", "MIDDLE_RELIEF", "LONG_RELIEF", "MOP_UP", "FLEXIBLE"];
const foreignCodes: NameCountryCode[] = ["US", "JP", "TW", "DO", "VE", "MX", "CA", "AU"];

export const seedOrganizations: SeedOrganizationConfig[] = [
  { id: "org_seoul", name: "Seoul Falcons", city: "Seoul", tier: "CONTENDER" },
  { id: "org_busan", name: "Busan Tides", city: "Busan", tier: "UPPER" },
  { id: "org_incheon", name: "Incheon Waves", city: "Incheon", tier: "MID" },
  { id: "org_daejeon", name: "Daejeon Sparks", city: "Daejeon", tier: "LOWER" },
  { id: "org_suwon", name: "Suwon Shields", city: "Suwon", tier: "MID" },
  { id: "org_gwangju", name: "Gwangju Suns", city: "Gwangju", tier: "REBUILDING" },
  { id: "org_daegu", name: "Daegu Meteors", city: "Daegu", tier: "UPPER" },
  { id: "org_ulsan", name: "Ulsan Anchors", city: "Ulsan", tier: "LOWER" },
  { id: "org_jeonju", name: "Jeonju Royals", city: "Jeonju", tier: "CONTENDER" },
  { id: "org_changwon", name: "Changwon Cannons", city: "Changwon", tier: "REBUILDING" },
];

const smallOrganizations = seedOrganizations.slice(0, 4);

export function createSeedWorld(seed = 20270403, options: SeedWorldOptions = {}): SeedWorldResult {
  return createStandardSeedWorld(seed, options);
}

export function createSmallSeedWorld(seed = 20270403, options: SeedWorldOptions = {}): SeedWorldResult {
  return createWorld(seed, { ...options, preset: "SMALL" });
}

export function createStandardSeedWorld(seed = 20270403, options: SeedWorldOptions = {}): SeedWorldResult {
  return createWorld(seed, { ...options, preset: "STANDARD" });
}

function createWorld(seed: number, options: SeedWorldOptions): SeedWorldResult {
  const preset = options.preset ?? "STANDARD";
  const orgs = preset === "SMALL" ? smallOrganizations : seedOrganizations;
  const world = new LeagueWorld(new WorldClock("2027-04-03"), new Mulberry32Random(seed));
  addCountries(world);
  addLeagues(world);
  addOrganizationsAndTeams(world, orgs);
  addInternationalJobMarkets(world);

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
  const topTeamIds = orgs.map((org) => teamIdFor(org.id, "top"));
  const competition = world.createCompetition({
    id: "competition_regular_2027",
    seasonId: season.id,
    leagueId: season.leagueId,
    name: "2027 Regular Season",
    type: "REGULAR_SEASON",
    startDate: season.startDate,
    endDate: season.regularSeasonEndDate,
    participatingTeamIds: topTeamIds,
  });

  orgs.forEach((org, index) => {
    seedOrganization(world, seed, org, preset);
    seedManagersAndScouts(world, seed, org, index, options);
  });

  seedAmateurs(world, seed, preset, orgs);
  seedFreeAgents(world, seed, preset, orgs);
  seedInternationalScouts(world, seed);

  world.generateRoundRobinSchedule({
    seasonId: season.id,
    competitionId: competition.id,
    teamIds: topTeamIds,
    gamesPerOpponent: preset === "SMALL" ? 2 : 4,
    startDate: "2027-04-03",
    restDaysBetweenRounds: 0,
  });

  const draft = world.createDraft({
    id: "draft_2027",
    leagueId: "league_kr1",
    seasonId: season.id,
    year: 2027,
    rounds: preset === "SMALL" ? 3 : 8,
    draftOrder: [...orgs].reverse().map((org) => org.id),
  });

  seedManagerMarket(world);

  let userManagerId = `mgr_${options.organizationId ?? "org_seoul"}`;
  let userTeamId = teamIdFor(options.organizationId ?? "org_seoul", "top");
  if (options.startMode === "UNEMPLOYED") {
    userManagerId = "mgr_user";
    userTeamId = "team_org_seoul_top";
    const generated = generatePersonName((options.managerNationalityCode as NameCountryCode) ?? "KR", seed, "mgr_user", 0);
    world.addManager({
      id: userManagerId,
      name: options.managerName ?? generated.name,
      birthDate: "1984-03-01",
      nationality: countryNameForCode(options.managerNationalityCode),
      nationalityCode: options.managerNationalityCode ?? "KR",
      status: "UNEMPLOYED",
      reputation: 45,
    });
  }

  return { world, userManagerId, userTeamId, seasonId: season.id, competitionId: competition.id, draftId: draft.id, seed, preset };
}

function addCountries(world: LeagueWorld): void {
  const countryRows: Array<[EntityId, string, string]> = [
    ["country_kr", "KR", "Korea Republic"],
    ["country_us", "US", "United States"],
    ["country_jp", "JP", "Japan Archipelago"],
    ["country_tw", "TW", "Taiwan"],
    ["country_do", "DO", "Dominican Republic"],
    ["country_ve", "VE", "Venezuela"],
    ["country_mx", "MX", "Mexico"],
    ["country_ca", "CA", "Canada"],
    ["country_au", "AU", "Australia"],
    ["country_pw", "PW", "Pacific West"],
  ];
  const countries: Array<{ id: EntityId; code: string; name: string }> = countryRows.map(([id, code, name]) => ({ id, code, name }));
  countries.forEach((country) => world.addCountry(country));
}

function addLeagues(world: LeagueWorld): void {
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
  world.addLeague({ id: "league_kr_futures", countryId: "country_kr", name: "Korea Futures League", level: 2, category: "PROFESSIONAL", usesDH: true });
  world.addLeague({ id: "league_pw1", countryId: "country_pw", name: "Pacific Global League", level: 1, category: "INTERNATIONAL", usesDH: true });
  world.addLeague({ id: "league_jp1", countryId: "country_jp", name: "Japan Frontier League", level: 1, category: "PROFESSIONAL", usesDH: true });
}

function addOrganizationsAndTeams(world: LeagueWorld, orgs: SeedOrganizationConfig[]): void {
  for (const org of orgs) {
    world.addOrganization({ id: org.id, name: `${org.name} Organization`, countryId: "country_kr" });
    world.addTeam({ id: teamIdFor(org.id, "top"), leagueId: "league_kr1", organizationId: org.id, name: org.name, teamType: "CLUB", rosterLevel: 1, rosterLevelName: "1군", isTopLevel: true });
    world.addTeam({ id: teamIdFor(org.id, "futures"), leagueId: "league_kr_futures", organizationId: org.id, name: `${org.name} Futures`, teamType: "CLUB", parentTeamId: teamIdFor(org.id, "top"), rosterLevel: 2, rosterLevelName: "퓨처스" });
  }
}

function addInternationalJobMarkets(world: LeagueWorld): void {
  world.addOrganization({ id: "org_harbor", name: "Harbor Voyagers Organization", countryId: "country_pw" });
  world.addTeam({ id: "team_harbor", leagueId: "league_pw1", organizationId: "org_harbor", name: "Harbor Voyagers", teamType: "CLUB", rosterLevel: 1, rosterLevelName: "1군", isTopLevel: true });
  world.addOrganization({ id: "org_osaka", name: "Osaka Suns Organization", countryId: "country_jp" });
  world.addTeam({ id: "team_osaka", leagueId: "league_jp1", organizationId: "org_osaka", name: "Osaka Suns", teamType: "CLUB", rosterLevel: 1, rosterLevelName: "1군", isTopLevel: true });
}

function seedOrganization(world: LeagueWorld, seed: number, org: SeedOrganizationConfig, preset: SeedWorldPreset): void {
  const topTeamId = teamIdFor(org.id, "top");
  const futuresTeamId = teamIdFor(org.id, "futures");
  const topPlayers: EntityId[] = [];
  const orgIndex = seedOrganizations.findIndex((item) => item.id === org.id);
  const topPitcherCount = preset === "SMALL" ? 6 : 13;
  const futuresPitcherCount = preset === "SMALL" ? 8 : 16;
  const topHitterPool = preset === "SMALL" ? topHitters.slice(0, 9) : topHitters;
  const futuresHitterPool = preset === "SMALL" ? futuresHitters.slice(0, 12) : futuresHitters;
  const strength = tierStrength(org.tier, seed, orgIndex);

  topHitterPool.forEach((position, index) => {
    const id = `${org.id}_bat_${index + 1}`;
    const nationalityCode = foreignSlot(index, orgIndex) ? foreignCodes[(index + orgIndex) % foreignCodes.length]! : "KR";
    const ca = clamp(38 + strength + ((index * 7 + orgIndex) % 18), 25, 86);
    const player = makePlayer(id, generatedName(nationalityCode, seed, org.id, index).name, position, {
      nationality: countryNameForCode(nationalityCode),
      nationalityCode,
      currentAbility: ca,
      potentialAbility: clamp(ca + 8 + ((index + orgIndex) % 17), 35, 96),
      birthDate: `${1994 + ((index + orgIndex) % 12)}-05-${day(index)}` as ISODate,
    });
    seedContractAndRoster(player, org.id, topTeamId, salaryFor(ca, index, strength), index);
    world.addPlayer(player);
    topPlayers.push(id);
  });

  for (let index = 0; index < topPitcherCount; index += 1) {
    const id = `${org.id}_pit_${index + 1}`;
    const nationalityCode = foreignSlot(index + 3, orgIndex) ? foreignCodes[(index + orgIndex + 2) % foreignCodes.length]! : "KR";
    const ca = clamp(40 + strength + ((index * 5 + orgIndex) % 20), 25, 88);
    const player = makePlayer(id, generatedName(nationalityCode, seed, org.id, index + 30).name, "P", {
      nationality: countryNameForCode(nationalityCode),
      nationalityCode,
      currentAbility: ca,
      potentialAbility: clamp(ca + 7 + ((index + orgIndex) % 16), 35, 96),
      birthDate: `${1992 + ((index + orgIndex) % 13)}-03-${day(index)}` as ISODate,
    });
    seedContractAndRoster(player, org.id, topTeamId, salaryFor(ca, index + 20, strength), index + 20);
    world.addPlayer(player);
    topPlayers.push(id);
  }

  futuresHitterPool.forEach((position, index) => {
    const id = `${org.id}_fut_bat_${index + 1}`;
    const ca = clamp(27 + Math.floor(strength / 2) + ((index * 3 + orgIndex) % 17), 20, 66);
    const player = makePlayer(id, generatedName("KR", seed, org.id, index + 70).name, position, {
      currentAbility: ca,
      potentialAbility: clamp(ca + 16 + ((index + orgIndex) % 22), 40, 94),
      birthDate: `${2002 + ((index + orgIndex) % 8)}-07-${day(index)}` as ISODate,
    });
    seedContractAndRoster(player, org.id, futuresTeamId, salaryFor(ca, index + 50, 0), index + 50);
    world.addPlayer(player);
  });

  for (let index = 0; index < futuresPitcherCount; index += 1) {
    const id = `${org.id}_fut_pit_${index + 1}`;
    const ca = clamp(28 + Math.floor(strength / 2) + ((index * 4 + orgIndex) % 17), 20, 68);
    const player = makePlayer(id, generatedName("KR", seed, org.id, index + 100).name, "P", {
      currentAbility: ca,
      potentialAbility: clamp(ca + 15 + ((index + orgIndex) % 24), 40, 95),
      birthDate: `${2001 + ((index + orgIndex) % 9)}-09-${day(index)}` as ISODate,
    });
    seedContractAndRoster(player, org.id, futuresTeamId, salaryFor(ca, index + 80, 0), index + 80);
    world.addPlayer(player);
  }

  world.setPitchingRotation(topTeamId, topPlayers.filter((id) => id.includes("_pit_")).slice(0, 5));
  topPlayers.filter((id) => id.includes("_pit_")).slice(1).forEach((playerId, index) => {
    world.assignBullpenRole(topTeamId, playerId, [pitcherRoles[index % pitcherRoles.length]!]);
  });
}

function seedManagersAndScouts(world: LeagueWorld, seed: number, org: SeedOrganizationConfig, index: number, options: SeedWorldOptions): void {
  const isUserManager = org.id === (options.organizationId ?? "org_seoul") && options.startMode !== "UNEMPLOYED";
  const managerCode = isUserManager ? ((options.managerNationalityCode as NameCountryCode) ?? "KR") : managerCountry(index);
  const managerGenerated = generatedName(managerCode, seed, org.id, 500 + index);
  const reputation = clamp(52 + tierStrength(org.tier, seed, index) + (index % 9), 35, 88);
  world.addManager({
    id: `mgr_${org.id}`,
    name: isUserManager ? (options.managerName ?? managerGenerated.name) : managerGenerated.name,
    birthDate: `${1969 + (index % 18)}-02-${day(index)}` as ISODate,
    nationality: countryNameForCode(managerCode),
    nationalityCode: managerCode,
    status: "EMPLOYED",
    reputation,
    currentTeamId: teamIdFor(org.id, "top"),
    contracts: [{
      id: `mgr_contract_${org.id}_2027`,
      managerId: `mgr_${org.id}`,
      organizationId: org.id,
      teamId: teamIdFor(org.id, "top"),
      role: "MANAGER",
      startDate: "2027-01-01",
      endDate: `${2028 + (index % 3)}-12-31`,
      salary: managerCode === "KR" ? 520000000 + reputation * 5000000 : 650000 + reputation * 12000,
      currency: managerCode === "KR" ? "KRW" : "USD",
      status: "ACTIVE",
    }],
  });

  for (let scoutIndex = 0; scoutIndex < 3; scoutIndex += 1) {
    const code = scoutIndex === 0 ? "KR" : foreignCodes[(index + scoutIndex) % foreignCodes.length]!;
    const generated = generatedName(code, seed, org.id, 620 + scoutIndex);
    world.addScout({
      id: `scout_${org.id}_${scoutIndex + 1}`,
      name: generated.name,
      organizationId: org.id,
      abilityEvaluation: clamp(48 + ((index * 9 + scoutIndex * 13) % 42), 35, 92),
      potentialEvaluation: clamp(50 + ((index * 11 + scoutIndex * 7) % 43), 35, 94),
      regionalKnowledge: clamp(54 + ((index * 5 + scoutIndex * 17) % 41), 30, 96),
      experience: clamp(40 + ((index * 13 + scoutIndex * 9) % 50), 20, 95),
    });
  }
}

function seedInternationalScouts(world: LeagueWorld, seed: number): void {
  [
    { orgId: "org_harbor", teamId: "team_harbor", code: "US" as NameCountryCode, salary: 900000, currency: "USD" },
    { orgId: "org_osaka", teamId: "team_osaka", code: "JP" as NameCountryCode, salary: 145000000, currency: "JPY" },
  ].forEach((item, index) => {
    const scout = generatedName(item.code, seed, item.orgId, 710);
    world.addScout({ id: `scout_${item.orgId}_1`, name: scout.name, organizationId: item.orgId, abilityEvaluation: 68, potentialEvaluation: 72, regionalKnowledge: 78, experience: 70 });
  });
}

function seedAmateurs(world: LeagueWorld, seed: number, preset: SeedWorldPreset, orgs: SeedOrganizationConfig[]): void {
  const stages: AmateurStageConfig[] = preset === "SMALL"
    ? [
        { key: "MIDDLE_SCHOOL", label: "중학교", count: 10, status: "STUDENT", birthYearStart: 2011, birthYearSpan: 2 },
        { key: "HIGH_SCHOOL", label: "고등학교", count: 28, status: "STUDENT", birthYearStart: 2008, birthYearSpan: 3 },
        { key: "COLLEGE", label: "대학", count: 22, status: "AMATEUR", birthYearStart: 2004, birthYearSpan: 4 },
        { key: "INDEPENDENT", label: "독립/기타", count: 12, status: "INDEPENDENT", birthYearStart: 1998, birthYearSpan: 8 },
      ]
    : [
        { key: "MIDDLE_SCHOOL", label: "중학교", count: 50, status: "STUDENT", birthYearStart: 2011, birthYearSpan: 2 },
        { key: "HIGH_SCHOOL", label: "고등학교", count: 90, status: "STUDENT", birthYearStart: 2008, birthYearSpan: 3 },
        { key: "COLLEGE", label: "대학", count: 70, status: "AMATEUR", birthYearStart: 2004, birthYearSpan: 4 },
        { key: "INDEPENDENT", label: "독립/기타", count: 40, status: "INDEPENDENT", birthYearStart: 1997, birthYearSpan: 9 },
      ];

  for (const stage of stages) {
    for (let index = 0; index < stage.count; index += 1) {
      const id = `amateur_${stage.key.toLowerCase()}_${index + 1}`;
      const position = index % 4 === 0 ? "P" : firstLevelPositions[(index + 1) % firstLevelPositions.length]!;
      const ca = stage.key === "MIDDLE_SCHOOL" ? 18 + (index % 15) : stage.key === "HIGH_SCHOOL" ? 25 + (index % 20) : stage.key === "COLLEGE" ? 31 + (index % 24) : 28 + (index % 26);
      const player = makePlayer(id, generatedName("KR", seed, stage.key, index).name, position, {
        status: stage.status,
        currentAbility: ca,
        potentialAbility: clamp(ca + 18 + ((index * 7) % 28), 35, 96),
        birthDate: `${stage.birthYearStart + (index % stage.birthYearSpan)}-09-${day(index)}` as ISODate,
      });
      player.careerEntries.push({ id: `career_${id}_stage`, personId: id, personType: "PLAYER", organizationNameSnapshot: stage.label, role: stage.label, status: player.status, startDate: "2027-03-01", reason: `${stage.label} 선수` });
      world.addPlayer(player);
      const eligibility = world.evaluateDraftEligibility(id, "league_kr1", 2027);
      const shouldDeclare = stage.key !== "MIDDLE_SCHOOL" && ((index + seed) % (stage.key === "HIGH_SCHOOL" ? 3 : 2) === 0);
      const saved = world.players.get(id);
      if (saved) {
        saved.draftEligibility = {
          ...eligibility,
          declared: eligibility.eligible && shouldDeclare,
          status: eligibility.eligible && shouldDeclare ? "DECLARED" : eligibility.status,
          decision: eligibility.eligible && shouldDeclare ? "DECLARE" : (stage.key === "INDEPENDENT" ? "INDEPENDENT" : "STAY_SCHOOL"),
          reason: shouldDeclare ? `${stage.label} 드래프트 참가 선언` : `${stage.label} 잔류/대기`,
        };
      }
      const primaryScoutingOrg = orgs[0];
      if (primaryScoutingOrg) {
        world.createScoutingReport(`scout_${primaryScoutingOrg.id}_1`, id);
      }
      const rotatingScoutingOrg = orgs[(index + stage.key.length) % orgs.length];
      if (rotatingScoutingOrg && rotatingScoutingOrg.id !== primaryScoutingOrg?.id && index % 5 === 0) {
        world.createScoutingReport(`scout_${rotatingScoutingOrg.id}_1`, id);
      }
    }
  }
}

function seedFreeAgents(world: LeagueWorld, seed: number, preset: SeedWorldPreset, orgs: SeedOrganizationConfig[]): void {
  const count = preset === "SMALL" ? 18 : 40;
  for (let index = 0; index < count; index += 1) {
    const id = `free_agent_${index + 1}`;
    const nationalityCode = index % 5 === 0 ? foreignCodes[index % foreignCodes.length]! : "KR";
    const position = index % 4 === 0 ? "P" : firstLevelPositions[index % firstLevelPositions.length]!;
    const profile = index % 5;
    const ca = [64, 48, 56, 37, 43][profile]! + (index % 7);
    world.addPlayer(makePlayer(id, generatedName(nationalityCode, seed, "free_agent", index).name, position, {
      status: "FREE_AGENT",
      nationality: countryNameForCode(nationalityCode),
      nationalityCode,
      currentAbility: ca,
      potentialAbility: clamp(ca + [5, 7, 2, 13, 20][profile]!, 35, 88),
      birthDate: `${profile === 4 ? 2002 : 1989 + ((index + profile) % 15)}-01-${day(index)}` as ISODate,
      freeAgentStatus: { eligible: true, becameFreeAgentOn: "2027-03-20", previousOrganizationId: orgs[index % orgs.length]!.id, type: profile === 3 ? "RELEASED" : "CONTRACT_EXPIRED" },
      contractDemand: {
        desiredSalary: 180000 + ca * 17000 + profile * 45000,
        desiredYears: [2, 1, 1, 1, 3][profile]!,
        minimumSalary: 90000 + ca * 9000,
        minimumYears: 1,
        preferredRole: position,
        preferredCountryIds: ["country_kr"],
      },
    }));
  }
}

function seedManagerMarket(world: LeagueWorld): void {
  world.openManagerJobVacancy({ id: "vacancy_harbor_2027", organizationId: "org_harbor", teamId: "team_harbor", minimumReputation: 45, preferredReputation: 68, salaryRange: { min: 550000, max: 1250000, currency: "USD" }, contractYearsRange: { min: 2, max: 4 }, expectations: "국제 리그 포스트시즌 경쟁" });
  world.openManagerJobVacancy({ id: "vacancy_osaka_2027", organizationId: "org_osaka", teamId: "team_osaka", minimumReputation: 55, preferredReputation: 72, salaryRange: { min: 70000000, max: 190000000, currency: "JPY" }, contractYearsRange: { min: 2, max: 3 }, expectations: "젊은 선수 육성과 상위권 도약" });
  world.makeManagerOffer({ id: "manager_offer_osaka_2027", vacancyId: "vacancy_osaka_2027", managerId: "mgr_org_seoul", organizationId: "org_osaka", teamId: "team_osaka", salary: 145000000, currency: "JPY", years: 3, startDate: "2027-04-04", endDate: "2029-12-31", expectations: "3년 안에 우승권 진입", reason: "해외 구단 감독 제안" });
}

function makePlayer(id: EntityId, name: string, position: BaseballPosition, overrides: Partial<Player> = {}): Player {
  const currentAbility = overrides.currentAbility ?? 45;
  const potentialAbility = overrides.potentialAbility ?? Math.min(95, currentAbility + 18);
  const isPitcher = position === "P";
  return {
    id,
    name,
    birthDate: overrides.birthDate ?? "2002-04-01",
    age: overrides.age ?? 2027 - Number((overrides.birthDate ?? "2002-04-01").slice(0, 4)),
    nationality: overrides.nationality ?? "대한민국",
    nationalityCode: overrides.nationalityCode ?? "KR",
    bats: overrides.bats ?? (id.length % 5 === 0 ? "S" : id.length % 2 === 0 ? "L" : "R"),
    throws: overrides.throws ?? (isPitcher && id.length % 3 === 0 ? "L" : "R"),
    primaryPosition: position,
    secondaryPositions: overrides.secondaryPositions ?? (isPitcher ? [] : ["DH"]),
    status: overrides.status ?? "AMATEUR",
    trueCurrentAbility: overrides.trueCurrentAbility ?? currentAbility,
    truePotentialAbility: overrides.truePotentialAbility ?? potentialAbility,
    currentAbility,
    potentialAbility,
    battingRatings: overrides.battingRatings ?? { contact: isPitcher ? 18 : currentAbility + 4, power: isPitcher ? 16 : currentAbility, plateDiscipline: isPitcher ? 18 : currentAbility - 2, speed: isPitcher ? 28 : currentAbility, fielding: isPitcher ? 38 : currentAbility + 1, arm: isPitcher ? 58 : currentAbility + 2 },
    pitchingRatings: overrides.pitchingRatings ?? { velocity: isPitcher ? currentAbility + 10 : 20, control: isPitcher ? currentAbility + 2 : 20, movement: isPitcher ? currentAbility + 4 : 20, stamina: isPitcher ? currentAbility + 5 : 25, pitchQuality: isPitcher ? currentAbility + 3 : 20, repertoire: [{ name: "Fastball", quality: isPitcher ? currentAbility + 3 : 20 }] },
    developmentProfile: overrides.developmentProfile ?? { developmentRate: clamp(45 + (id.length % 35), 20, 90), consistency: clamp(45 + (id.length % 30), 20, 90), durability: clamp(48 + (id.length % 33), 20, 92), peakAgeRange: { start: 24 + (id.length % 4), end: 30 + (id.length % 5) }, declineRate: clamp(34 + (id.length % 38), 15, 85) },
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

function seedContractAndRoster(player: Player, organizationId: EntityId, teamId: EntityId, salary: number, index: number): void {
  const startYear = index % 5 === 0 ? 2026 : 2027;
  const endYear = index % 7 === 0 ? 2027 : 2027 + (index % 4);
  const assignmentId = `assign_seed_${player.id}`;
  player.status = "PROFESSIONAL";
  player.currentOrganizationId = organizationId;
  player.currentTeamId = teamId;
  player.rosterStatus = "ACTIVE";
  player.currentRosterAssignmentId = assignmentId;
  player.firstProfessionalDate = `${startYear}-01-01` as ISODate;
  player.contracts.push({
    id: `contract_seed_${player.id}`,
    playerId: player.id,
    organizationId,
    startDate: `${startYear}-01-01` as ISODate,
    endDate: `${endYear}-12-31` as ISODate,
    years: endYear - startYear + 1,
    salary,
    currency: "KRW",
    ...(index % 6 === 0 ? { signingBonus: Math.floor(salary * 0.2) } : { signingBonus: 0 }),
    contractStatus: "ACTIVE",
  });
  player.rosterAssignments.push({
    id: assignmentId,
    playerId: player.id,
    organizationId,
    teamId,
    rosterStatus: "ACTIVE",
    startDate: "2027-04-03",
    reason: "시드 로스터 배정",
  });
}

function generatedName(code: NameCountryCode, seed: number, scope: EntityId, index: number) {
  return generatePersonName(code, seed, scope, index);
}

function teamIdFor(organizationId: EntityId, level: "top" | "futures"): EntityId {
  return `team_${organizationId}_${level}`;
}

function tierStrength(tier: SeedOrganizationConfig["tier"], seed: number, index: number): number {
  const base = { CONTENDER: 13, UPPER: 8, MID: 3, LOWER: -2, REBUILDING: -6 }[tier];
  return base + (((seed + index * 17) % 7) - 3);
}

function salaryFor(currentAbility: number, index: number, strength: number): number {
  return Math.max(32000000, Math.floor((40000000 + currentAbility * 8500000 + index * 1750000 + strength * 9000000) / 10000) * 10000);
}

function foreignSlot(index: number, orgIndex: number): boolean {
  return (index + orgIndex) % 11 === 0 || (index + orgIndex) % 17 === 0;
}

function managerCountry(index: number): NameCountryCode {
  return index % 8 === 0 ? "JP" : index % 9 === 0 ? "US" : "KR";
}

function day(index: number): string {
  return String((index % 27) + 1).padStart(2, "0");
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
