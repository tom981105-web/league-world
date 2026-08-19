import type {
  EntityId,
  BattingSide,
  InjurySeverity,
  InjuryStatus,
  ISODate,
  LeagueCategory,
  ManagerStatus,
  PersonType,
  PlayerStatus,
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
}

export interface Team {
  id: EntityId;
  leagueId: EntityId;
  name: string;
  teamType: TeamType;
  parentTeamId?: EntityId;
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
  currentTeamId?: EntityId;
  careerEntries: CareerEntry[];
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
