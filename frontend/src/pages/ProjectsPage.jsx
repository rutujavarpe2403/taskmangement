import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { projectService } from '../services/projectService';
import { formatDate } from '../utils/formatters';

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getUserProjects();
      if (response.success) {
        setProjects(response.data);
      }
    } catch (err) {
      setError('Failed to load projects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await projectService.createProject(formData.name, formData.description);
      if (response.success) {
        setProjects((prev) => [response.data, ...prev]);
        setFormData({ name: '', description: '' });
        setShowForm(false);
        setError(null);
      }
    } catch (err) {
      setError('Failed to create project');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const response = await projectService.deleteProject(projectId);
        if (response.success) {
          setProjects((prev) => prev.filter((p) => p.id !== projectId));
        }
      } catch (err) {
        setError('Failed to delete project');
        console.error(err);
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="text-2xl font-bold mb-2">Projects</h1>
            <p className="text-gray-600">Manage your projects and teams</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? 'Cancel' : '+ New Project'}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="card mb-6">
            <h3 className="font-semibold mb-4">Create New Project</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="My Project"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea
                  name="description"
                  className="form-textarea"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your project..."
                ></textarea>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        {/* Projects List */}
        {loading ? (
          <div className="flex-center" style={{ minHeight: '300px' }}>
            <div className="spinner"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p className="text-gray-600 mb-4">No projects yet. Create one to get started!</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              Create Your First Project
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {projects.map((project) => (
              <div key={project.id} className="card" style={{ cursor: 'pointer' }}>
                <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
                {project.description && (
                  <p className="text-gray-600 text-sm mb-4">{project.description}</p>
                )}
                <p className="text-xs text-gray-500 mb-4">
                  Created {formatDate(project.created_at)}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="btn btn-primary flex-1"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
