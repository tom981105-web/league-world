import type {
  EntityId,
  ISODate,
  LeagueCategory,
  ManagerStatus,
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
}

export interface Manager {
  id: EntityId;
  name: string;
  birthDate: ISODate;
  nationalityCode: string;
  status: ManagerStatus;
  reputation: number;
  currentTeamId?: EntityId;
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
