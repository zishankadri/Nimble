import { useState } from 'react';
import TaskItem from './TaskItem';

const TaskColumn = ({ column, tasks, onTaskUpdate, onTaskMove }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleTaskUpdate = (taskId, newTitle) => {
    onTaskUpdate(taskId, { title: newTitle });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    onTaskMove(taskId, column);
  };

  return (
    <div className="bg-back-600 border border-back-500 rounded">
      <h3 className="font-medium capitalize p-3 border-b border-back-500">
        {column.replace('_', ' ')}
      </h3>
      <ul
        id={column}
        className="task-column p-2 space-y-1.5 min-h-[100px] h-full rounded"
        data-status={column}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onUpdate={handleTaskUpdate}
            draggable
          />
        ))}
      </ul>
    </div>
  );
};

export default TaskColumn;