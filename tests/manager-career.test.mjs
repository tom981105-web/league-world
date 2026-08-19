import test from "node:test";
import assert from "node:assert/strict";
import { LeagueWorld, Mulberry32Random, WorldClock } from "../dist/index.js";

function createManagerWorld(seed = 90210) {
  const world = new LeagueWorld(new WorldClock("2027-04-01"), new Mulberry32Random(seed));
  world.addCountry({ id: "country_kr", code: "KR", name: "Korea Republic" });
  world.addCountry({ id: "country_jp", code: "JP", name: "Japan Archipelago" });
  world.addLeague({ id: "league_kr", countryId: "country_kr", name: "Korea Premier", level: 1, category: "PROFESSIONAL" });
  world.addLeague({ id: "league_jp", countryId: "country_jp", name: "Japan Frontier", level: 1, category: "PROFESSIONAL" });
  world.addOrganization({ id: "org_seoul", name: "Seoul Falcons Organization", countryId: "country_kr" });
  world.addOrganization({ id: "org_busan", name: "Busan Tides Organization", countryId: "country_kr" });
  world.addOrganization({ id: "org_osaka", name: "Osaka Suns Organization", countryId: "country_jp" });
  world.addTeam({ id: "team_seoul", leagueId: "league_kr", organizationId: "org_seoul", name: "Seoul Falcons", teamType: "CLUB", isTopLevel: true });
  world.addTeam({ id: "team_busan", leagueId: "league_kr", organizationId: "org_busan", name: "Busan Tides", teamType: "CLUB", isTopLevel: true });
  world.addTeam({ id: "team_osaka", leagueId: "league_jp", organizationId: "org_osaka", name: "Osaka Suns", teamType: "CLUB", isTopLevel: true });
  return world;
}

function addManager(world, overrides = {}) {
  world.addManager({
    id: "manager_1",
    name: "한도윤",
    birthDate: "1980-02-10",
    nationalityCode: "KR",
    status: "UNEMPLOYED",
    reputation: 70,
    ...overrides,
  });
}

test("unemployed manager can be created as an independent career entity", () => {
  const world = createManagerWorld();
  addManager(world);
  const manager = world.managers.get("manager_1");
  assert.equal(manager.status, "UNEMPLOYED");
  assert.equal(manager.employmentStatus, "UNEMPLOYED");
  assert.equal(manager.currentOrganizationId, undefined);
  assert.equal(manager.careerEntries.length, 0);
});

test("manager applies for job, receives offer, and accepts employment", () => {
  const world = createManagerWorld();
  addManager(world, { reputation: 92, careerStats: { games: 240, wins: 150, losses: 80, draws: 10, winningPercentage: 0.625, championships: 2 } });
  const vacancy = world.openManagerJobVacancy({
    organizationId: "org_seoul",
    teamId: "team_seoul",
    minimumReputation: 40,
    preferredReputation: 65,
    salaryRange: { min: 500000, max: 900000, currency: "USD" },
    contractYearsRange: { min: 2, max: 3 },
    expectations: "포스트시즌 경쟁",
  });
  const application = world.applyForManagerJob({ managerId: "manager_1", vacancyId: vacancy.id, desiredSalary: 600000, desiredYears: 2 });
  const evaluation = world.evaluateManagerApplication(application.id);
  assert.equal(evaluation.decision, "OFFER");
  const offer = world.makeManagerOffer({ managerId: "manager_1", vacancyId: vacancy.id, organizationId: "org_seoul", salary: 600000, currency: "USD", years: 2 });
  const contract = world.acceptManagerOffer(offer.id);
  const manager = world.managers.get("manager_1");
  assert.equal(contract.status, "ACTIVE");
  assert.equal(manager.currentOrganizationId, "org_seoul");
  assert.equal(manager.currentTeamId, "team_seoul");
  assert.equal(world.managerJobVacancies.get(vacancy.id).status, "FILLED");
  assert.ok(world.events.some((event) => event.type === "MANAGER_HIRED"));
});

test("manager can reject an outside offer and keep current job", () => {
  const world = createManagerWorld();
  addManager(world, {
    status: "EMPLOYED",
    currentTeamId: "team_seoul",
    contracts: [{
      id: "mc_1",
      managerId: "manager_1",
      organizationId: "org_seoul",
      teamId: "team_seoul",
      role: "MANAGER",
      startDate: "2027-01-01",
      endDate: "2028-12-31",
      salary: 700000,
      currency: "USD",
      status: "ACTIVE",
    }],
  });
  const offer = world.makeManagerOffer({ managerId: "manager_1", organizationId: "org_busan", teamId: "team_busan", salary: 800000, currency: "USD", years: 2 });
  world.rejectManagerOffer(offer.id);
  const manager = world.managers.get("manager_1");
  assert.equal(manager.currentOrganizationId, "org_seoul");
  assert.equal(world.managerContractOffers.get(offer.id).status, "REJECTED");
});

test("accepting another team offer closes old contract and moves authority organization", () => {
  const world = createManagerWorld();
  addManager(world, {
    status: "EMPLOYED",
    currentTeamId: "team_seoul",
    contracts: [{
      id: "mc_old",
      managerId: "manager_1",
      organizationId: "org_seoul",
      teamId: "team_seoul",
      role: "MANAGER",
      startDate: "2027-01-01",
      endDate: "2028-12-31",
      salary: 700000,
      currency: "USD",
      status: "ACTIVE",
    }],
  });
  const offer = world.makeManagerOffer({ managerId: "manager_1", organizationId: "org_osaka", teamId: "team_osaka", salary: 120000000, currency: "JPY", years: 3 });
  world.acceptManagerOffer(offer.id);
  const manager = world.managers.get("manager_1");
  assert.equal(manager.currentOrganizationId, "org_osaka");
  assert.equal(manager.currentTeamId, "team_osaka");
  assert.equal(manager.contracts.find((contract) => contract.id === "mc_old").status, "TERMINATED");
  assert.ok(world.events.some((event) => event.type === "MANAGER_MOVED_TEAM"));
});

test("resign, sack, renewal, and expiration keep manager career state consistent", () => {
  const world = createManagerWorld();
  addManager(world, {
    status: "EMPLOYED",
    currentTeamId: "team_seoul",
    contracts: [{
      id: "mc_1",
      managerId: "manager_1",
      organizationId: "org_seoul",
      teamId: "team_seoul",
      role: "MANAGER",
      startDate: "2027-01-01",
      endDate: "2027-04-02",
      salary: 700000,
      currency: "USD",
      status: "ACTIVE",
    }],
  });
  const renewal = world.renewManagerContract("manager_1", 2, 760000);
  assert.equal(world.managerContractOffers.get(renewal.id).status, "PENDING");
  world.advanceDays(2, { playerCareerOptions: () => [], managerCareerOptions: () => [] });
  assert.equal(world.managers.get("manager_1").status, "UNEMPLOYED");
  assert.ok(world.events.some((event) => event.type === "MANAGER_BECAME_UNEMPLOYED"));

  world.addManager({ id: "manager_2", name: "박서준", birthDate: "1977-08-08", nationalityCode: "KR", status: "EMPLOYED", reputation: 55, currentTeamId: "team_busan" });
  world.resignManager("manager_2");
  assert.equal(world.managers.get("manager_2").status, "UNEMPLOYED");

  world.addManager({ id: "manager_3", name: "이태오", birthDate: "1975-05-05", nationalityCode: "KR", status: "EMPLOYED", reputation: 50, currentTeamId: "team_osaka" });
  world.sackManager("manager_3");
  assert.equal(world.managers.get("manager_3").status, "UNEMPLOYED");
  assert.ok(world.events.some((event) => event.type === "MANAGER_SACKED"));
});

test("reputation and board confidence update deterministically from seeded world", () => {
  const first = createManagerWorld(7);
  const second = createManagerWorld(7);
  for (const world of [first, second]) {
    addManager(world, { status: "EMPLOYED", currentTeamId: "team_seoul", careerStats: { games: 100, wins: 62, losses: 35, draws: 3, winningPercentage: 0.62, championships: 1 } });
    world.updateBoardConfidence("manager_1", 12, "목표 초과 달성");
  }
  assert.equal(first.updateManagerReputation("manager_1"), second.updateManagerReputation("manager_1"));
  assert.equal(first.managers.get("manager_1").boardConfidence.score, 72);
});

test("one team cannot have two active primary managers", () => {
  const world = createManagerWorld();
  addManager(world, { status: "EMPLOYED", currentTeamId: "team_seoul" });
  assert.throws(() => {
    world.addManager({ id: "manager_2", name: "중복 감독", birthDate: "1982-01-01", nationalityCode: "KR", status: "EMPLOYED", reputation: 40, currentTeamId: "team_seoul" });
  }, /multiple active managers|Team already has an active manager/);
});

test("manager invariant catches conflicting active contracts", () => {
  const world = createManagerWorld();
  addManager(world, {
    status: "EMPLOYED",
    currentTeamId: "team_seoul",
    contracts: [{ id: "mc_a", managerId: "manager_1", organizationId: "org_seoul", teamId: "team_seoul", role: "MANAGER", startDate: "2027-01-01", endDate: "2028-12-31", salary: 1, currency: "USD", status: "ACTIVE" }],
  });
  const manager = world.managers.get("manager_1");
  manager.contracts.push({ id: "mc_b", managerId: "manager_1", organizationId: "org_busan", teamId: "team_busan", role: "MANAGER", startDate: "2027-01-01", endDate: "2028-12-31", salary: 1, currency: "USD", status: "ACTIVE" });
  assert.match(world.validateInvariants().join("; "), /multiple active contracts/);
});
