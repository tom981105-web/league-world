import type { RawRealOrganization, RawRealTeam, RealWorldSnapshot } from "./types.js";

const kboOrganizations: RawRealOrganization[] = [
  { id: "real_org_kbo_lg", countryId: "country_kr", primaryLeagueId: "real_league_kbo", name: "LG Twins Organization", displayName: "LG 트윈스", shortName: "LG", city: "서울" },
  { id: "real_org_kbo_hanwha", countryId: "country_kr", primaryLeagueId: "real_league_kbo", name: "Hanwha Eagles Organization", displayName: "한화 이글스", shortName: "한화", city: "대전" },
  { id: "real_org_kbo_samsung", countryId: "country_kr", primaryLeagueId: "real_league_kbo", name: "Samsung Lions Organization", displayName: "삼성 라이온즈", shortName: "삼성", city: "대구" },
  { id: "real_org_kbo_ssg", countryId: "country_kr", primaryLeagueId: "real_league_kbo", name: "SSG Landers Organization", displayName: "SSG 랜더스", shortName: "SSG", city: "인천" },
  { id: "real_org_kbo_kt", countryId: "country_kr", primaryLeagueId: "real_league_kbo", name: "KT Wiz Organization", displayName: "KT 위즈", shortName: "KT", city: "수원" },
  { id: "real_org_kbo_lotte", countryId: "country_kr", primaryLeagueId: "real_league_kbo", name: "Lotte Giants Organization", displayName: "롯데 자이언츠", shortName: "롯데", city: "부산" },
  { id: "real_org_kbo_nc", countryId: "country_kr", primaryLeagueId: "real_league_kbo", name: "NC Dinos Organization", displayName: "NC 다이노스", shortName: "NC", city: "창원" },
  { id: "real_org_kbo_kia", countryId: "country_kr", primaryLeagueId: "real_league_kbo", name: "KIA Tigers Organization", displayName: "KIA 타이거즈", shortName: "KIA", city: "광주" },
  { id: "real_org_kbo_doosan", countryId: "country_kr", primaryLeagueId: "real_league_kbo", name: "Doosan Bears Organization", displayName: "두산 베어스", shortName: "두산", city: "서울" },
  { id: "real_org_kbo_kiwoom", countryId: "country_kr", primaryLeagueId: "real_league_kbo", name: "Kiwoom Heroes Organization", displayName: "키움 히어로즈", shortName: "키움", city: "서울" },
];

const mlbDivisions = {
  alEast: "real_mlb_al_east",
  alCentral: "real_mlb_al_central",
  alWest: "real_mlb_al_west",
  nlEast: "real_mlb_nl_east",
  nlCentral: "real_mlb_nl_central",
  nlWest: "real_mlb_nl_west",
} as const;

const mlbRows: Array<[string, string, string, string, string]> = [
  ["orioles", "Baltimore Orioles", "Baltimore", "real_mlb_al", mlbDivisions.alEast],
  ["red_sox", "Boston Red Sox", "Boston", "real_mlb_al", mlbDivisions.alEast],
  ["yankees", "New York Yankees", "New York", "real_mlb_al", mlbDivisions.alEast],
  ["rays", "Tampa Bay Rays", "Tampa Bay", "real_mlb_al", mlbDivisions.alEast],
  ["blue_jays", "Toronto Blue Jays", "Toronto", "real_mlb_al", mlbDivisions.alEast],
  ["white_sox", "Chicago White Sox", "Chicago", "real_mlb_al", mlbDivisions.alCentral],
  ["guardians", "Cleveland Guardians", "Cleveland", "real_mlb_al", mlbDivisions.alCentral],
  ["tigers", "Detroit Tigers", "Detroit", "real_mlb_al", mlbDivisions.alCentral],
  ["royals", "Kansas City Royals", "Kansas City", "real_mlb_al", mlbDivisions.alCentral],
  ["twins", "Minnesota Twins", "Minnesota", "real_mlb_al", mlbDivisions.alCentral],
  ["astros", "Houston Astros", "Houston", "real_mlb_al", mlbDivisions.alWest],
  ["angels", "Los Angeles Angels", "Anaheim", "real_mlb_al", mlbDivisions.alWest],
  ["athletics", "Athletics", "West Sacramento", "real_mlb_al", mlbDivisions.alWest],
  ["mariners", "Seattle Mariners", "Seattle", "real_mlb_al", mlbDivisions.alWest],
  ["rangers", "Texas Rangers", "Arlington", "real_mlb_al", mlbDivisions.alWest],
  ["braves", "Atlanta Braves", "Atlanta", "real_mlb_nl", mlbDivisions.nlEast],
  ["marlins", "Miami Marlins", "Miami", "real_mlb_nl", mlbDivisions.nlEast],
  ["mets", "New York Mets", "New York", "real_mlb_nl", mlbDivisions.nlEast],
  ["phillies", "Philadelphia Phillies", "Philadelphia", "real_mlb_nl", mlbDivisions.nlEast],
  ["nationals", "Washington Nationals", "Washington", "real_mlb_nl", mlbDivisions.nlEast],
  ["cubs", "Chicago Cubs", "Chicago", "real_mlb_nl", mlbDivisions.nlCentral],
  ["reds", "Cincinnati Reds", "Cincinnati", "real_mlb_nl", mlbDivisions.nlCentral],
  ["brewers", "Milwaukee Brewers", "Milwaukee", "real_mlb_nl", mlbDivisions.nlCentral],
  ["pirates", "Pittsburgh Pirates", "Pittsburgh", "real_mlb_nl", mlbDivisions.nlCentral],
  ["cardinals", "St. Louis Cardinals", "St. Louis", "real_mlb_nl", mlbDivisions.nlCentral],
  ["diamondbacks", "Arizona Diamondbacks", "Phoenix", "real_mlb_nl", mlbDivisions.nlWest],
  ["rockies", "Colorado Rockies", "Denver", "real_mlb_nl", mlbDivisions.nlWest],
  ["dodgers", "Los Angeles Dodgers", "Los Angeles", "real_mlb_nl", mlbDivisions.nlWest],
  ["padres", "San Diego Padres", "San Diego", "real_mlb_nl", mlbDivisions.nlWest],
  ["giants", "San Francisco Giants", "San Francisco", "real_mlb_nl", mlbDivisions.nlWest],
];

const mlbOrganizations: RawRealOrganization[] = mlbRows.map(([key, displayName, city, subLeagueId, divisionId]) => ({
  id: `real_org_mlb_${key}`,
  countryId: key === "blue_jays" ? "country_ca" : "country_us",
  primaryLeagueId: "real_league_mlb",
  name: `${displayName} Organization`,
  displayName,
  shortName: displayName.split(" ").at(-1) ?? displayName,
  city,
  subLeagueId,
  divisionId,
}));

const npbRows: Array<[string, string, string, string, string]> = [
  ["giants", "Yomiuri Giants", "요미우리 자이언츠", "도쿄", "real_npb_central"],
  ["swallows", "Tokyo Yakult Swallows", "도쿄 야쿠르트 스왈로즈", "도쿄", "real_npb_central"],
  ["baystars", "Yokohama DeNA BayStars", "요코하마 DeNA 베이스타스", "요코하마", "real_npb_central"],
  ["dragons", "Chunichi Dragons", "주니치 드래곤스", "나고야", "real_npb_central"],
  ["tigers", "Hanshin Tigers", "한신 타이거스", "니시노미야", "real_npb_central"],
  ["carp", "Hiroshima Toyo Carp", "히로시마 도요 카프", "히로시마", "real_npb_central"],
  ["fighters", "Hokkaido Nippon-Ham Fighters", "홋카이도 닛폰햄 파이터스", "기타히로시마", "real_npb_pacific"],
  ["eagles", "Tohoku Rakuten Golden Eagles", "도호쿠 라쿠텐 골든이글스", "센다이", "real_npb_pacific"],
  ["lions", "Saitama Seibu Lions", "사이타마 세이부 라이온스", "도코로자와", "real_npb_pacific"],
  ["marines", "Chiba Lotte Marines", "지바 롯데 마린스", "지바", "real_npb_pacific"],
  ["buffaloes", "ORIX Buffaloes", "오릭스 버팔로즈", "오사카", "real_npb_pacific"],
  ["hawks", "Fukuoka SoftBank Hawks", "후쿠오카 소프트뱅크 호크스", "후쿠오카", "real_npb_pacific"],
];

const npbOrganizations: RawRealOrganization[] = npbRows.map(([key, name, displayName, city, subLeagueId]) => ({
  id: `real_org_npb_${key}`,
  countryId: "country_jp",
  primaryLeagueId: "real_league_npb",
  name: `${name} Organization`,
  displayName,
  shortName: displayName,
  city,
  subLeagueId,
}));

function teamsForOrganizations(
  organizations: RawRealOrganization[],
  levels: Array<{ leagueId: string; suffix: string; levelCode: string; levelName: string; levelOrder: number; top: boolean }>,
): RawRealTeam[] {
  return organizations.flatMap((org) => {
    const topId = `team_${org.id}_${levels[0]!.suffix}`;
    return levels.map((level, index) => ({
      id: index === 0 ? topId : `team_${org.id}_${level.suffix}`,
      leagueId: level.leagueId,
      organizationId: org.id,
      name: `${org.name} ${level.levelName}`,
      displayName: level.top ? org.displayName : `${org.displayName} ${level.levelName}`,
      shortName: org.shortName,
      city: org.city,
      levelCode: level.levelCode,
      levelName: level.levelName,
      levelOrder: level.levelOrder,
      ...(index > 0 ? { parentTeamId: topId, affiliateRelation: "AFFILIATE" } : {}),
      ...(org.subLeagueId ? { subLeagueId: org.subLeagueId } : {}),
      ...(org.divisionId ? { divisionId: org.divisionId } : {}),
      isTopLevel: level.top,
    }));
  });
}

export const realWorldSnapshot2026: RealWorldSnapshot = {
  id: "real_world_2026",
  label: "2026 현실 데이터",
  seasonYear: 2026,
  snapshotDate: "2026-08-20",
  playerDataStatus: "EMPTY",
  countries: [
    { id: "country_kr", code: "KR", displayName: "대한민국", currencyCode: "KRW", baseballRegion: "EAST_ASIA", playableStatus: "PLAYER_DB_PENDING" },
    { id: "country_us", code: "US", displayName: "미국", currencyCode: "USD", baseballRegion: "NORTH_AMERICA", playableStatus: "STRUCTURE_READY" },
    { id: "country_jp", code: "JP", displayName: "일본", currencyCode: "JPY", baseballRegion: "EAST_ASIA", playableStatus: "STRUCTURE_READY" },
    { id: "country_tw", code: "TW", displayName: "대만", currencyCode: "TWD", baseballRegion: "EAST_ASIA", playableStatus: "STRUCTURE_READY" },
    { id: "country_do", code: "DO", displayName: "도미니카공화국", currencyCode: "DOP", baseballRegion: "CARIBBEAN", playableStatus: "STRUCTURE_READY" },
    { id: "country_ve", code: "VE", displayName: "베네수엘라", currencyCode: "VES", baseballRegion: "LATIN_AMERICA", playableStatus: "STRUCTURE_READY" },
    { id: "country_mx", code: "MX", displayName: "멕시코", currencyCode: "MXN", baseballRegion: "LATIN_AMERICA", playableStatus: "STRUCTURE_READY" },
    { id: "country_ca", code: "CA", displayName: "캐나다", currencyCode: "CAD", baseballRegion: "NORTH_AMERICA", playableStatus: "STRUCTURE_READY" },
    { id: "country_au", code: "AU", displayName: "호주", currencyCode: "AUD", baseballRegion: "OCEANIA", playableStatus: "STRUCTURE_READY" },
  ],
  leagues: [
    { id: "real_league_kbo", countryId: "country_kr", name: "KBO League", displayName: "KBO 리그", shortName: "KBO", level: 1, category: "PROFESSIONAL", competitionLevel: "KBO", strengthRating: 72, currencyCode: "KRW" },
    { id: "real_league_kbo_futures", countryId: "country_kr", name: "KBO Futures League", displayName: "KBO 퓨처스리그", shortName: "Futures", level: 2, category: "PROFESSIONAL", parentLeagueId: "real_league_kbo", competitionLevel: "KBO_FUTURES", strengthRating: 54, currencyCode: "KRW" },
    {
      id: "real_league_mlb",
      countryId: "country_us",
      name: "Major League Baseball",
      displayName: "메이저 리그 베이스볼",
      shortName: "MLB",
      level: 1,
      category: "PROFESSIONAL",
      competitionLevel: "MLB",
      strengthRating: 100,
      currencyCode: "USD",
      subdivisions: [
        { id: "real_mlb_al", name: "American League", displayName: "아메리칸 리그", type: "SUBLEAGUE" },
        { id: "real_mlb_nl", name: "National League", displayName: "내셔널 리그", type: "SUBLEAGUE" },
        { id: mlbDivisions.alEast, name: "AL East", displayName: "AL 동부", type: "DIVISION", parentSubdivisionId: "real_mlb_al" },
        { id: mlbDivisions.alCentral, name: "AL Central", displayName: "AL 중부", type: "DIVISION", parentSubdivisionId: "real_mlb_al" },
        { id: mlbDivisions.alWest, name: "AL West", displayName: "AL 서부", type: "DIVISION", parentSubdivisionId: "real_mlb_al" },
        { id: mlbDivisions.nlEast, name: "NL East", displayName: "NL 동부", type: "DIVISION", parentSubdivisionId: "real_mlb_nl" },
        { id: mlbDivisions.nlCentral, name: "NL Central", displayName: "NL 중부", type: "DIVISION", parentSubdivisionId: "real_mlb_nl" },
        { id: mlbDivisions.nlWest, name: "NL West", displayName: "NL 서부", type: "DIVISION", parentSubdivisionId: "real_mlb_nl" },
      ],
    },
    { id: "real_league_milb_aaa", countryId: "country_us", name: "Triple-A", displayName: "트리플A", shortName: "AAA", level: 2, category: "PROFESSIONAL", parentLeagueId: "real_league_mlb", competitionLevel: "AAA", strengthRating: 74, currencyCode: "USD" },
    { id: "real_league_milb_aa", countryId: "country_us", name: "Double-A", displayName: "더블A", shortName: "AA", level: 3, category: "PROFESSIONAL", parentLeagueId: "real_league_mlb", competitionLevel: "AA", strengthRating: 66, currencyCode: "USD" },
    { id: "real_league_milb_high_a", countryId: "country_us", name: "High-A", displayName: "하이A", shortName: "High-A", level: 4, category: "PROFESSIONAL", parentLeagueId: "real_league_mlb", competitionLevel: "HIGH_A", strengthRating: 58, currencyCode: "USD" },
    { id: "real_league_milb_a", countryId: "country_us", name: "Single-A", displayName: "싱글A", shortName: "A", level: 5, category: "PROFESSIONAL", parentLeagueId: "real_league_mlb", competitionLevel: "A", strengthRating: 52, currencyCode: "USD" },
    { id: "real_league_milb_rookie", countryId: "country_us", name: "Rookie", displayName: "루키", shortName: "Rookie", level: 6, category: "PROFESSIONAL", parentLeagueId: "real_league_mlb", competitionLevel: "ROOKIE", strengthRating: 45, currencyCode: "USD" },
    {
      id: "real_league_npb",
      countryId: "country_jp",
      name: "Nippon Professional Baseball",
      displayName: "일본 프로야구",
      shortName: "NPB",
      level: 1,
      category: "PROFESSIONAL",
      competitionLevel: "NPB",
      strengthRating: 82,
      currencyCode: "JPY",
      subdivisions: [
        { id: "real_npb_central", name: "Central League", displayName: "센트럴 리그", type: "SUBLEAGUE" },
        { id: "real_npb_pacific", name: "Pacific League", displayName: "퍼시픽 리그", type: "SUBLEAGUE" },
      ],
    },
    { id: "real_league_npb_farm", countryId: "country_jp", name: "NPB Farm", displayName: "일본 프로야구 팜", shortName: "Farm", level: 2, category: "PROFESSIONAL", parentLeagueId: "real_league_npb", competitionLevel: "NPB_FARM", strengthRating: 60, currencyCode: "JPY" },
  ],
  organizations: [...kboOrganizations, ...mlbOrganizations, ...npbOrganizations],
  teams: [
    ...teamsForOrganizations(kboOrganizations, [
      { leagueId: "real_league_kbo", suffix: "top", levelCode: "KBO", levelName: "1군", levelOrder: 1, top: true },
      { leagueId: "real_league_kbo_futures", suffix: "futures", levelCode: "FUTURES", levelName: "Futures", levelOrder: 2, top: false },
    ]),
    ...teamsForOrganizations(mlbOrganizations, [
      { leagueId: "real_league_mlb", suffix: "mlb", levelCode: "MLB", levelName: "MLB", levelOrder: 1, top: true },
      { leagueId: "real_league_milb_aaa", suffix: "aaa", levelCode: "AAA", levelName: "AAA", levelOrder: 2, top: false },
      { leagueId: "real_league_milb_aa", suffix: "aa", levelCode: "AA", levelName: "AA", levelOrder: 3, top: false },
      { leagueId: "real_league_milb_high_a", suffix: "high_a", levelCode: "HIGH_A", levelName: "High-A", levelOrder: 4, top: false },
      { leagueId: "real_league_milb_a", suffix: "a", levelCode: "A", levelName: "A", levelOrder: 5, top: false },
      { leagueId: "real_league_milb_rookie", suffix: "rookie", levelCode: "ROOKIE", levelName: "Rookie", levelOrder: 6, top: false },
    ]),
    ...teamsForOrganizations(npbOrganizations, [
      { leagueId: "real_league_npb", suffix: "top", levelCode: "NPB_TOP", levelName: "1군", levelOrder: 1, top: true },
      { leagueId: "real_league_npb_farm", suffix: "farm", levelCode: "NPB_FARM", levelName: "Farm", levelOrder: 2, top: false },
    ]),
  ],
  players: [],
};
