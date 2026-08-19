import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronsUpDown,
  ClipboardCheck,
  Clock3,
  FileJson,
  Handshake,
  Home,
  ListChecks,
  Play,
  RefreshCcw,
  Search,
  Shield,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";
import { createSeedWorld, type SeedWorldResult } from "./seedWorld.js";
import {
  eventCategory,
  describeEvent,
  formatDateKo,
  formatMoney,
  labelAction,
  labelBullpenRole,
  labelEventCategory,
  labelEventType,
  labelPlateAppearance,
  labelRecommendation,
  labelStatus,
  localizeEngineMessage,
  localizeEntityName,
  pageLabels,
} from "./locale.js";
import type {
  BaseballPosition,
  BullpenRole,
  EntityId,
  GameFixture,
  LeagueWorld,
  Player,
  Team,
  WorldEvent,
} from "../index.js";

type Page =
  | "HOME"
  | "MANAGER"
  | "GAMES"
  | "STANDINGS"
  | "TEAMS"
  | "PLAYERS"
  | "PROSPECTS"
  | "DRAFT"
  | "MARKET"
  | "EVENTS";

const pages: Page[] = ["HOME", "MANAGER", "GAMES", "STANDINGS", "TEAMS", "PLAYERS", "PROSPECTS", "DRAFT", "MARKET", "EVENTS"];
const bullpenRoles: BullpenRole[] = ["CLOSER", "SETUP", "MIDDLE_RELIEF", "LONG_RELIEF", "MOP_UP", "FLEXIBLE"];

export function App() {
  const [seed, setSeed] = useState(20270403);
  const [bundle, setBundle] = useState<SeedWorldResult>(() => createSeedWorld(20270403));
  const [version, setVersion] = useState(0);
  const [page, setPage] = useState<Page>("HOME");
  const [selectedGameId, setSelectedGameId] = useState<EntityId | undefined>(() => [...bundle.world.games.keys()][0]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<EntityId | undefined>();
  const [query, setQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("ALL");
  const [message, setMessage] = useState("시드 세계가 준비되었습니다.");
  const [offerEvaluations, setOfferEvaluations] = useState<Record<string, string>>({});

  const world = bundle.world;
  void version;

  const data = useMemo(() => makeViewModel(world, bundle), [world, bundle, version]);
  const selectedGame = selectedGameId ? world.games.get(selectedGameId) : data.games[0];
  const selectedPlayer = selectedPlayerId ? world.players.get(selectedPlayerId) : undefined;

  const mutate = (label: string, action: () => void) => {
    try {
      action();
      setVersion((value) => value + 1);
      setMessage(localizeEngineMessage(label));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    }
  };

  const resetWorld = () => {
    const next = createSeedWorld(seed);
    setBundle(next);
    setSelectedGameId([...next.world.games.keys()][0]);
    setSelectedPlayerId(undefined);
    setOfferEvaluations({});
    setVersion((value) => value + 1);
    setMessage(`시드 ${seed}로 세계를 초기화했습니다.`);
  };

  const evaluateOfferForUi = (offerId: EntityId) => {
    try {
      const evaluation = world.evaluateContractOffer(offerId);
      setOfferEvaluations((current) => ({
        ...current,
        [offerId]: `${labelStatus(evaluation.decision)} (${evaluation.score.toFixed(1)})`,
      }));
      setMessage("계약 제안을 평가했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    }
  };

  const advance = (days: number) => mutate(`${days}일 진행했습니다.`, () => {
    world.advanceDays(days, { playerCareerOptions: () => [], managerCareerOptions: () => [] });
  });

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">LW</div>
          <div>
            <strong>LEAGUE</strong>
            <span>웹 v0.1</span>
          </div>
        </div>
        <nav>
          {pages.map((item) => (
            <button key={item} className={page === item ? "active" : ""} onClick={() => setPage(item)}>
              {navIcon(item)}
              <span>{pageLabels[item]}</span>
            </button>
          ))}
        </nav>
        <DebugPanel
          bundle={bundle}
          seed={seed}
          setSeed={setSeed}
          resetWorld={resetWorld}
          advance={advance}
          mutate={mutate}
        />
      </aside>

      <main>
        <header className="topbar">
          <div>
            <span className="eyebrow">세계 날짜</span>
            <h1>{formatDateKo(world.clock.now())}</h1>
          </div>
          <div className="top-actions">
            <button onClick={() => advance(1)}><Clock3 size={16} />+1일</button>
            <button onClick={() => advance(7)}><CalendarDays size={16} />+7일</button>
            <button onClick={() => advance(30)}><ChevronsUpDown size={16} />+30일</button>
          </div>
        </header>

        <div className="status-line">{message}</div>

        {page === "HOME" && <HomePage data={data} world={world} setPage={setPage} setSelectedGameId={setSelectedGameId} setSelectedPlayerId={setSelectedPlayerId} />}
        {page === "MANAGER" && <ManagerPage data={data} world={world} mutate={mutate} />}
        {page === "GAMES" && <GamesPage data={data} world={world} selectedGame={selectedGame} setSelectedGameId={setSelectedGameId} mutate={mutate} />}
        {page === "STANDINGS" && <StandingsPage data={data} />}
        {page === "TEAMS" && <TeamsPage data={data} world={world} setSelectedPlayerId={setSelectedPlayerId} setPage={setPage} />}
        {page === "PLAYERS" && <PlayersPage data={data} world={world} query={query} setQuery={setQuery} selectedPlayer={selectedPlayer} setSelectedPlayerId={setSelectedPlayerId} />}
        {page === "PROSPECTS" && <ProspectsPage data={data} world={world} setSelectedPlayerId={setSelectedPlayerId} setPage={setPage} />}
        {page === "DRAFT" && <DraftPage bundle={bundle} data={data} world={world} mutate={mutate} />}
        {page === "MARKET" && <MarketPage data={data} world={world} mutate={mutate} offerEvaluations={offerEvaluations} onEvaluateOffer={evaluateOfferForUi} />}
        {page === "EVENTS" && <EventsPage world={world} filter={eventFilter} setFilter={setEventFilter} />}
      </main>
    </div>
  );
}

function HomePage({
  data,
  world,
  setPage,
  setSelectedGameId,
  setSelectedPlayerId,
}: {
  data: ViewModel;
  world: LeagueWorld;
  setPage: (page: Page) => void;
  setSelectedGameId: (id: EntityId) => void;
  setSelectedPlayerId: (id: EntityId) => void;
}) {
  return (
    <section className="dashboard-grid">
      <Panel title="현재 시즌">
        <Metric label="시즌" value={localizeEntityName(data.season?.name) || "시즌 없음"} />
        <Metric label="상태" value={labelStatus(data.season?.status) || "비어 있음"} />
        <Metric label="경기 수" value={data.games.length} />
      </Panel>
      <Panel title="오늘 경기">
        <CompactList empty="오늘 예정된 경기가 없습니다.">
          {data.todayGames.map((game) => (
            <button className="row-button" key={game.id} onClick={() => { setSelectedGameId(game.id); setPage("GAMES"); }}>
              <span>{teamName(world, game.awayTeamId)} @ {teamName(world, game.homeTeamId)}</span>
              <strong>{gameScore(game)}</strong>
            </button>
          ))}
        </CompactList>
      </Panel>
      <Panel title="리그 상위권">
        <Table headers={["순위", "팀", "승", "패", "승률"]}>
          {data.standings.slice(0, 4).map((record, index) => (
            <tr key={record.teamId}>
              <td>{index + 1}</td>
              <td>{teamName(world, record.teamId)}</td>
              <td>{record.wins}</td>
              <td>{record.losses}</td>
              <td>{record.winningPercentage.toFixed(3)}</td>
            </tr>
          ))}
        </Table>
      </Panel>
      <Panel title="타격 리더">
        <CompactList empty="아직 타격 리더가 없습니다.">
          {data.battingLeaders.map((entry) => (
            <span key={entry.playerId}>{playerName(world, entry.playerId)} OPS {entry.value.toFixed(3)}</span>
          ))}
        </CompactList>
      </Panel>
      <Panel title="투수 리더">
        <CompactList empty="아직 투수 리더가 없습니다.">
          {data.pitchingLeaders.map((entry) => (
            <span key={entry.playerId}>{playerName(world, entry.playerId)} ERA {entry.value.toFixed(2)}</span>
          ))}
        </CompactList>
      </Panel>
      <Panel title="최근 이벤트">
        <CompactList empty="이벤트가 없습니다.">
          {data.events.slice(0, 8).map((event) => <EventLine key={event.id} event={event} world={world} />)}
        </CompactList>
      </Panel>
      <Panel title="최근 계약">
        <CompactList empty="최근 계약이 없습니다.">
          {data.events.filter((event) => event.type.includes("CONTRACT") || event.type === "PLAYER_SIGNED").slice(0, 5).map((event) => <EventLine key={event.id} event={event} world={world} />)}
        </CompactList>
      </Panel>
      <Panel title="최근 트레이드">
        <CompactList empty="최근 트레이드가 없습니다.">
          {data.events.filter((event) => event.type.includes("TRADE") || event.type === "PLAYER_TRADED").slice(0, 5).map((event) => <EventLine key={event.id} event={event} world={world} />)}
        </CompactList>
      </Panel>
      <Panel title="콜업 / 말소">
        <CompactList empty="로스터 이동이 없습니다.">
          {data.events.filter((event) => event.type === "PLAYER_PROMOTED" || event.type === "PLAYER_DEMOTED").slice(0, 5).map((event) => <EventLine key={event.id} event={event} world={world} />)}
        </CompactList>
      </Panel>
      <Panel title="유망주 상위 10명">
        <CompactList empty="유망주가 없습니다.">
          {data.prospects.slice(0, 10).map((entry) => (
            <button className="row-button" key={entry.playerId} onClick={() => { setSelectedPlayerId(entry.playerId); setPage("PLAYERS"); }}>
              <span>{entry.rank}. {playerName(world, entry.playerId)}</span>
              <strong>{entry.recommendationLabel}</strong>
            </button>
          ))}
        </CompactList>
      </Panel>
      <Panel title="내 구단">
        <Metric label="감독" value={localizeEntityName(data.userManager?.name) || "감독 없음"} />
        <Metric label="팀" value={teamName(world, data.userTeam?.id) || "팀 없음"} />
        <Metric label="1군 등록 선수" value={data.myTopPlayers.length} />
      </Panel>
    </section>
  );
}

function ManagerPage({ data, world, mutate }: { data: ViewModel; world: LeagueWorld; mutate: (label: string, action: () => void) => void }) {
  const top = data.myTopPlayers;
  const futures = data.myFuturesPlayers;
  const rotation = data.userTeam ? world.pitchingRotations.get(data.userTeam.id) : undefined;
  const bullpen = data.userTeam ? [...(world.bullpenAssignments.get(data.userTeam.id)?.values() ?? [])] : [];
  const promoteId = futures[0]?.id;
  const demoteId = top.find((player) => player.primaryPosition !== "P")?.id;
  const pitcherId = top.find((player) => player.primaryPosition === "P")?.id;

  return (
    <section className="section-stack">
      <Panel title="감독">
        <div className="profile-strip">
          <Metric label="이름" value={localizeEntityName(data.userManager?.name) || "감독 없음"} />
          <Metric label="국적" value={countryLabel(data.userManager?.nationalityCode)} />
          <Metric label="팀" value={teamName(world, data.userTeam?.id) || "-"} />
          <Metric label="커리어 기록" value={data.userManager?.careerEntries.length ?? 0} />
        </div>
      </Panel>
      <Panel title="로스터 관리">
        <div className="button-row">
          <button disabled={!promoteId} onClick={() => promoteId && mutate("Called up a Futures player.", () => world.promotePlayer(promoteId, data.userTeam!.id, "웹 감독 콜업"))}>
            <ChevronsUpDown size={16} />1군 등록
          </button>
          <button disabled={!demoteId || !data.myFuturesTeam} onClick={() => demoteId && data.myFuturesTeam && mutate("Moved a first-team player to Futures.", () => world.demotePlayer(demoteId, data.myFuturesTeam.id, "웹 감독 2군 이동"))}>
            <ChevronsUpDown size={16} />2군 이동
          </button>
          <button disabled={!rotation} onClick={() => rotation && mutate("Rotated starting pitchers.", () => world.setPitchingRotation(rotation.teamId, [...rotation.orderedStartingPitcherIds].reverse()))}>
            <RefreshCcw size={16} />로테이션 변경
          </button>
          <button disabled={!pitcherId || !data.userTeam} onClick={() => pitcherId && data.userTeam && mutate("Assigned bullpen role.", () => world.assignBullpenRole(data.userTeam!.id, pitcherId, ["CLOSER"]))}>
            <Shield size={16} />마무리 지정
          </button>
        </div>
      </Panel>
      <div className="two-column">
        <RosterPanel title="1군 로스터" players={top} world={world} />
        <RosterPanel title="퓨처스 로스터" players={futures} world={world} />
      </div>
      <Panel title="투수진">
        <Table headers={["순번", "투수", "피로도", "준비도"]}>
          {(rotation?.orderedStartingPitcherIds ?? []).map((id, index) => {
            const player = world.players.get(id);
            return <tr key={id}><td>{index + 1}</td><td>{player?.name}</td><td>{player?.gameCondition.fatigue}</td><td>{player?.gameCondition.readiness}</td></tr>;
          })}
        </Table>
        <Table headers={["불펜", "역할"]}>
          {bullpen.map((item) => <tr key={item.playerId}><td>{playerName(world, item.playerId)}</td><td>{item.roles.map(labelBullpenRole).join(", ")}</td></tr>)}
        </Table>
      </Panel>
    </section>
  );
}

function GamesPage({
  data,
  world,
  selectedGame,
  setSelectedGameId,
  mutate,
}: {
  data: ViewModel;
  world: LeagueWorld;
  selectedGame?: GameFixture;
  setSelectedGameId: (id: EntityId) => void;
  mutate: (label: string, action: () => void) => void;
}) {
  const live = selectedGame ? world.liveGames.get(selectedGame.id) : undefined;
  const box = selectedGame ? world.boxScores.get(selectedGame.id) ?? live?.boxScore : undefined;
  const rosterHome = selectedGame ? findRoster(world, selectedGame.id, selectedGame.homeTeamId) : undefined;
  const rosterAway = selectedGame ? findRoster(world, selectedGame.id, selectedGame.awayTeamId) : undefined;

  return (
    <section className="games-layout">
      <Panel title="경기 일정">
        <Table headers={["날짜", "원정", "홈", "상태", "점수"]}>
          {data.games.map((game) => (
            <tr key={game.id} className={selectedGame?.id === game.id ? "selected-row" : ""} onClick={() => setSelectedGameId(game.id)}>
              <td>{formatDateKo(game.scheduledDate)}</td>
              <td>{teamName(world, game.awayTeamId)}</td>
              <td>{teamName(world, game.homeTeamId)}</td>
              <td>{labelStatus(game.status)}</td>
              <td>{gameScore(game)}</td>
            </tr>
          ))}
        </Table>
      </Panel>
      <Panel title="경기 상세">
        {selectedGame ? (
          <>
            <div className="game-title">
              <strong>{teamName(world, selectedGame.awayTeamId)} @ {teamName(world, selectedGame.homeTeamId)}</strong>
              <span>{formatDateKo(selectedGame.scheduledDate)} · {labelStatus(selectedGame.status)}</span>
            </div>
            <div className="button-row">
              <button onClick={() => mutate("Auto lineups generated.", () => autoLineups(world, selectedGame))}><ListChecks size={16} />자동 라인업</button>
              <button onClick={() => mutate("Game started.", () => world.startGame(selectedGame.id))}><Play size={16} />경기 시작</button>
              <button onClick={() => mutate("Simulated next PA.", () => world.simulateNextPlateAppearance(selectedGame.id))}><Activity size={16} />다음 타석</button>
              <button onClick={() => mutate("Simulated half inning.", () => world.simulateHalfInning(selectedGame.id))}><Activity size={16} />반 이닝 진행</button>
              <button onClick={() => mutate("Simulated full game.", () => world.simulateGame(selectedGame.id))}><Activity size={16} />경기 시뮬레이션</button>
            </div>
            {live && (
              <div className="button-row">
                <button onClick={() => mutate("Pitcher replaced.", () => quickReplacePitcher(world, selectedGame))}><Shield size={16} />투수 교체</button>
                <button onClick={() => mutate("Pinch hitter used.", () => quickPinchHitter(world, selectedGame))}><UserRound size={16} />대타</button>
                <button onClick={() => mutate("Pinch runner used.", () => quickPinchRunner(world, selectedGame))}><UserRound size={16} />대주자</button>
              </div>
            )}
            <div className="two-column">
              <LineupPanel title="원정 선발 라인업" roster={rosterAway} world={world} />
              <LineupPanel title="홈 선발 라인업" roster={rosterHome} world={world} />
            </div>
            {live && <LiveState live={live} world={world} />}
            {box && <BoxScoreView box={box} world={world} />}
            <HistoryList title="문자 중계" items={(live?.playByPlay ?? []).map((event, index) => `${index + 1}. ${event.inning}${event.half === "TOP" ? "초" : "말"} ${playerName(world, event.batterId)} ${labelPlateAppearance(event.result)} · ${event.runsScored}득점`)} />
            <HistoryList title="경기 운영 기록" items={(live?.actionHistory ?? []).map((action) => `${action.inning}${action.half === "TOP" ? "초" : "말"} ${labelAction(action.type)}: ${action.description}`)} />
          </>
        ) : <EmptyState text="경기를 선택하세요." />}
      </Panel>
    </section>
  );
}

function StandingsPage({ data }: { data: ViewModel }) {
  return (
    <Panel title="순위표">
      <Table headers={["순위", "팀", "경기", "승", "패", "무", "승률", "게임차"]}>
        {data.standings.map((record, index) => (
          <tr key={record.teamId}>
            <td>{index + 1}</td>
            <td>{data.teamNames[record.teamId]}</td>
            <td>{record.gamesPlayed}</td>
            <td>{record.wins}</td>
            <td>{record.losses}</td>
            <td>{record.draws}</td>
            <td>{record.winningPercentage.toFixed(3)}</td>
            <td>{record.gamesBehind}</td>
          </tr>
        ))}
      </Table>
    </Panel>
  );
}

function TeamsPage({ data, world, setSelectedPlayerId, setPage }: { data: ViewModel; world: LeagueWorld; setSelectedPlayerId: (id: EntityId) => void; setPage: (page: Page) => void }) {
  return (
    <section className="section-stack">
      {data.organizations.map((organization) => {
        const teams = data.teams.filter((team) => team.organizationId === organization.id);
        return (
          <Panel key={organization.id} title={orgName(world, organization.id)}>
            <div className="team-tree">
              {teams.map((team) => (
                <div key={team.id}>
                  <strong>{teamName(world, team.id)}</strong>
                  <span>{team.rosterLevelName ?? "팀"} · {team.isTopLevel ? "1군" : "육성/퓨처스"}</span>
                  <CompactList empty="선수가 없습니다.">
                    {data.players.filter((player) => player.currentTeamId === team.id).slice(0, 8).map((player) => (
                      <button className="row-button" key={player.id} onClick={() => { setSelectedPlayerId(player.id); setPage("PLAYERS"); }}>
                        <span>{playerName(world, player.id)}</span>
                        <strong>{player.primaryPosition}</strong>
                      </button>
                    ))}
                  </CompactList>
                </div>
              ))}
            </div>
          </Panel>
        );
      })}
      <Panel title="구단 일정">
        <CompactList empty="경기가 없습니다.">
          {data.games.slice(0, 12).map((game) => <span key={game.id}>{formatDateKo(game.scheduledDate)} · {teamName(world, game.awayTeamId)} @ {teamName(world, game.homeTeamId)}</span>)}
        </CompactList>
      </Panel>
    </section>
  );
}

function PlayersPage({
  data,
  world,
  query,
  setQuery,
  selectedPlayer,
  setSelectedPlayerId,
}: {
  data: ViewModel;
  world: LeagueWorld;
  query: string;
  setQuery: (value: string) => void;
  selectedPlayer?: Player;
  setSelectedPlayerId: (id: EntityId) => void;
}) {
  const filtered = data.players.filter((player) => {
    const value = `${player.name} ${player.primaryPosition} ${player.status} ${teamName(world, player.currentTeamId)}`.toLowerCase();
    return value.includes(query.toLowerCase());
  });
  return (
    <section className="players-layout">
      <Panel title="선수 목록">
        <label className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="이름, 팀, 포지션, 상태 검색" /></label>
        <Table headers={["이름", "나이", "국적", "포지션", "팀", "로스터", "건강", "기록"]}>
          {filtered.slice(0, 80).map((player) => {
            const stats = data.playerStats[player.id];
            return (
              <tr key={player.id} className={selectedPlayer?.id === player.id ? "selected-row" : ""} onClick={() => setSelectedPlayerId(player.id)}>
                <td>{playerName(world, player.id)}</td>
                <td>{player.age}</td>
                <td>{countryLabel(player.nationalityCode)}</td>
                <td>{player.primaryPosition}</td>
                <td>{teamName(world, player.currentTeamId)}</td>
                <td>{labelStatus(player.rosterStatus)}</td>
                <td>{labelStatus(player.injury.status)}</td>
                <td>{stats}</td>
              </tr>
            );
          })}
        </Table>
      </Panel>
      <PlayerDetail player={selectedPlayer} world={world} data={data} />
    </section>
  );
}

function PlayerDetail({ player, world, data }: { player?: Player; world: LeagueWorld; data: ViewModel }) {
  if (!player) return <Panel title="선수 상세"><EmptyState text="선수를 선택하세요." /></Panel>;
  const logs = world.getPlayerGameLogs(player.id);
  const scouting = [...world.scoutingReports.values()].filter((report) => report.playerId === player.id);
  return (
    <Panel title={playerName(world, player.id)}>
      <div className="profile-strip">
        <Metric label="나이" value={player.age} />
        <Metric label="국적" value={countryLabel(player.nationalityCode)} />
        <Metric label="포지션" value={`${player.primaryPosition} / ${player.secondaryPositions.join(", ") || "-"}`} />
        <Metric label="팀" value={teamName(world, player.currentTeamId) || "-"} />
      </div>
      <h3>공개 야구 능력치</h3>
      <div className="ratings-grid">
        {Object.entries(player.battingRatings).map(([key, value]) => <Metric key={key} label={`타격 ${ratingLabel(key)}`} value={String(value)} />)}
        {Object.entries(player.pitchingRatings).filter(([key]) => key !== "repertoire").map(([key, value]) => <Metric key={key} label={`투구 ${ratingLabel(key)}`} value={String(value)} />)}
      </div>
      <h3>컨디션 / 계약</h3>
      <HistoryList title="" items={[
        `부상: ${labelStatus(player.injury.status)}`,
        `피로도: ${player.gameCondition.fatigue}, 준비도: ${player.gameCondition.readiness}`,
        ...player.contracts.map((contract) => `${orgName(world, contract.organizationId)} ${formatMoney(contract.salary, contract.currency)} ${formatDateKo(contract.startDate)}-${formatDateKo(contract.endDate)} ${labelStatus(contract.contractStatus)}`),
      ]} />
      <h3>시즌 기록 / 경기별 기록</h3>
      <HistoryList title="" items={[
        data.playerStats[player.id] ?? "시즌 기록 없음",
        ...logs.batting.slice(-5).map((log) => `${formatDateKo(log.date)} 상대 ${teamName(world, log.opponentTeamId)} ${log.hits}/${log.atBats}, HR ${log.homeRuns}, RBI ${log.runsBattedIn}`),
        ...logs.pitching.slice(-5).map((log) => `${formatDateKo(log.date)} 상대 ${teamName(world, log.opponentTeamId)} IP ${log.inningsPitched}, ER ${log.earnedRuns}, SO ${log.strikeouts}`),
      ]} />
      <h3>커리어 / 로스터 이력</h3>
      <HistoryList title="" items={[
        ...player.careerEntries.map((entry) => `${formatDateKo(entry.startDate)}-${entry.endDate ? formatDateKo(entry.endDate) : "현재"} ${localizeEntityName(entry.organizationNameSnapshot)} ${labelStatus(entry.status)} · ${entry.reason}`),
        ...player.rosterAssignments.map((entry) => `${formatDateKo(entry.startDate)}-${entry.endDate ? formatDateKo(entry.endDate) : "현재"} ${teamName(world, entry.teamId)} ${labelStatus(entry.rosterStatus)}`),
      ]} />
      <h3>스카우팅 리포트</h3>
      <Table headers={["조직", "예상 CA", "예상 PA", "확신도", "추천"]}>
        {scouting.map((report) => <tr key={report.id}><td>{orgName(world, report.organizationId)}</td><td>{report.estimatedCA}</td><td>{report.estimatedPARange.low}-{report.estimatedPARange.high}</td><td>{report.confidence}</td><td>{labelRecommendation(report.recommendation)}</td></tr>)}
      </Table>
    </Panel>
  );
}

function ProspectsPage({ data, world, setSelectedPlayerId, setPage }: { data: ViewModel; world: LeagueWorld; setSelectedPlayerId: (id: EntityId) => void; setPage: (page: Page) => void }) {
  return (
    <Panel title="유망주">
      <Table headers={["순위", "선수", "나이", "소속", "포지션", "예상 CA", "예상 PA", "확신도", "추천"]}>
        {data.prospects.map((entry) => {
          const player = world.players.get(entry.playerId);
          return (
            <tr key={entry.playerId} onClick={() => { setSelectedPlayerId(entry.playerId); setPage("PLAYERS"); }}>
              <td>{entry.rank}</td>
              <td>{player ? playerName(world, player.id) : "-"}</td>
              <td>{entry.age}</td>
              <td>{teamName(world, player?.currentTeamId) || labelStatus(player?.status)}</td>
              <td>{entry.primaryPosition}</td>
              <td>{entry.estimatedCA}</td>
              <td>{entry.estimatedPARange.low}-{entry.estimatedPARange.high}</td>
              <td>{entry.confidence}</td>
              <td>{entry.recommendationLabel}</td>
            </tr>
          );
        })}
      </Table>
    </Panel>
  );
}

function DraftPage({ bundle, data, world, mutate }: { bundle: SeedWorldResult; data: ViewModel; world: LeagueWorld; mutate: (label: string, action: () => void) => void }) {
  const draft = world.drafts.get(bundle.draftId);
  const nextPick = draft?.picks.find((pick) => !pick.playerId);
  const available = draft ? world.getAvailableDraftPlayers(draft.id) : [];
  const manualPlayer = available[0];
  return (
    <section className="draft-layout">
      <Panel title="드래프트 보드">
        <div className="button-row">
          <button disabled={!draft || !nextPick || !manualPlayer} onClick={() => draft && nextPick && manualPlayer && mutate("Manual draft pick made.", () => world.makeDraftPick(draft.id, nextPick.organizationId, manualPlayer.id))}><ClipboardCheck size={16} />직접 지명</button>
          <button disabled={!draft || !nextPick} onClick={() => draft && mutate("AI pick made.", () => world.autoDraftPick(draft.id))}><Sparkles size={16} />AI 지명</button>
          <button disabled={!draft} onClick={() => draft && mutate("Draft completed.", () => world.runDraft(draft.id))}><Play size={16} />드래프트 진행</button>
        </div>
        <Table headers={["라운드", "순번", "조직", "선수", "상태"]}>
          {(draft?.picks ?? []).map((pick) => <tr key={pick.id}><td>{pick.round}</td><td>{pick.overallPick}</td><td>{orgName(world, pick.organizationId)}</td><td>{pick.playerId ? playerName(world, pick.playerId) : "-"}</td><td>{labelStatus(pick.status)}</td></tr>)}
        </Table>
      </Panel>
      <Panel title="지명 가능 선수">
        <CompactList empty="지명 가능한 선수가 없습니다.">
          {available.slice(0, 20).map((player) => <span key={player.id}>{playerName(world, player.id)} · {player.age}세 · {player.primaryPosition}</span>)}
        </CompactList>
      </Panel>
    </section>
  );
}

function MarketPage({
  data,
  world,
  mutate,
  offerEvaluations,
  onEvaluateOffer,
}: {
  data: ViewModel;
  world: LeagueWorld;
  mutate: (label: string, action: () => void) => void;
  offerEvaluations: Record<string, string>;
  onEvaluateOffer: (offerId: EntityId) => void;
}) {
  const fa = data.players.filter((player) => player.status === "FREE_AGENT");
  const firstFa = fa[0];
  const seoulPlayer = data.players.find((player) => player.currentOrganizationId === "org_seoul" && player.primaryPosition !== "P");
  const busanPlayer = data.players.find((player) => player.currentOrganizationId === "org_busan" && player.primaryPosition !== "P");
  const postingPlayer = data.players.find((player) => player.currentOrganizationId === "org_seoul" && player.currentTeamId);
  return (
    <section className="section-stack">
      <div className="market-grid">
        <Panel title="FA">
          <CompactList empty="FA 선수가 없습니다.">
            {fa.map((player) => <span key={player.id}>{playerName(world, player.id)} · 요구액 {player.contractDemand ? formatMoney(player.contractDemand.desiredSalary, "USD") : "정보 없음"}</span>)}
          </CompactList>
          <div className="button-row">
            <button disabled={!firstFa} onClick={() => firstFa && mutate("FA contract offer made.", () => world.makeContractOffer({ playerId: firstFa.id, organizationId: "org_seoul", salary: firstFa.contractDemand?.desiredSalary ?? 500000, currency: "USD", signingBonus: 50000, startDate: world.clock.now(), endDate: "2028-12-31", preferredRole: firstFa.primaryPosition }))}><Handshake size={16} />계약 제안</button>
            <button disabled={!firstFa} onClick={() => firstFa && mutate("Best FA offer accepted.", () => world.acceptContractOffer(world.chooseBestContractOffer(firstFa.id).offerId))}><ClipboardCheck size={16} />최적 제안 수락</button>
          </div>
        </Panel>
        <Panel title="계약 제안">
          <Table headers={["선수", "조직", "연봉", "기간", "상태", "평가"]}>
            {[...world.contractOffers.values()].map((offer) => (
              <tr key={offer.id}>
                <td>{playerName(world, offer.playerId)}</td>
                <td>{orgName(world, offer.organizationId)}</td>
                <td>{formatMoney(offer.salary, offer.currency)}</td>
                <td>{offer.years}년</td>
                <td>{labelStatus(offer.status)}</td>
                <td>
                  {offerEvaluations[offer.id] ?? "-"}
                  {offer.status === "PENDING" && <button className="mini-button" onClick={() => onEvaluateOffer(offer.id)}>평가</button>}
                </td>
              </tr>
            ))}
          </Table>
        </Panel>
      </div>
      <div className="market-grid">
        <Panel title="트레이드">
          <div className="button-row">
            <button disabled={!seoulPlayer || !busanPlayer} onClick={() => seoulPlayer && busanPlayer && mutate("Trade proposed.", () => world.proposeTrade({ proposerOrganizationId: "org_seoul", targetOrganizationId: "org_busan", playersFromProposer: [seoulPlayer.id], playersFromTarget: [busanPlayer.id], cash: 250000 }))}><Handshake size={16} />트레이드 제안</button>
            <button disabled={world.tradeProposals.size === 0} onClick={() => mutate("Latest trade evaluated.", () => {
              const proposal = [...world.tradeProposals.values()].at(-1);
              if (!proposal) return;
              const result = world.evaluateTradeProposal(proposal.id);
              if (result.decision === "ACCEPT") world.finalizeTrade(proposal.id);
            })}><Sparkles size={16} />AI 평가</button>
          </div>
          <Table headers={["제안", "제안팀", "상대팀", "선수", "상태"]}>
            {[...world.tradeProposals.values()].map((trade) => <tr key={trade.id}><td>{trade.id}</td><td>{orgName(world, trade.proposerOrganizationId)}</td><td>{orgName(world, trade.targetOrganizationId)}</td><td>{[...trade.playersFromProposer, ...trade.playersFromTarget].map((id) => playerName(world, id)).join(" / ")}</td><td>{labelStatus(trade.status)}</td></tr>)}
          </Table>
        </Panel>
        <Panel title="포스팅">
          <div className="button-row">
            <button disabled={!postingPlayer} onClick={() => postingPlayer && mutate("Posting requested.", () => world.requestPosting({ playerId: postingPlayer.id, currentOrganizationId: postingPlayer.currentOrganizationId!, sourceLeagueId: "league_kr1", targetLeagueIds: ["league_pw1"], compensationFee: 300000 }))}><FileJson size={16} />포스팅 요청</button>
            <button disabled={world.postingRequests.size === 0} onClick={() => mutate("Overseas posting offer made.", () => {
              const posting = [...world.postingRequests.values()].find((item) => item.status === "APPROVED");
              if (!posting) return;
              world.makeContractOffer({ playerId: posting.playerId, organizationId: "org_harbor", salary: 1400000, currency: "USD", startDate: world.clock.now(), endDate: "2029-12-31", postingRequestId: posting.id });
            })}><Handshake size={16} />해외 제안</button>
          </div>
          <Table headers={["선수", "원소속", "대상 리그", "상태"]}>
            {[...world.postingRequests.values()].map((posting) => <tr key={posting.id}><td>{playerName(world, posting.playerId)}</td><td>{orgName(world, posting.currentOrganizationId)}</td><td>{posting.targetLeagueIds.map((id) => localizeEntityName(world.leagues.get(id)?.name, id)).join(", ")}</td><td>{labelStatus(posting.status)}</td></tr>)}
          </Table>
        </Panel>
      </div>
      <Panel title="시장 가치">
        <Table headers={["선수", "서울 관점 가치", "예상 CA", "예상 PA", "계약 부담"]}>
          {data.players.slice(0, 12).map((player) => {
            const value = world.calculatePlayerMarketValue(player.id, "org_seoul");
            return <tr key={player.id}><td>{playerName(world, player.id)}</td><td>{value.value.toFixed(1)}</td><td>{value.estimatedCurrentAbility}</td><td>{value.estimatedPotentialAbility}</td><td>{value.contractBurden}</td></tr>;
          })}
        </Table>
      </Panel>
    </section>
  );
}

function EventsPage({ world, filter, setFilter }: { world: LeagueWorld; filter: string; setFilter: (value: string) => void }) {
  const filtered = [...world.events].reverse().filter((event) => filter === "ALL" || eventCategory(event.type) === filter);
  const filters = ["ALL", "CONTRACT", "MOVE", "GAME", "SEASON", "DRAFT", "INJURY", "CAREER"];
  return (
    <Panel title="월드 이벤트">
      <div className="filter-row">
        {filters.map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{labelEventCategory(item)}</button>)}
      </div>
      <Table headers={["날짜", "유형", "대상", "사유"]}>
        {filtered.map((event) => <tr key={event.id}><td>{formatDateKo(event.date)}</td><td>{labelEventType(event.type)}</td><td>{event.subjectId ? subjectName(world, event.subjectId) : event.teamId ? teamName(world, event.teamId) : "-"}</td><td>{describeEvent(event)}</td></tr>)}
      </Table>
    </Panel>
  );
}

function DebugPanel({
  bundle,
  seed,
  setSeed,
  resetWorld,
  advance,
  mutate,
}: {
  bundle: SeedWorldResult;
  seed: number;
  setSeed: (seed: number) => void;
  resetWorld: () => void;
  advance: (days: number) => void;
  mutate: (label: string, action: () => void) => void;
}) {
  const world = bundle.world;
  return (
    <details className="debug-panel" open>
      <summary>디버그</summary>
      <label>시드<input type="number" value={seed} onChange={(event) => setSeed(Number(event.target.value))} /></label>
      <Metric label="세계 날짜" value={formatDateKo(world.clock.now())} />
      <Metric label="선수 수" value={world.players.size} />
      <Metric label="팀 수" value={world.teams.size} />
      <Metric label="조직 수" value={world.organizations.size} />
      <Metric label="일정 수" value={world.games.size} />
      <Metric label="이벤트 수" value={world.events.length} />
      <Metric label="진행 중 경기" value={world.liveGames.size} />
      <div className="debug-actions">
        <button onClick={() => mutate("Invariant validation completed.", () => {
          const issues = world.validateInvariants();
          if (issues.length) throw new Error(issues.join("; "));
        })}><ClipboardCheck size={14} />검사</button>
        <button onClick={resetWorld}><RefreshCcw size={14} />초기화</button>
        <button onClick={() => advance(1)}>+1</button>
        <button onClick={() => advance(7)}>+7</button>
      </div>
      <button onClick={() => navigator.clipboard?.writeText(JSON.stringify(exportWorld(world), null, 2))}><FileJson size={14} />JSON 복사</button>
    </details>
  );
}

interface ViewModel {
  season: ReturnType<LeagueWorld["createSeason"]> | undefined;
  userManager: ReturnType<LeagueWorld["managers"]["get"]>;
  userTeam: Team | undefined;
  myFuturesTeam: Team | undefined;
  organizations: ReturnType<LeagueWorld["organizations"]["values"]> extends IterableIterator<infer T> ? T[] : never;
  teams: Team[];
  players: Player[];
  myTopPlayers: Player[];
  myFuturesPlayers: Player[];
  games: GameFixture[];
  todayGames: GameFixture[];
  standings: ReturnType<LeagueWorld["getStandings"]>;
  battingLeaders: ReturnType<LeagueWorld["getBattingLeaders"]>;
  pitchingLeaders: ReturnType<LeagueWorld["getPitchingLeaders"]>;
  events: WorldEvent[];
  prospects: Array<ReturnType<LeagueWorld["getProspectRankings"]>[number] & { recommendationLabel: string }>;
  teamNames: Record<string, string>;
  playerStats: Record<string, string>;
}

function makeViewModel(world: LeagueWorld, bundle: SeedWorldResult): ViewModel {
  const season = world.seasons.get(bundle.seasonId);
  const userManager = world.managers.get(bundle.userManagerId);
  const userTeam = world.teams.get(bundle.userTeamId);
  const myFuturesTeam = [...world.teams.values()].find((team) => team.organizationId === userTeam?.organizationId && !team.isTopLevel);
  const players = [...world.players.values()].sort((a, b) => a.name.localeCompare(b.name));
  const standings = season ? world.getStandings(season.id) : [];
  return {
    season,
    userManager,
    userTeam,
    myFuturesTeam,
    organizations: [...world.organizations.values()],
    teams: [...world.teams.values()],
    players,
    myTopPlayers: players.filter((player) => player.currentTeamId === userTeam?.id),
    myFuturesPlayers: players.filter((player) => player.currentTeamId === myFuturesTeam?.id),
    games: [...world.games.values()].sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate)),
    todayGames: [...world.games.values()].filter((game) => game.scheduledDate === world.clock.now()),
    standings,
    battingLeaders: season ? world.getBattingLeaders(season.id, "OPS", { limit: 5 }) : [],
    pitchingLeaders: season ? world.getPitchingLeaders(season.id, "ERA", { limit: 5 }) : [],
    events: [...world.events].reverse(),
    prospects: world.getProspectRankings({ organizationId: "org_seoul", limit: 30 }).map((entry) => ({
      ...entry,
      recommendationLabel: labelRecommendation(scoutingRecommendation(world, entry.playerId)),
    })),
    teamNames: Object.fromEntries([...world.teams.values()].map((team) => [team.id, localizeEntityName(team.name)])),
    playerStats: Object.fromEntries(players.map((player) => [player.id, statLine(world, player.id, bundle.seasonId)])),
  };
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="panel"><h2>{title}</h2>{children}</section>;
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong></div>;
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return <div className="table-wrap"><table><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}

function CompactList({ empty, children }: { empty: string; children: React.ReactNode[] | React.ReactNode }) {
  const items = Array.isArray(children) ? children.filter(Boolean) : children;
  if (Array.isArray(items) && items.length === 0) return <EmptyState text={empty} />;
  return <div className="compact-list">{items}</div>;
}

function EmptyState({ text }: { text: string }) {
  return <p className="empty-state">{text}</p>;
}

function RosterPanel({ title, players, world }: { title: string; players: Player[]; world: LeagueWorld }) {
  return <Panel title={title}><Table headers={["선수", "나이", "포지션", "컨디션", "부상"]}>{players.map((player) => <tr key={player.id}><td>{playerName(world, player.id)}</td><td>{player.age}</td><td>{player.primaryPosition}</td><td>{player.gameCondition.readiness - player.gameCondition.fatigue}</td><td>{labelStatus(player.injury.status)}</td></tr>)}</Table><span className="hint">{players.map((player) => teamName(world, player.currentTeamId)).filter(Boolean)[0]}</span></Panel>;
}

function LineupPanel({ title, roster, world }: { title: string; roster: ReturnType<typeof findRoster>; world: LeagueWorld }) {
  return <Panel title={title}>{roster ? <Table headers={["타순", "선수", "포지션"]}>{[...roster.startingLineup].sort((a, b) => a.battingOrder - b.battingOrder).map((slot) => <tr key={slot.battingOrder}><td>{slot.battingOrder}</td><td>{playerName(world, slot.playerId)}</td><td>{slot.defensivePosition}</td></tr>)}</Table> : <EmptyState text="경기 엔트리가 없습니다." />}</Panel>;
}

function LiveState({ live, world }: { live: NonNullable<LeagueWorld["liveGames"] extends Map<EntityId, infer T> ? T : never>; world: LeagueWorld }) {
  return (
    <div className="live-strip">
      <Metric label="이닝" value={`${live.inning}${live.half === "TOP" ? "초" : "말"}`} />
      <Metric label="아웃" value={live.outs} />
      <Metric label="점수" value={`${live.awayScore}-${live.homeScore}`} />
      <Metric label="타자" value={playerName(world, live.currentBatterId)} />
      <Metric label="투수" value={playerName(world, live.currentPitcherId)} />
      <Metric label="주자" value={`${live.bases.first ? "1" : "-"}${live.bases.second ? "2" : "-"}${live.bases.third ? "3" : "-"}`} />
    </div>
  );
}

function BoxScoreView({ box, world }: { box: NonNullable<LeagueWorld["boxScores"] extends Map<EntityId, infer T> ? T : never>; world: LeagueWorld }) {
  return (
    <Panel title="박스스코어">
      <Table headers={["팀", "득점", "안타", "실책", "이닝별 득점"]}>
        {[box.teams.away, box.teams.home].map((team) => <tr key={team.teamId}><td>{teamName(world, team.teamId)}</td><td>{team.runs}</td><td>{team.hits}</td><td>{team.errors}</td><td>{team.inningRuns.join(" ")}</td></tr>)}
      </Table>
    </Panel>
  );
}

function HistoryList({ title, items }: { title: string; items: string[] }) {
  return <div className="history-list">{title && <h3>{title}</h3>}{items.length ? items.map((item, index) => <span key={`${item}-${index}`}>{item}</span>) : <EmptyState text="데이터가 없습니다." />}</div>;
}

function EventLine({ event, world }: { event: WorldEvent; world: LeagueWorld }) {
  return <span>{formatDateKo(event.date)} · {labelEventType(event.type)} · {event.subjectId ? subjectName(world, event.subjectId) : event.teamId ? teamName(world, event.teamId) : ""}</span>;
}

function navIcon(page: Page) {
  const size = 16;
  if (page === "HOME") return <Home size={size} />;
  if (page === "MANAGER") return <UserRound size={size} />;
  if (page === "GAMES") return <CalendarDays size={size} />;
  if (page === "STANDINGS") return <BarChart3 size={size} />;
  if (page === "TEAMS") return <Shield size={size} />;
  if (page === "PLAYERS") return <UsersRound size={size} />;
  if (page === "PROSPECTS") return <Sparkles size={size} />;
  if (page === "DRAFT") return <ClipboardCheck size={size} />;
  if (page === "MARKET") return <Handshake size={size} />;
  return <ListChecks size={size} />;
}

function autoLineups(world: LeagueWorld, game: GameFixture) {
  for (const teamId of [game.homeTeamId, game.awayTeamId]) {
    if (!findRoster(world, game.id, teamId)) {
      world.autoGenerateLineup({ gameId: game.id, teamId });
    }
  }
}

function quickReplacePitcher(world: LeagueWorld, game: GameFixture) {
  const live = world.liveGames.get(game.id);
  if (!live) throw new Error("진행 중인 경기가 아닙니다.");
  const defenseTeamId = live.half === "TOP" ? game.homeTeamId : game.awayTeamId;
  const roster = findRoster(world, game.id, defenseTeamId);
  const pitcher = roster?.bullpenPlayerIds.find((id) => id !== live.currentPitcherId);
  if (!pitcher) throw new Error("사용 가능한 불펜 투수가 없습니다.");
  world.replacePitcher(game.id, defenseTeamId, pitcher, { reason: "웹 빠른 투수 교체" });
}

function quickPinchHitter(world: LeagueWorld, game: GameFixture) {
  const live = world.liveGames.get(game.id);
  if (!live) throw new Error("진행 중인 경기가 아닙니다.");
  const offenseTeamId = live.half === "TOP" ? game.awayTeamId : game.homeTeamId;
  const roster = findRoster(world, game.id, offenseTeamId);
  const hitter = roster?.benchPlayerIds[0];
  if (!hitter) throw new Error("사용 가능한 벤치 야수가 없습니다.");
  world.usePinchHitter(game.id, offenseTeamId, hitter, { reason: "웹 빠른 대타 투입" });
}

function quickPinchRunner(world: LeagueWorld, game: GameFixture) {
  const live = world.liveGames.get(game.id);
  if (!live) throw new Error("진행 중인 경기가 아닙니다.");
  const offenseTeamId = live.half === "TOP" ? game.awayTeamId : game.homeTeamId;
  const runner = [live.bases.first, live.bases.second, live.bases.third].find(Boolean);
  const roster = findRoster(world, game.id, offenseTeamId);
  const bench = roster?.benchPlayerIds[0];
  if (!runner || !bench) throw new Error("베이스 위 주자와 벤치 선수가 필요합니다.");
  world.usePinchRunner(game.id, offenseTeamId, runner, bench, { reason: "웹 빠른 대주자 투입" });
}

function findRoster(world: LeagueWorld, gameId: EntityId, teamId: EntityId) {
  return [...world.gameRosters.values()].find((roster) => roster.gameId === gameId && roster.teamId === teamId);
}

function teamName(world: LeagueWorld, teamId?: EntityId | null) {
  if (!teamId) return "";
  const team = world.teams.get(teamId);
  return team ? localizeEntityName(team.name) : teamId;
}

function orgName(world: LeagueWorld, organizationId?: EntityId | null) {
  if (!organizationId) return "";
  const organization = world.organizations.get(organizationId);
  return organization ? localizeEntityName(organization.name) : organizationId;
}

function playerName(world: LeagueWorld, playerId?: EntityId | null) {
  if (!playerId) return "";
  const player = world.players.get(playerId);
  return player ? localizeEntityName(player.name) : "";
}

function managerName(world: LeagueWorld, managerId?: EntityId | null) {
  if (!managerId) return "";
  const manager = world.managers.get(managerId);
  return manager ? localizeEntityName(manager.name) : "";
}

function subjectName(world: LeagueWorld, subjectId: EntityId) {
  return playerName(world, subjectId) || managerName(world, subjectId) || teamName(world, subjectId) || subjectId;
}

function countryLabel(code?: string) {
  if (code === "KR") return "대한민국";
  if (code === "PW") return "퍼시픽 웨스트";
  return code ?? "-";
}

function gameScore(game: GameFixture) {
  return game.result ? `${game.result.awayScore}-${game.result.homeScore}` : "-";
}

function statLine(world: LeagueWorld, playerId: EntityId, seasonId: EntityId) {
  const batting = world.getPlayerBattingSeasonStats(playerId, seasonId).find((stats) => stats.split === "TOTAL");
  const pitching = world.getPlayerPitchingSeasonStats(playerId, seasonId).find((stats) => stats.split === "TOTAL");
  if (batting && batting.plateAppearances > 0) return `AVG ${batting.average.toFixed(3)} HR ${batting.homeRuns} RBI ${batting.runsBattedIn}`;
  if (pitching && pitching.battersFaced > 0) return `ERA ${pitching.earnedRunAverage.toFixed(2)} SO ${pitching.strikeouts}`;
  return "-";
}

function ratingLabel(key: string) {
  const labels: Record<string, string> = {
    contact: "컨택",
    power: "파워",
    plateDiscipline: "선구안",
    speed: "주력",
    fielding: "수비",
    arm: "송구",
    velocity: "구속",
    control: "제구",
    movement: "무브먼트",
    stamina: "스태미나",
    pitchQuality: "구위",
  };
  return labels[key] ?? key;
}

function scoutingRecommendation(world: LeagueWorld, playerId: EntityId) {
  const report = [...world.scoutingReports.values()]
    .filter((item) => item.playerId === playerId && item.organizationId === "org_seoul")
    .sort((a, b) => b.confidence - a.confidence)[0];
  return report?.recommendation ?? "WATCH";
}

function exportWorld(world: LeagueWorld) {
  return {
    clock: world.clock.now(),
    countries: [...world.countries.values()],
    leagues: [...world.leagues.values()],
    organizations: [...world.organizations.values()],
    teams: [...world.teams.values()],
    players: [...world.players.values()],
    managers: [...world.managers.values()],
    seasons: [...world.seasons.values()],
    competitions: [...world.competitions.values()],
    games: [...world.games.values()],
    events: world.events,
  };
}
