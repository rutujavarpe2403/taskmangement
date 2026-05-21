import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import TaskFilters from '../components/TaskFilters';
import TaskCard from '../components/TaskCard';
import { useAuthContext } from '../context/AuthContext';
import { taskService } from '../services/taskService';
import { formatDate, getDueDateLabel, isOverdue } from '../utils/formatters';
import { TASK_STATUS, ROLE } from '../utils/constants';

const DashboardPage = ({ role = ROLE.MEMBER }) => {
  const { user } = useAuthContext();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'ALL',
    priority: 'ALL'
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getTasks({});
      if (response.success) {
        setTasks(response.data);
        applyFilters(response.data);
      }
    } catch (err) {
      setError('Failed to load tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (tasksToFilter) => {
    let filtered = tasksToFilter;

    if (filters.status && filters.status !== 'ALL') {
      filtered = filtered.filter((t) => t.status === filters.status);
    }

    if (filters.priority && filters.priority !== 'ALL') {
      filtered = filtered.filter((t) => t.priority === filters.priority);
    }

    setFilteredTasks(filtered);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    applyFilters(tasks);
  };

  // Calculate stats
  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === TASK_STATUS.TODO).length,
    inProgress: tasks.filter((t) => t.status === TASK_STATUS.IN_PROGRESS).length,
    done: tasks.filter((t) => t.status === TASK_STATUS.DONE).length,
    overdue: tasks.filter((t) => isOverdue(t.due_date)).length
  };

  const handleTaskUpdate = (updatedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
    applyFilters(tasks);
  };

  const handleTaskDelete = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    applyFilters(tasks);
  };

  const roleLabel = role === ROLE.ADMIN ? 'Admin' : 'Member';
  const themeColor = role === ROLE.ADMIN ? '#1d4ed8' : '#047857';
  const accentColor = role === ROLE.ADMIN ? '#eff6ff' : '#d1fae5';

  const displayName = user?.name || roleLabel;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#111827' }}>{roleLabel} Dashboard</h1>
          <p className="text-gray-600">A professional overview for {roleLabel.toLowerCase()} users.</p>
        </div>
        <div className="card" style={{ backgroundColor: accentColor, borderColor: role === ROLE.ADMIN ? '#bfdbfe' : '#a7f3d0', marginBottom: '1.5rem' }}>
          <p style={{ margin: 0, fontWeight: 600, color: themeColor }}>Welcome back, {displayName}.</p>
          <p style={{ margin: '0.5rem 0 0', color: '#4b5563' }}>Your workspace is optimized for fast decision making and stronger team focus.</p>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div className="card">
            <p className="text-gray-600 text-sm mb-2">Total Tasks</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm mb-2">To Do</p>
            <p className="text-2xl font-bold" style={{ color: '#ef4444' }}>{stats.todo}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm mb-2">In Progress</p>
            <p className="text-2xl font-bold" style={{ color: '#f59e0b' }}>{stats.inProgress}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm mb-2">Done</p>
            <p className="text-2xl font-bold" style={{ color: '#10b981' }}>{stats.done}</p>
          </div>
          {stats.overdue > 0 && (
            <div className="card" style={{ backgroundColor: '#fee2e2', borderColor: '#fecaca' }}>
              <p className="text-gray-600 text-sm mb-2">Overdue</p>
              <p className="text-2xl font-bold" style={{ color: '#991b1b' }}>{stats.overdue}</p>
            </div>
          )}
        </div>

        {/* Filters */}
        <TaskFilters onFilterChange={handleFilterChange} />

        {/* Error */}
        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        {/* Tasks */}
        {loading ? (
          <div className="flex-center" style={{ minHeight: '300px' }}>
            <div className="spinner"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p className="text-gray-600">No tasks found</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={handleTaskUpdate}
                onDelete={handleTaskDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
