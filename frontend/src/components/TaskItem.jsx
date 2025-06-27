import { useState, useRef, useEffect } from 'react';

const TaskItem = ({ task, onUpdate, simpleView = false, draggable = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    if (!simpleView) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editedTitle !== task.title) {
      onUpdate?.(task.id, editedTitle);
    }
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('taskId', task.id);
  };

  if (simpleView) {
    return (
      <span className={`${task.completed ? 'line-through text-gray-400' : ''}`}>
        {task.title}
      </span>
    );
  }

  return (
    <li
      className={`p-2 text-gray-200 bg-back-700 border border-back-500 rounded shadow break-words ${
        draggable ? 'cursor-move' : ''
      }`}
      data-id={task.id}
      onDoubleClick={handleDoubleClick}
      draggable={draggable}
      onDragStart={draggable ? handleDragStart : undefined}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
          className="w-full bg-transparent focus:outline-none"
        />
      ) : (
        <p className="whitespace-pre-wrap break-words">{task.title}</p>
      )}
    </li>
  );
};

export default TaskItem;