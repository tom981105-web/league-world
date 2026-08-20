import test from "node:test";
import assert from "node:assert/strict";
import { createSmallSeedWorld } from "../dist/web/seedWorld.js";

function rate(numerator, denominator) {
  return denominator ? numerator / denominator : 0;
}

function emptyLine() {
  return { pa: 0, ab: 0, h: 0, doubles: 0, triples: 0, hr: 0, bb: 0, so: 0 };
}

function addResult(line, result) {
  line.pa += 1;
  if (result === "WALK") {
    line.bb += 1;
    return;
  }
  line.ab += 1;
  if (result === "STRIKEOUT") line.so += 1;
  if (["SINGLE", "DOUBLE", "TRIPLE", "HOME_RUN"].includes(result)) line.h += 1;
  if (result === "DOUBLE") line.doubles += 1;
  if (result === "TRIPLE") line.triples += 1;
  if (result === "HOME_RUN") line.hr += 1;
}

function derived(line) {
  const totalBases = line.h + line.doubles + line.triples * 2 + line.hr * 3;
  const obp = rate(line.h + line.bb, line.pa);
  const slg = rate(totalBases, line.ab);
  return {
    avg: rate(line.h, line.ab),
    obp,
    slg,
    ops: obp + slg,
    hrPa: rate(line.hr, line.pa),
    bbPa: rate(line.bb, line.pa),
    soPa: rate(line.so, line.pa),
  };
}

function firstMatchup(world) {
  const batter = [...world.players.values()].find((player) => player.currentTeamId && player.primaryPosition !== "P");
  const pitcher = [...world.players.values()].find((player) => player.currentTeamId && player.primaryPosition === "P");
  assert.ok(batter);
  assert.ok(pitcher);
  return { batter, pitcher };
}

function setBatter(player, ratings) {
  player.battingRatings = { ...player.battingRatings, ...ratings };
  player.currentAbility = ratings.currentAbility ?? player.currentAbility;
  player.gameCondition = { fatigue: 0, readiness: 100, availableForGame: true };
}

function setPitcher(player, ratings) {
  player.pitchingRatings = { ...player.pitchingRatings, ...ratings };
  player.currentAbility = ratings.currentAbility ?? player.currentAbility;
  player.gameCondition = { fatigue: 0, readiness: 100, availableForGame: true };
}

function simulateLine(world, batterId, pitcherId, plateAppearances = 2500) {
  const line = emptyLine();
  for (let i = 0; i < plateAppearances; i += 1) {
    addResult(line, world.simulatePlateAppearance(batterId, pitcherId));
  }
  return derived(line);
}

test("plate appearance simulation remains deterministic with the same seed", () => {
  function run() {
    const { world } = createSmallSeedWorld(9301);
    const { batter, pitcher } = firstMatchup(world);
    return simulateLine(world, batter.id, pitcher.id, 1000);
  }
  assert.deepEqual(run(), run());
});

test("star hitters produce meaningfully better long-run offense than weak hitters", () => {
  function run(contact, power, plateDiscipline) {
    const { world } = createSmallSeedWorld(9302);
    const { batter, pitcher } = firstMatchup(world);
    setBatter(batter, { contact, power, plateDiscipline, speed: 65, currentAbility: contact });
    setPitcher(pitcher, { velocity: 60, control: 60, movement: 60, pitchQuality: 60, stamina: 60, currentAbility: 60 });
    return simulateLine(world, batter.id, pitcher.id);
  }
  const weak = run(35, 35, 35);
  const star = run(85, 85, 85);
  assert.ok(star.avg > weak.avg + 0.04, `star avg ${star.avg} weak avg ${weak.avg}`);
  assert.ok(star.ops > weak.ops + 0.18, `star ops ${star.ops} weak ops ${weak.ops}`);
  assert.ok(star.hrPa > weak.hrPa, `star HR/PA ${star.hrPa} weak HR/PA ${weak.hrPa}`);
  assert.ok(star.avg < 0.42, `star hitter should not turn into automatic hits: ${star.avg}`);
});

test("ace pitchers suppress offense and add strikeouts compared with weak pitchers", () => {
  function run(velocity, control, movement, pitchQuality, stamina) {
    const { world } = createSmallSeedWorld(9303);
    const { batter, pitcher } = firstMatchup(world);
    setBatter(batter, { contact: 65, power: 65, plateDiscipline: 65, speed: 60, currentAbility: 65 });
    setPitcher(pitcher, { velocity, control, movement, pitchQuality, stamina, currentAbility: pitchQuality });
    return simulateLine(world, batter.id, pitcher.id);
  }
  const weakPitcher = run(35, 35, 35, 35, 35);
  const ace = run(85, 85, 85, 85, 85);
  assert.ok(weakPitcher.ops > ace.ops + 0.15, `weak pitcher OPS ${weakPitcher.ops} ace OPS ${ace.ops}`);
  assert.ok(ace.soPa > weakPitcher.soPa, `ace SO/PA ${ace.soPa} weak pitcher SO/PA ${weakPitcher.soPa}`);
  assert.ok(weakPitcher.bbPa > ace.bbPa, `weak pitcher BB/PA ${weakPitcher.bbPa} ace BB/PA ${ace.bbPa}`);
});

test("small league game sample stays out of extreme run and rate environments", () => {
  const bundle = createSmallSeedWorld(9304, { startMode: "UNEMPLOYED" });
  const options = { userManagerId: bundle.userManagerId, playerCareerOptions: () => [], managerCareerOptions: () => [], injuryChance: () => 0 };
  while ([...bundle.world.games.values()].some((game) => game.status === "SCHEDULED")) {
    const result = bundle.world.advancePlayableDays(1, options);
    assert.equal(result.stoppedForUserGame, false);
  }
  const line = emptyLine();
  let games = 0;
  let runs = 0;
  for (const boxScore of bundle.world.boxScores.values()) {
    games += 1;
    runs += boxScore.teams.home.runs + boxScore.teams.away.runs;
    for (const batter of Object.values(boxScore.batters)) {
      line.pa += batter.plateAppearances;
      line.ab += batter.atBats;
      line.h += batter.hits;
      line.doubles += batter.doubles;
      line.triples += batter.triples;
      line.hr += batter.homeRuns;
      line.bb += batter.walks;
      line.so += batter.strikeouts;
    }
  }
  const stats = derived(line);
  const runsPerTeamGame = rate(runs, games * 2);
  assert.ok(runsPerTeamGame > 2 && runsPerTeamGame < 7, `runs/team/game ${runsPerTeamGame}`);
  assert.ok(stats.avg > 0.17 && stats.avg < 0.33, `AVG ${stats.avg}`);
  assert.ok(stats.hrPa > 0.01 && stats.hrPa < 0.06, `HR/PA ${stats.hrPa}`);
  assert.ok(stats.bbPa > 0.04 && stats.bbPa < 0.13, `BB/PA ${stats.bbPa}`);
  assert.ok(stats.soPa > 0.12 && stats.soPa < 0.3, `SO/PA ${stats.soPa}`);
  assert.deepEqual(bundle.world.validateInvariants(), []);
});
