import type {
  CareerEntry,
  BaseState,
  BoxScore,
  BullpenAssignment,
  BatterGameLine,
  BattingLeaderboardEntry,
  Competition,
  ContractOffer,
  ContractOfferEvaluation,
  Country,
  Draft,
  DraftEligibility,
  DraftPick,
  GameActionHistoryEntry,
  GameDayRoster,
  GameFixture,
  GameRosterRules,
  GameResult,
  League,
  LiveGame,
  ManagerGameStrategy,
  Manager,
  BoardConfidence,
  ManagerApplicationEvaluation,
  ManagerContract,
  ManagerContractOffer,
  ManagerJobApplication,
  ManagerJobVacancy,
  Organization,
  PlayerBattingGameLog,
  PlayerBattingSeasonStats,
  PlayerCareerStats,
  PitchingRotation,
  PitchingLeaderboardEntry,
  PitcherGameLine,
  PlayerPitchingGameLog,
  PlayerPitchingSeasonStats,
  PlayByPlayEvent,
  PlayerContract,
  PlayerContractDemand,
  PlayerDevelopmentProfile,
  PlayerInjury,
  PlayerMarketValue,
  PostingRequest,
  StartingLineupSlot,
  Player,
  ProspectRankingEntry,
  RosterAssignment,
  Scout,
  ScoutingAttributeEstimates,
  ScoutingReport,
  Season,
  StandingRecord,
  Team,
  TradeEvaluation,
  TradeProposal,
  WorldEvent,
} from "../domain/entities.js";
import type {
  ContractOfferStatus,
  ContractOfferDecision,
  CompetitionType,
  DraftDecision,
  EntityId,
  BaseballPosition,
  BattingLeaderCategory,
  BullpenRole,
  GameActionType,
  GameHalf,
  GameStatus,
  InjurySeverity,
  ISODate,
  ManagerApplicationDecision,
  ManagerApplicationStatus,
  ManagerJobVacancyStatus,
  ManagerRole,
  PlateAppearanceResult,
  PitchingLeaderCategory,
  PersonType,
  PostingStatus,
  RosterStatus,
  ScoutingRecommendation,
  TradeAiDecision,
  WorldEventType,
} from "../domain/types.js";
import type { RealWorldSnapshotMetadata } from "../data/real/types.js";
import {
  chooseCareerOption,
  chooseManagerCareerOption,
  type CareerOption,
  type ManagerCareerOption,
} from "./career.js";
import { WorldClock } from "./clock.js";
import { SequentialIdGenerator, type IdGenerator } from "./ids.js";
import type { RandomSource } from "./rng.js";

type PlayerInput = Omit<
  Player,
  | "age"
  | "nationality"
  | "bats"
  | "throws"
  | "secondaryPositions"
  | "battingRatings"
  | "pitchingRatings"
  | "developmentProfile"
  | "injury"
  | "gameCondition"
  | "trueCurrentAbility"
  | "truePotentialAbility"
  | "currentOrganizationId"
  | "currentRosterAssignmentId"
  | "rosterStatus"
  | "rosterAssignments"
  | "contracts"
  | "careerEntries"
  | "draftEligibility"
  | "contractDemand"
  | "freeAgentStatus"
> &
  Partial<
    Pick<
      Player,
      | "age"
      | "nationality"
      | "bats"
      | "throws"
      | "secondaryPositions"
      | "battingRatings"
      | "pitchingRatings"
      | "developmentProfile"
      | "injury"
      | "gameCondition"
      | "trueCurrentAbility"
      | "truePotentialAbility"
      | "currentOrganizationId"
      | "currentRosterAssignmentId"
      | "rosterStatus"
      | "rosterAssignments"
      | "contracts"
      | "careerEntries"
      | "draftEligibility"
      | "contractDemand"
      | "freeAgentStatus"
    >
>;
type ManagerInput = Omit<
  Manager,
  | "age"
  | "nationality"
  | "employmentStatus"
  | "currentOrganizationId"
  | "contracts"
  | "careerStats"
  | "careerEntries"
  | "boardConfidence"
> &
  Partial<
    Pick<
      Manager,
      | "age"
      | "nationality"
      | "employmentStatus"
      | "currentOrganizationId"
      | "contracts"
      | "careerStats"
      | "careerEntries"
      | "boardConfidence"
    >
  >;
type PlayerContractInput = Omit<PlayerContract, "id" | "years"> & Partial<Pick<PlayerContract, "id" | "years">>;
type ManagerContractInput = Omit<ManagerContract, "id"> & Partial<Pick<ManagerContract, "id">>;
type ManagerJobVacancyInput = Omit<ManagerJobVacancy, "id" | "openedOn" | "status"> &
  Partial<Pick<ManagerJobVacancy, "id" | "openedOn" | "status">>;
type ManagerJobApplicationInput = Pick<ManagerJobApplication, "managerId" | "vacancyId"> &
  Partial<Pick<ManagerJobApplication, "id" | "desiredSalary" | "desiredYears" | "reason">>;
type ManagerContractOfferInput = Omit<
  ManagerContractOffer,
  "id" | "status" | "offeredOn" | "years" | "startDate" | "endDate" | "role" | "reason" | "expectations"
> &
  Partial<
    Pick<
      ManagerContractOffer,
      "id" | "status" | "offeredOn" | "years" | "startDate" | "endDate" | "role" | "reason" | "expectations"
    >
  >;
type SeasonInput = Omit<Season, "id" | "status" | "allowDraws" | "hasPostseason"> &
  Partial<Pick<Season, "id" | "status" | "allowDraws" | "hasPostseason">>;
type CompetitionInput = Omit<Competition, "id"> & Partial<Pick<Competition, "id">>;
type GameFixtureInput = Omit<GameFixture, "id" | "status"> &
  Partial<Pick<GameFixture, "id" | "status">>;
type GameDayRosterInput = Omit<
  GameDayRoster,
  "id" | "startingLineup" | "benchPlayerIds" | "bullpenPlayerIds" | "rules"
> &
  Partial<Pick<GameDayRoster, "id" | "startingLineup" | "benchPlayerIds" | "bullpenPlayerIds" | "rules">>;
type ScoutInput = Omit<Scout, "id"> & Partial<Pick<Scout, "id">>;
type DraftInput = Omit<Draft, "id" | "status" | "participatingOrganizationIds" | "draftOrder" | "picks"> &
  Partial<Pick<Draft, "id" | "status" | "participatingOrganizationIds" | "draftOrder">>;
type ContractOfferInput = Omit<ContractOffer, "id" | "status" | "offeredOn" | "years" | "reason"> &
  Partial<Pick<ContractOffer, "id" | "status" | "offeredOn" | "years" | "reason">>;
type TradeProposalInput = Omit<TradeProposal, "id" | "status" | "proposedOn" | "reason"> &
  Partial<Pick<TradeProposal, "id" | "status" | "proposedOn" | "reason">>;
type PostingRequestInput = Omit<PostingRequest, "id" | "requestedOn" | "status" | "reason"> &
  Partial<Pick<PostingRequest, "id" | "requestedOn" | "status" | "reason">>;

export interface ScoutingReportOptions {
  observedOn?: ISODate;
}

export interface ProspectRankingOptions {
  organizationId?: EntityId;
  draftLeagueId?: EntityId;
  positions?: string[];
  limit?: number;
}

export interface AutoGenerateLineupOptions {
  gameId: EntityId;
  teamId: EntityId;
  rules?: Partial<GameRosterRules>;
  startingPitcherId?: EntityId;
}

export interface RoundRobinScheduleOptions {
  seasonId: EntityId;
  competitionId: EntityId;
  teamIds: EntityId[];
  gamesPerOpponent: number;
  startDate: ISODate;
  restDaysBetweenRounds?: number;
  venueByHomeTeamId?: Record<string, string>;
}

export interface AdvanceWorldOptions {
  playerCareerOptions?: (player: Readonly<Player>, world: LeagueWorld) => CareerOption[];
  managerCareerOptions?: (manager: Readonly<Manager>, world: LeagueWorld) => ManagerCareerOption[];
  injuries?: boolean;
  development?: boolean;
  injuryChance?: (player: Readonly<Player>, world: LeagueWorld) => number;
}

interface GameBalanceConfig {
  conditionInfluence: number;
  strikeoutBase: number;
  strikeoutAbilityInfluence: number;
  walkBase: number;
  walkAbilityInfluence: number;
  singleBase: number;
  singleContactInfluence: number;
  doubleBase: number;
  doublePowerInfluence: number;
  tripleBase: number;
  tripleSpeedInfluence: number;
  homeRunBase: number;
  homeRunPowerInfluence: number;
  hitByPitchBase: number;
  babipBase: number;
  errorBase: number;
  doublePlayBase: number;
  sacrificeFlyBase: number;
  stealAttemptBase: number;
  sacrificeBuntAttemptBase: number;
  groundOutBase: number;
  flyOutBase: number;
  lineOutBase: number;
  starterBaseBattersFaced: number;
  starterStaminaBattersFacedInfluence: number;
  starterFatigueBattersFacedPenalty: number;
}

const GAME_BALANCE: GameBalanceConfig = {
  conditionInfluence: 8,
  strikeoutBase: 17.5,
  strikeoutAbilityInfluence: 0.1,
  walkBase: 7.5,
  walkAbilityInfluence: 0.06,
  singleBase: 12.2,
  singleContactInfluence: 0.065,
  doubleBase: 4.2,
  doublePowerInfluence: 0.04,
  tripleBase: 0.45,
  tripleSpeedInfluence: 0.006,
  homeRunBase: 2.05,
  homeRunPowerInfluence: 0.035,
  hitByPitchBase: 0.7,
  babipBase: 0.285,
  errorBase: 0.018,
  doublePlayBase: 0.28,
  sacrificeFlyBase: 0.46,
  stealAttemptBase: 0.012,
  sacrificeBuntAttemptBase: 0.006,
  groundOutBase: 20,
  flyOutBase: 17.5,
  lineOutBase: 9,
  starterBaseBattersFaced: 20,
  starterStaminaBattersFacedInfluence: 0.12,
  starterFatigueBattersFacedPenalty: 0.04,
};

export type PlayableGameControl = "USER_GAME" | "AI_GAME";

export interface CurrentDateGame {
  gameId: EntityId;
  date: ISODate;
  homeTeamId: EntityId;
  awayTeamId: EntityId;
  status: GameStatus;
  control: PlayableGameControl;
}

export interface PlayableDayOptions extends AdvanceWorldOptions {
  userManagerId?: EntityId;
  autoPlayUserGames?: boolean;
  leagueId?: EntityId;
  seasonId?: EntityId;
}

export interface CanAdvanceDateResult {
  date: ISODate;
  canAdvance: boolean;
  userTeamId?: EntityId;
  blockingGameIds: EntityId[];
  pendingGameIds: EntityId[];
  message: string;
}

export interface ProcessCurrentDayResult {
  date: ISODate;
  nextDate?: ISODate;
  userTeamId?: EntityId;
  userGameIds: EntityId[];
  aiGameIds: EntityId[];
  completedAiGameIds: EntityId[];
  completedUserGameIds: EntityId[];
  skippedGameIds: EntityId[];
  blocked: boolean;
  message: string;
}

export interface AdvancePlayableDaysResult {
  startDate: ISODate;
  endDate: ISODate;
  requestedDays: number;
  daysAdvanced: number;
  stoppedForUserGame: boolean;
  results: ProcessCurrentDayResult[];
  message: string;
}

export class LeagueWorld {
  readonly countries = new Map<EntityId, Country>();
  readonly leagues = new Map<EntityId, League>();
  readonly organizations = new Map<EntityId, Organization>();
  readonly seasons = new Map<EntityId, Season>();
  readonly competitions = new Map<EntityId, Competition>();
  readonly games = new Map<EntityId, GameFixture>();
  readonly gameRosters = new Map<EntityId, GameDayRoster>();
  readonly liveGames = new Map<EntityId, LiveGame>();
  readonly boxScores = new Map<EntityId, BoxScore>();
  readonly accumulatedGameIds = new Set<EntityId>();
  readonly battingSeasonStats = new Map<string, PlayerBattingSeasonStats>();
  readonly pitchingSeasonStats = new Map<string, PlayerPitchingSeasonStats>();
  readonly battingGameLogs: PlayerBattingGameLog[] = [];
  readonly pitchingGameLogs: PlayerPitchingGameLog[] = [];
  readonly milestoneKeys = new Set<string>();
  readonly pitchingRotations = new Map<EntityId, PitchingRotation>();
  readonly bullpenAssignments = new Map<EntityId, Map<EntityId, BullpenAssignment>>();
  readonly standings = new Map<EntityId, Map<EntityId, StandingRecord>>();
  readonly players = new Map<EntityId, Player>();
  readonly managers = new Map<EntityId, Manager>();
  readonly managerContracts = new Map<EntityId, ManagerContract>();
  readonly managerJobVacancies = new Map<EntityId, ManagerJobVacancy>();
  readonly managerJobApplications = new Map<EntityId, ManagerJobApplication>();
  readonly managerContractOffers = new Map<EntityId, ManagerContractOffer>();
  readonly teams = new Map<EntityId, Team>();
  readonly scouts = new Map<EntityId, Scout>();
  readonly scoutingReports = new Map<EntityId, ScoutingReport>();
  readonly drafts = new Map<EntityId, Draft>();
  readonly contractOffers = new Map<EntityId, ContractOffer>();
  readonly tradeProposals = new Map<EntityId, TradeProposal>();
  readonly postingRequests = new Map<EntityId, PostingRequest>();
  readonly events: WorldEvent[] = [];
  realWorldSnapshot?: RealWorldSnapshotMetadata;
  private invariantSuppressionDepth = 0;

  constructor(
    readonly clock: WorldClock,
    readonly rng: RandomSource,
    readonly ids: IdGenerator = new SequentialIdGenerator(),
  ) {}

  addCountry(country: Country): void {
    this.countries.set(country.id, structuredClone(country));
  }

  addLeague(league: League): void {
    this.requireCountry(league.countryId);
    this.leagues.set(league.id, structuredClone(league));
    const country = this.countries.get(league.countryId);
    if (country) {
      country.leagueIds = [...new Set([...(country.leagueIds ?? []), league.id])];
    }
  }

  addOrganization(organization: Organization): void {
    this.requireCountry(organization.countryId);
    this.organizations.set(organization.id, structuredClone(organization));
  }

  addTeam(team: Team): void {
    this.requireLeague(team.leagueId);
    if (team.organizationId) this.requireOrganization(team.organizationId);
    if (team.parentTeamId) {
      const parentTeam = this.requireTeam(team.parentTeamId);
      if (parentTeam.organizationId && team.organizationId && parentTeam.organizationId !== team.organizationId) {
        throw new Error(`Parent team belongs to another organization: ${parentTeam.organizationId}`);
      }
    }
    this.teams.set(team.id, structuredClone(team));
  }

  createSeason(input: SeasonInput): Season {
    this.requireLeague(input.leagueId);
    for (const season of this.seasons.values()) {
      if (season.leagueId === input.leagueId && season.year === input.year) {
        throw new Error(`Season already exists for league ${input.leagueId} in ${input.year}`);
      }
    }
    if (input.regularSeasonEndDate < input.startDate) {
      throw new Error("regularSeasonEndDate must be >= startDate");
    }
    if (input.postseasonEndDate && input.postseasonEndDate < input.regularSeasonEndDate) {
      throw new Error("postseasonEndDate must be >= regularSeasonEndDate");
    }
    const league = this.requireLeague(input.leagueId);
    const season: Season = {
      ...structuredClone(input),
      id: input.id ?? this.ids.nextId("season"),
      status: input.status ?? "PRESEASON",
      allowDraws: input.allowDraws ?? league.allowDraws ?? true,
      hasPostseason: input.hasPostseason ?? !!input.postseasonEndDate,
    };
    this.seasons.set(season.id, season);
    this.standings.set(season.id, new Map());
    return structuredClone(season);
  }

  createCompetition(input: CompetitionInput): Competition {
    const season = this.requireSeason(input.seasonId);
    if (input.leagueId !== season.leagueId) {
      throw new Error(`Competition leagueId must match season leagueId: ${input.leagueId}`);
    }
    if (input.startDate < season.startDate || input.endDate > this.seasonFinalDate(season)) {
      throw new Error("Competition dates must be inside the season range");
    }
    for (const teamId of input.participatingTeamIds) {
      this.requireTeamInLeague(teamId, season.leagueId);
      this.ensureStandingRecord(season.id, teamId);
    }
    const competition: Competition = {
      ...structuredClone(input),
      id: input.id ?? this.ids.nextId("competition"),
    };
    this.competitions.set(competition.id, competition);
    return structuredClone(competition);
  }

  scheduleGame(input: GameFixtureInput): GameFixture {
    const season = this.requireSeason(input.seasonId);
    const competition = this.requireCompetition(input.competitionId);
    if (competition.seasonId !== season.id) {
      throw new Error(`Competition ${competition.id} does not belong to season ${season.id}`);
    }
    if (input.homeTeamId === input.awayTeamId) {
      throw new Error("A team cannot play itself");
    }
    this.requireTeamInLeague(input.homeTeamId, season.leagueId);
    this.requireTeamInLeague(input.awayTeamId, season.leagueId);
    if (input.scheduledDate < season.startDate || input.scheduledDate > this.seasonFinalDate(season)) {
      throw new Error("Scheduled game is outside the season range");
    }
    this.assertNoTeamScheduleConflict(input.scheduledDate, input.homeTeamId, input.awayTeamId);
    this.ensureStandingRecord(season.id, input.homeTeamId);
    this.ensureStandingRecord(season.id, input.awayTeamId);
    const game: GameFixture = {
      ...structuredClone(input),
      id: input.id ?? this.ids.nextId("game"),
      status: input.status ?? "SCHEDULED",
    };
    this.games.set(game.id, game);
    return structuredClone(game);
  }

  generateRoundRobinSchedule(options: RoundRobinScheduleOptions): GameFixture[] {
    const season = this.requireSeason(options.seasonId);
    const competition = this.requireCompetition(options.competitionId);
    if (competition.seasonId !== season.id) {
      throw new Error(`Competition ${competition.id} does not belong to season ${season.id}`);
    }
    if (options.teamIds.length < 2) {
      throw new Error("At least two teams are required for a round-robin schedule");
    }
    if (!Number.isInteger(options.gamesPerOpponent) || options.gamesPerOpponent <= 0) {
      throw new Error("gamesPerOpponent must be a positive integer");
    }
    const uniqueTeamIds = new Set(options.teamIds);
    if (uniqueTeamIds.size !== options.teamIds.length) {
      throw new Error("Round-robin teamIds must be unique");
    }
    for (const teamId of options.teamIds) {
      this.requireTeamInLeague(teamId, season.leagueId);
    }

    const games: GameFixture[] = [];
    let offsetDays = 0;
    for (let repeat = 0; repeat < options.gamesPerOpponent; repeat += 1) {
      for (let homeIndex = 0; homeIndex < options.teamIds.length - 1; homeIndex += 1) {
        for (let awayIndex = homeIndex + 1; awayIndex < options.teamIds.length; awayIndex += 1) {
          const teamA = options.teamIds[homeIndex]!;
          const teamB = options.teamIds[awayIndex]!;
          const flipHome = repeat % 2 === 1;
          const homeTeamId = flipHome ? teamB : teamA;
          const awayTeamId = flipHome ? teamA : teamB;
          const scheduledDate = this.addDays(options.startDate, offsetDays);
          games.push(
            this.scheduleGame({
              seasonId: season.id,
              competitionId: competition.id,
              homeTeamId,
              awayTeamId,
              scheduledDate,
              ...(options.venueByHomeTeamId?.[homeTeamId]
                ? { venue: options.venueByHomeTeamId[homeTeamId] }
                : {}),
            }),
          );
          offsetDays += 1 + (options.restDaysBetweenRounds ?? 0);
        }
      }
    }
    return games;
  }

  recordGameResult(gameId: EntityId, result: GameResult): GameFixture {
    return this.completeGame(gameId, result);
  }

  completeGame(gameId: EntityId, result: GameResult): GameFixture {
    const game = this.requireGame(gameId);
    if (game.status === "COMPLETED") {
      throw new Error(`Game is already completed: ${gameId}`);
    }
    if (game.status === "CANCELLED") {
      throw new Error(`Cancelled game cannot be completed: ${gameId}`);
    }
    this.validateGameResult(result);
    const season = this.requireSeason(game.seasonId);
    if (!season.allowDraws && result.homeScore === result.awayScore) {
      throw new Error(`Season does not allow draws: ${season.id}`);
    }
    return this.finalizeGame(game, result, "경기 결과 입력");
  }

  postponeGame(gameId: EntityId, reason: string): void {
    const game = this.requireGame(gameId);
    if (game.status === "COMPLETED") {
      throw new Error(`Completed game cannot be postponed: ${gameId}`);
    }
    game.status = "POSTPONED";
    this.record("GAME_POSTPONED", {
      subjectId: game.id,
      teamId: game.homeTeamId,
      reason,
      payload: { gameId: game.id, seasonId: game.seasonId },
    });
    this.assertInvariants();
  }

  getStandings(seasonId: EntityId): StandingRecord[] {
    this.requireSeason(seasonId);
    return [...(this.standings.get(seasonId)?.values() ?? [])]
      .map((record) => structuredClone(record))
      .sort((a, b) => b.winningPercentage - a.winningPercentage || a.gamesBehind - b.gamesBehind);
  }

  getPlayerBattingSeasonStats(playerId: EntityId, seasonId: EntityId): PlayerBattingSeasonStats[] {
    this.requirePlayer(playerId);
    this.requireSeason(seasonId);
    return [...this.battingSeasonStats.values()]
      .filter((stats) => stats.playerId === playerId && stats.seasonId === seasonId)
      .map((stats) => structuredClone(stats))
      .sort((a, b) => (a.split === "TOTAL" ? -1 : b.split === "TOTAL" ? 1 : (a.teamId ?? "").localeCompare(b.teamId ?? "")));
  }

  getPlayerPitchingSeasonStats(playerId: EntityId, seasonId: EntityId): PlayerPitchingSeasonStats[] {
    this.requirePlayer(playerId);
    this.requireSeason(seasonId);
    return [...this.pitchingSeasonStats.values()]
      .filter((stats) => stats.playerId === playerId && stats.seasonId === seasonId)
      .map((stats) => structuredClone(stats))
      .sort((a, b) => (a.split === "TOTAL" ? -1 : b.split === "TOTAL" ? 1 : (a.teamId ?? "").localeCompare(b.teamId ?? "")));
  }

  getPlayerGameLogs(playerId: EntityId): {
    batting: PlayerBattingGameLog[];
    pitching: PlayerPitchingGameLog[];
  } {
    this.requirePlayer(playerId);
    return {
      batting: this.battingGameLogs.filter((log) => log.playerId === playerId).map((log) => structuredClone(log)),
      pitching: this.pitchingGameLogs.filter((log) => log.playerId === playerId).map((log) => structuredClone(log)),
    };
  }

  getPlayerCareerStats(
    playerId: EntityId,
    filters: { leagueId?: EntityId; teamId?: EntityId } = {},
  ): PlayerCareerStats {
    this.requirePlayer(playerId);
    const battingStats = [...this.battingSeasonStats.values()].filter(
      (stats) =>
        stats.playerId === playerId &&
        stats.split === (filters.teamId ? "TEAM" : "TOTAL") &&
        (!filters.teamId || stats.teamId === filters.teamId) &&
        (!filters.leagueId || this.requireSeason(stats.seasonId).leagueId === filters.leagueId),
    );
    const pitchingStats = [...this.pitchingSeasonStats.values()].filter(
      (stats) =>
        stats.playerId === playerId &&
        stats.split === (filters.teamId ? "TEAM" : "TOTAL") &&
        (!filters.teamId || stats.teamId === filters.teamId) &&
        (!filters.leagueId || this.requireSeason(stats.seasonId).leagueId === filters.leagueId),
    );
    return {
      playerId,
      ...(filters.leagueId ? { leagueId: filters.leagueId } : {}),
      ...(filters.teamId ? { teamId: filters.teamId } : {}),
      batting: this.deriveBattingTotals(this.sumBattingStats(battingStats)),
      pitching: this.derivePitchingTotals(this.sumPitchingStats(pitchingStats)),
    };
  }

  getBattingLeaders(
    seasonId: EntityId,
    category: BattingLeaderCategory,
    options: { qualifiedOnly?: boolean; limit?: number } = {},
  ): BattingLeaderboardEntry[] {
    const season = this.requireSeason(seasonId);
    const league = this.requireLeague(season.leagueId);
    const minimumPlateAppearances = league.battingQualificationPlateAppearances ?? 0;
    const entries = [...this.battingSeasonStats.values()]
      .filter((stats) => stats.seasonId === seasonId && stats.split === "TOTAL")
      .map((stats) => ({
        playerId: stats.playerId,
        seasonId,
        value: this.battingLeaderValue(stats, category),
        stats: structuredClone(stats),
        qualified: stats.plateAppearances >= minimumPlateAppearances,
      }))
      .filter((entry) => !options.qualifiedOnly || entry.qualified)
      .sort((a, b) => b.value - a.value || b.stats.plateAppearances - a.stats.plateAppearances || a.playerId.localeCompare(b.playerId));
    return entries.slice(0, options.limit ?? entries.length);
  }

  getPitchingLeaders(
    seasonId: EntityId,
    category: PitchingLeaderCategory,
    options: { qualifiedOnly?: boolean; limit?: number } = {},
  ): PitchingLeaderboardEntry[] {
    const season = this.requireSeason(seasonId);
    const league = this.requireLeague(season.leagueId);
    const minimumOuts = league.pitchingQualificationOuts ?? 0;
    const lowerIsBetter = category === "ERA" || category === "WHIP";
    const entries = [...this.pitchingSeasonStats.values()]
      .filter((stats) => stats.seasonId === seasonId && stats.split === "TOTAL")
      .map((stats) => ({
        playerId: stats.playerId,
        seasonId,
        value: this.pitchingLeaderValue(stats, category),
        stats: structuredClone(stats),
        qualified: stats.outsRecorded >= minimumOuts,
      }))
      .filter((entry) => !options.qualifiedOnly || entry.qualified)
      .sort((a, b) => {
        const valueOrder = lowerIsBetter ? a.value - b.value : b.value - a.value;
        return valueOrder || b.stats.outsRecorded - a.stats.outsRecorded || a.playerId.localeCompare(b.playerId);
      });
    return entries.slice(0, options.limit ?? entries.length);
  }

  addScout(input: ScoutInput): Scout {
    this.requireOrganization(input.organizationId);
    const scout: Scout = {
      ...structuredClone(input),
      id: input.id ?? this.ids.nextId("scout"),
      abilityEvaluation: this.clampRating(input.abilityEvaluation),
      potentialEvaluation: this.clampRating(input.potentialEvaluation),
      regionalKnowledge: this.clampRating(input.regionalKnowledge),
      experience: this.clampRating(input.experience),
    };
    this.scouts.set(scout.id, scout);
    this.assertInvariants();
    return structuredClone(scout);
  }

  createScoutingReport(
    scoutId: EntityId,
    playerId: EntityId,
    options: ScoutingReportOptions = {},
  ): ScoutingReport {
    const scout = this.requireScout(scoutId);
    const player = this.requirePlayer(playerId);
    const priorCount = [...this.scoutingReports.values()].filter(
      (report) => report.playerId === playerId && report.organizationId === scout.organizationId,
    ).length;
    const abilitySkill = (scout.abilityEvaluation * 0.55 + scout.experience * 0.25 + scout.regionalKnowledge * 0.2);
    const potentialSkill = (scout.potentialEvaluation * 0.6 + scout.experience * 0.25 + scout.regionalKnowledge * 0.15);
    const confidence = this.clampRating(25 + abilitySkill * 0.28 + potentialSkill * 0.22 + priorCount * 12);
    const caError = this.scoutingError(abilitySkill, priorCount);
    const paError = this.scoutingError(potentialSkill, priorCount);
    const estimatedCA = this.clampRating(player.trueCurrentAbility + caError);
    const estimatedPA = this.clampRating(player.truePotentialAbility + paError);
    const rangeWidth = Math.max(4, Math.round((100 - confidence) * 0.32));
    const estimatedPARange = {
      low: this.clampRating(estimatedPA - rangeWidth),
      high: this.clampRating(estimatedPA + rangeWidth),
    };
    if (estimatedPARange.high < estimatedPARange.low) {
      estimatedPARange.high = estimatedPARange.low;
    }
    const report: ScoutingReport = {
      id: this.ids.nextId("scout_report"),
      scoutId,
      playerId,
      organizationId: scout.organizationId,
      observedOn: options.observedOn ?? this.clock.now(),
      estimatedCA,
      estimatedPARange,
      attributeEstimates: this.estimateAttributes(player, abilitySkill, priorCount),
      confidence,
      overallGrade: this.clampRating(estimatedCA * 0.35 + ((estimatedPARange.low + estimatedPARange.high) / 2) * 0.65),
      recommendation: this.scoutingRecommendation(estimatedCA, estimatedPARange, confidence),
    };
    this.scoutingReports.set(report.id, report);
    this.assertInvariants();
    return structuredClone(report);
  }

  getProspectRankings(options: ProspectRankingOptions = {}): ProspectRankingEntry[] {
    if (options.organizationId) this.requireOrganization(options.organizationId);
    if (options.draftLeagueId) this.requireLeague(options.draftLeagueId);
    const positionSet = options.positions ? new Set(options.positions) : undefined;
    const entries = [...this.players.values()]
      .filter((player) => this.isProspectCandidate(player))
      .filter((player) => !positionSet || positionSet.has(player.primaryPosition))
      .filter((player) => !options.draftLeagueId || player.draftEligibility?.draftLeagueId === options.draftLeagueId)
      .map((player) => {
        const report = this.latestScoutingReport(player.id, options.organizationId);
        const estimatedCA = report?.estimatedCA ?? this.publicProspectEstimate(player, "CA");
        const estimatedPARange = report?.estimatedPARange ?? {
          low: this.clampRating(this.publicProspectEstimate(player, "PA") - 18),
          high: this.clampRating(this.publicProspectEstimate(player, "PA") + 18),
        };
        const confidence = report?.confidence ?? 15;
        const score =
          estimatedCA * 0.25 +
          ((estimatedPARange.low + estimatedPARange.high) / 2) * 0.58 +
          confidence * 0.08 -
          Math.max(0, player.age - 18) * 1.7 +
          this.positionScarcityBonus(player.primaryPosition, options.organizationId);
        return {
          rank: 0,
          playerId: player.id,
          ...(report ? { reportId: report.id } : {}),
          score: this.roundRate(score),
          estimatedCA,
          estimatedPARange: structuredClone(estimatedPARange),
          confidence,
          age: player.age,
          primaryPosition: player.primaryPosition,
        };
      })
      .sort((a, b) => b.score - a.score || b.confidence - a.confidence || a.playerId.localeCompare(b.playerId))
      .slice(0, options.limit ?? Number.POSITIVE_INFINITY);
    return entries.map((entry, index) => ({ ...entry, rank: index + 1 }));
  }

  evaluateDraftEligibility(playerId: EntityId, draftLeagueId: EntityId, draftYear: number): DraftEligibility {
    const player = this.requirePlayer(playerId);
    this.requireLeague(draftLeagueId);
    const eligible =
      player.status !== "RETIRED" &&
      player.status !== "PROFESSIONAL" &&
      player.age >= 15 &&
      player.age <= 25;
    const eligibility: DraftEligibility = {
      eligible,
      declared: false,
      draftYear,
      draftLeagueId,
      reason: eligible ? "드래프트 자격 충족" : "드래프트 자격 미충족",
      status: eligible ? "ELIGIBLE" : "NOT_ELIGIBLE",
    };
    player.draftEligibility = eligibility;
    this.assertInvariants();
    return structuredClone(eligibility);
  }

  decideDraftDeclaration(playerId: EntityId, draftLeagueId: EntityId, draftYear: number): DraftEligibility {
    const player = this.requirePlayer(playerId);
    const base = player.draftEligibility?.draftLeagueId === draftLeagueId && player.draftEligibility.draftYear === draftYear
      ? player.draftEligibility
      : this.evaluateDraftEligibility(playerId, draftLeagueId, draftYear);
    if (!base.eligible) return structuredClone(base);
    const decision = this.chooseDraftDecision(player);
    const declared = decision === "DECLARE";
    player.draftEligibility = {
      ...base,
      declared,
      decision,
      status: declared ? "DECLARED" : "ELIGIBLE",
      reason: this.draftDecisionReason(decision),
    };
    if (declared) {
      this.record("DRAFT_DECLARED", {
        subjectId: player.id,
        reason: player.draftEligibility.reason,
        payload: { draftLeagueId, draftYear, decision },
      });
    }
    this.assertInvariants();
    return structuredClone(player.draftEligibility);
  }

  createDraft(input: DraftInput): Draft {
    const season = this.requireSeason(input.seasonId);
    if (season.leagueId !== input.leagueId) {
      throw new Error(`Draft league must match season league: ${input.leagueId}`);
    }
    this.requireLeague(input.leagueId);
    if (!Number.isInteger(input.rounds) || input.rounds <= 0) {
      throw new Error("Draft rounds must be a positive integer");
    }
    const draftOrder = input.draftOrder?.length
      ? structuredClone(input.draftOrder)
      : this.defaultDraftOrder(input.seasonId);
    const participatingOrganizationIds = input.participatingOrganizationIds?.length
      ? structuredClone(input.participatingOrganizationIds)
      : [...new Set(draftOrder)];
    if (draftOrder.length === 0) {
      throw new Error("Draft order requires at least one organization");
    }
    for (const organizationId of participatingOrganizationIds) this.requireOrganization(organizationId);
    for (const organizationId of draftOrder) {
      this.requireOrganization(organizationId);
      if (!participatingOrganizationIds.includes(organizationId)) {
        throw new Error(`Draft order organization is not participating: ${organizationId}`);
      }
    }
    const draftId = input.id ?? this.ids.nextId("draft");
    const picks: DraftPick[] = [];
    let overallPick = 1;
    for (let round = 1; round <= input.rounds; round += 1) {
      for (const organizationId of draftOrder) {
        picks.push({
          id: this.ids.nextId("pick"),
          draftId,
          round,
          overallPick,
          organizationId,
          status: "UNSELECTED",
        });
        overallPick += 1;
      }
    }
    const draft: Draft = {
      id: draftId,
      leagueId: input.leagueId,
      seasonId: input.seasonId,
      year: input.year,
      rounds: input.rounds,
      status: input.status ?? "SCHEDULED",
      participatingOrganizationIds,
      draftOrder,
      picks,
    };
    this.drafts.set(draft.id, draft);
    this.assertInvariants();
    return structuredClone(draft);
  }

  getAvailableDraftPlayers(draftId: EntityId): Player[] {
    const draft = this.requireDraft(draftId);
    const selected = new Set(draft.picks.flatMap((pick) => pick.playerId ? [pick.playerId] : []));
    return [...this.players.values()]
      .filter((player) =>
        player.draftEligibility?.eligible &&
        player.draftEligibility.declared &&
        player.draftEligibility.draftLeagueId === draft.leagueId &&
        player.draftEligibility.draftYear === draft.year &&
        player.status !== "RETIRED" &&
        !selected.has(player.id)
      )
      .map((player) => structuredClone(player))
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  makeDraftPick(draftId: EntityId, organizationId: EntityId, playerId: EntityId): DraftPick {
    const draft = this.requireDraft(draftId);
    const player = this.requirePlayer(playerId);
    this.requireOrganization(organizationId);
    if (draft.status === "COMPLETED") throw new Error(`Completed draft cannot add picks: ${draftId}`);
    if (!draft.participatingOrganizationIds.includes(organizationId)) {
      throw new Error(`Organization is not participating in draft: ${organizationId}`);
    }
    if (draft.picks.some((pick) => pick.playerId === playerId)) {
      throw new Error(`Player already selected in draft: ${playerId}`);
    }
    this.assertPlayerDraftEligible(player, draft);
    const pick = this.nextDraftPick(draft, organizationId);
    if (!pick) throw new Error(`No remaining pick for organization ${organizationId}`);
    draft.status = "IN_PROGRESS";
    pick.playerId = player.id;
    pick.selectedAt = this.clock.now();
    pick.status = "DRAFTED";
    player.draftEligibility = {
      ...player.draftEligibility!,
      status: "DRAFTED",
      declared: true,
      reason: "프로 드래프트 지명",
    };
    this.recordDraftCareerEntry(player, draft, pick);
    this.record("PLAYER_DRAFTED", {
      subjectId: player.id,
      reason: "프로 드래프트 지명",
      payload: { draftId, organizationId, round: pick.round, overallPick: pick.overallPick },
    });
    this.assertInvariants();
    return structuredClone(pick);
  }

  autoDraftPick(draftId: EntityId, organizationId?: EntityId): DraftPick {
    const draft = this.requireDraft(draftId);
    const pick = organizationId ? this.nextDraftPick(draft, organizationId) : draft.picks.find((candidate) => !candidate.playerId);
    if (!pick) throw new Error(`No remaining draft pick: ${draftId}`);
    const candidates = this.getAvailableDraftPlayers(draftId);
    if (candidates.length === 0) throw new Error(`No available draft players: ${draftId}`);
    const selected = candidates
      .map((player) => ({
        player,
        score: this.draftBoardScore(player, pick.organizationId),
      }))
      .sort((a, b) => b.score - a.score || a.player.id.localeCompare(b.player.id))[0]!.player;
    return this.makeDraftPick(draftId, pick.organizationId, selected.id);
  }

  runDraft(draftId: EntityId): Draft {
    const draft = this.requireDraft(draftId);
    while (draft.picks.some((pick) => !pick.playerId) && this.getAvailableDraftPlayers(draftId).length > 0) {
      this.autoDraftPick(draftId);
    }
    this.completeDraft(draft);
    this.assertInvariants();
    return structuredClone(draft);
  }

  setPlayerContractDemand(playerId: EntityId, demand: PlayerContractDemand): PlayerContractDemand {
    const player = this.requirePlayer(playerId);
    player.contractDemand = this.normalizeContractDemand(demand);
    this.assertInvariants();
    return structuredClone(player.contractDemand);
  }

  makeContractOffer(input: ContractOfferInput): ContractOffer {
    const player = this.requirePlayer(input.playerId);
    this.requireOrganization(input.organizationId);
    if (player.status === "RETIRED") throw new Error(`Retired player cannot receive a contract offer: ${player.id}`);
    if (input.endDate < input.startDate) throw new Error("Contract offer endDate must be >= startDate");
    if (!Number.isFinite(input.salary) || input.salary < 0) throw new Error("Contract offer salary must be non-negative");
    if (input.draftId) {
      const draft = this.requireDraft(input.draftId);
      if (!draft.picks.some((pick) => pick.playerId === player.id && pick.organizationId === input.organizationId)) {
        throw new Error(`Drafted player can only negotiate with drafting organization: ${player.id}`);
      }
    } else if (input.postingRequestId) {
      const posting = this.requirePostingRequest(input.postingRequestId);
      if (posting.playerId !== player.id || posting.status !== "APPROVED") {
        throw new Error(`Posting request is not open for this player: ${input.postingRequestId}`);
      }
      const targetLeagueIds = new Set(posting.targetLeagueIds);
      const hasTargetTeam = [...this.teams.values()].some(
        (team) => team.organizationId === input.organizationId && targetLeagueIds.has(team.leagueId),
      );
      if (!hasTargetTeam) throw new Error(`Organization is not in a posting target league: ${input.organizationId}`);
    } else if (player.currentOrganizationId && player.currentOrganizationId !== input.organizationId) {
      throw new Error(`Non-free player belongs to another organization: ${player.currentOrganizationId}`);
    } else if (!player.currentOrganizationId && player.status !== "FREE_AGENT" && player.draftEligibility?.status !== "DRAFTED") {
      throw new Error(`Player is not a free agent or drafted negotiable player: ${player.id}`);
    }
    if (player.status === "FREE_AGENT" && !player.freeAgentStatus?.eligible) {
      throw new Error(`Free agent status is not eligible: ${player.id}`);
    }

    const offer: ContractOffer = {
      ...structuredClone(input),
      id: input.id ?? this.ids.nextId("offer"),
      status: input.status ?? "PENDING",
      offeredOn: input.offeredOn ?? this.clock.now(),
      years: input.years ?? this.contractYears(input.startDate, input.endDate),
      signingBonus: input.signingBonus ?? 0,
      reason: input.reason ?? "계약 제안",
    };
    this.contractOffers.set(offer.id, offer);
    this.record("CONTRACT_OFFERED", {
      subjectId: player.id,
      reason: offer.reason,
      payload: { offerId: offer.id, organizationId: offer.organizationId, salary: offer.salary, years: offer.years },
    });
    this.assertInvariants();
    return structuredClone(offer);
  }

  evaluateContractOffer(offerId: EntityId): ContractOfferEvaluation {
    const offer = this.requireContractOffer(offerId);
    const player = this.requirePlayer(offer.playerId);
    const demand = player.contractDemand ?? this.defaultContractDemand(player);
    const organizationScore = this.organizationOpportunityScore(player, offer.organizationId);
    const salaryScore = Math.min(150, (offer.salary + (offer.signingBonus ?? 0) / Math.max(1, offer.years)) / Math.max(1, demand.desiredSalary) * 100);
    const minimumPenalty = offer.salary < demand.minimumSalary || offer.years < demand.minimumYears ? -45 : 0;
    const yearsScore = Math.min(120, offer.years / Math.max(1, demand.desiredYears) * 100);
    const preferenceScore = this.contractPreferenceScore(offer, demand);
    const score = this.roundRate(salaryScore * 0.42 + yearsScore * 0.18 + organizationScore * 0.25 + preferenceScore * 0.15 + minimumPenalty + this.rng.next() * 3);
    const decision: ContractOfferDecision = score >= 72 ? "ACCEPT" : score < 48 ? "REJECT" : "HOLD";
    return {
      offerId,
      playerId: player.id,
      organizationId: offer.organizationId,
      decision,
      score,
      reason: decision === "ACCEPT" ? "조건과 기회가 요구에 부합" : decision === "REJECT" ? "요구 조건과 차이가 큼" : "추가 제안 대기",
    };
  }

  acceptContractOffer(offerId: EntityId): PlayerContract {
    const offer = this.requireContractOffer(offerId);
    if (offer.status !== "PENDING") throw new Error(`Contract offer is not pending: ${offerId}`);
    const player = this.requirePlayer(offer.playerId);
    if (player.status === "RETIRED") throw new Error(`Retired player cannot sign a contract: ${player.id}`);
    if (offer.postingRequestId) {
      const active = this.activeContract(player);
      if (active) active.contractStatus = "TERMINATED";
      this.closeOpenRosterAssignment(player, "포스팅 해외 계약");
      delete player.currentTeamId;
      delete player.currentOrganizationId;
      delete player.rosterStatus;
    }
    const contract = this.registerContract({
      playerId: offer.playerId,
      organizationId: offer.organizationId,
      startDate: offer.startDate,
      endDate: offer.endDate,
      years: offer.years,
      salary: offer.salary,
      currency: offer.currency,
      ...(offer.signingBonus !== undefined ? { signingBonus: offer.signingBonus } : {}),
      ...(offer.noTradeClause !== undefined ? { noTradeClause: offer.noTradeClause } : {}),
      ...(offer.playerOption !== undefined ? { playerOption: offer.playerOption } : {}),
      ...(offer.teamOption !== undefined ? { teamOption: offer.teamOption } : {}),
      contractStatus: "ACTIVE",
    });
    offer.status = "ACCEPTED";
    for (const other of this.contractOffers.values()) {
      if (other.playerId === offer.playerId && other.id !== offer.id && other.status === "PENDING") {
        other.status = "REJECTED";
      }
    }
    this.markDraftPickSigned(offer);
    this.completePostingIfNeeded(offer);
    return contract;
  }

  rejectContractOffer(offerId: EntityId, reason = "계약 제안 거절"): ContractOffer {
    const offer = this.requireContractOffer(offerId);
    if (offer.status !== "PENDING") throw new Error(`Contract offer is not pending: ${offerId}`);
    offer.status = "REJECTED";
    if (offer.draftId) {
      const player = this.requirePlayer(offer.playerId);
      if (player.draftEligibility?.status === "DRAFTED") {
        player.draftEligibility.status = "UNSIGNED_DRAFTEE";
        player.draftEligibility.reason = reason;
      }
      const draft = this.requireDraft(offer.draftId);
      const pick = draft.picks.find((candidate) => candidate.playerId === offer.playerId && candidate.organizationId === offer.organizationId);
      if (pick) pick.status = "UNSIGNED";
    }
    this.record("CONTRACT_REJECTED", {
      subjectId: offer.playerId,
      reason,
      payload: { offerId, organizationId: offer.organizationId },
    });
    this.failPostingIfAllOffersRejected(offer);
    this.assertInvariants();
    return structuredClone(offer);
  }

  withdrawContractOffer(offerId: EntityId, reason = "계약 제안 철회"): ContractOffer {
    const offer = this.requireContractOffer(offerId);
    if (offer.status !== "PENDING") throw new Error(`Contract offer is not pending: ${offerId}`);
    offer.status = "WITHDRAWN";
    this.record("CONTRACT_REJECTED", {
      subjectId: offer.playerId,
      reason,
      payload: { offerId, organizationId: offer.organizationId, withdrawn: true },
    });
    this.failPostingIfAllOffersRejected(offer);
    this.assertInvariants();
    return structuredClone(offer);
  }

  chooseBestContractOffer(playerId: EntityId): ContractOfferEvaluation {
    this.requirePlayer(playerId);
    const evaluations = [...this.contractOffers.values()]
      .filter((offer) => offer.playerId === playerId && offer.status === "PENDING")
      .map((offer) => this.evaluateContractOffer(offer.id))
      .sort((a, b) => b.score - a.score || a.organizationId.localeCompare(b.organizationId));
    if (evaluations.length === 0) throw new Error(`No pending offers for player: ${playerId}`);
    return evaluations[0]!;
  }

  expireContracts(onDate: ISODate = this.clock.now()): void {
    for (const player of this.players.values()) {
      const active = this.activeContract(player);
      if (!active || active.endDate >= onDate) continue;
      active.contractStatus = "EXPIRED";
      const previousOrganizationId = player.currentOrganizationId;
      this.closeOpenRosterAssignment(player, "계약 만료");
      delete player.currentTeamId;
      delete player.currentOrganizationId;
      player.status = "FREE_AGENT";
      player.freeAgentStatus = {
        eligible: true,
        becameFreeAgentOn: onDate,
        ...(previousOrganizationId ? { previousOrganizationId } : {}),
        type: "CONTRACT_EXPIRED",
      };
      this.replaceCareerEntry(player, "PLAYER", {
        role: player.primaryPosition,
        status: player.status,
        reason: "계약 만료 FA",
        organizationNameSnapshot: "Free Agent",
      });
      this.record("PLAYER_BECAME_FREE_AGENT", {
        subjectId: player.id,
        reason: "계약 만료 FA",
        payload: { previousOrganizationId, type: "CONTRACT_EXPIRED" },
      }, onDate);
    }
    this.assertInvariants();
  }

  proposeTrade(input: TradeProposalInput): TradeProposal {
    this.requireOrganization(input.proposerOrganizationId);
    this.requireOrganization(input.targetOrganizationId);
    if (input.proposerOrganizationId === input.targetOrganizationId) throw new Error("Trade organizations must differ");
    this.assertTradePlayerLists(input.proposerOrganizationId, input.targetOrganizationId, input.playersFromProposer, input.playersFromTarget);
    const proposal: TradeProposal = {
      ...structuredClone(input),
      id: input.id ?? this.ids.nextId("trade"),
      status: input.status ?? "PROPOSED",
      proposedOn: input.proposedOn ?? this.clock.now(),
      cash: input.cash ?? 0,
      draftPickIds: structuredClone(input.draftPickIds ?? []),
      reason: input.reason ?? "트레이드 제안",
    };
    this.tradeProposals.set(proposal.id, proposal);
    this.record("TRADE_PROPOSED", {
      reason: proposal.reason,
      payload: { proposalId: proposal.id, proposerOrganizationId: proposal.proposerOrganizationId, targetOrganizationId: proposal.targetOrganizationId },
    });
    this.assertInvariants();
    return structuredClone(proposal);
  }

  evaluateTradeProposal(proposalId: EntityId, organizationId?: EntityId): TradeEvaluation {
    const proposal = this.requireTradeProposal(proposalId);
    const evaluatorId = organizationId ?? proposal.targetOrganizationId;
    if (evaluatorId !== proposal.proposerOrganizationId && evaluatorId !== proposal.targetOrganizationId) {
      throw new Error(`Organization is not part of trade: ${evaluatorId}`);
    }
    const incoming = evaluatorId === proposal.targetOrganizationId ? proposal.playersFromProposer : proposal.playersFromTarget;
    const outgoing = evaluatorId === proposal.targetOrganizationId ? proposal.playersFromTarget : proposal.playersFromProposer;
    const incomingValue = incoming.reduce((sum, playerId) => sum + this.calculatePlayerMarketValue(playerId, evaluatorId).value, 0) + (proposal.cash ?? 0);
    const outgoingValue = outgoing.reduce((sum, playerId) => sum + this.calculatePlayerMarketValue(playerId, evaluatorId).value, 0);
    const score = this.roundRate(incomingValue - outgoingValue);
    if (score >= -5) {
      return { proposalId, organizationId: evaluatorId, decision: "ACCEPT", score, reason: "교환 가치가 수용 가능" };
    }
    if (score >= -22) {
      const counter = this.buildCounterProposal(proposal, evaluatorId);
      return { proposalId, organizationId: evaluatorId, decision: "COUNTER", score, reason: "추가 보상이 필요", counterProposal: structuredClone(counter) };
    }
    return { proposalId, organizationId: evaluatorId, decision: "REJECT", score, reason: "전력 가치 손실이 큼" };
  }

  finalizeTrade(proposalId: EntityId): TradeProposal {
    const proposal = this.requireTradeProposal(proposalId);
    if (proposal.status === "COMPLETED") throw new Error(`Trade already completed: ${proposalId}`);
    if (proposal.status === "REJECTED" || proposal.status === "WITHDRAWN") throw new Error(`Trade cannot be finalized: ${proposal.status}`);
    this.assertTradePlayerLists(proposal.proposerOrganizationId, proposal.targetOrganizationId, proposal.playersFromProposer, proposal.playersFromTarget);
    const original = [...proposal.playersFromProposer, ...proposal.playersFromTarget].map((playerId) => ({
      playerId,
      player: structuredClone(this.requirePlayer(playerId)),
    }));
    try {
      for (const playerId of proposal.playersFromProposer) {
        this.transferPlayerOrganizationOnly(playerId, proposal.targetOrganizationId, "트레이드 이적");
      }
      for (const playerId of proposal.playersFromTarget) {
        this.transferPlayerOrganizationOnly(playerId, proposal.proposerOrganizationId, "트레이드 이적");
      }
      proposal.status = "COMPLETED";
      this.record("PLAYER_TRADED", {
        reason: "트레이드 완료",
        payload: {
          proposalId,
          proposerOrganizationId: proposal.proposerOrganizationId,
          targetOrganizationId: proposal.targetOrganizationId,
          playersFromProposer: proposal.playersFromProposer,
          playersFromTarget: proposal.playersFromTarget,
        },
      });
      this.assertInvariants();
      return structuredClone(proposal);
    } catch (error) {
      for (const snapshot of original) this.players.set(snapshot.playerId, snapshot.player);
      throw error;
    }
  }

  requestPosting(input: PostingRequestInput): PostingRequest {
    const player = this.requirePlayer(input.playerId);
    const currentOrganizationId = input.currentOrganizationId ?? player.currentOrganizationId;
    if (!currentOrganizationId) throw new Error(`Posting player must have a current organization: ${player.id}`);
    if (player.currentOrganizationId !== currentOrganizationId) throw new Error(`Posting organization does not control player: ${player.id}`);
    this.requireOrganization(currentOrganizationId);
    this.requireLeague(input.sourceLeagueId);
    for (const leagueId of input.targetLeagueIds) this.requireLeague(leagueId);
    const sourceTeam = [...this.teams.values()].find((team) => team.organizationId === currentOrganizationId && team.leagueId === input.sourceLeagueId);
    if (!sourceTeam) throw new Error(`Posting source league does not match player's organization: ${input.sourceLeagueId}`);
    const posting: PostingRequest = {
      ...structuredClone(input),
      id: input.id ?? this.ids.nextId("posting"),
      currentOrganizationId,
      requestedOn: input.requestedOn ?? this.clock.now(),
      status: input.status ?? "APPROVED",
      reason: input.reason ?? "포스팅 요청",
    };
    this.postingRequests.set(posting.id, posting);
    this.record("POSTING_REQUESTED", {
      subjectId: player.id,
      reason: posting.reason,
      payload: { postingRequestId: posting.id, currentOrganizationId, sourceLeagueId: posting.sourceLeagueId, targetLeagueIds: posting.targetLeagueIds },
    });
    this.assertInvariants();
    return structuredClone(posting);
  }

  failPosting(postingRequestId: EntityId, reason = "포스팅 실패"): PostingRequest {
    const posting = this.requirePostingRequest(postingRequestId);
    if (posting.status === "COMPLETED") throw new Error(`Completed posting cannot fail: ${postingRequestId}`);
    posting.status = "FAILED";
    this.record("POSTING_FAILED", {
      subjectId: posting.playerId,
      reason,
      payload: { postingRequestId },
    });
    this.assertInvariants();
    return structuredClone(posting);
  }

  calculatePlayerMarketValue(
    playerId: EntityId,
    viewerOrganizationId?: EntityId,
    currency = "USD",
  ): PlayerMarketValue {
    const player = this.requirePlayer(playerId);
    if (viewerOrganizationId) this.requireOrganization(viewerOrganizationId);
    const report = viewerOrganizationId ? this.latestScoutingReport(playerId, viewerOrganizationId) : undefined;
    const estimatedCurrentAbility = report?.estimatedCA ?? player.currentAbility;
    const estimatedPotentialAbility = report
      ? (report.estimatedPARange.low + report.estimatedPARange.high) / 2
      : player.potentialAbility;
    const active = this.activeContract(player);
    const yearsRemaining = active ? Math.max(0, this.contractYears(this.clock.now(), active.endDate)) : 0;
    const contractBurden = active ? (active.salary / 1_000_000) * Math.max(0.5, yearsRemaining) : 0;
    const recentStats = this.getPlayerCareerStats(playerId);
    const production = recentStats.batting.homeRuns * 0.25 + recentStats.batting.hits * 0.03 + recentStats.pitching.strikeouts * 0.04;
    const ageCurve = player.age <= 24 ? 14 : player.age <= 30 ? 8 : player.age <= 34 ? 0 : -12;
    const value = this.roundRate(
      Math.max(0, estimatedCurrentAbility * 0.55 + estimatedPotentialAbility * 0.7 + production + ageCurve - contractBurden),
    );
    return {
      playerId,
      ...(viewerOrganizationId ? { organizationId: viewerOrganizationId } : {}),
      value,
      currency,
      estimatedCurrentAbility: this.clampRating(estimatedCurrentAbility),
      estimatedPotentialAbility: this.clampRating(estimatedPotentialAbility),
      contractBurden: this.roundRate(contractBurden),
      yearsRemaining,
    };
  }

  createGameRoster(input: GameDayRosterInput): GameDayRoster {
    const game = this.requireGame(input.gameId);
    this.requireGameTeam(game, input.teamId);
    const rules = this.resolveGameRosterRules(game, input.rules);
    const roster: GameDayRoster = {
      id: input.id ?? this.ids.nextId("game_roster"),
      gameId: input.gameId,
      teamId: input.teamId,
      activePlayerIds: structuredClone(input.activePlayerIds),
      startingLineup: this.normalizeStartingLineup(input.startingLineup ?? []),
      ...(input.startingPitcherId ? { startingPitcherId: input.startingPitcherId } : {}),
      benchPlayerIds: structuredClone(input.benchPlayerIds ?? []),
      bullpenPlayerIds: structuredClone(input.bullpenPlayerIds ?? []),
      rules,
    };
    this.gameRosters.set(roster.id, roster);
    const issues = this.validateGameRoster(input.gameId, input.teamId);
    if (issues.length > 0) {
      this.gameRosters.delete(roster.id);
      throw new Error(`Invalid game roster: ${issues.join("; ")}`);
    }
    this.record("GAME_ROSTER_CREATED", {
      subjectId: game.id,
      teamId: input.teamId,
      reason: "경기 엔트리 생성",
      payload: { rosterId: roster.id, activePlayers: roster.activePlayerIds.length },
    });
    this.assertInvariants();
    return structuredClone(roster);
  }

  setStartingLineup(gameId: EntityId, teamId: EntityId, lineup: StartingLineupSlot[]): GameDayRoster {
    const roster = this.requireGameRoster(gameId, teamId);
    const previous = structuredClone(roster.startingLineup);
    roster.startingLineup = this.normalizeStartingLineup(lineup);
    const issues = this.validateGameRoster(gameId, teamId);
    if (issues.length > 0) {
      roster.startingLineup = previous;
      throw new Error(`Invalid starting lineup: ${issues.join("; ")}`);
    }
    this.record("LINEUP_SET", {
      subjectId: gameId,
      teamId,
      reason: "선발 라인업 설정",
      payload: { rosterId: roster.id, battingOrderSize: roster.startingLineup.length },
    });
    return structuredClone(roster);
  }

  setStartingPitcher(gameId: EntityId, teamId: EntityId, playerId: EntityId): GameDayRoster {
    const roster = this.requireGameRoster(gameId, teamId);
    const previous = roster.startingPitcherId;
    roster.startingPitcherId = playerId;
    const issues = this.validateGameRoster(gameId, teamId);
    if (issues.length > 0) {
      if (previous) roster.startingPitcherId = previous;
      else delete roster.startingPitcherId;
      throw new Error(`Invalid starting pitcher: ${issues.join("; ")}`);
    }
    this.record("STARTING_PITCHER_SET", {
      subjectId: gameId,
      teamId,
      reason: "선발투수 설정",
      payload: { rosterId: roster.id, playerId },
    });
    return structuredClone(roster);
  }

  setPitchingRotation(
    teamId: EntityId,
    orderedStartingPitcherIds: EntityId[],
    nextStarterIndex = 0,
  ): PitchingRotation {
    this.requireTeam(teamId);
    if (orderedStartingPitcherIds.length === 0) {
      throw new Error("Pitching rotation requires at least one pitcher");
    }
    if (new Set(orderedStartingPitcherIds).size !== orderedStartingPitcherIds.length) {
      throw new Error("Pitching rotation cannot contain duplicate pitchers");
    }
    for (const playerId of orderedStartingPitcherIds) {
      this.assertPlayerBelongsToTeam(playerId, teamId);
    }
    if (
      !Number.isInteger(nextStarterIndex) ||
      nextStarterIndex < 0 ||
      nextStarterIndex >= orderedStartingPitcherIds.length
    ) {
      throw new Error("nextStarterIndex is outside the pitching rotation");
    }
    const rotation: PitchingRotation = {
      teamId,
      orderedStartingPitcherIds: structuredClone(orderedStartingPitcherIds),
      nextStarterIndex,
    };
    this.pitchingRotations.set(teamId, rotation);
    this.assertInvariants();
    return structuredClone(rotation);
  }

  selectNextStartingPitcher(teamId: EntityId): EntityId {
    const rotation = this.pitchingRotations.get(teamId);
    if (!rotation) throw new Error(`Pitching rotation not found for team: ${teamId}`);
    const playerId = rotation.orderedStartingPitcherIds[rotation.nextStarterIndex]!;
    rotation.nextStarterIndex = (rotation.nextStarterIndex + 1) % rotation.orderedStartingPitcherIds.length;
    return playerId;
  }

  setStartingPitcherFromRotation(gameId: EntityId, teamId: EntityId): GameDayRoster {
    return this.setStartingPitcher(gameId, teamId, this.selectNextStartingPitcher(teamId));
  }

  assignBullpenRole(teamId: EntityId, playerId: EntityId, roles: BullpenRole[]): BullpenAssignment {
    this.requireTeam(teamId);
    this.assertPlayerBelongsToTeam(playerId, teamId);
    if (roles.length === 0) throw new Error("At least one bullpen role is required");
    for (const role of roles) this.assertValidBullpenRole(role);
    const assignment: BullpenAssignment = {
      teamId,
      playerId,
      roles: [...new Set(roles)],
    };
    const teamAssignments = this.bullpenAssignments.get(teamId) ?? new Map<EntityId, BullpenAssignment>();
    teamAssignments.set(playerId, assignment);
    this.bullpenAssignments.set(teamId, teamAssignments);
    return structuredClone(assignment);
  }

  autoGenerateLineup(options: AutoGenerateLineupOptions): GameDayRoster {
    const game = this.requireGame(options.gameId);
    this.requireGameTeam(game, options.teamId);
    const rules = this.resolveGameRosterRules(game, options.rules);
    const startingPitcherId =
      options.startingPitcherId ??
      (this.pitchingRotations.has(options.teamId) ? this.selectNextStartingPitcher(options.teamId) : undefined);
    const candidates = [...this.players.values()].filter(
      (player) => player.currentTeamId === options.teamId && this.isPlayerAvailableForGame(player),
    );
    const requiredPositions = this.requiredLineupPositions(rules);
    const selected = new Set<EntityId>();
    const pitcherId =
      startingPitcherId ??
      this.bestLineupCandidate(candidates, new Set<EntityId>(), "P")?.id;
    if (!pitcherId) throw new Error("No available starting pitcher candidate");
    if (rules.usesDH) selected.add(pitcherId);
    const lineup: StartingLineupSlot[] = [];

    for (const position of requiredPositions) {
      const forcedPitcher =
        position === "P"
          ? candidates.find((player) => player.id === pitcherId && !selected.has(player.id))
          : undefined;
      const player =
        forcedPitcher ??
        this.bestLineupCandidate(candidates, selected, position);
      if (!player) {
        throw new Error(`Not enough available players to fill ${position}`);
      }
      selected.add(player.id);
      lineup.push(this.makeLineupSlot(lineup.length + 1, player.id, position));
    }

    const activePlayerIds = this.rankGameCandidates(candidates, "DH")
      .map((player) => player.id)
      .slice(0, rules.maxActivePlayers);
    for (const playerId of [...selected, pitcherId]) {
      if (!activePlayerIds.includes(playerId)) activePlayerIds.unshift(playerId);
    }
    const cappedActivePlayerIds = activePlayerIds.slice(0, rules.maxActivePlayers);
    const benchPlayerIds = cappedActivePlayerIds.filter((playerId) => !selected.has(playerId) && playerId !== pitcherId);
    const bullpenPlayerIds = cappedActivePlayerIds.filter((playerId) => {
      const player = this.requirePlayer(playerId);
      return playerId !== pitcherId && !selected.has(playerId) && this.positionFit(player, "P") >= 60;
    });

    return this.createGameRoster({
      gameId: options.gameId,
      teamId: options.teamId,
      activePlayerIds: cappedActivePlayerIds,
      startingLineup: lineup,
      startingPitcherId: pitcherId,
      benchPlayerIds,
      bullpenPlayerIds,
      rules,
    });
  }

  validateGameRoster(gameId: EntityId, teamId: EntityId): string[] {
    const game = this.games.get(gameId);
    const roster = this.findGameRoster(gameId, teamId);
    const issues: string[] = [];
    if (!game) {
      issues.push(`Game not found: ${gameId}`);
      return issues;
    }
    if (!roster) {
      issues.push(`Game roster missing for team ${teamId}`);
      return issues;
    }
    this.validateGameRosterState(roster, issues);
    return issues;
  }

  validateGameReady(gameId: EntityId): string[] {
    const game = this.games.get(gameId);
    const issues: string[] = [];
    if (!game) {
      issues.push(`Game not found: ${gameId}`);
      return issues;
    }
    if (game.scheduledDate !== this.clock.now()) {
      issues.push(`Game ${gameId} is scheduled for ${game.scheduledDate}, not ${this.clock.now()}`);
    }
    for (const teamId of [game.homeTeamId, game.awayTeamId]) {
      const roster = this.findGameRoster(gameId, teamId);
      if (!roster) {
        issues.push(`Game roster missing for team ${teamId}`);
      } else {
        this.validateGameRosterState(roster, issues);
      }
    }
    return issues;
  }

  startGame(gameId: EntityId): LiveGame {
    const game = this.requireGame(gameId);
    if (game.status === "COMPLETED") {
      throw new Error(`Completed game cannot be started: ${gameId}`);
    }
    if (game.status !== "SCHEDULED") {
      throw new Error(`Game must be scheduled before start: ${gameId}`);
    }
    if (this.liveGames.has(gameId)) {
      throw new Error(`Game is already started: ${gameId}`);
    }
    const readyIssues = this.validateGameReady(gameId);
    if (readyIssues.length > 0) {
      throw new Error(`Game is not ready: ${readyIssues.join("; ")}`);
    }
    const homeRoster = this.requireGameRoster(gameId, game.homeTeamId);
    const awayRoster = this.requireGameRoster(gameId, game.awayTeamId);
    const liveGame: LiveGame = {
      gameId,
      inning: 1,
      half: "TOP",
      outs: 0,
      homeScore: 0,
      awayScore: 0,
      bases: { first: null, second: null, third: null },
      currentBatterId: this.sortedLineup(awayRoster)[0]!.playerId,
      currentPitcherId: homeRoster.startingPitcherId!,
      homeLineupIndex: 0,
      awayLineupIndex: 0,
      status: "IN_PROGRESS",
      boxScore: this.createEmptyBoxScore(game),
      playByPlay: [],
      actionHistory: [],
      removedPlayerIds: [],
      currentDefense: {
        [game.homeTeamId]: structuredClone(this.sortedLineup(homeRoster)),
        [game.awayTeamId]: structuredClone(this.sortedLineup(awayRoster)),
      },
      strategies: {
        [game.homeTeamId]: this.defaultManagerGameStrategy(),
        [game.awayTeamId]: this.defaultManagerGameStrategy(),
      },
    };
    this.liveGames.set(gameId, liveGame);
    this.record("GAME_STARTED", {
      subjectId: game.id,
      teamId: game.homeTeamId,
      reason: "경기 시작",
      payload: { homeTeamId: game.homeTeamId, awayTeamId: game.awayTeamId },
    });
    this.assertInvariants();
    return structuredClone(liveGame);
  }

  simulatePlateAppearance(batterId: EntityId, pitcherId: EntityId): PlateAppearanceResult {
    const batter = this.requirePlayer(batterId);
    const pitcher = this.requirePlayer(pitcherId);
    const batterCondition = (batter.gameCondition.readiness - batter.gameCondition.fatigue * 0.45) / 100;
    const pitcherCondition = (pitcher.gameCondition.readiness - pitcher.gameCondition.fatigue * 0.45) / 100;
    const conditionEdge = (batterCondition - pitcherCondition) * GAME_BALANCE.conditionInfluence;
    const contactEdge =
      batter.battingRatings.contact -
      pitcher.pitchingRatings.movement * 0.65 -
      pitcher.pitchingRatings.pitchQuality * 0.2 +
      conditionEdge;
    const disciplineEdge =
      batter.battingRatings.plateDiscipline -
      pitcher.pitchingRatings.control +
      conditionEdge;
    const powerEdge =
      batter.battingRatings.power -
      pitcher.pitchingRatings.movement * 0.35 -
      pitcher.pitchingRatings.pitchQuality * 0.55 +
      conditionEdge;
    const babipEdge = this.babipEdge(batter, pitcher);
    const strikeoutEdge =
      pitcher.pitchingRatings.velocity * 0.45 +
      pitcher.pitchingRatings.pitchQuality * 0.45 -
      batter.battingRatings.contact * 0.55 -
      batter.battingRatings.plateDiscipline * 0.2 -
      conditionEdge;

    const weights: Partial<Record<PlateAppearanceResult, number>> = {
      STRIKEOUT: this.clampWeight(GAME_BALANCE.strikeoutBase + strikeoutEdge * GAME_BALANCE.strikeoutAbilityInfluence),
      WALK: this.clampWeight(GAME_BALANCE.walkBase + disciplineEdge * GAME_BALANCE.walkAbilityInfluence),
      HIT_BY_PITCH: this.clampWeight(GAME_BALANCE.hitByPitchBase + (100 - pitcher.pitchingRatings.control) * 0.004),
      SINGLE: this.clampWeight(
        GAME_BALANCE.singleBase +
        contactEdge * GAME_BALANCE.singleContactInfluence +
        babipEdge * 7 +
        batter.battingRatings.speed * 0.008,
      ),
      DOUBLE: this.clampWeight(
        GAME_BALANCE.doubleBase +
        powerEdge * GAME_BALANCE.doublePowerInfluence +
        babipEdge * 1.6 +
        contactEdge * 0.012,
      ),
      TRIPLE: this.clampWeight(
        GAME_BALANCE.tripleBase +
        batter.battingRatings.speed * GAME_BALANCE.tripleSpeedInfluence +
        babipEdge * 0.4 +
        contactEdge * 0.004,
      ),
      HOME_RUN: this.clampWeight(
        GAME_BALANCE.homeRunBase +
        powerEdge * GAME_BALANCE.homeRunPowerInfluence +
        batter.battingRatings.power * 0.005,
      ),
      GROUND_OUT: this.clampWeight(GAME_BALANCE.groundOutBase - contactEdge * 0.02),
      FLY_OUT: this.clampWeight(GAME_BALANCE.flyOutBase - powerEdge * 0.015),
      LINE_OUT: this.clampWeight(GAME_BALANCE.lineOutBase + contactEdge * 0.005),
    };
    return this.weightedPlateAppearance(weights);
  }

  simulateNextPlateAppearance(gameId: EntityId): PlayByPlayEvent {
    const liveGame = this.requireLiveGame(gameId);
    if (liveGame.status !== "IN_PROGRESS") {
      throw new Error(`Game is not in progress: ${gameId}`);
    }
    this.runManagerAi(gameId, this.defenseTeamId(this.requireGame(gameId), liveGame.half));
    const stealEvent = this.maybeAttemptSteal(gameId);
    if (stealEvent) return stealEvent;
    const buntEvent = this.maybeAttemptSacrificeBunt(gameId);
    if (buntEvent) return buntEvent;
    const result = this.simulatePlateAppearance(liveGame.currentBatterId, liveGame.currentPitcherId);
    return this.applyPlateAppearanceResult(gameId, result, { resolveContext: true });
  }

  applyPlateAppearanceResult(
    gameId: EntityId,
    result: PlateAppearanceResult,
    options: { resolveContext?: boolean } = {},
  ): PlayByPlayEvent {
    const liveGame = this.requireLiveGame(gameId);
    if (liveGame.status !== "IN_PROGRESS") {
      throw new Error(`Game is not in progress: ${gameId}`);
    }
    if (!this.isPlateAppearanceResult(result)) {
      throw new Error(`Invalid plate appearance result: ${result}`);
    }

    const game = this.requireGame(gameId);
    const offenseTeamId = this.offenseTeamId(game, liveGame.half);
    const defenseTeamId = this.defenseTeamId(game, liveGame.half);
    const batterId = liveGame.currentBatterId;
    const pitcherId = liveGame.currentPitcherId;
    const officialResult = options.resolveContext
      ? this.resolveBattedBallResult(liveGame, defenseTeamId, result)
      : result;
    const { runsScored, scoredPlayerIds, rbiCredit, fielderId } = this.advanceBases(liveGame, officialResult, batterId, defenseTeamId);
    const officialOutsAdded = this.outsForResult(officialResult);
    liveGame.outs += officialOutsAdded;
    if (liveGame.half === "TOP") {
      liveGame.awayScore += runsScored;
    } else {
      liveGame.homeScore += runsScored;
    }
    this.addInningRuns(liveGame, offenseTeamId, runsScored);
    this.updateBoxScoreForPlateAppearance(
      liveGame,
      offenseTeamId,
      defenseTeamId,
      batterId,
      pitcherId,
      officialResult,
      runsScored,
      scoredPlayerIds,
      rbiCredit,
      officialOutsAdded,
      fielderId,
    );
    this.applyGameFatigue(batterId, pitcherId, officialResult);
    this.advanceLineupIndex(liveGame, game);

    const event: PlayByPlayEvent = {
      inning: liveGame.inning,
      half: liveGame.half,
      batterId,
      pitcherId,
      result: officialResult,
      runsScored,
      outsAfter: liveGame.outs,
      scoreAfter: { homeScore: liveGame.homeScore, awayScore: liveGame.awayScore },
      ...(fielderId ? { fielderId } : {}),
    };
    liveGame.playByPlay.push(event);

    if (this.shouldWalkOff(liveGame)) {
      this.completeLiveGame(liveGame, "끝내기 득점");
      return structuredClone(event);
    }
    if (liveGame.outs >= 3) {
      this.advanceHalfInning(liveGame);
    } else {
      this.setCurrentMatchup(liveGame);
    }
    this.assertInvariants();
    return structuredClone(event);
  }

  replacePitcher(
    gameId: EntityId,
    teamId: EntityId,
    pitcherInId: EntityId,
    options: { managerId?: EntityId; reason?: string; ai?: boolean } = {},
  ): GameActionHistoryEntry {
    const liveGame = this.requireLiveGame(gameId);
    const game = this.requireGame(gameId);
    if (liveGame.status !== "IN_PROGRESS") throw new Error(`Game is not in progress: ${gameId}`);
    if (teamId !== this.defenseTeamId(game, liveGame.half)) {
      throw new Error(`Pitching change team must be on defense: ${teamId}`);
    }
    const roster = this.requireGameRoster(gameId, teamId);
    const pitcherOutId = liveGame.currentPitcherId;
    this.assertSubstitutionPlayerAvailable(liveGame, roster, pitcherInId, "bullpen");
    if (!roster.bullpenPlayerIds.includes(pitcherInId)) {
      throw new Error(`Pitcher ${pitcherInId} is not in the bullpen`);
    }
    liveGame.currentPitcherId = pitcherInId;
    roster.startingPitcherId = pitcherInId;
    this.removePlayerFromGameReserveLists(roster, pitcherInId);
    this.updateDefensivePosition(liveGame, teamId, pitcherOutId, pitcherInId, "P");
    this.markPlayerRemoved(liveGame, pitcherOutId);
    this.ensurePitcherGameLine(liveGame.boxScore, pitcherInId, teamId);
    const action = this.recordGameAction(liveGame, {
      type: "PITCHING_CHANGE",
      teamId,
      ...(options.managerId ? { managerId: options.managerId } : {}),
      playerOutId: pitcherOutId,
      playerInId: pitcherInId,
      description: options.reason ?? "투수 교체",
      metadata: { ai: options.ai ?? false },
    });
    this.assertInvariants();
    return structuredClone(action);
  }

  warmUpPitcher(gameId: EntityId, teamId: EntityId, pitcherId: EntityId, managerId?: EntityId): GameActionHistoryEntry {
    const liveGame = this.requireLiveGame(gameId);
    const roster = this.requireGameRoster(gameId, teamId);
    if (!roster.bullpenPlayerIds.includes(pitcherId)) throw new Error(`Pitcher ${pitcherId} is not in the bullpen`);
    return structuredClone(this.recordGameAction(liveGame, {
      type: "PITCHING_CHANGE",
      teamId,
      ...(managerId ? { managerId } : {}),
      playerInId: pitcherId,
      description: "불펜 대기 시작",
      metadata: { warmUpOnly: true },
    }));
  }

  usePinchHitter(
    gameId: EntityId,
    teamId: EntityId,
    hitterInId: EntityId,
    options: { managerId?: EntityId; reason?: string; defensivePosition?: BaseballPosition } = {},
  ): GameActionHistoryEntry {
    const liveGame = this.requireLiveGame(gameId);
    const game = this.requireGame(gameId);
    if (teamId !== this.offenseTeamId(game, liveGame.half)) throw new Error(`Pinch hitter team must be batting: ${teamId}`);
    const roster = this.requireGameRoster(gameId, teamId);
    this.assertSubstitutionPlayerAvailable(liveGame, roster, hitterInId, "bench");
    const lineupIndex = liveGame.half === "TOP" ? liveGame.awayLineupIndex : liveGame.homeLineupIndex;
    const lineup = this.sortedLineup(roster);
    const oldSlot = lineup[lineupIndex]!;
    const battingOrder = oldSlot.battingOrder;
    const slot = roster.startingLineup.find((candidate) => candidate.battingOrder === battingOrder)!;
    const playerOutId = slot.playerId;
    slot.playerId = hitterInId;
    const defensivePosition = options.defensivePosition ?? slot.defensivePosition;
    Object.assign(slot, this.makeLineupSlot(battingOrder, hitterInId, defensivePosition));
    liveGame.currentBatterId = hitterInId;
    this.removePlayerFromGameReserveLists(roster, hitterInId);
    this.markPlayerRemoved(liveGame, playerOutId);
    this.ensureBatterGameLine(liveGame.boxScore, hitterInId, teamId);
    const action = this.recordGameAction(liveGame, {
      type: "PINCH_HITTER",
      teamId,
      ...(options.managerId ? { managerId: options.managerId } : {}),
      playerOutId,
      playerInId: hitterInId,
      description: options.reason ?? "대타 투입",
      metadata: { battingOrder, defensivePosition },
    });
    this.assertInvariants();
    return structuredClone(action);
  }

  usePinchRunner(
    gameId: EntityId,
    teamId: EntityId,
    runnerOutId: EntityId,
    runnerInId: EntityId,
    options: { managerId?: EntityId; reason?: string } = {},
  ): GameActionHistoryEntry {
    const liveGame = this.requireLiveGame(gameId);
    const game = this.requireGame(gameId);
    if (teamId !== this.offenseTeamId(game, liveGame.half)) throw new Error(`Pinch runner team must be batting: ${teamId}`);
    const roster = this.requireGameRoster(gameId, teamId);
    this.assertSubstitutionPlayerAvailable(liveGame, roster, runnerInId, "bench");
    const base = this.findRunnerBase(liveGame, runnerOutId);
    if (!base) throw new Error(`Runner ${runnerOutId} is not on base`);
    const lineupSlot = roster.startingLineup.find((slot) => slot.playerId === runnerOutId);
    if (lineupSlot) {
      Object.assign(lineupSlot, this.makeLineupSlot(lineupSlot.battingOrder, runnerInId, lineupSlot.defensivePosition));
    }
    liveGame.bases[base] = runnerInId;
    this.removePlayerFromGameReserveLists(roster, runnerInId);
    this.markPlayerRemoved(liveGame, runnerOutId);
    this.ensureBatterGameLine(liveGame.boxScore, runnerInId, teamId);
    const action = this.recordGameAction(liveGame, {
      type: "PINCH_RUNNER",
      teamId,
      ...(options.managerId ? { managerId: options.managerId } : {}),
      playerOutId: runnerOutId,
      playerInId: runnerInId,
      description: options.reason ?? "대주자 투입",
      metadata: { base },
    });
    this.assertInvariants();
    return structuredClone(action);
  }

  makeDefensiveSubstitution(
    gameId: EntityId,
    teamId: EntityId,
    playerOutId: EntityId,
    playerInId: EntityId,
    defensivePosition: BaseballPosition,
    options: { managerId?: EntityId; reason?: string } = {},
  ): GameActionHistoryEntry {
    const liveGame = this.requireLiveGame(gameId);
    const roster = this.requireGameRoster(gameId, teamId);
    this.assertSubstitutionPlayerAvailable(liveGame, roster, playerInId, "bench");
    const slot = roster.startingLineup.find((candidate) => candidate.playerId === playerOutId);
    if (!slot) throw new Error(`Player ${playerOutId} is not in the lineup`);
    this.assertValidDefensivePosition(defensivePosition);
    Object.assign(slot, this.makeLineupSlot(slot.battingOrder, playerInId, defensivePosition));
    this.removePlayerFromGameReserveLists(roster, playerInId);
    this.updateDefensivePosition(liveGame, teamId, playerOutId, playerInId, defensivePosition);
    this.markPlayerRemoved(liveGame, playerOutId);
    this.ensureBatterGameLine(liveGame.boxScore, playerInId, teamId);
    const action = this.recordGameAction(liveGame, {
      type: "DEFENSIVE_SUBSTITUTION",
      teamId,
      ...(options.managerId ? { managerId: options.managerId } : {}),
      playerOutId,
      playerInId,
      description: options.reason ?? "수비 교체",
      metadata: { defensivePosition },
    });
    this.setCurrentMatchup(liveGame);
    this.assertInvariants();
    return structuredClone(action);
  }

  changeDefensivePosition(
    gameId: EntityId,
    teamId: EntityId,
    playerId: EntityId,
    defensivePosition: BaseballPosition,
    options: { managerId?: EntityId; reason?: string } = {},
  ): GameActionHistoryEntry {
    const liveGame = this.requireLiveGame(gameId);
    const roster = this.requireGameRoster(gameId, teamId);
    const slot = roster.startingLineup.find((candidate) => candidate.playerId === playerId);
    if (!slot) throw new Error(`Player ${playerId} is not in the lineup`);
    this.assertValidDefensivePosition(defensivePosition);
    Object.assign(slot, this.makeLineupSlot(slot.battingOrder, playerId, defensivePosition));
    this.syncCurrentDefenseFromRoster(liveGame, teamId);
    const action = this.recordGameAction(liveGame, {
      type: "POSITION_CHANGE",
      teamId,
      ...(options.managerId ? { managerId: options.managerId } : {}),
      playerInId: playerId,
      description: options.reason ?? "수비 위치 변경",
      metadata: { defensivePosition },
    });
    this.assertInvariants();
    return structuredClone(action);
  }

  setManagerGameStrategy(gameId: EntityId, teamId: EntityId, strategy: ManagerGameStrategy): ManagerGameStrategy {
    const liveGame = this.requireLiveGame(gameId);
    this.requireGameTeam(this.requireGame(gameId), teamId);
    liveGame.strategies[teamId] = this.normalizeManagerGameStrategy(strategy);
    this.assertInvariants();
    return structuredClone(liveGame.strategies[teamId]!);
  }

  runManagerAi(gameId: EntityId, teamId: EntityId): GameActionHistoryEntry | undefined {
    const liveGame = this.requireLiveGame(gameId);
    const game = this.requireGame(gameId);
    if (liveGame.status !== "IN_PROGRESS") return undefined;
    if (teamId !== this.defenseTeamId(game, liveGame.half)) return undefined;
    const currentPitcher = this.requirePlayer(liveGame.currentPitcherId);
    const threshold = this.bullpenFatigueThresholdForGame(gameId);
    const strategy = liveGame.strategies[teamId] ?? this.defaultManagerGameStrategy();
    const pitcherLine = liveGame.boxScore.pitchers[liveGame.currentPitcherId];
    const battersFacedLimit = this.startingPitcherBattersFacedLimit(currentPitcher);
    const shouldConsider =
      currentPitcher.gameCondition.fatigue >= threshold - strategy.bullpenAggression * 0.2 ||
      (pitcherLine?.battersFaced ?? 0) >= battersFacedLimit;
    if (!shouldConsider) return undefined;
    const candidate = this.chooseBullpenReplacement(liveGame, teamId);
    if (!candidate) return undefined;
    return this.replacePitcher(gameId, teamId, candidate, { reason: "AI 투수 교체", ai: true });
  }

  simulateHalfInning(gameId: EntityId): LiveGame {
    const liveGame = this.requireLiveGame(gameId);
    const startInning = liveGame.inning;
    const startHalf = liveGame.half;
    while (
      liveGame.status === "IN_PROGRESS" &&
      liveGame.inning === startInning &&
      liveGame.half === startHalf
    ) {
      this.simulateNextPlateAppearance(gameId);
    }
    return structuredClone(liveGame);
  }

  simulateInning(gameId: EntityId): LiveGame {
    const liveGame = this.requireLiveGame(gameId);
    const startInning = liveGame.inning;
    while (liveGame.status === "IN_PROGRESS" && liveGame.inning === startInning) {
      this.simulateNextPlateAppearance(gameId);
    }
    return structuredClone(liveGame);
  }

  simulateGame(gameId: EntityId): LiveGame {
    return this.withInvariantChecksSuppressed(() => {
      if (!this.liveGames.has(gameId)) this.startGame(gameId);
      let plateAppearances = 0;
      while (this.requireLiveGame(gameId).status === "IN_PROGRESS") {
        this.simulateNextPlateAppearance(gameId);
        plateAppearances += 1;
        if (plateAppearances > 2000) {
          throw new Error(`Game simulation exceeded safety limit: ${gameId}`);
        }
      }
      this.assertInvariantsNow();
      return structuredClone(this.requireLiveGame(gameId));
    });
  }

  addPlayer(player: PlayerInput): void {
    const currentTeam = player.currentTeamId ? this.requireTeam(player.currentTeamId) : undefined;
    const stored = this.normalizePlayerInput(player);
    if (currentTeam?.organizationId) {
      if (stored.currentOrganizationId && stored.currentOrganizationId !== currentTeam.organizationId) {
        throw new Error(`Player currentOrganizationId does not match currentTeamId: ${stored.id}`);
      }
      stored.currentOrganizationId = currentTeam.organizationId;
    }
    this.players.set(player.id, stored);
    if (stored.currentTeamId) {
      this.startCareerEntry(stored, "PLAYER", {
        teamId: stored.currentTeamId,
        role: stored.primaryPosition,
        status: stored.status,
        reason: "PLAYER_CREATED",
      });
    }
    this.record("PLAYER_CREATED", {
      subjectId: player.id,
      ...(player.currentTeamId ? { teamId: player.currentTeamId } : {}),
    });
  }

  addManager(manager: ManagerInput): void {
    const stored = this.normalizeManagerInput(manager);
    this.managers.set(manager.id, stored);
    if (stored.currentTeamId) {
      this.startCareerEntry(stored, "MANAGER", {
        teamId: stored.currentTeamId,
        role: "MANAGER",
        status: stored.status,
        reason: "MANAGER_CREATED",
      });
    }
    this.record("MANAGER_CREATED", {
      subjectId: manager.id,
      ...(manager.currentTeamId ? { teamId: manager.currentTeamId } : {}),
    });
    this.assertInvariants();
  }

  registerManagerContract(contract: ManagerContractInput): ManagerContract {
    const manager = this.requireManager(contract.managerId);
    this.requireOrganization(contract.organizationId);
    if (contract.teamId) {
      const team = this.requireTeam(contract.teamId);
      if (team.organizationId !== contract.organizationId) {
        throw new Error(`Manager contract team does not belong to organization: ${contract.teamId}`);
      }
    }
    if (manager.status === "RETIRED") {
      throw new Error(`Retired manager cannot sign a contract: ${manager.id}`);
    }
    this.assertValidManagerContractShape(contract);
    if (contract.status === "ACTIVE" && this.activeManagerContract(manager)) {
      throw new Error(`Manager already has an active contract: ${manager.id}`);
    }
    const stored: ManagerContract = {
      ...structuredClone(contract),
      id: contract.id ?? this.ids.nextId("manager_contract"),
    };
    manager.contracts.push(stored);
    this.managerContracts.set(stored.id, stored);
    if (stored.status === "ACTIVE") {
      this.assignManagerEmployment(manager, stored.organizationId, stored.teamId, stored.role, "감독 계약 등록");
    }
    this.assertInvariants();
    return structuredClone(stored);
  }

  openManagerJobVacancy(input: ManagerJobVacancyInput): ManagerJobVacancy {
    this.requireOrganization(input.organizationId);
    const team = this.requireTeam(input.teamId);
    if (team.organizationId !== input.organizationId) {
      throw new Error(`Manager vacancy team does not belong to organization: ${input.teamId}`);
    }
    if (this.managerForTeam(input.teamId)) {
      throw new Error(`Team already has an active manager: ${input.teamId}`);
    }
    this.assertSalaryRange(input.salaryRange);
    this.assertYearsRange(input.contractYearsRange);
    const vacancy: ManagerJobVacancy = {
      ...structuredClone(input),
      id: input.id ?? this.ids.nextId("manager_job"),
      openedOn: input.openedOn ?? this.clock.now(),
      status: input.status ?? "OPEN",
    };
    this.managerJobVacancies.set(vacancy.id, vacancy);
    this.assertInvariants();
    return structuredClone(vacancy);
  }

  getManagerJobVacancies(status: ManagerJobVacancyStatus = "OPEN"): ManagerJobVacancy[] {
    return [...this.managerJobVacancies.values()]
      .filter((vacancy) => vacancy.status === status)
      .sort((a, b) => a.openedOn.localeCompare(b.openedOn) || a.id.localeCompare(b.id))
      .map((vacancy) => structuredClone(vacancy));
  }

  applyForManagerJob(input: ManagerJobApplicationInput): ManagerJobApplication {
    const manager = this.requireManager(input.managerId);
    const vacancy = this.requireManagerJobVacancy(input.vacancyId);
    if (manager.status === "RETIRED") throw new Error(`Retired manager cannot apply for a job: ${manager.id}`);
    if (vacancy.status !== "OPEN") throw new Error(`Manager job vacancy is not open: ${vacancy.id}`);
    const existing = [...this.managerJobApplications.values()].find(
      (application) => application.managerId === manager.id && application.vacancyId === vacancy.id && application.status !== "WITHDRAWN",
    );
    if (existing) throw new Error(`Manager already applied for this job: ${manager.id}`);
    const application: ManagerJobApplication = {
      id: input.id ?? this.ids.nextId("manager_application"),
      vacancyId: vacancy.id,
      managerId: manager.id,
      organizationId: vacancy.organizationId,
      teamId: vacancy.teamId,
      appliedOn: this.clock.now(),
      status: "APPLIED",
      ...(input.desiredSalary !== undefined ? { desiredSalary: input.desiredSalary } : {}),
      ...(input.desiredYears !== undefined ? { desiredYears: input.desiredYears } : {}),
      reason: input.reason ?? "감독직 지원",
    };
    this.managerJobApplications.set(application.id, application);
    this.assertInvariants();
    return structuredClone(application);
  }

  evaluateManagerApplication(applicationId: EntityId): ManagerApplicationEvaluation {
    const application = this.requireManagerJobApplication(applicationId);
    const manager = this.requireManager(application.managerId);
    const vacancy = this.requireManagerJobVacancy(application.vacancyId);
    const stats = manager.careerStats;
    const winRateScore = stats.games > 0 ? stats.winningPercentage * 100 : 45;
    const desiredSalary = application.desiredSalary ?? vacancy.salaryRange.min;
    const salaryPressure = Math.max(0, (desiredSalary - vacancy.salaryRange.max) / Math.max(1, vacancy.salaryRange.max) * 28);
    const minimumPenalty = vacancy.minimumReputation && manager.reputation < vacancy.minimumReputation ? 35 : 0;
    const preferredBonus = vacancy.preferredReputation ? Math.min(18, Math.max(0, manager.reputation - vacancy.preferredReputation) * 0.45) : 0;
    const score = this.roundRate(
      manager.reputation * 0.55 +
        winRateScore * 0.18 +
        stats.championships * 4 +
        preferredBonus -
        salaryPressure -
        minimumPenalty +
        this.rng.next() * 4,
    );
    const decision: ManagerApplicationDecision = score >= 64 ? "OFFER" : score < 42 ? "REJECT" : "HOLD";
    return {
      applicationId,
      managerId: manager.id,
      organizationId: vacancy.organizationId,
      decision,
      score,
      reason: decision === "OFFER" ? "구단 기준에 부합" : decision === "REJECT" ? "현재 기준과 차이가 큼" : "추가 검토",
    };
  }

  makeManagerOffer(input: ManagerContractOfferInput): ManagerContractOffer {
    const manager = this.requireManager(input.managerId);
    this.requireOrganization(input.organizationId);
    if (manager.status === "RETIRED") throw new Error(`Retired manager cannot receive an offer: ${manager.id}`);
    let vacancy: ManagerJobVacancy | undefined;
    if (input.vacancyId) {
      vacancy = this.requireManagerJobVacancy(input.vacancyId);
      if (vacancy.organizationId !== input.organizationId) throw new Error(`Offer organization does not match vacancy: ${input.vacancyId}`);
    }
    const teamId = input.teamId ?? vacancy?.teamId;
    if (teamId) {
      const team = this.requireTeam(teamId);
      if (team.organizationId !== input.organizationId) throw new Error(`Manager offer team does not belong to organization: ${teamId}`);
    }
    if (!Number.isFinite(input.salary) || input.salary < 0) throw new Error("Manager offer salary must be non-negative");
    const years = input.years ?? vacancy?.contractYearsRange.min ?? 1;
    if (!Number.isInteger(years) || years <= 0) throw new Error("Manager offer years must be a positive integer");
    const startDate = input.startDate ?? this.clock.now();
    const endDate = input.endDate ?? this.addDays(startDate, years * 365 - 1);
    if (endDate < startDate) throw new Error("Manager offer endDate must be >= startDate");
    const offer: ManagerContractOffer = {
      id: input.id ?? this.ids.nextId("manager_offer"),
      ...(input.vacancyId ? { vacancyId: input.vacancyId } : {}),
      managerId: manager.id,
      organizationId: input.organizationId,
      ...(teamId ? { teamId } : {}),
      role: input.role ?? "MANAGER",
      salary: input.salary,
      currency: input.currency,
      years,
      startDate,
      endDate,
      status: input.status ?? "PENDING",
      offeredOn: input.offeredOn ?? this.clock.now(),
      expectations: input.expectations ?? vacancy?.expectations ?? "안정적인 팀 운영",
      reason: input.reason ?? "감독 계약 제안",
    };
    this.managerContractOffers.set(offer.id, offer);
    const application = input.vacancyId
      ? [...this.managerJobApplications.values()].find((item) => item.vacancyId === input.vacancyId && item.managerId === manager.id && item.status === "APPLIED")
      : undefined;
    if (application) application.status = "OFFERED";
    this.record("MANAGER_CONTRACT_OFFERED", {
      subjectId: manager.id,
      ...(teamId ? { teamId } : {}),
      reason: offer.reason,
      payload: { offerId: offer.id, organizationId: offer.organizationId, salary: offer.salary, years: offer.years },
    });
    this.assertInvariants();
    return structuredClone(offer);
  }

  movePlayer(playerId: EntityId, toTeamId: EntityId, reason: string): void {
    const player = this.requirePlayer(playerId);
    const toTeam = this.requireTeam(toTeamId);
    const fromTeamId = player.currentTeamId;
    const fromOrganizationId = player.currentOrganizationId;
    this.closeOpenRosterAssignment(player, reason);
    player.currentTeamId = toTeamId;
    if (toTeam.organizationId) {
      player.currentOrganizationId = toTeam.organizationId;
    } else {
      delete player.currentOrganizationId;
    }
    player.status = "PROFESSIONAL";
    this.replaceCareerEntry(player, "PLAYER", {
      teamId: toTeamId,
      role: player.primaryPosition,
      status: player.status,
      reason,
    });
    this.record("PLAYER_MOVED", {
      subjectId: player.id,
      teamId: toTeamId,
      reason,
      payload: { fromTeamId, toTeamId, fromOrganizationId, toOrganizationId: toTeam.organizationId },
    });
  }

  releasePlayer(playerId: EntityId, reason: string): void {
    const player = this.requirePlayer(playerId);
    const fromTeamId = player.currentTeamId;
    const fromOrganizationId = player.currentOrganizationId;
    for (const contract of player.contracts) {
      if (contract.contractStatus === "ACTIVE") contract.contractStatus = "TERMINATED";
    }
    this.closeOpenRosterAssignment(player, reason);
    delete player.currentTeamId;
    delete player.currentOrganizationId;
    player.status = "FREE_AGENT";
    player.freeAgentStatus = {
      eligible: true,
      becameFreeAgentOn: this.clock.now(),
      ...(fromOrganizationId ? { previousOrganizationId: fromOrganizationId } : {}),
      type: "RELEASED",
    };
    this.replaceCareerEntry(player, "PLAYER", {
      role: player.primaryPosition,
      status: player.status,
      reason,
      organizationNameSnapshot: "Free Agent",
    });
    this.record("PLAYER_RELEASED", {
      subjectId: player.id,
      reason,
      payload: { fromTeamId, fromOrganizationId },
    });
    this.record("PLAYER_BECAME_FREE_AGENT", {
      subjectId: player.id,
      reason,
      payload: { previousOrganizationId: fromOrganizationId, type: "RELEASED" },
    });
  }

  retirePlayer(playerId: EntityId, reason: string): void {
    const player = this.requirePlayer(playerId);
    const fromTeamId = player.currentTeamId;
    const fromOrganizationId = player.currentOrganizationId;
    this.closeOpenRosterAssignment(player, reason);
    delete player.currentTeamId;
    delete player.currentOrganizationId;
    player.status = "RETIRED";
    this.replaceCareerEntry(player, "PLAYER", {
      role: player.primaryPosition,
      status: player.status,
      reason,
      organizationNameSnapshot: "Retired",
    });
    this.record("PLAYER_RETIRED", {
      subjectId: player.id,
      reason,
      payload: { fromTeamId, fromOrganizationId },
    });
  }

  registerContract(contract: PlayerContractInput): PlayerContract {
    const player = this.requirePlayer(contract.playerId);
    this.requireOrganization(contract.organizationId);
    if (player.status === "RETIRED") {
      throw new Error(`Retired player cannot sign a contract: ${player.id}`);
    }
    if (contract.endDate < contract.startDate) {
      throw new Error("Contract endDate must be >= startDate");
    }
    if (!Number.isFinite(contract.salary) || contract.salary < 0) {
      throw new Error("Contract salary must be a non-negative number");
    }
    if (this.activeContract(player) && contract.contractStatus === "ACTIVE") {
      throw new Error(`Player already has an active contract: ${player.id}`);
    }
    if (contract.contractStatus === "ACTIVE" && player.currentOrganizationId && player.currentOrganizationId !== contract.organizationId) {
      throw new Error(`Player already belongs to another organization: ${player.currentOrganizationId}`);
    }

    const stored: PlayerContract = {
      ...structuredClone(contract),
      id: contract.id ?? this.ids.nextId("contract"),
      years: contract.years ?? this.contractYears(contract.startDate, contract.endDate),
      signingBonus: contract.signingBonus ?? 0,
    };
    player.contracts.push(stored);
    if (stored.contractStatus === "ACTIVE") {
      player.currentOrganizationId = stored.organizationId;
      player.status = "PROFESSIONAL";
      player.firstProfessionalDate ??= stored.startDate;
      delete player.freeAgentStatus;
      if (player.draftEligibility?.status === "DRAFTED") {
        player.draftEligibility.status = "SIGNED";
        player.draftEligibility.reason = "드래프트 지명 후 계약 성공";
      }
      this.replaceCareerEntry(player, "PLAYER", {
        ...(player.currentTeamId ? { teamId: player.currentTeamId } : {}),
        role: player.primaryPosition,
        status: player.status,
        reason: "계약 체결",
        organizationNameSnapshot: this.requireOrganization(stored.organizationId).name,
      });
    }
    this.record("PLAYER_CONTRACT_REGISTERED", {
      subjectId: player.id,
      reason: "계약 등록",
      payload: { ...stored },
    });
    if (stored.contractStatus === "ACTIVE") {
      this.record("PLAYER_SIGNED", {
        subjectId: player.id,
        reason: "계약 체결",
        payload: { contractId: stored.id, organizationId: stored.organizationId, salary: stored.salary, years: stored.years },
      });
    }
    this.assertInvariants();
    return structuredClone(stored);
  }

  assignPlayerToRoster(
    playerId: EntityId,
    teamId: EntityId,
    rosterStatus: RosterStatus,
    reason: string,
  ): RosterAssignment {
    const player = this.requirePlayer(playerId);
    const team = this.requireTeam(teamId);
    const organizationId = this.requireTeamOrganization(team);
    if (player.status === "RETIRED") {
      throw new Error(`Retired player cannot be assigned to a roster: ${player.id}`);
    }
    if (player.currentRosterAssignmentId) {
      throw new Error(`Player already has an active roster assignment: ${player.id}`);
    }
    this.assertRosterStatusCompatibleWithInjury(player, rosterStatus);
    if (player.currentOrganizationId && player.currentOrganizationId !== organizationId) {
      throw new Error(`Player belongs to another organization: ${player.currentOrganizationId}`);
    }

    player.currentOrganizationId = organizationId;
    player.currentTeamId = team.id;
    player.rosterStatus = rosterStatus;
    player.status = "PROFESSIONAL";
    player.firstProfessionalDate ??= this.clock.now();

    const assignment = this.startRosterAssignment(player, team, rosterStatus, reason);
    this.record("PLAYER_ROSTER_ASSIGNED", {
      subjectId: player.id,
      teamId: team.id,
      reason,
      payload: {
        assignmentId: assignment.id,
        organizationId,
        rosterStatus,
      },
    });
    this.assertInvariants();
    return structuredClone(assignment);
  }

  promotePlayer(playerId: EntityId, toTeamId: EntityId, reason: string): RosterAssignment {
    return this.movePlayerWithinOrganization(playerId, toTeamId, "ACTIVE", reason, "PLAYER_PROMOTED");
  }

  demotePlayer(playerId: EntityId, toTeamId: EntityId, reason: string): RosterAssignment {
    return this.movePlayerWithinOrganization(playerId, toTeamId, "ACTIVE", reason, "PLAYER_DEMOTED");
  }

  movePlayerWithinOrganization(
    playerId: EntityId,
    toTeamId: EntityId,
    rosterStatus: RosterStatus,
    reason: string,
    eventType?: Extract<WorldEventType, "PLAYER_PROMOTED" | "PLAYER_DEMOTED" | "PLAYER_ROSTER_ASSIGNED">,
  ): RosterAssignment {
    const player = this.requirePlayer(playerId);
    const toTeam = this.requireTeam(toTeamId);
    const toOrganizationId = this.requireTeamOrganization(toTeam);
    if (player.status === "RETIRED") {
      throw new Error(`Retired player cannot move rosters: ${player.id}`);
    }
    if (!player.currentOrganizationId) {
      throw new Error(`Player is not assigned to an organization: ${player.id}`);
    }
    if (player.currentOrganizationId !== toOrganizationId) {
      throw new Error(`Roster moves cannot cross organizations: ${player.currentOrganizationId} -> ${toOrganizationId}`);
    }
    this.assertRosterStatusCompatibleWithInjury(player, rosterStatus);

    const fromTeamId = player.currentTeamId;
    const previousAssignmentId = player.currentRosterAssignmentId;
    this.closeOpenRosterAssignment(player, reason);
    player.currentTeamId = toTeam.id;
    player.rosterStatus = rosterStatus;
    const assignment = this.startRosterAssignment(player, toTeam, rosterStatus, reason);
    this.record(eventType ?? this.inferRosterMoveEventType(fromTeamId, toTeam), {
      subjectId: player.id,
      teamId: toTeam.id,
      reason,
      payload: {
        fromTeamId,
        toTeamId: toTeam.id,
        organizationId: toOrganizationId,
        previousAssignmentId,
        assignmentId: assignment.id,
        rosterStatus,
      },
    });
    this.assertInvariants();
    return structuredClone(assignment);
  }

  removePlayerFromRoster(playerId: EntityId, reason: string): void {
    const player = this.requirePlayer(playerId);
    const fromTeamId = player.currentTeamId;
    const fromOrganizationId = player.currentOrganizationId;
    const previousAssignmentId = player.currentRosterAssignmentId;
    this.closeOpenRosterAssignment(player, reason);
    delete player.currentTeamId;
    delete player.rosterStatus;
    this.record("PLAYER_ROSTER_REMOVED", {
      subjectId: player.id,
      ...(fromTeamId ? { teamId: fromTeamId } : {}),
      reason,
      payload: { fromTeamId, organizationId: fromOrganizationId, previousAssignmentId },
    });
    this.assertInvariants();
  }

  acceptManagerOffer(offerId: EntityId): ManagerContract {
    const offer = this.requireManagerContractOffer(offerId);
    if (offer.status !== "PENDING") throw new Error(`Manager offer is not pending: ${offerId}`);
    const manager = this.requireManager(offer.managerId);
    if (manager.status === "RETIRED") throw new Error(`Retired manager cannot accept an offer: ${manager.id}`);
    if (offer.teamId) {
      const existing = this.managerForTeam(offer.teamId);
      if (existing && existing.id !== manager.id) {
        throw new Error(`Team already has an active manager: ${offer.teamId}`);
      }
    }
    const previousOrganizationId = manager.currentOrganizationId;
    const previousTeamId = manager.currentTeamId;
    this.closeActiveManagerContract(manager, previousTeamId === offer.teamId ? "재계약" : "이직");
    this.endOpenCareerEntry(manager, previousTeamId === offer.teamId ? "재계약" : "이직");
    const contract: ManagerContract = {
      id: this.ids.nextId("manager_contract"),
      managerId: manager.id,
      organizationId: offer.organizationId,
      ...(offer.teamId ? { teamId: offer.teamId } : {}),
      role: offer.role,
      startDate: offer.startDate,
      endDate: offer.endDate,
      salary: offer.salary,
      currency: offer.currency,
      status: "ACTIVE",
    };
    manager.contracts.push(contract);
    this.managerContracts.set(contract.id, contract);
    this.assignManagerEmployment(manager, offer.organizationId, offer.teamId, offer.role, previousTeamId === offer.teamId ? "감독 재계약" : "감독 제안 수락");
    offer.status = "ACCEPTED";
    for (const other of this.managerContractOffers.values()) {
      if (other.managerId === manager.id && other.id !== offer.id && other.status === "PENDING") {
        other.status = "REJECTED";
      }
    }
    if (offer.vacancyId) {
      const vacancy = this.requireManagerJobVacancy(offer.vacancyId);
      vacancy.status = "FILLED";
      for (const application of this.managerJobApplications.values()) {
        if (application.vacancyId === offer.vacancyId) {
          application.status = application.managerId === manager.id ? "ACCEPTED" : "REJECTED";
        }
      }
    }
    const eventType = previousTeamId === offer.teamId ? "MANAGER_CONTRACT_RENEWED" : previousTeamId ? "MANAGER_MOVED_TEAM" : "MANAGER_HIRED";
    this.record(eventType, {
      subjectId: manager.id,
      ...(offer.teamId ? { teamId: offer.teamId } : {}),
      reason: eventType === "MANAGER_CONTRACT_RENEWED" ? "감독 재계약" : "감독 계약 수락",
      payload: { contractId: contract.id, previousOrganizationId, previousTeamId, organizationId: offer.organizationId, teamId: offer.teamId },
    });
    this.assertInvariants();
    return structuredClone(contract);
  }

  rejectManagerOffer(offerId: EntityId, reason = "감독 제안 거절"): ManagerContractOffer {
    const offer = this.requireManagerContractOffer(offerId);
    if (offer.status !== "PENDING") throw new Error(`Manager offer is not pending: ${offerId}`);
    offer.status = "REJECTED";
    this.record("MANAGER_BECAME_UNEMPLOYED", {
      subjectId: offer.managerId,
      reason,
      payload: { offerId, organizationId: offer.organizationId, rejectedOffer: true },
    });
    this.assertInvariants();
    return structuredClone(offer);
  }

  withdrawManagerApplication(applicationId: EntityId, reason = "감독직 지원 철회"): ManagerJobApplication {
    const application = this.requireManagerJobApplication(applicationId);
    if (application.status !== "APPLIED" && application.status !== "OFFERED") {
      throw new Error(`Manager application cannot be withdrawn: ${application.status}`);
    }
    application.status = "WITHDRAWN";
    application.reason = `${application.reason}; ${reason}`;
    this.assertInvariants();
    return structuredClone(application);
  }

  resignManager(managerId: EntityId, reason = "자진 사임"): void {
    const manager = this.requireManager(managerId);
    if (manager.status !== "EMPLOYED") throw new Error(`Only employed managers can resign: ${manager.id}`);
    const fromTeamId = manager.currentTeamId;
    const fromOrganizationId = manager.currentOrganizationId;
    this.closeActiveManagerContract(manager, reason);
    delete manager.currentTeamId;
    delete manager.currentOrganizationId;
    manager.status = "UNEMPLOYED";
    manager.employmentStatus = "UNEMPLOYED";
    this.replaceCareerEntry(manager, "MANAGER", {
      role: "MANAGER",
      status: manager.status,
      reason,
      organizationNameSnapshot: "Unemployed",
    });
    this.record("MANAGER_RESIGNED", {
      subjectId: manager.id,
      reason,
      payload: { fromTeamId, fromOrganizationId },
    });
    this.record("MANAGER_BECAME_UNEMPLOYED", {
      subjectId: manager.id,
      reason,
      payload: { fromTeamId, fromOrganizationId },
    });
    this.openVacancyForDepartedManager(fromOrganizationId, fromTeamId, "사임 후 감독 공석");
    this.assertInvariants();
  }

  sackManager(managerId: EntityId, reason = "구단 경질"): void {
    const manager = this.requireManager(managerId);
    if (manager.status !== "EMPLOYED") throw new Error(`Only employed managers can be sacked: ${manager.id}`);
    const fromTeamId = manager.currentTeamId;
    const fromOrganizationId = manager.currentOrganizationId;
    this.closeActiveManagerContract(manager, reason);
    delete manager.currentTeamId;
    delete manager.currentOrganizationId;
    manager.status = "UNEMPLOYED";
    manager.employmentStatus = "UNEMPLOYED";
    this.replaceCareerEntry(manager, "MANAGER", {
      role: "MANAGER",
      status: manager.status,
      reason,
      organizationNameSnapshot: "Unemployed",
    });
    this.record("MANAGER_SACKED", {
      subjectId: manager.id,
      reason,
      payload: { fromTeamId, fromOrganizationId },
    });
    this.record("MANAGER_BECAME_UNEMPLOYED", {
      subjectId: manager.id,
      reason,
      payload: { fromTeamId, fromOrganizationId },
    });
    this.openVacancyForDepartedManager(fromOrganizationId, fromTeamId, "경질 후 감독 공석");
    this.assertInvariants();
  }

  renewManagerContract(managerId: EntityId, years: number, salary?: number): ManagerContractOffer {
    const manager = this.requireManager(managerId);
    const active = this.activeManagerContract(manager);
    if (!active) throw new Error(`Manager has no active contract to renew: ${manager.id}`);
    return this.makeManagerOffer({
      managerId,
      organizationId: active.organizationId,
      ...(active.teamId ? { teamId: active.teamId } : {}),
      role: active.role,
      salary: salary ?? active.salary,
      currency: active.currency,
      years,
      startDate: this.addDays(active.endDate, 1),
      endDate: this.addDays(active.endDate, years * 365),
      reason: "감독 재계약 제안",
      expectations: "기존 프로젝트 지속",
    });
  }

  expireManagerContracts(onDate: ISODate = this.clock.now()): void {
    for (const manager of this.managers.values()) {
      const active = this.activeManagerContract(manager);
      if (!active || active.endDate >= onDate) continue;
      const fromTeamId = manager.currentTeamId;
      const fromOrganizationId = manager.currentOrganizationId;
      active.status = "EXPIRED";
      const mapContract = this.managerContracts.get(active.id);
      if (mapContract) mapContract.status = "EXPIRED";
      delete manager.currentTeamId;
      delete manager.currentOrganizationId;
      manager.status = "UNEMPLOYED";
      manager.employmentStatus = "UNEMPLOYED";
      this.replaceCareerEntry(manager, "MANAGER", {
        role: active.role,
        status: manager.status,
        reason: "감독 계약 만료",
        organizationNameSnapshot: "Unemployed",
      });
      this.record("MANAGER_BECAME_UNEMPLOYED", {
        subjectId: manager.id,
        reason: "감독 계약 만료",
        payload: { fromTeamId, fromOrganizationId, contractId: active.id },
      }, onDate);
      this.openVacancyForDepartedManager(fromOrganizationId, fromTeamId, "계약 만료 후 감독 공석");
    }
    this.assertInvariants();
  }

  updateManagerReputation(managerId: EntityId, reason = "감독 평판 갱신"): number {
    const manager = this.requireManager(managerId);
    const stats = manager.careerStats;
    const winRate = stats.games > 0 ? stats.winningPercentage * 100 : manager.reputation;
    manager.reputation = this.clampRating(manager.reputation * 0.72 + winRate * 0.2 + stats.championships * 4 + this.rng.int(-2, 2));
    this.record("MANAGER_MOVED", {
      subjectId: manager.id,
      reason,
      payload: { reputation: manager.reputation },
    });
    this.assertInvariants();
    return manager.reputation;
  }

  updateBoardConfidence(managerId: EntityId, scoreDelta: number, reason = "구단 신뢰도 갱신"): BoardConfidence {
    const manager = this.requireManager(managerId);
    if (!manager.currentOrganizationId) throw new Error(`Manager has no organization for board confidence: ${manager.id}`);
    const previous = manager.boardConfidence?.score ?? 60;
    manager.boardConfidence = {
      managerId: manager.id,
      organizationId: manager.currentOrganizationId,
      ...(manager.currentTeamId ? { teamId: manager.currentTeamId } : {}),
      score: this.clampRating(previous + scoreDelta),
      updatedOn: this.clock.now(),
      reason,
    };
    this.assertInvariants();
    return structuredClone(manager.boardConfidence);
  }

  hireManager(managerId: EntityId, teamId: EntityId, reason: string): void {
    const manager = this.requireManager(managerId);
    const team = this.requireTeam(teamId);
    const organizationId = this.requireTeamOrganization(team);
    const existing = this.managerForTeam(teamId);
    if (existing && existing.id !== manager.id) throw new Error(`Team already has an active manager: ${teamId}`);
    const previousTeamId = manager.currentTeamId;
    const previousOrganizationId = manager.currentOrganizationId;
    this.closeActiveManagerContract(manager, reason);
    manager.currentTeamId = teamId;
    manager.currentOrganizationId = organizationId;
    manager.status = "EMPLOYED";
    manager.employmentStatus = "EMPLOYED";
    this.replaceCareerEntry(manager, "MANAGER", {
      teamId,
      role: "MANAGER",
      status: manager.status,
      reason,
    });

    this.record(previousTeamId ? "MANAGER_MOVED" : "MANAGER_HIRED", {
      subjectId: manager.id,
      teamId,
      reason,
      payload: { fromTeamId: previousTeamId, toTeamId: teamId, previousOrganizationId, organizationId },
    });
    this.assertInvariants();
  }

  fireManager(managerId: EntityId, reason: string): void {
    const manager = this.requireManager(managerId);
    const fromTeamId = manager.currentTeamId;
    const fromOrganizationId = manager.currentOrganizationId;
    this.closeActiveManagerContract(manager, reason);
    delete manager.currentTeamId;
    delete manager.currentOrganizationId;
    manager.status = "UNEMPLOYED";
    manager.employmentStatus = "UNEMPLOYED";
    this.replaceCareerEntry(manager, "MANAGER", {
      role: "MANAGER",
      status: manager.status,
      reason,
      organizationNameSnapshot: "Unemployed",
    });
    this.record("MANAGER_FIRED", {
      subjectId: manager.id,
      reason,
      payload: { fromTeamId, fromOrganizationId },
    });
    this.assertInvariants();
  }

  retireManager(managerId: EntityId, reason: string): void {
    const manager = this.requireManager(managerId);
    const fromTeamId = manager.currentTeamId;
    const fromOrganizationId = manager.currentOrganizationId;
    this.closeActiveManagerContract(manager, reason);
    delete manager.currentTeamId;
    delete manager.currentOrganizationId;
    manager.status = "RETIRED";
    manager.employmentStatus = "RETIRED";
    this.replaceCareerEntry(manager, "MANAGER", {
      role: "MANAGER",
      status: manager.status,
      reason,
      organizationNameSnapshot: "Retired",
    });
    this.record("MANAGER_RETIRED", {
      subjectId: manager.id,
      reason,
      payload: { fromTeamId, fromOrganizationId },
    });
    this.assertInvariants();
  }

  advanceDay(options: AdvanceWorldOptions = {}): ISODate {
    const date = this.clock.advanceDays(1);
    this.progressSeasonStatuses();
    this.refreshPlayerAges();
    this.refreshManagerAges();
    this.recoverPlayerGameConditions();
    this.expireContracts(this.clock.now());
    this.expireManagerContracts(this.clock.now());
    if (options.injuries !== false) this.progressPlayerInjuries(options);
    if (options.development !== false) this.progressPlayerDevelopment();
    this.progressDailyCareers(options);
    this.assertInvariants();
    return date;
  }

  advanceDays(days: number, options: AdvanceWorldOptions = {}): ISODate {
    if (!Number.isInteger(days) || days < 0) {
      throw new Error("days must be a non-negative integer");
    }
    for (let elapsed = 0; elapsed < days; elapsed += 1) {
      this.advanceDay(options);
    }
    return this.clock.now();
  }

  getUserControlledTeamId(userManagerId?: EntityId): EntityId | undefined {
    if (!userManagerId) return undefined;
    const manager = this.managers.get(userManagerId);
    if (!manager || manager.status !== "EMPLOYED") return undefined;
    return manager.currentTeamId;
  }

  getGamesForDate(
    date: ISODate = this.clock.now(),
    filters: { leagueId?: EntityId; seasonId?: EntityId } = {},
  ): GameFixture[] {
    if (filters.leagueId) this.requireLeague(filters.leagueId);
    if (filters.seasonId) this.requireSeason(filters.seasonId);
    return [...this.games.values()]
      .filter((game) => game.scheduledDate === date)
      .filter((game) => !filters.seasonId || game.seasonId === filters.seasonId)
      .filter((game) => !filters.leagueId || this.requireSeason(game.seasonId).leagueId === filters.leagueId)
      .map((game) => structuredClone(game))
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  getPendingGamesForCurrentDate(options: Pick<PlayableDayOptions, "userManagerId" | "leagueId" | "seasonId"> = {}): CurrentDateGame[] {
    const userTeamId = this.getUserControlledTeamId(options.userManagerId);
    return this.getGamesForDate(this.clock.now(), options)
      .filter((game) => game.status !== "COMPLETED")
      .map((game) => ({
        gameId: game.id,
        date: game.scheduledDate,
        homeTeamId: game.homeTeamId,
        awayTeamId: game.awayTeamId,
        status: game.status,
        control: userTeamId && this.gameIncludesTeam(game, userTeamId) ? "USER_GAME" : "AI_GAME",
      }));
  }

  canAdvanceDate(options: Pick<PlayableDayOptions, "userManagerId" | "leagueId" | "seasonId"> = {}): CanAdvanceDateResult {
    const date = this.clock.now();
    const userTeamId = this.getUserControlledTeamId(options.userManagerId);
    const currentGames = this.getGamesForDate(date, options);
    const actionable = currentGames.filter((game) => this.isActionableGameForDailyProgress(game));
    const blockingGames = userTeamId
      ? actionable.filter((game) => this.gameIncludesTeam(game, userTeamId) && game.status !== "COMPLETED")
      : [];
    const pendingGames = actionable.filter((game) => game.status !== "COMPLETED");
    const canAdvance = blockingGames.length === 0 && pendingGames.length === 0;
    return {
      date,
      canAdvance,
      ...(userTeamId ? { userTeamId } : {}),
      blockingGameIds: blockingGames.map((game) => game.id),
      pendingGameIds: pendingGames.map((game) => game.id),
      message: canAdvance
        ? "날짜 진행 가능"
        : blockingGames.length > 0
          ? "오늘 경기가 아직 종료되지 않았습니다. 경기를 진행하거나 자동 진행한 뒤 다음 날짜로 이동할 수 있습니다."
          : "오늘 리그 경기가 아직 모두 종료되지 않았습니다.",
    };
  }

  processCurrentDay(options: PlayableDayOptions = {}): ProcessCurrentDayResult {
    const date = this.clock.now();
    const userTeamId = this.getUserControlledTeamId(options.userManagerId);
    const currentGames = this.getGamesForDate(date, options);
    const actionable = currentGames.filter((game) => this.isActionableGameForDailyProgress(game));
    const skippedGameIds = currentGames
      .filter((game) => !this.isActionableGameForDailyProgress(game))
      .map((game) => game.id);
    const userGames = userTeamId ? actionable.filter((game) => this.gameIncludesTeam(game, userTeamId)) : [];
    const aiGames = actionable.filter((game) => !userTeamId || !this.gameIncludesTeam(game, userTeamId));
    const completedAiGameIds: EntityId[] = [];
    const completedUserGameIds: EntityId[] = [];

    for (const game of aiGames) {
      if (this.isGameCompletedForDailyProgress(game)) continue;
      this.simulateDailyGame(game.id, "AI_GAME", date);
      completedAiGameIds.push(game.id);
    }

    for (const game of userGames) {
      if (this.isGameCompletedForDailyProgress(game)) continue;
      if (options.autoPlayUserGames) {
        this.simulateDailyGame(game.id, "USER_GAME", date);
        completedUserGameIds.push(game.id);
      } else if (game.status === "SCHEDULED") {
        this.prepareGameForDailyProgress(game.id, date);
      }
    }

    const check = this.canAdvanceDate(options);
    if (!check.canAdvance) {
      return {
        date,
        ...(userTeamId ? { userTeamId } : {}),
        userGameIds: userGames.map((game) => game.id),
        aiGameIds: aiGames.map((game) => game.id),
        completedAiGameIds,
        completedUserGameIds,
        skippedGameIds,
        blocked: true,
        message: check.message,
      };
    }

    const nextDate = this.advanceDay(options);
    return {
      date,
      nextDate,
      ...(userTeamId ? { userTeamId } : {}),
      userGameIds: userGames.map((game) => game.id),
      aiGameIds: aiGames.map((game) => game.id),
      completedAiGameIds,
      completedUserGameIds,
      skippedGameIds,
      blocked: false,
      message: `${date} 일정을 처리하고 ${nextDate}로 진행했습니다.`,
    };
  }

  advancePlayableDays(days: number, options: PlayableDayOptions = {}): AdvancePlayableDaysResult {
    if (!Number.isInteger(days) || days < 0) {
      throw new Error("days must be a non-negative integer");
    }
    const startDate = this.clock.now();
    const results: ProcessCurrentDayResult[] = [];
    for (let elapsed = 0; elapsed < days; elapsed += 1) {
      const result = this.processCurrentDay(options);
      results.push(result);
      if (result.blocked) {
        return {
          startDate,
          endDate: this.clock.now(),
          requestedDays: days,
          daysAdvanced: elapsed,
          stoppedForUserGame: result.userGameIds.length > 0,
          results,
          message: result.userGameIds.length > 0
            ? `${this.clock.now()}에 직접 진행해야 할 경기가 있어 날짜 진행을 중단했습니다.`
            : result.message,
        };
      }
    }
    return {
      startDate,
      endDate: this.clock.now(),
      requestedDays: days,
      daysAdvanced: days,
      stoppedForUserGame: false,
      results,
      message: `${days}일 진행했습니다.`,
    };
  }

  applyPlayerCareerOption(playerId: EntityId, option: CareerOption): void {
    const player = this.requirePlayer(playerId);
    if (player.status === "RETIRED") return;

    const fromTeamId = player.currentTeamId;
    const toTeamId = option.toTeamId;
    if (toTeamId) this.requireTeam(toTeamId);

    if (option.nextStatus === player.status && toTeamId === fromTeamId) return;

    if (option.nextStatus === "RETIRED") {
      this.retirePlayer(playerId, option.reason);
      return;
    }

    player.status = option.nextStatus;
    if (toTeamId) {
      const toTeam = this.requireTeam(toTeamId);
      player.currentTeamId = toTeamId;
      if (toTeam.organizationId) {
        player.currentOrganizationId = toTeam.organizationId;
      } else {
        delete player.currentOrganizationId;
      }
    } else if (option.nextStatus === "FREE_AGENT") {
      delete player.currentTeamId;
      delete player.currentOrganizationId;
    } else if (option.nextStatus === "INDEPENDENT" || option.nextStatus === "AMATEUR") {
      delete player.currentTeamId;
      delete player.currentOrganizationId;
    }

    this.replaceCareerEntry(player, "PLAYER", {
      ...(player.currentTeamId ? { teamId: player.currentTeamId } : {}),
      role: player.primaryPosition,
      status: player.status,
      reason: option.reason,
      organizationNameSnapshot:
        option.organizationNameSnapshot ?? this.snapshotForPlayerStatus(player),
    });

    const eventType = option.eventType ?? this.inferPlayerEventType(fromTeamId, player);
    this.record(eventType, {
      subjectId: player.id,
      ...(player.currentTeamId ? { teamId: player.currentTeamId } : {}),
      reason: option.reason,
      payload: { fromTeamId, toTeamId: player.currentTeamId, nextStatus: player.status },
    });
  }

  applyManagerCareerOption(managerId: EntityId, option: ManagerCareerOption): void {
    const manager = this.requireManager(managerId);
    if (manager.status === "RETIRED") return;
    if (option.nextStatus === manager.status && option.toTeamId === manager.currentTeamId) return;

    if (option.nextStatus === "RETIRED") {
      this.retireManager(managerId, option.reason);
      return;
    }

    if (option.nextStatus === "EMPLOYED") {
      if (!option.toTeamId) {
        throw new Error("Employed manager career option requires toTeamId");
      }
      this.hireManager(managerId, option.toTeamId, option.reason);
      return;
    }

    if (option.nextStatus === "UNEMPLOYED") {
      this.fireManager(managerId, option.reason);
    }
  }

  validateInvariants(): string[] {
    const issues: string[] = [];
    this.validateWorldHierarchyInvariants(issues);
    this.validateSeasonAndScheduleInvariants(issues);
    this.validateGameRosterInvariants(issues);
    this.validateScoutingAndDraftInvariants(issues);
    this.validateMarketInvariants(issues);
    for (const player of this.players.values()) {
      this.validatePlayerModel(player, issues);
      this.validatePersonCareer(player, "PLAYER", player.status, player.currentTeamId, issues);
      if (player.currentTeamId && !this.teams.has(player.currentTeamId)) {
        issues.push(`Player ${player.id} has missing team ${player.currentTeamId}`);
      }
      if (player.status === "PROFESSIONAL" && !player.currentTeamId && !player.currentOrganizationId) {
        issues.push(`Player ${player.id} is professional without a current team or organization`);
      }
      if ((player.status === "FREE_AGENT" || player.status === "RETIRED") && player.currentTeamId) {
        issues.push(`Player ${player.id} is ${player.status} but has a current team`);
      }
      if (player.currentTeamId) {
        const team = this.teams.get(player.currentTeamId);
        if (team?.organizationId !== player.currentOrganizationId) {
          issues.push(`Player ${player.id} current team organization does not match currentOrganizationId`);
        }
      }
      if (player.currentRosterAssignmentId) {
        const openAssignments = player.rosterAssignments.filter((assignment) => !assignment.endDate);
        if (openAssignments.length !== 1) {
          issues.push(`Player ${player.id} must have exactly one open roster assignment`);
        }
        const open = openAssignments[0];
        if (open) {
          if (open.id !== player.currentRosterAssignmentId) {
            issues.push(`Player ${player.id} currentRosterAssignmentId does not match open assignment`);
          }
          if (open.teamId !== player.currentTeamId) {
            issues.push(`Player ${player.id} currentTeamId does not match open roster assignment`);
          }
          if (open.organizationId !== player.currentOrganizationId) {
            issues.push(`Player ${player.id} currentOrganizationId does not match open roster assignment`);
          }
          if (open.rosterStatus !== player.rosterStatus) {
            issues.push(`Player ${player.id} rosterStatus does not match open roster assignment`);
          }
        }
      } else if (player.rosterAssignments.some((assignment) => !assignment.endDate)) {
        issues.push(`Player ${player.id} has an open roster assignment but no currentRosterAssignmentId`);
      }
      if (player.rosterStatus && !player.currentRosterAssignmentId) {
        issues.push(`Player ${player.id} has rosterStatus without an active roster assignment`);
      }
      if (player.status === "RETIRED" && player.currentRosterAssignmentId) {
        issues.push(`Player ${player.id} is retired with an active roster assignment`);
      }
      this.validatePlayerRosterAssignments(player, issues);
      this.validatePlayerContracts(player, issues);
      this.validateRosterInjuryConsistency(player, issues);
    }

    for (const manager of this.managers.values()) {
      this.validatePersonCareer(manager, "MANAGER", manager.status, manager.currentTeamId, issues);
      this.validateManagerModel(manager, issues);
      if (manager.currentTeamId && !this.teams.has(manager.currentTeamId)) {
        issues.push(`Manager ${manager.id} has missing team ${manager.currentTeamId}`);
      }
      if (manager.status !== manager.employmentStatus) {
        issues.push(`Manager ${manager.id} status does not match employmentStatus`);
      }
      if (manager.status === "EMPLOYED" && !manager.currentOrganizationId) {
        issues.push(`Manager ${manager.id} is employed without a current organization`);
      }
      if ((manager.status === "UNEMPLOYED" || manager.status === "RETIRED") && (manager.currentTeamId || manager.currentOrganizationId)) {
        issues.push(`Manager ${manager.id} is ${manager.status} but has a current team`);
      }
      if (manager.currentTeamId) {
        const team = this.teams.get(manager.currentTeamId);
        if (team?.organizationId !== manager.currentOrganizationId) {
          issues.push(`Manager ${manager.id} current team organization does not match currentOrganizationId`);
        }
      }
    }
    this.validateManagerMarketInvariants(issues);

    return issues;
  }

  private validateWorldHierarchyInvariants(issues: string[]): void {
    if (this.realWorldSnapshot && !this.realWorldSnapshot.snapshotId) {
      issues.push("RealWorldSnapshot metadata requires snapshotId");
    }
    for (const country of this.countries.values()) {
      for (const leagueId of country.leagueIds ?? []) {
        const league = this.leagues.get(leagueId);
        if (!league) issues.push(`Country ${country.id} references missing league ${leagueId}`);
        if (league && league.countryId !== country.id) issues.push(`Country ${country.id} leagueIds contains league from another country ${leagueId}`);
      }
    }
    for (const league of this.leagues.values()) {
      if (!this.countries.has(league.countryId)) issues.push(`League ${league.id} has missing country ${league.countryId}`);
      if (league.parentLeagueId && !this.leagues.has(league.parentLeagueId)) issues.push(`League ${league.id} has missing parent league ${league.parentLeagueId}`);
      this.validateOptionalRating(league.strengthRating, `League ${league.id} strengthRating`, issues);
      for (const subdivision of league.subdivisions ?? []) {
        if (subdivision.parentSubdivisionId && !(league.subdivisions ?? []).some((candidate) => candidate.id === subdivision.parentSubdivisionId)) {
          issues.push(`League ${league.id} subdivision ${subdivision.id} has missing parent subdivision`);
        }
      }
    }
    for (const organization of this.organizations.values()) {
      if (!this.countries.has(organization.countryId)) issues.push(`Organization ${organization.id} has missing country ${organization.countryId}`);
      if (organization.primaryLeagueId && !this.leagues.has(organization.primaryLeagueId)) {
        issues.push(`Organization ${organization.id} has missing primary league ${organization.primaryLeagueId}`);
      }
    }
    for (const team of this.teams.values()) {
      const league = this.leagues.get(team.leagueId);
      const organization = team.organizationId ? this.organizations.get(team.organizationId) : undefined;
      if (!league) issues.push(`Team ${team.id} has missing league ${team.leagueId}`);
      if (team.organizationId && !organization) issues.push(`Team ${team.id} has missing organization ${team.organizationId}`);
      if (team.parentTeamId) {
        const parent = this.teams.get(team.parentTeamId);
        if (!parent) issues.push(`Team ${team.id} has missing parent team ${team.parentTeamId}`);
        if (parent?.organizationId && team.organizationId && parent.organizationId !== team.organizationId) {
          issues.push(`Team ${team.id} parent team belongs to another organization`);
        }
      }
      const isCanadianMlbSystem = organization?.countryId === "country_ca" && (league?.id === "real_league_mlb" || league?.parentLeagueId === "real_league_mlb");
      if (league && organization && league.countryId !== organization.countryId && !isCanadianMlbSystem) {
        issues.push(`Team ${team.id} league country does not match organization country`);
      }
    }
    for (const player of this.players.values()) {
      if (player.realWorld?.snapshotId && this.realWorldSnapshot && player.realWorld.snapshotId !== this.realWorldSnapshot.snapshotId) {
        issues.push(`Player ${player.id} realWorld snapshot does not match world snapshot`);
      }
      if (player.realWorld?.source === "REAL" && Object.keys(player.externalIds ?? {}).length === 0) {
        issues.push(`Real player ${player.id} requires externalIds`);
      }
      if (player.currentTeamId) {
        const team = this.teams.get(player.currentTeamId);
        if (team) {
          const league = this.leagues.get(team.leagueId);
          const currentCountryId = league?.countryId;
          if (!currentCountryId) issues.push(`Player ${player.id} current team has no activity country`);
        }
      }
    }
  }

  assertInvariants(): void {
    if (this.invariantSuppressionDepth > 0) return;
    this.assertInvariantsNow();
  }

  private assertInvariantsNow(): void {
    const issues = this.validateInvariants();
    if (issues.length > 0) {
      throw new Error(`World invariant violation: ${issues.join("; ")}`);
    }
  }

  private withInvariantChecksSuppressed<T>(fn: () => T): T {
    this.invariantSuppressionDepth += 1;
    try {
      return fn();
    } finally {
      this.invariantSuppressionDepth -= 1;
    }
  }

  private validateScoutingAndDraftInvariants(issues: string[]): void {
    for (const scout of this.scouts.values()) {
      if (!this.organizations.has(scout.organizationId)) {
        issues.push(`Scout ${scout.id} has missing organization ${scout.organizationId}`);
      }
      this.validateRating(scout.abilityEvaluation, `Scout ${scout.id} abilityEvaluation`, issues);
      this.validateRating(scout.potentialEvaluation, `Scout ${scout.id} potentialEvaluation`, issues);
      this.validateRating(scout.regionalKnowledge, `Scout ${scout.id} regionalKnowledge`, issues);
      this.validateRating(scout.experience, `Scout ${scout.id} experience`, issues);
    }

    for (const report of this.scoutingReports.values()) {
      const scout = this.scouts.get(report.scoutId);
      if (!scout) issues.push(`Scouting report ${report.id} has missing scout ${report.scoutId}`);
      if (!this.players.has(report.playerId)) issues.push(`Scouting report ${report.id} has missing player ${report.playerId}`);
      if (!this.organizations.has(report.organizationId)) {
        issues.push(`Scouting report ${report.id} has missing organization ${report.organizationId}`);
      }
      if (scout && scout.organizationId !== report.organizationId) {
        issues.push(`Scouting report ${report.id} organization does not match scout organization`);
      }
      this.validateRating(report.estimatedCA, `Scouting report ${report.id} estimatedCA`, issues);
      this.validateRating(report.estimatedPARange.low, `Scouting report ${report.id} estimatedPA low`, issues);
      this.validateRating(report.estimatedPARange.high, `Scouting report ${report.id} estimatedPA high`, issues);
      if (report.estimatedPARange.low > report.estimatedPARange.high) {
        issues.push(`Scouting report ${report.id} estimated PA range is inverted`);
      }
      this.validateRating(report.confidence, `Scouting report ${report.id} confidence`, issues);
      this.validateRating(report.overallGrade, `Scouting report ${report.id} overallGrade`, issues);
      if (!["WATCH", "FOLLOW", "DRAFT", "AVOID"].includes(report.recommendation)) {
        issues.push(`Scouting report ${report.id} has invalid recommendation ${report.recommendation}`);
      }
      if ("trueCurrentAbility" in report || "truePotentialAbility" in report) {
        issues.push(`Scouting report ${report.id} must not store true ability fields`);
      }
      for (const [key, value] of Object.entries(report.attributeEstimates.battingRatings)) {
        this.validateRating(value, `Scouting report ${report.id} batting ${key}`, issues);
      }
      for (const [key, value] of Object.entries(report.attributeEstimates.pitchingRatings)) {
        if (key === "repertoire") continue;
        this.validateRating(value, `Scouting report ${report.id} pitching ${key}`, issues);
      }
      for (const pitch of report.attributeEstimates.pitchingRatings.repertoire) {
        if (!pitch.name) issues.push(`Scouting report ${report.id} has a pitch estimate without a name`);
        this.validateRating(pitch.quality, `Scouting report ${report.id} pitch ${pitch.name}`, issues);
      }
    }

    for (const draft of this.drafts.values()) {
      const season = this.seasons.get(draft.seasonId);
      if (!season) {
        issues.push(`Draft ${draft.id} has missing season ${draft.seasonId}`);
      } else if (season.leagueId !== draft.leagueId) {
        issues.push(`Draft ${draft.id} league does not match season`);
      }
      if (!this.leagues.has(draft.leagueId)) issues.push(`Draft ${draft.id} has missing league ${draft.leagueId}`);
      if (!Number.isInteger(draft.rounds) || draft.rounds <= 0) issues.push(`Draft ${draft.id} has invalid rounds`);
      if (!["SCHEDULED", "IN_PROGRESS", "COMPLETED"].includes(draft.status)) {
        issues.push(`Draft ${draft.id} has invalid status ${draft.status}`);
      }
      for (const organizationId of draft.participatingOrganizationIds) {
        if (!this.organizations.has(organizationId)) {
          issues.push(`Draft ${draft.id} has missing participating organization ${organizationId}`);
        }
      }
      for (const organizationId of draft.draftOrder) {
        if (!draft.participatingOrganizationIds.includes(organizationId)) {
          issues.push(`Draft ${draft.id} order includes non-participating organization ${organizationId}`);
        }
      }
      if (draft.picks.length !== draft.rounds * draft.draftOrder.length) {
        issues.push(`Draft ${draft.id} pick count does not match rounds and order`);
      }
      const selectedPlayers = new Set<EntityId>();
      for (let index = 0; index < draft.picks.length; index += 1) {
        const pick = draft.picks[index]!;
        if (pick.draftId !== draft.id) issues.push(`Draft pick ${pick.id} points to draft ${pick.draftId}, expected ${draft.id}`);
        if (pick.overallPick !== index + 1) issues.push(`Draft pick ${pick.id} overallPick is inconsistent`);
        if (pick.round !== Math.floor(index / draft.draftOrder.length) + 1) {
          issues.push(`Draft pick ${pick.id} round is inconsistent`);
        }
        if (pick.organizationId !== draft.draftOrder[index % draft.draftOrder.length]) {
          issues.push(`Draft pick ${pick.id} organization does not match draft order`);
        }
        if (!this.organizations.has(pick.organizationId)) {
          issues.push(`Draft pick ${pick.id} has missing organization ${pick.organizationId}`);
        }
        if (!["UNSELECTED", "DRAFTED", "SIGNED", "UNSIGNED"].includes(pick.status)) {
          issues.push(`Draft pick ${pick.id} has invalid status ${pick.status}`);
        }
        if (pick.playerId) {
          const player = this.players.get(pick.playerId);
          if (!player) {
            issues.push(`Draft pick ${pick.id} has missing player ${pick.playerId}`);
          } else if (
            !player.draftEligibility?.eligible ||
            player.draftEligibility.draftLeagueId !== draft.leagueId ||
            player.draftEligibility.draftYear !== draft.year
          ) {
            issues.push(`Draft pick ${pick.id} selected an ineligible player ${pick.playerId}`);
          }
          if (selectedPlayers.has(pick.playerId)) {
            issues.push(`Draft ${draft.id} selected player ${pick.playerId} more than once`);
          }
          selectedPlayers.add(pick.playerId);
        }
      }
    }
  }

  private validateMarketInvariants(issues: string[]): void {
    for (const offer of this.contractOffers.values()) {
      if (!this.players.has(offer.playerId)) issues.push(`Contract offer ${offer.id} has missing player ${offer.playerId}`);
      if (!this.organizations.has(offer.organizationId)) issues.push(`Contract offer ${offer.id} has missing organization ${offer.organizationId}`);
      if (!["PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"].includes(offer.status)) {
        issues.push(`Contract offer ${offer.id} has invalid status ${offer.status}`);
      }
      if (offer.endDate < offer.startDate) issues.push(`Contract offer ${offer.id} endDate is before startDate`);
      if (!Number.isFinite(offer.salary) || offer.salary < 0) issues.push(`Contract offer ${offer.id} salary must be non-negative`);
      if (!Number.isInteger(offer.years) || offer.years <= 0) issues.push(`Contract offer ${offer.id} has invalid years`);
      if (offer.draftId && !this.drafts.has(offer.draftId)) issues.push(`Contract offer ${offer.id} has missing draft ${offer.draftId}`);
      if (offer.postingRequestId && !this.postingRequests.has(offer.postingRequestId)) {
        issues.push(`Contract offer ${offer.id} has missing posting request ${offer.postingRequestId}`);
      }
    }

    for (const proposal of this.tradeProposals.values()) {
      if (!this.organizations.has(proposal.proposerOrganizationId)) {
        issues.push(`Trade proposal ${proposal.id} has missing proposer organization ${proposal.proposerOrganizationId}`);
      }
      if (!this.organizations.has(proposal.targetOrganizationId)) {
        issues.push(`Trade proposal ${proposal.id} has missing target organization ${proposal.targetOrganizationId}`);
      }
      if (proposal.proposerOrganizationId === proposal.targetOrganizationId) {
        issues.push(`Trade proposal ${proposal.id} uses the same organization on both sides`);
      }
      if (!["PROPOSED", "ACCEPTED", "REJECTED", "COUNTERED", "COMPLETED", "WITHDRAWN"].includes(proposal.status)) {
        issues.push(`Trade proposal ${proposal.id} has invalid status ${proposal.status}`);
      }
      const allPlayers = [...proposal.playersFromProposer, ...proposal.playersFromTarget];
      if (new Set(allPlayers).size !== allPlayers.length) {
        issues.push(`Trade proposal ${proposal.id} includes the same player on both sides`);
      }
      for (const playerId of proposal.playersFromProposer) {
        const player = this.players.get(playerId);
        if (!player) issues.push(`Trade proposal ${proposal.id} has missing player ${playerId}`);
        else if (proposal.status !== "COMPLETED" && player.currentOrganizationId !== proposal.proposerOrganizationId) {
          issues.push(`Trade proposal ${proposal.id} proposer does not control player ${playerId}`);
        }
      }
      for (const playerId of proposal.playersFromTarget) {
        const player = this.players.get(playerId);
        if (!player) issues.push(`Trade proposal ${proposal.id} has missing player ${playerId}`);
        else if (proposal.status !== "COMPLETED" && player.currentOrganizationId !== proposal.targetOrganizationId) {
          issues.push(`Trade proposal ${proposal.id} target does not control player ${playerId}`);
        }
      }
    }

    for (const posting of this.postingRequests.values()) {
      const player = this.players.get(posting.playerId);
      if (!player) issues.push(`Posting request ${posting.id} has missing player ${posting.playerId}`);
      if (!this.organizations.has(posting.currentOrganizationId)) {
        issues.push(`Posting request ${posting.id} has missing organization ${posting.currentOrganizationId}`);
      }
      if (!this.leagues.has(posting.sourceLeagueId)) issues.push(`Posting request ${posting.id} has missing source league`);
      for (const leagueId of posting.targetLeagueIds) {
        if (!this.leagues.has(leagueId)) issues.push(`Posting request ${posting.id} has missing target league ${leagueId}`);
      }
      if (!["REQUESTED", "APPROVED", "COMPLETED", "FAILED"].includes(posting.status)) {
        issues.push(`Posting request ${posting.id} has invalid status ${posting.status}`);
      }
      if (posting.status === "COMPLETED" && player?.currentOrganizationId === posting.currentOrganizationId) {
        issues.push(`Posting request ${posting.id} completed but player stayed with source organization`);
      }
      if (posting.status === "FAILED" && player && player.currentOrganizationId !== posting.currentOrganizationId) {
        issues.push(`Posting request ${posting.id} failed but player left source organization`);
      }
    }
  }

  private validateGameRosterInvariants(issues: string[]): void {
    const rosterKeys = new Set<string>();
    for (const roster of this.gameRosters.values()) {
      const key = `${roster.gameId}:${roster.teamId}`;
      if (rosterKeys.has(key)) {
        issues.push(`Duplicate game roster for ${key}`);
      }
      rosterKeys.add(key);
      this.validateGameRosterState(roster, issues);
    }

    for (const rotation of this.pitchingRotations.values()) {
      if (!this.teams.has(rotation.teamId)) {
        issues.push(`Pitching rotation has missing team ${rotation.teamId}`);
      }
      if (rotation.orderedStartingPitcherIds.length === 0) {
        issues.push(`Pitching rotation ${rotation.teamId} has no pitchers`);
      }
      if (new Set(rotation.orderedStartingPitcherIds).size !== rotation.orderedStartingPitcherIds.length) {
        issues.push(`Pitching rotation ${rotation.teamId} has duplicate pitchers`);
      }
      if (
        !Number.isInteger(rotation.nextStarterIndex) ||
        rotation.nextStarterIndex < 0 ||
        rotation.nextStarterIndex >= rotation.orderedStartingPitcherIds.length
      ) {
        issues.push(`Pitching rotation ${rotation.teamId} has invalid nextStarterIndex`);
      }
      for (const playerId of rotation.orderedStartingPitcherIds) {
        const player = this.players.get(playerId);
        if (!player) {
          issues.push(`Pitching rotation ${rotation.teamId} has missing player ${playerId}`);
        } else if (player.currentTeamId !== rotation.teamId) {
          issues.push(`Pitching rotation ${rotation.teamId} player ${playerId} is on another team`);
        }
      }
    }

    for (const [teamId, assignments] of this.bullpenAssignments) {
      if (!this.teams.has(teamId)) {
        issues.push(`Bullpen assignments have missing team ${teamId}`);
      }
      for (const assignment of assignments.values()) {
        if (assignment.teamId !== teamId) {
          issues.push(`Bullpen assignment ${assignment.playerId} team key mismatch`);
        }
        const player = this.players.get(assignment.playerId);
        if (!player) {
          issues.push(`Bullpen assignment has missing player ${assignment.playerId}`);
        } else if (player.currentTeamId !== teamId) {
          issues.push(`Bullpen assignment ${assignment.playerId} is on another team`);
        }
        for (const role of assignment.roles) {
          if (!this.isBullpenRole(role)) {
            issues.push(`Bullpen assignment ${assignment.playerId} has invalid role ${role}`);
          }
        }
      }
    }

    for (const liveGame of this.liveGames.values()) {
      this.validateLiveGameState(liveGame, issues);
    }
    for (const boxScore of this.boxScores.values()) {
      this.validateCompletedBoxScore(boxScore, issues);
    }
    this.validatePlayerStatsInvariants(issues);
  }

  private validateGameRosterState(roster: GameDayRoster, issues: string[]): void {
    const game = this.games.get(roster.gameId);
    if (!game) {
      issues.push(`Game roster ${roster.id} has missing game ${roster.gameId}`);
      return;
    }
    if (roster.teamId !== game.homeTeamId && roster.teamId !== game.awayTeamId) {
      issues.push(`Game roster ${roster.id} team ${roster.teamId} is not in game ${roster.gameId}`);
    }
    if (!this.teams.has(roster.teamId)) {
      issues.push(`Game roster ${roster.id} has missing team ${roster.teamId}`);
    }
    if (!Number.isInteger(roster.rules.maxActivePlayers) || roster.rules.maxActivePlayers < roster.rules.battingOrderSize) {
      issues.push(`Game roster ${roster.id} has invalid maxActivePlayers`);
    }
    if (roster.rules.battingOrderSize !== 9) {
      issues.push(`Game roster ${roster.id} battingOrderSize must be 9 for baseball games`);
    }
    if (roster.activePlayerIds.length > roster.rules.maxActivePlayers) {
      issues.push(`Game roster ${roster.id} exceeds maxActivePlayers`);
    }
    if (new Set(roster.activePlayerIds).size !== roster.activePlayerIds.length) {
      issues.push(`Game roster ${roster.id} has duplicate active players`);
    }
    if (roster.rules.maxBenchPlayers !== undefined && roster.benchPlayerIds.length > roster.rules.maxBenchPlayers) {
      issues.push(`Game roster ${roster.id} exceeds maxBenchPlayers`);
    }
    if (roster.rules.maxBullpenPlayers !== undefined && roster.bullpenPlayerIds.length > roster.rules.maxBullpenPlayers) {
      issues.push(`Game roster ${roster.id} exceeds maxBullpenPlayers`);
    }

    const active = new Set(roster.activePlayerIds);
    for (const playerId of roster.activePlayerIds) {
      this.validateGameRosterPlayer(roster, playerId, issues);
    }
    for (const playerId of [...roster.benchPlayerIds, ...roster.bullpenPlayerIds]) {
      if (!active.has(playerId)) {
        issues.push(`Game roster ${roster.id} player ${playerId} is listed outside active players`);
      }
    }

    if (!roster.startingPitcherId) {
      issues.push(`Game roster ${roster.id} is missing a starting pitcher`);
    } else {
      if (!active.has(roster.startingPitcherId)) {
        issues.push(`Game roster ${roster.id} starting pitcher is not active`);
      }
      this.validateGameRosterPlayer(roster, roster.startingPitcherId, issues);
    }

    if (roster.startingLineup.length !== roster.rules.battingOrderSize) {
      issues.push(`Game roster ${roster.id} starting lineup must have ${roster.rules.battingOrderSize} players`);
    }
    const orders = new Set<number>();
    const lineupPlayers = new Set<EntityId>();
    const positions = new Set<BaseballPosition>();
    for (const slot of roster.startingLineup) {
      if (!Number.isInteger(slot.battingOrder) || slot.battingOrder < 1 || slot.battingOrder > roster.rules.battingOrderSize) {
        issues.push(`Game roster ${roster.id} has invalid battingOrder ${slot.battingOrder}`);
      }
      if (orders.has(slot.battingOrder)) {
        issues.push(`Game roster ${roster.id} has duplicate battingOrder ${slot.battingOrder}`);
      }
      orders.add(slot.battingOrder);
      if (lineupPlayers.has(slot.playerId)) {
        issues.push(`Game roster ${roster.id} has duplicate lineup player ${slot.playerId}`);
      }
      lineupPlayers.add(slot.playerId);
      if (!this.isBaseballPosition(slot.defensivePosition)) {
        issues.push(`Game roster ${roster.id} has invalid position ${slot.defensivePosition}`);
      }
      positions.add(slot.defensivePosition);
      if (!active.has(slot.playerId)) {
        issues.push(`Game roster ${roster.id} lineup player ${slot.playerId} is not active`);
      }
      this.validateGameRosterPlayer(roster, slot.playerId, issues);
    }

    if (roster.rules.usesDH) {
      if (!positions.has("DH")) issues.push(`Game roster ${roster.id} uses DH but has no DH slot`);
      if (positions.has("P")) issues.push(`Game roster ${roster.id} uses DH but has a pitcher batting`);
    } else {
      if (positions.has("DH")) issues.push(`Game roster ${roster.id} does not use DH but has a DH slot`);
      if (!positions.has("P")) issues.push(`Game roster ${roster.id} does not use DH but has no pitcher batting`);
    }

    for (const playerId of roster.benchPlayerIds) {
      if (lineupPlayers.has(playerId)) {
        issues.push(`Game roster ${roster.id} bench player ${playerId} is also in the lineup`);
      }
    }
  }

  private validateGameRosterPlayer(roster: GameDayRoster, playerId: EntityId, issues: string[]): void {
    const player = this.players.get(playerId);
    if (!player) {
      issues.push(`Game roster ${roster.id} has missing player ${playerId}`);
      return;
    }
    const game = this.games.get(roster.gameId);
    if (game?.status !== "COMPLETED") {
      if (player.currentTeamId !== roster.teamId) {
        issues.push(`Game roster ${roster.id} player ${playerId} is not on team ${roster.teamId}`);
      }
      const team = this.teams.get(roster.teamId);
      if (team?.organizationId && player.currentOrganizationId !== team.organizationId) {
        issues.push(`Game roster ${roster.id} player ${playerId} organization does not match team`);
      }
      if (player.status === "RETIRED") {
        issues.push(`Game roster ${roster.id} player ${playerId} is retired`);
      }
      if (!this.isPlayerAvailableForGame(player)) {
        issues.push(`Game roster ${roster.id} player ${playerId} is not available for game`);
      }
    }
  }

  private validateLiveGameState(liveGame: LiveGame, issues: string[]): void {
    const game = this.games.get(liveGame.gameId);
    if (!game) {
      issues.push(`Live game has missing fixture ${liveGame.gameId}`);
      return;
    }
    if (!Number.isInteger(liveGame.inning) || liveGame.inning < 1) {
      issues.push(`Live game ${liveGame.gameId} has invalid inning`);
    }
    if (!Number.isInteger(liveGame.outs) || liveGame.outs < 0 || liveGame.outs > 2) {
      issues.push(`Live game ${liveGame.gameId} has invalid outs`);
    }
    if (liveGame.status === "IN_PROGRESS" && game.status === "COMPLETED") {
      issues.push(`Live game ${liveGame.gameId} is in progress but fixture is completed`);
    }
    if (liveGame.status === "COMPLETED" && game.status !== "COMPLETED") {
      issues.push(`Live game ${liveGame.gameId} is completed but fixture is not completed`);
    }
    for (const [label, value] of Object.entries(liveGame.bases) as [keyof BaseState, EntityId | null][]) {
      if (value && !this.players.has(value)) {
        issues.push(`Live game ${liveGame.gameId} has missing runner on ${label}`);
      }
    }
    const runners = [liveGame.bases.first, liveGame.bases.second, liveGame.bases.third].filter(
      (playerId): playerId is EntityId => !!playerId,
    );
    if (new Set(runners).size !== runners.length) {
      issues.push(`Live game ${liveGame.gameId} has the same runner on multiple bases`);
    }
    if (runners.includes(liveGame.currentBatterId)) {
      issues.push(`Live game ${liveGame.gameId} current batter is already on base`);
    }
    const offenseTeamId = this.offenseTeamId(game, liveGame.half);
    const defenseTeamId = this.defenseTeamId(game, liveGame.half);
    const battingRoster = this.findGameRoster(liveGame.gameId, offenseTeamId);
    const pitchingRoster = this.findGameRoster(liveGame.gameId, defenseTeamId);
    if (!battingRoster) {
      issues.push(`Live game ${liveGame.gameId} is missing batting roster`);
    } else {
      const lineupIndex = liveGame.half === "TOP" ? liveGame.awayLineupIndex : liveGame.homeLineupIndex;
      if (!Number.isInteger(lineupIndex) || lineupIndex < 0 || lineupIndex >= battingRoster.rules.battingOrderSize) {
        issues.push(`Live game ${liveGame.gameId} has invalid lineup index`);
      }
      if (!battingRoster.activePlayerIds.includes(liveGame.currentBatterId)) {
        issues.push(`Live game ${liveGame.gameId} current batter is not on active roster`);
      }
    }
    if (!pitchingRoster) {
      issues.push(`Live game ${liveGame.gameId} is missing pitching roster`);
    } else if (!pitchingRoster.activePlayerIds.includes(liveGame.currentPitcherId)) {
      issues.push(`Live game ${liveGame.gameId} current pitcher is not on active roster`);
    }
    if (liveGame.boxScore.teams.home.runs !== liveGame.homeScore || liveGame.boxScore.teams.away.runs !== liveGame.awayScore) {
      issues.push(`Live game ${liveGame.gameId} box score runs do not match game state`);
    }
    if (new Set(liveGame.removedPlayerIds).size !== liveGame.removedPlayerIds.length) {
      issues.push(`Live game ${liveGame.gameId} has duplicate removed players`);
    }
    if (!this.allowSubstitutionReentryForGame(liveGame.gameId)) {
      for (const playerId of liveGame.removedPlayerIds) {
        if (battingRoster?.startingLineup.some((slot) => slot.playerId === playerId) || pitchingRoster?.startingPitcherId === playerId || runners.includes(playerId)) {
          issues.push(`Live game ${liveGame.gameId} removed player ${playerId} was re-entered`);
        }
      }
    }
    for (const [teamId, defense] of Object.entries(liveGame.currentDefense)) {
      if (!this.teams.has(teamId)) issues.push(`Live game ${liveGame.gameId} has defense for missing team ${teamId}`);
      const defenders = defense.filter((slot) => slot.defensivePosition !== "DH").map((slot) => slot.playerId);
      if (new Set(defenders).size !== defenders.length) {
        issues.push(`Live game ${liveGame.gameId} has the same player at multiple defensive positions`);
      }
      const pitcherSlots = defense.filter((slot) => slot.defensivePosition === "P");
      if (teamId === defenseTeamId && pitcherSlots.length > 0 && pitcherSlots[0]?.playerId !== liveGame.currentPitcherId) {
        issues.push(`Live game ${liveGame.gameId} currentPitcher and defensive P do not match`);
      }
      for (const slot of defense) {
        if (!this.isBaseballPosition(slot.defensivePosition)) {
          issues.push(`Live game ${liveGame.gameId} has invalid defensive position ${slot.defensivePosition}`);
        }
      }
    }
    for (const [teamId, strategy] of Object.entries(liveGame.strategies)) {
      if (!this.teams.has(teamId)) issues.push(`Live game ${liveGame.gameId} has strategy for missing team ${teamId}`);
      for (const [key, value] of Object.entries(strategy)) {
        if (!Number.isFinite(value) || value < 0 || value > 100) {
          issues.push(`Live game ${liveGame.gameId} strategy ${key} must be between 0 and 100`);
        }
      }
    }
    this.validateBoxScorePlayerTotals(liveGame.boxScore, issues);
  }

  private validateCompletedBoxScore(boxScore: BoxScore, issues: string[]): void {
    const game = this.games.get(boxScore.gameId);
    if (!game) {
      issues.push(`Box score has missing fixture ${boxScore.gameId}`);
      return;
    }
    if (!game.result) {
      issues.push(`Box score ${boxScore.gameId} exists before final result`);
      return;
    }
    if (boxScore.teams.home.runs !== game.result.homeScore || boxScore.teams.away.runs !== game.result.awayScore) {
      issues.push(`Box score ${boxScore.gameId} final score does not match fixture result`);
    }
    this.validateBoxScorePlayerTotals(boxScore, issues);
  }

  private validateBoxScorePlayerTotals(boxScore: BoxScore, issues: string[]): void {
    const homeRuns = Object.values(boxScore.batters)
      .filter((line) => line.teamId === boxScore.homeTeamId)
      .reduce((sum, line) => sum + line.runs, 0);
    const awayRuns = Object.values(boxScore.batters)
      .filter((line) => line.teamId === boxScore.awayTeamId)
      .reduce((sum, line) => sum + line.runs, 0);
    if (homeRuns > boxScore.teams.home.runs) {
      issues.push(`Box score ${boxScore.gameId} home player runs exceed team runs`);
    }
    if (awayRuns > boxScore.teams.away.runs) {
      issues.push(`Box score ${boxScore.gameId} away player runs exceed team runs`);
    }
    for (const line of Object.values(boxScore.batters)) {
      if (line.hits > line.atBats || line.atBats > line.plateAppearances) {
        issues.push(`Batter line ${line.playerId} has impossible batting totals`);
      }
    }
    for (const line of Object.values(boxScore.pitchers)) {
      if (line.hits > line.battersFaced || line.walks > line.battersFaced || line.strikeouts > line.outsRecorded) {
        issues.push(`Pitcher line ${line.playerId} has impossible pitching totals`);
      }
    }
  }

  private validatePlayerStatsInvariants(issues: string[]): void {
    for (const stats of this.battingSeasonStats.values()) {
      if (!this.players.has(stats.playerId)) issues.push(`Batting stats have missing player ${stats.playerId}`);
      if (!this.seasons.has(stats.seasonId)) issues.push(`Batting stats have missing season ${stats.seasonId}`);
      if (stats.teamId && !this.teams.has(stats.teamId)) issues.push(`Batting stats have missing team ${stats.teamId}`);
      for (const [key, value] of Object.entries(stats)) {
        if (typeof value === "number" && value < 0) issues.push(`Batting stats ${stats.playerId} ${key} is negative`);
      }
      if (stats.hits > stats.atBats) issues.push(`Batting stats ${stats.playerId} has H > AB`);
      if (stats.doubles + stats.triples + stats.homeRuns > stats.hits) {
        issues.push(`Batting stats ${stats.playerId} extra-base hits exceed hits`);
      }
      if (stats.atBats > stats.plateAppearances) issues.push(`Batting stats ${stats.playerId} has AB > PA`);
      if (stats.walks + stats.atBats > stats.plateAppearances) {
        issues.push(`Batting stats ${stats.playerId} has AB + BB > PA`);
      }
      const derived = this.ensureStandaloneBattingStats(stats.playerId, stats.seasonId);
      Object.assign(derived, { ...stats });
      this.refreshBattingDerived(derived);
      if (
        derived.average !== stats.average ||
        derived.onBasePercentage !== stats.onBasePercentage ||
        derived.sluggingPercentage !== stats.sluggingPercentage ||
        derived.onBasePlusSlugging !== stats.onBasePlusSlugging
      ) {
        issues.push(`Batting stats ${stats.playerId} derived rates are stale`);
      }
    }
    for (const stats of this.pitchingSeasonStats.values()) {
      if (!this.players.has(stats.playerId)) issues.push(`Pitching stats have missing player ${stats.playerId}`);
      if (!this.seasons.has(stats.seasonId)) issues.push(`Pitching stats have missing season ${stats.seasonId}`);
      if (stats.teamId && !this.teams.has(stats.teamId)) issues.push(`Pitching stats have missing team ${stats.teamId}`);
      for (const [key, value] of Object.entries(stats)) {
        if (typeof value === "number" && value < 0) issues.push(`Pitching stats ${stats.playerId} ${key} is negative`);
      }
      if (stats.hits > stats.battersFaced) issues.push(`Pitching stats ${stats.playerId} has H > BF`);
      if (stats.walks > stats.battersFaced) issues.push(`Pitching stats ${stats.playerId} has BB > BF`);
      const derived = this.ensureStandalonePitchingStats(stats.playerId, stats.seasonId);
      Object.assign(derived, { ...stats });
      this.refreshPitchingDerived(derived);
      if (
        derived.inningsPitched !== stats.inningsPitched ||
        derived.earnedRunAverage !== stats.earnedRunAverage ||
        derived.walksHitsPerInningPitched !== stats.walksHitsPerInningPitched ||
        derived.strikeoutsPerNine !== stats.strikeoutsPerNine ||
        derived.walksPerNine !== stats.walksPerNine
      ) {
        issues.push(`Pitching stats ${stats.playerId} derived rates are stale`);
      }
    }
    this.validateSplitTotals(this.battingSeasonStats, issues, "batting");
    this.validateSplitTotals(this.pitchingSeasonStats, issues, "pitching");
  }

  private validateSplitTotals<T extends PlayerBattingSeasonStats | PlayerPitchingSeasonStats>(
    statsMap: Map<string, T>,
    issues: string[],
    label: string,
  ): void {
    const totals = [...statsMap.values()].filter((stats) => stats.split === "TOTAL");
    for (const total of totals) {
      const splits = [...statsMap.values()].filter(
        (stats) => stats.playerId === total.playerId && stats.seasonId === total.seasonId && stats.split === "TEAM",
      );
      if (splits.length === 0) continue;
      const numericKeys = Object.entries(total)
        .filter(([key, value]) => typeof value === "number" && !this.isDerivedStatKey(key))
        .map(([key]) => key);
      for (const key of numericKeys) {
        const splitSum = splits.reduce((sum, stats) => sum + (stats[key as keyof T] as number), 0);
        if ((total[key as keyof T] as number) !== splitSum) {
          issues.push(`${label} stats ${total.playerId} ${total.seasonId} TOTAL ${key} does not match team splits`);
        }
      }
    }
  }

  private findGameRoster(gameId: EntityId, teamId: EntityId): GameDayRoster | undefined {
    return [...this.gameRosters.values()].find(
      (roster) => roster.gameId === gameId && roster.teamId === teamId,
    );
  }

  private requireGameRoster(gameId: EntityId, teamId: EntityId): GameDayRoster {
    const roster = this.findGameRoster(gameId, teamId);
    if (!roster) throw new Error(`Game roster not found for ${gameId}:${teamId}`);
    return roster;
  }

  private requireGameTeam(game: GameFixture, teamId: EntityId): void {
    if (teamId !== game.homeTeamId && teamId !== game.awayTeamId) {
      throw new Error(`Team ${teamId} is not part of game ${game.id}`);
    }
  }

  private resolveGameRosterRules(game: GameFixture, overrides?: Partial<GameRosterRules>): GameRosterRules {
    const season = this.requireSeason(game.seasonId);
    const league = this.requireLeague(season.leagueId);
    const leagueRules = league.gameRosterRules;
    const usesDH = overrides?.usesDH ?? leagueRules?.usesDH ?? league.usesDH ?? true;
    const rules: GameRosterRules = {
      maxActivePlayers: overrides?.maxActivePlayers ?? leagueRules?.maxActivePlayers ?? 26,
      battingOrderSize: overrides?.battingOrderSize ?? leagueRules?.battingOrderSize ?? 9,
      usesDH,
    };
    const maxBenchPlayers = overrides?.maxBenchPlayers ?? leagueRules?.maxBenchPlayers;
    const maxBullpenPlayers = overrides?.maxBullpenPlayers ?? leagueRules?.maxBullpenPlayers;
    if (maxBenchPlayers !== undefined) rules.maxBenchPlayers = maxBenchPlayers;
    if (maxBullpenPlayers !== undefined) rules.maxBullpenPlayers = maxBullpenPlayers;
    return rules;
  }

  private normalizeStartingLineup(lineup: StartingLineupSlot[]): StartingLineupSlot[] {
    return structuredClone(lineup).map((slot) => this.makeLineupSlot(slot.battingOrder, slot.playerId, slot.defensivePosition));
  }

  private makeLineupSlot(
    battingOrder: number,
    playerId: EntityId,
    defensivePosition: BaseballPosition,
  ): StartingLineupSlot {
    const player = this.requirePlayer(playerId);
    const positionFit = this.positionFit(player, defensivePosition);
    return {
      battingOrder,
      playerId,
      defensivePosition,
      positionFit,
      outOfPosition: positionFit < 60,
    };
  }

  private requiredLineupPositions(rules: GameRosterRules): BaseballPosition[] {
    return rules.usesDH
      ? ["C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH"]
      : ["P", "C", "1B", "2B", "3B", "SS", "LF", "CF", "RF"];
  }

  private bestLineupCandidate(
    candidates: Player[],
    selected: Set<EntityId>,
    position: BaseballPosition,
  ): Player | undefined {
    return this.rankGameCandidates(
      candidates.filter((player) => !selected.has(player.id)),
      position,
    )[0];
  }

  private rankGameCandidates(candidates: Player[], position: BaseballPosition): Player[] {
    return [...candidates].sort((a, b) => {
      const scoreA = this.lineupScore(a, position);
      const scoreB = this.lineupScore(b, position);
      return scoreB - scoreA || a.id.localeCompare(b.id);
    });
  }

  private lineupScore(player: Player, position: BaseballPosition): number {
    const hitting =
      player.battingRatings.contact * 0.32 +
      player.battingRatings.power * 0.24 +
      player.battingRatings.plateDiscipline * 0.2 +
      player.battingRatings.speed * 0.12 +
      player.battingRatings.fielding * 0.06 +
      player.battingRatings.arm * 0.06;
    const pitcherScore =
      player.pitchingRatings.velocity * 0.2 +
      player.pitchingRatings.control * 0.25 +
      player.pitchingRatings.movement * 0.25 +
      player.pitchingRatings.stamina * 0.15 +
      player.pitchingRatings.pitchQuality * 0.15;
    const skillScore = position === "P" ? pitcherScore : hitting;
    const conditionScore = player.gameCondition.readiness - player.gameCondition.fatigue * 0.35;
    return (
      this.positionFit(player, position) * 1.2 +
      skillScore +
      player.currentAbility * 0.8 +
      conditionScore * 0.25 +
      this.rng.next() * 0.0001
    );
  }

  private positionFit(player: Player, position: BaseballPosition): number {
    if (position === "DH") return 100;
    if (this.normalizePlayerPosition(player.primaryPosition) === position) return 100;
    if (player.secondaryPositions.some((candidate) => this.normalizePlayerPosition(candidate) === position)) return 80;
    if (position === "P" && this.normalizePlayerPosition(player.primaryPosition) === "P") return 100;
    if (position === "1B" && this.normalizePlayerPosition(player.primaryPosition) === "C") return 45;
    if (
      (position === "2B" || position === "SS" || position === "3B") &&
      ["2B", "SS", "3B"].includes(this.normalizePlayerPosition(player.primaryPosition) ?? "")
    ) {
      return 55;
    }
    if (
      (position === "LF" || position === "CF" || position === "RF") &&
      ["LF", "CF", "RF"].includes(this.normalizePlayerPosition(player.primaryPosition) ?? "")
    ) {
      return 55;
    }
    return 20;
  }

  private normalizePlayerPosition(position: string): BaseballPosition | undefined {
    if (position === "RHP" || position === "LHP" || position === "SP" || position === "RP") return "P";
    return this.isBaseballPosition(position) ? position : undefined;
  }

  private isPlayerAvailableForGame(player: Player): boolean {
    if (player.status === "RETIRED") return false;
    if (!player.gameCondition.availableForGame) return false;
    if (player.injury.status === "INJURED") return false;
    if (player.injury.status === "RECOVERING" && player.gameCondition.readiness < 60) return false;
    if (player.gameCondition.readiness < 40) return false;
    if (player.gameCondition.fatigue > 95) return false;
    return true;
  }

  private assertPlayerBelongsToTeam(playerId: EntityId, teamId: EntityId): void {
    const player = this.requirePlayer(playerId);
    if (player.currentTeamId !== teamId) {
      throw new Error(`Player ${playerId} is not on team ${teamId}`);
    }
  }

  private assertValidBullpenRole(role: BullpenRole): void {
    if (!this.isBullpenRole(role)) throw new Error(`Invalid bullpen role: ${role}`);
  }

  private isBaseballPosition(position: string): position is BaseballPosition {
    return ["P", "C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH"].includes(position);
  }

  private isBullpenRole(role: string): role is BullpenRole {
    return ["CLOSER", "SETUP", "MIDDLE_RELIEF", "LONG_RELIEF", "MOP_UP", "FLEXIBLE"].includes(role);
  }

  private assertSubstitutionPlayerAvailable(
    liveGame: LiveGame,
    roster: GameDayRoster,
    playerId: EntityId,
    source: "bench" | "bullpen",
  ): void {
    const player = this.requirePlayer(playerId);
    if (player.currentTeamId !== roster.teamId) throw new Error(`Player ${playerId} is not on team ${roster.teamId}`);
    if (!roster.activePlayerIds.includes(playerId)) throw new Error(`Player ${playerId} is not active for this game`);
    if (source === "bench" && !roster.benchPlayerIds.includes(playerId)) throw new Error(`Player ${playerId} is not on the bench`);
    if (source === "bullpen" && !roster.bullpenPlayerIds.includes(playerId)) throw new Error(`Player ${playerId} is not in the bullpen`);
    if (roster.startingLineup.some((slot) => slot.playerId === playerId) || this.runnerIds(liveGame).includes(playerId) || liveGame.currentPitcherId === playerId) {
      throw new Error(`Player ${playerId} is already in the game`);
    }
    if (!this.allowSubstitutionReentryForGame(liveGame.gameId) && liveGame.removedPlayerIds.includes(playerId)) {
      throw new Error(`Player ${playerId} already left the game`);
    }
    if (!this.isPlayerAvailableForGame(player)) throw new Error(`Player ${playerId} is not available for game`);
  }

  private markPlayerRemoved(liveGame: LiveGame, playerId: EntityId): void {
    if (!this.allowSubstitutionReentryForGame(liveGame.gameId) && !liveGame.removedPlayerIds.includes(playerId)) {
      liveGame.removedPlayerIds.push(playerId);
    }
  }

  private removePlayerFromGameReserveLists(roster: GameDayRoster, playerId: EntityId): void {
    roster.benchPlayerIds = roster.benchPlayerIds.filter((candidate) => candidate !== playerId);
    roster.bullpenPlayerIds = roster.bullpenPlayerIds.filter((candidate) => candidate !== playerId);
  }

  private updateDefensivePosition(
    liveGame: LiveGame,
    teamId: EntityId,
    playerOutId: EntityId,
    playerInId: EntityId,
    defensivePosition: BaseballPosition,
  ): void {
    const defense = liveGame.currentDefense[teamId] ?? [];
    const existing = defense.find((slot) => slot.playerId === playerOutId || slot.defensivePosition === defensivePosition);
    const replacement = this.makeLineupSlot(existing?.battingOrder ?? 0, playerInId, defensivePosition);
    if (existing) {
      Object.assign(existing, replacement);
    } else {
      defense.push(replacement);
    }
    liveGame.currentDefense[teamId] = defense;
  }

  private syncCurrentDefenseFromRoster(liveGame: LiveGame, teamId: EntityId): void {
    liveGame.currentDefense[teamId] = structuredClone(this.sortedLineup(this.requireGameRoster(liveGame.gameId, teamId)));
  }

  private findRunnerBase(liveGame: LiveGame, playerId: EntityId): keyof BaseState | undefined {
    for (const base of ["first", "second", "third"] as const) {
      if (liveGame.bases[base] === playerId) return base;
    }
    return undefined;
  }

  private runnerIds(liveGame: LiveGame): EntityId[] {
    return [liveGame.bases.first, liveGame.bases.second, liveGame.bases.third].filter(
      (playerId): playerId is EntityId => !!playerId,
    );
  }

  private recordGameAction(
    liveGame: LiveGame,
    data: Omit<GameActionHistoryEntry, "inning" | "half">,
  ): GameActionHistoryEntry {
    const action: GameActionHistoryEntry = {
      inning: liveGame.inning,
      half: liveGame.half,
      ...data,
    };
    liveGame.actionHistory.push(action);
    return action;
  }

  private normalizeManagerGameStrategy(strategy: ManagerGameStrategy): ManagerGameStrategy {
    return {
      offensiveAggression: this.clampRating(strategy.offensiveAggression),
      stealAggression: this.clampRating(strategy.stealAggression),
      buntAggression: this.clampRating(strategy.buntAggression),
      bullpenAggression: this.clampRating(strategy.bullpenAggression),
      intentionalWalkAggression: this.clampRating(strategy.intentionalWalkAggression),
    };
  }

  private defaultManagerGameStrategy(): ManagerGameStrategy {
    return {
      offensiveAggression: 50,
      stealAggression: 50,
      buntAggression: 50,
      bullpenAggression: 50,
      intentionalWalkAggression: 20,
    };
  }

  private chooseBullpenReplacement(liveGame: LiveGame, teamId: EntityId): EntityId | undefined {
    const game = this.requireGame(liveGame.gameId);
    const roster = this.requireGameRoster(liveGame.gameId, teamId);
    const runDiff = teamId === game.homeTeamId
      ? liveGame.homeScore - liveGame.awayScore
      : liveGame.awayScore - liveGame.homeScore;
    const rolePriority = this.bullpenRolePriority(liveGame, runDiff);
    const candidates = roster.bullpenPlayerIds
      .filter((playerId) => playerId !== liveGame.currentPitcherId)
      .filter((playerId) => !liveGame.removedPlayerIds.includes(playerId))
      .filter((playerId) => this.isPlayerAvailableForGame(this.requirePlayer(playerId)));
    if (candidates.length === 0) return undefined;
    return candidates.sort((a, b) => {
      const scoreA = this.bullpenCandidateScore(teamId, a, rolePriority, runDiff);
      const scoreB = this.bullpenCandidateScore(teamId, b, rolePriority, runDiff);
      return scoreB - scoreA || a.localeCompare(b);
    })[0];
  }

  private bullpenRolePriority(liveGame: LiveGame, runDiff: number): BullpenRole[] {
    const regulation = this.regulationInningsForGame(liveGame.gameId);
    const closeLead = runDiff > 0 && runDiff <= this.closerLeadMaxRunsForGame(liveGame.gameId);
    const blowout = Math.abs(runDiff) >= this.blowoutRunDifferentialForGame(liveGame.gameId);
    if (blowout) return ["MOP_UP", "LONG_RELIEF", "FLEXIBLE", "MIDDLE_RELIEF", "SETUP", "CLOSER"];
    if (liveGame.inning >= regulation && closeLead) return ["CLOSER", "SETUP", "FLEXIBLE", "MIDDLE_RELIEF"];
    if (liveGame.inning >= Math.max(1, regulation - 2) && Math.abs(runDiff) <= 3) return ["SETUP", "CLOSER", "FLEXIBLE", "MIDDLE_RELIEF"];
    if (liveGame.inning <= 5) return ["LONG_RELIEF", "MIDDLE_RELIEF", "FLEXIBLE", "SETUP"];
    return ["MIDDLE_RELIEF", "FLEXIBLE", "SETUP", "LONG_RELIEF"];
  }

  private bullpenCandidateScore(teamId: EntityId, playerId: EntityId, rolePriority: BullpenRole[], runDiff: number): number {
    const player = this.requirePlayer(playerId);
    const assignment = this.bullpenAssignments.get(teamId)?.get(playerId);
    const roles = assignment?.roles ?? ["FLEXIBLE"];
    const roleScore = Math.max(
      ...roles.map((role) => {
        const index = rolePriority.indexOf(role);
        return index === -1 ? 0 : (rolePriority.length - index) * 25;
      }),
    );
    const closerPenalty = Math.abs(runDiff) >= this.blowoutRunDifferentialForTeam(teamId) && roles.includes("CLOSER") ? -200 : 0;
    const ability =
      player.pitchingRatings.velocity * 0.2 +
      player.pitchingRatings.control * 0.25 +
      player.pitchingRatings.movement * 0.25 +
      player.pitchingRatings.pitchQuality * 0.2 +
      player.pitchingRatings.stamina * 0.1;
    const condition = player.gameCondition.readiness - player.gameCondition.fatigue * 0.6;
    return roleScore + ability + condition * 0.25 + closerPenalty + this.rng.next() * 0.0001;
  }

  private assertValidDefensivePosition(position: BaseballPosition): void {
    if (!this.isBaseballPosition(position)) throw new Error(`Invalid defensive position: ${position}`);
  }

  private applyGameFatigue(batterId: EntityId, pitcherId: EntityId, result: PlateAppearanceResult): void {
    const batter = this.requirePlayer(batterId);
    const pitcher = this.requirePlayer(pitcherId);
    const batterCost = this.isHit(result) ? 2 : result === "WALK" || result === "HIT_BY_PITCH" ? 1 : 0.8;
    const pitcherCost = 1.8 + (result === "WALK" || result === "HIT_BY_PITCH" ? 0.8 : 0) + (this.isHit(result) ? 0.5 : 0);
    batter.gameCondition.fatigue = this.clampRating(batter.gameCondition.fatigue + batterCost);
    batter.gameCondition.readiness = this.clampRating(batter.gameCondition.readiness - batterCost * 0.25);
    pitcher.gameCondition.fatigue = this.clampRating(pitcher.gameCondition.fatigue + pitcherCost * (1.2 - pitcher.pitchingRatings.stamina / 200));
    pitcher.gameCondition.readiness = this.clampRating(pitcher.gameCondition.readiness - pitcherCost * 0.35);
  }

  private maybeAttemptSteal(gameId: EntityId): PlayByPlayEvent | undefined {
    const liveGame = this.requireLiveGame(gameId);
    const game = this.requireGame(gameId);
    const offenseTeamId = this.offenseTeamId(game, liveGame.half);
    const defenseTeamId = this.defenseTeamId(game, liveGame.half);
    const strategy = liveGame.strategies[offenseTeamId] ?? this.defaultManagerGameStrategy();
    const target = this.stealTarget(liveGame.bases);
    if (!target) return undefined;
    const runner = this.requirePlayer(target.runnerId);
    const attemptChance =
      GAME_BALANCE.stealAttemptBase *
      (0.45 + strategy.stealAggression / 70) *
      (0.45 + runner.battingRatings.speed / 95);
    if (this.rng.next() >= attemptChance) return undefined;

    const pitcher = this.requirePlayer(liveGame.currentPitcherId);
    const catcherArm = this.catcherArm(liveGame, defenseTeamId);
    const successChance = this.clampProbability(
      0.54 +
      (runner.battingRatings.speed - 50) * 0.0045 -
      (catcherArm - 50) * 0.0035 -
      (pitcher.pitchingRatings.control - 50) * 0.0012,
      0.22,
      0.88,
    );
    const success = this.rng.next() < successChance;
    const runnerLine = this.ensureBatterGameLine(liveGame.boxScore, target.runnerId, offenseTeamId);
    if (success) {
      liveGame.bases[target.from] = null;
      liveGame.bases[target.to] = target.runnerId;
      runnerLine.stolenBases += 1;
    } else {
      liveGame.bases[target.from] = null;
      liveGame.outs += 1;
      runnerLine.caughtStealing += 1;
    }
    runner.gameCondition.fatigue = this.clampRating(runner.gameCondition.fatigue + (success ? 1.5 : 1));
    const event: PlayByPlayEvent = {
      inning: liveGame.inning,
      half: liveGame.half,
      batterId: liveGame.currentBatterId,
      pitcherId: liveGame.currentPitcherId,
      result: success ? "STOLEN_BASE" : "CAUGHT_STEALING",
      runsScored: 0,
      outsAfter: liveGame.outs,
      scoreAfter: { homeScore: liveGame.homeScore, awayScore: liveGame.awayScore },
      runnerId: target.runnerId,
      metadata: { from: target.from, to: target.to, successChance },
    };
    liveGame.playByPlay.push(event);
    if (!success && liveGame.outs >= 3) {
      this.advanceHalfInning(liveGame);
    } else {
      this.setCurrentMatchup(liveGame);
    }
    this.assertInvariants();
    return structuredClone(event);
  }

  private maybeAttemptSacrificeBunt(gameId: EntityId): PlayByPlayEvent | undefined {
    const liveGame = this.requireLiveGame(gameId);
    if (liveGame.outs >= 2 || (!liveGame.bases.first && !liveGame.bases.second)) return undefined;
    const game = this.requireGame(gameId);
    const offenseTeamId = this.offenseTeamId(game, liveGame.half);
    const strategy = liveGame.strategies[offenseTeamId] ?? this.defaultManagerGameStrategy();
    const batter = this.requirePlayer(liveGame.currentBatterId);
    const chance =
      GAME_BALANCE.sacrificeBuntAttemptBase *
      (0.35 + strategy.buntAggression / 65) *
      (1.15 - batter.battingRatings.power / 160);
    if (this.rng.next() >= chance) return undefined;
    return this.applyPlateAppearanceResult(gameId, "SACRIFICE_BUNT");
  }

  private stealTarget(bases: BaseState): { runnerId: EntityId; from: keyof BaseState; to: keyof BaseState } | undefined {
    if (bases.second && !bases.third) return { runnerId: bases.second, from: "second", to: "third" };
    if (bases.first && !bases.second) return { runnerId: bases.first, from: "first", to: "second" };
    return undefined;
  }

  private babipEdge(batter: Player, pitcher: Player): number {
    const raw =
      GAME_BALANCE.babipBase +
      (batter.battingRatings.contact - 50) * 0.0022 +
      (batter.battingRatings.speed - 50) * 0.0009 -
      (pitcher.pitchingRatings.movement - 50) * 0.0016 -
      (pitcher.pitchingRatings.pitchQuality - 50) * 0.0009;
    return this.clampProbability(raw, 0.21, 0.37) - GAME_BALANCE.babipBase;
  }

  private resolveBattedBallResult(
    liveGame: LiveGame,
    defenseTeamId: EntityId,
    result: PlateAppearanceResult,
  ): PlateAppearanceResult {
    if (result !== "GROUND_OUT" && result !== "FLY_OUT" && result !== "LINE_OUT") return result;
    const defenseQuality = this.teamDefenseQuality(liveGame, defenseTeamId);
    const batter = this.requirePlayer(liveGame.currentBatterId);
    const outOfPositionCount = (liveGame.currentDefense[defenseTeamId] ?? []).filter((slot) => slot.outOfPosition).length;
    const errorChance = this.clampProbability(
      GAME_BALANCE.errorBase +
      (55 - defenseQuality) * 0.00075 +
      outOfPositionCount * 0.004,
      0.004,
      0.075,
    );
    if (this.rng.next() < errorChance) return "ERROR";

    if (result === "GROUND_OUT" && liveGame.bases.first && liveGame.outs <= 1) {
      const doublePlayChance = this.clampProbability(
        GAME_BALANCE.doublePlayBase +
        (defenseQuality - 50) * 0.002 -
        (batter.battingRatings.speed - 50) * 0.0025,
        0.08,
        0.52,
      );
      if (this.rng.next() < doublePlayChance) return "DOUBLE_PLAY";
    }

    if (result === "FLY_OUT" && liveGame.bases.third && liveGame.outs <= 1) {
      const runner = this.requirePlayer(liveGame.bases.third);
      const sacrificeChance = this.clampProbability(
        GAME_BALANCE.sacrificeFlyBase +
        (runner.battingRatings.speed - 50) * 0.002 -
        (this.outfieldArmQuality(liveGame, defenseTeamId) - 50) * 0.0015,
        0.18,
        0.78,
      );
      if (this.rng.next() < sacrificeChance) return "SACRIFICE_FLY";
    }

    return result;
  }

  private teamDefenseQuality(liveGame: LiveGame, teamId: EntityId): number {
    const defenders = (liveGame.currentDefense[teamId] ?? []).filter((slot) => slot.defensivePosition !== "DH");
    if (defenders.length === 0) return 50;
    const total = defenders.reduce((sum, slot) => {
      const player = this.requirePlayer(slot.playerId);
      const positionPenalty = slot.outOfPosition ? 18 : 0;
      const fatiguePenalty = player.gameCondition.fatigue * 0.08;
      return sum + this.clampRating(player.battingRatings.fielding * 0.75 + slot.positionFit * 0.25 - positionPenalty - fatiguePenalty);
    }, 0);
    return total / defenders.length;
  }

  private outfieldArmQuality(liveGame: LiveGame, teamId: EntityId): number {
    const outfielders = (liveGame.currentDefense[teamId] ?? []).filter((slot) => ["LF", "CF", "RF"].includes(slot.defensivePosition));
    if (outfielders.length === 0) return 50;
    return outfielders.reduce((sum, slot) => sum + this.requirePlayer(slot.playerId).battingRatings.arm, 0) / outfielders.length;
  }

  private catcherArm(liveGame: LiveGame, teamId: EntityId): number {
    const catcher = (liveGame.currentDefense[teamId] ?? []).find((slot) => slot.defensivePosition === "C");
    return catcher ? this.requirePlayer(catcher.playerId).battingRatings.arm : 50;
  }

  private randomFielderId(liveGame: LiveGame, teamId: EntityId, positions?: BaseballPosition[]): EntityId | undefined {
    const defenders = (liveGame.currentDefense[teamId] ?? []).filter((slot) =>
      slot.defensivePosition !== "DH" && (!positions || positions.includes(slot.defensivePosition)),
    );
    if (defenders.length === 0) return undefined;
    return defenders[Math.floor(this.rng.next() * defenders.length)]?.playerId;
  }

  private runnerAdvanceChance(liveGame: LiveGame, runnerId: EntityId, defenseTeamId: EntityId, baseChance: number): boolean {
    const runner = this.requirePlayer(runnerId);
    const chance = this.clampProbability(
      baseChance +
      (runner.battingRatings.speed - 50) * 0.0035 -
      (this.outfieldArmQuality(liveGame, defenseTeamId) - 50) * 0.002,
      0.12,
      0.9,
    );
    return this.rng.next() < chance;
  }

  private recoverDailyFatigue(player: Player): void {
    const recovery = 8 + player.developmentProfile.durability * 0.08 + player.pitchingRatings.stamina * 0.03;
    player.gameCondition.fatigue = this.clampRating(player.gameCondition.fatigue - recovery);
    player.gameCondition.readiness = this.clampRating(player.gameCondition.readiness + recovery * 0.6);
    player.gameCondition.availableForGame = player.injury.status !== "INJURED" && player.gameCondition.readiness >= 40;
  }

  private allowSubstitutionReentryForGame(gameId: EntityId): boolean {
    const game = this.requireGame(gameId);
    return this.requireLeague(this.requireSeason(game.seasonId).leagueId).allowSubstitutionReentry ?? false;
  }

  private bullpenFatigueThresholdForGame(gameId: EntityId): number {
    const game = this.requireGame(gameId);
    return this.requireLeague(this.requireSeason(game.seasonId).leagueId).bullpenFatigueThreshold ?? 55;
  }

  private startingPitcherBattersFacedLimit(pitcher: Player): number {
    const limit =
      GAME_BALANCE.starterBaseBattersFaced +
      pitcher.pitchingRatings.stamina * GAME_BALANCE.starterStaminaBattersFacedInfluence -
      pitcher.gameCondition.fatigue * GAME_BALANCE.starterFatigueBattersFacedPenalty;
    return Math.max(18, Math.min(32, Math.round(limit)));
  }

  private closerLeadMaxRunsForGame(gameId: EntityId): number {
    const game = this.requireGame(gameId);
    return this.requireLeague(this.requireSeason(game.seasonId).leagueId).closerLeadMaxRuns ?? 3;
  }

  private blowoutRunDifferentialForGame(gameId: EntityId): number {
    const game = this.requireGame(gameId);
    return this.requireLeague(this.requireSeason(game.seasonId).leagueId).blowoutRunDifferential ?? 6;
  }

  private blowoutRunDifferentialForTeam(teamId: EntityId): number {
    const team = this.requireTeam(teamId);
    return this.requireLeague(team.leagueId).blowoutRunDifferential ?? 6;
  }

  private accumulateGameStats(game: GameFixture, boxScore: BoxScore): void {
    if (this.accumulatedGameIds.has(game.id)) {
      throw new Error(`Game stats already accumulated: ${game.id}`);
    }
    const decisions = this.decidePitchingOutcomes(game, boxScore);
    for (const line of Object.values(boxScore.batters)) {
      const opponentTeamId = line.teamId === game.homeTeamId ? game.awayTeamId : game.homeTeamId;
      const log: PlayerBattingGameLog = {
        ...structuredClone(line),
        gameId: game.id,
        seasonId: game.seasonId,
        date: game.scheduledDate,
        opponentTeamId,
      };
      this.battingGameLogs.push(log);
      this.addBattingLineToSeasonStats(game.seasonId, line);
    }
    for (const line of Object.values(boxScore.pitchers)) {
      const opponentTeamId = line.teamId === game.homeTeamId ? game.awayTeamId : game.homeTeamId;
      const gamesStarted = this.wasStartingPitcher(game.id, line.teamId, line.playerId) ? 1 : 0;
      const log: PlayerPitchingGameLog = {
        ...structuredClone(line),
        gameId: game.id,
        seasonId: game.seasonId,
        date: game.scheduledDate,
        opponentTeamId,
        gamesStarted,
        wins: decisions.winningPitcherId === line.playerId ? 1 : 0,
        losses: decisions.losingPitcherId === line.playerId ? 1 : 0,
        saves: decisions.savePitcherId === line.playerId ? 1 : 0,
        holds: 0,
        inningsPitched: this.outsToInnings(line.outsRecorded),
      };
      this.pitchingGameLogs.push(log);
      this.addPitchingLineToSeasonStats(game.seasonId, line, {
        gamesStarted,
        wins: log.wins,
        losses: log.losses,
        saves: log.saves,
        holds: 0,
      });
    }
    this.accumulatedGameIds.add(game.id);
    this.recordMilestones(game, boxScore, decisions);
  }

  private addBattingLineToSeasonStats(seasonId: EntityId, line: BatterGameLine): void {
    const player = this.requirePlayer(line.playerId);
    const team = this.requireTeam(line.teamId);
    const addTo = (stats: PlayerBattingSeasonStats): void => {
      stats.games += 1;
      stats.plateAppearances += line.plateAppearances;
      stats.atBats += line.atBats;
      stats.runs += line.runs;
      stats.hits += line.hits;
      stats.doubles += line.doubles;
      stats.triples += line.triples;
      stats.homeRuns += line.homeRuns;
      stats.runsBattedIn += line.runsBattedIn;
      stats.walks += line.walks;
      stats.hitByPitch += line.hitByPitch;
      stats.strikeouts += line.strikeouts;
      stats.sacrificeFlies += line.sacrificeFlies;
      stats.sacrificeHits += line.sacrificeHits;
      stats.groundedIntoDoublePlays += line.groundedIntoDoublePlays;
      stats.stolenBases += line.stolenBases;
      stats.caughtStealing += line.caughtStealing;
      this.refreshBattingDerived(stats);
    };
    addTo(this.ensureBattingSeasonStats(player.id, seasonId, "TOTAL"));
    addTo(this.ensureBattingSeasonStats(player.id, seasonId, "TEAM", line.teamId, team.organizationId));
  }

  private addPitchingLineToSeasonStats(
    seasonId: EntityId,
    line: PitcherGameLine,
    decisions: Pick<PlayerPitchingSeasonStats, "gamesStarted" | "wins" | "losses" | "saves" | "holds">,
  ): void {
    const player = this.requirePlayer(line.playerId);
    const team = this.requireTeam(line.teamId);
    const addTo = (stats: PlayerPitchingSeasonStats): void => {
      stats.games += 1;
      stats.gamesStarted += decisions.gamesStarted;
      stats.battersFaced += line.battersFaced;
      stats.outsRecorded += line.outsRecorded;
      stats.hits += line.hits;
      stats.runs += line.runs;
      stats.earnedRuns += line.earnedRuns;
      stats.walks += line.walks;
      stats.strikeouts += line.strikeouts;
      stats.homeRuns += line.homeRuns;
      stats.wins += decisions.wins;
      stats.losses += decisions.losses;
      stats.saves += decisions.saves;
      stats.holds += decisions.holds;
      this.refreshPitchingDerived(stats);
    };
    addTo(this.ensurePitchingSeasonStats(player.id, seasonId, "TOTAL"));
    addTo(this.ensurePitchingSeasonStats(player.id, seasonId, "TEAM", line.teamId, team.organizationId));
  }

  private ensureBattingSeasonStats(
    playerId: EntityId,
    seasonId: EntityId,
    split: "TEAM" | "TOTAL",
    teamId?: EntityId,
    organizationId?: EntityId,
  ): PlayerBattingSeasonStats {
    const key = this.statsKey(seasonId, playerId, split, teamId);
    const existing = this.battingSeasonStats.get(key);
    if (existing) return existing;
    const stats: PlayerBattingSeasonStats = {
      playerId,
      seasonId,
      ...(teamId ? { teamId } : {}),
      ...(organizationId ? { organizationId } : {}),
      split,
      games: 0,
      plateAppearances: 0,
      atBats: 0,
      runs: 0,
      hits: 0,
      doubles: 0,
      triples: 0,
      homeRuns: 0,
      runsBattedIn: 0,
      walks: 0,
      hitByPitch: 0,
      strikeouts: 0,
      sacrificeFlies: 0,
      sacrificeHits: 0,
      groundedIntoDoublePlays: 0,
      stolenBases: 0,
      caughtStealing: 0,
      average: 0,
      onBasePercentage: 0,
      sluggingPercentage: 0,
      onBasePlusSlugging: 0,
    };
    this.battingSeasonStats.set(key, stats);
    return stats;
  }

  private ensurePitchingSeasonStats(
    playerId: EntityId,
    seasonId: EntityId,
    split: "TEAM" | "TOTAL",
    teamId?: EntityId,
    organizationId?: EntityId,
  ): PlayerPitchingSeasonStats {
    const key = this.statsKey(seasonId, playerId, split, teamId);
    const existing = this.pitchingSeasonStats.get(key);
    if (existing) return existing;
    const stats: PlayerPitchingSeasonStats = {
      playerId,
      seasonId,
      ...(teamId ? { teamId } : {}),
      ...(organizationId ? { organizationId } : {}),
      split,
      games: 0,
      gamesStarted: 0,
      battersFaced: 0,
      outsRecorded: 0,
      hits: 0,
      runs: 0,
      earnedRuns: 0,
      walks: 0,
      strikeouts: 0,
      homeRuns: 0,
      wins: 0,
      losses: 0,
      saves: 0,
      holds: 0,
      inningsPitched: 0,
      earnedRunAverage: 0,
      walksHitsPerInningPitched: 0,
      strikeoutsPerNine: 0,
      walksPerNine: 0,
    };
    this.pitchingSeasonStats.set(key, stats);
    return stats;
  }

  private refreshBattingDerived(stats: PlayerBattingSeasonStats): void {
    const totalBases = stats.hits + stats.doubles + stats.triples * 2 + stats.homeRuns * 3;
    stats.average = this.roundRate(stats.atBats === 0 ? 0 : stats.hits / stats.atBats);
    const obpDenominator = stats.atBats + stats.walks + stats.hitByPitch + stats.sacrificeFlies;
    stats.onBasePercentage = this.roundRate(
      obpDenominator === 0 ? 0 : (stats.hits + stats.walks + stats.hitByPitch) / obpDenominator,
    );
    stats.sluggingPercentage = this.roundRate(stats.atBats === 0 ? 0 : totalBases / stats.atBats);
    stats.onBasePlusSlugging = this.roundRate(stats.onBasePercentage + stats.sluggingPercentage);
  }

  private refreshPitchingDerived(stats: PlayerPitchingSeasonStats): void {
    const innings = stats.outsRecorded / 3;
    stats.inningsPitched = this.outsToInnings(stats.outsRecorded);
    stats.earnedRunAverage = this.roundRate(stats.outsRecorded === 0 ? 0 : (stats.earnedRuns * 27) / stats.outsRecorded);
    stats.walksHitsPerInningPitched = this.roundRate(innings === 0 ? 0 : (stats.walks + stats.hits) / innings);
    stats.strikeoutsPerNine = this.roundRate(stats.outsRecorded === 0 ? 0 : (stats.strikeouts * 27) / stats.outsRecorded);
    stats.walksPerNine = this.roundRate(stats.outsRecorded === 0 ? 0 : (stats.walks * 27) / stats.outsRecorded);
  }

  private sumBattingStats(statsList: PlayerBattingSeasonStats[]): PlayerBattingSeasonStats {
    const total = this.ensureStandaloneBattingStats("__career__", "__career__");
    for (const stats of statsList) {
      total.games += stats.games;
      total.plateAppearances += stats.plateAppearances;
      total.atBats += stats.atBats;
      total.runs += stats.runs;
      total.hits += stats.hits;
      total.doubles += stats.doubles;
      total.triples += stats.triples;
      total.homeRuns += stats.homeRuns;
      total.runsBattedIn += stats.runsBattedIn;
      total.walks += stats.walks;
      total.hitByPitch += stats.hitByPitch;
      total.strikeouts += stats.strikeouts;
      total.sacrificeFlies += stats.sacrificeFlies;
      total.sacrificeHits += stats.sacrificeHits;
      total.groundedIntoDoublePlays += stats.groundedIntoDoublePlays;
      total.stolenBases += stats.stolenBases;
      total.caughtStealing += stats.caughtStealing;
    }
    this.refreshBattingDerived(total);
    return total;
  }

  private sumPitchingStats(statsList: PlayerPitchingSeasonStats[]): PlayerPitchingSeasonStats {
    const total = this.ensureStandalonePitchingStats("__career__", "__career__");
    for (const stats of statsList) {
      total.games += stats.games;
      total.gamesStarted += stats.gamesStarted;
      total.battersFaced += stats.battersFaced;
      total.outsRecorded += stats.outsRecorded;
      total.hits += stats.hits;
      total.runs += stats.runs;
      total.earnedRuns += stats.earnedRuns;
      total.walks += stats.walks;
      total.strikeouts += stats.strikeouts;
      total.homeRuns += stats.homeRuns;
      total.wins += stats.wins;
      total.losses += stats.losses;
      total.saves += stats.saves;
      total.holds += stats.holds;
    }
    this.refreshPitchingDerived(total);
    return total;
  }

  private deriveBattingTotals(
    stats: PlayerBattingSeasonStats,
  ): PlayerCareerStats["batting"] {
    const { playerId: _playerId, seasonId: _seasonId, teamId: _teamId, organizationId: _organizationId, split: _split, ...totals } = stats;
    return totals;
  }

  private derivePitchingTotals(
    stats: PlayerPitchingSeasonStats,
  ): PlayerCareerStats["pitching"] {
    const { playerId: _playerId, seasonId: _seasonId, teamId: _teamId, organizationId: _organizationId, split: _split, ...totals } = stats;
    return totals;
  }

  private ensureStandaloneBattingStats(playerId: EntityId, seasonId: EntityId): PlayerBattingSeasonStats {
    return {
      playerId,
      seasonId,
      split: "TOTAL",
      games: 0,
      plateAppearances: 0,
      atBats: 0,
      runs: 0,
      hits: 0,
      doubles: 0,
      triples: 0,
      homeRuns: 0,
      runsBattedIn: 0,
      walks: 0,
      hitByPitch: 0,
      strikeouts: 0,
      sacrificeFlies: 0,
      sacrificeHits: 0,
      groundedIntoDoublePlays: 0,
      stolenBases: 0,
      caughtStealing: 0,
      average: 0,
      onBasePercentage: 0,
      sluggingPercentage: 0,
      onBasePlusSlugging: 0,
    };
  }

  private ensureStandalonePitchingStats(playerId: EntityId, seasonId: EntityId): PlayerPitchingSeasonStats {
    return {
      playerId,
      seasonId,
      split: "TOTAL",
      games: 0,
      gamesStarted: 0,
      battersFaced: 0,
      outsRecorded: 0,
      hits: 0,
      runs: 0,
      earnedRuns: 0,
      walks: 0,
      strikeouts: 0,
      homeRuns: 0,
      wins: 0,
      losses: 0,
      saves: 0,
      holds: 0,
      inningsPitched: 0,
      earnedRunAverage: 0,
      walksHitsPerInningPitched: 0,
      strikeoutsPerNine: 0,
      walksPerNine: 0,
    };
  }

  private decidePitchingOutcomes(
    game: GameFixture,
    boxScore: BoxScore,
  ): { winningPitcherId?: EntityId; losingPitcherId?: EntityId; savePitcherId?: EntityId } {
    if (!game.result || game.result.homeScore === game.result.awayScore) return {};
    const winningTeamId = game.result.homeScore > game.result.awayScore ? game.homeTeamId : game.awayTeamId;
    const losingTeamId = winningTeamId === game.homeTeamId ? game.awayTeamId : game.homeTeamId;
    const winningPitcherId = this.bestDecisionPitcher(boxScore, winningTeamId);
    const losingPitcherId = this.bestDecisionPitcher(boxScore, losingTeamId);
    return {
      ...(winningPitcherId ? { winningPitcherId } : {}),
      ...(losingPitcherId ? { losingPitcherId } : {}),
    };
  }

  private bestDecisionPitcher(boxScore: BoxScore, teamId: EntityId): EntityId | undefined {
    return Object.values(boxScore.pitchers)
      .filter((line) => line.teamId === teamId)
      .sort((a, b) => b.outsRecorded - a.outsRecorded || b.battersFaced - a.battersFaced || a.playerId.localeCompare(b.playerId))[0]?.playerId;
  }

  private recordMilestones(
    game: GameFixture,
    boxScore: BoxScore,
    decisions: { winningPitcherId?: EntityId },
  ): void {
    for (const line of Object.values(boxScore.batters)) {
      if (line.hits > 0) this.recordMilestoneOnce(line.playerId, "FIRST_HIT", game, "프로 첫 안타");
      if (line.homeRuns > 0) this.recordMilestoneOnce(line.playerId, "FIRST_HOME_RUN", game, "프로 첫 홈런");
      const total = this.battingSeasonStats.get(this.statsKey(game.seasonId, line.playerId, "TOTAL"));
      if (total) {
        for (const mark of [10, 20, 30, 40]) {
          if (total.homeRuns >= mark && total.homeRuns - line.homeRuns < mark) {
            this.recordMilestoneOnce(line.playerId, `SEASON_${mark}_HR:${game.seasonId}`, game, `시즌 ${mark}홈런`);
          }
        }
      }
      const career = this.getPlayerCareerStats(line.playerId);
      for (const mark of [100, 500, 1000]) {
        if (career.batting.hits >= mark && career.batting.hits - line.hits < mark) {
          this.recordMilestoneOnce(line.playerId, `CAREER_${mark}_H`, game, `통산 ${mark}안타`);
        }
      }
    }
    if (decisions.winningPitcherId) {
      this.recordMilestoneOnce(decisions.winningPitcherId, "FIRST_WIN", game, "프로 첫 승");
    }
  }

  private recordMilestoneOnce(playerId: EntityId, milestone: string, game: GameFixture, reason: string): void {
    const key = `${playerId}:${milestone}`;
    if (this.milestoneKeys.has(key)) return;
    this.milestoneKeys.add(key);
    this.record("PLAYER_MILESTONE", {
      subjectId: playerId,
      ...(this.players.get(playerId)?.currentTeamId ? { teamId: this.players.get(playerId)!.currentTeamId } : {}),
      reason,
      payload: { milestone, gameId: game.id, seasonId: game.seasonId },
    });
  }

  private wasStartingPitcher(gameId: EntityId, teamId: EntityId, playerId: EntityId): boolean {
    return this.findGameRoster(gameId, teamId)?.startingPitcherId === playerId;
  }

  private battingLeaderValue(stats: PlayerBattingSeasonStats, category: BattingLeaderCategory): number {
    if (category === "AVG") return stats.average;
    if (category === "HR") return stats.homeRuns;
    if (category === "RBI") return stats.runsBattedIn;
    if (category === "H") return stats.hits;
    return stats.onBasePlusSlugging;
  }

  private pitchingLeaderValue(stats: PlayerPitchingSeasonStats, category: PitchingLeaderCategory): number {
    if (category === "ERA") return stats.earnedRunAverage;
    if (category === "W") return stats.wins;
    if (category === "SO") return stats.strikeouts;
    if (category === "SV") return stats.saves;
    return stats.walksHitsPerInningPitched;
  }

  private statsKey(
    seasonId: EntityId,
    playerId: EntityId,
    split: "TEAM" | "TOTAL",
    teamId?: EntityId,
  ): string {
    return `${seasonId}:${playerId}:${split}:${teamId ?? "TOTAL"}`;
  }

  private outsToInnings(outs: number): number {
    return Math.floor(outs / 3) + (outs % 3) / 10;
  }

  private roundRate(value: number): number {
    return Math.round(value * 1000) / 1000;
  }

  private scoutingError(skill: number, priorCount: number): number {
    const maxError = Math.max(2, Math.round(30 - skill * 0.22 - priorCount * 4));
    return this.rng.int(-maxError, maxError);
  }

  private estimateAttributes(
    player: Player,
    skill: number,
    priorCount: number,
  ): ScoutingAttributeEstimates {
    const estimateRating = (value: number): number => this.clampRating(value + this.scoutingError(skill, priorCount));
    return {
      battingRatings: {
        contact: estimateRating(player.battingRatings.contact),
        power: estimateRating(player.battingRatings.power),
        plateDiscipline: estimateRating(player.battingRatings.plateDiscipline),
        speed: estimateRating(player.battingRatings.speed),
        fielding: estimateRating(player.battingRatings.fielding),
        arm: estimateRating(player.battingRatings.arm),
      },
      pitchingRatings: {
        velocity: estimateRating(player.pitchingRatings.velocity),
        control: estimateRating(player.pitchingRatings.control),
        movement: estimateRating(player.pitchingRatings.movement),
        stamina: estimateRating(player.pitchingRatings.stamina),
        pitchQuality: estimateRating(player.pitchingRatings.pitchQuality),
        repertoire: player.pitchingRatings.repertoire.map((pitch) => ({
          name: pitch.name,
          quality: estimateRating(pitch.quality),
        })),
      },
    };
  }

  private scoutingRecommendation(
    estimatedCA: number,
    estimatedPARange: { low: number; high: number },
    confidence: number,
  ): ScoutingRecommendation {
    const estimatedPA = (estimatedPARange.low + estimatedPARange.high) / 2;
    if (confidence < 35) return "WATCH";
    if (estimatedPA >= 70 || (estimatedCA >= 55 && estimatedPA >= 60)) return "DRAFT";
    if (estimatedPA >= 50 || estimatedCA >= 45) return "FOLLOW";
    return "AVOID";
  }

  private isProspectCandidate(player: Player): boolean {
    return (
      player.status !== "RETIRED" &&
      player.status !== "PROFESSIONAL" &&
      ["STUDENT", "AMATEUR", "INDEPENDENT", "FREE_AGENT"].includes(player.status)
    );
  }

  private latestScoutingReport(playerId: EntityId, organizationId?: EntityId): ScoutingReport | undefined {
    return [...this.scoutingReports.values()]
      .filter((report) => report.playerId === playerId && (!organizationId || report.organizationId === organizationId))
      .sort((a, b) => b.observedOn.localeCompare(a.observedOn) || b.confidence - a.confidence || b.id.localeCompare(a.id))[0];
  }

  private publicProspectEstimate(player: Player, kind: "CA" | "PA"): number {
    const base = kind === "CA" ? player.currentAbility : player.potentialAbility;
    return this.clampRating(base + this.rng.int(-12, 12));
  }

  private positionScarcityBonus(position: string, organizationId?: EntityId): number {
    if (!organizationId) return 0;
    const depth = [...this.players.values()].filter(
      (player) => player.currentOrganizationId === organizationId && player.primaryPosition === position,
    ).length;
    return Math.max(0, 6 - depth) * 1.2;
  }

  private chooseDraftDecision(player: Player): DraftDecision {
    const talentSignal = player.trueCurrentAbility * 0.35 + player.truePotentialAbility * 0.65;
    const declareWeight = Math.max(2, talentSignal - 28 + (player.age >= 18 ? 12 : 0));
    const stayWeight = Math.max(1, 42 - player.age + (player.status === "STUDENT" ? 14 : 4));
    const abroadWeight = Math.max(1, (talentSignal - 62) * 0.35);
    const independentWeight = Math.max(1, 35 - talentSignal + (player.age >= 21 ? 10 : 0));
    const stopWeight = Math.max(1, 25 - talentSignal + (player.injury.status === "HEALTHY" ? 0 : 10));
    const total = declareWeight + stayWeight + abroadWeight + independentWeight + stopWeight;
    let roll = this.rng.next() * total;
    const weighted: [DraftDecision, number][] = [
      ["DECLARE", declareWeight],
      ["STAY_SCHOOL", stayWeight],
      ["GO_ABROAD", abroadWeight],
      ["INDEPENDENT", independentWeight],
      ["STOP_PLAYING", stopWeight],
    ];
    for (const [decision, weight] of weighted) {
      roll -= weight;
      if (roll <= 0) return decision;
    }
    return "DECLARE";
  }

  private draftDecisionReason(decision: DraftDecision): string {
    if (decision === "DECLARE") return "드래프트 참가 선언";
    if (decision === "STAY_SCHOOL") return "학교 또는 대학 잔류 선택";
    if (decision === "GO_ABROAD") return "해외 진학 가능성 선택";
    if (decision === "INDEPENDENT") return "사회인/독립리그 진로 선택";
    return "야구 지속 중단 고려";
  }

  private defaultDraftOrder(seasonId: EntityId): EntityId[] {
    const standings = this.getStandings(seasonId);
    const orderedTeamIds = standings.length > 0
      ? [...standings].reverse().map((record) => record.teamId)
      : [...this.competitions.values()].find((competition) => competition.seasonId === seasonId)?.participatingTeamIds ?? [];
    const order: EntityId[] = [];
    for (const teamId of orderedTeamIds) {
      const organizationId = this.requireTeam(teamId).organizationId;
      if (organizationId && !order.includes(organizationId)) order.push(organizationId);
    }
    return order;
  }

  private assertPlayerDraftEligible(player: Player, draft: Draft): void {
    const eligibility = player.draftEligibility;
    if (
      !eligibility?.eligible ||
      !eligibility.declared ||
      eligibility.status !== "DECLARED" ||
      eligibility.draftLeagueId !== draft.leagueId ||
      eligibility.draftYear !== draft.year
    ) {
      throw new Error(`Player is not eligible and declared for draft: ${player.id}`);
    }
  }

  private nextDraftPick(draft: Draft, organizationId: EntityId): DraftPick | undefined {
    return draft.picks.find((pick) => !pick.playerId && pick.organizationId === organizationId);
  }

  private draftBoardScore(player: Player, organizationId: EntityId): number {
    const report = this.latestScoutingReport(player.id, organizationId) ?? this.latestScoutingReport(player.id);
    const estimatedCA = report?.estimatedCA ?? this.publicProspectEstimate(player, "CA");
    const estimatedPARange = report?.estimatedPARange ?? {
      low: this.clampRating(this.publicProspectEstimate(player, "PA") - 20),
      high: this.clampRating(this.publicProspectEstimate(player, "PA") + 20),
    };
    const estimatedPA = (estimatedPARange.low + estimatedPARange.high) / 2;
    const need = this.positionScarcityBonus(player.primaryPosition, organizationId);
    return (
      estimatedPA * 0.52 +
      estimatedCA * 0.3 +
      (report?.confidence ?? 12) * 0.08 +
      need -
      Math.max(0, player.age - 18) * 1.3 +
      this.rng.next() * 0.001
    );
  }

  private recordDraftCareerEntry(player: Player, draft: Draft, pick: DraftPick): void {
    const organization = this.requireOrganization(pick.organizationId);
    player.careerEntries.push({
      id: this.ids.nextId("career"),
      personId: player.id,
      personType: "PLAYER",
      organizationNameSnapshot: organization.name,
      role: "DRAFT_PICK",
      status: "DRAFTED",
      startDate: this.clock.now(),
      endDate: this.clock.now(),
      reason: `Draft ${draft.year} round ${pick.round} pick ${pick.overallPick}`,
    });
  }

  private completeDraft(draft: Draft): void {
    draft.status = "COMPLETED";
    for (const player of this.getAvailableDraftPlayers(draft.id)) {
      const stored = this.requirePlayer(player.id);
      stored.draftEligibility = {
        ...stored.draftEligibility!,
        status: "UNDRAFTED",
        declared: true,
        reason: "드래프트 미지명",
      };
      this.record("PLAYER_UNDRAFTED", {
        subjectId: stored.id,
        reason: "드래프트 미지명",
        payload: { draftId: draft.id, draftLeagueId: draft.leagueId, draftYear: draft.year },
      });
    }
  }

  private normalizeContractDemand(demand: PlayerContractDemand): PlayerContractDemand {
    return {
      desiredSalary: Math.max(0, Math.round(demand.desiredSalary)),
      desiredYears: Math.max(1, Math.round(demand.desiredYears)),
      minimumSalary: Math.max(0, Math.round(demand.minimumSalary)),
      minimumYears: Math.max(1, Math.round(demand.minimumYears)),
      preferredRole: demand.preferredRole,
      ...(demand.preferredLeagueIds ? { preferredLeagueIds: structuredClone(demand.preferredLeagueIds) } : {}),
      ...(demand.preferredCountryIds ? { preferredCountryIds: structuredClone(demand.preferredCountryIds) } : {}),
    };
  }

  private defaultContractDemand(player: Player): PlayerContractDemand {
    const baseSalary = Math.max(30_000, Math.round((player.currentAbility * 18_000 + player.potentialAbility * 12_000) / 10) * 10);
    return {
      desiredSalary: baseSalary,
      desiredYears: player.age < 24 ? 3 : player.age < 31 ? 2 : 1,
      minimumSalary: Math.round(baseSalary * 0.65),
      minimumYears: 1,
      preferredRole: player.primaryPosition,
    };
  }

  private organizationOpportunityScore(player: Player, organizationId: EntityId): number {
    const teams = [...this.teams.values()].filter((team) => team.organizationId === organizationId);
    const leagueScore = teams.reduce((best, team) => Math.max(best, 90 - this.requireLeague(team.leagueId).level * 8), 40);
    const positionDepth = [...this.players.values()].filter(
      (candidate) => candidate.currentOrganizationId === organizationId && candidate.primaryPosition === player.primaryPosition,
    ).length;
    const playingTime = Math.max(20, 90 - positionDepth * 12);
    const standingsScore = teams.reduce((best, team) => {
      const records = [...this.standings.values()].flatMap((seasonRecords) => [...seasonRecords.values()]);
      const record = records.find((candidate) => candidate.teamId === team.id);
      return Math.max(best, record ? record.winningPercentage * 100 : 50);
    }, 50);
    return this.clampRating(leagueScore * 0.35 + playingTime * 0.35 + standingsScore * 0.3);
  }

  private contractPreferenceScore(offer: ContractOffer, demand: PlayerContractDemand): number {
    let score = 50;
    if (demand.preferredRole && offer.preferredRole === demand.preferredRole) score += 12;
    const teams = [...this.teams.values()].filter((team) => team.organizationId === offer.organizationId);
    if (demand.preferredLeagueIds?.some((leagueId) => teams.some((team) => team.leagueId === leagueId))) score += 18;
    if (demand.preferredCountryIds?.some((countryId) => teams.some((team) => this.requireLeague(team.leagueId).countryId === countryId))) score += 18;
    if (offer.noTradeClause) score += 4;
    if (offer.playerOption) score += 4;
    return this.clampRating(score);
  }

  private markDraftPickSigned(offer: ContractOffer): void {
    if (!offer.draftId) return;
    const draft = this.requireDraft(offer.draftId);
    const pick = draft.picks.find((candidate) => candidate.playerId === offer.playerId && candidate.organizationId === offer.organizationId);
    if (pick) pick.status = "SIGNED";
  }

  private completePostingIfNeeded(offer: ContractOffer): void {
    if (!offer.postingRequestId) return;
    const posting = this.requirePostingRequest(offer.postingRequestId);
    posting.status = "COMPLETED";
    posting.completedOn = this.clock.now();
    this.record("POSTING_COMPLETED", {
      subjectId: posting.playerId,
      reason: "포스팅 해외 계약 완료",
      payload: { postingRequestId: posting.id, organizationId: offer.organizationId, compensationFee: posting.compensationFee ?? 0 },
    });
  }

  private failPostingIfAllOffersRejected(offer: ContractOffer): void {
    if (!offer.postingRequestId) return;
    const posting = this.requirePostingRequest(offer.postingRequestId);
    if (posting.status !== "APPROVED") return;
    const offers = [...this.contractOffers.values()].filter((candidate) => candidate.postingRequestId === posting.id);
    if (offers.length > 0 && offers.every((candidate) => candidate.status === "REJECTED" || candidate.status === "WITHDRAWN")) {
      posting.status = "FAILED";
      this.record("POSTING_FAILED", {
        subjectId: posting.playerId,
        reason: "해외 제안 거절",
        payload: { postingRequestId: posting.id },
      });
    }
  }

  private assertTradePlayerLists(
    proposerOrganizationId: EntityId,
    targetOrganizationId: EntityId,
    playersFromProposer: EntityId[],
    playersFromTarget: EntityId[],
  ): void {
    const proposerSet = new Set(playersFromProposer);
    for (const playerId of playersFromTarget) {
      if (proposerSet.has(playerId)) throw new Error(`Player cannot be on both sides of a trade: ${playerId}`);
    }
    for (const playerId of playersFromProposer) {
      const player = this.requirePlayer(playerId);
      if (player.currentOrganizationId !== proposerOrganizationId) {
        throw new Error(`Trade proposer does not control player ${playerId}`);
      }
    }
    for (const playerId of playersFromTarget) {
      const player = this.requirePlayer(playerId);
      if (player.currentOrganizationId !== targetOrganizationId) {
        throw new Error(`Trade target does not control player ${playerId}`);
      }
    }
  }

  private buildCounterProposal(proposal: TradeProposal, evaluatorId: EntityId): TradeProposal {
    const counter: TradeProposal = {
      id: this.ids.nextId("trade_counter"),
      proposerOrganizationId: evaluatorId,
      targetOrganizationId: evaluatorId === proposal.targetOrganizationId ? proposal.proposerOrganizationId : proposal.targetOrganizationId,
      playersFromProposer: evaluatorId === proposal.targetOrganizationId ? structuredClone(proposal.playersFromTarget) : structuredClone(proposal.playersFromProposer),
      playersFromTarget: evaluatorId === proposal.targetOrganizationId ? structuredClone(proposal.playersFromProposer) : structuredClone(proposal.playersFromTarget),
      cash: Math.round((proposal.cash ?? 0) + 1_000_000),
      draftPickIds: [],
      status: "COUNTERED",
      proposedOn: this.clock.now(),
      reason: "AI counter proposal",
    };
    proposal.status = "COUNTERED";
    proposal.counterProposalId = counter.id;
    this.tradeProposals.set(counter.id, counter);
    return counter;
  }

  private transferPlayerOrganizationOnly(playerId: EntityId, toOrganizationId: EntityId, reason: string): void {
    const player = this.requirePlayer(playerId);
    const fromOrganizationId = player.currentOrganizationId;
    this.requireOrganization(toOrganizationId);
    this.closeOpenRosterAssignment(player, reason);
    delete player.currentTeamId;
    delete player.rosterStatus;
    player.currentOrganizationId = toOrganizationId;
    player.status = "PROFESSIONAL";
    for (const contract of player.contracts) {
      if (contract.contractStatus === "ACTIVE") contract.organizationId = toOrganizationId;
    }
    this.replaceCareerEntry(player, "PLAYER", {
      role: player.primaryPosition,
      status: player.status,
      reason,
      organizationNameSnapshot: this.requireOrganization(toOrganizationId).name,
    });
    this.record("PLAYER_MOVED", {
      subjectId: player.id,
      reason,
      payload: { fromOrganizationId, toOrganizationId, trade: true },
    });
  }

  private activeContract(player: Player): PlayerContract | undefined {
    return player.contracts.find((contract) => contract.contractStatus === "ACTIVE");
  }

  private activeManagerContract(manager: Manager): ManagerContract | undefined {
    return manager.contracts.find((contract) => contract.status === "ACTIVE");
  }

  private closeActiveManagerContract(manager: Manager, reason: string): void {
    const active = this.activeManagerContract(manager);
    if (!active) return;
    active.status = "TERMINATED";
    const mapContract = this.managerContracts.get(active.id);
    if (mapContract) mapContract.status = "TERMINATED";
    this.annotateOpenManagerCareerStats(manager, reason);
  }

  private assignManagerEmployment(
    manager: Manager,
    organizationId: EntityId,
    teamId: EntityId | undefined,
    role: ManagerRole,
    reason: string,
  ): void {
    manager.currentOrganizationId = organizationId;
    if (teamId) manager.currentTeamId = teamId;
    else delete manager.currentTeamId;
    manager.status = "EMPLOYED";
    manager.employmentStatus = "EMPLOYED";
    manager.boardConfidence = {
      managerId: manager.id,
      organizationId,
      ...(teamId ? { teamId } : {}),
      score: manager.boardConfidence?.organizationId === organizationId ? manager.boardConfidence.score : 60,
      updatedOn: this.clock.now(),
      reason: "구단 신뢰도 시작",
    };
    this.startCareerEntry(manager, "MANAGER", {
      ...(teamId ? { teamId } : {}),
      ...(!teamId ? { organizationNameSnapshot: this.requireOrganization(organizationId).name } : {}),
      role,
      status: manager.status,
      reason,
    });
  }

  private annotateOpenManagerCareerStats(manager: Manager, endReason: string): void {
    const open = [...manager.careerEntries].reverse().find((entry) => !entry.endDate);
    if (!open) return;
    open.games = manager.careerStats.games;
    open.wins = manager.careerStats.wins;
    open.losses = manager.careerStats.losses;
    open.draws = manager.careerStats.draws;
    open.winningPercentage = manager.careerStats.winningPercentage;
    open.championships = manager.careerStats.championships;
    open.endReason = endReason;
  }

  private managerForTeam(teamId: EntityId): Manager | undefined {
    return [...this.managers.values()].find(
      (manager) => manager.status === "EMPLOYED" && manager.currentTeamId === teamId,
    );
  }

  private openVacancyForDepartedManager(
    organizationId: EntityId | undefined,
    teamId: EntityId | undefined,
    expectations: string,
  ): void {
    if (!organizationId || !teamId) return;
    if ([...this.managerJobVacancies.values()].some((vacancy) => vacancy.teamId === teamId && vacancy.status === "OPEN")) {
      return;
    }
    const vacancy: ManagerJobVacancy = {
      id: this.ids.nextId("manager_job"),
      organizationId,
      teamId,
      openedOn: this.clock.now(),
      status: "OPEN",
      minimumReputation: 35,
      preferredReputation: 60,
      salaryRange: { min: 300_000, max: 900_000, currency: "USD" },
      contractYearsRange: { min: 1, max: 3 },
      expectations,
    };
    this.managerJobVacancies.set(vacancy.id, vacancy);
  }

  private assertSalaryRange(range: ManagerJobVacancy["salaryRange"]): void {
    if (!Number.isFinite(range.min) || !Number.isFinite(range.max) || range.min < 0 || range.max < range.min) {
      throw new Error("Manager vacancy salaryRange is invalid");
    }
    if (!range.currency) throw new Error("Manager vacancy salaryRange requires currency");
  }

  private assertYearsRange(range: ManagerJobVacancy["contractYearsRange"]): void {
    if (!Number.isInteger(range.min) || !Number.isInteger(range.max) || range.min <= 0 || range.max < range.min) {
      throw new Error("Manager vacancy contractYearsRange is invalid");
    }
  }

  private assertValidManagerContractShape(contract: Pick<ManagerContract, "startDate" | "endDate" | "salary" | "currency" | "status">): void {
    if (contract.endDate < contract.startDate) throw new Error("Manager contract endDate must be >= startDate");
    if (!Number.isFinite(contract.salary) || contract.salary < 0) throw new Error("Manager contract salary must be non-negative");
    if (!contract.currency) throw new Error("Manager contract currency is required");
    if (!["ACTIVE", "EXPIRED", "TERMINATED"].includes(contract.status)) {
      throw new Error(`Invalid manager contract status: ${contract.status}`);
    }
  }

  private contractYears(startDate: ISODate, endDate: ISODate): number {
    const startYear = Number(startDate.slice(0, 4));
    const endYear = Number(endDate.slice(0, 4));
    return Math.max(1, endYear - startYear + 1);
  }

  private isDerivedStatKey(key: string): boolean {
    return [
      "average",
      "onBasePercentage",
      "sluggingPercentage",
      "onBasePlusSlugging",
      "inningsPitched",
      "earnedRunAverage",
      "walksHitsPerInningPitched",
      "strikeoutsPerNine",
      "walksPerNine",
    ].includes(key);
  }

  private requireLiveGame(gameId: EntityId): LiveGame {
    const liveGame = this.liveGames.get(gameId);
    if (!liveGame) throw new Error(`Live game not found: ${gameId}`);
    return liveGame;
  }

  private createEmptyBoxScore(game: GameFixture): BoxScore {
    return {
      gameId: game.id,
      homeTeamId: game.homeTeamId,
      awayTeamId: game.awayTeamId,
      teams: {
        home: { teamId: game.homeTeamId, inningRuns: [], runs: 0, hits: 0, errors: 0 },
        away: { teamId: game.awayTeamId, inningRuns: [], runs: 0, hits: 0, errors: 0 },
      },
      batters: {},
      pitchers: {},
    };
  }

  private offenseTeamId(game: GameFixture, half: GameHalf): EntityId {
    return half === "TOP" ? game.awayTeamId : game.homeTeamId;
  }

  private defenseTeamId(game: GameFixture, half: GameHalf): EntityId {
    return half === "TOP" ? game.homeTeamId : game.awayTeamId;
  }

  private sortedLineup(roster: GameDayRoster): StartingLineupSlot[] {
    return [...roster.startingLineup].sort((a, b) => a.battingOrder - b.battingOrder);
  }

  private isActionableGameForDailyProgress(game: GameFixture): boolean {
    return game.status === "SCHEDULED";
  }

  private isGameCompletedForDailyProgress(game: GameFixture): boolean {
    return game.status === "COMPLETED" || game.status === "POSTPONED" || game.status === "CANCELLED";
  }

  private gameIncludesTeam(game: GameFixture, teamId: EntityId): boolean {
    return game.homeTeamId === teamId || game.awayTeamId === teamId;
  }

  private simulateDailyGame(gameId: EntityId, control: PlayableGameControl, date: ISODate): void {
    const game = this.requireGame(gameId);
    if (this.isGameCompletedForDailyProgress(game)) return;
    try {
      this.prepareGameForDailyProgress(gameId, date);
      this.simulateGame(gameId);
    } catch (error) {
      throw this.dailyProgressError(error, date, game, control);
    }
  }

  private prepareGameForDailyProgress(gameId: EntityId, date: ISODate): void {
    const game = this.requireGame(gameId);
    if (game.scheduledDate !== date) {
      throw new Error(`Game ${game.id} is scheduled for ${game.scheduledDate}, not ${date}`);
    }
    for (const teamId of [game.homeTeamId, game.awayTeamId]) {
      if (!this.findGameRoster(game.id, teamId)) {
        const startingPitcherId = this.selectDailyStartingPitcher(teamId);
        this.autoGenerateLineup({
          gameId: game.id,
          teamId,
          ...(startingPitcherId ? { startingPitcherId } : {}),
        });
      }
    }
    const issues = this.validateGameReady(game.id);
    if (issues.length > 0) {
      throw new Error(`Game is not ready: ${issues.join("; ")}`);
    }
  }

  private selectDailyStartingPitcher(teamId: EntityId): EntityId | undefined {
    const rotation = this.pitchingRotations.get(teamId);
    if (rotation) {
      for (let attempt = 0; attempt < rotation.orderedStartingPitcherIds.length; attempt += 1) {
        const playerId = rotation.orderedStartingPitcherIds[rotation.nextStarterIndex]!;
        rotation.nextStarterIndex = (rotation.nextStarterIndex + 1) % rotation.orderedStartingPitcherIds.length;
        const player = this.players.get(playerId);
        if (player?.currentTeamId === teamId && this.isPlayerAvailableForGame(player)) return playerId;
      }
    }
    return this.rankGameCandidates(
      [...this.players.values()].filter((player) => player.currentTeamId === teamId && this.isPlayerAvailableForGame(player)),
      "P",
    )[0]?.id;
  }

  private dailyProgressError(error: unknown, date: ISODate, game: GameFixture, control: PlayableGameControl): Error {
    const details = error instanceof Error ? error.message : String(error);
    return new Error(
      `Daily progress failed on ${date} for ${control} ${game.id} (${game.awayTeamId} @ ${game.homeTeamId}): ${details}`,
    );
  }

  private setCurrentMatchup(liveGame: LiveGame): void {
    const game = this.requireGame(liveGame.gameId);
    const battingRoster = this.requireGameRoster(liveGame.gameId, this.offenseTeamId(game, liveGame.half));
    const pitchingRoster = this.requireGameRoster(liveGame.gameId, this.defenseTeamId(game, liveGame.half));
    const lineup = this.sortedLineup(battingRoster);
    const lineupIndex = liveGame.half === "TOP" ? liveGame.awayLineupIndex : liveGame.homeLineupIndex;
    liveGame.currentBatterId = lineup[lineupIndex]!.playerId;
    liveGame.currentPitcherId = pitchingRoster.startingPitcherId!;
  }

  private advanceLineupIndex(liveGame: LiveGame, game: GameFixture): void {
    const offenseTeamId = this.offenseTeamId(game, liveGame.half);
    const lineupSize = this.requireGameRoster(liveGame.gameId, offenseTeamId).rules.battingOrderSize;
    if (liveGame.half === "TOP") {
      liveGame.awayLineupIndex = (liveGame.awayLineupIndex + 1) % lineupSize;
    } else {
      liveGame.homeLineupIndex = (liveGame.homeLineupIndex + 1) % lineupSize;
    }
  }

  private advanceHalfInning(liveGame: LiveGame): void {
    if (this.shouldCompleteAfterHalfInning(liveGame)) {
      this.completeLiveGame(liveGame, "경기 종료");
      return;
    }
    liveGame.outs = 0;
    liveGame.bases = { first: null, second: null, third: null };
    if (liveGame.half === "TOP") {
      liveGame.half = "BOTTOM";
    } else {
      liveGame.half = "TOP";
      liveGame.inning += 1;
    }
    this.setCurrentMatchup(liveGame);
  }

  private advanceBases(
    liveGame: LiveGame,
    result: PlateAppearanceResult,
    batterId: EntityId,
    defenseTeamId: EntityId,
  ): { runsScored: number; scoredPlayerIds: EntityId[]; rbiCredit: number; fielderId: EntityId | undefined } {
    const oldBases = structuredClone(liveGame.bases);
    const scoredPlayerIds: EntityId[] = [];
    const score = (playerId: EntityId | null): void => {
      if (playerId) scoredPlayerIds.push(playerId);
    };

    if (result === "WALK" || result === "HIT_BY_PITCH") {
      let second = oldBases.second;
      let third = oldBases.third;
      if (oldBases.first) {
        second = oldBases.first;
        if (oldBases.second) {
          third = oldBases.second;
          if (oldBases.third) score(oldBases.third);
        }
      }
      liveGame.bases = {
        first: batterId,
        second,
        third,
      };
      return { runsScored: scoredPlayerIds.length, scoredPlayerIds, rbiCredit: scoredPlayerIds.length, fielderId: undefined };
    }

    if (result === "SINGLE") {
      score(oldBases.third);
      const secondScores = oldBases.second && this.runnerAdvanceChance(liveGame, oldBases.second, defenseTeamId, 0.58);
      if (secondScores) score(oldBases.second);
      const firstToThird = oldBases.first && !oldBases.second && this.runnerAdvanceChance(liveGame, oldBases.first, defenseTeamId, 0.38);
      liveGame.bases = {
        first: batterId,
        second: firstToThird ? null : oldBases.first,
        third: secondScores ? (firstToThird ? oldBases.first : null) : oldBases.second,
      };
      return { runsScored: scoredPlayerIds.length, scoredPlayerIds, rbiCredit: scoredPlayerIds.length, fielderId: undefined };
    }

    if (result === "DOUBLE") {
      score(oldBases.third);
      score(oldBases.second);
      const firstScores = oldBases.first && this.runnerAdvanceChance(liveGame, oldBases.first, defenseTeamId, 0.42);
      if (firstScores) score(oldBases.first);
      liveGame.bases = { first: null, second: batterId, third: firstScores ? null : oldBases.first };
      return { runsScored: scoredPlayerIds.length, scoredPlayerIds, rbiCredit: scoredPlayerIds.length, fielderId: undefined };
    }

    if (result === "TRIPLE") {
      score(oldBases.third);
      score(oldBases.second);
      score(oldBases.first);
      liveGame.bases = { first: null, second: null, third: batterId };
      return { runsScored: scoredPlayerIds.length, scoredPlayerIds, rbiCredit: scoredPlayerIds.length, fielderId: undefined };
    }

    if (result === "HOME_RUN") {
      score(oldBases.third);
      score(oldBases.second);
      score(oldBases.first);
      score(batterId);
      liveGame.bases = { first: null, second: null, third: null };
      return { runsScored: scoredPlayerIds.length, scoredPlayerIds, rbiCredit: scoredPlayerIds.length, fielderId: undefined };
    }

    if (result === "DOUBLE_PLAY") {
      liveGame.bases = { ...oldBases, first: null };
      return { runsScored: 0, scoredPlayerIds, rbiCredit: 0, fielderId: this.randomFielderId(liveGame, defenseTeamId) };
    }

    if (result === "SACRIFICE_FLY") {
      score(oldBases.third);
      liveGame.bases = { first: oldBases.first, second: oldBases.second, third: null };
      return { runsScored: scoredPlayerIds.length, scoredPlayerIds, rbiCredit: scoredPlayerIds.length, fielderId: this.randomFielderId(liveGame, defenseTeamId, ["LF", "CF", "RF"]) };
    }

    if (result === "SACRIFICE_BUNT") {
      if (oldBases.third) score(oldBases.third);
      liveGame.bases = {
        first: null,
        second: oldBases.first,
        third: oldBases.second,
      };
      return { runsScored: scoredPlayerIds.length, scoredPlayerIds, rbiCredit: 0, fielderId: this.randomFielderId(liveGame, defenseTeamId, ["P", "C", "1B", "3B"]) };
    }

    if (result === "ERROR") {
      score(oldBases.third);
      liveGame.bases = {
        first: batterId,
        second: oldBases.first,
        third: oldBases.second,
      };
      return { runsScored: scoredPlayerIds.length, scoredPlayerIds, rbiCredit: 0, fielderId: this.randomFielderId(liveGame, defenseTeamId) };
    }

    return { runsScored: 0, scoredPlayerIds, rbiCredit: 0, fielderId: this.outsForResult(result) > 0 ? this.randomFielderId(liveGame, defenseTeamId) : undefined };
  }

  private outsForResult(result: PlateAppearanceResult): number {
    if (result === "DOUBLE_PLAY") return 2;
    return result === "STRIKEOUT" ||
      result === "GROUND_OUT" ||
      result === "FLY_OUT" ||
      result === "LINE_OUT" ||
      result === "SACRIFICE_FLY" ||
      result === "SACRIFICE_BUNT"
      ? 1
      : 0;
  }

  private isHit(result: PlateAppearanceResult): boolean {
    return result === "SINGLE" || result === "DOUBLE" || result === "TRIPLE" || result === "HOME_RUN";
  }

  private addInningRuns(liveGame: LiveGame, teamId: EntityId, runs: number): void {
    if (runs === 0) return;
    const line = this.teamBoxScore(liveGame.boxScore, teamId);
    while (line.inningRuns.length < liveGame.inning) line.inningRuns.push(0);
    line.inningRuns[liveGame.inning - 1] = (line.inningRuns[liveGame.inning - 1] ?? 0) + runs;
    line.runs += runs;
  }

  private updateBoxScoreForPlateAppearance(
    liveGame: LiveGame,
    offenseTeamId: EntityId,
    defenseTeamId: EntityId,
    batterId: EntityId,
    pitcherId: EntityId,
    result: PlateAppearanceResult,
    runsScored: number,
    scoredPlayerIds: EntityId[],
    rbiCredit: number,
    outsAdded: number,
    fielderId?: EntityId,
  ): void {
    const batterLine = this.ensureBatterGameLine(liveGame.boxScore, batterId, offenseTeamId);
    const pitcherLine = this.ensurePitcherGameLine(liveGame.boxScore, pitcherId, defenseTeamId);
    batterLine.plateAppearances += 1;
    pitcherLine.battersFaced += 1;
    pitcherLine.outsRecorded += outsAdded;
    pitcherLine.runs += runsScored;
    pitcherLine.earnedRuns += result === "ERROR" ? 0 : runsScored;
    batterLine.runsBattedIn += rbiCredit;
    for (const scoredPlayerId of scoredPlayerIds) {
      this.ensureBatterGameLine(liveGame.boxScore, scoredPlayerId, offenseTeamId).runs += 1;
    }
    if (result === "WALK") {
      batterLine.walks += 1;
      pitcherLine.walks += 1;
      return;
    }
    if (result === "HIT_BY_PITCH") {
      batterLine.hitByPitch += 1;
      return;
    }
    if (result === "SACRIFICE_FLY") {
      batterLine.sacrificeFlies += 1;
      return;
    }
    if (result === "SACRIFICE_BUNT") {
      batterLine.sacrificeHits += 1;
      return;
    }
    batterLine.atBats += 1;
    if (result === "STRIKEOUT") {
      batterLine.strikeouts += 1;
      pitcherLine.strikeouts += 1;
    }
    if (result === "DOUBLE_PLAY") {
      batterLine.groundedIntoDoublePlays += 1;
    }
    if (result === "ERROR") {
      this.teamBoxScore(liveGame.boxScore, defenseTeamId).errors += 1;
      void fielderId;
      return;
    }
    if (!this.isHit(result)) return;

    batterLine.hits += 1;
    pitcherLine.hits += 1;
    this.teamBoxScore(liveGame.boxScore, offenseTeamId).hits += 1;
    if (result === "DOUBLE") batterLine.doubles += 1;
    if (result === "TRIPLE") batterLine.triples += 1;
    if (result === "HOME_RUN") {
      batterLine.homeRuns += 1;
      pitcherLine.homeRuns += 1;
    }
  }

  private ensureBatterGameLine(boxScore: BoxScore, playerId: EntityId, teamId: EntityId): BatterGameLine {
    boxScore.batters[playerId] ??= {
      playerId,
      teamId,
      plateAppearances: 0,
      atBats: 0,
      hits: 0,
      doubles: 0,
      triples: 0,
      homeRuns: 0,
      walks: 0,
      hitByPitch: 0,
      strikeouts: 0,
      sacrificeFlies: 0,
      sacrificeHits: 0,
      groundedIntoDoublePlays: 0,
      stolenBases: 0,
      caughtStealing: 0,
      runs: 0,
      runsBattedIn: 0,
    };
    return boxScore.batters[playerId]!;
  }

  private ensurePitcherGameLine(boxScore: BoxScore, playerId: EntityId, teamId: EntityId): PitcherGameLine {
    boxScore.pitchers[playerId] ??= {
      playerId,
      teamId,
      battersFaced: 0,
      outsRecorded: 0,
      hits: 0,
      runs: 0,
      earnedRuns: 0,
      walks: 0,
      strikeouts: 0,
      homeRuns: 0,
    };
    return boxScore.pitchers[playerId]!;
  }

  private teamBoxScore(boxScore: BoxScore, teamId: EntityId) {
    if (boxScore.homeTeamId === teamId) return boxScore.teams.home;
    if (boxScore.awayTeamId === teamId) return boxScore.teams.away;
    throw new Error(`Team ${teamId} is not part of box score ${boxScore.gameId}`);
  }

  private shouldWalkOff(liveGame: LiveGame): boolean {
    return (
      liveGame.half === "BOTTOM" &&
      liveGame.inning >= this.regulationInningsForGame(liveGame.gameId) &&
      liveGame.homeScore > liveGame.awayScore
    );
  }

  private shouldCompleteAfterHalfInning(liveGame: LiveGame): boolean {
    const regulationInnings = this.regulationInningsForGame(liveGame.gameId);
    if (liveGame.half === "TOP" && liveGame.inning >= regulationInnings && liveGame.homeScore > liveGame.awayScore) {
      return true;
    }
    if (liveGame.half !== "BOTTOM" || liveGame.inning < regulationInnings) return false;
    if (liveGame.homeScore !== liveGame.awayScore) return true;
    if (!this.allowExtraInningsForGame(liveGame.gameId)) return true;
    const maxInnings = this.maxInningsForGame(liveGame.gameId);
    return maxInnings !== undefined && liveGame.inning >= maxInnings && this.requireSeason(this.requireGame(liveGame.gameId).seasonId).allowDraws;
  }

  private completeLiveGame(liveGame: LiveGame, reason: string): void {
    const game = this.requireGame(liveGame.gameId);
    liveGame.outs = Math.min(liveGame.outs, 2);
    liveGame.bases = { first: null, second: null, third: null };
    liveGame.status = "COMPLETED";
    this.finalizeGame(
      game,
      { homeScore: liveGame.homeScore, awayScore: liveGame.awayScore },
      reason,
      liveGame.boxScore,
    );
  }

  private finalizeGame(
    game: GameFixture,
    result: GameResult,
    reason: string,
    boxScore?: BoxScore,
  ): GameFixture {
    game.result = structuredClone(result);
    game.status = "COMPLETED";
    if (boxScore) {
      this.boxScores.set(game.id, structuredClone(boxScore));
      this.accumulateGameStats(game, boxScore);
    }
    this.recalculateStandings(game.seasonId);
    this.record("GAME_COMPLETED", {
      subjectId: game.id,
      teamId: game.homeTeamId,
      reason,
      payload: {
        gameId: game.id,
        seasonId: game.seasonId,
        competitionId: game.competitionId,
        homeTeamId: game.homeTeamId,
        awayTeamId: game.awayTeamId,
        result,
      },
    });
    this.assertInvariants();
    return structuredClone(game);
  }

  private regulationInningsForGame(gameId: EntityId): number {
    const game = this.requireGame(gameId);
    const season = this.requireSeason(game.seasonId);
    const league = this.requireLeague(season.leagueId);
    return league.regulationInnings ?? 9;
  }

  private allowExtraInningsForGame(gameId: EntityId): boolean {
    const game = this.requireGame(gameId);
    const season = this.requireSeason(game.seasonId);
    const league = this.requireLeague(season.leagueId);
    return league.allowExtraInnings ?? !season.allowDraws;
  }

  private maxInningsForGame(gameId: EntityId): number | undefined {
    const game = this.requireGame(gameId);
    const league = this.requireLeague(this.requireSeason(game.seasonId).leagueId);
    return league.maxInnings;
  }

  private weightedPlateAppearance(weights: Partial<Record<PlateAppearanceResult, number>>): PlateAppearanceResult {
    const entries = Object.entries(weights) as [PlateAppearanceResult, number][];
    const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
    let roll = this.rng.next() * total;
    for (const [result, weight] of entries) {
      roll -= weight;
      if (roll <= 0) return result;
    }
    return entries.at(-1)![0];
  }

  private clampWeight(value: number): number {
    return Math.max(0.2, value);
  }

  private isPlateAppearanceResult(result: string): result is PlateAppearanceResult {
    return [
      "STRIKEOUT",
      "WALK",
      "HIT_BY_PITCH",
      "SINGLE",
      "DOUBLE",
      "TRIPLE",
      "HOME_RUN",
      "GROUND_OUT",
      "FLY_OUT",
      "LINE_OUT",
      "DOUBLE_PLAY",
      "SACRIFICE_FLY",
      "SACRIFICE_BUNT",
      "ERROR",
    ].includes(result);
  }

  private progressSeasonStatuses(): void {
    for (const season of this.seasons.values()) {
      const today = this.clock.now();
      if (season.status === "PRESEASON" && today >= season.startDate) {
        season.status = "REGULAR_SEASON";
        this.record("SEASON_STARTED", {
          subjectId: season.id,
          reason: "정규시즌 시작",
          payload: { leagueId: season.leagueId, year: season.year },
        });
      }
      if (season.status === "REGULAR_SEASON" && today > season.regularSeasonEndDate) {
        if (season.hasPostseason && season.postseasonEndDate) {
          season.status = "POSTSEASON";
          this.record("REGULAR_SEASON_ENDED", {
            subjectId: season.id,
            reason: "정규시즌 종료",
            payload: { leagueId: season.leagueId, year: season.year },
          });
          this.record("POSTSEASON_STARTED", {
            subjectId: season.id,
            reason: "포스트시즌 시작",
            payload: { leagueId: season.leagueId, year: season.year },
          });
        } else {
          season.status = "COMPLETED";
          this.record("REGULAR_SEASON_ENDED", {
            subjectId: season.id,
            reason: "정규시즌 종료",
            payload: { leagueId: season.leagueId, year: season.year },
          });
          this.record("SEASON_COMPLETED", {
            subjectId: season.id,
            reason: "시즌 종료",
            payload: { leagueId: season.leagueId, year: season.year },
          });
        }
      }
      if (
        season.status === "POSTSEASON" &&
        season.postseasonEndDate &&
        today > season.postseasonEndDate
      ) {
        season.status = "COMPLETED";
        this.record("SEASON_COMPLETED", {
          subjectId: season.id,
          reason: "시즌 종료",
          payload: { leagueId: season.leagueId, year: season.year },
        });
      }
    }
  }

  private recalculateStandings(seasonId: EntityId): void {
    const season = this.requireSeason(seasonId);
    const records = new Map<EntityId, StandingRecord>();
    for (const game of this.games.values()) {
      if (game.seasonId !== seasonId || game.status !== "COMPLETED" || !game.result) continue;
      const home = this.ensureStandingRecordIn(records, seasonId, game.homeTeamId);
      const away = this.ensureStandingRecordIn(records, seasonId, game.awayTeamId);
      home.gamesPlayed += 1;
      away.gamesPlayed += 1;
      if (game.result.homeScore > game.result.awayScore) {
        home.wins += 1;
        away.losses += 1;
      } else if (game.result.homeScore < game.result.awayScore) {
        away.wins += 1;
        home.losses += 1;
      } else if (season.allowDraws) {
        home.draws += 1;
        away.draws += 1;
      }
    }
    for (const competition of this.competitions.values()) {
      if (competition.seasonId !== seasonId) continue;
      for (const teamId of competition.participatingTeamIds) {
        this.ensureStandingRecordIn(records, seasonId, teamId);
      }
    }
    this.updateStandingPercentages(records);
    this.standings.set(seasonId, records);
  }

  private updateStandingPercentages(records: Map<EntityId, StandingRecord>): void {
    let leaderWins = 0;
    let leaderLosses = 0;
    for (const record of records.values()) {
      record.winningPercentage =
        record.gamesPlayed === 0 ? 0 : (record.wins + record.draws * 0.5) / record.gamesPlayed;
      if (
        record.winningPercentage > (leaderWins + leaderLosses === 0 ? 0 : leaderWins / (leaderWins + leaderLosses)) ||
        (record.winningPercentage === (leaderWins + leaderLosses === 0 ? 0 : leaderWins / (leaderWins + leaderLosses)) &&
          record.wins > leaderWins)
      ) {
        leaderWins = record.wins;
        leaderLosses = record.losses;
      }
    }
    for (const record of records.values()) {
      record.gamesBehind = Math.max(0, (leaderWins - record.wins + record.losses - leaderLosses) / 2);
    }
  }

  private ensureStandingRecord(seasonId: EntityId, teamId: EntityId): StandingRecord {
    const records = this.standings.get(seasonId) ?? new Map<EntityId, StandingRecord>();
    this.standings.set(seasonId, records);
    return this.ensureStandingRecordIn(records, seasonId, teamId);
  }

  private ensureStandingRecordIn(
    records: Map<EntityId, StandingRecord>,
    seasonId: EntityId,
    teamId: EntityId,
  ): StandingRecord {
    const existing = records.get(teamId);
    if (existing) return existing;
    const created: StandingRecord = {
      seasonId,
      teamId,
      wins: 0,
      losses: 0,
      draws: 0,
      gamesPlayed: 0,
      winningPercentage: 0,
      gamesBehind: 0,
    };
    records.set(teamId, created);
    return created;
  }

  private validateSeasonAndScheduleInvariants(issues: string[]): void {
    const seasonKeys = new Set<string>();
    for (const season of this.seasons.values()) {
      if (!this.leagues.has(season.leagueId)) {
        issues.push(`Season ${season.id} has missing league ${season.leagueId}`);
      }
      const key = `${season.leagueId}:${season.year}`;
      if (seasonKeys.has(key)) {
        issues.push(`Duplicate season for league/year ${key}`);
      }
      seasonKeys.add(key);
      if (season.regularSeasonEndDate < season.startDate) {
        issues.push(`Season ${season.id} regularSeasonEndDate is before startDate`);
      }
      if (season.postseasonEndDate && season.postseasonEndDate < season.regularSeasonEndDate) {
        issues.push(`Season ${season.id} postseasonEndDate is before regularSeasonEndDate`);
      }
    }

    for (const competition of this.competitions.values()) {
      const season = this.seasons.get(competition.seasonId);
      if (!season) {
        issues.push(`Competition ${competition.id} has missing season ${competition.seasonId}`);
        continue;
      }
      if (competition.leagueId !== season.leagueId) {
        issues.push(`Competition ${competition.id} leagueId does not match season`);
      }
      if (competition.startDate < season.startDate || competition.endDate > this.seasonFinalDate(season)) {
        issues.push(`Competition ${competition.id} is outside season range`);
      }
      for (const teamId of competition.participatingTeamIds) {
        const team = this.teams.get(teamId);
        if (!team) {
          issues.push(`Competition ${competition.id} has missing team ${teamId}`);
        } else if (team.leagueId !== competition.leagueId) {
          issues.push(`Competition ${competition.id} team ${teamId} is in another league`);
        }
      }
    }

    const scheduleSlots = new Set<string>();
    for (const game of this.games.values()) {
      const season = this.seasons.get(game.seasonId);
      const competition = this.competitions.get(game.competitionId);
      if (!season) {
        issues.push(`Game ${game.id} has missing season ${game.seasonId}`);
        continue;
      }
      if (!competition) {
        issues.push(`Game ${game.id} has missing competition ${game.competitionId}`);
      } else if (competition.seasonId !== game.seasonId) {
        issues.push(`Game ${game.id} competition does not belong to season`);
      }
      if (game.homeTeamId === game.awayTeamId) {
        issues.push(`Game ${game.id} has the same home and away team`);
      }
      for (const teamId of [game.homeTeamId, game.awayTeamId]) {
        const team = this.teams.get(teamId);
        if (!team) {
          issues.push(`Game ${game.id} has missing team ${teamId}`);
        } else if (team.leagueId !== season.leagueId) {
          issues.push(`Game ${game.id} team ${teamId} is in another league`);
        }
        const slot = `${game.scheduledDate}:${teamId}`;
        if (scheduleSlots.has(slot)) {
          issues.push(`Team ${teamId} has multiple games on ${game.scheduledDate}`);
        }
        scheduleSlots.add(slot);
      }
      if (game.scheduledDate < season.startDate || game.scheduledDate > this.seasonFinalDate(season)) {
        issues.push(`Game ${game.id} is outside season range`);
      }
      if (game.status === "COMPLETED") {
        if (!game.result) {
          issues.push(`Completed game ${game.id} is missing result`);
        } else if (!season.allowDraws && game.result.homeScore === game.result.awayScore) {
          issues.push(`Completed game ${game.id} is a draw in a no-draw season`);
        }
      }
    }

    this.validateStandingsConsistency(issues);
  }

  private validateStandingsConsistency(issues: string[]): void {
    for (const seasonId of this.seasons.keys()) {
      const expected = this.computeStandingsSnapshot(seasonId);
      const actual = this.standings.get(seasonId) ?? new Map<EntityId, StandingRecord>();
      for (const [teamId, expectedRecord] of expected) {
        const actualRecord = actual.get(teamId);
        if (!actualRecord) {
          issues.push(`Standings for season ${seasonId} missing team ${teamId}`);
          continue;
        }
        if (
          actualRecord.wins !== expectedRecord.wins ||
          actualRecord.losses !== expectedRecord.losses ||
          actualRecord.draws !== expectedRecord.draws ||
          actualRecord.gamesPlayed !== expectedRecord.gamesPlayed ||
          actualRecord.winningPercentage !== expectedRecord.winningPercentage ||
          actualRecord.gamesBehind !== expectedRecord.gamesBehind
        ) {
          issues.push(`Standings for season ${seasonId} team ${teamId} do not match completed games`);
        }
      }
    }
  }

  private computeStandingsSnapshot(seasonId: EntityId): Map<EntityId, StandingRecord> {
    const records = new Map<EntityId, StandingRecord>();
    for (const competition of this.competitions.values()) {
      if (competition.seasonId !== seasonId) continue;
      for (const teamId of competition.participatingTeamIds) {
        this.ensureStandingRecordIn(records, seasonId, teamId);
      }
    }
    const season = this.requireSeason(seasonId);
    for (const game of this.games.values()) {
      if (game.seasonId !== seasonId || game.status !== "COMPLETED" || !game.result) continue;
      const home = this.ensureStandingRecordIn(records, seasonId, game.homeTeamId);
      const away = this.ensureStandingRecordIn(records, seasonId, game.awayTeamId);
      home.gamesPlayed += 1;
      away.gamesPlayed += 1;
      if (game.result.homeScore > game.result.awayScore) {
        home.wins += 1;
        away.losses += 1;
      } else if (game.result.homeScore < game.result.awayScore) {
        away.wins += 1;
        home.losses += 1;
      } else if (season.allowDraws) {
        home.draws += 1;
        away.draws += 1;
      }
    }
    this.updateStandingPercentages(records);
    return records;
  }

  private progressDailyCareers(options: AdvanceWorldOptions): void {
    const playerProvider = options.playerCareerOptions ?? this.defaultPlayerCareerOptions;
    for (const player of [...this.players.values()]) {
      if (player.status === "RETIRED") continue;
      const careerOptions = playerProvider(player, this);
      if (careerOptions.length === 0) continue;
      const selected = chooseCareerOption(player, this.rng, careerOptions);
      this.applyPlayerCareerOption(player.id, selected);
    }

    const managerProvider = options.managerCareerOptions ?? this.defaultManagerCareerOptions;
    for (const manager of [...this.managers.values()]) {
      if (manager.status === "RETIRED") continue;
      const careerOptions = managerProvider(manager, this);
      if (careerOptions.length === 0) continue;
      const selected = chooseManagerCareerOption(manager, this.rng, careerOptions);
      this.applyManagerCareerOption(manager.id, selected);
    }
  }

  private progressPlayerInjuries(options: AdvanceWorldOptions): void {
    for (const player of this.players.values()) {
      if (player.status === "RETIRED") continue;

      if (player.injury.status === "INJURED" || player.injury.status === "RECOVERING") {
        player.injury.daysRemaining = Math.max(0, player.injury.daysRemaining - 1);
        if (player.injury.daysRemaining === 0) {
          if (player.injury.status === "INJURED") {
            player.injury = {
              status: "RECOVERING",
              severity: player.injury.severity,
              expectedRecoveryDays: player.injury.expectedRecoveryDays,
              daysRemaining: this.recoveryPhaseDays(player.injury.severity),
              startedOn: player.injury.startedOn,
            };
          } else {
            player.injury = { status: "HEALTHY" };
            if (player.rosterStatus === "INJURED") {
              this.updateOpenRosterStatus(player, "REHAB");
            }
            this.record("PLAYER_RECOVERED", {
              subjectId: player.id,
              ...(player.currentTeamId ? { teamId: player.currentTeamId } : {}),
              reason: "부상 회복",
            });
          }
        }
        continue;
      }

      const chance = options.injuryChance?.(player, this) ?? this.defaultDailyInjuryChance(player);
      if (this.rng.chance(this.clampProbability(chance))) {
        this.injurePlayer(player, "훈련 또는 경기 외 활동 중 부상");
      }
    }
  }

  private progressPlayerDevelopment(): void {
    for (const player of this.players.values()) {
      if (player.status === "RETIRED") continue;

      const delta = this.calculateDevelopmentDelta(player);
      if (delta === 0) continue;

      this.applyAbilityDelta(player, delta);
      if (Math.abs(delta) >= 4) {
        this.record(delta > 0 ? "PLAYER_DEVELOPED" : "PLAYER_DECLINED", {
          subjectId: player.id,
          ...(player.currentTeamId ? { teamId: player.currentTeamId } : {}),
          reason: delta > 0 ? "눈에 띄는 성장" : "눈에 띄는 능력 하락",
          payload: {
            delta,
            currentAbility: player.currentAbility,
            potentialAbility: player.potentialAbility,
          },
        });
      }
    }
  }

  private calculateDevelopmentDelta(player: Player): number {
    const profile = player.developmentProfile;
    const injuredPenalty =
      player.injury.status === "INJURED" ? 0.3 : player.injury.status === "RECOVERING" ? 0.65 : 1;
    const consistency = profile.consistency / 100;
    const developmentRate = profile.developmentRate / 100;
    const potentialGap = player.potentialAbility - player.currentAbility;

    if (player.age < profile.peakAgeRange.start) {
      const growthChance = 0.03 * developmentRate * (0.4 + consistency) * injuredPenalty;
      if (potentialGap > 0 && this.rng.chance(growthChance)) {
        const maxDelta = this.rng.chance(0.08 * developmentRate) ? 5 : 2;
        return this.rng.int(1, maxDelta);
      }
      const failureChance = 0.006 * (1 - consistency) * (1 - injuredPenalty + 0.5);
      if (this.rng.chance(failureChance)) return -1;
      return 0;
    }

    if (player.age <= profile.peakAgeRange.end) {
      const breakoutChance = 0.012 * developmentRate * (1.2 - consistency) * injuredPenalty;
      if (potentialGap > 0 && this.rng.chance(breakoutChance)) {
        const maxDelta = this.rng.chance(0.12) ? 6 : 3;
        return this.rng.int(1, maxDelta);
      }
      return 0;
    }

    const lateBloomChance = 0.006 * developmentRate * (1 - consistency) * injuredPenalty;
    if (potentialGap > 8 && player.age <= profile.peakAgeRange.end + 4 && this.rng.chance(lateBloomChance)) {
      return this.rng.int(1, 4);
    }

    const declineStartAge = profile.peakAgeRange.end + Math.floor(profile.durability / 25);
    if (player.age >= declineStartAge) {
      const declineChance = 0.02 * (profile.declineRate / 100) * (1.4 - profile.durability / 100);
      if (this.rng.chance(declineChance)) {
        const severeDecline = player.injury.status !== "HEALTHY" && this.rng.chance(0.2);
        return severeDecline ? -this.rng.int(2, 5) : -1;
      }
    }

    return 0;
  }

  private applyAbilityDelta(player: Player, delta: number): void {
    player.currentAbility = this.clampRating(player.currentAbility + delta);
    player.trueCurrentAbility = this.clampRating(player.trueCurrentAbility + delta);
    const ratingDelta = Math.sign(delta) * Math.min(Math.abs(delta), 3);
    for (const key of ["contact", "power", "plateDiscipline", "speed", "fielding", "arm"] as const) {
      player.battingRatings[key] = this.clampRating(player.battingRatings[key] + ratingDelta);
    }
    for (const key of ["velocity", "control", "movement", "stamina", "pitchQuality"] as const) {
      player.pitchingRatings[key] = this.clampRating(player.pitchingRatings[key] + ratingDelta);
    }
    player.pitchingRatings.repertoire = player.pitchingRatings.repertoire.map((pitch) => ({
      ...pitch,
      quality: this.clampRating(pitch.quality + ratingDelta),
    }));
  }

  private injurePlayer(player: Player, reason: string): void {
    const severityRoll = this.rng.next();
    const severity = severityRoll > 0.92 ? "MAJOR" : severityRoll > 0.65 ? "MODERATE" : "MINOR";
    const expectedRecoveryDays =
      severity === "MAJOR"
        ? this.rng.int(90, 240)
        : severity === "MODERATE"
          ? this.rng.int(21, 75)
          : this.rng.int(5, 20);
    player.injury = {
      status: "INJURED",
      severity,
      expectedRecoveryDays,
      daysRemaining: expectedRecoveryDays,
      startedOn: this.clock.now(),
    };
    if (player.currentRosterAssignmentId) {
      this.updateOpenRosterStatus(player, "INJURED");
    }
    this.record("PLAYER_INJURED", {
      subjectId: player.id,
      ...(player.currentTeamId ? { teamId: player.currentTeamId } : {}),
      reason,
      payload: {
        severity,
        expectedRecoveryDays,
      },
    });
  }

  private refreshPlayerAges(): void {
    for (const player of this.players.values()) {
      player.age = this.calculateAge(player.birthDate);
    }
  }

  private refreshManagerAges(): void {
    for (const manager of this.managers.values()) {
      manager.age = this.calculateAge(manager.birthDate);
    }
  }

  private recoverPlayerGameConditions(): void {
    for (const player of this.players.values()) {
      if (player.status !== "RETIRED") this.recoverDailyFatigue(player);
    }
  }

  private readonly defaultPlayerCareerOptions = (player: Readonly<Player>): CareerOption[] => {
    const options: CareerOption[] = [
      { nextStatus: player.status, weight: 995, reason: "현 상태 유지" },
    ];
    const injuryRisk =
      player.injury.status === "INJURED"
        ? player.injury.severity === "MAJOR"
          ? 4
          : 2
        : player.injury.status === "RECOVERING"
          ? 1
          : 0;
    const teams = [...this.teams.values()];
    const professionalTeams = teams.filter((team) => {
      const league = this.leagues.get(team.leagueId);
      return (
        team.teamType === "CLUB" &&
        (league?.category === "PROFESSIONAL" || league?.category === "INTERNATIONAL")
      );
    });
    const independentTeams = teams.filter((team) => {
      const league = this.leagues.get(team.leagueId);
      return team.teamType === "CLUB" && league?.category === "INDEPENDENT";
    });
    const amateurTeams = teams.filter((team) => {
      const league = this.leagues.get(team.leagueId);
      return team.teamType === "SCHOOL" || league?.category === "AMATEUR";
    });

    if (player.status === "STUDENT") {
      options.push(
        { nextStatus: "RETIRED", weight: 1 + injuryRisk, reason: "학생 선수 생활 중단" },
        ...amateurTeams.map((team) => ({
          nextStatus: "AMATEUR" as const,
          toTeamId: team.id,
          weight: 2,
          reason: "상급 아마추어 팀 진학",
        })),
      );
    }

    if (player.status === "AMATEUR") {
      options.push(
        { nextStatus: "RETIRED", weight: 1 + injuryRisk, reason: "프로 진출 대신 은퇴" },
        { nextStatus: "INDEPENDENT", weight: 1, reason: "사회인 야구로 전환" },
        ...professionalTeams.map((team) => ({
          nextStatus: "PROFESSIONAL" as const,
          toTeamId: team.id,
          weight: 2,
          reason: "프로 계약 제안 수락",
        })),
      );
    }

    if (player.status === "PROFESSIONAL") {
      options.push(
        { nextStatus: "FREE_AGENT", weight: 2 + injuryRisk, reason: "구단 방출" },
        { nextStatus: "RETIRED", weight: 1 + injuryRisk, reason: "현역 은퇴 결정" },
        ...professionalTeams
          .filter((team) => team.id !== player.currentTeamId)
          .map((team) => ({
            nextStatus: "PROFESSIONAL" as const,
            toTeamId: team.id,
            weight: 1,
            reason: "타 구단 이적",
          })),
      );
    }

    if (player.status === "FREE_AGENT") {
      options.push(
        { nextStatus: "RETIRED", weight: 2 + injuryRisk, reason: "새 팀을 찾지 못해 은퇴" },
        ...independentTeams.map((team) => ({
          nextStatus: "INDEPENDENT" as const,
          toTeamId: team.id,
          weight: 2,
          reason: "독립리그 입단",
        })),
        ...professionalTeams.map((team) => ({
          nextStatus: "PROFESSIONAL" as const,
          toTeamId: team.id,
          weight: 1,
          reason: "프로 재입단",
        })),
      );
    }

    if (player.status === "INDEPENDENT") {
      options.push(
        { nextStatus: "RETIRED", weight: 1 + injuryRisk, reason: "독립리그 생활 종료" },
        ...professionalTeams.map((team) => ({
          nextStatus: "PROFESSIONAL" as const,
          toTeamId: team.id,
          weight: 1,
          reason: "프로 재도전 계약",
        })),
      );
    }

    return options;
  };

  private normalizePlayerInput(player: PlayerInput): Player {
    const currentAbility = this.clampRating(player.currentAbility);
    const potentialAbility = this.clampRating(player.potentialAbility);
    const trueCurrentAbility = this.clampRating(player.trueCurrentAbility ?? currentAbility);
    const truePotentialAbility = this.clampRating(player.truePotentialAbility ?? potentialAbility);
    const normalized: Player = {
      ...structuredClone(player),
      age: player.age ?? this.calculateAge(player.birthDate),
      nationality: player.nationality ?? player.nationalityCode,
      bats: player.bats ?? "R",
      throws: player.throws ?? "R",
      secondaryPositions: structuredClone(player.secondaryPositions ?? []),
      trueCurrentAbility,
      truePotentialAbility,
      currentAbility,
      potentialAbility,
      battingRatings: this.normalizeBattingRatings(player.battingRatings, currentAbility),
      pitchingRatings: this.normalizePitchingRatings(player.pitchingRatings, currentAbility),
      developmentProfile: this.normalizeDevelopmentProfile(player.developmentProfile),
      injury: structuredClone(player.injury ?? { status: "HEALTHY" }),
      gameCondition: {
        fatigue: this.clampRating(player.gameCondition?.fatigue ?? 0),
        readiness: this.clampRating(player.gameCondition?.readiness ?? 100),
        availableForGame: player.gameCondition?.availableForGame ?? true,
      },
      rosterAssignments: structuredClone(player.rosterAssignments ?? []),
      contracts: structuredClone(player.contracts ?? []),
      careerEntries: structuredClone(player.careerEntries ?? []),
      ...(player.draftEligibility ? { draftEligibility: structuredClone(player.draftEligibility) } : {}),
      ...(player.contractDemand ? { contractDemand: this.normalizeContractDemand(player.contractDemand) } : {}),
      ...(player.freeAgentStatus ? { freeAgentStatus: structuredClone(player.freeAgentStatus) } : {}),
    };
    normalized.age = this.calculateAge(normalized.birthDate);
    return normalized;
  }

  private normalizeManagerInput(manager: ManagerInput): Manager {
    const currentTeam = manager.currentTeamId ? this.requireTeam(manager.currentTeamId) : undefined;
    const currentOrganizationId = manager.currentOrganizationId ?? currentTeam?.organizationId;
    if (manager.currentTeamId && currentTeam?.organizationId !== currentOrganizationId) {
      throw new Error(`Manager currentOrganizationId does not match currentTeamId: ${manager.id}`);
    }
    if (currentOrganizationId) this.requireOrganization(currentOrganizationId);
    const status = manager.employmentStatus ?? manager.status;
    if (status === "EMPLOYED" && !currentOrganizationId) {
      throw new Error(`Employed manager requires a current organization: ${manager.id}`);
    }
    const stored: Manager = {
      ...structuredClone(manager),
      age: manager.age ?? this.calculateAge(manager.birthDate),
      nationality: manager.nationality ?? manager.nationalityCode,
      employmentStatus: status,
      status,
      ...(currentOrganizationId ? { currentOrganizationId } : {}),
      contracts: structuredClone(manager.contracts ?? []),
      careerStats: structuredClone(manager.careerStats ?? this.emptyManagerCareerStats()),
      ...(manager.boardConfidence
        ? { boardConfidence: structuredClone(manager.boardConfidence) }
        : status === "EMPLOYED" && currentOrganizationId
          ? {
              boardConfidence: {
                managerId: manager.id,
                organizationId: currentOrganizationId,
                ...(manager.currentTeamId ? { teamId: manager.currentTeamId } : {}),
                score: 60,
                updatedOn: this.clock.now(),
                reason: "초기 구단 신뢰도",
              },
            }
          : {}),
      careerEntries: structuredClone(manager.careerEntries ?? []),
    };
    stored.reputation = this.clampRating(stored.reputation);
    stored.age = this.calculateAge(stored.birthDate);
    for (const contract of stored.contracts) {
      this.managerContracts.set(contract.id, contract);
    }
    return stored;
  }

  private emptyManagerCareerStats(): Manager["careerStats"] {
    return {
      games: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winningPercentage: 0,
      championships: 0,
    };
  }

  private normalizeBattingRatings(
    ratings: PlayerInput["battingRatings"],
    fallback: number,
  ): Player["battingRatings"] {
    return {
      contact: this.clampRating(ratings?.contact ?? fallback),
      power: this.clampRating(ratings?.power ?? fallback),
      plateDiscipline: this.clampRating(ratings?.plateDiscipline ?? fallback),
      speed: this.clampRating(ratings?.speed ?? fallback),
      fielding: this.clampRating(ratings?.fielding ?? fallback),
      arm: this.clampRating(ratings?.arm ?? fallback),
    };
  }

  private normalizePitchingRatings(
    ratings: PlayerInput["pitchingRatings"],
    fallback: number,
  ): Player["pitchingRatings"] {
    return {
      velocity: this.clampRating(ratings?.velocity ?? fallback),
      control: this.clampRating(ratings?.control ?? fallback),
      movement: this.clampRating(ratings?.movement ?? fallback),
      stamina: this.clampRating(ratings?.stamina ?? fallback),
      pitchQuality: this.clampRating(ratings?.pitchQuality ?? fallback),
      repertoire: structuredClone(
        ratings?.repertoire?.map((pitch) => ({
          name: pitch.name,
          quality: this.clampRating(pitch.quality),
        })) ?? [],
      ),
    };
  }

  private normalizeDevelopmentProfile(
    profile: PlayerDevelopmentProfile | undefined,
  ): PlayerDevelopmentProfile {
    const peakStart = profile?.peakAgeRange.start ?? 24;
    const peakEnd = profile?.peakAgeRange.end ?? 30;
    return {
      developmentRate: this.clampRating(profile?.developmentRate ?? 50),
      consistency: this.clampRating(profile?.consistency ?? 50),
      durability: this.clampRating(profile?.durability ?? 50),
      peakAgeRange: {
        start: Math.max(12, Math.min(peakStart, peakEnd)),
        end: Math.max(12, Math.max(peakStart, peakEnd)),
      },
      declineRate: this.clampRating(profile?.declineRate ?? 50),
    };
  }

  private readonly defaultManagerCareerOptions = (manager: Readonly<Manager>): ManagerCareerOption[] => {
    const options: ManagerCareerOption[] = [
      { nextStatus: manager.status, weight: 995, reason: "현 상태 유지" },
    ];
    const professionalTeams = [...this.teams.values()].filter((team) => {
      const league = this.leagues.get(team.leagueId);
      return (
        team.teamType === "CLUB" &&
        (league?.category === "PROFESSIONAL" || league?.category === "INTERNATIONAL")
      );
    });

    if (manager.status === "EMPLOYED") {
      options.push(
        { nextStatus: "UNEMPLOYED", weight: 1, reason: "성적 부진으로 경질" },
        { nextStatus: "RETIRED", weight: 1, reason: "감독직 은퇴" },
        ...professionalTeams
          .filter((team) => team.id !== manager.currentTeamId)
          .map((team) => ({
            nextStatus: "EMPLOYED" as const,
            toTeamId: team.id,
            weight: 1,
            reason: "타 구단 감독 제안 수락",
          })),
      );
    }

    if (manager.status === "UNEMPLOYED") {
      options.push(
        { nextStatus: "RETIRED", weight: 1, reason: "구직 종료 후 은퇴" },
        ...professionalTeams.map((team) => ({
          nextStatus: "EMPLOYED" as const,
          toTeamId: team.id,
          weight: 1,
          reason: "감독직 제안 수락",
        })),
      );
    }

    return options;
  };

  private record(
    type: WorldEventType,
    data: Omit<WorldEvent, "id" | "date" | "type">,
    date: ISODate = this.clock.now(),
  ): void {
    this.events.push({
      id: this.ids.nextId("evt"),
      date,
      type,
      ...data,
    });
  }

  private replaceCareerEntry(
    person: Player | Manager,
    personType: PersonType,
    data: Pick<CareerEntry, "role" | "status" | "reason"> &
      Partial<Pick<CareerEntry, "teamId" | "organizationNameSnapshot">>,
  ): void {
    this.endOpenCareerEntry(person, data.reason);
    this.startCareerEntry(person, personType, data);
  }

  private endOpenCareerEntry(person: Player | Manager, reason: string): void {
    for (let index = person.careerEntries.length - 1; index >= 0; index -= 1) {
      const entry = person.careerEntries[index]!;
      if (!entry.endDate) {
        entry.endDate = this.clock.now();
        entry.reason = `${entry.reason}; ended: ${reason}`;
        return;
      }
    }
  }

  private startCareerEntry(
    person: Player | Manager,
    personType: PersonType,
    data: Pick<CareerEntry, "role" | "status" | "reason"> &
      Partial<Pick<CareerEntry, "teamId" | "organizationNameSnapshot">>,
  ): void {
    const team = data.teamId ? this.requireTeam(data.teamId) : undefined;
    person.careerEntries.push({
      id: this.ids.nextId("career"),
      personId: person.id,
      personType,
      ...(data.teamId ? { teamId: data.teamId } : {}),
      organizationNameSnapshot:
        data.organizationNameSnapshot ?? team?.name ?? "Unknown Organization",
      role: data.role,
      status: data.status,
      startDate: this.clock.now(),
      reason: data.reason,
    });
  }

  private startRosterAssignment(
    player: Player,
    team: Team,
    rosterStatus: RosterStatus,
    reason: string,
  ): RosterAssignment {
    const organizationId = this.requireTeamOrganization(team);
    const assignment: RosterAssignment = {
      id: this.ids.nextId("assign"),
      playerId: player.id,
      organizationId,
      teamId: team.id,
      rosterStatus,
      startDate: this.clock.now(),
      reason,
    };
    player.rosterAssignments.push(assignment);
    player.currentRosterAssignmentId = assignment.id;
    return assignment;
  }

  private closeOpenRosterAssignment(player: Player, reason: string): void {
    if (!player.currentRosterAssignmentId) return;
    const assignment = player.rosterAssignments.find(
      (candidate) => candidate.id === player.currentRosterAssignmentId && !candidate.endDate,
    );
    if (assignment) {
      assignment.endDate = this.clock.now();
      assignment.reason = `${assignment.reason}; ended: ${reason}`;
    }
    delete player.currentRosterAssignmentId;
    delete player.rosterStatus;
  }

  private updateOpenRosterStatus(player: Player, rosterStatus: RosterStatus): void {
    if (!player.currentRosterAssignmentId) return;
    const assignment = player.rosterAssignments.find(
      (candidate) => candidate.id === player.currentRosterAssignmentId && !candidate.endDate,
    );
    if (assignment) {
      assignment.rosterStatus = rosterStatus;
      player.rosterStatus = rosterStatus;
    }
  }

  private requireTeamOrganization(team: Team): EntityId {
    if (!team.organizationId) {
      throw new Error(`Team is not linked to an organization: ${team.id}`);
    }
    this.requireOrganization(team.organizationId);
    return team.organizationId;
  }

  private assertRosterStatusCompatibleWithInjury(player: Player, rosterStatus: RosterStatus): void {
    if (player.injury.status === "INJURED" && rosterStatus !== "INJURED") {
      throw new Error(`Injured player must use INJURED roster status: ${player.id}`);
    }
    if (player.injury.status === "RECOVERING" && rosterStatus !== "REHAB" && rosterStatus !== "INJURED") {
      throw new Error(`Recovering player must use REHAB or INJURED roster status: ${player.id}`);
    }
    if (player.injury.status === "HEALTHY" && rosterStatus === "INJURED") {
      throw new Error(`Healthy player cannot use INJURED roster status: ${player.id}`);
    }
  }

  private inferRosterMoveEventType(
    fromTeamId: EntityId | undefined,
    toTeam: Team,
  ): Extract<WorldEventType, "PLAYER_PROMOTED" | "PLAYER_DEMOTED" | "PLAYER_ROSTER_ASSIGNED"> {
    if (!fromTeamId) return "PLAYER_ROSTER_ASSIGNED";
    const fromTeam = this.requireTeam(fromTeamId);
    if ((toTeam.rosterLevel ?? 0) < (fromTeam.rosterLevel ?? 0)) return "PLAYER_PROMOTED";
    if ((toTeam.rosterLevel ?? 0) > (fromTeam.rosterLevel ?? 0)) return "PLAYER_DEMOTED";
    return "PLAYER_ROSTER_ASSIGNED";
  }

  private inferPlayerEventType(fromTeamId: EntityId | undefined, player: Player): WorldEventType {
    if (player.status === "FREE_AGENT") return "PLAYER_RELEASED";
    if (player.status === "RETIRED") return "PLAYER_RETIRED";
    if (fromTeamId && player.currentTeamId) {
      const fromTeam = this.requireTeam(fromTeamId);
      const toTeam = this.requireTeam(player.currentTeamId);
      if (fromTeam.parentTeamId === toTeam.id) return "PLAYER_PROMOTED";
      if (toTeam.parentTeamId === fromTeam.id) return "PLAYER_DEMOTED";
      return "PLAYER_MOVED";
    }
    if (!fromTeamId && player.currentTeamId) return "PLAYER_MOVED";
    return "PLAYER_CAREER_CHANGED";
  }

  private snapshotForPlayerStatus(player: Player): string {
    if (player.currentTeamId) return this.requireTeam(player.currentTeamId).name;
    if (player.status === "FREE_AGENT") return "Free Agent";
    if (player.status === "INDEPENDENT") return "Independent Baseball";
    if (player.status === "AMATEUR") return "Amateur Baseball";
    if (player.status === "STUDENT") return "Student Baseball";
    if (player.status === "RETIRED") return "Retired";
    return "Unknown Organization";
  }

  private validatePersonCareer(
    person: Player | Manager,
    personType: PersonType,
    status: string,
    currentTeamId: EntityId | undefined,
    issues: string[],
  ): void {
    let openEntries = 0;
    for (const entry of person.careerEntries) {
      if (entry.personId !== person.id) {
        issues.push(`Career entry ${entry.id} points to ${entry.personId}, expected ${person.id}`);
      }
      if (entry.personType !== personType) {
        issues.push(`Career entry ${entry.id} has person type ${entry.personType}, expected ${personType}`);
      }
      if (entry.teamId && !this.teams.has(entry.teamId)) {
        issues.push(`Career entry ${entry.id} has missing team ${entry.teamId}`);
      }
      if (!entry.endDate) {
        openEntries += 1;
        if (entry.status !== status) {
          issues.push(`Open career entry ${entry.id} status ${entry.status} does not match ${status}`);
        }
        if (!this.isCareerTeamCompatibleWithCurrentTeam(entry.teamId, currentTeamId, personType)) {
          issues.push(`Open career entry ${entry.id} team ${entry.teamId} does not match ${currentTeamId}`);
        }
      }
    }
    if (openEntries > 1) {
      issues.push(`${personType} ${person.id} has ${openEntries} open career entries`);
    }
  }

  private validatePlayerModel(player: Player, issues: string[]): void {
    const expectedAge = this.calculateAge(player.birthDate);
    if (!Number.isInteger(player.age) || player.age < 0 || player.age !== expectedAge) {
      issues.push(`Player ${player.id} age ${player.age} does not match birth date ${player.birthDate}`);
    }
    if (!player.nationality || !player.nationalityCode) {
      issues.push(`Player ${player.id} must have nationality and nationalityCode`);
    }
    if (!player.primaryPosition) {
      issues.push(`Player ${player.id} must have a primary position`);
    }
    for (const position of player.secondaryPositions) {
      if (!position) issues.push(`Player ${player.id} has an empty secondary position`);
    }
    this.validateRating(player.currentAbility, `Player ${player.id} currentAbility`, issues);
    this.validateRating(player.potentialAbility, `Player ${player.id} potentialAbility`, issues);
    this.validateRating(player.trueCurrentAbility, `Player ${player.id} trueCurrentAbility`, issues);
    this.validateRating(player.truePotentialAbility, `Player ${player.id} truePotentialAbility`, issues);
    if (player.potentialAbility < 1) {
      issues.push(`Player ${player.id} potentialAbility must be at least 1`);
    }
    if (player.truePotentialAbility < 1) {
      issues.push(`Player ${player.id} truePotentialAbility must be at least 1`);
    }
    for (const [key, value] of Object.entries(player.battingRatings)) {
      this.validateRating(value, `Player ${player.id} batting ${key}`, issues);
    }
    for (const [key, value] of Object.entries(player.pitchingRatings)) {
      if (key === "repertoire") continue;
      this.validateRating(value, `Player ${player.id} pitching ${key}`, issues);
    }
    for (const pitch of player.pitchingRatings.repertoire) {
      if (!pitch.name) issues.push(`Player ${player.id} has a pitch without a name`);
      this.validateRating(pitch.quality, `Player ${player.id} pitch ${pitch.name}`, issues);
    }
    this.validateRating(player.gameCondition.fatigue, `Player ${player.id} fatigue`, issues);
    this.validateRating(player.gameCondition.readiness, `Player ${player.id} readiness`, issues);
    if (typeof player.gameCondition.availableForGame !== "boolean") {
      issues.push(`Player ${player.id} availableForGame must be boolean`);
    }

    const profile = player.developmentProfile;
    this.validateRating(profile.developmentRate, `Player ${player.id} developmentRate`, issues);
    this.validateRating(profile.consistency, `Player ${player.id} consistency`, issues);
    this.validateRating(profile.durability, `Player ${player.id} durability`, issues);
    this.validateRating(profile.declineRate, `Player ${player.id} declineRate`, issues);
    if (
      !Number.isInteger(profile.peakAgeRange.start) ||
      !Number.isInteger(profile.peakAgeRange.end) ||
      profile.peakAgeRange.start < 12 ||
      profile.peakAgeRange.end < profile.peakAgeRange.start
    ) {
      issues.push(`Player ${player.id} has invalid peakAgeRange`);
    }

    if (player.heightCm !== undefined && (player.heightCm < 120 || player.heightCm > 230)) {
      issues.push(`Player ${player.id} heightCm is outside expected bounds`);
    }
    if (player.weightKg !== undefined && (player.weightKg < 35 || player.weightKg > 180)) {
      issues.push(`Player ${player.id} weightKg is outside expected bounds`);
    }

    if (player.draftEligibility) {
      if (!this.leagues.has(player.draftEligibility.draftLeagueId)) {
        issues.push(`Player ${player.id} draftEligibility has missing league ${player.draftEligibility.draftLeagueId}`);
      }
      if (!Number.isInteger(player.draftEligibility.draftYear) || player.draftEligibility.draftYear < 1900) {
        issues.push(`Player ${player.id} draftEligibility has invalid draftYear`);
      }
      if (player.draftEligibility.declared && !player.draftEligibility.eligible) {
        issues.push(`Player ${player.id} draftEligibility is declared while not eligible`);
      }
      if (
        !["NOT_ELIGIBLE", "ELIGIBLE", "DECLARED", "DRAFTED", "SIGNED", "UNSIGNED_DRAFTEE", "UNDRAFTED", "WITHDREW"].includes(
          player.draftEligibility.status,
        )
      ) {
        issues.push(`Player ${player.id} draftEligibility has invalid status ${player.draftEligibility.status}`);
      }
    }

    if (player.injury.status === "HEALTHY") return;
    if (!["MINOR", "MODERATE", "MAJOR"].includes(player.injury.severity)) {
      issues.push(`Player ${player.id} has invalid injury severity`);
    }
    if (
      !Number.isInteger(player.injury.expectedRecoveryDays) ||
      player.injury.expectedRecoveryDays <= 0
    ) {
      issues.push(`Player ${player.id} has invalid expected recovery days`);
    }
    if (!Number.isInteger(player.injury.daysRemaining) || player.injury.daysRemaining < 0) {
      issues.push(`Player ${player.id} has invalid injury days remaining`);
    }
    if (player.injury.daysRemaining > player.injury.expectedRecoveryDays) {
      issues.push(`Player ${player.id} injury days remaining exceeds expected recovery days`);
    }
    if (player.injury.startedOn > this.clock.now()) {
      issues.push(`Player ${player.id} injury starts in the future`);
    }
  }

  private isCareerTeamCompatibleWithCurrentTeam(
    careerTeamId: EntityId | undefined,
    currentTeamId: EntityId | undefined,
    personType: PersonType,
  ): boolean {
    if (careerTeamId === currentTeamId) return true;
    if (personType === "MANAGER") return false;
    if (!careerTeamId) return true;
    if (!careerTeamId || !currentTeamId) return false;
    const careerTeam = this.teams.get(careerTeamId);
    const currentTeam = this.teams.get(currentTeamId);
    return !!careerTeam?.organizationId && careerTeam.organizationId === currentTeam?.organizationId;
  }

  private validatePlayerContracts(player: Player, issues: string[]): void {
    let activeContracts = 0;
    for (const contract of player.contracts) {
      if (contract.playerId !== player.id) {
        issues.push(`Contract ${contract.id} points to ${contract.playerId}, expected ${player.id}`);
      }
      if (!this.organizations.has(contract.organizationId)) {
        issues.push(`Contract ${contract.id} has missing organization ${contract.organizationId}`);
      }
      if (contract.endDate < contract.startDate) {
        issues.push(`Contract ${contract.id} endDate is before startDate`);
      }
      if (!Number.isInteger(contract.years) || contract.years <= 0) {
        issues.push(`Contract ${contract.id} has invalid years`);
      }
      if (!Number.isFinite(contract.salary) || contract.salary < 0) {
        issues.push(`Contract ${contract.id} salary must be non-negative`);
      }
      if (contract.signingBonus !== undefined && (!Number.isFinite(contract.signingBonus) || contract.signingBonus < 0)) {
        issues.push(`Contract ${contract.id} signingBonus must be non-negative`);
      }
      if (!contract.currency) {
        issues.push(`Contract ${contract.id} must have currency`);
      }
      if (contract.contractStatus === "ACTIVE") {
        activeContracts += 1;
        if (player.currentOrganizationId !== contract.organizationId) {
          issues.push(`Contract ${contract.id} organization does not match player currentOrganizationId`);
        }
      }
    }
    if (activeContracts > 1) {
      issues.push(`Player ${player.id} has multiple active contracts`);
    }
    if (player.freeAgentStatus) {
      if (player.status !== "FREE_AGENT") issues.push(`Player ${player.id} has freeAgentStatus but is not FREE_AGENT`);
      if (!player.freeAgentStatus.eligible) issues.push(`Player ${player.id} freeAgentStatus is not eligible`);
      if (player.freeAgentStatus.previousOrganizationId && !this.organizations.has(player.freeAgentStatus.previousOrganizationId)) {
        issues.push(`Player ${player.id} freeAgentStatus has missing previous organization`);
      }
    }
  }

  private validatePlayerRosterAssignments(player: Player, issues: string[]): void {
    for (const assignment of player.rosterAssignments) {
      if (assignment.playerId !== player.id) {
        issues.push(`Roster assignment ${assignment.id} points to ${assignment.playerId}, expected ${player.id}`);
      }
      const team = this.teams.get(assignment.teamId);
      if (!team) {
        issues.push(`Roster assignment ${assignment.id} has missing team ${assignment.teamId}`);
      }
      if (!this.organizations.has(assignment.organizationId)) {
        issues.push(`Roster assignment ${assignment.id} has missing organization ${assignment.organizationId}`);
      }
      if (team?.organizationId !== assignment.organizationId) {
        issues.push(`Roster assignment ${assignment.id} team organization does not match assignment organization`);
      }
      if (assignment.endDate && assignment.endDate < assignment.startDate) {
        issues.push(`Roster assignment ${assignment.id} endDate is before startDate`);
      }
    }
  }

  private validateRosterInjuryConsistency(player: Player, issues: string[]): void {
    if (!player.rosterStatus) return;
    if (player.injury.status === "INJURED" && player.rosterStatus !== "INJURED") {
      issues.push(`Player ${player.id} is injured but rosterStatus is ${player.rosterStatus}`);
    }
    if (player.injury.status === "RECOVERING" && player.rosterStatus !== "REHAB" && player.rosterStatus !== "INJURED") {
      issues.push(`Player ${player.id} is recovering but rosterStatus is ${player.rosterStatus}`);
    }
    if (player.injury.status === "HEALTHY" && player.rosterStatus === "INJURED") {
      issues.push(`Player ${player.id} is healthy but rosterStatus is INJURED`);
    }
  }

  private validateManagerModel(manager: Manager, issues: string[]): void {
    const expectedAge = this.calculateAge(manager.birthDate);
    if (!Number.isInteger(manager.age) || manager.age < 0 || manager.age !== expectedAge) {
      issues.push(`Manager ${manager.id} age ${manager.age} does not match birth date ${manager.birthDate}`);
    }
    if (!manager.nationality || !manager.nationalityCode) {
      issues.push(`Manager ${manager.id} must have nationality and nationalityCode`);
    }
    this.validateRating(manager.reputation, `Manager ${manager.id} reputation`, issues);
    const stats = manager.careerStats;
    if (
      stats.games < 0 ||
      stats.wins < 0 ||
      stats.losses < 0 ||
      stats.draws < 0 ||
      stats.championships < 0 ||
      stats.wins + stats.losses + stats.draws > stats.games
    ) {
      issues.push(`Manager ${manager.id} careerStats are inconsistent`);
    }
    if (stats.winningPercentage < 0 || stats.winningPercentage > 1) {
      issues.push(`Manager ${manager.id} winningPercentage must be between 0 and 1`);
    }
    if (manager.boardConfidence) {
      if (manager.boardConfidence.managerId !== manager.id) {
        issues.push(`Manager ${manager.id} boardConfidence managerId mismatch`);
      }
      if (!this.organizations.has(manager.boardConfidence.organizationId)) {
        issues.push(`Manager ${manager.id} boardConfidence has missing organization`);
      }
      if (manager.boardConfidence.teamId && !this.teams.has(manager.boardConfidence.teamId)) {
        issues.push(`Manager ${manager.id} boardConfidence has missing team`);
      }
      this.validateRating(manager.boardConfidence.score, `Manager ${manager.id} boardConfidence`, issues);
      if (manager.status === "EMPLOYED" && manager.boardConfidence.organizationId !== manager.currentOrganizationId) {
        issues.push(`Manager ${manager.id} boardConfidence organization does not match currentOrganizationId`);
      }
    }
    let activeContracts = 0;
    for (const contract of manager.contracts) {
      if (contract.managerId !== manager.id) issues.push(`Manager contract ${contract.id} points to another manager`);
      if (!this.organizations.has(contract.organizationId)) issues.push(`Manager contract ${contract.id} has missing organization`);
      if (contract.teamId && !this.teams.has(contract.teamId)) issues.push(`Manager contract ${contract.id} has missing team`);
      if (contract.teamId) {
        const team = this.teams.get(contract.teamId);
        if (team?.organizationId !== contract.organizationId) {
          issues.push(`Manager contract ${contract.id} team organization mismatch`);
        }
      }
      if (contract.endDate < contract.startDate) issues.push(`Manager contract ${contract.id} endDate is before startDate`);
      if (!Number.isFinite(contract.salary) || contract.salary < 0) issues.push(`Manager contract ${contract.id} salary must be non-negative`);
      if (!contract.currency) issues.push(`Manager contract ${contract.id} must have currency`);
      if (!["ACTIVE", "EXPIRED", "TERMINATED"].includes(contract.status)) {
        issues.push(`Manager contract ${contract.id} has invalid status ${contract.status}`);
      }
      if (contract.status === "ACTIVE") {
        activeContracts += 1;
        if (manager.currentOrganizationId !== contract.organizationId) {
          issues.push(`Manager contract ${contract.id} organization does not match manager currentOrganizationId`);
        }
        if (contract.teamId && manager.currentTeamId !== contract.teamId) {
          issues.push(`Manager contract ${contract.id} team does not match manager currentTeamId`);
        }
      }
    }
    if (activeContracts > 1) issues.push(`Manager ${manager.id} has multiple active contracts`);
  }

  private validateManagerMarketInvariants(issues: string[]): void {
    const teamManagers = new Map<EntityId, EntityId>();
    for (const manager of this.managers.values()) {
      if (manager.status === "EMPLOYED" && manager.currentTeamId) {
        const previous = teamManagers.get(manager.currentTeamId);
        if (previous) issues.push(`Team ${manager.currentTeamId} has multiple active managers: ${previous}, ${manager.id}`);
        teamManagers.set(manager.currentTeamId, manager.id);
      }
    }
    for (const contract of this.managerContracts.values()) {
      const manager = this.managers.get(contract.managerId);
      if (!manager) {
        issues.push(`Manager contract ${contract.id} has missing manager ${contract.managerId}`);
        continue;
      }
      if (!manager.contracts.some((item) => item.id === contract.id)) {
        issues.push(`Manager contract ${contract.id} is not mirrored on manager ${manager.id}`);
      }
      if (!this.organizations.has(contract.organizationId)) issues.push(`Manager contract ${contract.id} has missing organization`);
      if (contract.status === "ACTIVE" && manager.currentOrganizationId !== contract.organizationId) {
        issues.push(`Manager contract ${contract.id} active organization mismatch`);
      }
    }
    for (const vacancy of this.managerJobVacancies.values()) {
      if (!this.organizations.has(vacancy.organizationId)) issues.push(`Manager vacancy ${vacancy.id} has missing organization`);
      const team = this.teams.get(vacancy.teamId);
      if (!team) issues.push(`Manager vacancy ${vacancy.id} has missing team`);
      if (team?.organizationId !== vacancy.organizationId) issues.push(`Manager vacancy ${vacancy.id} team organization mismatch`);
      if (!["OPEN", "FILLED", "CLOSED"].includes(vacancy.status)) issues.push(`Manager vacancy ${vacancy.id} has invalid status`);
      this.validateRating(vacancy.minimumReputation ?? 0, `Manager vacancy ${vacancy.id} minimumReputation`, issues);
      this.validateRating(vacancy.preferredReputation ?? 0, `Manager vacancy ${vacancy.id} preferredReputation`, issues);
      if (vacancy.salaryRange.min < 0 || vacancy.salaryRange.max < vacancy.salaryRange.min) {
        issues.push(`Manager vacancy ${vacancy.id} salaryRange is invalid`);
      }
      if (vacancy.contractYearsRange.min <= 0 || vacancy.contractYearsRange.max < vacancy.contractYearsRange.min) {
        issues.push(`Manager vacancy ${vacancy.id} contractYearsRange is invalid`);
      }
    }
    for (const application of this.managerJobApplications.values()) {
      if (!this.managerJobVacancies.has(application.vacancyId)) issues.push(`Manager application ${application.id} has missing vacancy`);
      if (!this.managers.has(application.managerId)) issues.push(`Manager application ${application.id} has missing manager`);
      if (!this.organizations.has(application.organizationId)) issues.push(`Manager application ${application.id} has missing organization`);
      if (!this.teams.has(application.teamId)) issues.push(`Manager application ${application.id} has missing team`);
      if (!["APPLIED", "OFFERED", "REJECTED", "WITHDRAWN", "ACCEPTED"].includes(application.status)) {
        issues.push(`Manager application ${application.id} has invalid status ${application.status}`);
      }
    }
    for (const offer of this.managerContractOffers.values()) {
      if (!this.managers.has(offer.managerId)) issues.push(`Manager offer ${offer.id} has missing manager`);
      if (!this.organizations.has(offer.organizationId)) issues.push(`Manager offer ${offer.id} has missing organization`);
      if (offer.teamId && !this.teams.has(offer.teamId)) issues.push(`Manager offer ${offer.id} has missing team`);
      if (offer.vacancyId && !this.managerJobVacancies.has(offer.vacancyId)) issues.push(`Manager offer ${offer.id} has missing vacancy`);
      if (!["PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"].includes(offer.status)) {
        issues.push(`Manager offer ${offer.id} has invalid status ${offer.status}`);
      }
      if (offer.endDate < offer.startDate) issues.push(`Manager offer ${offer.id} endDate is before startDate`);
      if (!Number.isFinite(offer.salary) || offer.salary < 0) issues.push(`Manager offer ${offer.id} salary must be non-negative`);
      if (!Number.isInteger(offer.years) || offer.years <= 0) issues.push(`Manager offer ${offer.id} years is invalid`);
    }
  }

  private validateRating(value: number, label: string, issues: string[]): void {
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      issues.push(`${label} must be between 0 and 100`);
    }
  }

  private validateOptionalRating(value: number | undefined, label: string, issues: string[]): void {
    if (value === undefined) return;
    this.validateRating(value, label, issues);
  }

  private calculateAge(birthDate: ISODate): number {
    const current = new Date(`${this.clock.now()}T00:00:00.000Z`);
    const birth = new Date(`${birthDate}T00:00:00.000Z`);
    let age = current.getUTCFullYear() - birth.getUTCFullYear();
    const currentMonth = current.getUTCMonth();
    const birthMonth = birth.getUTCMonth();
    if (
      currentMonth < birthMonth ||
      (currentMonth === birthMonth && current.getUTCDate() < birth.getUTCDate())
    ) {
      age -= 1;
    }
    return age;
  }

  private defaultDailyInjuryChance(player: Player): number {
    const durabilityRisk = (100 - player.developmentProfile.durability) / 100;
    const ageRisk = player.age > player.developmentProfile.peakAgeRange.end ? 1.4 : 1;
    return 0.00025 * durabilityRisk * ageRisk;
  }

  private recoveryPhaseDays(severity: InjurySeverity): number {
    if (severity === "MAJOR") return 14;
    if (severity === "MODERATE") return 7;
    return 3;
  }

  private clampRating(value: number): number {
    return Math.max(0, Math.min(100, Math.round(value)));
  }

  private clampProbability(value: number, min = 0, max = 1): number {
    if (value <= min) return min;
    if (value >= max) return max;
    return value;
  }

  private addDays(date: ISODate, days: number): ISODate {
    const value = new Date(`${date}T00:00:00.000Z`);
    value.setUTCDate(value.getUTCDate() + days);
    return value.toISOString().slice(0, 10) as ISODate;
  }

  private seasonFinalDate(season: Season): ISODate {
    return season.postseasonEndDate ?? season.regularSeasonEndDate;
  }

  private assertNoTeamScheduleConflict(
    scheduledDate: ISODate,
    homeTeamId: EntityId,
    awayTeamId: EntityId,
  ): void {
    for (const game of this.games.values()) {
      if (game.scheduledDate !== scheduledDate) continue;
      if (game.status === "CANCELLED") continue;
      if (
        game.homeTeamId === homeTeamId ||
        game.awayTeamId === homeTeamId ||
        game.homeTeamId === awayTeamId ||
        game.awayTeamId === awayTeamId
      ) {
        throw new Error(`Team already has a game on ${scheduledDate}`);
      }
    }
  }

  private validateGameResult(result: GameResult): void {
    if (
      !Number.isInteger(result.homeScore) ||
      !Number.isInteger(result.awayScore) ||
      result.homeScore < 0 ||
      result.awayScore < 0
    ) {
      throw new Error("Game scores must be non-negative integers");
    }
  }

  private requireCountry(id: EntityId): Country {
    const value = this.countries.get(id);
    if (!value) throw new Error(`Country not found: ${id}`);
    return value;
  }

  private requireLeague(id: EntityId): League {
    const value = this.leagues.get(id);
    if (!value) throw new Error(`League not found: ${id}`);
    return value;
  }

  private requireSeason(id: EntityId): Season {
    const value = this.seasons.get(id);
    if (!value) throw new Error(`Season not found: ${id}`);
    return value;
  }

  private requireCompetition(id: EntityId): Competition {
    const value = this.competitions.get(id);
    if (!value) throw new Error(`Competition not found: ${id}`);
    return value;
  }

  private requireGame(id: EntityId): GameFixture {
    const value = this.games.get(id);
    if (!value) throw new Error(`Game not found: ${id}`);
    return value;
  }

  private requireTeamInLeague(teamId: EntityId, leagueId: EntityId): Team {
    const team = this.requireTeam(teamId);
    if (team.leagueId !== leagueId) {
      throw new Error(`Team ${teamId} does not belong to league ${leagueId}`);
    }
    return team;
  }

  private requireOrganization(id: EntityId): Organization {
    const value = this.organizations.get(id);
    if (!value) throw new Error(`Organization not found: ${id}`);
    return value;
  }

  private requireScout(id: EntityId): Scout {
    const value = this.scouts.get(id);
    if (!value) throw new Error(`Scout not found: ${id}`);
    return value;
  }

  private requireDraft(id: EntityId): Draft {
    const value = this.drafts.get(id);
    if (!value) throw new Error(`Draft not found: ${id}`);
    return value;
  }

  private requireContractOffer(id: EntityId): ContractOffer {
    const value = this.contractOffers.get(id);
    if (!value) throw new Error(`Contract offer not found: ${id}`);
    return value;
  }

  private requireManagerJobVacancy(id: EntityId): ManagerJobVacancy {
    const value = this.managerJobVacancies.get(id);
    if (!value) throw new Error(`Manager job vacancy not found: ${id}`);
    return value;
  }

  private requireManagerJobApplication(id: EntityId): ManagerJobApplication {
    const value = this.managerJobApplications.get(id);
    if (!value) throw new Error(`Manager job application not found: ${id}`);
    return value;
  }

  private requireManagerContractOffer(id: EntityId): ManagerContractOffer {
    const value = this.managerContractOffers.get(id);
    if (!value) throw new Error(`Manager contract offer not found: ${id}`);
    return value;
  }

  private requireTradeProposal(id: EntityId): TradeProposal {
    const value = this.tradeProposals.get(id);
    if (!value) throw new Error(`Trade proposal not found: ${id}`);
    return value;
  }

  private requirePostingRequest(id: EntityId): PostingRequest {
    const value = this.postingRequests.get(id);
    if (!value) throw new Error(`Posting request not found: ${id}`);
    return value;
  }

  private requirePlayer(id: EntityId): Player {
    const value = this.players.get(id);
    if (!value) throw new Error(`Player not found: ${id}`);
    return value;
  }

  private requireManager(id: EntityId): Manager {
    const value = this.managers.get(id);
    if (!value) throw new Error(`Manager not found: ${id}`);
    return value;
  }

  private requireTeam(id: EntityId): Team {
    const value = this.teams.get(id);
    if (!value) throw new Error(`Team not found: ${id}`);
    return value;
  }
}
