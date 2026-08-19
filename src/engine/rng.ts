export interface RandomSource {
  next(): number;
  int(minInclusive: number, maxInclusive: number): number;
  chance(probability: number): boolean;
}

// 작고 결정론적인 초기 RNG. 추후 더 강한 구현으로 교체 가능.
export class Mulberry32Random implements RandomSource {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  int(minInclusive: number, maxInclusive: number): number {
    if (maxInclusive < minInclusive) {
      throw new Error("maxInclusive must be >= minInclusive");
    }
    return Math.floor(this.next() * (maxInclusive - minInclusive + 1)) + minInclusive;
  }

  chance(probability: number): boolean {
    if (probability <= 0) return false;
    if (probability >= 1) return true;
    return this.next() < probability;
  }

  getState(): number {
    return this.state >>> 0;
  }

  static fromState(state: number): Mulberry32Random {
    const rng = new Mulberry32Random(0);
    rng.state = state >>> 0;
    return rng;
  }
}
