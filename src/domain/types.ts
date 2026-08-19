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

export type BaseballPosition =
  | "P"
  | "C"
  | "1B"
  | "2B"
  | "3B"
  | "SS"
  | "LF"
  | "CF"
  | "RF"
  | "DH";

export type BullpenRole =
  | "CLOSER"
  | "SETUP"
  | "MIDDLE_RELIEF"
  | "LONG_RELIEF"
  | "MOP_UP"
  | "FLEXIBLE";

export type TeamType = "CLUB" | "SCHOOL" | "NATIONAL";

export type PersonType = "PLAYER" | "MANAGER";

export type InjuryStatus = "HEALTHY" | "INJURED" | "RECOVERING";

export type InjurySeverity = "MINOR" | "MODERATE" | "MAJOR";

export type RosterStatus = "ACTIVE" | "RESERVE" | "INJURED" | "REHAB" | "INACTIVE";

export type ContractStatus = "ACTIVE" | "EXPIRED" | "TERMINATED";

export type SeasonStatus = "PRESEASON" | "REGULAR_SEASON" | "POSTSEASON" | "COMPLETED";

export type CompetitionType =
  | "REGULAR_SEASON"
  | "POSTSEASON"
  | "TOURNAMENT"
  | "CUP"
  | "INTERNATIONAL";

export type GameStatus = "SCHEDULED" | "COMPLETED" | "POSTPONED" | "CANCELLED";

export type GameHalf = "TOP" | "BOTTOM";

export type LiveGameStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type PlateAppearanceResult =
  | "STRIKEOUT"
  | "WALK"
  | "SINGLE"
  | "DOUBLE"
  | "TRIPLE"
  | "HOME_RUN"
  | "GROUND_OUT"
  | "FLY_OUT"
  | "LINE_OUT";

export type BattingLeaderCategory = "AVG" | "HR" | "RBI" | "H" | "OPS";

export type PitchingLeaderCategory = "ERA" | "W" | "SO" | "SV" | "WHIP";

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
  | "REGULAR_SEASON_ENDED"
  | "POSTSEASON_STARTED"
  | "SEASON_COMPLETED"
  | "GAME_POSTPONED"
  | "GAME_COMPLETED"
  | "GAME_STARTED"
  | "GAME_ROSTER_CREATED"
  | "LINEUP_SET"
  | "STARTING_PITCHER_SET"
  | "PLAYER_MILESTONE"
  | "SEASON_STARTED"
  | "SEASON_ENDED"
  | "GAME_PLAYED";
