# Game Rules v0.1

## 1. 시간

- WorldClock이 세계의 현재 날짜를 소유한다.
- 모든 경기/계약/이적/진학/은퇴는 날짜를 가진다.
- 하루, 7일, 월 단위 진행을 장기적으로 지원한다.

## 2. 선수

선수는 최소 다음 특성을 가진다.

- 기본 정보: 이름, 생년월일, 국적, 포지션, 투타
- 능력: 현재 능력(CA), 잠재력(PA)
- 신체/운동 능력(후속)
- 성격/야망/안정성/해외 선호도(후속)
- 현재 상태
- 현재 소속
- 계약
- 커리어 이력

### 선수 상태 예시

- STUDENT
- AMATEUR
- PROFESSIONAL
- FREE_AGENT
- INDEPENDENT
- RETIRED

상태는 단계가 아니라 현재 신분을 표현한다.

## 3. 비선형 커리어

커리어 전이는 아래 요소의 영향을 받는다.

- 나이
- 능력/잠재력
- 경기 기록
- 부상
- 소속팀 상황
- 계약
- 선수 성향
- 제안 받은 팀/학교
- 국가별 제도
- 무작위성(seed 기반)

어떤 단계도 필수 통과 지점으로 하드코딩하지 않는다.

## 4. 감독

감독도 독립적인 Person이다.

- 평판
- 전술 성향
- 육성 능력
- 선수단 관리 능력
- 계약 협상력(후속)
- 현재 소속
- 계약
- 커리어 이력

감독 상태:

- EMPLOYED
- UNEMPLOYED
- RETIRED

가능한 이벤트:

- HIRED
- CONTRACT_RENEWED
- MOVED_CLUB
- FIRED
- RESIGNED
- NATIONAL_TEAM_APPOINTMENT
- RETIRED

## 5. 감독 플레이 권한

프로팀 플레이어 감독은 FM 스타일 재미를 위해 감독+단장 혼합 권한을 가진다.

- 선수 영입
- 트레이드
- FA 협상
- 계약 갱신
- 방출
- 1/2군 이동
- 라인업
- 로테이션
- 드래프트
- 스카우팅

구단/리그 규칙에 따라 일부 권한 제한을 추후 지원한다.

## 6. 이벤트

세계에서 발생하는 중요한 사건은 WorldEvent로 남긴다.

최소 타입:

- PLAYER_CREATED
- PLAYER_MOVED
- PLAYER_RETIRED
- PLAYER_RELEASED
- PLAYER_PROMOTED
- PLAYER_DEMOTED
- MANAGER_HIRED
- MANAGER_MOVED
- MANAGER_FIRED
- MANAGER_RETIRED
- GAME_PLAYED
- SEASON_STARTED
- SEASON_ENDED

이 이벤트는 향후 NEWS/HISTORY/WIKI 자동 생성의 원천 데이터가 된다.
