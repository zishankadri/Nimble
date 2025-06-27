import { useState, useEffect } from 'react';
import ProjectTimer from './ProjectTimer';
import DropdownMenu from './DropdownMenu';


const ProjectHeader = ({ project, updateProjectName, handleDeleteProject, markProjectComplete }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [projectName, setProjectName] = useState(project.name);
	const [readOnly, setReadOnly] = useState(true);

  useEffect(() => {
    setProjectName(project.name);
  }, [project.name]);

  const handleNameChange = (e) => {
    setProjectName(e.target.value);
  };

  const handleNameBlur = () => {
    updateProjectName(projectName);
    setIsEditingName(false);
    
    window.dispatchEvent(new CustomEvent('projectNameUpdated', {
      detail: { id: project.id, name: projectName }
    }));
  };

  
  return (
    <>
      {project.image ? (
        <div 
          className="w-full h-32 bg-repeat" 
          style={{
            backgroundImage: `url(http://127.0.0.1:5000/static/${project.image})`,
            backgroundSize: '250px 250px', // Try more sensible sizing
          }}
        />
      ) : (
        <p>No image available for this project.</p>
      )}

      <div className="px-12">
        <div className="relative w-full flex justify-end my-2">
          {/* In the DropdownMenu component within ProjectHeader */}
          <DropdownMenu 
            onDelete={handleDeleteProject}
            onComplete={markProjectComplete}
            onEditTimer={() => setReadOnly(false)} // Add this state to ProjectHeader
          />
        </div>

        <div className="flex justify-between">
          <input
            id="projectNameInput"
            className="text-2xl font-bold mb-4 mt-2 mr-4 self-start bg-transparent border-none focus:outline-none"
            value={projectName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            onFocus={() => setIsEditingName(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.target.blur(); // triggers handleNameBlur
              }
            }}
          />

          <ProjectTimer 
            initialSeconds={project.timer_seconds || 0}
            projectId={project.id}
            readOnly={readOnly}
            setReadOnly={setReadOnly}
          />
        </div>

      </div>

    </>
  );
};

export default ProjectHeader;