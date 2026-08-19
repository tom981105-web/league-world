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
}
