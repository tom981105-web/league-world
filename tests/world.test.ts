import { describe, expect, it } from "vitest";
import { LeagueWorld } from "../src/engine/world";
import { WorldClock } from "../src/engine/clock";
import { Mulberry32Random } from "../src/engine/rng";

function createWorld() {
  const world = new LeagueWorld(
    new WorldClock("2027-01-01"),
    new Mulberry32Random(2027),
  );
  world.addTeam({ id: "team_seoul", leagueId: "league_kr1", name: "Seoul Falcons", teamType: "CLUB" });
  world.addTeam({ id: "team_busan", leagueId: "league_kr1", name: "Busan Mariners", teamType: "CLUB" });
  return world;
}

describe("LeagueWorld", () => {
  it("keeps manager moves as history", () => {
    const world = createWorld();
    world.addManager({
      id: "mgr_1",
      name: "조계원",
      birthDate: "1998-11-05",
      nationalityCode: "KR",
      status: "UNEMPLOYED",
      reputation: 10,
    });

    world.hireManager("mgr_1", "team_seoul", "첫 프로 감독 계약");
    world.hireManager("mgr_1", "team_busan", "타 구단 감독직 제안 수락");

    expect(world.managers.get("mgr_1")?.currentTeamId).toBe("team_busan");
    expect(world.events.map((e) => e.type)).toContain("MANAGER_MOVED");
  });

  it("allows a player to retire without completing a fixed career ladder", () => {
    const world = createWorld();
    world.addPlayer({
      id: "player_1",
      name: "김도윤",
      birthDate: "2012-04-10",
      nationalityCode: "KR",
      primaryPosition: "SS",
      status: "STUDENT",
      currentAbility: 28,
      potentialAbility: 63,
    });

    world.retirePlayer("player_1", "중학교 재학 중 선수 생활 중단");

    expect(world.players.get("player_1")?.status).toBe("RETIRED");
    expect(world.events.at(-1)?.type).toBe("PLAYER_RETIRED");
  });
});
