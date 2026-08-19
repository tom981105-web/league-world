import type { BullpenRole, EntityId, WorldEvent } from "../index.js";

export type PageKey =
  | "HOME"
  | "MANAGER"
  | "GAMES"
  | "STANDINGS"
  | "ROSTER"
  | "TEAMS"
  | "PLAYERS"
  | "PROSPECTS"
  | "SCOUTING"
  | "DRAFT"
  | "MARKET"
  | "RECORDS"
  | "EVENTS"
  | "SAVES";

export const pageLabels: Record<PageKey, string> = {
  HOME: "홈",
  MANAGER: "감독",
  GAMES: "경기",
  STANDINGS: "순위",
  ROSTER: "선수단",
  TEAMS: "구단",
  PLAYERS: "선수",
  PROSPECTS: "유망주",
  SCOUTING: "스카우팅",
  DRAFT: "드래프트",
  MARKET: "이적시장",
  RECORDS: "기록",
  EVENTS: "이벤트",
  SAVES: "저장",
};

const statusLabels: Record<string, string> = {
  PRESEASON: "시범경기 전",
  REGULAR_SEASON: "정규시즌",
  POSTSEASON: "포스트시즌",
  COMPLETED: "종료",
  SCHEDULED: "예정",
  POSTPONED: "연기",
  CANCELLED: "취소",
  IN_PROGRESS: "진행 중",
  NOT_STARTED: "시작 전",
  ACTIVE: "등록",
  RESERVE: "예비",
  INJURED: "부상",
  REHAB: "재활",
  INACTIVE: "비활성",
  HEALTHY: "정상",
  RECOVERING: "재활 중",
  STUDENT: "학생",
  AMATEUR: "아마추어",
  PROFESSIONAL: "프로",
  FREE_AGENT: "FA",
  INDEPENDENT: "독립리그",
  RETIRED: "은퇴",
  EMPLOYED: "재직",
  UNEMPLOYED: "무직",
  SUSPENDED: "직무 정지",
  PENDING: "대기",
  ACCEPTED: "수락",
  REJECTED: "거절",
  WITHDRAWN: "철회",
  EXPIRED: "만료",
  DECLARED: "참가 선언",
  DRAFTED: "지명",
  UNDRAFTED: "미지명",
  SIGNED: "계약",
  OPEN: "진행 가능",
  APPROVED: "승인",
  FAILED: "실패",
  HOLD: "보류",
  OFFER: "제안",
  OFFERED: "제안됨",
  APPLIED: "지원",
  FILLED: "채용 완료",
  CLOSED: "마감",
  COUNTER: "역제안",
  UNSELECTED: "미지명",
};

const eventLabels: Record<string, string> = {
  PLAYER_CREATED: "선수 생성",
  MANAGER_CREATED: "감독 생성",
  PLAYER_ROSTER_ASSIGNED: "로스터 등록",
  PLAYER_MOVED: "선수 이동",
  PLAYER_RETIRED: "선수 은퇴",
  PLAYER_RELEASED: "선수 방출",
  PLAYER_PROMOTED: "1군 등록",
  PLAYER_DEMOTED: "2군 이동",
  PLAYER_CONTRACT_REGISTERED: "계약 등록",
  PLAYER_SIGNED: "선수 계약",
  PLAYER_BECAME_FREE_AGENT: "FA 전환",
  CONTRACT_OFFERED: "계약 제안",
  CONTRACT_REJECTED: "계약 거절",
  MANAGER_HIRED: "감독 선임",
  MANAGER_MOVED: "감독 이적",
  MANAGER_FIRED: "감독 경질",
  MANAGER_CONTRACT_OFFERED: "감독 계약 제안",
  MANAGER_CONTRACT_RENEWED: "감독 재계약",
  MANAGER_RESIGNED: "감독 사임",
  MANAGER_SACKED: "감독 경질",
  MANAGER_BECAME_UNEMPLOYED: "감독 무직 전환",
  MANAGER_MOVED_TEAM: "감독 이직",
  MANAGER_RETIRED: "감독 은퇴",
  SEASON_STARTED: "시즌 개막",
  REGULAR_SEASON_ENDED: "정규시즌 종료",
  POSTSEASON_STARTED: "포스트시즌 시작",
  SEASON_COMPLETED: "시즌 종료",
  GAME_ROSTER_CREATED: "경기 엔트리 생성",
  LINEUP_SET: "라인업 설정",
  STARTING_PITCHER_SET: "선발투수 설정",
  GAME_STARTED: "경기 시작",
  GAME_COMPLETED: "경기 종료",
  GAME_POSTPONED: "경기 연기",
  DRAFT_DECLARED: "드래프트 참가 선언",
  PLAYER_DRAFTED: "선수 지명",
  PLAYER_UNDRAFTED: "미지명 처리",
  TRADE_PROPOSED: "트레이드 제안",
  PLAYER_TRADED: "선수 트레이드",
  POSTING_REQUESTED: "포스팅 요청",
  POSTING_COMPLETED: "포스팅 완료",
  POSTING_FAILED: "포스팅 실패",
};

const bullpenRoleLabels: Record<BullpenRole, string> = {
  CLOSER: "마무리",
  SETUP: "셋업",
  MIDDLE_RELIEF: "중간계투",
  LONG_RELIEF: "롱릴리프",
  MOP_UP: "추격조",
  FLEXIBLE: "전천후",
};

const actionLabels: Record<string, string> = {
  PITCHING_CHANGE: "투수 교체",
  PINCH_HITTER: "대타",
  PINCH_RUNNER: "대주자",
  DEFENSIVE_SUBSTITUTION: "수비 교체",
  POSITION_CHANGE: "포지션 변경",
};

const plateAppearanceLabels: Record<string, string> = {
  STRIKEOUT: "삼진",
  WALK: "볼넷",
  SINGLE: "안타",
  DOUBLE: "2루타",
  TRIPLE: "3루타",
  HOME_RUN: "홈런",
  GROUND_OUT: "땅볼 아웃",
  FLY_OUT: "뜬공 아웃",
  LINE_OUT: "직선타 아웃",
};

const recommendationLabels: Record<string, string> = {
  DRAFT: "지명 추천",
  FOLLOW: "계속 관찰",
  WATCH: "관찰",
  AVOID: "비추천",
};

const eventCategoryLabels: Record<string, string> = {
  ALL: "전체",
  CONTRACT: "계약",
  MOVE: "이동",
  GAME: "경기",
  SEASON: "시즌",
  DRAFT: "드래프트",
  INJURY: "부상",
  CAREER: "커리어",
};

export function labelStatus(value: string | undefined): string {
  if (!value) return "-";
  return statusLabels[value] ?? value;
}

export function labelEventType(value: string): string {
  return eventLabels[value] ?? value;
}

export function labelBullpenRole(value: BullpenRole): string {
  return bullpenRoleLabels[value] ?? value;
}

export function labelAction(value: string): string {
  return actionLabels[value] ?? value;
}

export function labelPlateAppearance(value: string): string {
  return plateAppearanceLabels[value] ?? value;
}

export function labelRecommendation(value: string): string {
  return recommendationLabels[value] ?? value;
}

export function labelEventCategory(value: string): string {
  return eventCategoryLabels[value] ?? value;
}

export function formatDateKo(date: string | undefined): string {
  if (!date) return "-";
  const [year, month, day] = date.split("-");
  return `${year}. ${Number(month)}. ${Number(day)}.`;
}

export function formatMoney(amount: number, currency = "USD"): string {
  if (currency === "KRW") return `${amount.toLocaleString("ko-KR")}원`;
  if (currency === "USD") return `$${amount.toLocaleString("en-US")}`;
  return `${amount.toLocaleString("ko-KR")} ${currency}`;
}

export function localizeEngineMessage(message: string): string {
  const exact: Record<string, string> = {
    "Seed world ready.": "시드 세계가 준비되었습니다.",
    "Contract offer evaluated.": "계약 제안을 평가했습니다.",
    "Called up a Futures player.": "퓨처스 선수를 1군에 등록했습니다.",
    "Moved a first-team player to Futures.": "1군 선수를 퓨처스로 이동했습니다.",
    "Rotated starting pitchers.": "선발 로테이션을 변경했습니다.",
    "Assigned bullpen role.": "불펜 역할을 지정했습니다.",
    "Applied for manager job.": "감독직에 지원했습니다.",
    "Manager offer created.": "감독 계약 제안이 생성되었습니다.",
    "Manager offer accepted.": "감독 제안을 수락했습니다.",
    "Manager offer rejected.": "감독 제안을 거절했습니다.",
    "Manager resigned.": "감독직에서 사임했습니다.",
    "Manager contract renewed.": "감독 재계약 제안을 만들었습니다.",
    "Auto lineups generated.": "자동 라인업을 생성했습니다.",
    "Game started.": "경기를 시작했습니다.",
    "Simulated next PA.": "다음 타석을 진행했습니다.",
    "Simulated half inning.": "반 이닝을 진행했습니다.",
    "Simulated full game.": "경기 전체를 시뮬레이션했습니다.",
    "Pitcher replaced.": "투수를 교체했습니다.",
    "Pinch hitter used.": "대타를 투입했습니다.",
    "Pinch runner used.": "대주자를 투입했습니다.",
    "Manual draft pick made.": "수동 지명을 완료했습니다.",
    "AI pick made.": "AI 지명을 완료했습니다.",
    "Draft completed.": "드래프트를 완료했습니다.",
    "FA contract offer made.": "FA 계약 제안을 보냈습니다.",
    "Best FA offer accepted.": "가장 적합한 FA 제안을 수락했습니다.",
    "Trade proposed.": "트레이드를 제안했습니다.",
    "Latest trade evaluated.": "최근 트레이드 제안을 평가했습니다.",
    "Posting requested.": "포스팅을 요청했습니다.",
    "Overseas posting offer made.": "해외 계약 제안을 보냈습니다.",
    "Invariant validation completed.": "무결성 검사를 완료했습니다.",
  };
  if (exact[message]) return exact[message];
  const advanced = message.match(/^Advanced (\d+) day\(s\)\.$/);
  if (advanced) return `${advanced[1]}일 진행했습니다.`;
  const reset = message.match(/^World reset with seed (.+)\.$/);
  if (reset) return `시드 ${reset[1]}로 세계를 초기화했습니다.`;
  return message;
}

export function localizeEntityName(name: string | undefined, fallback?: EntityId | null): string {
  if (!name) return fallback ?? "";
  return name
    .replace("Korea Republic", "대한민국")
    .replace("Pacific West", "퍼시픽 웨스트")
    .replace("Japan Archipelago", "일본 아키펠라고")
    .replace("United States", "미국")
    .replace("Taiwan", "대만")
    .replace("Dominican Republic", "도미니카공화국")
    .replace("Venezuela", "베네수엘라")
    .replace("Mexico", "멕시코")
    .replace("Canada", "캐나다")
    .replace("Australia", "호주")
    .replace("Korea Premier League", "한국 프리미어 리그")
    .replace("Korea Futures League", "한국 퓨처스 리그")
    .replace("Pacific Global League", "퍼시픽 글로벌 리그")
    .replace("Japan Frontier League", "일본 프런티어 리그")
    .replace("2027 Korea Premier League", "2027 한국 프리미어 리그")
    .replace("2027 Regular Season", "2027 정규시즌")
    .replace("Seoul Falcons Organization", "서울 팰컨스 조직")
    .replace("Busan Tides Organization", "부산 타이즈 조직")
    .replace("Incheon Waves Organization", "인천 웨이브스 조직")
    .replace("Daejeon Sparks Organization", "대전 스파크스 조직")
    .replace("Suwon Shields Organization", "수원 실즈 조직")
    .replace("Gwangju Suns Organization", "광주 선즈 조직")
    .replace("Daegu Meteors Organization", "대구 메테오스 조직")
    .replace("Ulsan Anchors Organization", "울산 앵커스 조직")
    .replace("Jeonju Royals Organization", "전주 로열스 조직")
    .replace("Changwon Cannons Organization", "창원 캐넌스 조직")
    .replace("Harbor Voyagers Organization", "하버 보이저스 조직")
    .replace("Osaka Suns Organization", "오사카 선즈 조직")
    .replace("Seoul Falcons Futures", "서울 팰컨스 퓨처스")
    .replace("Busan Tides Futures", "부산 타이즈 퓨처스")
    .replace("Incheon Waves Futures", "인천 웨이브스 퓨처스")
    .replace("Daejeon Sparks Futures", "대전 스파크스 퓨처스")
    .replace("Suwon Shields Futures", "수원 실즈 퓨처스")
    .replace("Gwangju Suns Futures", "광주 선즈 퓨처스")
    .replace("Daegu Meteors Futures", "대구 메테오스 퓨처스")
    .replace("Ulsan Anchors Futures", "울산 앵커스 퓨처스")
    .replace("Jeonju Royals Futures", "전주 로열스 퓨처스")
    .replace("Changwon Cannons Futures", "창원 캐넌스 퓨처스")
    .replace("Seoul Falcons", "서울 팰컨스")
    .replace("Busan Tides", "부산 타이즈")
    .replace("Incheon Waves", "인천 웨이브스")
    .replace("Daejeon Sparks", "대전 스파크스")
    .replace("Suwon Shields", "수원 실즈")
    .replace("Gwangju Suns", "광주 선즈")
    .replace("Daegu Meteors", "대구 메테오스")
    .replace("Ulsan Anchors", "울산 앵커스")
    .replace("Jeonju Royals", "전주 로열스")
    .replace("Changwon Cannons", "창원 캐넌스")
    .replace("Harbor Voyagers", "하버 보이저스")
    .replace("Osaka Suns", "오사카 선즈")
    .replace("Seoul Manager", "서울 감독")
    .replace("Busan Manager", "부산 감독")
    .replace("Incheon Manager", "인천 감독")
    .replace("Daejeon Manager", "대전 감독")
    .replace("Suwon Manager", "수원 감독")
    .replace("Gwangju Manager", "광주 감독")
    .replace("Seoul Area Scout", "서울 지역 스카우터")
    .replace("Busan Area Scout", "부산 지역 스카우터")
    .replace("Incheon Area Scout", "인천 지역 스카우터")
    .replace("Daejeon Area Scout", "대전 지역 스카우터")
    .replace("Suwon Area Scout", "수원 지역 스카우터")
    .replace("Gwangju Area Scout", "광주 지역 스카우터")
    .replace("Prospect", "유망주")
    .replace("Free Agent", "FA 선수");
}

export function eventCategory(type: string): string {
  if (type.includes("CONTRACT") || type === "PLAYER_SIGNED") return "CONTRACT";
  if (type.includes("TRADE") || type.includes("MOVED") || type.includes("RELEASED") || type.includes("FREE_AGENT")) return "MOVE";
  if (type.includes("GAME")) return "GAME";
  if (type.includes("SEASON")) return "SEASON";
  if (type.includes("DRAFT")) return "DRAFT";
  if (type.includes("INJURED") || type.includes("RECOVERED")) return "INJURY";
  return "CAREER";
}

export function describeEvent(event: WorldEvent): string {
  if (!event.reason) return labelEventType(event.type);
  return event.reason
    .replace(/^Draft (\d+) round (\d+) pick (\d+)$/, "$1 드래프트 $2라운드 전체 $3번")
    .replace("AI counter proposal", "AI 역제안")
    .replace("PLAYER_CREATED", "선수 생성")
    .replace("MANAGER_CREATED", "감독 생성")
    .replace("Web quick pitching change", "웹 빠른 투수 교체")
    .replace("Web quick pinch hitter", "웹 빠른 대타 투입")
    .replace("Web quick pinch runner", "웹 빠른 대주자 투입");
}
