import { format, isPast, isToday, isYesterday, differenceInDays } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return format(d, 'MMM dd, yyyy');
};

export const formatDateShort = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return format(d, 'MMM dd');
};

export const formatDateWithTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return format(d, 'MMM dd, yyyy HH:mm');
};

export const getStatusColor = (status) => {
  const colors = {
    TODO: '#ef4444',
    IN_PROGRESS: '#f59e0b',
    DONE: '#10b981'
  };
  return colors[status] || '#6b7280';
};

export const getStatusBgColor = (status) => {
  const colors = {
    TODO: '#fee2e2',
    IN_PROGRESS: '#fef3c7',
    DONE: '#d1fae5'
  };
  return colors[status] || '#f3f4f6';
};

export const getPriorityColor = (priority) => {
  const colors = {
    LOW: '#3b82f6',
    MEDIUM: '#f59e0b',
    HIGH: '#ef4444'
  };
  return colors[priority] || '#6b7280';
};

export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  const d = new Date(dueDate);
  return isPast(d) && !isToday(d);
};

export const getDueDateLabel = (dueDate) => {
  if (!dueDate) return 'No due date';
  const d = new Date(dueDate);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  if (isPast(d)) return `Overdue by ${Math.abs(differenceInDays(d, new Date()))} days`;
  return formatDateShort(d);
};

export const getInitials = (name) => {
  return name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'U';
};
