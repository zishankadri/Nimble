import TaskItem from './TaskItem';
import { Bookmark, BookmarkMinus } from 'lucide-react';


const TaskList = ({ tasks, onToggleTask, onToggleHighlight, onDeleteTask }) => {
  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-2">Tasks</h3>
      <ul id="task-list" className="space-y-2">
        {tasks.length > 0 ? (
          tasks.map(task => (
            <li
              key={task.id}
              data-id={task.id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                task.highlighted ? 'bg-blue-400/20' : 'bg-back-600'
              }`}
            >
              <TaskItem task={task} simpleView />

              <div className="flex gap-3 items-center">
                <button
                  onClick={() => onToggleHighlight(task.id)}
                  className="text-yellow-400 hover:text-yellow-600 text-sm"
                >
                  {task.highlighted ? (
                    <BookmarkMinus className='size-4.5' />
                  ) : (
                    <Bookmark className='size-4.5' />
                  )}
                </button>

                <button
                  onClick={() => onToggleTask(task.id)}
                  className="text-green-500 hover:text-green-700 text-sm"
                >
                  {task.completed ? 'Undo' : 'Done'}
                </button>

                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="text-red-400 hover:text-red-600 text-sm"
                >
                  Delete
                </button>
              </div>
            </li>
          ))
        ) : (
          <p className="text-gray-400">No tasks yet.</p>
        )}
      </ul>
    </div>
  );
};

export default TaskList;