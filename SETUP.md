# Quick Start Guide

## Step 1: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Step 2: Database Setup

### Create MySQL Database

```bash
# Open MySQL command line
mysql -u root -p

# Run the schema (from project root)
source backend/schema.sql;
```

Or if you're in the backend directory:
```bash
mysql -u root -p < schema.sql
```

### Verify Database Created
```sql
USE task_manager;
SHOW TABLES;
```

You should see: `team_members`, `task_comments`, `tasks`, `projects`, `users`

## Step 3: Configure Environment Variables

### Backend (.env)
File: `backend/.env`

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=task_manager
JWT_SECRET=your_secret_key_123_change_this_in_production
PORT=5000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

### Frontend (.env)
File: `frontend/.env`

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENVIRONMENT=development
```

## Step 4: Start the Application

### Terminal 1 - Start Backend Server
```bash
cd backend
npm run dev
```

You should see:
```
Server running on port 5000
API available at http://localhost:5000/api
```

Test the API:
```bash
curl http://localhost:5000/api/health
```

You should get:
```json
{"success":true,"message":"Server is running"}
```

### Terminal 2 - Start Frontend Server
```bash
cd frontend
npm start
```

The application will automatically open at `http://localhost:3000`

## Step 5: Test the Application

### Create an Account
1. Click "Sign Up" on the login page
2. Enter your name, email, and password
3. Click "Sign Up"

### Create a Project
1. Click "Projects" in the navigation
2. Click "+ New Project"
3. Enter project name and description
4. Click "Create Project"

### Add a Task
1. Click on a project to view details
2. Click "+ Add Task"
3. Enter task title, description, and priority
4. Click "Create Task"

### Manage Team
1. In project detail page, scroll to "Team" section
2. Click "+ Add Member"
3. Enter team member email and role
4. Click "Add Member"

## Troubleshooting

### Port Already in Use
If port 5000 is already in use:
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### MySQL Connection Failed
```bash
# Start MySQL (macOS with Homebrew)
brew services start mysql

# Or on Linux
sudo service mysql start

# Or on Windows (if installed as service)
net start MySQL57
```

### npm install Errors
Try clearing npm cache:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### React App Won't Start
```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Try again
npm start
```

### Database Schema Issues
```bash
# Drop and recreate database
mysql -u root -p
DROP DATABASE task_manager;
source backend/schema.sql;
```

## API Testing

### Test Login Endpoint
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Create Project (with token)
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"name":"Test Project","description":"A test project"}'
```

## Default Test Accounts

After the first signup, you can use that account. To create multiple accounts for testing:
1. Sign up with different emails
2. Each becomes a separate user
3. Add them to projects as team members

## Development Tips

### View Request Logs
Backend logs are printed to the console. Keep the backend terminal visible to see API calls.

### Check Network Requests
Open browser DevTools (F12) > Network tab to see frontend-to-backend requests.

### Reset Everything
If you want to start fresh:
```bash
# 1. Drop database
mysql -u root -p
DROP DATABASE task_manager;
EXIT;

# 2. Recreate database
mysql -u root -p < backend/schema.sql

# 3. Clear localStorage in browser
Open DevTools > Application > Local Storage > Clear All

# 4. Restart servers
# Kill both backend and frontend processes
# Start them again fresh
```

## Next Steps

1. **Explore the Dashboard**: View your tasks and project statistics
2. **Create More Projects**: Practice creating multiple projects and teams
3. **Test Permissions**: Sign up as different users and test admin/member roles
4. **Customize Styling**: Modify `frontend/src/index.css` to match your brand
5. **Add Features**: Extend the codebase with additional features

## File Locations Quick Reference

| Purpose | File Path |
|---------|-----------|
| Database Schema | `backend/schema.sql` |
| Backend Server | `backend/src/server.js` |
| Auth Routes | `backend/src/routes/auth.js` |
| Auth Controller | `backend/src/controllers/authController.js` |
| Frontend App | `frontend/src/App.jsx` |
| Login Page | `frontend/src/pages/LoginPage.jsx` |
| Dashboard | `frontend/src/pages/DashboardPage.jsx` |
| Projects Page | `frontend/src/pages/ProjectsPage.jsx` |
| Project Detail | `frontend/src/pages/ProjectDetailPage.jsx` |

## Performance Tips

- **Database Indexes**: Already set up on `email`, `project_id`, `user_id`, `status`, `due_date`
- **Connection Pool**: MySQL pool configured with 10 connections
- **JWT Tokens**: Tokens expire after 24 hours (configurable in authController)
- **Frontend Caching**: Consider adding React Query or SWR for better caching

## Production Deployment

When deploying to production:

1. Update `.env` files with production values
2. Use a production database host
3. Generate a strong JWT_SECRET
4. Enable HTTPS
5. Set CORS_ORIGIN to your production domain
6. Add rate limiting middleware
7. Use environment-specific configurations
8. Set up logging and monitoring
9. Use a process manager like PM2 for Node.js
10. Add database backups

For deployment examples, see the individual README files in `backend/` and `frontend/` directories.
