import type {
  CareerEntry,
  Competition,
  Country,
  GameFixture,
  GameResult,
  League,
  Manager,
  Organization,
  PlayerContract,
  PlayerDevelopmentProfile,
  PlayerInjury,
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
  GameStatus,
  InjurySeverity,
  ISODate,
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
    game.result = structuredClone(result);
    game.status = "COMPLETED";
    this.recalculateStandings(game.seasonId);
    this.record("GAME_COMPLETED", {
      subjectId: game.id,
      teamId: game.homeTeamId,
      reason: "경기 결과 입력",
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
