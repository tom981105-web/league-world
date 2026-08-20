import {
  LeagueWorld,
  Mulberry32Random,
  WorldClock,
  type EntityId,
  type ISODate,
} from "../../index.js";
import type { RealDataValidationReport, RealWorldSnapshot, RealWorldSnapshotMetadata } from "./types.js";

export interface RealWorldImportResult {
  world: LeagueWorld;
  metadata: RealWorldSnapshotMetadata;
  validation: RealDataValidationReport;
}

export function loadRealWorldSnapshot(snapshot: RealWorldSnapshot, seed = 2026): RealWorldImportResult {
  const validation = validateRealWorldSnapshot(snapshot);
  if (!validation.valid) {
    throw new Error(`Real world snapshot is invalid: ${validation.errors.join("; ")}`);
  }
  const world = new LeagueWorld(new WorldClock(`${snapshot.seasonYear}-03-01` as ISODate), new Mulberry32Random(seed));
  world.realWorldSnapshot = metadataForSnapshot(snapshot);

  for (const country of snapshot.countries) {
    world.addCountry({
      id: country.id,
      code: country.code,
      name: country.displayName,
      displayName: country.displayName,
      currencyCode: country.currencyCode,
      baseballRegion: country.baseballRegion,
      playableStatus: country.playableStatus,
      leagueIds: snapshot.leagues.filter((league) => league.countryId === country.id).map((league) => league.id),
    });
  }
  for (const league of snapshot.leagues) {
    const storedLeague = {
      ...league,
      ...(league.subdivisions ? { subdivisions: league.subdivisions.map((division) => ({ ...division })) } : {}),
    };
    world.addLeague(storedLeague);
  }
  for (const organization of snapshot.organizations) {
    world.addOrganization({ ...organization });
  }
  for (const team of snapshot.teams) {
    world.addTeam({
      ...team,
      teamType: "CLUB",
      rosterLevel: team.levelOrder,
      rosterLevelName: team.levelName,
    });
  }
  for (const player of snapshot.players) {
    if (!player.birthDate || !player.primaryPosition) continue;
    const organization = player.organizationId ? world.organizations.get(player.organizationId) : undefined;
    const playerId = internalPlayerId(snapshot.id, player.externalIds);
    const sourceName = Object.keys(player.externalIds)[0];
    world.addPlayer({
      id: playerId,
      name: player.displayName,
      ...(player.legalName ? { legalName: player.legalName } : {}),
      displayName: player.displayName,
      externalIds: player.externalIds,
      birthDate: player.birthDate,
      nationalityCode: player.nationalityCode,
      ...(player.bats ? { bats: player.bats } : {}),
      ...(player.throws ? { throws: player.throws } : {}),
      primaryPosition: player.primaryPosition,
      secondaryPositions: player.secondaryPositions ?? [],
      ...(player.heightCm ? { heightCm: player.heightCm } : {}),
      ...(player.weightKg ? { weightKg: player.weightKg } : {}),
      ...(player.jerseyNumber ? { jerseyNumber: player.jerseyNumber } : {}),
      status: player.status ?? "PROFESSIONAL",
      currentAbility: 45,
      potentialAbility: 55,
      ...(player.teamId ? { currentTeamId: player.teamId } : {}),
      ...(player.organizationId ? { currentOrganizationId: player.organizationId } : {}),
      ...(player.rosterLevel ? { currentRosterLevel: player.rosterLevel } : {}),
      realWorld: {
        snapshotId: snapshot.id,
        snapshotYear: snapshot.seasonYear,
        source: "REAL",
        ...(sourceName ? { sourceName } : {}),
        provenance: "imported factual player row",
      },
      ratingMetadata: {
        ratingModelVersion: "real-v1-placeholder",
        source: "HEURISTIC",
        derivedFrom: ["real factual row"],
      },
      nationality: player.nationalityCode,
      rosterAssignments: [],
      contracts: [],
      careerEntries: organization
        ? [{
            id: `real_history_${playerId}`,
            personId: playerId,
            personType: "PLAYER",
            ...(player.teamId ? { teamId: player.teamId } : {}),
            organizationNameSnapshot: organization.displayName ?? organization.name,
            role: player.primaryPosition,
            status: player.status ?? "PROFESSIONAL",
            startDate: `${snapshot.seasonYear}-01-01` as ISODate,
            reason: "real-world snapshot import",
            historySource: "REAL",
          }]
        : [],
    } satisfies Parameters<LeagueWorld["addPlayer"]>[0]);
  }

  world.assertInvariants();
  return { world, metadata: world.realWorldSnapshot, validation };
}

export function validateRealWorldSnapshot(snapshot: RealWorldSnapshot): RealDataValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const countryIds = new Set(snapshot.countries.map((country) => country.id));
  const leagueIds = new Set(snapshot.leagues.map((league) => league.id));
  const organizationIds = new Set(snapshot.organizations.map((organization) => organization.id));
  const teamIds = new Set(snapshot.teams.map((team) => team.id));
  const externalPlayerKeys = new Set<string>();

  checkDuplicate("country", snapshot.countries.map((country) => country.id), errors);
  checkDuplicate("league", snapshot.leagues.map((league) => league.id), errors);
  checkDuplicate("organization", snapshot.organizations.map((organization) => organization.id), errors);
  checkDuplicate("team", snapshot.teams.map((team) => team.id), errors);

  for (const league of snapshot.leagues) {
    if (!countryIds.has(league.countryId)) errors.push(`League ${league.id} references unknown country ${league.countryId}`);
    if (league.parentLeagueId && !leagueIds.has(league.parentLeagueId)) errors.push(`League ${league.id} references unknown parent league ${league.parentLeagueId}`);
    for (const subdivision of league.subdivisions ?? []) {
      if (subdivision.parentSubdivisionId && !(league.subdivisions ?? []).some((candidate) => candidate.id === subdivision.parentSubdivisionId)) {
        errors.push(`Subdivision ${subdivision.id} references unknown parent subdivision ${subdivision.parentSubdivisionId}`);
      }
    }
  }
  for (const organization of snapshot.organizations) {
    if (!countryIds.has(organization.countryId)) errors.push(`Organization ${organization.id} references unknown country ${organization.countryId}`);
    if (!leagueIds.has(organization.primaryLeagueId)) errors.push(`Organization ${organization.id} references unknown primary league ${organization.primaryLeagueId}`);
  }
  for (const team of snapshot.teams) {
    if (!leagueIds.has(team.leagueId)) errors.push(`Team ${team.id} references unknown league ${team.leagueId}`);
    if (!organizationIds.has(team.organizationId)) errors.push(`Team ${team.id} references unknown organization ${team.organizationId}`);
    if (team.parentTeamId && !teamIds.has(team.parentTeamId)) errors.push(`Team ${team.id} references unknown parent team ${team.parentTeamId}`);
    const organization = snapshot.organizations.find((candidate) => candidate.id === team.organizationId);
    const league = snapshot.leagues.find((candidate) => candidate.id === team.leagueId);
    const isCanadianMlbSystem = organization?.countryId === "country_ca" && (league?.id === "real_league_mlb" || league?.parentLeagueId === "real_league_mlb");
    if (organization && league && organization.countryId !== league.countryId && !isCanadianMlbSystem) {
      errors.push(`Team ${team.id} has organization/country mismatch`);
    }
  }
  for (const player of snapshot.players) {
    const externalKey = Object.entries(player.externalIds).map(([source, id]) => `${source}:${id}`).sort().join("|");
    if (!externalKey) errors.push(`Player ${player.displayName} has no external ID`);
    if (externalPlayerKeys.has(externalKey)) errors.push(`Duplicate player external ID ${externalKey}`);
    externalPlayerKeys.add(externalKey);
    if (!countryIds.has(`country_${player.nationalityCode.toLowerCase()}`)) warnings.push(`Player ${player.displayName} has nationality not in country catalog: ${player.nationalityCode}`);
    if (player.teamId && !teamIds.has(player.teamId)) errors.push(`Player ${player.displayName} references unknown team ${player.teamId}`);
    if (player.organizationId && !organizationIds.has(player.organizationId)) errors.push(`Player ${player.displayName} references unknown organization ${player.organizationId}`);
    if (player.birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(player.birthDate)) errors.push(`Player ${player.displayName} has invalid birthDate ${player.birthDate}`);
    if (!player.birthDate) warnings.push(`Player ${player.displayName} missing birthDate; row will not be imported into LeagueWorld yet`);
    if (!player.primaryPosition) warnings.push(`Player ${player.displayName} missing primaryPosition; row will not be imported into LeagueWorld yet`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    counts: {
      countries: snapshot.countries.length,
      leagues: snapshot.leagues.length,
      organizations: snapshot.organizations.length,
      teams: snapshot.teams.length,
      players: snapshot.players.length,
    },
    missing: {
      kboPlayers: snapshot.players.filter((player) => player.organizationId?.startsWith("real_org_kbo_")).length,
      mlbPlayers: snapshot.players.filter((player) => player.organizationId?.startsWith("real_org_mlb_")).length,
      npbPlayers: snapshot.players.filter((player) => player.organizationId?.startsWith("real_org_npb_")).length,
    },
  };
}

function metadataForSnapshot(snapshot: RealWorldSnapshot): RealWorldSnapshotMetadata {
  return {
    snapshotId: snapshot.id,
    snapshotYear: snapshot.seasonYear,
    snapshotDate: snapshot.snapshotDate,
    label: snapshot.label,
    playerDataStatus: snapshot.playerDataStatus,
  };
}

function internalPlayerId(snapshotId: EntityId, externalIds: Record<string, string>): EntityId {
  const [source, id] = Object.entries(externalIds).sort()[0] ?? ["unknown", "missing"];
  return `${snapshotId}_player_${source}_${id}`.replace(/[^a-zA-Z0-9_]/g, "_");
}

function checkDuplicate(label: string, ids: EntityId[], errors: string[]): void {
  const seen = new Set<EntityId>();
  for (const id of ids) {
    if (seen.has(id)) errors.push(`Duplicate ${label} ID ${id}`);
    seen.add(id);
  }
}
