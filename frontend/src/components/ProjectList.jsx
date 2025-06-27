import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BACKEND_URL}/project/api/projects`)
      .then(res => res.json())
      .then(data => setProjects(data));
      
    const handleUpdate = (e) => {
      const { id, name } = e.detail;
      setProjects(prev =>
        prev.map(p => (p.id === id ? { ...p, name } : p))
      );
    };

    window.addEventListener('projectNameUpdated', handleUpdate);
    return () => window.removeEventListener('projectNameUpdated', handleUpdate);
    
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const res = await fetch(`${BACKEND_URL}/project/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });

    if (res.ok) {
      const newProject = await res.json();
      setProjects(prev => [...prev, newProject]);
      setName('');

      navigate(`/projects/${newProject.id}`);
    } else {
      console.error('Failed to add project');
    }
  };

  return (
    <aside className="hidden lg:flex w-64 bg-[#262626] text-white px-4 py-0 flex-col">
        <a href="/" className="text-2xl font-bold tracking-wider my-8">Nimble</a>
        <nav className="flex flex-col gap-2 text-gray-300">
            {projects.length > 0 ? (
              projects.map(project => (
                  <NavLink 
                    key={project.id}
                    to={`/projects/${project.id}`} 
                    className={({ isActive }) => isActive ? 'active-link' : 'normal-link'}
                    id={`${project.name}-navlink`}>
                          
                    <img 
                        src={`${BACKEND_URL}/static/${project.image}`} 
                        className="w-6 h-6 rounded-full object-cover"
                        alt={ project.name }
                    />

                    <span id={`nav-project-name-${project.id}`}>
                      {project.name} 
                    </span>
                  </NavLink>
              ))
            ) : (
                <p className="text-center text-gray-500 mt-4">No projects available.</p>
            )}

        </nav>
        <div className="mt-auto">
            <form onSubmit={handleSubmit}>
                <input 
                  type="text"
                  id="name"
                  name="name"
                  required 
                  placeholder="Add new project" 
                  className="w-full px-2 text-sm py-2 outline-none hover:bg-white/5 
                           focus:bg-white/5 rounded-md mb-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
            </form>
        </div>
    </aside>
  );
}