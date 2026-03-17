import { describe, it, expect } from "vitest";
import fc from "fast-check";

/**
 * Extract the CURRENT (buggy) remaining calculation from swipe.tsx line ~36:
 *   const remaining = liked.length + (deck.length - currentIndex)
 */
function calculateRemaining(
  likedLength: number,
  deckLength: number,
  currentIndex: number,
): number {
  return likedLength + (deckLength - currentIndex);
}

/**
 * Extract the CURRENT (buggy) rem calculation from swipe.tsx handleSwipe line ~42:
 *   const rem = newLiked.length + (deck.length - newIndex)
 */
function calculateRem(
  newLikedLength: number,
  deckLength: number,
  newIndex: number,
): number {
  return newLikedLength + (deckLength - newIndex);
}

describe("Bug Condition Exploration: remaining count on right swipe", () => {
  /**
   * **Validates: Requirements 1.1, 1.2**
   *
   * Property 1: Bug Condition - After a right swipe, remaining should decrease by exactly 1.
   *
   * On right swipe:
   *   - newLikedLength = likedLength + 1
   *   - newIndex = currentIndex + 1
   *
   * We assert: calculateRemaining(newLikedLength, deckLength, newIndex) === calculateRemaining(likedLength, deckLength, currentIndex) - 1
   *
   * This WILL FAIL on the buggy formula because:
   *   remaining_before = likedLength + (deckLength - currentIndex)
   *   remaining_after  = (likedLength+1) + (deckLength - (currentIndex+1))
   *                    = likedLength + 1 + deckLength - currentIndex - 1
   *                    = likedLength + (deckLength - currentIndex)
   *                    = remaining_before  (no change!)
   *
   * Expected: remaining_after === remaining_before - 1
   * Actual:   remaining_after === remaining_before (bug!)
   */
  it("remaining should decrease by 1 after right swipe (EXPECTED TO FAIL on buggy code)", () => {
    fc.assert(
      fc.property(
        fc
          .integer({ min: 1, max: 50 })
          .chain((deckLength) =>
            fc.tuple(
              fc.constant(deckLength),
              fc.integer({ min: 0, max: deckLength - 1 }),
            ),
          )
          .chain(([deckLength, currentIndex]) =>
            fc.tuple(
              fc.constant(deckLength),
              fc.constant(currentIndex),
              fc.integer({ min: 0, max: currentIndex }),
            ),
          ),
        ([deckLength, currentIndex, likedLength]) => {
          const remainingBefore = calculateRemaining(
            likedLength,
            deckLength,
            currentIndex,
          );

          // Simulate right swipe
          const newLikedLength = likedLength + 1;
          const newIndex = currentIndex + 1;

          const remainingAfter = calculateRemaining(
            newLikedLength,
            deckLength,
            newIndex,
          );

          // remaining should decrease by exactly 1
          expect(remainingAfter).toBe(remainingBefore - 1);
        },
      ),
    );
  });

  /**
   * **Validates: Requirements 1.1, 1.2**
   *
   * Same bug condition for the `rem` variable inside handleSwipe.
   * calculateRem uses the same buggy formula.
   */
  it("rem should decrease by 1 after right swipe (EXPECTED TO FAIL on buggy code)", () => {
    fc.assert(
      fc.property(
        fc
          .integer({ min: 1, max: 50 })
          .chain((deckLength) =>
            fc.tuple(
              fc.constant(deckLength),
              fc.integer({ min: 0, max: deckLength - 1 }),
            ),
          )
          .chain(([deckLength, currentIndex]) =>
            fc.tuple(
              fc.constant(deckLength),
              fc.constant(currentIndex),
              fc.integer({ min: 0, max: currentIndex }),
            ),
          ),
        ([deckLength, currentIndex, likedLength]) => {
          const remBefore = calculateRem(likedLength, deckLength, currentIndex);

          // Simulate right swipe
          const newLikedLength = likedLength + 1;
          const newIndex = currentIndex + 1;

          const remAfter = calculateRem(newLikedLength, deckLength, newIndex);

          // rem should decrease by exactly 1
          expect(remAfter).toBe(remBefore - 1);
        },
      ),
    );
  });
});

/**
 * Fixed remaining calculation (what the code should use):
 *   remaining = deck.length - currentIndex
 */
function calculateRemainingFixed(
  deckLength: number,
  currentIndex: number,
): number {
  return deckLength - currentIndex;
}

describe("Preservation: left swipe and round transition behavior", () => {
  /**
   * **Validates: Requirements 3.1, 3.2**
   *
   * Property 2a: Left swipe does NOT change likedLength, so the current
   * (buggy) formula still produces a correct 1-decrement for left swipes.
   *
   * Before left swipe: remaining = likedLength + (deckLength - currentIndex)
   * After left swipe:  remaining = likedLength + (deckLength - (currentIndex + 1))
   *                              = previous - 1  ✓
   */
  it("remaining decreases by exactly 1 after left swipe", () => {
    fc.assert(
      fc.property(
        fc
          .integer({ min: 1, max: 50 })
          .chain((deckLength) =>
            fc.tuple(
              fc.constant(deckLength),
              fc.integer({ min: 0, max: deckLength - 1 }),
            ),
          )
          .chain(([deckLength, currentIndex]) =>
            fc.tuple(
              fc.constant(deckLength),
              fc.constant(currentIndex),
              fc.integer({ min: 0, max: currentIndex }),
            ),
          ),
        ([deckLength, currentIndex, likedLength]) => {
          const remainingBefore = calculateRemaining(
            likedLength,
            deckLength,
            currentIndex,
          );

          // Simulate left swipe: likedLength stays the same, index increments
          const newIndex = currentIndex + 1;

          const remainingAfter = calculateRemaining(
            likedLength,
            deckLength,
            newIndex,
          );

          expect(remainingAfter).toBe(remainingBefore - 1);
        },
      ),
    );
  });

  /**
   * **Validates: Requirements 3.4**
   *
   * Property 2b: At the start of any round (currentIndex=0, liked=[]),
   * remaining equals deckLength.
   */
  it("initial remaining at currentIndex=0 with liked=[] equals deckLength", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 50 }), (deckLength) => {
        const remaining = calculateRemaining(0, deckLength, 0);
        expect(remaining).toBe(deckLength);
      }),
    );
  });

  /**
   * **Validates: Requirements 3.1, 3.3**
   *
   * Property 2c: For left swipe, the original (buggy) formula and the fixed
   * formula produce the same result. This is because left swipe does not
   * change likedLength, so the liked.length term cancels out when comparing
   * before/after deltas.
   *
   * Specifically, for left swipe the decrement is:
   *   buggy:  (likedLength + (deckLength - currentIndex)) - (likedLength + (deckLength - (currentIndex+1))) = 1
   *   fixed:  (deckLength - currentIndex) - (deckLength - (currentIndex+1)) = 1
   *
   * Both formulas agree on the remaining value AFTER a left swipe when we
   * look at the delta. But more directly: for left swipe the buggy formula's
   * "after" value equals the fixed formula's "after" value plus likedLength.
   * Since we care about the CHANGE (delta = -1), both agree.
   *
   * We test: for left swipe, the change in remaining is the same for both formulas.
   */
  it("left swipe: original and fixed formula produce same remaining delta", () => {
    fc.assert(
      fc.property(
        fc
          .integer({ min: 1, max: 50 })
          .chain((deckLength) =>
            fc.tuple(
              fc.constant(deckLength),
              fc.integer({ min: 0, max: deckLength - 1 }),
            ),
          )
          .chain(([deckLength, currentIndex]) =>
            fc.tuple(
              fc.constant(deckLength),
              fc.constant(currentIndex),
              fc.integer({ min: 0, max: currentIndex }),
            ),
          ),
        ([deckLength, currentIndex, likedLength]) => {
          // Original (buggy) formula: before and after left swipe
          const originalBefore = calculateRemaining(
            likedLength,
            deckLength,
            currentIndex,
          );
          const originalAfter = calculateRemaining(
            likedLength,
            deckLength,
            currentIndex + 1,
          );
          const originalDelta = originalAfter - originalBefore;

          // Fixed formula: before and after left swipe
          const fixedBefore = calculateRemainingFixed(deckLength, currentIndex);
          const fixedAfter = calculateRemainingFixed(
            deckLength,
            currentIndex + 1,
          );
          const fixedDelta = fixedAfter - fixedBefore;

          // Both formulas agree: remaining decreases by 1 on left swipe
          expect(originalDelta).toBe(fixedDelta);
          expect(originalDelta).toBe(-1);
        },
      ),
    );
  });
});
