import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { teamService } from '../services/teamService';
import { useAuthContext } from '../context/AuthContext';
import { ROLE } from '../utils/constants';

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [taskFormData, setTaskFormData] = useState({ title: '', description: '', priority: 'MEDIUM' });
  const [teamFormData, setTeamFormData] = useState({ email: '', role: 'MEMBER' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const [projectRes, tasksRes, teamRes] = await Promise.all([
        projectService.getProjectById(projectId),
        taskService.getTasks({ projectId }),
        teamService.getTeamMembers(projectId)
      ]);

      if (projectRes.success) setProject(projectRes.data);
      if (tasksRes.success) setTasks(tasksRes.data.filter((t) => t.project_id === parseInt(projectId)));
      if (teamRes.success) setTeamMembers(teamRes.data);
    } catch (err) {
      setError('Failed to load project');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskFormData.title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await taskService.createTask(
        parseInt(projectId),
        taskFormData.title,
        taskFormData.description,
        taskFormData.priority
      );
      if (response.success) {
        setTasks((prev) => [response.data, ...prev]);
        setTaskFormData({ title: '', description: '', priority: 'MEDIUM' });
        setShowTaskForm(false);
        setError(null);
      }
    } catch (err) {
      setError('Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTeamMember = async (e) => {
    e.preventDefault();
    if (!teamFormData.email.trim()) {
      setError('Email is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await teamService.addTeamMember(projectId, teamFormData.email, teamFormData.role);
      if (response.success) {
        setTeamFormData({ email: '', role: 'MEMBER' });
        setShowTeamForm(false);
        setError(null);
        fetchProjectData(); // Refresh
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add team member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveTeamMember = async (memberId) => {
    if (window.confirm('Remove this team member?')) {
      try {
        const response = await teamService.removeTeamMember(projectId, memberId);
        if (response.success) {
          setTeamMembers((prev) => prev.filter((m) => m.id !== memberId));
        }
      } catch (err) {
        setError('Failed to remove team member');
      }
    }
  };

  const isAdmin = project?.userRole === ROLE.ADMIN;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <Navbar />
        <div className="flex-center" style={{ minHeight: '300px' }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <Navbar />
        <div className="container" style={{ paddingTop: '2rem' }}>
          <div className="alert alert-error">Project not found</div>
          <button onClick={() => navigate('/projects')} className="btn btn-primary">
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <button
              onClick={() => navigate('/projects')}
              className="btn btn-secondary btn-sm"
              style={{ marginBottom: '1rem' }}
            >
              ← Back to Projects
            </button>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="text-gray-600 mt-2">{project.description}</p>
            )}
          </div>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
          {/* Tasks Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 className="text-xl font-semibold">Tasks ({tasks.length})</h2>
              <button
                onClick={() => setShowTaskForm(!showTaskForm)}
                className="btn btn-primary btn-sm"
              >
                {showTaskForm ? 'Cancel' : '+ Add Task'}
              </button>
            </div>

            {showTaskForm && (
              <div className="card mb-6">
                <form onSubmit={handleAddTask}>
                  <div className="form-group">
                    <label className="form-label">Task Title</label>
                    <input
                      type="text"
                      value={taskFormData.title}
                      onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                      className="form-input"
                      placeholder="Task name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description (Optional)</label>
                    <textarea
                      value={taskFormData.description}
                      onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                      className="form-textarea"
                      placeholder="Task description"
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      value={taskFormData.priority}
                      onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value })}
                      className="form-select"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Task'}
                  </button>
                </form>
              </div>
            )}

            {tasks.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                <p className="text-gray-600">No tasks yet</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdate={(updated) => setTasks((prev) => prev.map((t) => t.id === updated.id ? updated : t))}
                    onDelete={(id) => setTasks((prev) => prev.filter((t) => t.id !== id))}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Team Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Team</h2>

            {isAdmin && (
              <button
                onClick={() => setShowTeamForm(!showTeamForm)}
                className="btn btn-primary btn-sm"
                style={{ width: '100%', marginBottom: '1rem' }}
              >
                {showTeamForm ? 'Cancel' : '+ Add Member'}
              </button>
            )}

            {showTeamForm && (
              <div className="card mb-6">
                <form onSubmit={handleAddTeamMember}>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      value={teamFormData.email}
                      onChange={(e) => setTeamFormData({ ...teamFormData, email: e.target.value })}
                      className="form-input"
                      placeholder="user@example.com"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select
                      value={teamFormData.role}
                      onChange={(e) => setTeamFormData({ ...teamFormData, role: e.target.value })}
                      className="form-select"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
                    {isSubmitting ? 'Adding...' : 'Add Member'}
                  </button>
                </form>
              </div>
            )}

            <div className="card">
              {teamMembers.length === 0 ? (
                <p className="text-gray-600 text-sm">No team members</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex gap-2" style={{ justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
                      <div style={{ flex: 1 }}>
                        <p className="text-sm font-semibold">{member.name}</p>
                        <p className="text-xs text-gray-600">{member.email}</p>
                        <span className="badge badge-primary" style={{ marginTop: '0.25rem' }}>
                          {member.role}
                        </span>
                      </div>
                      {isAdmin && member.user_id !== user?.id && (
                        <button
                          onClick={() => handleRemoveTeamMember(member.id)}
                          className="btn btn-sm btn-danger"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
