'use client';

import { useState, useMemo, useCallback } from 'react';

export type BrushRange = {
  startIndex: number;
  endIndex: number;
  startRatio: number;
  endRatio: number;
};

type BrushRangeState<PartKey> = BrushRange & {
  targetId?: string;
  partKey: PartKey;
};

type UseBrushRangeOptions<PartKey> = {
  length: number;
  targetId?: string;
  partKey: PartKey;
  visibleCount?: number;
};

const createInitialBrushRange = (
  length: number,
  visibleCount: number,
): BrushRange | undefined => {
  if (length <= visibleCount) return undefined;

  const startIndex = length - visibleCount;
  const endIndex = length - 1;

  return {
    startIndex,
    endIndex,
    startRatio: startIndex / (length - 1),
    endRatio: 1,
  };
};

const rebaseBrushRange = (
  savedRange: BrushRange | undefined,
  length: number,
  visibleCount: number,
): BrushRange | undefined => {
  if (length <= visibleCount) return undefined;
  if (!savedRange) return createInitialBrushRange(length, visibleCount);

  const startIndex = Math.round(savedRange.startRatio * (length - 1));
  const endIndex = Math.round(savedRange.endRatio * (length - 1));

  if (startIndex >= endIndex) {
    return createInitialBrushRange(length, visibleCount);
  }

  return {
    startIndex,
    endIndex,
    startRatio: savedRange.startRatio,
    endRatio: savedRange.endRatio,
  };
};

export function useBrushRange<PartKey>({
  length,
  targetId,
  partKey,
  visibleCount = 10,
}: UseBrushRangeOptions<PartKey>) {
  const [savedBrushRange, setSavedBrushRange] = useState<
    BrushRangeState<PartKey> | undefined
  >();

  const brushRange = useMemo(() => {
    if (length < 2) return undefined;

    const reusableRange =
      savedBrushRange &&
      savedBrushRange.targetId === targetId &&
      savedBrushRange.partKey === partKey
        ? savedBrushRange
        : undefined;

    return rebaseBrushRange(reusableRange, length, visibleCount);
  }, [length, savedBrushRange, targetId, partKey, visibleCount]);

  const updateBrushRange = useCallback(
    (next: { startIndex: number; endIndex: number }) => {
      setSavedBrushRange({
        ...next,
        targetId,
        partKey,
        startRatio: next.startIndex / (length - 1),
        endRatio: next.endIndex / (length - 1),
      });
    },
    [targetId, partKey, length],
  );

  return { brushRange, updateBrushRange };
}
