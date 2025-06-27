import { useState, useEffect } from 'react';
import {
  fetchTasks,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
  toggleTask as apiToggleTask,
  toggleHighlight as apiToggleHighlight,
  moveTask as apiMoveTask
} from '../utils/api';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const useTasks = (projectId) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const loadTasks = async () => {
      const data = await fetchTasks(projectId);
      console.log(data);
      
      setTasks(data);
    };
    loadTasks();
  }, [projectId]);

  const createTask = async (e) => {
    e.preventDefault();
    const title = e.target.title.value;
    const newTask = await apiCreateTask(projectId, title);
    setTasks([...tasks, newTask]);
    e.target.reset();
  };

  const updateTask = async (taskId, updates) => {
    const updatedTask = await apiUpdateTask(taskId, updates);
    setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
  };

  const deleteTask = async (taskId) => {
    await apiDeleteTask(taskId);
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const toggleTask = async (taskId) => {
    await apiToggleTask(taskId); // Toggle on server
    setTasks(tasks.map(t => 
      t.id === taskId ? {...t, completed: !t.completed} : t
    ));
  };

  const toggleHighlight = async (taskId) => {
    await apiToggleHighlight(taskId); // Toggle on server
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, highlighted: !t.highlighted } : t
    ));
  };

  const moveTask = async (taskId, newStatus) => {
    const movedTask = await apiMoveTask(taskId, newStatus);
    setTasks(tasks.map(t => t.id === taskId ? movedTask : t));
  };

  return {
    tasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    toggleHighlight,
    moveTask
  };
};

export default useTasks;