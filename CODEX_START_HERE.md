# Codex 첫 작업

Codex에서 이 저장소를 열고 다음 순서로 진행한다.

## Task 1

`AGENTS.md`와 `docs/*`를 읽고 현재 World Engine skeleton을 검토하라.
그 다음 다음 요구사항을 구현하라.

1. Country와 League를 LeagueWorld가 직접 관리하도록 추가.
2. ID 생성기를 별도 인터페이스로 분리해 WorldEvent의 ID도 주입 가능하게 만들기.
3. 선수/감독의 CareerEntry 이력 저장 구조 추가.
4. 선수 이동, 방출, 은퇴, 감독 취업/이직/경질 시 CareerEntry와 WorldEvent가 동시에 정확히 남도록 구현.
5. 같은 seed와 같은 명령 순서에서 결과가 재현된다는 테스트 추가.
6. `npm test`와 `npm run typecheck`가 통과하도록 수정.

중요:
- 커리어를 단계형 상태 머신으로 고정하지 말 것.
- DB/UI는 아직 만들지 말고 World Engine을 순수 TypeScript로 유지할 것.
