import {
  deserializeWorld,
  serializeWorld,
  type EntityId,
  type LeagueWorld,
  type WorldSaveData,
} from "../index.js";
import type { SeedWorldResult } from "./seedWorld.js";
import type { SeedWorldPreset } from "./seedWorld.js";

export type SaveSlotKey = "autosave" | "slot1" | "slot2" | "slot3";

export interface WebSaveMetadata {
  slot: SaveSlotKey;
  name: string;
  savedAt: string;
  gameDate: string;
  managerName: string;
  currentOrganizationName: string;
  seasonName: string;
}

export interface WebSaveFile {
  saveVersion: 1;
  name: string;
  savedAt: string;
  app: {
    seed: number;
    preset?: SeedWorldPreset;
    userManagerId: EntityId;
    userTeamId: EntityId;
    seasonId: EntityId;
    competitionId: EntityId;
    draftId: EntityId;
  };
  world: WorldSaveData;
}

const storagePrefix = "league-world-save-v1";
export const saveSlots: SaveSlotKey[] = ["autosave", "slot1", "slot2", "slot3"];

export function createWebSave(bundle: SeedWorldResult, name: string): WebSaveFile {
  const world = bundle.world;
  const manager = world.managers.get(bundle.userManagerId);
  return {
    saveVersion: 1,
    name,
    savedAt: new Date().toISOString(),
    app: {
      seed: bundle.seed,
      preset: bundle.preset,
      userManagerId: bundle.userManagerId,
      userTeamId: bundle.userTeamId,
      seasonId: bundle.seasonId,
      competitionId: bundle.competitionId,
      draftId: bundle.draftId,
    },
    world: serializeWorld(world),
  };
}

export function restoreWebSave(save: unknown): SeedWorldResult {
  const parsed = parseWebSave(save);
  const world = deserializeWorld(parsed.world);
  return {
    world,
    userManagerId: parsed.app.userManagerId,
    userTeamId: parsed.app.userTeamId,
    seasonId: parsed.app.seasonId,
    competitionId: parsed.app.competitionId,
    draftId: parsed.app.draftId,
    seed: parsed.app.seed,
    preset: parsed.app.preset ?? "STANDARD",
  };
}

export function saveToLocalStorage(slot: SaveSlotKey, save: WebSaveFile): void {
  window.localStorage.setItem(storageKey(slot), JSON.stringify(save));
}

export function loadFromLocalStorage(slot: SaveSlotKey): WebSaveFile | undefined {
  const raw = window.localStorage.getItem(storageKey(slot));
  if (!raw) return undefined;
  return parseWebSave(JSON.parse(raw));
}

export function deleteLocalSave(slot: SaveSlotKey): void {
  window.localStorage.removeItem(storageKey(slot));
}

export function listLocalSaves(): Partial<Record<SaveSlotKey, WebSaveMetadata>> {
  const result: Partial<Record<SaveSlotKey, WebSaveMetadata>> = {};
  for (const slot of saveSlots) {
    try {
      const save = loadFromLocalStorage(slot);
      if (save) result[slot] = metadataForSave(slot, save);
    } catch {
      result[slot] = {
        slot,
        name: "손상된 저장",
        savedAt: "-",
        gameDate: "-",
        managerName: "-",
        currentOrganizationName: "-",
        seasonName: "-",
      };
    }
  }
  return result;
}

export function metadataForBundle(slot: SaveSlotKey, bundle: SeedWorldResult, name: string): WebSaveMetadata {
  return metadataForSave(slot, createWebSave(bundle, name));
}

export function metadataForSave(slot: SaveSlotKey, save: WebSaveFile): WebSaveMetadata {
  const world = save.world;
  const manager = world.managers.find((item) => item.id === save.app.userManagerId);
  const organization = manager?.currentOrganizationId
    ? world.organizations.find((item) => item.id === manager.currentOrganizationId)
    : undefined;
  const season = world.seasons.find((item) => item.id === save.app.seasonId);
  return {
    slot,
    name: save.name,
    savedAt: save.savedAt,
    gameDate: world.clock.currentDate,
    managerName: manager?.name ?? "-",
    currentOrganizationName: organization?.name ?? "무직",
    seasonName: season?.name ?? "-",
  };
}

export function parseWebSave(input: unknown): WebSaveFile {
  if (!input || typeof input !== "object") throw new Error("저장 데이터를 불러올 수 없습니다. 저장 파일이 객체가 아닙니다.");
  const save = input as Partial<WebSaveFile>;
  if (save.saveVersion !== 1) throw new Error(`저장 데이터를 불러올 수 없습니다. 지원하지 않는 저장 버전입니다: ${String(save.saveVersion)}`);
  if (!save.app || typeof save.app !== "object") throw new Error("저장 데이터를 불러올 수 없습니다. 앱 메타데이터가 없습니다.");
  if (!save.world || typeof save.world !== "object") throw new Error("저장 데이터를 불러올 수 없습니다. 월드 데이터가 없습니다.");
  for (const key of ["seed", "userManagerId", "userTeamId", "seasonId", "competitionId", "draftId"] as const) {
    if (save.app[key] === undefined || save.app[key] === "") {
      throw new Error(`저장 데이터를 불러올 수 없습니다. ${key} 값이 없습니다.`);
    }
  }
  return save as WebSaveFile;
}

export function downloadSave(save: WebSaveFile): void {
  const blob = new Blob([JSON.stringify(save, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${save.name.replace(/[^\w가-힣-]+/g, "_")}.league-save.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function readSaveFile(file: File): Promise<WebSaveFile> {
  const text = await file.text();
  return parseWebSave(JSON.parse(text));
}

export function hasAutosave(): boolean {
  return !!window.localStorage.getItem(storageKey("autosave"));
}

function storageKey(slot: SaveSlotKey): string {
  return `${storagePrefix}:${slot}`;
}

export function worldFromSave(save: WebSaveFile): LeagueWorld {
  return deserializeWorld(save.world);
}
