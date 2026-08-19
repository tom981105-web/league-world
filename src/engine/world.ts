import type { Manager, Player, Team, WorldEvent } from "../domain/entities.js";
import type { EntityId, ISODate, WorldEventType } from "../domain/types.js";
import { WorldClock } from "./clock.js";
import type { RandomSource } from "./rng.js";

export class LeagueWorld {
  readonly players = new Map<EntityId, Player>();
  readonly managers = new Map<EntityId, Manager>();
  readonly teams = new Map<EntityId, Team>();
  readonly events: WorldEvent[] = [];

  constructor(
    readonly clock: WorldClock,
    readonly rng: RandomSource,
  ) {}

  addTeam(team: Team): void {
    this.teams.set(team.id, structuredClone(team));
  }

  addPlayer(player: Player): void {
    this.players.set(player.id, structuredClone(player));
    this.record("PLAYER_CREATED", {
      subjectId: player.id,
      ...(player.currentTeamId ? { teamId: player.currentTeamId } : {}),
    });
  }

  addManager(manager: Manager): void {
    this.managers.set(manager.id, structuredClone(manager));
    this.record("MANAGER_CREATED", {
      subjectId: manager.id,
      ...(manager.currentTeamId ? { teamId: manager.currentTeamId } : {}),
    });
  }

  movePlayer(playerId: EntityId, toTeamId: EntityId, reason: string): void {
    const player = this.requirePlayer(playerId);
    this.requireTeam(toTeamId);
    const fromTeamId = player.currentTeamId;
    player.currentTeamId = toTeamId;
    player.status = "PROFESSIONAL";
    this.record("PLAYER_MOVED", {
      subjectId: player.id,
      teamId: toTeamId,
      reason,
      payload: { fromTeamId, toTeamId },
    });
  }

  releasePlayer(playerId: EntityId, reason: string): void {
    const player = this.requirePlayer(playerId);
    const fromTeamId = player.currentTeamId;
    delete player.currentTeamId;
    player.status = "FREE_AGENT";
    this.record("PLAYER_RELEASED", {
      subjectId: player.id,
      reason,
      payload: { fromTeamId },
    });
  }

  retirePlayer(playerId: EntityId, reason: string): void {
    const player = this.requirePlayer(playerId);
    const fromTeamId = player.currentTeamId;
    delete player.currentTeamId;
    player.status = "RETIRED";
    this.record("PLAYER_RETIRED", {
      subjectId: player.id,
      reason,
      payload: { fromTeamId },
    });
  }

  hireManager(managerId: EntityId, teamId: EntityId, reason: string): void {
    const manager = this.requireManager(managerId);
    this.requireTeam(teamId);
    const previousTeamId = manager.currentTeamId;
    manager.currentTeamId = teamId;
    manager.status = "EMPLOYED";

    this.record(previousTeamId ? "MANAGER_MOVED" : "MANAGER_HIRED", {
      subjectId: manager.id,
      teamId,
      reason,
      payload: { fromTeamId: previousTeamId, toTeamId: teamId },
    });
  }

  fireManager(managerId: EntityId, reason: string): void {
    const manager = this.requireManager(managerId);
    const fromTeamId = manager.currentTeamId;
    delete manager.currentTeamId;
    manager.status = "UNEMPLOYED";
    this.record("MANAGER_FIRED", {
      subjectId: manager.id,
      reason,
      payload: { fromTeamId },
    });
  }

  private record(
    type: WorldEventType,
    data: Omit<WorldEvent, "id" | "date" | "type">,
    date: ISODate = this.clock.now(),
  ): void {
    this.events.push({
      id: `evt_${this.events.length + 1}`,
      date,
      type,
      ...data,
    });
  }

  private requirePlayer(id: EntityId): Player {
    const value = this.players.get(id);
    if (!value) throw new Error(`Player not found: ${id}`);
    return value;
  }

  private requireManager(id: EntityId): Manager {
    const value = this.managers.get(id);
    if (!value) throw new Error(`Manager not found: ${id}`);
    return value;
  }

  private requireTeam(id: EntityId): Team {
    const value = this.teams.get(id);
    if (!value) throw new Error(`Team not found: ${id}`);
    return value;
  }
}
