import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function ProjectDetail() {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const BACKEND_URL = 'http://127.0.0.1:5000';

    console.log("ProjectDetail component rendered with id:", id, project);
    // Fetch project details based on the id from the URL
    useEffect(() => {
        fetch(`${BACKEND_URL}/project/api/get-details/${id}`)
        .then(res => res.json())
        .then(data => setProject(data));
    }, [id]);

    if (!project) return <div>Loading...</div>;

    return (
        <div className="project-detail">
        <h1>{project.name}</h1>
        <p>{project.description}</p>
        {/* Add more fields as needed */}
        </div>
    );
}