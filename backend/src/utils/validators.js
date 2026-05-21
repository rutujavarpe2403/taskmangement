export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateProjectName = (name) => {
  return name && name.trim().length > 0 && name.trim().length <= 255;
};

export const validateTaskTitle = (title) => {
  return title && title.trim().length > 0 && title.trim().length <= 255;
};

export const validateStatus = (status) => {
  return ['TODO', 'IN_PROGRESS', 'DONE'].includes(status);
};

export const validatePriority = (priority) => {
  return ['LOW', 'MEDIUM', 'HIGH'].includes(priority);
};

export const validateRole = (role) => {
  return ['ADMIN', 'MEMBER'].includes(role);
};

export const validateDueDate = (dueDate) => {
  if (!dueDate) return true;
  const date = new Date(dueDate);
  return !isNaN(date.getTime());
};
