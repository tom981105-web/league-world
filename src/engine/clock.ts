import type { ISODate } from "../domain/types";

export class WorldClock {
  private current: Date;

  constructor(startDate: ISODate) {
    this.current = new Date(`${startDate}T00:00:00.000Z`);
  }

  now(): ISODate {
    return this.current.toISOString().slice(0, 10) as ISODate;
  }

  advanceDays(days: number): ISODate {
    if (!Number.isInteger(days) || days < 0) {
      throw new Error("days must be a non-negative integer");
    }
    this.current.setUTCDate(this.current.getUTCDate() + days);
    return this.now();
  }
}
