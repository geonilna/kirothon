# Issue 1: 프로젝트 쉘 + 모바일 레이아웃 스캐폴딩

## Parent PRD

[PRD.md](../PRD.md)

## What to build

모바일 우선 레이아웃 쉘을 구성하고, 서비스에 필요한 3개 라우트를 플레이스홀더로 생성한다. 기존 Header/Footer를 "뭐먹지" 서비스에 맞게 간소화하고, 전체 앱을 `max-w-md mx-auto` 컨테이너로 감싸서 데스크톱에서도 모바일 뷰를 유지한다. 교대 지역 음식점 JSON 데이터 파일도 함께 생성한다.

## Acceptance criteria

- [ ] 전체 앱이 `max-w-md mx-auto` 컨테이너로 감싸져 데스크톱에서 가운데 정렬된 모바일 뷰로 표시된다
- [ ] `/` 라우트에 지역 선택 플레이스홀더가 표시된다 ("교대" 고정)
- [ ] `/swipe` 라우트가 생성되어 플레이스홀더가 표시된다
- [ ] `/result` 라우트가 생성되어 플레이스홀더가 표시된다
- [ ] Header가 서비스명("뭐먹지")을 표시하도록 간소화된다
- [ ] `src/data/restaurants.json`에 교대 지역 음식점 데이터가 `{ name, category, imageUrl }` 형태로 포함된다
- [ ] 375px, 768px, 1440px 뷰포트에서 레이아웃이 깨지지 않는다

## Blocked by

None - can start immediately

## User stories addressed

- User story 1, 2
