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

export type TeamType = "CLUB" | "SCHOOL" | "NATIONAL";

export type PersonType = "PLAYER" | "MANAGER";

export type LeagueCategory =
  | "PROFESSIONAL"
  | "AMATEUR"
  | "INDEPENDENT"
  | "INTERNATIONAL";

export type WorldEventType =
  | "PLAYER_CREATED"
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
