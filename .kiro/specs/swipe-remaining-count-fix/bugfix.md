# Bugfix Requirements Document

## Introduction

스와이프 화면에서 "{N}곳 남음" 텍스트에 표시되는 남은 식당 수가 오른쪽 스와이프(좋아요) 시 감소하지 않는 버그를 수정합니다. 사용자는 스와이프할 때마다 남은 카드 수가 줄어드는 것을 기대하지만, 좋아요를 누르면 `liked` 배열이 증가하면서 `currentIndex` 증가분을 상쇄하여 `remaining` 값이 변하지 않습니다.

## Bug Analysis

### Current Behavior (Defect)

현재 `remaining`은 `liked.length + (deck.length - currentIndex)`로 계산됩니다. 오른쪽 스와이프 시 `liked.length`가 1 증가하고 `currentIndex`도 1 증가하여 서로 상쇄되므로, 표시되는 숫자가 줄어들지 않습니다.

1.1 WHEN 사용자가 오른쪽으로 스와이프(좋아요)하면 THEN 시스템은 "{N}곳 남음" 텍스트의 숫자를 감소시키지 않는다 (liked.length 증가가 currentIndex 증가를 상쇄)
1.2 WHEN 사용자가 좋아요 버튼을 클릭하면 THEN 시스템은 "{N}곳 남음" 텍스트의 숫자를 감소시키지 않는다 (liked.length 증가가 currentIndex 증가를 상쇄)

### Expected Behavior (Correct)

`remaining`은 현재 라운드에서 아직 스와이프하지 않은 카드 수만 나타내야 합니다. 즉, `deck.length - currentIndex`로 계산되어야 합니다.

2.1 WHEN 사용자가 오른쪽으로 스와이프(좋아요)하면 THEN 시스템은 "{N}곳 남음" 텍스트의 숫자를 1 감소시켜야 한다 (SHALL)
2.2 WHEN 사용자가 좋아요 버튼을 클릭하면 THEN 시스템은 "{N}곳 남음" 텍스트의 숫자를 1 감소시켜야 한다 (SHALL)

### Unchanged Behavior (Regression Prevention)

좋아요 외의 동작에서 기존 동작이 유지되어야 합니다.

3.1 WHEN 사용자가 왼쪽으로 스와이프(패스)하면 THEN 시스템은 "{N}곳 남음" 텍스트의 숫자를 1 감소시키는 기존 동작을 유지해야 한다 (SHALL CONTINUE TO)
3.2 WHEN 현재 라운드의 모든 카드를 스와이프하고 좋아요한 식당이 2개 이상이면 THEN 시스템은 좋아요한 식당들로 새 덱을 셔플하여 다음 라운드를 시작하는 기존 동작을 유지해야 한다 (SHALL CONTINUE TO)
3.3 WHEN 남은 식당이 1곳이 되면 THEN 시스템은 결과 페이지로 이동하는 기존 동작을 유지해야 한다 (SHALL CONTINUE TO)
3.4 WHEN 새 라운드가 시작되면 THEN 시스템은 "{N}곳 남음" 텍스트를 새 덱의 카드 수로 초기화하는 기존 동작을 유지해야 한다 (SHALL CONTINUE TO)
