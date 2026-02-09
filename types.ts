
export type Priority = 'low' | 'medium' | 'high';
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';

export interface RepeatConfig {
  interval: number;
  unit: 'day' | 'week' | 'month';
  daysOfWeek?: number[]; // 0-6
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO format
  startTime: string; // HH:mm
  duration: number; // minutes
  completed: boolean;
  priority: Priority;
  tags: string[];
  repeat: RepeatType;
  repeatConfig?: RepeatConfig;
  parentId?: string; // To link recurring instances
}

export type ViewType = 'day' | 'week' | 'month' | 'list';

export interface CalendarState {
  currentDate: Date;
  view: ViewType;
  tasks: Task[];
}
