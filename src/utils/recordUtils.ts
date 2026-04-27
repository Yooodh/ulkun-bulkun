import { StrengthRecord } from '@/types/record';
import { UserSummary } from '@/types/user';

/**
 * 특정 날짜의 ISO 8601 기준 연도-주차 정보 반환
 */
export const getYearWeek = (dateStr: string): string => {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const isoYear = d.getFullYear();
  const yearStart = new Date(isoYear, 0, 1);
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return `${isoYear}-W${String(weekNo).padStart(2, '0')}`;
};

/**
 * 두 ISO 주차 문자열이 연속된 주인지 확인
 */
const isConsecutiveWeek = (weekA: string, weekB: string): boolean => {
  const toMonday = (yearWeek: string): Date => {
    const [year, week] = yearWeek.replace('W', '').split('-').map(Number);
    const jan4 = new Date(year, 0, 4);
    const jan4DayOfWeek = jan4.getDay() || 7;
    const monday = new Date(jan4);
    monday.setDate(jan4.getDate() - (jan4DayOfWeek - 1) + (week - 1) * 7);
    return monday;
  };

  const diff =
    (toMonday(weekA).getTime() - toMonday(weekB).getTime()) / (86400000 * 7);
  return diff === 1;
};

/**
 * 공개 여부 가드
 */
const getPrivacyGuard = (isPublic: boolean | undefined): string | null => {
  return isPublic === false ? '비공개' : null;
};

/**
 * 특정 종목의 역대 최고 기록 및 해당 날짜 추출
 */
export const getBestRecord = (
  records: StrengthRecord[],
  key: keyof Pick<StrengthRecord, 'squat' | 'deadlift' | 'bench_press' | 'ohp'>,
) => {
  return records.reduce(
    (best, curr) => {
      const currValue = curr[key] ?? 0;
      const currDate = curr.recorded_at || curr.created_at;
      return currValue > best.value
        ? { value: currValue, date: currDate }
        : best;
    },
    { value: 0, date: '' },
  );
};

/**
 * 모든 기록을 통틀어 스쿼트·벤치프레스·데드리프트 각각의 최고치를 합산한 3대 PR 계산
 */
export const calculateTotalPR = (records: StrengthRecord[]): number => {
  if (!records || records.length === 0) return 0;
  return (
    getBestRecord(records, 'squat').value +
    getBestRecord(records, 'bench_press').value +
    getBestRecord(records, 'deadlift').value
  );
};

/**
 * 주 단위로 끊김 없는 연속 운동 기록 계산
 */
export const calculateWeeklyStreak = (records: StrengthRecord[]): number => {
  if (!records || records.length === 0) return 0;

  const recordedWeeks = [
    ...new Set(
      records.map((r) =>
        getYearWeek((r.recorded_at || r.created_at).slice(0, 10)),
      ),
    ),
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
    if (isConsecutiveWeek(recordedWeeks[i], recordedWeeks[i + 1])) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

/**
 * 공개 여부 및 기록 존재 여부에 따라 PR 합계 텍스트 반환
 */
export const getDisplayPR = (
  isPublic: boolean | undefined,
  maxTotal: number | null,
): string => {
  return (
    getPrivacyGuard(isPublic) ??
    (!maxTotal || maxTotal === 0 ? '기록 없음' : `${maxTotal}kg`)
  );
};

/**
 * 공개 여부에 따라 포맷팅된 마지막 활동일 텍스트 반환
 */
export const getDisplayDate = (
  isPublic: boolean | undefined,
  lastActivity: string,
  formatter: (date: string) => string,
): string => {
  return (
    getPrivacyGuard(isPublic) ??
    (!lastActivity ? '없음' : formatter(lastActivity))
  );
};

/**
 * UserSummary로부터 3대 합계 텍스트 반환
 */
export const getCombinedTotalFromUser = (user: UserSummary): string => {
  const guard = getPrivacyGuard(user.is_public);
  if (guard) return guard;

  const total =
    (user.max_squat ?? 0) + (user.max_bench ?? 0) + (user.max_deadlift ?? 0);
  if (total > 0) return `${total}kg`;
  if (user.max_total) return `${user.max_total}kg`;
  return '기록 없음';
};
