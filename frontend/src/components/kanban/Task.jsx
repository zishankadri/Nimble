import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Task Component (Sortable Item) ---
const Task = ({ id, content }) => {
  // Use useSortable for items within a SortableContext
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging, // Add isDragging to apply visual feedback
  } = useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1, // Visual feedback for dragging
    boxShadow: isDragging ? '0px 8px 16px rgba(0, 0, 0, 0.2)' : 'none', // Add shadow for better feedback
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-back-700 p-2 mb-2 rounded-lg shadow-sm cursor-default active:cursor-grabbing
                 border border-back-500 transition-all duration-150 ease-in-out
                 hover:bg-back-700 flex items-center justify-between"
    >
      <span className="text-gray-200">{content}</span>
    </div>
  );
}

export default Task;