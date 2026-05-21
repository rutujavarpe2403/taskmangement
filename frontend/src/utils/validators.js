export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateName = (name) => {
  return name && name.trim().length > 0;
};

export const validateProjectName = (name) => {
  return name && name.trim().length > 0;
};

export const validateTaskTitle = (title) => {
  return title && title.trim().length > 0;
};

export const getValidationErrors = (formData) => {
  const errors = {};

  if (!formData.email || !validateEmail(formData.email)) {
    errors.email = 'Valid email is required';
  }

  if (!formData.password || !validatePassword(formData.password)) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (formData.name !== undefined && !validateName(formData.name)) {
    errors.name = 'Name is required';
  }

  return errors;
};
