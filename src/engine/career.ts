import type { Manager, Player } from "../domain/entities.js";
import type { EntityId, ManagerStatus, PlayerStatus, WorldEventType } from "../domain/types.js";
import type { RandomSource } from "./rng.js";

export interface CareerOption {
  nextStatus: PlayerStatus;
  weight: number;
  reason: string;
  toTeamId?: EntityId;
  organizationNameSnapshot?: string;
  eventType?: Extract<
    WorldEventType,
    | "PLAYER_CAREER_CHANGED"
    | "PLAYER_MOVED"
    | "PLAYER_RELEASED"
    | "PLAYER_RETIRED"
    | "PLAYER_PROMOTED"
    | "PLAYER_DEMOTED"
  >;
}

export interface ManagerCareerOption {
  nextStatus: ManagerStatus;
  weight: number;
  reason: string;
  toTeamId?: EntityId;
  organizationNameSnapshot?: string;
  eventType?: Extract<
    WorldEventType,
    "MANAGER_HIRED" | "MANAGER_MOVED" | "MANAGER_FIRED" | "MANAGER_RETIRED"
  >;
}

/**
 * 커리어는 고정된 단계가 아니라 현재 상황에서 가능한 선택지 중 하나를 뽑는다.
 * 실제 확률 계산은 나이, 기록, 부상, 제안, 성향 등을 추가하면서 확장한다.
 */
export function chooseCareerOption(
  player: Player,
  rng: RandomSource,
  options: CareerOption[],
): CareerOption {
  if (player.status === "RETIRED") {
    throw new Error("Retired player cannot transition career");
  }
  if (options.length === 0) {
    throw new Error("At least one career option is required");
  }

  return chooseWeightedOption(options, rng, "Career options");
}

export function chooseManagerCareerOption(
  manager: Manager,
  rng: RandomSource,
  options: ManagerCareerOption[],
): ManagerCareerOption {
  if (manager.status === "RETIRED") {
    throw new Error("Retired manager cannot transition career");
  }
  if (options.length === 0) {
    throw new Error("At least one manager career option is required");
  }

  return chooseWeightedOption(options, rng, "Manager career options");
}

function chooseWeightedOption<T extends { weight: number }>(
  options: T[],
  rng: RandomSource,
  label: string,
): T {
  const positive = options.filter((option) => option.weight > 0);
  const total = positive.reduce((sum, option) => sum + option.weight, 0);
  if (total <= 0) throw new Error(`${label} must have positive total weight`);

  let roll = rng.next() * total;
  for (const option of positive) {
    roll -= option.weight;
    if (roll < 0) return option;
  }
  return positive[positive.length - 1]!;
}
