import type {
  CareerEntry,
  BaseState,
  BoxScore,
  BullpenAssignment,
  BatterGameLine,
  BattingLeaderboardEntry,
  Competition,
  Country,
  GameActionHistoryEntry,
  GameDayRoster,
  GameFixture,
  GameRosterRules,
  GameResult,
  League,
  LiveGame,
  ManagerGameStrategy,
  Manager,
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
  PlayerDevelopmentProfile,
  PlayerInjury,
  StartingLineupSlot,
  Player,
  RosterAssignment,
  Season,
  StandingRecord,
  Team,
  WorldEvent,
} from "../domain/entities.js";
import type {
  CompetitionType,
  EntityId,
  BaseballPosition,
  BattingLeaderCategory,
  BullpenRole,
  GameActionType,
  GameHalf,
  GameStatus,
  InjurySeverity,
  ISODate,
  PlateAppearanceResult,
  PitchingLeaderCategory,
  PersonType,
  RosterStatus,
  WorldEventType,
} from "../domain/types.js";
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
  | "currentOrganizationId"
  | "currentRosterAssignmentId"
  | "rosterStatus"
  | "rosterAssignments"
  | "contracts"
  | "careerEntries"
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
      | "currentOrganizationId"
      | "currentRosterAssignmentId"
      | "rosterStatus"
      | "rosterAssignments"
      | "contracts"
      | "careerEntries"
    >
  >;
type ManagerInput = Omit<Manager, "careerEntries"> & Partial<Pick<Manager, "careerEntries">>;
type PlayerContractInput = Omit<PlayerContract, "id"> & Partial<Pick<PlayerContract, "id">>;
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
  readonly teams = new Map<EntityId, Team>();
  readonly events: WorldEvent[] = [];

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
    const lineup: StartingLineupSlot[] = [];

    for (const position of requiredPositions) {
      const forcedPitcher =
        position === "P" && startingPitcherId
          ? candidates.find((player) => player.id === startingPitcherId && !selected.has(player.id))
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

    const pitcherId =
      startingPitcherId ??
      this.bestLineupCandidate(candidates, new Set<EntityId>(), "P")?.id;
    if (!pitcherId) throw new Error("No available starting pitcher candidate");

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
      return playerId !== pitcherId && this.positionFit(player, "P") >= 60;
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
        [game.homeTeamId]: this.sortedLineup(homeRoster),
        [game.awayTeamId]: this.sortedLineup(awayRoster),
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
    const contactAdvantage = batter.battingRatings.contact + batterCondition * 12 - pitcher.pitchingRatings.velocity * 0.2 - pitcher.pitchingRatings.movement * 0.45 - pitcherCondition * 8;
    const disciplineAdvantage = batter.battingRatings.plateDiscipline + batterCondition * 10 - pitcher.pitchingRatings.control * 0.65 - pitcherCondition * 8;
    const powerAdvantage = batter.battingRatings.power + batterCondition * 8 - pitcher.pitchingRatings.pitchQuality * 0.45 - pitcherCondition * 7;
    const speedBump = batter.battingRatings.speed * 0.03;

    const weights: Record<PlateAppearanceResult, number> = {
      STRIKEOUT: this.clampWeight(18 + pitcher.pitchingRatings.velocity * 0.08 + pitcher.pitchingRatings.pitchQuality * 0.08 - batter.battingRatings.contact * 0.12 - batterCondition * 5),
      WALK: this.clampWeight(7 + disciplineAdvantage * 0.11),
      SINGLE: this.clampWeight(13 + contactAdvantage * 0.12 + speedBump),
      DOUBLE: this.clampWeight(5 + powerAdvantage * 0.06 + contactAdvantage * 0.03),
      TRIPLE: this.clampWeight(1 + speedBump + contactAdvantage * 0.01),
      HOME_RUN: this.clampWeight(3 + powerAdvantage * 0.08),
      GROUND_OUT: this.clampWeight(18 - contactAdvantage * 0.04),
      FLY_OUT: this.clampWeight(16 - powerAdvantage * 0.03),
      LINE_OUT: this.clampWeight(8 + contactAdvantage * 0.02),
    };
    return this.weightedPlateAppearance(weights);
  }

  simulateNextPlateAppearance(gameId: EntityId): PlayByPlayEvent {
    const liveGame = this.requireLiveGame(gameId);
    if (liveGame.status !== "IN_PROGRESS") {
      throw new Error(`Game is not in progress: ${gameId}`);
    }
    this.runManagerAi(gameId, this.defenseTeamId(this.requireGame(gameId), liveGame.half));
    const result = this.simulatePlateAppearance(liveGame.currentBatterId, liveGame.currentPitcherId);
    return this.applyPlateAppearanceResult(gameId, result);
  }

  applyPlateAppearanceResult(gameId: EntityId, result: PlateAppearanceResult): PlayByPlayEvent {
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
    const { runsScored, scoredPlayerIds, rbiCredit } = this.advanceBases(liveGame, result, batterId);
    const outsAdded = this.outsForResult(result);
    liveGame.outs += outsAdded;
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
      result,
      runsScored,
      scoredPlayerIds,
      rbiCredit,
      outsAdded,
    );
    this.applyGameFatigue(batterId, pitcherId, result);
    this.advanceLineupIndex(liveGame, game);

    const event: PlayByPlayEvent = {
      inning: liveGame.inning,
      half: liveGame.half,
      batterId,
      pitcherId,
      result,
      runsScored,
      outsAfter: liveGame.outs,
      scoreAfter: { homeScore: liveGame.homeScore, awayScore: liveGame.awayScore },
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
    const shouldConsider =
      currentPitcher.gameCondition.fatigue >= threshold - strategy.bullpenAggression * 0.2 ||
      (pitcherLine?.battersFaced ?? 0) >= 18;
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
    if (!this.liveGames.has(gameId)) this.startGame(gameId);
    let plateAppearances = 0;
    while (this.requireLiveGame(gameId).status === "IN_PROGRESS") {
      this.simulateNextPlateAppearance(gameId);
      plateAppearances += 1;
      if (plateAppearances > 2000) {
        throw new Error(`Game simulation exceeded safety limit: ${gameId}`);
      }
    }
    return structuredClone(this.requireLiveGame(gameId));
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
    if (manager.currentTeamId) this.requireTeam(manager.currentTeamId);
    const stored: Manager = {
      ...structuredClone(manager),
      careerEntries: structuredClone(manager.careerEntries ?? []),
    };
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
    this.closeOpenRosterAssignment(player, reason);
    delete player.currentTeamId;
    delete player.currentOrganizationId;
    player.status = "FREE_AGENT";
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

    const stored: PlayerContract = {
      ...structuredClone(contract),
      id: contract.id ?? this.ids.nextId("contract"),
    };
    player.contracts.push(stored);
    if (stored.contractStatus === "ACTIVE") {
      if (player.currentOrganizationId && player.currentOrganizationId !== stored.organizationId) {
        throw new Error(`Player already belongs to another organization: ${player.currentOrganizationId}`);
      }
      player.currentOrganizationId = stored.organizationId;
      player.status = "PROFESSIONAL";
      player.firstProfessionalDate ??= stored.startDate;
    }
    this.record("PLAYER_CONTRACT_REGISTERED", {
      subjectId: player.id,
      reason: "계약 등록",
      payload: { ...stored },
    });
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

  hireManager(managerId: EntityId, teamId: EntityId, reason: string): void {
    const manager = this.requireManager(managerId);
    this.requireTeam(teamId);
    const previousTeamId = manager.currentTeamId;
    manager.currentTeamId = teamId;
    manager.status = "EMPLOYED";
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
      payload: { fromTeamId: previousTeamId, toTeamId: teamId },
    });
  }

  fireManager(managerId: EntityId, reason: string): void {
    const manager = this.requireManager(managerId);
    const fromTeamId = manager.currentTeamId;
    delete manager.currentTeamId;
    manager.status = "UNEMPLOYED";
    this.replaceCareerEntry(manager, "MANAGER", {
      role: "MANAGER",
      status: manager.status,
      reason,
      organizationNameSnapshot: "Unemployed",
    });
    this.record("MANAGER_FIRED", {
      subjectId: manager.id,
      reason,
      payload: { fromTeamId },
    });
  }

  retireManager(managerId: EntityId, reason: string): void {
    const manager = this.requireManager(managerId);
    const fromTeamId = manager.currentTeamId;
    delete manager.currentTeamId;
    manager.status = "RETIRED";
    this.replaceCareerEntry(manager, "MANAGER", {
      role: "MANAGER",
      status: manager.status,
      reason,
      organizationNameSnapshot: "Retired",
    });
    this.record("MANAGER_RETIRED", {
      subjectId: manager.id,
      reason,
      payload: { fromTeamId },
    });
  }

  advanceDay(options: AdvanceWorldOptions = {}): ISODate {
    const date = this.clock.advanceDays(1);
    this.progressSeasonStatuses();
    this.refreshPlayerAges();
    this.recoverPlayerGameConditions();
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
    this.validateSeasonAndScheduleInvariants(issues);
    this.validateGameRosterInvariants(issues);
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
      if (manager.currentTeamId && !this.teams.has(manager.currentTeamId)) {
        issues.push(`Manager ${manager.id} has missing team ${manager.currentTeamId}`);
      }
      if (manager.status === "EMPLOYED" && !manager.currentTeamId) {
        issues.push(`Manager ${manager.id} is employed without a current team`);
      }
      if ((manager.status === "UNEMPLOYED" || manager.status === "RETIRED") && manager.currentTeamId) {
        issues.push(`Manager ${manager.id} is ${manager.status} but has a current team`);
      }
    }

    return issues;
  }

  assertInvariants(): void {
    const issues = this.validateInvariants();
    if (issues.length > 0) {
      throw new Error(`World invariant violation: ${issues.join("; ")}`);
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
    liveGame.currentDefense[teamId] = this.sortedLineup(this.requireGameRoster(liveGame.gameId, teamId));
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
    const batterCost = this.isHit(result) ? 2 : result === "WALK" ? 1 : 0.8;
    const pitcherCost = 1.8 + (result === "WALK" ? 0.8 : 0) + (this.isHit(result) ? 0.5 : 0);
    batter.gameCondition.fatigue = this.clampRating(batter.gameCondition.fatigue + batterCost);
    batter.gameCondition.readiness = this.clampRating(batter.gameCondition.readiness - batterCost * 0.25);
    pitcher.gameCondition.fatigue = this.clampRating(pitcher.gameCondition.fatigue + pitcherCost * (1.2 - pitcher.pitchingRatings.stamina / 200));
    pitcher.gameCondition.readiness = this.clampRating(pitcher.gameCondition.readiness - pitcherCost * 0.35);
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
      stats.strikeouts += line.strikeouts;
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
      strikeouts: 0,
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
    stats.onBasePercentage = this.roundRate(
      stats.plateAppearances === 0 ? 0 : (stats.hits + stats.walks) / stats.plateAppearances,
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
      total.strikeouts += stats.strikeouts;
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
      strikeouts: 0,
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
  ): { runsScored: number; scoredPlayerIds: EntityId[]; rbiCredit: number } {
    const oldBases = structuredClone(liveGame.bases);
    const scoredPlayerIds: EntityId[] = [];
    const score = (playerId: EntityId | null): void => {
      if (playerId) scoredPlayerIds.push(playerId);
    };

    if (result === "WALK") {
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
      return { runsScored: scoredPlayerIds.length, scoredPlayerIds, rbiCredit: scoredPlayerIds.length };
    }

    if (result === "SINGLE") {
      score(oldBases.third);
      score(oldBases.second);
      liveGame.bases = { first: batterId, second: oldBases.first, third: null };
      return { runsScored: scoredPlayerIds.length, scoredPlayerIds, rbiCredit: scoredPlayerIds.length };
    }

    if (result === "DOUBLE") {
      score(oldBases.third);
      score(oldBases.second);
      liveGame.bases = { first: null, second: batterId, third: oldBases.first };
      return { runsScored: scoredPlayerIds.length, scoredPlayerIds, rbiCredit: scoredPlayerIds.length };
    }

    if (result === "TRIPLE") {
      score(oldBases.third);
      score(oldBases.second);
      score(oldBases.first);
      liveGame.bases = { first: null, second: null, third: batterId };
      return { runsScored: scoredPlayerIds.length, scoredPlayerIds, rbiCredit: scoredPlayerIds.length };
    }

    if (result === "HOME_RUN") {
      score(oldBases.third);
      score(oldBases.second);
      score(oldBases.first);
      score(batterId);
      liveGame.bases = { first: null, second: null, third: null };
      return { runsScored: scoredPlayerIds.length, scoredPlayerIds, rbiCredit: scoredPlayerIds.length };
    }

    return { runsScored: 0, scoredPlayerIds, rbiCredit: 0 };
  }

  private outsForResult(result: PlateAppearanceResult): number {
    return result === "STRIKEOUT" || result === "GROUND_OUT" || result === "FLY_OUT" || result === "LINE_OUT" ? 1 : 0;
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
  ): void {
    const batterLine = this.ensureBatterGameLine(liveGame.boxScore, batterId, offenseTeamId);
    const pitcherLine = this.ensurePitcherGameLine(liveGame.boxScore, pitcherId, defenseTeamId);
    batterLine.plateAppearances += 1;
    pitcherLine.battersFaced += 1;
    pitcherLine.outsRecorded += outsAdded;
    pitcherLine.runs += runsScored;
    pitcherLine.earnedRuns += runsScored;
    batterLine.runsBattedIn += rbiCredit;
    for (const scoredPlayerId of scoredPlayerIds) {
      this.ensureBatterGameLine(liveGame.boxScore, scoredPlayerId, offenseTeamId).runs += 1;
    }
    if (result === "WALK") {
      batterLine.walks += 1;
      pitcherLine.walks += 1;
      return;
    }
    batterLine.atBats += 1;
    if (result === "STRIKEOUT") {
      batterLine.strikeouts += 1;
      pitcherLine.strikeouts += 1;
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
      strikeouts: 0,
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

  private weightedPlateAppearance(weights: Record<PlateAppearanceResult, number>): PlateAppearanceResult {
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
      "SINGLE",
      "DOUBLE",
      "TRIPLE",
      "HOME_RUN",
      "GROUND_OUT",
      "FLY_OUT",
      "LINE_OUT",
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
    const normalized: Player = {
      ...structuredClone(player),
      age: player.age ?? this.calculateAge(player.birthDate),
      nationality: player.nationality ?? player.nationalityCode,
      bats: player.bats ?? "R",
      throws: player.throws ?? "R",
      secondaryPositions: structuredClone(player.secondaryPositions ?? []),
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
    };
    normalized.age = this.calculateAge(normalized.birthDate);
    return normalized;
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
    if (player.potentialAbility < 1) {
      issues.push(`Player ${player.id} potentialAbility must be at least 1`);
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
    if (!careerTeamId || !currentTeamId) return false;
    const careerTeam = this.teams.get(careerTeamId);
    const currentTeam = this.teams.get(currentTeamId);
    return !!careerTeam?.organizationId && careerTeam.organizationId === currentTeam?.organizationId;
  }

  private validatePlayerContracts(player: Player, issues: string[]): void {
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
      if (!Number.isFinite(contract.salary) || contract.salary < 0) {
        issues.push(`Contract ${contract.id} salary must be non-negative`);
      }
      if (!contract.currency) {
        issues.push(`Contract ${contract.id} must have currency`);
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

  private validateRating(value: number, label: string, issues: string[]): void {
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      issues.push(`${label} must be between 0 and 100`);
    }
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

  private clampProbability(value: number): number {
    if (value <= 0) return 0;
    if (value >= 1) return 1;
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
