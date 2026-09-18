export interface Participant {
  id: string;
  name: string;
  selected_dates: string[];
  created_at?: string;
  updated_at?: string;
}

export interface PollDate {
  id: string; // ISO format 'YYYY-MM-DD'
  date: Date;
  monthName: string; // 'November' | 'December'
  weekday: string; // 'Fri' | 'Sat'
  dayNumber: number; // 1, 2, ...
  displayLabel: string; // e.g. 'Fri, Nov 1'
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}
