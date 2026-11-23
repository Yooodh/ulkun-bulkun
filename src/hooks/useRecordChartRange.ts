import { useEffect, useMemo, useRef, useState } from 'react';
import {
  getSeoulDayEnd,
  parseDateValue,
  toSeoulInputDate,
} from '@/utils/dateUtils';

type TimedPoint = { timestamp: number };
type Range = { startIndex: number; endIndex: number };
export type RangePreset =
  | 'all'
  | '1m'
  | '3m'
  | '6m'
  | '1y'
  | 'custom'
  | 'adjusted';

export const RANGE_PRESETS: { key: RangePreset; label: string }[] = [
  { key: '1m', label: '1개월' },
  { key: '3m', label: '3개월' },
  { key: '6m', label: '6개월' },
  { key: '1y', label: '1년' },
  { key: 'all', label: '전체' },
];

export const RANGE_OPTIONS: { key: RangePreset; label: string }[] = [
  ...RANGE_PRESETS,
  { key: 'custom', label: '기간 선택' },
  { key: 'adjusted', label: '직접 조정' },
];

const RANGE_MONTHS: Partial<Record<RangePreset, number>> = {
  '1m': 1,
  '3m': 3,
  '6m': 6,
  '1y': 12,
};

function getPresetRange(data: TimedPoint[], preset: RangePreset): Range {
  const endIndex = Math.max(0, data.length - 1);
  if (preset === 'all' || data.length < 2) {
    return { startIndex: 0, endIndex };
  }

  const monthCount = RANGE_MONTHS[preset];
  if (!monthCount) return { startIndex: 0, endIndex };

  const [year, month, day] = toSeoulInputDate(
    new Date(data[endIndex].timestamp),
  )
    .split('-')
    .map(Number);
  const targetMonth = year * 12 + month - 1 - monthCount;
  const targetYear = Math.floor(targetMonth / 12);
  const targetMonthIndex = targetMonth - targetYear * 12;
  const lastDayOfTargetMonth = new Date(
    Date.UTC(targetYear, targetMonthIndex + 1, 0),
  ).getUTCDate();
  const cutoffDate = `${targetYear}-${String(targetMonthIndex + 1).padStart(2, '0')}-${String(Math.min(day, lastDayOfTargetMonth)).padStart(2, '0')}`;
  const cutoffTime = parseDateValue(cutoffDate).getTime();
  const foundIndex = data.findIndex((point) => point.timestamp >= cutoffTime);
  return { startIndex: Math.max(0, foundIndex), endIndex };
}

function getTouchDistance(
  first: { clientX: number; clientY: number },
  second: { clientX: number; clientY: number },
) {
  return Math.hypot(
    first.clientX - second.clientX,
    first.clientY - second.clientY,
  );
}

function suppressChartEvent(
  event: React.SyntheticEvent,
  preventDefault = true,
) {
  event.stopPropagation();
  if (preventDefault) event.preventDefault();
}

// 범위 effect가 데이터 변경 시에만 실행되도록 호출부에서 chartData를 메모이즈해야 함
export function useRecordChartRange<T extends TimedPoint>(chartData: T[]) {
  const [rangePreset, setRangePreset] = useState<RangePreset>('3m');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [storedRange, setStoredRange] = useState<Range>({
    startIndex: 0,
    endIndex: 0,
  });
  const range = useMemo(
    () =>
      rangePreset === 'custom' || rangePreset === 'adjusted'
        ? storedRange
        : getPresetRange(chartData, rangePreset),
    [chartData, rangePreset, storedRange],
  );
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [isGestureActive, setIsGestureActive] = useState(false);
  const touchGestureRef = useRef(false);
  const suppressClickRef = useRef(false);
  const touchRef = useRef<{
    distance: number;
    count: number;
    isPinching: boolean;
    startX: number;
    startIndex: number;
  } | null>(null);
  const mouseDragRef = useRef<{
    pointerId: number;
    startX: number;
    startIndex: number;
    count: number;
    moved: boolean;
  } | null>(null);
  const previousChartDataRef = useRef(chartData);

  useEffect(() => {
    if (rangePreset !== 'custom' && rangePreset !== 'adjusted') {
      previousChartDataRef.current = chartData;
      return;
    }

    const previousData = previousChartDataRef.current;
    setStoredRange((currentRange) => {
      if (chartData.length === 0) {
        return currentRange.startIndex === 0 && currentRange.endIndex === 0
          ? currentRange
          : { startIndex: 0, endIndex: 0 };
      }

      const previousStart = previousData[currentRange.startIndex]?.timestamp;
      const previousEnd = previousData[currentRange.endIndex]?.timestamp;
      let startIndex = currentRange.startIndex;
      let endIndex = currentRange.endIndex;

      if (
        previousData !== chartData &&
        previousStart != null &&
        previousEnd != null
      ) {
        startIndex = chartData.findIndex(
          (point) => point.timestamp >= previousStart,
        );
        endIndex = -1;
        for (let index = chartData.length - 1; index >= 0; index -= 1) {
          if (chartData[index].timestamp <= previousEnd) {
            endIndex = index;
            break;
          }
        }
        if (startIndex < 0 || endIndex < startIndex) {
          startIndex = currentRange.startIndex;
          endIndex = currentRange.endIndex;
        }
      }

      const lastIndex = chartData.length - 1;
      const safeStart = Math.max(0, Math.min(lastIndex, startIndex));
      const safeEnd = Math.max(safeStart, Math.min(lastIndex, endIndex));
      return currentRange.startIndex === safeStart &&
        currentRange.endIndex === safeEnd
        ? currentRange
        : { startIndex: safeStart, endIndex: safeEnd };
    });
    previousChartDataRef.current = chartData;
  }, [chartData, rangePreset]);

  const setPresetRange = (preset: RangePreset) => {
    setRangePreset(preset);
    setIsDatePickerOpen(preset === 'custom');
    if (preset === 'custom' || preset === 'adjusted') {
      setStoredRange(range);
      return;
    }
  };

  const updateRangeFromGesture = (startIndex: number, count: number) => {
    setRangePreset('adjusted');
    const safeCount = Math.max(1, Math.min(chartData.length, count));
    const safeStart = Math.max(
      0,
      Math.min(chartData.length - safeCount, startIndex),
    );
    const endIndex = safeStart + safeCount - 1;
    setStoredRange((currentRange) =>
      currentRange.startIndex === safeStart &&
      currentRange.endIndex === endIndex
        ? currentRange
        : { startIndex: safeStart, endIndex },
    );
    setIsDatePickerOpen(false);
  };

  const shiftRange = (direction: -1 | 1) => {
    const count = range.endIndex - range.startIndex + 1;
    const step = Math.max(1, Math.round(count / 2));
    updateRangeFromGesture(range.startIndex + direction * step, count);
  };

  const jumpRange = (position: 'start' | 'end') => {
    const count = range.endIndex - range.startIndex + 1;
    updateRangeFromGesture(
      position === 'start' ? 0 : chartData.length - count,
      count,
    );
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchGestureRef.current = false;
    if (event.touches.length === 2) {
      touchGestureRef.current = true;
      setIsGestureActive(true);
      touchRef.current = {
        distance: getTouchDistance(event.touches[0], event.touches[1]),
        count: range.endIndex - range.startIndex + 1,
        isPinching: true,
        startX: 0,
        startIndex: range.startIndex,
      };
      return;
    }

    if (event.touches.length === 1) {
      touchRef.current = {
        distance: 0,
        count: range.endIndex - range.startIndex + 1,
        isPinching: false,
        startX: event.touches[0].clientX,
        startIndex: range.startIndex,
      };
    }
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = touchRef.current;
    if (!touch) return;

    if (event.touches.length === 2 && touch.distance) {
      touchGestureRef.current = true;
      setIsGestureActive(true);
      suppressChartEvent(event, false);

      const distance = getTouchDistance(event.touches[0], event.touches[1]);
      if (Math.abs(distance - touch.distance) <= 2 || distance === 0) return;

      const count = Math.max(
        1,
        Math.min(
          chartData.length,
          Math.round((touch.count * touch.distance) / distance),
        ),
      );
      const center = touch.startIndex + (touch.count - 1) / 2;
      updateRangeFromGesture(Math.round(center - (count - 1) / 2), count);
      return;
    }

    if (event.touches.length !== 1 || touch.isPinching) return;
    const delta = event.touches[0].clientX - touch.startX;
    if (Math.abs(delta) > 6) {
      touchGestureRef.current = true;
      setIsGestureActive(true);
      suppressChartEvent(event, false);
    }

    const shift = Math.round(
      (delta / Math.max(1, event.currentTarget.clientWidth)) * touch.count,
    );
    if (shift !== 0) {
      updateRangeFromGesture(touch.startIndex - shift, touch.count);
    }
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchGestureRef.current) {
      suppressClickRef.current = true;
    } else if (event.touches.length === 0) {
      setIsGestureActive(false);
    }
    if (event.touches.length === 0) touchGestureRef.current = false;
    touchRef.current = null;
  };

  const handleTouchCancel = () => {
    touchRef.current = null;
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    setIsGestureActive(false);
    mouseDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startIndex: range.startIndex,
      count: range.endIndex - range.startIndex + 1,
      moved: false,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = mouseDragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) {
      if (event.pointerType === 'mouse' && isGestureActive) {
        setIsGestureActive(false);
      }
      return;
    }

    const delta = event.clientX - drag.startX;
    if (!drag.moved && Math.abs(delta) <= 4) return;
    if (!drag.moved) {
      drag.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    setIsGestureActive(true);
    suppressChartEvent(event);
    const shift = Math.round(
      (delta / Math.max(1, event.currentTarget.clientWidth)) * drag.count,
    );
    updateRangeFromGesture(drag.startIndex - shift, drag.count);
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = mouseDragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (drag.moved) {
      suppressClickRef.current = true;
      event.stopPropagation();
    } else {
      setIsGestureActive(false);
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    mouseDragRef.current = null;
  };

  const handlePointerCancel = () => {
    mouseDragRef.current = null;
    setIsGestureActive(false);
  };

  const handleClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
  };

  const handlePointerLeave = () => {
    if (!mouseDragRef.current) setIsGestureActive(false);
  };

  const applyCustomRange = () => {
    if (!customStart || !customEnd) return;
    const startTime = parseDateValue(customStart).getTime();
    const endTime = getSeoulDayEnd(customEnd).getTime();
    const todayEnd = getSeoulDayEnd(toSeoulInputDate()).getTime();
    if (startTime > endTime || endTime > todayEnd) return;

    const startIndex = chartData.findIndex(
      (point) => point.timestamp >= startTime,
    );
    let endIndex = -1;
    for (let index = chartData.length - 1; index >= 0; index -= 1) {
      if (chartData[index].timestamp <= endTime) {
        endIndex = index;
        break;
      }
    }
    if (startIndex < 0 || endIndex < startIndex) return;
    setStoredRange({ startIndex, endIndex });
    setRangePreset('custom');
  };

  const visibleData = useMemo(
    () => chartData.slice(range.startIndex, range.endIndex + 1),
    [chartData, range],
  );
  const activeRangeLabel =
    rangePreset === 'custom'
      ? '기간 선택'
      : rangePreset === 'adjusted'
        ? '직접 조정'
        : (RANGE_PRESETS.find((preset) => preset.key === rangePreset)?.label ??
          '전체');
  const maxSelectableDate = toSeoulInputDate();

  return {
    range,
    rangePreset,
    isDatePickerOpen,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    isGestureActive,
    visibleData,
    activeRangeLabel,
    maxSelectableDate,
    setPresetRange,
    applyCustomRange,
    shiftRange,
    jumpRange,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
    handlePointerDown,
    handlePointerMove,
    handlePointerEnd,
    handlePointerCancel,
    handlePointerLeave,
    handleClickCapture,
  };
}
