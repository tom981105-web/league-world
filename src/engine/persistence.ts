import type {
  BoxScore,
  BullpenAssignment,
  Competition,
  ContractOffer,
  Country,
  Draft,
  GameDayRoster,
  GameFixture,
  League,
  LiveGame,
  Manager,
  ManagerContract,
  ManagerContractOffer,
  ManagerJobApplication,
  ManagerJobVacancy,
  Organization,
  Player,
  PlayerBattingGameLog,
  PlayerBattingSeasonStats,
  PlayerPitchingGameLog,
  PlayerPitchingSeasonStats,
  PostingRequest,
  ScoutingReport,
  Scout,
  Season,
  StandingRecord,
  Team,
  TradeProposal,
  WorldEvent,
} from "../domain/entities.js";
import type { EntityId, ISODate } from "../domain/types.js";
import { WorldClock } from "./clock.js";
import { SequentialIdGenerator } from "./ids.js";
import { Mulberry32Random } from "./rng.js";
import { LeagueWorld } from "./world.js";

export const WORLD_SAVE_VERSION = 1;

export interface WorldSaveData {
  saveVersion: 1;
  savedAt: string;
  clock: { currentDate: ISODate };
  rng: { type: "mulberry32"; state: number };
  ids: { type: "sequential"; counters: Record<string, number> };
  countries: Country[];
  leagues: League[];
  seasons: Season[];
  competitions: Competition[];
  organizations: Organization[];
  teams: Team[];
  players: Player[];
  managers: Manager[];
  managerContracts: ManagerContract[];
  managerJobVacancies: ManagerJobVacancy[];
  managerJobApplications: ManagerJobApplication[];
  managerContractOffers: ManagerContractOffer[];
  scouts: Scout[];
  scoutingReports: ScoutingReport[];
  drafts: Draft[];
  games: GameFixture[];
  gameRosters: GameDayRoster[];
  liveGames: LiveGame[];
  boxScores: BoxScore[];
  accumulatedGameIds: EntityId[];
  battingSeasonStats: PlayerBattingSeasonStats[];
  pitchingSeasonStats: PlayerPitchingSeasonStats[];
  battingGameLogs: PlayerBattingGameLog[];
  pitchingGameLogs: PlayerPitchingGameLog[];
  milestoneKeys: string[];
  pitchingRotations: Array<LeagueWorld["pitchingRotations"] extends Map<EntityId, infer T> ? T : never>;
  bullpenAssignments: BullpenAssignment[];
  standings: StandingRecord[];
  contractOffers: ContractOffer[];
  tradeProposals: TradeProposal[];
  postingRequests: PostingRequest[];
  events: WorldEvent[];
}

export function serializeWorld(world: LeagueWorld): WorldSaveData {
  return {
    saveVersion: WORLD_SAVE_VERSION,
    savedAt: new Date().toISOString(),
    clock: { currentDate: world.clock.now() },
    rng: { type: "mulberry32", state: readRngState(world.rng) },
    ids: { type: "sequential", counters: readIdState(world.ids) },
    countries: values(world.countries),
    leagues: values(world.leagues),
    seasons: values(world.seasons),
    competitions: values(world.competitions),
    organizations: values(world.organizations),
    teams: values(world.teams),
    players: values(world.players),
    managers: values(world.managers),
    managerContracts: values(world.managerContracts),
    managerJobVacancies: values(world.managerJobVacancies),
    managerJobApplications: values(world.managerJobApplications),
    managerContractOffers: values(world.managerContractOffers),
    scouts: values(world.scouts),
    scoutingReports: values(world.scoutingReports),
    drafts: values(world.drafts),
    games: values(world.games),
    gameRosters: values(world.gameRosters),
    liveGames: values(world.liveGames),
    boxScores: values(world.boxScores),
    accumulatedGameIds: [...world.accumulatedGameIds],
    battingSeasonStats: values(world.battingSeasonStats),
    pitchingSeasonStats: values(world.pitchingSeasonStats),
    battingGameLogs: structuredClone(world.battingGameLogs),
    pitchingGameLogs: structuredClone(world.pitchingGameLogs),
    milestoneKeys: [...world.milestoneKeys],
    pitchingRotations: values(world.pitchingRotations),
    bullpenAssignments: [...world.bullpenAssignments.values()].flatMap((items) => values(items)),
    standings: [...world.standings.values()].flatMap((items) => values(items)),
    contractOffers: values(world.contractOffers),
    tradeProposals: values(world.tradeProposals),
    postingRequests: values(world.postingRequests),
    events: structuredClone(world.events),
  };
}

export function deserializeWorld(input: unknown): LeagueWorld {
  const save = parseWorldSave(input);
  const world = new LeagueWorld(
    new WorldClock(save.clock.currentDate),
    Mulberry32Random.fromState(save.rng.state),
    SequentialIdGenerator.fromState(save.ids.counters),
  );
  fillMap(world.countries, save.countries);
  fillMap(world.leagues, save.leagues);
  fillMap(world.organizations, save.organizations);
  fillMap(world.seasons, save.seasons);
  fillMap(world.competitions, save.competitions);
  fillMap(world.games, save.games);
  fillMap(world.gameRosters, save.gameRosters);
  fillMap(world.liveGames, save.liveGames, "gameId");
  fillMap(world.boxScores, save.boxScores, "gameId");
  for (const id of save.accumulatedGameIds) world.accumulatedGameIds.add(id);
  fillMap(world.battingSeasonStats, save.battingSeasonStats, statKey);
  fillMap(world.pitchingSeasonStats, save.pitchingSeasonStats, statKey);
  world.battingGameLogs.push(...structuredClone(save.battingGameLogs));
  world.pitchingGameLogs.push(...structuredClone(save.pitchingGameLogs));
  for (const key of save.milestoneKeys) world.milestoneKeys.add(key);
  fillMap(world.pitchingRotations, save.pitchingRotations, "teamId");
  for (const assignment of save.bullpenAssignments) {
    const teamMap = world.bullpenAssignments.get(assignment.teamId) ?? new Map<EntityId, BullpenAssignment>();
    teamMap.set(assignment.playerId, structuredClone(assignment));
    world.bullpenAssignments.set(assignment.teamId, teamMap);
  }
  for (const record of save.standings) {
    const seasonMap = world.standings.get(record.seasonId) ?? new Map<EntityId, StandingRecord>();
    seasonMap.set(record.teamId, structuredClone(record));
    world.standings.set(record.seasonId, seasonMap);
  }
  fillMap(world.players, save.players);
  fillMap(world.managers, save.managers);
  fillMap(world.managerContracts, save.managerContracts);
  fillMap(world.managerJobVacancies, save.managerJobVacancies);
  fillMap(world.managerJobApplications, save.managerJobApplications);
  fillMap(world.managerContractOffers, save.managerContractOffers);
  fillMap(world.teams, save.teams);
  fillMap(world.scouts, save.scouts);
  fillMap(world.scoutingReports, save.scoutingReports);
  fillMap(world.drafts, save.drafts);
  fillMap(world.contractOffers, save.contractOffers);
  fillMap(world.tradeProposals, save.tradeProposals);
  fillMap(world.postingRequests, save.postingRequests);
  world.events.push(...structuredClone(save.events));
  world.assertInvariants();
  return world;
}

function parseWorldSave(input: unknown): WorldSaveData {
  if (!input || typeof input !== "object") throw new Error("저장 데이터가 객체가 아닙니다.");
  const save = input as Partial<WorldSaveData>;
  if (save.saveVersion !== WORLD_SAVE_VERSION) {
    throw new Error(`지원하지 않는 저장 버전입니다: ${String(save.saveVersion)}`);
  }
  if (!save.clock?.currentDate) throw new Error("저장 데이터에 세계 날짜가 없습니다.");
  if (save.rng?.type !== "mulberry32" || !Number.isFinite(save.rng.state)) {
    throw new Error("저장 데이터의 RNG 상태가 올바르지 않습니다.");
  }
  if (save.ids?.type !== "sequential" || !save.ids.counters || typeof save.ids.counters !== "object") {
    throw new Error("저장 데이터의 ID 생성기 상태가 올바르지 않습니다.");
  }
  for (const key of [
    "countries",
    "leagues",
    "seasons",
    "competitions",
    "organizations",
    "teams",
    "players",
    "managers",
    "events",
  ] as const) {
    if (!Array.isArray(save[key])) throw new Error(`저장 데이터의 ${key} 배열이 올바르지 않습니다.`);
  }
  return withDefaults(save);
}

function withDefaults(save: Partial<WorldSaveData>): WorldSaveData {
  return {
    saveVersion: WORLD_SAVE_VERSION,
    savedAt: save.savedAt ?? new Date().toISOString(),
    clock: save.clock!,
    rng: save.rng!,
    ids: save.ids!,
    countries: save.countries ?? [],
    leagues: save.leagues ?? [],
    seasons: save.seasons ?? [],
    competitions: save.competitions ?? [],
    organizations: save.organizations ?? [],
    teams: save.teams ?? [],
    players: save.players ?? [],
    managers: save.managers ?? [],
    managerContracts: save.managerContracts ?? [],
    managerJobVacancies: save.managerJobVacancies ?? [],
    managerJobApplications: save.managerJobApplications ?? [],
    managerContractOffers: save.managerContractOffers ?? [],
    scouts: save.scouts ?? [],
    scoutingReports: save.scoutingReports ?? [],
    drafts: save.drafts ?? [],
    games: save.games ?? [],
    gameRosters: save.gameRosters ?? [],
    liveGames: save.liveGames ?? [],
    boxScores: save.boxScores ?? [],
    accumulatedGameIds: save.accumulatedGameIds ?? [],
    battingSeasonStats: save.battingSeasonStats ?? [],
    pitchingSeasonStats: save.pitchingSeasonStats ?? [],
    battingGameLogs: save.battingGameLogs ?? [],
    pitchingGameLogs: save.pitchingGameLogs ?? [],
    milestoneKeys: save.milestoneKeys ?? [],
    pitchingRotations: save.pitchingRotations ?? [],
    bullpenAssignments: save.bullpenAssignments ?? [],
    standings: save.standings ?? [],
    contractOffers: save.contractOffers ?? [],
    tradeProposals: save.tradeProposals ?? [],
    postingRequests: save.postingRequests ?? [],
    events: save.events ?? [],
  };
}

function values<T>(map: Map<unknown, T>): T[] {
  return structuredClone([...map.values()]);
}

function fillMap<T extends object>(
  map: Map<string, T>,
  items: T[],
  key: keyof T | ((item: T) => string) = "id" as keyof T,
): void {
  for (const item of items) {
    const id = typeof key === "function" ? key(item) : String(item[key]);
    if (!id || id === "undefined") throw new Error("저장 데이터에 ID가 없는 항목이 있습니다.");
    map.set(id, structuredClone(item));
  }
}

function statKey(item: { playerId: EntityId; seasonId: EntityId; teamId?: EntityId; split: "TEAM" | "TOTAL" }): string {
  return `${item.playerId}:${item.seasonId}:${item.split}:${item.teamId ?? "TOTAL"}`;
}

function readRngState(rng: LeagueWorld["rng"]): number {
  if (rng instanceof Mulberry32Random) return rng.getState();
  throw new Error("지원하지 않는 RNG 구현은 저장할 수 없습니다.");
}

function readIdState(ids: LeagueWorld["ids"]): Record<string, number> {
  if (ids instanceof SequentialIdGenerator) return ids.getState();
  throw new Error("지원하지 않는 ID 생성기는 저장할 수 없습니다.");
}
