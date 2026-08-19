export type EntityId = string;
export type ISODate = `${number}-${number}-${number}`;

export type PlayerStatus =
  | "STUDENT"
  | "AMATEUR"
  | "PROFESSIONAL"
  | "FREE_AGENT"
  | "INDEPENDENT"
  | "RETIRED";

export type ManagerStatus = "EMPLOYED" | "UNEMPLOYED" | "RETIRED";

export type BattingSide = "L" | "R" | "S";

export type ThrowingHand = "L" | "R";

export type TeamType = "CLUB" | "SCHOOL" | "NATIONAL";

export type PersonType = "PLAYER" | "MANAGER";

export type InjuryStatus = "HEALTHY" | "INJURED" | "RECOVERING";

export type InjurySeverity = "MINOR" | "MODERATE" | "MAJOR";

export type RosterStatus = "ACTIVE" | "RESERVE" | "INJURED" | "REHAB" | "INACTIVE";

export type ContractStatus = "ACTIVE" | "EXPIRED" | "TERMINATED";

export type LeagueCategory =
  | "PROFESSIONAL"
  | "AMATEUR"
  | "INDEPENDENT"
  | "INTERNATIONAL";

export type WorldEventType =
  | "PLAYER_CREATED"
  | "PLAYER_DEVELOPED"
  | "PLAYER_DECLINED"
  | "PLAYER_INJURED"
  | "PLAYER_RECOVERED"
  | "PLAYER_ROSTER_ASSIGNED"
  | "PLAYER_ROSTER_REMOVED"
  | "PLAYER_CONTRACT_REGISTERED"
  | "PLAYER_CAREER_CHANGED"
  | "PLAYER_MOVED"
  | "PLAYER_RELEASED"
  | "PLAYER_RETIRED"
  | "PLAYER_PROMOTED"
  | "PLAYER_DEMOTED"
  | "MANAGER_CREATED"
  | "MANAGER_HIRED"
  | "MANAGER_MOVED"
  | "MANAGER_FIRED"
  | "MANAGER_RETIRED"
  | "SEASON_STARTED"
  | "SEASON_ENDED"
  | "GAME_PLAYED";
