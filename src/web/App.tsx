import { type ChangeEvent, useMemo, useState } from "react";
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
  createWebSave,
  deleteLocalSave,
  downloadSave,
  hasAutosave,
  listLocalSaves,
  loadFromLocalStorage,
  readSaveFile,
  restoreWebSave,
  saveSlots,
  saveToLocalStorage,
  type SaveSlotKey,
  type WebSaveMetadata,
} from "./saveStorage.js";
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
  | "EVENTS"
  | "SAVES";

const pages: Page[] = ["HOME", "MANAGER", "GAMES", "STANDINGS", "TEAMS", "PLAYERS", "PROSPECTS", "DRAFT", "MARKET", "EVENTS", "SAVES"];
const bullpenRoles: BullpenRole[] = ["CLOSER", "SETUP", "MIDDLE_RELIEF", "LONG_RELIEF", "MOP_UP", "FLEXIBLE"];
type ManagerTab = "OVERVIEW" | "ROSTER" | "CAREER" | "JOBS" | "OFFERS";
const managerTabs: Record<ManagerTab, string> = {
  OVERVIEW: "개요",
  ROSTER: "선수단",
  CAREER: "커리어",
  JOBS: "구직",
  OFFERS: "제안",
};

export function App() {
  const [seed, setSeed] = useState(20270403);
  const [bundle, setBundle] = useState<SeedWorldResult | undefined>();
  const [version, setVersion] = useState(0);
  const [page, setPage] = useState<Page>("HOME");
  const [selectedGameId, setSelectedGameId] = useState<EntityId | undefined>();
  const [selectedPlayerId, setSelectedPlayerId] = useState<EntityId | undefined>();
  const [query, setQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("ALL");
  const [managerTab, setManagerTab] = useState<ManagerTab>("OVERVIEW");
  const [message, setMessage] = useState("커리어를 선택해 주세요.");
  const [offerEvaluations, setOfferEvaluations] = useState<Record<string, string>>({});
  const [saveMetas, setSaveMetas] = useState<Partial<Record<SaveSlotKey, WebSaveMetadata>>>(() => listLocalSaves());
  const [careerName, setCareerName] = useState("새 감독");
  const [careerNationality, setCareerNationality] = useState("KR");
  const [careerStartMode, setCareerStartMode] = useState<"CLUB" | "UNEMPLOYED">("CLUB");
  const [careerOrganizationId, setCareerOrganizationId] = useState<EntityId>("org_seoul");
  const data = useMemo(() => (bundle ? makeViewModel(bundle.world, bundle) : undefined), [bundle, version]);

  if (!bundle) {
    return (
      <StartScreen
        seed={seed}
        setSeed={setSeed}
        careerName={careerName}
        setCareerName={setCareerName}
        careerNationality={careerNationality}
        setCareerNationality={setCareerNationality}
        careerStartMode={careerStartMode}
        setCareerStartMode={setCareerStartMode}
        careerOrganizationId={careerOrganizationId}
        setCareerOrganizationId={setCareerOrganizationId}
        saveMetas={saveMetas}
        onContinue={() => loadSaveSlot("autosave")}
        onLoadSlot={loadSaveSlot}
        onNewCareer={startNewCareer}
        onImport={importSave}
        message={message}
      />
    );
  }

  const world = bundle.world;
  void version;

  if (!data) {
    throw new Error("월드 화면 데이터를 만들 수 없습니다.");
  }

  const selectedGame = selectedGameId ? world.games.get(selectedGameId) : data.games[0];
  const selectedPlayer = selectedPlayerId ? world.players.get(selectedPlayerId) : undefined;

  const mutate = (label: string, action: () => void) => {
    try {
      action();
      setVersion((value) => value + 1);
      setMessage(localizeEngineMessage(label));
      autoSave();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    }
  };

  const resetWorld = () => {
    const next = createSeedWorld(seed, {
      managerName: careerName,
      managerNationalityCode: careerNationality,
      startMode: careerStartMode,
      organizationId: careerOrganizationId,
    });
    setBundle(next);
    setSelectedGameId([...next.world.games.keys()][0]);
    setSelectedPlayerId(undefined);
    setOfferEvaluations({});
    setVersion((value) => value + 1);
    setMessage(`시드 ${seed}로 세계를 초기화했습니다.`);
  };

  function startNewCareer() {
    const next = createSeedWorld(seed, {
      managerName: careerName,
      managerNationalityCode: careerNationality,
      startMode: careerStartMode,
      organizationId: careerOrganizationId,
    });
    setBundle(next);
    setSelectedGameId([...next.world.games.keys()][0]);
    setSelectedPlayerId(undefined);
    setOfferEvaluations({});
    setPage("HOME");
    setVersion((value) => value + 1);
    saveToLocalStorage("autosave", createWebSave(next, "자동 저장"));
    setSaveMetas(listLocalSaves());
    setMessage("새 커리어를 시작했습니다.");
  }

  function autoSave() {
    if (!bundle) return;
    saveToLocalStorage("autosave", createWebSave(bundle, "자동 저장"));
    setSaveMetas(listLocalSaves());
  }

  function saveSlot(slot: SaveSlotKey) {
    if (!bundle) return;
    saveToLocalStorage(slot, createWebSave(bundle, slot === "autosave" ? "자동 저장" : `저장 슬롯 ${slot.slice(-1)}`));
    setSaveMetas(listLocalSaves());
    setMessage("저장했습니다.");
  }

  function loadSaveSlot(slot: SaveSlotKey) {
    try {
      const save = loadFromLocalStorage(slot);
      if (!save) throw new Error("저장 슬롯이 비어 있습니다.");
      const next = restoreWebSave(save);
      setBundle(next);
      setSeed(next.seed);
      setSelectedGameId([...next.world.games.keys()][0]);
      setSelectedPlayerId(undefined);
      setOfferEvaluations({});
      setPage("HOME");
      setVersion((value) => value + 1);
      setSaveMetas(listLocalSaves());
      setMessage("저장 데이터를 불러왔습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    }
  }

  function deleteSlot(slot: SaveSlotKey) {
    if (!window.confirm("이 저장 슬롯을 삭제할까요?")) return;
    deleteLocalSave(slot);
    setSaveMetas(listLocalSaves());
    setMessage("저장 슬롯을 삭제했습니다.");
  }

  function exportSave() {
    if (!bundle) return;
    downloadSave(createWebSave(bundle, "LEAGUE 저장"));
    setMessage("저장 파일을 내보냈습니다.");
  }

  async function importSave(event: ChangeEvent<HTMLInputElement>) {
    try {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;
      const save = await readSaveFile(file);
      const next = restoreWebSave(save);
      setBundle(next);
      setSeed(next.seed);
      setSelectedGameId([...next.world.games.keys()][0]);
      setSelectedPlayerId(undefined);
      setOfferEvaluations({});
      setPage("HOME");
      setVersion((value) => value + 1);
      setMessage("저장 파일을 가져왔습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    }
  }

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
        {page === "MANAGER" && <ManagerPage data={data} world={world} mutate={mutate} tab={managerTab} setTab={setManagerTab} />}
        {page === "GAMES" && <GamesPage data={data} world={world} selectedGame={selectedGame} setSelectedGameId={setSelectedGameId} mutate={mutate} />}
        {page === "STANDINGS" && <StandingsPage data={data} />}
        {page === "TEAMS" && <TeamsPage data={data} world={world} setSelectedPlayerId={setSelectedPlayerId} setPage={setPage} />}
        {page === "PLAYERS" && <PlayersPage data={data} world={world} query={query} setQuery={setQuery} selectedPlayer={selectedPlayer} setSelectedPlayerId={setSelectedPlayerId} />}
        {page === "PROSPECTS" && <ProspectsPage data={data} world={world} setSelectedPlayerId={setSelectedPlayerId} setPage={setPage} />}
        {page === "DRAFT" && <DraftPage bundle={bundle} data={data} world={world} mutate={mutate} />}
        {page === "MARKET" && <MarketPage data={data} world={world} mutate={mutate} offerEvaluations={offerEvaluations} onEvaluateOffer={evaluateOfferForUi} />}
        {page === "EVENTS" && <EventsPage world={world} filter={eventFilter} setFilter={setEventFilter} />}
        {page === "SAVES" && <SavePage metas={saveMetas} onSave={saveSlot} onLoad={loadSaveSlot} onDelete={deleteSlot} onExport={exportSave} onImport={importSave} />}
      </main>
    </div>
  );
}

function StartScreen({
  seed,
  setSeed,
  careerName,
  setCareerName,
  careerNationality,
  setCareerNationality,
  careerStartMode,
  setCareerStartMode,
  careerOrganizationId,
  setCareerOrganizationId,
  saveMetas,
  onContinue,
  onLoadSlot,
  onNewCareer,
  onImport,
  message,
}: {
  seed: number;
  setSeed: (seed: number) => void;
  careerName: string;
  setCareerName: (name: string) => void;
  careerNationality: string;
  setCareerNationality: (code: string) => void;
  careerStartMode: "CLUB" | "UNEMPLOYED";
  setCareerStartMode: (mode: "CLUB" | "UNEMPLOYED") => void;
  careerOrganizationId: EntityId;
  setCareerOrganizationId: (id: EntityId) => void;
  saveMetas: Partial<Record<SaveSlotKey, WebSaveMetadata>>;
  onContinue: () => void;
  onLoadSlot: (slot: SaveSlotKey) => void;
  onNewCareer: () => void;
  onImport: (event: ChangeEvent<HTMLInputElement>) => void;
  message: string;
}) {
  return (
    <main className="start-screen">
      <section className="start-hero">
        <div className="brand">
          <div className="brand-mark">LW</div>
          <div>
            <strong>LEAGUE</strong>
            <span>계속 플레이 가능한 야구 세계</span>
          </div>
        </div>
        <div className="status-line">{message}</div>
        <div className="button-row">
          <button disabled={!hasAutosave()} onClick={onContinue}><Play size={16} />이어하기</button>
          <button onClick={onNewCareer}><Sparkles size={16} />새 커리어</button>
          <label className="file-button"><FileJson size={16} />저장 불러오기<input type="file" accept="application/json,.json,.league-save.json" onChange={onImport} /></label>
        </div>
      </section>
      <section className="start-grid">
        <Panel title="새 커리어">
          <label className="form-field">감독 이름<input value={careerName} onChange={(event) => setCareerName(event.target.value)} /></label>
          <label className="form-field">국적<select value={careerNationality} onChange={(event) => setCareerNationality(event.target.value)}><option value="KR">대한민국</option><option value="JP">일본</option><option value="PW">퍼시픽 웨스트</option></select></label>
          <label className="form-field">시드<input type="number" value={seed} onChange={(event) => setSeed(Number(event.target.value))} /></label>
          <label className="form-field">시작 방식<select value={careerStartMode} onChange={(event) => setCareerStartMode(event.target.value as "CLUB" | "UNEMPLOYED")}><option value="CLUB">구단 선택</option><option value="UNEMPLOYED">무직</option></select></label>
          <label className="form-field">시작 구단<select value={careerOrganizationId} disabled={careerStartMode === "UNEMPLOYED"} onChange={(event) => setCareerOrganizationId(event.target.value)}><option value="org_seoul">서울 팰컨스</option><option value="org_busan">부산 타이즈</option><option value="org_incheon">인천 웨이브스</option><option value="org_daejeon">대전 스파크스</option></select></label>
        </Panel>
        <Panel title="저장 슬롯">
          <SaveSlotList metas={saveMetas} onLoad={onLoadSlot} />
        </Panel>
      </section>
    </main>
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
        <Metric label="소속" value={data.userManager?.currentOrganizationId ? orgName(world, data.userManager.currentOrganizationId) : "현재 소속 구단 없음"} />
        <Metric label="팀" value={teamName(world, data.userTeam?.id) || "-"} />
        <Metric label="계약" value={managerContractLabel(world, data.userManager?.id)} />
        <Metric label="평판" value={reputationLabel(data.userManager?.reputation ?? 0)} />
        <Metric label="구단 신뢰도" value={confidenceLabel(data.userManager?.boardConfidence?.score)} />
        <Metric label="새 감독 제안" value={[...world.managerContractOffers.values()].filter((offer) => offer.managerId === data.userManager?.id && offer.status === "PENDING").length} />
        <Metric label="1군 등록 선수" value={data.myTopPlayers.length} />
        {!data.userManager?.currentOrganizationId && <button onClick={() => setPage("MANAGER")}>감독직 알아보기</button>}
      </Panel>
    </section>
  );
}

function ManagerPage({
  data,
  world,
  mutate,
  tab,
  setTab,
}: {
  data: ViewModel;
  world: LeagueWorld;
  mutate: (label: string, action: () => void) => void;
  tab: ManagerTab;
  setTab: (tab: ManagerTab) => void;
}) {
  const top = data.myTopPlayers;
  const futures = data.myFuturesPlayers;
  const rotation = data.userTeam ? world.pitchingRotations.get(data.userTeam.id) : undefined;
  const bullpen = data.userTeam ? [...(world.bullpenAssignments.get(data.userTeam.id)?.values() ?? [])] : [];
  const promoteId = futures[0]?.id;
  const demoteId = top.find((player) => player.primaryPosition !== "P")?.id;
  const pitcherId = top.find((player) => player.primaryPosition === "P")?.id;
  const manager = data.userManager;
  const contract = manager ? [...manager.contracts].reverse().find((item) => item.status === "ACTIVE") : undefined;
  const jobs = world.getManagerJobVacancies();
  const applications = [...world.managerJobApplications.values()].filter((application) => application.managerId === manager?.id);
  const offers = [...world.managerContractOffers.values()].filter((offer) => offer.managerId === manager?.id).reverse();
  const managerEvents = data.events.filter((event) => event.subjectId === manager?.id).slice(0, 8);
  const leader = data.standings.find((record) => record.teamId === data.userTeam?.id);

  return (
    <section className="section-stack">
      <Panel title="감독">
        <div className="profile-strip">
          <Metric label="이름" value={localizeEntityName(manager?.name) || "감독 없음"} />
          <Metric label="국적" value={countryLabel(manager?.nationalityCode)} />
          <Metric label="나이" value={manager?.age ?? "-"} />
          <Metric label="팀" value={teamName(world, data.userTeam?.id) || "-"} />
          <Metric label="계약" value={contract ? `${formatDateKo(contract.startDate)} ~ ${formatDateKo(contract.endDate)}` : "-"} />
          <Metric label="연봉" value={contract ? formatMoney(contract.salary, contract.currency) : "-"} />
          <Metric label="평판" value={reputationLabel(manager?.reputation ?? 0)} />
          <Metric label="구단 신뢰도" value={confidenceLabel(manager?.boardConfidence?.score)} />
        </div>
        <div className="filter-row">
          {(Object.keys(managerTabs) as ManagerTab[]).map((item) => (
            <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{managerTabs[item]}</button>
          ))}
        </div>
      </Panel>
      {tab === "OVERVIEW" && (
        <div className="two-column">
          <Panel title="감독 개요">
            <Metric label="현재 조직" value={orgName(world, manager?.currentOrganizationId) || "무직"} />
            <Metric label="현재 순위" value={leader ? `${data.standings.indexOf(leader) + 1}위` : "-"} />
            <Metric label="통산 전적" value={manager ? `${manager.careerStats.wins}승 ${manager.careerStats.losses}패 ${manager.careerStats.draws}무` : "-"} />
            <Metric label="승률" value={manager ? manager.careerStats.winningPercentage.toFixed(3) : "-"} />
            <Metric label="우승" value={manager?.careerStats.championships ?? 0} />
            <button disabled={!manager || manager.status !== "EMPLOYED"} onClick={() => manager && window.confirm("감독직에서 사임할까요?") && mutate("Manager resigned.", () => world.resignManager(manager.id, "웹 사용자 사임"))}>감독직 사임</button>
          </Panel>
          <Panel title="최근 감독 이벤트">
            <CompactList empty="감독 이벤트가 없습니다.">
              {managerEvents.map((event) => <EventLine key={event.id} event={event} world={world} />)}
            </CompactList>
          </Panel>
        </div>
      )}
      {tab === "ROSTER" && (
        <>
          <Panel title="로스터 관리">
            <div className="button-row">
              <button disabled={!promoteId || !data.userTeam} onClick={() => promoteId && data.userTeam && mutate("Called up a Futures player.", () => world.promotePlayer(promoteId, data.userTeam!.id, "웹 감독 콜업"))}><ChevronsUpDown size={16} />1군 등록</button>
              <button disabled={!demoteId || !data.myFuturesTeam} onClick={() => {
                const futuresTeam = data.myFuturesTeam;
                if (demoteId && futuresTeam) mutate("Moved a first-team player to Futures.", () => world.demotePlayer(demoteId, futuresTeam.id, "웹 감독 2군 이동"));
              }}><ChevronsUpDown size={16} />2군 이동</button>
              <button disabled={!rotation} onClick={() => rotation && mutate("Rotated starting pitchers.", () => world.setPitchingRotation(rotation.teamId, [...rotation.orderedStartingPitcherIds].reverse()))}><RefreshCcw size={16} />로테이션 변경</button>
              <button disabled={!pitcherId || !data.userTeam} onClick={() => pitcherId && data.userTeam && mutate("Assigned bullpen role.", () => world.assignBullpenRole(data.userTeam!.id, pitcherId, ["CLOSER"]))}><Shield size={16} />마무리 지정</button>
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
        </>
      )}
      {tab === "CAREER" && (
        <Panel title="감독 커리어">
          <Table headers={["기간", "팀", "역할", "상태", "전적", "우승", "종료 사유"]}>
            {(manager?.careerEntries ?? []).map((entry) => <tr key={entry.id}><td>{formatDateKo(entry.startDate)} ~ {formatDateKo(entry.endDate)}</td><td>{entry.teamId ? teamName(world, entry.teamId) : localizeEntityName(entry.organizationNameSnapshot)}</td><td>{labelManagerRole(entry.role)}</td><td>{labelStatus(entry.status)}</td><td>{entry.games ?? 0}경기 {entry.wins ?? 0}승 {entry.losses ?? 0}패</td><td>{entry.championships ?? 0}</td><td>{entry.endReason ?? entry.reason}</td></tr>)}
          </Table>
        </Panel>
      )}
      {tab === "JOBS" && (
        <Panel title="감독 구직">
          <Table headers={["국가", "리그", "구단", "예상 연봉", "계약 기간", "기대 성적", "요구 평판", "상태"]}>
            {jobs.map((job) => {
              const team = world.teams.get(job.teamId);
              const league = team ? world.leagues.get(team.leagueId) : undefined;
              const applied = applications.find((application) => application.vacancyId === job.id);
              return <tr key={job.id}><td>{countryLabel(world.countries.get(world.organizations.get(job.organizationId)?.countryId ?? "")?.code)}</td><td>{localizeEntityName(league?.name)}</td><td>{teamName(world, job.teamId)}</td><td>{formatMoney(job.salaryRange.min, job.salaryRange.currency)} ~ {formatMoney(job.salaryRange.max, job.salaryRange.currency)}</td><td>{job.contractYearsRange.min}~{job.contractYearsRange.max}년</td><td>{job.expectations}</td><td>{job.minimumReputation ?? "-"}</td><td>{applied ? labelStatus(applied.status) : <button disabled={!manager} onClick={() => manager && mutate("Applied for manager job.", () => {
                const application = world.applyForManagerJob({ managerId: manager.id, vacancyId: job.id, desiredSalary: job.salaryRange.min, desiredYears: job.contractYearsRange.min });
                const evaluation = world.evaluateManagerApplication(application.id);
                if (evaluation.decision === "OFFER") {
                  world.makeManagerOffer({ managerId: manager.id, vacancyId: job.id, organizationId: job.organizationId, teamId: job.teamId, salary: job.salaryRange.min, currency: job.salaryRange.currency, years: job.contractYearsRange.min });
                }
              })}>지원하기</button>}</td></tr>;
            })}
          </Table>
        </Panel>
      )}
      {tab === "OFFERS" && (
        <Panel title="감독 제안">
          <Table headers={["구단", "역할", "연봉", "기간", "목표", "상태", "결정"]}>
            {offers.map((offer) => <tr key={offer.id}><td>{orgName(world, offer.organizationId)}</td><td>{labelManagerRole(offer.role)}</td><td>{formatMoney(offer.salary, offer.currency)}</td><td>{offer.years}년</td><td>{offer.expectations}</td><td>{labelStatus(offer.status)}</td><td>{offer.status === "PENDING" ? <div className="button-row"><button onClick={() => mutate("Manager offer accepted.", () => world.acceptManagerOffer(offer.id))}>수락</button><button onClick={() => mutate("Manager offer rejected.", () => world.rejectManagerOffer(offer.id))}>거절</button></div> : "-"}</td></tr>)}
          </Table>
        </Panel>
      )}
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
  selectedGame: GameFixture | undefined;
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
                  {(() => {
                    const manager = [...world.managers.values()].find((item) => item.currentTeamId === team.id && item.status === "EMPLOYED");
                    return manager ? <button className="row-button" onClick={() => setPage("MANAGER")}><span>감독 {localizeEntityName(manager.name)}</span><strong>{reputationLabel(manager.reputation)}</strong></button> : <span>감독 공석</span>;
                  })()}
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
  selectedPlayer: Player | undefined;
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

function PlayerDetail({ player, world, data }: { player: Player | undefined; world: LeagueWorld; data: ViewModel }) {
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
  const userOrganizationId = data.userManager?.currentOrganizationId;
  const opponentOrganizationId = data.organizations.find((organization) => organization.id !== userOrganizationId)?.id;
  const userPlayer = data.players.find((player) => player.currentOrganizationId === userOrganizationId && player.primaryPosition !== "P");
  const opponentPlayer = data.players.find((player) => player.currentOrganizationId === opponentOrganizationId && player.primaryPosition !== "P");
  const postingPlayer = data.players.find((player) => player.currentOrganizationId === userOrganizationId && player.currentTeamId);
  const postingLeagueId = postingPlayer?.currentTeamId ? world.teams.get(postingPlayer.currentTeamId)?.leagueId : undefined;
  const hasClubPower = !!userOrganizationId;
  return (
    <section className="section-stack">
      {!hasClubPower && <Panel title="구단 권한"><EmptyState text="무직 상태에서는 계약 제안, 트레이드, 포스팅 같은 구단 권한을 사용할 수 없습니다." /></Panel>}
      <div className="market-grid">
        <Panel title="FA">
          <CompactList empty="FA 선수가 없습니다.">
            {fa.map((player) => <span key={player.id}>{playerName(world, player.id)} · 요구액 {player.contractDemand ? formatMoney(player.contractDemand.desiredSalary, "USD") : "정보 없음"}</span>)}
          </CompactList>
          <div className="button-row">
            <button disabled={!firstFa || !userOrganizationId} onClick={() => firstFa && userOrganizationId && mutate("FA contract offer made.", () => world.makeContractOffer({ playerId: firstFa.id, organizationId: userOrganizationId, salary: firstFa.contractDemand?.desiredSalary ?? 500000, currency: "USD", signingBonus: 50000, startDate: world.clock.now(), endDate: "2028-12-31", preferredRole: firstFa.primaryPosition }))}><Handshake size={16} />계약 제안</button>
            <button disabled={!firstFa || !userOrganizationId} onClick={() => firstFa && mutate("Best FA offer accepted.", () => world.acceptContractOffer(world.chooseBestContractOffer(firstFa.id).offerId))}><ClipboardCheck size={16} />최적 제안 수락</button>
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
            <button disabled={!userOrganizationId || !opponentOrganizationId || !userPlayer || !opponentPlayer} onClick={() => userOrganizationId && opponentOrganizationId && userPlayer && opponentPlayer && mutate("Trade proposed.", () => world.proposeTrade({ proposerOrganizationId: userOrganizationId, targetOrganizationId: opponentOrganizationId, playersFromProposer: [userPlayer.id], playersFromTarget: [opponentPlayer.id], cash: 250000 }))}><Handshake size={16} />트레이드 제안</button>
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
            <button disabled={!postingPlayer || !postingLeagueId || !userOrganizationId} onClick={() => postingPlayer && postingLeagueId && userOrganizationId && mutate("Posting requested.", () => world.requestPosting({ playerId: postingPlayer.id, currentOrganizationId: userOrganizationId, sourceLeagueId: postingLeagueId, targetLeagueIds: ["league_pw1"], compensationFee: 300000 }))}><FileJson size={16} />포스팅 요청</button>
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
        <Table headers={["선수", "구단 관점 가치", "예상 CA", "예상 PA", "계약 부담"]}>
          {data.players.slice(0, 12).map((player) => {
            const value = world.calculatePlayerMarketValue(player.id, userOrganizationId);
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

function SavePage({
  metas,
  onSave,
  onLoad,
  onDelete,
  onExport,
  onImport,
}: {
  metas: Partial<Record<SaveSlotKey, WebSaveMetadata>>;
  onSave: (slot: SaveSlotKey) => void;
  onLoad: (slot: SaveSlotKey) => void;
  onDelete: (slot: SaveSlotKey) => void;
  onExport: () => void;
  onImport: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <section className="section-stack">
      <Panel title="저장 / 불러오기">
        <Table headers={["슬롯", "저장 이름", "저장 시각", "게임 날짜", "감독", "현재 구단", "시즌", "작업"]}>
          {saveSlots.map((slot) => {
            const meta = metas[slot];
            return (
              <tr key={slot}>
                <td>{slotLabel(slot)}</td>
                <td>{meta?.name ?? "비어 있음"}</td>
                <td>{formatSavedAt(meta?.savedAt)}</td>
                <td>{formatDateKo(meta?.gameDate)}</td>
                <td>{localizeEntityName(meta?.managerName)}</td>
                <td>{localizeEntityName(meta?.currentOrganizationName)}</td>
                <td>{localizeEntityName(meta?.seasonName)}</td>
                <td>
                  <div className="button-row">
                    <button onClick={() => onSave(slot)}>{meta ? "덮어쓰기" : "저장"}</button>
                    <button disabled={!meta} onClick={() => onLoad(slot)}>불러오기</button>
                    <button disabled={!meta} onClick={() => onDelete(slot)}>삭제</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </Table>
      </Panel>
      <Panel title="JSON 백업">
        <div className="button-row">
          <button onClick={onExport}><FileJson size={16} />저장파일 내보내기</button>
          <label className="file-button"><FileJson size={16} />저장파일 가져오기<input type="file" accept="application/json,.json,.league-save.json" onChange={onImport} /></label>
        </div>
      </Panel>
    </section>
  );
}

function SaveSlotList({ metas, onLoad }: { metas: Partial<Record<SaveSlotKey, WebSaveMetadata>>; onLoad: (slot: SaveSlotKey) => void }) {
  return (
    <div className="compact-list">
      {saveSlots.map((slot) => {
        const meta = metas[slot];
        return (
          <button className="row-button" key={slot} disabled={!meta} onClick={() => onLoad(slot)}>
            <span>{slotLabel(slot)} · {meta ? `${localizeEntityName(meta.managerName)} / ${formatDateKo(meta.gameDate)}` : "비어 있음"}</span>
            <strong>{meta ? "불러오기" : "-"}</strong>
          </button>
        );
      })}
    </div>
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
  const userTeam = userManager ? (userManager.currentTeamId ? world.teams.get(userManager.currentTeamId) : undefined) : world.teams.get(bundle.userTeamId);
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
    prospects: world.getProspectRankings({ organizationId: userManager?.currentOrganizationId ?? "org_seoul", limit: 30 }).map((entry) => ({
      ...entry,
      recommendationLabel: labelRecommendation(scoutingRecommendation(world, entry.playerId, userManager?.currentOrganizationId ?? "org_seoul")),
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
  if (page === "SAVES") return <FileJson size={size} />;
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

function managerContractLabel(world: LeagueWorld, managerId?: EntityId) {
  if (!managerId) return "-";
  const manager = world.managers.get(managerId);
  const contract = manager?.contracts.find((item) => item.status === "ACTIVE");
  if (!contract) return "-";
  return `${orgName(world, contract.organizationId)} · ${formatMoney(contract.salary, contract.currency)}`;
}

function reputationLabel(value: number) {
  if (value >= 90) return `세계적 (${value})`;
  if (value >= 78) return `국제적 (${value})`;
  if (value >= 66) return `국내 정상급 (${value})`;
  if (value >= 52) return `국내 유망 (${value})`;
  if (value >= 35) return `지역급 (${value})`;
  return `무명 (${value})`;
}

function confidenceLabel(value: number | undefined) {
  if (value === undefined) return "-";
  if (value >= 82) return `매우 만족 (${value})`;
  if (value >= 64) return `만족 (${value})`;
  if (value >= 45) return `보통 (${value})`;
  if (value >= 25) return `불안 (${value})`;
  return `매우 불안 (${value})`;
}

function slotLabel(slot: SaveSlotKey) {
  if (slot === "autosave") return "자동 저장";
  if (slot === "slot1") return "저장 슬롯 1";
  if (slot === "slot2") return "저장 슬롯 2";
  return "저장 슬롯 3";
}

function formatSavedAt(value: string | undefined) {
  if (!value || value === "-") return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ko-KR");
}

function labelManagerRole(value: string) {
  const labels: Record<string, string> = {
    MANAGER: "감독",
    FARM_MANAGER: "팜 감독",
    AMATEUR_MANAGER: "아마추어 감독",
    NATIONAL_TEAM_MANAGER: "국가대표 감독",
  };
  return labels[value] ?? value;
}

function countryLabel(code?: string) {
  if (code === "KR") return "대한민국";
  if (code === "PW") return "퍼시픽 웨스트";
  if (code === "JP") return "일본";
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

function scoutingRecommendation(world: LeagueWorld, playerId: EntityId, organizationId: EntityId) {
  const report = [...world.scoutingReports.values()]
    .filter((item) => item.playerId === playerId && item.organizationId === organizationId)
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
