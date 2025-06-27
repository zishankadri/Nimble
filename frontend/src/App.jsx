import { Routes, Route } from 'react-router-dom';
import ProjectList from './components/ProjectList';
import ProjectDetail from './pages/ProjectDetail';
import ProjectView from './components/ProjectView';

function App() {
  return (
    <div className="app-container flex h-screen bg-[#1E1E1E] text-white">
      <ProjectList />
      <main className="flex-1 overflow-y-auto h-screen">
        <Routes>
          <Route path="/projects/:projectId" element={<ProjectView />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;