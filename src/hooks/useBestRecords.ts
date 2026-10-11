import { useMemo } from 'react';

import { getBest1RM } from '@/utils/recordUtils';
import type { StrengthRecord } from '@/types/record';

export function useBestRecords(records: StrengthRecord[]) {
  const bestRecords = useMemo(() => {
    if (!records.length) return null;

    return {
      squat1rm: getBest1RM(records, 'squat', 'squat_reps'),
      deadlift1rm: getBest1RM(records, 'deadlift', 'deadlift_reps'),
      bench1rm: getBest1RM(records, 'bench_press', 'bench_press_reps'),
      ohp1rm: getBest1RM(records, 'ohp', 'ohp_reps'),
    };
  }, [records]);

  const hasBigThree =
    !!bestRecords &&
    bestRecords.squat1rm > 0 &&
    bestRecords.deadlift1rm > 0 &&
    bestRecords.bench1rm > 0;

  return { bestRecords, hasBigThree };
}
