export type StrengthRecord = {
  id: string;
  user_id: string;
  created_at: string;
  squat: number;
  deadlift: number;
  bench_press: number;
  ohp: number | null;
  total_weight: number;
};

export type RecordInput = Omit<StrengthRecord, 'id' | 'user_id' | 'created_at'>;

export type RecordFormState = {
  squat: string;
  deadlift: string;
  bench_press: string;
  ohp: string;
};
