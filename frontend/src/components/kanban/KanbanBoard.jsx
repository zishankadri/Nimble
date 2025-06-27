import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  useDroppable,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
  useSortable // <--- Import useSortable
} from '@dnd-kit/sortable';
import { updateTask } from '../../utils/api';
import Task from './Task'
import Column from './Column'


// --- Main Kanban Board App ---
const KanbanBoard = ({projectId, tasksData}) => {
  const [columns, setColumns] = useState({}); // Initialize as empty object
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state


  // useEffect to fetch tasks on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Group tasks by status and sort them by order
        const groupedColumns = {
          'todo': { title: 'To Do', tasks: [] },
          'inprogress': { title: 'In Progress', tasks: [] },
          'done': { title: 'Done', tasks: [] },
        };

        tasksData.forEach(task => {
          if (groupedColumns[task.status]) {
            groupedColumns[task.status].tasks.push({
              id: String(task.id), // Ensure ID is a string for dnd-kit
              content: task.title,
              // You can add other properties from your task object here if needed (e.g., completed, highlighted)
            });
          }
        });

        // Sort tasks within each column by their 'order' property
        Object.keys(groupedColumns).forEach(columnId => {
          groupedColumns[columnId].tasks.sort((a, b) => {
            // Find original task objects to get 'order' property for sorting
            const originalA = tasksData.find(t => String(t.id) === a.id);
            const originalB = tasksData.find(t => String(t.id) === b.id);
            return (originalA?.order || 0) - (originalB?.order || 0);
          });
        });

        setColumns(groupedColumns);

      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        setError("Failed to load tasks. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [projectId, tasksData]); // Re-run if projectId changes


  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Find the column containing a given task ID
  const findColumnForTask = (taskId) => {
    for (const columnId in columns) {
      if (columns[columnId].tasks.some(task => task.id === taskId)) {
        return columnId;
      }
    }
    return null;
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    const activeColumnId = findColumnForTask(activeId);
    const overColumnId = columns[overId] ? overId : findColumnForTask(overId);

    if (!activeColumnId || !overColumnId) {
      console.warn("Could not find source or target column for drag end.");
      setActiveId(null);
      return;
    }
    // Capture the original task object before state update
    const movedTaskOriginal = columns[activeColumnId].tasks.find(task => task.id === activeId);

    let updatedNewIndex = -1; // To store the final index of the moved task in its new list

    setColumns(prevColumns => {
      const newColumns = { ...prevColumns };

      const sourceTasks = [...newColumns[activeColumnId].tasks];
      const targetTasks = (activeColumnId === overColumnId) ? sourceTasks : [...newColumns[overColumnId].tasks];

      const activeIndex = sourceTasks.findIndex(task => task.id === activeId);

      let newIndex = targetTasks.length;
      if (overId !== overColumnId) {
        const foundOverIndex = targetTasks.findIndex(task => task.id === overId);
        if (foundOverIndex !== -1) {
          newIndex = foundOverIndex;
        }
      }

      if (activeColumnId === overColumnId) {
        if (activeIndex !== -1) {
          const newOrder = arrayMove(sourceTasks, activeIndex, newIndex);
          newColumns[activeColumnId] = {
            ...newColumns[activeColumnId],
            tasks: newOrder,
          };
          updatedNewIndex = newOrder.findIndex(task => task.id === activeId); // Get final index
        }
      } else {
        if (activeIndex !== -1) {
          const [movedTask] = sourceTasks.splice(activeIndex, 1);
          targetTasks.splice(newIndex, 0, movedTask);

          newColumns[activeColumnId] = {
            ...newColumns[activeColumnId],
            tasks: sourceTasks,
          };
          newColumns[overColumnId] = {
            ...newColumns[overColumnId],
            tasks: targetTasks,
          };
          updatedNewIndex = targetTasks.findIndex(task => task.id === activeId); // Get final index
        }
      }
      return newColumns;
    });

    setActiveId(null);

    // --- API Call for Persistence ---
    // Ensure updatedNewIndex is valid before making the API call
    console.log(updatedNewIndex);
    
    if (movedTaskOriginal && updatedNewIndex !== -1) {
        await updateTask(movedTaskOriginal.id, overColumnId, updatedNewIndex);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const draggedTask = activeId
    ? Object.values(columns)
        .flatMap(column => column.tasks)
        .find(task => task.id === activeId)
    : null;

  return (
    <div className="max-h-screen">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="grid grid-cols-3 gap-2 my-8">
        {/* <div className="flex justify-center items-start space-x-6"> */}
          {Object.entries(columns).map(([columnId, columnData]) => (
            <Column
              key={columnId}
              id={columnId}
              title={columnData.title}
              tasks={columnData.tasks}
            />
          ))}
        </div>

        <DragOverlay>
          {draggedTask ? (
            <Task id={draggedTask.id} content={draggedTask.content} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export default KanbanBoard;
