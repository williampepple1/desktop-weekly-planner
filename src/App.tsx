import React, { useState, useEffect } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import { format, startOfWeek, addDays } from 'date-fns';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Task, WeekDay, CreateTaskData } from './types';
import { taskService } from './services/taskService';
import TaskForm from './components/TaskForm';
import WeekView from './components/WeekView';

const App: React.FC = () => {
  console.log('App component rendering...');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  // Generate week days
  const generateWeekDays = (weekStart: Date): WeekDay[] => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return days.map((day, index) => ({
      name: dayNames[index],
      value: day,
      date: addDays(weekStart, index),
    }));
  };

  const weekDays = generateWeekDays(startOfWeek(currentWeek, { weekStartsOn: 1 }));

  // Load tasks for current week
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
        console.log('Loading tasks for week start:', weekStart);
        const weekTasks = await taskService.getTasksForWeek(weekStart, 'local-user');
        console.log('Loaded tasks:', weekTasks.length, 'tasks');
        setTasks(weekTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [currentWeek]);

  // Handle drag and drop
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    console.log('Drag end event:', { active: active.id, over: over?.id });
    
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id.toString();
    
    console.log('Processing drop:', { taskId, overId });
    
    // Check if we're dropping on a droppable area (status column)
    if (overId.includes('-')) {
      // Handle the different status formats
      let day, status;
      if (overId.includes('-in-progress')) {
        day = overId.replace('-in-progress', '');
        status = 'in-progress';
      } else if (overId.includes('-todo')) {
        day = overId.replace('-todo', '');
        status = 'todo';
      } else if (overId.includes('-completed')) {
        day = overId.replace('-completed', '');
        status = 'completed';
      } else {
        // Fallback for any other format
        const [d, s] = overId.split('-');
        day = d;
        status = s;
      }
      
      console.log('Parsed drop target:', { day, status });
      
      // Find the task being dragged
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        console.log('Task not found:', taskId);
        return;
      }
      
      console.log('Current task state:', { day: task.day, status: task.status });
      
      // Only update if the task is being moved to a different status or day
      if (task.day === day && task.status === status) {
        console.log('No change needed');
        return;
      }
      
      try {
        console.log('Updating local state immediately...');
        // Update local state immediately for better UX (optimistic update)
        setTasks(prevTasks =>
          prevTasks.map(t =>
            t.id === taskId
              ? { ...t, day, status: status as Task['status'] }
              : t
          )
        );
        
        console.log('Updating task in database...');
        // Update the task in database
        await taskService.updateTaskDay(taskId, day);
        await taskService.updateTaskStatus(taskId, status as Task['status']);
        
        console.log('Task updated successfully');
      } catch (error) {
        console.error('Error updating task:', error);
        // If database update fails, revert the local state
        console.log('Reverting local state due to database error...');
        setTasks(prevTasks =>
          prevTasks.map(t =>
            t.id === taskId
              ? { ...t, day: task.day, status: task.status }
              : t
          )
        );
      }
    }
  };

  // Handle form submission
  const handleSubmitTask = async (taskData: CreateTaskData) => {
    try {
      if (editingTask) {
        // Update existing task
        await taskService.updateTask(editingTask.id, taskData);
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === editingTask.id
              ? { ...task, ...taskData }
              : task
          )
        );
      } else {
        // Add new task
        const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
        const taskId = await taskService.addTask(taskData, 'local-user', weekStart);
        const newTask: Task = {
          id: taskId,
          ...taskData,
          week_id: weekStart.toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setTasks(prevTasks => [...prevTasks, newTask]);
      }
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Handle task editing
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  // Navigate to previous week
  const goToPreviousWeek = () => {
    setCurrentWeek(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  };

  // Navigate to next week
  const goToNextWeek = () => {
    setCurrentWeek(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  };

  // Close form and reset editing state
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        {/* Header */}
        <div className="mb-4 md:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Weekly Planner</h1>
              <p className="text-sm md:text-base text-gray-600">Organize your tasks for the week</p>
            </div>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-4">
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={goToPreviousWeek}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 text-center">
              {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'MMM d')} - {format(addDays(startOfWeek(currentWeek, { weekStartsOn: 1 }), 6), 'MMM d, yyyy')}
            </h2>
            <button
              onClick={goToNextWeek}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm md:text-base"
          >
            <Plus size={16} />
            Add Task
          </button>
        </div>

        {/* Week View */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading tasks...</div>
          </div>
        ) : (
          <WeekView
            weekDays={weekDays}
            tasks={tasks}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onDragEnd={handleDragEnd}
          />
        )}

        {/* Task Form Modal */}
        <TaskForm
          isOpen={isFormOpen}
          onClose={closeForm}
          onSubmit={handleSubmitTask}
          task={editingTask}
        />
      </div>
    </div>
  );
};

export default App;
