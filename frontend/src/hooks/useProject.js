import { useState, useEffect } from 'react';
import { 
  fetchProject, 
  updateProjectName as apiUpdateName,
  deleteProject as apiDeleteProject,
  markProjectComplete as apiMarkComplete
} from '../utils/api';

const useProject = (projectId) => {
  const [project, setProject] = useState(null);
  
  useEffect(() => {
    const loadProject = async () => {
      const data = await fetchProject(projectId);
      setProject(data);
    };
    loadProject();
  }, [projectId]);

  const updateProjectName = async (name) => {
    const updatedProject = await apiUpdateName(projectId, name);
      // setProject(updatedProject);
      setProject(prevProject => ({
        ...prevProject,          // Keep all existing properties
        name: name               // Only update the name
      }));
  };

  const handleDeleteProject = async () => {
    if (window.confirm(`Delete ${project.name} project?`)) {
      await apiDeleteProject(projectId);
      // Redirect or handle after deletion
    }
  };

  const markProjectComplete = async () => {
    const updatedProject = await apiMarkComplete(projectId);
    setProject(updatedProject);
  };

  return {
    project,
    updateProjectName,
    handleDeleteProject,
    markProjectComplete
  };
};

export default useProject;