// const API_BASE = 'http://127.0.0.1:5000/';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const fetchProject = async (projectId) => {
  const response = await fetch(`${BACKEND_URL}/project/api/get-details/${projectId}`);
  return response.json();
};

export const updateProjectName = async (projectId, name) => {
  const response = await fetch(`${BACKEND_URL}/project/${projectId}/update_name`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  return response.json();
};

export const deleteProject = async (projectId) => {
  await fetch(`${BACKEND_URL}/project/${projectId}/delete`, { method: 'DELETE' });
};

export const markProjectComplete = async (projectId) => {
  const response = await fetch(`${BACKEND_URL}/projects/${projectId}/complete`, {
    method: 'POST'
  });
  return response.json();
};

export const updateProjectTimer = async (projectId, seconds) => {
  const response = await fetch(`${BACKEND_URL}/project/${projectId}/set_timer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seconds })
  });
  return response.json();
};

export const createTask = async (projectId, title) => {
  const response = await fetch(`${BACKEND_URL}/task/${projectId}/create_task`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  });
  return response.json();
};

export const deleteTask = async (taskId) => {
  await fetch(`${BACKEND_URL}/task/${taskId}/delete`, { method: 'POST' });
};

export const moveTask = async (projectId, seconds) => {
  const response = await fetch(`${BACKEND_URL}/projects/${projectId}/timer`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seconds })
  });
  return response.json();
};

export const toggleHighlight = async (taskId) => {
  await fetch(`${BACKEND_URL}/task/${taskId}/toggle-highlight`, {method: 'POST'});
};

export const toggleTask = async (projectId) => {
  await fetch(`${BACKEND_URL}/task/${projectId}/toggle-completion`, {method: 'POST'});
};

// export const updateTask = async (projectId, seconds) => {
//   const response = await fetch(`${BACKEND_URL}/projects/${projectId}/timer`, {
//     method: 'PUT',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ seconds })
//   });
//   return response.json();
// };

export const fetchTasks = async (projectId, seconds) => {
  const response = await fetch(`${BACKEND_URL}/task/api/get_tasks/${projectId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seconds })
  });
  return response.json();
};

export const updateTask = async (projectId, status, order) => {
      try {
        const response = await fetch(`${BACKEND_URL}/task/update-task/${projectId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: status, // The ID of the new column (e.g., 'todo', 'in-progress', 'done')
            order: order, // The new 0-based index within the target column
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to update task on backend:', errorData.message);
          // Optional: Revert UI state if backend update fails
          // For a more robust app, you might want to implement a rollback
        }
      } catch (error) {
        console.error('Network error during task update:', error);
      }

  }