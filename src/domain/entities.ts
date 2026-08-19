import type {
  EntityId,
  ISODate,
  LeagueCategory,
  ManagerStatus,
  PersonType,
  PlayerStatus,
  TeamType,
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
  nationalityCode: string;
  primaryPosition: string;
  status: PlayerStatus;
  currentAbility: number;
  potentialAbility: number;
  currentTeamId?: EntityId;
  careerEntries: CareerEntry[];
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
