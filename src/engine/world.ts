import type {
  CareerEntry,
  Country,
  League,
  Manager,
  PlayerDevelopmentProfile,
  PlayerInjury,
  Player,
  Team,
  WorldEvent,
} from "../domain/entities.js";
import type {
  EntityId,
  InjurySeverity,
  ISODate,
  PersonType,
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
      | "careerEntries"
    >
  >;
type ManagerInput = Omit<Manager, "careerEntries"> & Partial<Pick<Manager, "careerEntries">>;

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
    const stored = this.normalizePlayerInput(player);
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
      this.validatePlayerModel(player, issues);
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
