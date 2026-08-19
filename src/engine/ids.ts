import type { EntityId } from "../domain/types.js";

export interface IdGenerator {
  nextId(prefix: string): EntityId;
}

export class SequentialIdGenerator implements IdGenerator {
  private readonly counters = new Map<string, number>();

  nextId(prefix: string): EntityId {
    const nextValue = (this.counters.get(prefix) ?? 0) + 1;
    this.counters.set(prefix, nextValue);
    return `${prefix}_${nextValue}`;
  }

  getState(): Record<string, number> {
    return Object.fromEntries(this.counters);
  }

  static fromState(state: Record<string, number>): SequentialIdGenerator {
    const ids = new SequentialIdGenerator();
    for (const [prefix, value] of Object.entries(state)) {
      ids.counters.set(prefix, value);
    }
    return ids;
  }
}
