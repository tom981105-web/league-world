import { performance } from "node:perf_hooks";
import { createStandardSeedWorld } from "../dist/web/seedWorld.js";

const targetGames = Number.parseInt(process.argv[2] ?? "100", 10);
const seedStart = Number.parseInt(process.argv[3] ?? "20270403", 10);
const stableOptions = {
  playerCareerOptions: () => [],
  managerCareerOptions: () => [],
  injuryChance: () => 0,
};

if (!Number.isInteger(targetGames) || targetGames <= 0) {
  throw new Error("Usage: npm run analyze:balance -- <games> [seedStart]");
}

function zero() {
  return {
    games: 0,
    totalRuns: 0,
    hits: 0,
    homeRuns: 0,
    walks: 0,
    strikeouts: 0,
    extraInningGames: 0,
    homeWins: 0,
    batting: { pa: 0, ab: 0, h: 0, doubles: 0, triples: 0, hr: 0, bb: 0, so: 0, r: 0, rbi: 0 },
    pitching: { bf: 0, outs: 0, h: 0, r: 0, er: 0, bb: 0, so: 0, hr: 0 },
    starterOuts: 0,
    bullpenOuts: 0,
    worlds: 0,
    invariantIssues: 0,
  };
}

function addGame(summary, boxScore) {
  summary.games += 1;
  summary.totalRuns += boxScore.teams.home.runs + boxScore.teams.away.runs;
  summary.hits += boxScore.teams.home.hits + boxScore.teams.away.hits;
  summary.extraInningGames += boxScore.teams.home.inningRuns.length > 9 || boxScore.teams.away.inningRuns.length > 9 ? 1 : 0;
  summary.homeWins += boxScore.teams.home.runs > boxScore.teams.away.runs ? 1 : 0;

  for (const line of Object.values(boxScore.batters)) {
    summary.batting.pa += line.plateAppearances;
    summary.batting.ab += line.atBats;
    summary.batting.h += line.hits;
    summary.batting.doubles += line.doubles;
    summary.batting.triples += line.triples;
    summary.batting.hr += line.homeRuns;
    summary.batting.bb += line.walks;
    summary.batting.so += line.strikeouts;
    summary.batting.r += line.runs;
    summary.batting.rbi += line.runsBattedIn;
  }
  summary.homeRuns = summary.batting.hr;
  summary.walks = summary.batting.bb;
  summary.strikeouts = summary.batting.so;

  const pitchersByTeam = new Map();
  for (const line of Object.values(boxScore.pitchers)) {
    summary.pitching.bf += line.battersFaced;
    summary.pitching.outs += line.outsRecorded;
    summary.pitching.h += line.hits;
    summary.pitching.r += line.runs;
    summary.pitching.er += line.earnedRuns;
    summary.pitching.bb += line.walks;
    summary.pitching.so += line.strikeouts;
    summary.pitching.hr += line.homeRuns;
    const lines = pitchersByTeam.get(line.teamId) ?? [];
    lines.push(line);
    pitchersByTeam.set(line.teamId, lines);
  }
  for (const lines of pitchersByTeam.values()) {
    lines.forEach((line, index) => {
      if (index === 0) summary.starterOuts += line.outsRecorded;
      else summary.bullpenOuts += line.outsRecorded;
    });
  }
}

function rate(numerator, denominator) {
  return denominator ? numerator / denominator : 0;
}

function round(value, digits = 3) {
  return Number(value.toFixed(digits));
}

function finalize(summary, elapsedMs) {
  const b = summary.batting;
  const p = summary.pitching;
  const bases = b.h + b.doubles + b.triples * 2 + b.hr * 3;
  const innings = p.outs / 3;
  return {
    games: summary.games,
    worlds: summary.worlds,
    elapsedMs: Math.round(elapsedMs),
    invariantIssues: summary.invariantIssues,
    game: {
      runsPerGameBothTeams: round(rate(summary.totalRuns, summary.games)),
      runsPerTeamGame: round(rate(summary.totalRuns, summary.games * 2)),
      hitsPerGame: round(rate(summary.hits, summary.games)),
      homeRunsPerGame: round(rate(summary.homeRuns, summary.games)),
      walksPerGame: round(rate(summary.walks, summary.games)),
      strikeoutsPerGame: round(rate(summary.strikeouts, summary.games)),
      extraInningRate: round(rate(summary.extraInningGames, summary.games), 4),
      homeWinRate: round(rate(summary.homeWins, summary.games), 4),
    },
    batting: {
      avg: round(rate(b.h, b.ab)),
      obp: round(rate(b.h + b.bb, b.pa)),
      slg: round(rate(bases, b.ab)),
      ops: round(rate(b.h + b.bb, b.pa) + rate(bases, b.ab)),
      hrPerPa: round(rate(b.hr, b.pa), 4),
      bbPerPa: round(rate(b.bb, b.pa), 4),
      soPerPa: round(rate(b.so, b.pa), 4),
      babipApprox: round(rate(b.h - b.hr, b.ab - b.so - b.hr)),
    },
    pitching: {
      era: round(rate(p.er * 27, p.outs)),
      whip: round(rate(p.h + p.bb, innings)),
      k9: round(rate(p.so * 27, p.outs)),
      bb9: round(rate(p.bb * 27, p.outs)),
      hr9: round(rate(p.hr * 27, p.outs)),
      starterAverageIp: round(rate(summary.starterOuts, summary.games * 2) / 3),
      bullpenAverageIp: round(rate(summary.bullpenOuts, summary.games * 2) / 3),
    },
  };
}

const started = performance.now();
const summary = zero();
for (let worldIndex = 0; summary.games < targetGames; worldIndex += 1) {
  const bundle = createStandardSeedWorld(seedStart + worldIndex, { startMode: "UNEMPLOYED" });
  summary.worlds += 1;
  while (summary.games < targetGames) {
    const beforeCompleted = new Set(bundle.world.boxScores.keys());
    const result = bundle.world.advancePlayableDays(1, { ...stableOptions, userManagerId: bundle.userManagerId });
    if (result.daysAdvanced === 0 && result.blocked) throw new Error(result.message);
    const newBoxes = [...bundle.world.boxScores.values()].filter((box) => !beforeCompleted.has(box.gameId));
    for (const boxScore of newBoxes) {
      if (summary.games >= targetGames) break;
      addGame(summary, boxScore);
    }
    const latestSeason = [...bundle.world.seasons.values()][0];
    if (!latestSeason || bundle.world.clock.now() > latestSeason.regularSeasonEndDate) break;
  }
  summary.invariantIssues += bundle.world.validateInvariants().length;
}
console.log(JSON.stringify(finalize(summary, performance.now() - started), null, 2));
