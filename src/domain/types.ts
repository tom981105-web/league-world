export type EntityId = string;
export type ISODate = `${number}-${number}-${number}`;

export type PlayerStatus =
  | "STUDENT"
  | "AMATEUR"
  | "PROFESSIONAL"
  | "FREE_AGENT"
  | "INDEPENDENT"
  | "RETIRED";

export type ManagerStatus = "EMPLOYED" | "UNEMPLOYED" | "SUSPENDED" | "RETIRED";

export type ManagerRole =
  | "MANAGER"
  | "FARM_MANAGER"
  | "AMATEUR_MANAGER"
  | "NATIONAL_TEAM_MANAGER";

export type ManagerJobVacancyStatus = "OPEN" | "FILLED" | "CLOSED";

export type ManagerApplicationStatus =
  | "APPLIED"
  | "OFFERED"
  | "REJECTED"
  | "WITHDRAWN"
  | "ACCEPTED";

export type ManagerApplicationDecision = "OFFER" | "REJECT" | "HOLD";

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

export type ContractOfferStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";

export type ContractOfferDecision = "ACCEPT" | "REJECT" | "HOLD";

export type FreeAgentType = "RELEASED" | "CONTRACT_EXPIRED" | "UNDRAFTED" | "INTERNATIONAL";

export type TradeProposalStatus = "PROPOSED" | "ACCEPTED" | "REJECTED" | "COUNTERED" | "COMPLETED" | "WITHDRAWN";

export type TradeAiDecision = "ACCEPT" | "REJECT" | "COUNTER";

export type PostingStatus = "REQUESTED" | "APPROVED" | "COMPLETED" | "FAILED";

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
  | "HIT_BY_PITCH"
  | "SINGLE"
  | "DOUBLE"
  | "TRIPLE"
  | "HOME_RUN"
  | "GROUND_OUT"
  | "FLY_OUT"
  | "LINE_OUT"
  | "DOUBLE_PLAY"
  | "SACRIFICE_FLY"
  | "SACRIFICE_BUNT"
  | "ERROR";

export type BaseRunningEventResult =
  | "STOLEN_BASE"
  | "CAUGHT_STEALING";

export type PlayByPlayResult = PlateAppearanceResult | BaseRunningEventResult;

export type BattingLeaderCategory = "AVG" | "HR" | "RBI" | "H" | "OPS";

export type PitchingLeaderCategory = "ERA" | "W" | "SO" | "SV" | "WHIP";

export type ScoutingRecommendation = "WATCH" | "FOLLOW" | "DRAFT" | "AVOID";

export type DraftEligibilityStatus =
  | "NOT_ELIGIBLE"
  | "ELIGIBLE"
  | "DECLARED"
  | "DRAFTED"
  | "SIGNED"
  | "UNSIGNED_DRAFTEE"
  | "UNDRAFTED"
  | "WITHDREW";

export type DraftDecision =
  | "DECLARE"
  | "STAY_SCHOOL"
  | "GO_ABROAD"
  | "INDEPENDENT"
  | "STOP_PLAYING";

export type DraftStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";

export type DraftPickStatus = "UNSELECTED" | "DRAFTED" | "SIGNED" | "UNSIGNED";

export type GameActionType =
  | "PITCHING_CHANGE"
  | "PINCH_HITTER"
  | "PINCH_RUNNER"
  | "DEFENSIVE_SUBSTITUTION"
  | "POSITION_CHANGE";

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
  | "MANAGER_CONTRACT_OFFERED"
  | "MANAGER_CONTRACT_RENEWED"
  | "MANAGER_RESIGNED"
  | "MANAGER_SACKED"
  | "MANAGER_BECAME_UNEMPLOYED"
  | "MANAGER_MOVED_TEAM"
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
  | "DRAFT_DECLARED"
  | "PLAYER_DRAFTED"
  | "PLAYER_UNDRAFTED"
  | "CONTRACT_OFFERED"
  | "PLAYER_SIGNED"
  | "CONTRACT_REJECTED"
  | "TRADE_PROPOSED"
  | "PLAYER_TRADED"
  | "PLAYER_BECAME_FREE_AGENT"
  | "POSTING_REQUESTED"
  | "POSTING_COMPLETED"
  | "POSTING_FAILED"
  | "SEASON_STARTED"
  | "SEASON_ENDED"
  | "GAME_PLAYED";
