import type { Task, CreateTaskData } from '../types';

// Tauri invoke function
const invoke = async (command: string, args: any): Promise<any> => {
  // Check if we're in Tauri environment
  if (typeof window !== 'undefined' && (window as any).__TAURI__) {
    try {
      // Use the global Tauri invoke function
      return await (window as any).__TAURI__.invoke(command, args);
    } catch (error) {
      console.error('Failed to call Tauri invoke:', error);
    }
  }
  
  // Fallback for development (when not in Tauri)
  console.log('Mock Tauri invoke:', command, args);
  if (command === 'get_tasks_for_week') {
    return [];
  } else if (command === 'add_task') {
    return 'mock-task-id-' + Date.now();
  }
  return null;
};

export const taskService = {
  // Add a new task
  async addTask(task: CreateTaskData, _userId: string, weekStart: Date): Promise<string> {
    const weekId = weekStart.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    try {
      const taskId = await invoke('add_task', {
        request: {
          title: task.title,
          description: task.description,
          day: task.day,
          status: task.status,
          priority: task.priority,
          weekId: weekId,
        }
      }) as string;
      
      return taskId;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  },

  // Get all tasks for a specific week
  async getTasksForWeek(weekStart: Date, _userId: string): Promise<Task[]> {
    const weekId = weekStart.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    console.log('Fetching tasks for weekId:', weekId);
    
    try {
      const tasks = await invoke('get_tasks_for_week', {
        weekId: weekId
      }) as Task[];
      
      console.log('Retrieved tasks:', tasks.length, 'tasks');
      return tasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  },

  // Update a task
  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    try {
      await invoke('update_task', {
        id: id,
        updates: {
          title: updates.title,
          description: updates.description,
          day: updates.day,
          status: updates.status,
          priority: updates.priority,
        }
      });
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  // Delete a task
  async deleteTask(id: string): Promise<void> {
    try {
      await invoke('delete_task', { id });
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // Update task status (for drag and drop)
  async updateTaskStatus(id: string, status: Task['status']): Promise<void> {
    try {
      await invoke('update_task_status', {
        id: id,
        status: status
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  },

  // Update task day (for drag and drop)
  async updateTaskDay(id: string, day: string): Promise<void> {
    try {
      await invoke('update_task_day', {
        id: id,
        day: day
      });
    } catch (error) {
      console.error('Error updating task day:', error);
      throw error;
    }
  },
}; 