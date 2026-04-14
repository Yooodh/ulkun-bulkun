import { StrengthRecord } from '@/types/record';
import { UserSummary } from '@/types/user';

/**
 * 특정 날짜의 연도-주차 정보 반환 함수
 */
export const getYearWeek = (dateStr: string) => {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return `${d.getFullYear()}-${weekNo}`;
};

/**
 * 특정 종목의 역대 최고 기록 및 해당 날짜 추출 함수
 */
export const getBestRecord = (
  records: StrengthRecord[],
  key: 'squat' | 'deadlift' | 'bench_press' | 'ohp',
) => {
  return records.reduce(
    (best, curr) => {
      const currValue = curr[key] ?? 0;
      return currValue > best.value
        ? { value: currValue, date: curr.created_at }
        : best;
    },
    { value: 0, date: '' },
  );
};

/**
 * 모든 기록을 통틀어 S, B, D 각각의 최고치를 찾아 합산한 최대 3대 합계 계산 함수
 */
export const calculateTotalPR = (records: StrengthRecord[]) => {
  if (!records || records.length === 0) return 0;
  return (
    getBestRecord(records, 'squat').value +
    getBestRecord(records, 'bench_press').value +
    getBestRecord(records, 'deadlift').value
  );
};

/**
 * 주 단위로 끊김 없는 연속 운동 기록 계산 함수
 */
export const calculateWeeklyStreak = (records: StrengthRecord[]) => {
  if (!records || records.length === 0) return 0;

  const recordedWeeks = [
    ...new Set(records.map((r) => getYearWeek(r.created_at.slice(0, 10)))),
  ].sort((a, b) => b.localeCompare(a));

  const todayStr = new Date().toISOString().slice(0, 10);
  const currentWeek = getYearWeek(todayStr);

  const lastWeekDate = new Date();
  lastWeekDate.setDate(lastWeekDate.getDate() - 7);
  const lastWeek = getYearWeek(lastWeekDate.toISOString().slice(0, 10));

  const hasActivityThisWeek = recordedWeeks.includes(currentWeek);
  const hasActivityLastWeek = recordedWeeks.includes(lastWeek);

  if (!hasActivityThisWeek && !hasActivityLastWeek) return 0;

  const startIndex = hasActivityThisWeek
    ? recordedWeeks.indexOf(currentWeek)
    : recordedWeeks.indexOf(lastWeek);

  let streak = 1;
  for (let i = startIndex; i < recordedWeeks.length - 1; i++) {
    const [y1, w1] = recordedWeeks[i].split('-').map(Number);
    const [y2, w2] = recordedWeeks[i + 1].split('-').map(Number);

    const isConsecutive =
      (y1 === y2 && w1 - w2 === 1) ||
      (y1 - y2 === 1 && w1 === 1 && (w2 === 52 || w2 === 53));

    if (isConsecutive) streak++;
    else break;
  }
  return streak;
};

/**
 * 공개 여부 및 기록 존재 여부에 따라 PR 합계 텍스트 반환 함수
 */
export const getDisplayPR = (
  isPublic: boolean | undefined,
  maxTotal: number | null,
) => {
  if (isPublic === false) return '비공개';
  if (!maxTotal || maxTotal === 0) return '기록 없음';
  return `${maxTotal}kg`;
};

/**
 * 공개 여부에 따라 포맷팅된 마지막 활동일 텍스트 반환 함수
 */
export const getDisplayDate = (
  isPublic: boolean | undefined,
  lastActivity: string,
  formatter: (date: string) => string,
) => {
  if (isPublic === false) return '비공개';
  if (!lastActivity) return '없음';
  return formatter(lastActivity);
};

/**
 * 종목별 최고치를 찾아 합산된 PR 텍스트 반환 함수
 */
export const getCombinedTotalFromUser = (user: UserSummary) => {
  if (user.is_public === false) return '비공개';

  const s = user.max_squat || 0;
  const b = user.max_bench || 0;
  const d = user.max_deadlift || 0;

  const total = s + b + d;

  if (total === 0 && user.max_total) return `${user.max_total}kg`;

  return total > 0 ? `${total}kg` : '0kg';
};
