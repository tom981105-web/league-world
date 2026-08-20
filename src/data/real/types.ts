import type {
  BaseballPosition,
  BattingSide,
  EntityId,
  ISODate,
  ThrowingHand,
} from "../../domain/types.js";

export interface RealWorldSnapshot {
  id: EntityId;
  label: string;
  seasonYear: number;
  snapshotDate: ISODate;
  playerDataStatus: "EMPTY" | "PARTIAL" | "COMPLETE";
  countries: RawRealCountry[];
  leagues: RawRealLeague[];
  organizations: RawRealOrganization[];
  teams: RawRealTeam[];
  players: RawRealPlayer[];
}

export interface RealWorldSnapshotMetadata {
  snapshotId: EntityId;
  snapshotYear: number;
  snapshotDate: ISODate;
  label: string;
  playerDataStatus: "EMPTY" | "PARTIAL" | "COMPLETE";
}

export interface RawRealCountry {
  id: EntityId;
  code: string;
  displayName: string;
  currencyCode: string;
  baseballRegion: string;
  playableStatus: "PLAYABLE" | "STRUCTURE_READY" | "PLAYER_DB_PENDING" | "UNAVAILABLE";
}

export interface RawRealLeagueSubdivision {
  id: EntityId;
  name: string;
  displayName: string;
  type: "SUBLEAGUE" | "DIVISION";
  parentSubdivisionId?: EntityId;
}

export interface RawRealLeague {
  id: EntityId;
  countryId: EntityId;
  name: string;
  displayName: string;
  shortName: string;
  level: number;
  category: "PROFESSIONAL" | "AMATEUR" | "INDEPENDENT" | "INTERNATIONAL";
  parentLeagueId?: EntityId;
  competitionLevel: string;
  strengthRating: number;
  currencyCode: string;
  subdivisions?: RawRealLeagueSubdivision[];
}

export interface RawRealOrganization {
  id: EntityId;
  countryId: EntityId;
  primaryLeagueId: EntityId;
  name: string;
  displayName: string;
  shortName: string;
  city: string;
  subLeagueId?: EntityId;
  divisionId?: EntityId;
  externalIds?: Record<string, string>;
}

export interface RawRealTeam {
  id: EntityId;
  leagueId: EntityId;
  organizationId: EntityId;
  name: string;
  displayName: string;
  shortName: string;
  city: string;
  levelCode: string;
  levelName: string;
  levelOrder: number;
  parentTeamId?: EntityId;
  affiliateRelation?: string;
  subLeagueId?: EntityId;
  divisionId?: EntityId;
  isTopLevel: boolean;
  externalIds?: Record<string, string>;
}

export interface RawRealPlayer {
  externalIds: Record<string, string>;
  legalName?: string;
  displayName: string;
  nationalityCode: string;
  birthDate?: ISODate;
  bats?: BattingSide;
  throws?: ThrowingHand;
  primaryPosition?: BaseballPosition;
  secondaryPositions?: BaseballPosition[];
  heightCm?: number;
  weightKg?: number;
  jerseyNumber?: string;
  organizationId?: EntityId;
  teamId?: EntityId;
  rosterLevel?: string;
  status?: "PROFESSIONAL" | "FREE_AGENT" | "RETIRED";
}

export interface RealDataValidationReport {
  valid: boolean;
  errors: string[];
  warnings: string[];
  counts: {
    countries: number;
    leagues: number;
    organizations: number;
    teams: number;
    players: number;
  };
  missing: {
    kboPlayers: number;
    mlbPlayers: number;
    npbPlayers: number;
  };
}
