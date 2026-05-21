import React, { useState } from 'react';
import { formatDateShort, getStatusColor, getPriorityColor, isOverdue, getDueDateLabel, getStatusBgColor } from '../utils/formatters';
import { TASK_STATUS } from '../utils/constants';
import { taskService } from '../services/taskService';

const TaskCard = ({ task, onUpdate, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      const response = await taskService.updateTask(task.id, { status: newStatus });
      if (response.success) {
        onUpdate(response.data);
        setShowStatusMenu(false);
      }
    } catch (err) {
      console.error('Failed to update task status', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        setLoading(true);
        const response = await taskService.deleteTask(task.id);
        if (response.success) {
          onDelete(task.id);
        }
      } catch (err) {
        console.error('Failed to delete task', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const statusOptions = [
    TASK_STATUS.TODO,
    TASK_STATUS.IN_PROGRESS,
    TASK_STATUS.DONE
  ];

  const overdue = task.due_date && isOverdue(task.due_date);

  return (
    <div className="card" style={{ position: 'relative' }}>
      {/* Priority Badge */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '500',
        backgroundColor: getPriorityColor(task.priority),
        color: 'white'
      }}>
        {task.priority}
      </div>

      {/* Title */}
      <h3 className="font-semibold mb-2" style={{ paddingRight: '80px' }}>
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3" style={{ display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {task.description}
        </p>
      )}

      {/* Meta Info */}
      <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap', fontSize: '0.75rem' }}>
        {task.due_date && (
          <div className="badge" style={{
            backgroundColor: overdue ? '#fee2e2' : '#dbeafe',
            color: overdue ? '#991b1b' : '#1e40af'
          }}>
            {getDueDateLabel(task.due_date)}
          </div>
        )}
        {task.assigned_user_name && (
          <div className="badge badge-primary">
            {task.assigned_user_name}
          </div>
        )}
      </div>

      {/* Status & Actions */}
      <div className="flex gap-2" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className="btn btn-sm"
            style={{
              backgroundColor: getStatusBgColor(task.status),
              color: getStatusColor(task.status),
              border: `1px solid ${getStatusColor(task.status)}`,
              cursor: 'pointer'
            }}
            disabled={loading}
          >
            {task.status.replace(/_/g, ' ')}
          </button>

          {showStatusMenu && (
            <div className="card" style={{
              position: 'absolute',
              top: '32px',
              left: '0',
              minWidth: '150px',
              zIndex: 100,
              padding: '0.5rem'
            }}>
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className="btn btn-secondary btn-sm"
                  style={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    marginBottom: '0.25rem'
                  }}
                  disabled={status === task.status || loading}
                >
                  {status.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleDelete}
          className="btn btn-sm"
          style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            border: '1px solid #fecaca',
            cursor: 'pointer'
          }}
          disabled={loading}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
