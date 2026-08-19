import type {
  EntityId,
  BaseballPosition,
  BattingSide,
  BullpenRole,
  ContractStatus,
  CompetitionType,
  GameStatus,
  InjurySeverity,
  InjuryStatus,
  ISODate,
  LeagueCategory,
  ManagerStatus,
  PersonType,
  PlayerStatus,
  RosterStatus,
  SeasonStatus,
  TeamType,
  ThrowingHand,
  WorldEventType,
} from "./types.js";

export interface Country {
  id: EntityId;
  code: string;
  name: string;
}

export interface League {
  id: EntityId;
  countryId: EntityId;
  name: string;
  level: number;
  category: LeagueCategory;
  allowDraws?: boolean;
  usesDH?: boolean;
  gameRosterRules?: GameRosterRules;
}

export interface Team {
  id: EntityId;
  leagueId: EntityId;
  organizationId?: EntityId;
  name: string;
  teamType: TeamType;
  parentTeamId?: EntityId;
  rosterLevel?: number;
  rosterLevelName?: string;
  isTopLevel?: boolean;
}

export interface Organization {
  id: EntityId;
  name: string;
  countryId: EntityId;
}

export interface Player {
  id: EntityId;
  name: string;
  birthDate: ISODate;
  age: number;
  nationality: string;
  nationalityCode: string;
  bats: BattingSide;
  throws: ThrowingHand;
  primaryPosition: string;
  secondaryPositions: string[];
  heightCm?: number;
  weightKg?: number;
  status: PlayerStatus;
  currentAbility: number;
  potentialAbility: number;
  battingRatings: BattingRatings;
  pitchingRatings: PitchingRatings;
  developmentProfile: PlayerDevelopmentProfile;
  injury: PlayerInjury;
  gameCondition: PlayerGameCondition;
  currentTeamId?: EntityId;
  currentOrganizationId?: EntityId;
  currentRosterAssignmentId?: EntityId;
  rosterStatus?: RosterStatus;
  firstProfessionalDate?: ISODate;
  firstTopLevelAppearanceDate?: ISODate;
  rosterAssignments: RosterAssignment[];
  contracts: PlayerContract[];
  careerEntries: CareerEntry[];
}

export interface RosterAssignment {
  id: EntityId;
  playerId: EntityId;
  organizationId: EntityId;
  teamId: EntityId;
  rosterStatus: RosterStatus;
  startDate: ISODate;
  endDate?: ISODate;
  reason: string;
}

export interface PlayerContract {
  id: EntityId;
  playerId: EntityId;
  organizationId: EntityId;
  startDate: ISODate;
  endDate: ISODate;
  salary: number;
  currency: string;
  contractStatus: ContractStatus;
}

export interface BattingRatings {
  contact: number;
  power: number;
  plateDiscipline: number;
  speed: number;
  fielding: number;
  arm: number;
}

export interface PitchingRatings {
  velocity: number;
  control: number;
  movement: number;
  stamina: number;
  pitchQuality: number;
  repertoire: Pitch[];
}

export interface Pitch {
  name: string;
  quality: number;
}

export interface PlayerDevelopmentProfile {
  developmentRate: number;
  consistency: number;
  durability: number;
  peakAgeRange: {
    start: number;
    end: number;
  };
  declineRate: number;
}

export type PlayerInjury =
  | {
      status: "HEALTHY";
    }
  | {
      status: Exclude<InjuryStatus, "HEALTHY">;
      severity: InjurySeverity;
      expectedRecoveryDays: number;
      daysRemaining: number;
      startedOn: ISODate;
    };

export interface PlayerGameCondition {
  fatigue: number;
  readiness: number;
  availableForGame: boolean;
}

export interface Manager {
  id: EntityId;
  name: string;
  birthDate: ISODate;
  nationalityCode: string;
  status: ManagerStatus;
  reputation: number;
  currentTeamId?: EntityId;
  careerEntries: CareerEntry[];
}

export interface CareerEntry {
  id: EntityId;
  personId: EntityId;
  personType: PersonType;
  teamId?: EntityId;
  organizationNameSnapshot: string;
  role: string;
  status: string;
  startDate: ISODate;
  endDate?: ISODate;
  reason: string;
}

export interface WorldEvent {
  id: EntityId;
  date: ISODate;
  type: WorldEventType;
  actorId?: EntityId;
  subjectId?: EntityId;
  teamId?: EntityId;
  reason?: string;
  payload?: Record<string, unknown>;
}

export interface Season {
  id: EntityId;
  leagueId: EntityId;
  year: number;
  name: string;
  startDate: ISODate;
  regularSeasonEndDate: ISODate;
  postseasonEndDate?: ISODate;
  status: SeasonStatus;
  allowDraws: boolean;
  hasPostseason: boolean;
}

export interface Competition {
  id: EntityId;
  seasonId: EntityId;
  leagueId: EntityId;
  name: string;
  type: CompetitionType;
  startDate: ISODate;
  endDate: ISODate;
  participatingTeamIds: EntityId[];
}

export interface GameFixture {
  id: EntityId;
  seasonId: EntityId;
  competitionId: EntityId;
  homeTeamId: EntityId;
  awayTeamId: EntityId;
  scheduledDate: ISODate;
  status: GameStatus;
  venue?: string;
  result?: GameResult;
}

export interface GameRosterRules {
  maxActivePlayers: number;
  battingOrderSize: number;
  usesDH: boolean;
  maxBenchPlayers?: number;
  maxBullpenPlayers?: number;
}

export interface StartingLineupSlot {
  battingOrder: number;
  playerId: EntityId;
  defensivePosition: BaseballPosition;
  positionFit: number;
  outOfPosition: boolean;
}

export interface GameDayRoster {
  id: EntityId;
  gameId: EntityId;
  teamId: EntityId;
  activePlayerIds: EntityId[];
  startingLineup: StartingLineupSlot[];
  startingPitcherId?: EntityId;
  benchPlayerIds: EntityId[];
  bullpenPlayerIds: EntityId[];
  rules: GameRosterRules;
}

export interface PitchingRotation {
  teamId: EntityId;
  orderedStartingPitcherIds: EntityId[];
  nextStarterIndex: number;
}

export interface BullpenAssignment {
  teamId: EntityId;
  playerId: EntityId;
  roles: BullpenRole[];
}

export interface GameResult {
  homeScore: number;
  awayScore: number;
}

export interface StandingRecord {
  seasonId: EntityId;
  teamId: EntityId;
  wins: number;
  losses: number;
  draws: number;
  gamesPlayed: number;
  winningPercentage: number;
  gamesBehind: number;
}
