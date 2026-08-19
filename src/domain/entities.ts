import type {
  EntityId,
  BaseballPosition,
  BattingSide,
  BattingLeaderCategory,
  BullpenRole,
  ContractStatus,
  ContractOfferDecision,
  ContractOfferStatus,
  CompetitionType,
  DraftDecision,
  DraftEligibilityStatus,
  DraftPickStatus,
  DraftStatus,
  GameActionType,
  GameStatus,
  GameHalf,
  InjurySeverity,
  InjuryStatus,
  ISODate,
  LeagueCategory,
  LiveGameStatus,
  ManagerStatus,
  PersonType,
  PlateAppearanceResult,
  PitchingLeaderCategory,
  PlayerStatus,
  PostingStatus,
  RosterStatus,
  ScoutingRecommendation,
  SeasonStatus,
  TeamType,
  ThrowingHand,
  TradeAiDecision,
  TradeProposalStatus,
  FreeAgentType,
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
  regulationInnings?: number;
  allowExtraInnings?: boolean;
  maxInnings?: number;
  battingQualificationPlateAppearances?: number;
  pitchingQualificationOuts?: number;
  allowSubstitutionReentry?: boolean;
  bullpenFatigueThreshold?: number;
  closerLeadMaxRuns?: number;
  blowoutRunDifferential?: number;
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
  trueCurrentAbility: number;
  truePotentialAbility: number;
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
  draftEligibility?: DraftEligibility;
  contractDemand?: PlayerContractDemand;
  freeAgentStatus?: FreeAgentStatus;
  rosterAssignments: RosterAssignment[];
  contracts: PlayerContract[];
  careerEntries: CareerEntry[];
}

export interface Scout {
  id: EntityId;
  name: string;
  organizationId: EntityId;
  abilityEvaluation: number;
  potentialEvaluation: number;
  regionalKnowledge: number;
  experience: number;
}

export interface EstimatedPotentialRange {
  low: number;
  high: number;
}

export interface ScoutingAttributeEstimates {
  battingRatings: BattingRatings;
  pitchingRatings: PitchingRatings;
}

export interface ScoutingReport {
  id: EntityId;
  scoutId: EntityId;
  playerId: EntityId;
  organizationId: EntityId;
  observedOn: ISODate;
  estimatedCA: number;
  estimatedPARange: EstimatedPotentialRange;
  attributeEstimates: ScoutingAttributeEstimates;
  confidence: number;
  overallGrade: number;
  recommendation: ScoutingRecommendation;
}

export interface ProspectRankingEntry {
  rank: number;
  playerId: EntityId;
  reportId?: EntityId;
  score: number;
  estimatedCA: number;
  estimatedPARange: EstimatedPotentialRange;
  confidence: number;
  age: number;
  primaryPosition: string;
}

export interface DraftEligibility {
  eligible: boolean;
  declared: boolean;
  draftYear: number;
  draftLeagueId: EntityId;
  reason: string;
  status: DraftEligibilityStatus;
  decision?: DraftDecision;
}

export interface Draft {
  id: EntityId;
  leagueId: EntityId;
  seasonId: EntityId;
  year: number;
  rounds: number;
  status: DraftStatus;
  participatingOrganizationIds: EntityId[];
  draftOrder: EntityId[];
  picks: DraftPick[];
}

export interface DraftPick {
  id: EntityId;
  draftId: EntityId;
  round: number;
  overallPick: number;
  organizationId: EntityId;
  playerId?: EntityId;
  selectedAt?: ISODate;
  status: DraftPickStatus;
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
  years: number;
  salary: number;
  currency: string;
  signingBonus?: number;
  noTradeClause?: boolean;
  playerOption?: boolean;
  teamOption?: boolean;
  contractStatus: ContractStatus;
}

export interface PlayerContractDemand {
  desiredSalary: number;
  desiredYears: number;
  minimumSalary: number;
  minimumYears: number;
  preferredRole: string;
  preferredLeagueIds?: EntityId[];
  preferredCountryIds?: EntityId[];
}

export interface ContractOffer {
  id: EntityId;
  playerId: EntityId;
  organizationId: EntityId;
  salary: number;
  currency: string;
  signingBonus?: number;
  startDate: ISODate;
  endDate: ISODate;
  years: number;
  noTradeClause?: boolean;
  playerOption?: boolean;
  teamOption?: boolean;
  preferredRole?: string;
  status: ContractOfferStatus;
  offeredOn: ISODate;
  draftId?: EntityId;
  postingRequestId?: EntityId;
  reason: string;
}

export interface ContractOfferEvaluation {
  offerId: EntityId;
  playerId: EntityId;
  organizationId: EntityId;
  decision: ContractOfferDecision;
  score: number;
  reason: string;
}

export interface FreeAgentStatus {
  eligible: boolean;
  becameFreeAgentOn: ISODate;
  previousOrganizationId?: EntityId;
  type: FreeAgentType;
}

export interface TradeProposal {
  id: EntityId;
  proposerOrganizationId: EntityId;
  targetOrganizationId: EntityId;
  playersFromProposer: EntityId[];
  playersFromTarget: EntityId[];
  cash?: number;
  draftPickIds?: EntityId[];
  status: TradeProposalStatus;
  proposedOn: ISODate;
  reason: string;
  counterProposalId?: EntityId;
}

export interface TradeEvaluation {
  proposalId: EntityId;
  organizationId: EntityId;
  decision: TradeAiDecision;
  score: number;
  reason: string;
  counterProposal?: TradeProposal;
}

export interface PostingRequest {
  id: EntityId;
  playerId: EntityId;
  currentOrganizationId: EntityId;
  sourceLeagueId: EntityId;
  targetLeagueIds: EntityId[];
  requestedOn: ISODate;
  status: PostingStatus;
  compensationFee?: number;
  completedOn?: ISODate;
  reason: string;
}

export interface PlayerMarketValue {
  playerId: EntityId;
  organizationId?: EntityId;
  value: number;
  currency: string;
  estimatedCurrentAbility: number;
  estimatedPotentialAbility: number;
  contractBurden: number;
  yearsRemaining: number;
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

export interface BaseState {
  first: EntityId | null;
  second: EntityId | null;
  third: EntityId | null;
}

export interface LiveGame {
  gameId: EntityId;
  inning: number;
  half: GameHalf;
  outs: number;
  homeScore: number;
  awayScore: number;
  bases: BaseState;
  currentBatterId: EntityId;
  currentPitcherId: EntityId;
  homeLineupIndex: number;
  awayLineupIndex: number;
  status: LiveGameStatus;
  boxScore: BoxScore;
  playByPlay: PlayByPlayEvent[];
  actionHistory: GameActionHistoryEntry[];
  removedPlayerIds: EntityId[];
  currentDefense: Record<string, StartingLineupSlot[]>;
  strategies: Record<string, ManagerGameStrategy>;
}

export interface ManagerGameStrategy {
  offensiveAggression: number;
  stealAggression: number;
  buntAggression: number;
  bullpenAggression: number;
  intentionalWalkAggression: number;
}

export interface GameActionHistoryEntry {
  inning: number;
  half: GameHalf;
  type: GameActionType;
  teamId: EntityId;
  managerId?: EntityId;
  playerOutId?: EntityId;
  playerInId?: EntityId;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface PlayByPlayEvent {
  inning: number;
  half: GameHalf;
  batterId: EntityId;
  pitcherId: EntityId;
  result: PlateAppearanceResult;
  runsScored: number;
  outsAfter: number;
  scoreAfter: GameResult;
}

export interface BoxScore {
  gameId: EntityId;
  homeTeamId: EntityId;
  awayTeamId: EntityId;
  teams: {
    home: TeamBoxScore;
    away: TeamBoxScore;
  };
  batters: Record<string, BatterGameLine>;
  pitchers: Record<string, PitcherGameLine>;
}

export interface TeamBoxScore {
  teamId: EntityId;
  inningRuns: number[];
  runs: number;
  hits: number;
  errors: number;
}

export interface BatterGameLine {
  playerId: EntityId;
  teamId: EntityId;
  plateAppearances: number;
  atBats: number;
  hits: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  walks: number;
  strikeouts: number;
  runs: number;
  runsBattedIn: number;
}

export interface PitcherGameLine {
  playerId: EntityId;
  teamId: EntityId;
  battersFaced: number;
  outsRecorded: number;
  hits: number;
  runs: number;
  earnedRuns: number;
  walks: number;
  strikeouts: number;
  homeRuns: number;
}

export interface PlayerBattingSeasonStats {
  playerId: EntityId;
  seasonId: EntityId;
  teamId?: EntityId;
  organizationId?: EntityId;
  split: "TEAM" | "TOTAL";
  games: number;
  plateAppearances: number;
  atBats: number;
  runs: number;
  hits: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  runsBattedIn: number;
  walks: number;
  strikeouts: number;
  average: number;
  onBasePercentage: number;
  sluggingPercentage: number;
  onBasePlusSlugging: number;
}

export interface PlayerPitchingSeasonStats {
  playerId: EntityId;
  seasonId: EntityId;
  teamId?: EntityId;
  organizationId?: EntityId;
  split: "TEAM" | "TOTAL";
  games: number;
  gamesStarted: number;
  battersFaced: number;
  outsRecorded: number;
  hits: number;
  runs: number;
  earnedRuns: number;
  walks: number;
  strikeouts: number;
  homeRuns: number;
  wins: number;
  losses: number;
  saves: number;
  holds: number;
  inningsPitched: number;
  earnedRunAverage: number;
  walksHitsPerInningPitched: number;
  strikeoutsPerNine: number;
  walksPerNine: number;
}

export interface PlayerBattingGameLog extends BatterGameLine {
  gameId: EntityId;
  seasonId: EntityId;
  date: ISODate;
  opponentTeamId: EntityId;
}

export interface PlayerPitchingGameLog extends PitcherGameLine {
  gameId: EntityId;
  seasonId: EntityId;
  date: ISODate;
  opponentTeamId: EntityId;
  gamesStarted: number;
  wins: number;
  losses: number;
  saves: number;
  holds: number;
  inningsPitched: number;
}

export interface PlayerCareerStats {
  playerId: EntityId;
  leagueId?: EntityId;
  teamId?: EntityId;
  batting: Omit<PlayerBattingSeasonStats, "playerId" | "seasonId" | "teamId" | "organizationId" | "split">;
  pitching: Omit<PlayerPitchingSeasonStats, "playerId" | "seasonId" | "teamId" | "organizationId" | "split">;
}

export interface BattingLeaderboardEntry {
  playerId: EntityId;
  seasonId: EntityId;
  teamId?: EntityId;
  value: number;
  stats: PlayerBattingSeasonStats;
  qualified: boolean;
}

export interface PitchingLeaderboardEntry {
  playerId: EntityId;
  seasonId: EntityId;
  teamId?: EntityId;
  value: number;
  stats: PlayerPitchingSeasonStats;
  qualified: boolean;
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
