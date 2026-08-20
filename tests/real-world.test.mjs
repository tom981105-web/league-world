import test from "node:test";
import assert from "node:assert/strict";
import { deserializeWorld, serializeWorld } from "../dist/index.js";
import {
  createReal2026SeedWorld,
  createStandardSeedWorld,
  validateReal2026SeedData,
} from "../dist/web/seedWorld.js";
import { loadRealWorldSnapshot, realWorldSnapshot2026, validateRealWorldSnapshot } from "../dist/data/real/index.js";

test("real country and league catalog contains 2026 world structure", () => {
  const report = validateReal2026SeedData();
  assert.equal(report.valid, true);
  assert.equal(report.counts.countries, 9);
  assert.ok(realWorldSnapshot2026.leagues.some((league) => league.id === "real_league_kbo" && league.name === "KBO League"));
  assert.ok(realWorldSnapshot2026.leagues.some((league) => league.id === "real_league_mlb" && league.subdivisions.length === 8));
  assert.ok(realWorldSnapshot2026.leagues.some((league) => league.id === "real_league_npb" && league.subdivisions.length === 2));
});

test("real organization catalog has KBO 10, MLB 30, and NPB 12 organizations", () => {
  const kbo = realWorldSnapshot2026.organizations.filter((org) => org.primaryLeagueId === "real_league_kbo");
  const mlb = realWorldSnapshot2026.organizations.filter((org) => org.primaryLeagueId === "real_league_mlb");
  const npb = realWorldSnapshot2026.organizations.filter((org) => org.primaryLeagueId === "real_league_npb");
  assert.equal(kbo.length, 10);
  assert.equal(mlb.length, 30);
  assert.equal(npb.length, 12);
  assert.ok(kbo.some((org) => org.displayName === "LG 트윈스"));
  assert.ok(mlb.some((org) => org.displayName === "Los Angeles Dodgers"));
  assert.ok(npb.some((org) => org.displayName === "요미우리 자이언츠"));
});

test("organization-team hierarchy and country-league relationship support different affiliate profiles", () => {
  const { world } = createReal2026SeedWorld(8601, { startMode: "UNEMPLOYED" });
  const kboTeams = [...world.teams.values()].filter((team) => team.organizationId?.startsWith("real_org_kbo_"));
  const mlbTeams = [...world.teams.values()].filter((team) => team.organizationId?.startsWith("real_org_mlb_"));
  const npbTeams = [...world.teams.values()].filter((team) => team.organizationId?.startsWith("real_org_npb_"));
  assert.equal(kboTeams.length, 20);
  assert.equal(mlbTeams.length, 180);
  assert.equal(npbTeams.length, 24);
  assert.equal(new Set(kboTeams.map((team) => team.levelCode)).size, 2);
  assert.equal(new Set(mlbTeams.map((team) => team.levelCode)).size, 6);
  assert.equal(new Set(npbTeams.map((team) => team.levelCode)).size, 2);
  assert.deepEqual(world.validateInvariants(), []);
});

test("real snapshot imports metadata without pretending player DB is complete", () => {
  const result = loadRealWorldSnapshot(realWorldSnapshot2026, 8602);
  assert.equal(result.metadata.snapshotId, "real_world_2026");
  assert.equal(result.metadata.snapshotYear, 2026);
  assert.equal(result.metadata.playerDataStatus, "EMPTY");
  assert.equal(result.validation.counts.players, 0);
  assert.equal([...result.world.players.values()].filter((player) => player.realWorld?.source === "REAL").length, 0);
});

test("real data validation catches duplicate external IDs and missing factual fields", () => {
  const withRows = structuredClone(realWorldSnapshot2026);
  withRows.players = [
    { externalIds: { sample: "dup" }, displayName: "실제 선수 샘플", nationalityCode: "KR", organizationId: "real_org_kbo_lg", teamId: "team_real_org_kbo_lg_top", primaryPosition: "P" },
    { externalIds: { sample: "dup" }, displayName: "실제 선수 샘플2", nationalityCode: "KR", organizationId: "real_org_kbo_lg", teamId: "team_real_org_kbo_lg_top", primaryPosition: "C" },
  ];
  const report = validateRealWorldSnapshot(withRows);
  assert.equal(report.valid, false);
  assert.ok(report.errors.some((error) => error.includes("Duplicate player external ID")));
  assert.ok(report.warnings.some((warning) => warning.includes("missing birthDate")));
});

test("generated player distinction, nationality, and current activity country remain separate", () => {
  const { world } = createReal2026SeedWorld(8603, { organizationId: "real_org_kbo_lg" });
  world.addPlayer({
    id: "generated_us_kbo_player",
    name: "Generated US Player",
    birthDate: "2002-06-01",
    nationalityCode: "US",
    primaryPosition: "P",
    status: "PROFESSIONAL",
    currentAbility: 52,
    potentialAbility: 70,
    currentTeamId: "team_real_org_kbo_lg_top",
    realWorld: { snapshotId: "real_world_2026", snapshotYear: 2026, source: "GENERATED", isGenerated: true, generatedYear: 2027 },
    ratingMetadata: { ratingModelVersion: "generated-v1", source: "GENERATED" },
  });
  const player = world.players.get("generated_us_kbo_player");
  const league = world.leagues.get(world.teams.get(player.currentTeamId).leagueId);
  assert.equal(player.nationalityCode, "US");
  assert.equal(league.countryId, "country_kr");
  assert.equal(player.realWorld.isGenerated, true);
});

test("international player and manager movement work across KBO, MLB, and NPB structures", () => {
  const { world } = createReal2026SeedWorld(8604, { organizationId: "real_org_kbo_lg" });
  world.addPlayer({
    id: "generated_transfer_player",
    name: "Generated Transfer Player",
    birthDate: "2000-05-01",
    nationalityCode: "KR",
    primaryPosition: "SS",
    status: "PROFESSIONAL",
    currentAbility: 60,
    potentialAbility: 74,
    currentTeamId: "team_real_org_kbo_lg_top",
    realWorld: { snapshotId: "real_world_2026", snapshotYear: 2026, source: "GENERATED", isGenerated: true, generatedYear: 2027 },
  });
  world.movePlayer("generated_transfer_player", "team_real_org_mlb_dodgers_mlb", "KBO에서 MLB로 국제 이동 테스트");
  assert.equal(world.players.get("generated_transfer_player").currentOrganizationId, "real_org_mlb_dodgers");
  world.movePlayer("generated_transfer_player", "team_real_org_kbo_lg_top", "MLB에서 KBO로 국제 이동 테스트");
  world.movePlayer("generated_transfer_player", "team_real_org_npb_giants_top", "KBO에서 NPB로 국제 이동 테스트");
  assert.equal(world.players.get("generated_transfer_player").nationalityCode, "KR");
  assert.equal(world.players.get("generated_transfer_player").currentOrganizationId, "real_org_npb_giants");

  world.addManager({ id: "manager_international_real", name: "국제 감독", birthDate: "1978-01-01", nationalityCode: "KR", status: "UNEMPLOYED", reputation: 55 });
  world.hireManager("manager_international_real", "team_real_org_mlb_mets_mlb", "MLB 감독 국제 이동 테스트");
  assert.equal(world.managers.get("manager_international_real").currentOrganizationId, "real_org_mlb_mets");
});

test("season, competition, draft, and contract stay league/currency scoped", () => {
  const { world, seasonId, draftId, userManagerId } = createReal2026SeedWorld(8605, { organizationId: "real_org_kbo_lg" });
  assert.equal(world.seasons.get(seasonId).leagueId, "real_league_kbo");
  assert.ok([...world.seasons.values()].some((season) => season.leagueId === "real_league_mlb"));
  assert.ok([...world.seasons.values()].some((season) => season.leagueId === "real_league_npb"));
  assert.equal(world.competitions.get("real_competition_kbo_regular_2026").leagueId, "real_league_kbo");
  assert.equal(world.drafts.get(draftId).leagueId, "real_league_kbo");
  const mlbSeason = [...world.seasons.values()].find((season) => season.leagueId === "real_league_mlb");
  const mlbDraft = world.createDraft({ id: "real_draft_mlb_scope_test", leagueId: "real_league_mlb", seasonId: mlbSeason.id, year: 2026, rounds: 1, draftOrder: ["real_org_mlb_mets"] });
  assert.equal(mlbDraft.leagueId, "real_league_mlb");
  const contract = world.managers.get(userManagerId).contracts.find((item) => item.status === "ACTIVE");
  assert.equal(contract.currency, "KRW");
});

test("real snapshot metadata survives save/load and fictional v1 saves remain compatible", () => {
  const real = createReal2026SeedWorld(8606);
  const restoredReal = deserializeWorld(serializeWorld(real.world));
  assert.deepEqual(restoredReal.realWorldSnapshot, real.world.realWorldSnapshot);
  assert.deepEqual(restoredReal.validateInvariants(), []);

  const fictional = createStandardSeedWorld(8606);
  const restoredFictional = deserializeWorld(serializeWorld(fictional.world));
  assert.equal(restoredFictional.realWorldSnapshot, undefined);
  assert.deepEqual(restoredFictional.validateInvariants(), []);
});

test("same seed keeps generated manager deterministic in real snapshot world and progression stays stable", () => {
  const first = createReal2026SeedWorld(8607, { managerName: undefined, startMode: "UNEMPLOYED" });
  const second = createReal2026SeedWorld(8607, { managerName: undefined, startMode: "UNEMPLOYED" });
  assert.equal(first.world.managers.get(first.userManagerId).name, second.world.managers.get(second.userManagerId).name);
  const progress = first.world.advancePlayableDays(1, { userManagerId: first.userManagerId, playerCareerOptions: () => [], managerCareerOptions: () => [], injuryChance: () => 0 });
  assert.equal(progress.daysAdvanced, 1);
  assert.deepEqual(first.world.validateInvariants(), []);
});
