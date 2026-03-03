export type Frequency = "daily" | "weekly" | "biweekly" | "monthly";

export type TaskCompletion = {
  date: string; // ISO date string
  completedAt: string; // ISO timestamp
};

export type Task = {
  id: string;
  title: string;
  frequency: Frequency;
  time: string; // "HH:MM" format
  startDate: string; // ISO date string
  dayOfWeek?: number; // 0–6 (for weekly)
  dayOfMonth?: number; // 1–31 (for monthly)
  isActive: boolean;
  completions: TaskCompletion[];
};