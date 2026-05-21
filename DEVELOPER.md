# Developer Guide

## Architecture Overview

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 | UI Framework |
| Styling | CSS Utilities | Custom CSS classes |
| Backend | Express.js | REST API |
| Database | MySQL | Data persistence |
| Authentication | JWT + bcryptjs | Auth & security |
| HTTP Client | Axios | API communication |
| Validation | Zod | Data validation |
| Date Handling | date-fns | Date utilities |

### Application Flow

```
User Browser
    ↓
React Frontend (Port 3000)
    ↓
Axios HTTP Client
    ↓
Express API (Port 5000)
    ↓
MySQL Database (Port 3306)
```

## Backend Architecture

### Folder Structure
```
backend/src/
├── config/
│   └── database.js           # MySQL connection pool
├── controllers/
│   ├── authController.js     # Auth logic
│   ├── projectController.js  # Project CRUD
│   ├── taskController.js     # Task CRUD
│   └── teamController.js     # Team management
├── middleware/
│   └── auth.js              # JWT verification & role check
├── routes/
│   ├── auth.js              # /api/auth routes
│   ├── projects.js          # /api/projects routes
│   ├── tasks.js             # /api/tasks routes
│   └── team.js              # /api/team routes
├── utils/
│   └── validators.js        # Input validation
└── server.js                # Express app setup
```

### Request Flow
```
HTTP Request
    ↓
Express Middleware (CORS, Body Parser)
    ↓
Route Handler
    ↓
Middleware (Auth, Validation)
    ↓
Controller
    ↓
Database Query
    ↓
Response JSON
```

### Adding a New API Endpoint

1. **Create Controller Function** (e.g., `controllers/newController.js`)
```javascript
export const newAction = async (req, res) => {
  try {
    // Business logic here
    const result = await someQuery();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error message' });
  }
};
```

2. **Create Route** (e.g., `routes/new.js`)
```javascript
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { newAction } from '../controllers/newController.js';

const router = express.Router();
router.post('/', authenticateToken, newAction);
export default router;
```

3. **Register Route in server.js**
```javascript
import newRoutes from './routes/new.js';
app.use('/api/new', newRoutes);
```

## Frontend Architecture

### Folder Structure
```
frontend/src/
├── components/
│   ├── Navbar.jsx           # Navigation bar
│   ├── ProtectedRoute.jsx   # Route guard
│   ├── TaskCard.jsx         # Task display component
│   ├── TaskFilters.jsx      # Filter component
├── pages/
│   ├── LoginPage.jsx        # Auth
│   ├── SignupPage.jsx       # Registration
│   ├── DashboardPage.jsx    # Main dashboard
│   ├── ProjectsPage.jsx     # Projects list
│   └── ProjectDetailPage.jsx # Project detail
├── services/
│   ├── api.js               # Axios instance & interceptors
│   ├── authService.js       # Auth API calls
│   ├── projectService.js    # Project API calls
│   ├── taskService.js       # Task API calls
│   └── teamService.js       # Team API calls
├── hooks/
│   └── useAuth.js           # Auth hook
├── context/
│   └── AuthContext.js       # Auth state
├── utils/
│   ├── formatters.js        # Date/string formatting
│   ├── validators.js        # Form validation
│   └── constants.js         # App constants
├── App.jsx                  # Main app component
├── index.js                 # React entry point
└── index.css                # Global styles
```

### Component Hierarchy
```
App
├── ProtectedRoute (guards authenticated routes)
│   ├── DashboardPage
│   │   ├── Navbar
│   │   ├── TaskFilters
│   │   └── TaskCard (multiple)
│   ├── ProjectsPage
│   │   ├── Navbar
│   │   └── Project Cards
│   └── ProjectDetailPage
│       ├── Navbar
│       ├── TaskCard (multiple)
│       └── Team List
├── LoginPage
└── SignupPage
```

### Creating a New Page

1. **Create Page Component** (e.g., `pages/NewPage.jsx`)
```javascript
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuthContext } from '../context/AuthContext';

const NewPage = () => {
  const { user } = useAuthContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch data
    } catch (err) {
      // Handle error
    }
  };

  return (
    <div>
      <Navbar />
      {/* Page content */}
    </div>
  );
};

export default NewPage;
```

2. **Add Route in App.jsx**
```javascript
import NewPage from './pages/NewPage';

<Route
  path="/new-page"
  element={
    <ProtectedRoute>
      <NewPage />
    </ProtectedRoute>
  }
/>
```

## Authentication Flow

### Login Process
```
1. User enters email & password
2. Frontend validates input
3. POST /api/auth/login with credentials
4. Backend validates email exists
5. Backend bcrypt.compare(password, hash)
6. JWT token generated
7. Token stored in localStorage
8. User state updated in context
9. Redirect to /dashboard
```

### Request with Token
```
1. Axios interceptor adds token to headers
2. Authorization: Bearer <token>
3. Backend auth middleware verifies token
4. Validates user is part of project
5. Adds user data to req.user
6. Proceed with controller logic
```

### Logout Process
```
1. User clicks logout
2. localStorage cleared (token & user)
3. Auth context updated
4. Redirect to /login
5. axios interceptor redirects on 401
```

## Database Patterns

### Query Pattern
```javascript
// Always use parameterized queries to prevent SQL injection
const connection = await pool.getConnection();
const [results] = await connection.execute(
  'SELECT * FROM users WHERE email = ?',
  [email]
);
connection.release();
```

### Transaction Pattern (if needed)
```javascript
const connection = await pool.getConnection();
try {
  await connection.beginTransaction();
  // Multiple queries
  await connection.execute(query1);
  await connection.execute(query2);
  await connection.commit();
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  connection.release();
}
```

### Common Queries
```javascript
// Select single
const [users] = await connection.execute(
  'SELECT * FROM users WHERE id = ?',
  [id]
);
const user = users[0];

// Select multiple
const [tasks] = await connection.execute(
  'SELECT * FROM tasks WHERE project_id = ?',
  [projectId]
);

// Insert
const [result] = await connection.execute(
  'INSERT INTO users (email, name) VALUES (?, ?)',
  [email, name]
);
const newId = result.insertId;

// Update
await connection.execute(
  'UPDATE tasks SET status = ? WHERE id = ?',
  [status, taskId]
);

// Delete
await connection.execute(
  'DELETE FROM tasks WHERE id = ?',
  [taskId]
);
```

## Error Handling

### Backend Pattern
```javascript
export const someAction = async (req, res) => {
  try {
    // Validation
    if (!req.body.required) {
      return res.status(400).json({
        success: false,
        error: 'Required field missing'
      });
    }

    // Authorization
    if (user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    // Logic
    const result = await query();

    // Success
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    // Server error
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
```

### Frontend Pattern
```javascript
const handleAction = async () => {
  try {
    const response = await apiService.doSomething();
    if (response.success) {
      // Update state
      setState(response.data);
    } else {
      setError(response.error);
    }
  } catch (err) {
    const errorMsg = err.response?.data?.error || 'An error occurred';
    setError(errorMsg);
    console.error(err);
  }
};
```

## State Management

### Using Auth Context
```javascript
import { useAuthContext } from '../context/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, logout } = useAuthContext();

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <div>Welcome {user.name}</div>;
};
```

### Using Local State
```javascript
const [tasks, setTasks] = useState([]);
const [filter, setFilter] = useState('TODO');

// Update single item
setTasks(prev => prev.map(t =>
  t.id === taskId ? { ...t, status } : t
));

// Add item
setTasks(prev => [newTask, ...prev]);

// Remove item
setTasks(prev => prev.filter(t => t.id !== taskId));
```

## Validation Patterns

### Backend Validation
```javascript
// In validators.js
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// In controller
if (!validateEmail(req.body.email)) {
  return res.status(400).json({ error: 'Invalid email' });
}
```

### Frontend Validation
```javascript
// In utils/validators.js
export const validateEmail = (email) => { /* ... */ };

// In component
const [errors, setErrors] = useState({});

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
  if (errors[name]) {
    setErrors(prev => ({ ...prev, [name]: '' }));
  }
};

const validateForm = () => {
  const newErrors = {};
  if (!validateEmail(formData.email)) {
    newErrors.email = 'Invalid email';
  }
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

## Styling Guidelines

### CSS Class Organization
```css
/* Layout */
.container { /* max-width and centering */ }
.flex { display: flex; }
.flex-col { flex-direction: column; }

/* Spacing */
.p-4 { padding: 1rem; }
.m-4 { margin: 1rem; }
.gap-4 { gap: 1rem; }

/* Typography */
.text-sm { font-size: 0.875rem; }
.font-bold { font-weight: bold; }

/* Colors */
.bg-white { background: white; }
.text-gray-600 { color: #4b5563; }

/* Components */
.btn { /* button styles */ }
.card { /* card styles */ }
.badge { /* badge styles */ }
```

### Adding New Styles
1. Add class to `index.css`
2. Use in components as className
3. Keep classes small and reusable
4. Use semantic names (e.g., `btn-primary`, `text-success`)

## Testing Your API

### Using cURL
```bash
# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get Projects (with token)
curl http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman
1. Import the API endpoints into Postman
2. Create environment variables for `token` and `baseUrl`
3. In signup/login response, save token: `pm.environment.set("token", pm.response.json().data.token)`
4. Use `{{token}}` in Authorization header for protected routes

## Performance Optimization

### Backend
- Database indexes already set up
- Connection pooling configured
- Parameterized queries (prevent SQL injection)
- Error handling prevents crashes

### Frontend
- Lazy loading routes (can be added)
- Memoization for components (can be added)
- Image optimization (no images by default)
- CSS minification (built into React build)

## Future Enhancements

### High Priority
- [ ] Task comments system
- [ ] Real-time notifications
- [ ] Advanced filtering and search
- [ ] Bulk task operations

### Medium Priority
- [ ] Task attachments
- [ ] Activity logs
- [ ] Email notifications
- [ ] Two-factor authentication

### Low Priority
- [ ] Dark mode
- [ ] Mobile app (React Native)
- [ ] Analytics dashboard
- [ ] API documentation (Swagger)

## Debugging Tips

### Backend Debugging
```javascript
// Add console logs
console.log('[v0] User ID:', req.user.id);
console.log('[v0] Query result:', result);

// Use try-catch for better error messages
catch (error) {
  console.error('Error context:', error);
}
```

### Frontend Debugging
```javascript
// React DevTools
// - Check component state and props
// - Trace component re-renders

// Network tab
// - Check API requests/responses
// - Look for 401/403 errors

// Local Storage
// - Verify token is stored
// - Check user data

// Console
console.log('[v0] Task data:', taskData);
```

## Code Style

- Use ES6 modules (`import/export`)
- Use arrow functions
- Use const/let (not var)
- Use descriptive variable names
- Add comments for complex logic
- Keep functions small and focused
- Use async/await (not .then())

## Resources

- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [MySQL Docs](https://dev.mysql.com/doc/)
- [JWT.io](https://jwt.io/)
- [Axios Docs](https://axios-http.com/)
- [date-fns Docs](https://date-fns.org/)

## Support

For issues or questions:
1. Check the main README.md
2. Review SETUP.md for installation issues
3. Check console/terminal for error messages
4. Verify environment variables are set
5. Ensure database is running and populated
