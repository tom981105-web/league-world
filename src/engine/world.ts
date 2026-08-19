import type {
  CareerEntry,
  Country,
  League,
  Manager,
  Player,
  Team,
  WorldEvent,
} from "../domain/entities.js";
import type { EntityId, ISODate, PersonType, WorldEventType } from "../domain/types.js";
import {
  chooseCareerOption,
  chooseManagerCareerOption,
  type CareerOption,
  type ManagerCareerOption,
} from "./career.js";
import { WorldClock } from "./clock.js";
import { SequentialIdGenerator, type IdGenerator } from "./ids.js";
import type { RandomSource } from "./rng.js";

type PlayerInput = Omit<Player, "careerEntries"> & Partial<Pick<Player, "careerEntries">>;
type ManagerInput = Omit<Manager, "careerEntries"> & Partial<Pick<Manager, "careerEntries">>;

export interface AdvanceWorldOptions {
  playerCareerOptions?: (player: Readonly<Player>, world: LeagueWorld) => CareerOption[];
  managerCareerOptions?: (manager: Readonly<Manager>, world: LeagueWorld) => ManagerCareerOption[];
}

export class LeagueWorld {
  readonly countries = new Map<EntityId, Country>();
  readonly leagues = new Map<EntityId, League>();
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

  addTeam(team: Team): void {
    this.requireLeague(team.leagueId);
    if (team.parentTeamId) this.requireTeam(team.parentTeamId);
    this.teams.set(team.id, structuredClone(team));
  }

  addPlayer(player: PlayerInput): void {
    if (player.currentTeamId) this.requireTeam(player.currentTeamId);
    const stored: Player = {
      ...structuredClone(player),
      careerEntries: structuredClone(player.careerEntries ?? []),
    };
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
    this.requireTeam(toTeamId);
    const fromTeamId = player.currentTeamId;
    player.currentTeamId = toTeamId;
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
      payload: { fromTeamId, toTeamId },
    });
  }

  releasePlayer(playerId: EntityId, reason: string): void {
    const player = this.requirePlayer(playerId);
    const fromTeamId = player.currentTeamId;
    delete player.currentTeamId;
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
      payload: { fromTeamId },
    });
  }

  retirePlayer(playerId: EntityId, reason: string): void {
    const player = this.requirePlayer(playerId);
    const fromTeamId = player.currentTeamId;
    delete player.currentTeamId;
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
      payload: { fromTeamId },
    });
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
      player.currentTeamId = toTeamId;
    } else if (option.nextStatus === "FREE_AGENT") {
      delete player.currentTeamId;
    } else if (option.nextStatus === "INDEPENDENT" || option.nextStatus === "AMATEUR") {
      delete player.currentTeamId;
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
    for (const player of this.players.values()) {
      this.validatePersonCareer(player, "PLAYER", player.status, player.currentTeamId, issues);
      if (player.currentTeamId && !this.teams.has(player.currentTeamId)) {
        issues.push(`Player ${player.id} has missing team ${player.currentTeamId}`);
      }
      if (player.status === "PROFESSIONAL" && !player.currentTeamId) {
        issues.push(`Player ${player.id} is professional without a current team`);
      }
      if ((player.status === "FREE_AGENT" || player.status === "RETIRED") && player.currentTeamId) {
        issues.push(`Player ${player.id} is ${player.status} but has a current team`);
      }
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

  private readonly defaultPlayerCareerOptions = (player: Readonly<Player>): CareerOption[] => {
    const options: CareerOption[] = [
      { nextStatus: player.status, weight: 995, reason: "현 상태 유지" },
    ];
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
        { nextStatus: "RETIRED", weight: 1, reason: "학생 선수 생활 중단" },
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
        { nextStatus: "RETIRED", weight: 1, reason: "프로 진출 대신 은퇴" },
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
        { nextStatus: "FREE_AGENT", weight: 2, reason: "구단 방출" },
        { nextStatus: "RETIRED", weight: 1, reason: "현역 은퇴 결정" },
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
        { nextStatus: "RETIRED", weight: 2, reason: "새 팀을 찾지 못해 은퇴" },
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
        { nextStatus: "RETIRED", weight: 1, reason: "독립리그 생활 종료" },
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
        if (entry.teamId !== currentTeamId) {
          issues.push(`Open career entry ${entry.id} team ${entry.teamId} does not match ${currentTeamId}`);
        }
      }
    }
    if (openEntries > 1) {
      issues.push(`${personType} ${person.id} has ${openEntries} open career entries`);
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
