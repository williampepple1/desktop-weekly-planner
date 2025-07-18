export interface Task {
  id: string;
  title: string;
  description?: string;
  day: string; // 'monday', 'tuesday', etc.
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  week_id: string; // ISO date string of the week start (e.g., '2024-01-01')
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface CreateTaskData {
  title: string;
  description?: string;
  day: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

export interface WeekDay {
  name: string;
  value: string;
  date: Date;
}

export interface DragResult {
  active: {
    id: string;
  };
  over: {
    id: string;
  } | null;
} 