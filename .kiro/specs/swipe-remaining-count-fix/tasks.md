# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - 오른쪽 스와이프 시 remaining 미감소 버그
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to right-swipe cases: for any deck size (1–50) and valid currentIndex, simulate a right swipe and assert remaining decreases by 1
  - Install `fast-check` as a dev dependency: `cd "PFC Technologies" && bun add -d fast-check`
  - Create test file `PFC Technologies/src/routes/swipe.test.ts`
  - Extract the buggy `remaining` calculation logic as a pure function for testing: `calculateRemaining(likedLength, deckLength, currentIndex) = likedLength + (deckLength - currentIndex)` (current buggy formula)
  - Also extract the buggy `rem` calculation: `calculateRem(newLikedLength, deckLength, newIndex) = newLikedLength + (deckLength - newIndex)`
  - Write property-based test using fast-check: for all `deckLength` in [1..50], `currentIndex` in [0..deckLength-1], `likedLength` in [0..currentIndex]:
    - Simulate right swipe: `newLikedLength = likedLength + 1`, `newIndex = currentIndex + 1`
    - Assert `calculateRemaining(newLikedLength, deckLength, newIndex) === calculateRemaining(likedLength, deckLength, currentIndex) - 1`
    - This assertion will FAIL on unfixed code because `liked.length` increase cancels out `currentIndex` increase
  - Run test on UNFIXED code: `cd "PFC Technologies" && bun run test`
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found (e.g., "calculateRemaining(1, 12, 1) === 12, but expected 11")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - 왼쪽 스와이프 및 라운드 전환 동작 유지
  - **IMPORTANT**: Follow observation-first methodology
  - Observe on UNFIXED code: left swipe does not change `liked.length`, so `remaining` correctly decreases by 1 with the current formula
  - Observe: `calculateRemaining(likedLength, deckLength, currentIndex)` with left swipe → `calculateRemaining(likedLength, deckLength, currentIndex + 1)` = previous - 1 (correct, since likedLength unchanged)
  - Observe: when `newIndex >= deck.length && newLiked.length > 1`, round restarts with shuffled liked array as new deck, currentIndex=0, liked=[] → remaining = new deck.length
  - Observe: when `rem === 1`, navigates to result page
  - Write property-based test using fast-check in `PFC Technologies/src/routes/swipe.test.ts`:
    - Property: for all `deckLength` in [1..50], `currentIndex` in [0..deckLength-1], `likedLength` in [0..currentIndex], left swipe produces `remaining` that is exactly 1 less than before (likedLength stays same, currentIndex increments)
    - Property: initial remaining at `currentIndex=0` with `liked=[]` equals `deckLength`
    - Property: for left swipe, original formula and fixed formula produce same result (since likedLength is unchanged)
  - Verify tests PASS on UNFIXED code: `cd "PFC Technologies" && bun run test`
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3. Fix remaining count calculation bug
  - [x] 3.1 Implement the fix
    - In `PFC Technologies/src/routes/swipe.tsx`, change `const remaining = liked.length + (deck.length - currentIndex)` to `const remaining = deck.length - currentIndex`
    - In `PFC Technologies/src/routes/swipe.tsx`, change `const rem = newLiked.length + (deck.length - newIndex)` to `const rem = deck.length - newIndex`
    - Remove `liked.length` / `newLiked.length` from both calculations so remaining reflects only unswiped cards
    - _Bug_Condition: isBugCondition(input) where input.direction == 'right'_
    - _Expected_Behavior: remaining = deck.length - currentIndex, decreasing by exactly 1 after any swipe_
    - _Preservation: Left swipe remaining decrement, round restart with new deck, result navigation at rem===1, initial remaining equals deck.length_
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.2, 3.3, 3.4_

  - [x] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - 오른쪽 스와이프 시 remaining 감소
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test: `cd "PFC Technologies" && bun run test`
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2_

  - [x] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - 왼쪽 스와이프 및 라운드 전환 동작 유지
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests: `cd "PFC Technologies" && bun run test`
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

- [x] 4. Checkpoint - Ensure all tests pass
  - Run full test suite: `cd "PFC Technologies" && bun run test`
  - Ensure all tests pass, ask the user if questions arise.
