import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { taskService } from '../services/taskService';
import { formatDate, isOverdue } from '../utils/formatters';
import { TASK_STATUS, TASK_PRIORITY } from '../utils/constants';

const ReportPage = () => {
  const { user } = useAuthContext();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const response = await taskService.getTasks();
        if (response.success) {
          setTasks(response.data);
        } else {
          setError(response.error || 'Unable to load report data');
        }
      } catch (err) {
        setError('Unable to load report data');
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const stats = {
    total: tasks.length,
    todo: tasks.filter((task) => task.status === TASK_STATUS.TODO).length,
    inProgress: tasks.filter((task) => task.status === TASK_STATUS.IN_PROGRESS).length,
    done: tasks.filter((task) => task.status === TASK_STATUS.DONE).length,
    overdue: tasks.filter((task) => isOverdue(task.due_date)).length
  };

  const priorityCounts = Object.values(TASK_PRIORITY).reduce((acc, priority) => {
    acc[priority] = tasks.filter((task) => task.priority === priority).length;
    return acc;
  }, {});

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#111827' }}>
            Work Report
          </h1>
          <p className="text-gray-600">
            A separate page for your activity summary and task performance.
          </p>
          <p className="text-gray-600 mt-2">
            Report generated for <strong>{user?.name || 'your account'}</strong>.
          </p>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}
        >
          <div className="card">
            <p className="text-gray-600 text-sm mb-2">Total Tasks</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm mb-2">In Progress</p>
            <p className="text-2xl font-bold" style={{ color: '#f59e0b' }}>{stats.inProgress}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm mb-2">Completed</p>
            <p className="text-2xl font-bold" style={{ color: '#10b981' }}>{stats.done}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm mb-2">Overdue</p>
            <p className="text-2xl font-bold" style={{ color: '#dc2626' }}>{stats.overdue}</p>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 className="font-semibold mb-4">Priority Breakdown</h2>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {Object.entries(priorityCounts).map(([priority, count]) => (
              <div key={priority} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#374151', fontWeight: 500 }}>{priority}</span>
                <span style={{ color: '#111827' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="font-semibold">Recent Tasks</h2>
            <span className="badge badge-primary">Latest</span>
          </div>

          {loading ? (
            <div className="flex-center" style={{ minHeight: '180px' }}>
              <div className="spinner"></div>
            </div>
          ) : tasks.length === 0 ? (
            <p className="text-gray-600">No task data available for reporting.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '0.75rem 0' }}>Task</th>
                    <th style={{ padding: '0.75rem 0' }}>Status</th>
                    <th style={{ padding: '0.75rem 0' }}>Priority</th>
                    <th style={{ padding: '0.75rem 0' }}>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.slice(0, 8).map((task) => (
                    <tr key={task.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '0.75rem 0', color: '#111827' }}>{task.title}</td>
                      <td style={{ padding: '0.75rem 0', color: '#4b5563' }}>{task.status}</td>
                      <td style={{ padding: '0.75rem 0', color: '#4b5563' }}>{task.priority}</td>
                      <td style={{ padding: '0.75rem 0', color: '#4b5563' }}>{formatDate(task.due_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
