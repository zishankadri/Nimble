import {
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import Task from './Task'


// --- Column Component (Droppable & Sortable Context) ---
const Column = ({ id, title, tasks }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  const columnBgClass = isOver ? 'bg-back-500 border-purple-500' : 'bg-back-600 border-back-500';

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 rounded border transition-colors duration-200 ease-in-out
                  ${columnBgClass} flex flex-col`}
    >
      <h3 className="px-3 py-2 font-medium text-gray-200 border-b border-back-500">
        {title} 
        <span className='text-gray-500 pl-3'>
          ({tasks.length})
        </span>
      </h3>
      <div className="flex-grow p-2 min-h-[50px]"> {/* Ensure min-height for empty columns */}
        <SortableContext
          items={tasks.map(task => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map(task => (
            <Task key={task.id} id={task.id} content={task.content} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export default Column;