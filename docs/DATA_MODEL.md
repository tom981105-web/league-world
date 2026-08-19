# Data Model Draft v0.1

## 핵심 엔티티

### Country
- id
- code
- name

### League
- id
- countryId
- name
- level
- category: PROFESSIONAL | AMATEUR | INDEPENDENT | INTERNATIONAL

### Team
- id
- leagueId
- name
- teamType: CLUB | SCHOOL | NATIONAL
- parentTeamId? (2군/마이너 계열 관계)

### Player
- id
- name
- birthDate
- nationalityCode
- primaryPosition
- status
- currentAbility
- potentialAbility
- currentTeamId?

### Manager
- id
- name
- birthDate
- nationalityCode
- status
- reputation
- currentTeamId?

### Contract
- id
- personId
- teamId
- role
- startDate
- endDate
- salary
- currency
- status

### CareerEntry
선수와 감독의 이력을 공통적으로 표현하는 장기 후보 모델.

- id
- personId
- personType
- teamId?
- organizationNameSnapshot
- role/status
- startDate
- endDate?
- reason

### WorldEvent
- id
- date
- type
- actorId?
- subjectId?
- teamId?
- payload

### Season
- id
- leagueId
- year
- status

### Game
- id
- seasonId
- date
- homeTeamId
- awayTeamId
- status
- score

## 중요 설계 원칙

- 과거 소속팀 이름이 변경되어도 역사 표시는 깨지지 않도록 snapshot 필드 고려.
- 선수의 현재 상태와 이력은 분리한다.
- 사건(Event)은 이후 뉴스 자동 생성에 사용한다.
- 1군/2군/마이너 관계는 단순 숫자 level뿐 아니라 parentTeamId/organization 구조를 고려한다.
