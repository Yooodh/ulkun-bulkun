export type UserSummary = {
  id: string;
  nickname: string;
  avatar_url: string;
  status_message: string;
  is_public: boolean;
  last_activity: string;
  max_squat: number;
  max_bench: number;
  max_deadlift: number;
  max_total: number;
};

export type ProfileWithRecords = {
  id: string;
  nickname: string | null;
  avatar_url: string | null;
  status_message: string | null;
  is_public: boolean | null;
  records: {
    squat: number | null;
    bench_press: number | null;
    deadlift: number | null;
    total_weight: number | null;
    created_at: string;
    recorded_at: string | null;
    status: 'draft' | 'completed';
  }[];
};
