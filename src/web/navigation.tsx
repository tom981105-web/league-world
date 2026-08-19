import {
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  FileJson,
  Handshake,
  Home,
  ListChecks,
  Search,
  Shield,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";

export type Page =
  | "HOME"
  | "MANAGER"
  | "GAMES"
  | "STANDINGS"
  | "ROSTER"
  | "TEAMS"
  | "PLAYERS"
  | "PROSPECTS"
  | "SCOUTING"
  | "DRAFT"
  | "MARKET"
  | "RECORDS"
  | "EVENTS"
  | "SAVES";

export const pages: Page[] = ["HOME", "MANAGER", "GAMES", "STANDINGS", "ROSTER", "TEAMS", "PLAYERS", "PROSPECTS", "SCOUTING", "DRAFT", "MARKET", "RECORDS", "EVENTS", "SAVES"];

export type ManagerTab = "OVERVIEW" | "ROSTER" | "CAREER" | "JOBS" | "OFFERS";

export const managerTabs: Record<ManagerTab, string> = {
  OVERVIEW: "개요",
  ROSTER: "선수단",
  CAREER: "커리어",
  JOBS: "구직",
  OFFERS: "제안",
};

export function navIcon(page: Page) {
  const size = 16;
  if (page === "HOME") return <Home size={size} />;
  if (page === "MANAGER") return <UserRound size={size} />;
  if (page === "GAMES") return <CalendarDays size={size} />;
  if (page === "STANDINGS") return <BarChart3 size={size} />;
  if (page === "ROSTER") return <UsersRound size={size} />;
  if (page === "TEAMS") return <Shield size={size} />;
  if (page === "PLAYERS") return <UsersRound size={size} />;
  if (page === "PROSPECTS") return <Sparkles size={size} />;
  if (page === "SCOUTING") return <Search size={size} />;
  if (page === "DRAFT") return <ClipboardCheck size={size} />;
  if (page === "MARKET") return <Handshake size={size} />;
  if (page === "RECORDS") return <BarChart3 size={size} />;
  if (page === "SAVES") return <FileJson size={size} />;
  return <ListChecks size={size} />;
}
