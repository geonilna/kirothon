import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Heart, X, RotateCcw } from "lucide-react";
import SwipeCard from "../components/SwipeCard";
import type { Restaurant } from "../components/SwipeCard";
import data from "../data/restaurants.json";

declare module "@tanstack/history" {
  interface HistoryState {
    restaurant?: Restaurant;
  }
}

export const Route = createFileRoute("/swipe")({ component: Swipe });

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Swipe() {
  const navigate = useNavigate();
  const [deck, setDeck] = useState(() => shuffle(data as Restaurant[]));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [empty, setEmpty] = useState(false);

  const current = deck[currentIndex];

  function handleSwipe(direction: "left" | "right") {
    if (direction === "right") {
      navigate({ to: "/result", state: { restaurant: deck[currentIndex] } });
      return;
    }

    const newIndex = currentIndex + 1;
    if (newIndex >= deck.length) {
      setEmpty(true);
      return;
    }

    setCurrentIndex(newIndex);
  }

  function restart() {
    setDeck(shuffle(data as Restaurant[]));
    setCurrentIndex(0);
    setEmpty(false);
  }

  if (empty) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
        <RotateCcw className="mb-4 h-12 w-12 text-[var(--sea-ink-soft)]" />
        <p className="mb-2 text-lg font-semibold text-[var(--sea-ink)]">
          추천할 식당이 없습니다
        </p>
        <p className="mb-6 text-sm text-[var(--sea-ink-soft)]">
          다시 시도해주세요
        </p>
        <button
          onClick={restart}
          className="cursor-pointer rounded-full bg-[var(--lagoon-deep)] px-8 py-3 text-sm font-semibold text-white"
        >
          다시 시작하기
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-4">
      {current && (
        <SwipeCard
          key={`${currentIndex}-${current.name}`}
          restaurant={current}
          onSwipe={handleSwipe}
        />
      )}

      <div className="flex justify-center gap-6 py-6">
        <button
          onClick={() => handleSwipe("left")}
          aria-label="패스"
          className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-2 border-red-300 text-red-500 transition-colors hover:bg-red-50"
        >
          <X className="h-7 w-7" />
        </button>
        <button
          onClick={() => handleSwipe("right")}
          aria-label="좋아요"
          className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-2 border-green-300 text-green-500 transition-colors hover:bg-green-50"
        >
          <Heart className="h-7 w-7" />
        </button>
      </div>
    </div>
  );
}
