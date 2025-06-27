import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProjectHeader from './ProjectHeader';
import KanbanBoard from './kanban/KanbanBoard';
import useProject  from '../hooks/useProject';
import useTasks from '../hooks/useTasks';
import TaskList from './TaskList';

import { SquareKanban, List, ChartNoAxesColumn } from 'lucide-react';

const ProjectView = () => {
  const { projectId } = useParams()
  const {
    project,
    updateProjectName,
    handleDeleteProject,
    markProjectComplete
  } = useProject(projectId);
  
  const {
    tasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    toggleHighlight,
    moveTask
  } = useTasks(projectId);

  const VIEW_STYLE_CHOICES = {
      kanban: "KANBAN",
      list: "LIST",
      graph: "GRAPH",
  }
  const [ viewStyle, setViewStyle ] = useState(VIEW_STYLE_CHOICES['kanban'])

  if (!project) return <div>Loading...</div>;

  return (
    <div className="pb-12 text-gray-200">
      <ProjectHeader 
        project={project} 
        updateProjectName={updateProjectName}
        handleDeleteProject={handleDeleteProject}
        markProjectComplete={markProjectComplete}
      />

      <div className="px-12 mt-2">
        <div className='flex justify-end gap-2 items-center'>

          <form 
            onSubmit={createTask}
            className="flex gap-2 items-center">
            <input 
              name="title" 
              placeholder="New Task..." 
              required
              className="regular-input max-w-44" 
              />
            <button type="submit" className="btn-secondary">
              Add Task
            </button>
          </form>

          <div className="flex gap-2">
            <button 
              onClick={() => setViewStyle(VIEW_STYLE_CHOICES.kanban)}
              className={`flex gap-2 btn-square !px-2 
              ${ viewStyle === VIEW_STYLE_CHOICES.kanban ? 'active-btn-square' : 'inactive-btn-square'}`}>
                <SquareKanban className="size-5" />
                
            </button>
            <button
              onClick={() => setViewStyle(VIEW_STYLE_CHOICES.list)}
              className={`flex gap-2 !px-2 
              ${ viewStyle === VIEW_STYLE_CHOICES.list ? 'active-btn-square' : 'inactive-btn-square'}`}>
                <List className="size-5" />
            </button>
            <button
              onClick={() => setViewStyle(VIEW_STYLE_CHOICES.graph)}
              className={`flex gap-2 btn-square !px-2 
              ${ viewStyle === VIEW_STYLE_CHOICES.graph ? 'active-btn-square' : 'inactive-btn-square'}`}>
                <ChartNoAxesColumn className="size-5" />
            </button>
          </div>
        </div>

        { viewStyle === VIEW_STYLE_CHOICES.kanban ? (
          <KanbanBoard
          projectId={projectId}
          tasksData={tasks}
          />
        ) : null}

        { viewStyle === VIEW_STYLE_CHOICES.list ? (
          <TaskList 
            tasks={tasks}
            onToggleTask={toggleTask}
            onToggleHighlight={toggleHighlight}
            onDeleteTask={deleteTask}
          />
        ) : null}
        
      </div>
      
    </div>
  );
};

export default ProjectView;