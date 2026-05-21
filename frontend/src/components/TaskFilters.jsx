import React, { useState } from 'react';
import { TASK_STATUS, TASK_PRIORITY } from '../utils/constants';

const TaskFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    status: 'ALL',
    priority: 'ALL'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = { status: 'ALL', priority: 'ALL' };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="card mb-6">
      <div className="flex gap-4" style={{ flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ marginBottom: '0' }}>
          <label className="form-label">Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="form-select"
          >
            <option value="ALL">All Statuses</option>
            <option value={TASK_STATUS.TODO}>To Do</option>
            <option value={TASK_STATUS.IN_PROGRESS}>In Progress</option>
            <option value={TASK_STATUS.DONE}>Done</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: '0' }}>
          <label className="form-label">Priority</label>
          <select
            name="priority"
            value={filters.priority}
            onChange={handleChange}
            className="form-select"
          >
            <option value="ALL">All Priorities</option>
            <option value={TASK_PRIORITY.LOW}>Low</option>
            <option value={TASK_PRIORITY.MEDIUM}>Medium</option>
            <option value={TASK_PRIORITY.HIGH}>High</option>
          </select>
        </div>

        <button
          onClick={handleReset}
          className="btn btn-secondary"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default TaskFilters;
