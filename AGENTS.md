# AGENTS.md — Codex Instructions

## Product

이 저장소는 **LEAGUE WORLD**를 구현한다.
가상의 전 세계 야구 생태계가 수십 시즌 동안 지속되는 시뮬레이션이며, 사용자는 Football Manager처럼 감독 커리어를 플레이할 수 있다.

## Non-negotiable rules

1. 선수의 커리어를 고정된 직선 루트로 구현하지 않는다.
   - 가능한 상태 전이 중 하나를 조건/확률/의사결정으로 선택한다.
   - 예: 중학 → 은퇴, 고교 → 대학, 고교 → 프로, 프로 2군 → 방출 → 독립리그 → 재입단 등.
2. 감독도 선수와 동일하게 독립적인 커리어 엔티티다.
   - 계약, 이직, 경질, 무직, 해외 리그 이동, 국가대표 감독을 지원한다.
3. 플레이어가 프로 구단 감독일 때는 재미를 위해 단장 기능도 함께 제공한다.
   - 선수 영입, 트레이드, FA, 계약, 드래프트, 콜업/강등, 로스터 관리 가능.
4. 세계의 중요한 변화는 이벤트로 기록한다.
   - 계약, 이적, 콜업, 부상, 은퇴, 감독 경질, 우승 등.
5. 기록은 삭제하지 않고 역사로 누적하는 것을 기본으로 한다.
6. UI를 만들기 전에 도메인 규칙과 World Engine의 재현 가능한 테스트를 우선한다.
7. 현실의 특정 구단/선수 데이터를 복사하지 않는다. 구조만 참고하고 세계관 데이터는 가상으로 만든다.

## Architecture direction

장기 목표:

- Web: Next.js + TypeScript
- DB: PostgreSQL
- ORM: Prisma 또는 동등한 타입 안전 ORM
- World Engine: 프레임워크와 분리된 순수 TypeScript 패키지
- Tests: deterministic seed 기반 시뮬레이션 테스트

초기 구현에서는 World Engine이 DB나 UI에 직접 의존하지 않도록 유지한다.

## Coding rules

- TypeScript strict mode.
- 도메인 ID는 문자열 branded type 또는 UUID 계열을 사용한다.
- 시뮬레이션에서 `Math.random()` 직접 호출 금지. seedable RNG 인터페이스를 주입한다.
- 날짜/시즌 변경은 WorldClock을 통해서만 수행한다.
- 선수/감독 상태 변경은 가능한 한 Event를 남긴다.
- 모든 커리어 변경은 사유(reason)를 보존한다.
- 대규모 리팩터링 전에 기존 테스트를 먼저 추가/갱신한다.

## First milestone

아래가 동작하면 v0.1로 본다.

- 국가/리그/팀 생성
- 선수/감독 생성
- WorldClock 하루 진행
- 선수의 비선형 커리어 전이
- 감독 취업/이직/경질
- 선수의 팀 이동
- 이벤트 히스토리 누적
- seed가 같으면 결과가 같은 테스트

자세한 제품 규칙은 `docs/PRODUCT_SPEC.md`, `docs/GAME_RULES.md`, `docs/DATA_MODEL.md`를 읽는다.
