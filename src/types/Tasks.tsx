export type Frequency = "daily" | "weekly" | "monthly";

export type Task = {
  id: string;
  title: string;
  frequency: Frequency;
  time: string; // "HH:MM" format
  dayOfWeek?: number; // 0–6 (for weekly)
  dayOfMonth?: number; // 1–31 (for monthly)
  isActive: boolean;
};