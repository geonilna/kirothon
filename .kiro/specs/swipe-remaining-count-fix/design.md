# Swipe Remaining Count Bugfix Design

## Overview

스와이프 화면에서 오른쪽 스와이프(좋아요) 시 "{N}곳 남음" 카운트가 감소하지 않는 버그를 수정합니다. 현재 `remaining` 계산식이 `liked.length + (deck.length - currentIndex)`로 되어 있어, 좋아요 시 `liked.length` 증가분이 `currentIndex` 증가분을 상쇄합니다. `deck.length - currentIndex`로 변경하여 아직 스와이프하지 않은 카드 수만 표시하도록 합니다.

## Glossary

- **Bug_Condition (C)**: 오른쪽 스와이프(좋아요) 시 `remaining` 값이 감소하지 않는 조건 — `liked.length`가 계산식에 포함되어 `currentIndex` 증가를 상쇄
- **Property (P)**: 모든 스와이프(좌/우) 후 `remaining`이 정확히 1 감소해야 하는 기대 동작
- **Preservation**: 왼쪽 스와이프(패스), 라운드 전환, 결과 페이지 이동 등 기존 동작이 변경되지 않아야 함
- **remaining**: `Swipe` 컴포넌트에서 "{N}곳 남음" 텍스트에 표시되는 남은 식당 수
- **deck**: 현재 라운드에서 스와이프할 식당 배열
- **currentIndex**: 현재 표시 중인 카드의 인덱스
- **liked**: 현재 라운드에서 좋아요한 식당 배열
- **rem**: `handleSwipe` 함수 내부에서 다음 상태의 남은 수를 계산하는 로컬 변수

## Bug Details

### Bug Condition

오른쪽 스와이프(좋아요) 시 `liked` 배열에 현재 식당이 추가되면서 `liked.length`가 1 증가하고, 동시에 `currentIndex`도 1 증가합니다. `remaining = liked.length + (deck.length - currentIndex)` 공식에서 이 두 변화가 서로 상쇄되어 `remaining` 값이 변하지 않습니다.

동일한 문제가 `handleSwipe` 함수 내부의 `rem` 변수에도 존재합니다: `const rem = newLiked.length + (deck.length - newIndex)`. 이로 인해 라운드 종료 및 결과 페이지 이동 판단도 잘못될 수 있습니다.

**Formal Specification:**

```
FUNCTION isBugCondition(input)
  INPUT: input of type { direction: 'left' | 'right', currentIndex: number, deck: Restaurant[], liked: Restaurant[] }
  OUTPUT: boolean

  RETURN input.direction == 'right'
END FUNCTION
```

### Examples

- 12개 식당 덱, `currentIndex=0`, `liked=[]` → 표시: "12곳 남음". 오른쪽 스와이프 후 `currentIndex=1`, `liked=[1개]` → 기대: "11곳 남음", 실제: "12곳 남음" (버그)
- 12개 식당 덱, `currentIndex=3`, `liked=[2개]` → 표시: "11곳 남음". 오른쪽 스와이프 후 `currentIndex=4`, `liked=[3개]` → 기대: "8곳 남음", 실제: "11곳 남음" (버그)
- 12개 식당 덱, `currentIndex=0`, `liked=[]` → 표시: "12곳 남음". 왼쪽 스와이프 후 `currentIndex=1`, `liked=[]` → 표시: "11곳 남음" (정상 — liked 변화 없음)
- `handleSwipe` 내부 `rem` 계산도 동일한 공식을 사용하므로, 좋아요가 많을수록 `rem === 1` 판단이 지연되어 결과 페이지 이동 타이밍이 잘못됨

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**

- 왼쪽 스와이프(패스) 시 `remaining`이 1 감소하는 기존 동작 유지
- 모든 카드를 스와이프하고 좋아요한 식당이 2개 이상이면 새 라운드를 시작하는 동작 유지
- 남은 식당이 1곳이 되면 결과 페이지로 이동하는 동작 유지
- 새 라운드 시작 시 `remaining`이 새 덱 크기로 초기화되는 동작 유지

**Scope:**
`remaining` 및 `rem` 계산식만 변경합니다. 스와이프 방향 감지, 카드 UI, 라운드 전환 로직, 결과 페이지 이동 조건의 구조는 변경하지 않습니다.

## Hypothesized Root Cause

Based on the bug description, the most likely issue is:

1. **잘못된 remaining 계산식**: `PFC Technologies/src/routes/swipe.tsx`의 `Swipe` 컴포넌트에서 `remaining`이 `liked.length + (deck.length - currentIndex)`로 계산됩니다. `liked.length`는 "아직 스와이프하지 않은 카드 수"와 무관하며, 이를 포함시킨 것이 근본 원인입니다.
   - 컴포넌트 본문의 `const remaining = liked.length + (deck.length - currentIndex)` (약 36행)
   - `handleSwipe` 함수 내부의 `const rem = newLiked.length + (deck.length - newIndex)` (약 42행)

2. **의도 추정**: 원래 개발자가 "남은 식당"을 "좋아요한 식당 + 아직 안 본 식당"으로 해석했을 가능성이 있으나, 사용자 관점에서 "남은 식당"은 "아직 스와이프하지 않은 카드 수"를 의미합니다.

## Correctness Properties

Property 1: Bug Condition - 오른쪽 스와이프 시 remaining 감소

_For any_ swipe input where direction is 'right' (isBugCondition returns true), the fixed `remaining` calculation SHALL return `deck.length - currentIndex`, decreasing by exactly 1 after the swipe regardless of `liked.length`.

**Validates: Requirements 2.1, 2.2**

Property 2: Preservation - 왼쪽 스와이프 및 라운드 전환 동작 유지

_For any_ swipe input where direction is 'left' or any non-swipe state change (isBugCondition returns false), the fixed code SHALL produce the same `remaining` value and the same navigation/round-transition behavior as the original code, preserving pass count decrement, round restart, and result navigation.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `PFC Technologies/src/routes/swipe.tsx`

**Function**: `Swipe` component

**Specific Changes**:

1. **remaining 계산식 수정** (컴포넌트 본문):
   - Before: `const remaining = liked.length + (deck.length - currentIndex)`
   - After: `const remaining = deck.length - currentIndex`

2. **rem 계산식 수정** (`handleSwipe` 함수 내부):
   - Before: `const rem = newLiked.length + (deck.length - newIndex)`
   - After: `const rem = deck.length - newIndex`

두 곳 모두 `liked.length` / `newLiked.length` 항을 제거하여, 남은 카드 수가 순수하게 "아직 스와이프하지 않은 카드"만 반영하도록 합니다.

## Testing Strategy

### Validation Approach

테스트 전략은 두 단계로 진행합니다: 먼저 수정 전 코드에서 버그를 재현하는 반례를 확인하고, 수정 후 버그가 해결되었으며 기존 동작이 보존되는지 검증합니다.

### Exploratory Bug Condition Checking

**Goal**: 수정 전 코드에서 오른쪽 스와이프 시 `remaining`이 감소하지 않는 버그를 재현합니다.

**Test Plan**: `remaining` 계산 로직을 단위 테스트로 추출하여, 오른쪽 스와이프 전후의 값을 비교합니다. 수정 전 코드에서 실패를 확인합니다.

**Test Cases**:

1. **Right Swipe Remaining Test**: 오른쪽 스와이프 후 `remaining`이 감소하는지 확인 (수정 전 코드에서 실패)
2. **Right Swipe Button Remaining Test**: 좋아요 버튼 클릭 후 `remaining`이 감소하는지 확인 (수정 전 코드에서 실패)
3. **Multiple Right Swipes Test**: 연속 오른쪽 스와이프 시 `remaining`이 매번 1씩 감소하는지 확인 (수정 전 코드에서 실패)
4. **rem Navigation Test**: `handleSwipe` 내부 `rem`이 올바르게 계산되어 결과 페이지 이동 타이밍이 정확한지 확인 (수정 전 코드에서 실패 가능)

**Expected Counterexamples**:

- 오른쪽 스와이프 후 `remaining` 값이 변하지 않음
- 원인: `liked.length` 증가가 `currentIndex` 증가를 상쇄

### Fix Checking

**Goal**: 버그 조건에 해당하는 모든 입력에 대해 수정된 함수가 올바른 동작을 하는지 검증합니다.

**Pseudocode:**

```
FOR ALL input WHERE isBugCondition(input) DO
  result := calculateRemaining_fixed(input.deck, input.currentIndex)
  ASSERT result == input.deck.length - input.currentIndex

  // After swipe
  newIndex := input.currentIndex + 1
  newResult := calculateRemaining_fixed(input.deck, newIndex)
  ASSERT newResult == result - 1
END FOR
```

### Preservation Checking

**Goal**: 버그 조건에 해당하지 않는 모든 입력에 대해 수정된 함수가 기존과 동일한 결과를 내는지 검증합니다.

**Pseudocode:**

```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT calculateRemaining_original(input) == calculateRemaining_fixed(input)
END FOR
```

**Testing Approach**: 왼쪽 스와이프의 경우 원래 공식에서도 `liked.length`가 변하지 않으므로 `remaining`이 정상적으로 1 감소합니다. 따라서 왼쪽 스와이프에 대해서는 원래 코드와 수정된 코드의 결과가 동일합니다. Property-based testing으로 다양한 덱 크기와 인덱스 조합에서 이를 검증합니다.

**Test Cases**:

1. **Left Swipe Preservation**: 왼쪽 스와이프 후 `remaining`이 1 감소하는 기존 동작이 유지되는지 확인
2. **Round Transition Preservation**: 모든 카드 스와이프 후 좋아요 2개 이상이면 새 라운드가 시작되는지 확인
3. **Result Navigation Preservation**: 남은 식당이 1곳이 되면 결과 페이지로 이동하는지 확인
4. **Initial Remaining Preservation**: 새 라운드 시작 시 `remaining`이 덱 크기와 동일한지 확인

### Unit Tests

- 오른쪽 스와이프 후 `remaining` 감소 검증
- 왼쪽 스와이프 후 `remaining` 감소 검증
- 연속 스와이프(좌/우 혼합) 시 `remaining` 정확성 검증
- `handleSwipe` 내부 `rem` 기반 결과 페이지 이동 타이밍 검증
- 라운드 전환 시 `remaining` 초기화 검증

### Property-Based Tests

- 임의의 덱 크기(1~50)와 currentIndex(0~deck.length)에 대해 `remaining == deck.length - currentIndex` 검증
- 임의의 스와이프 시퀀스(좌/우 랜덤)에 대해 매 스와이프 후 `remaining`이 정확히 1 감소하는지 검증
- 왼쪽 스와이프에 대해 수정 전후 `remaining` 값이 동일한지 검증

### Integration Tests

- 전체 스와이프 플로우: 12개 식당 덱에서 좋아요/패스를 섞어 스와이프하며 "{N}곳 남음" 텍스트가 매번 정확히 감소하는지 확인
- 라운드 전환 플로우: 첫 라운드에서 여러 식당을 좋아요한 후 새 라운드가 시작되고 `remaining`이 올바르게 초기화되는지 확인
- 결과 이동 플로우: 좋아요를 반복하여 최종 1곳이 남았을 때 결과 페이지로 정상 이동하는지 확인
