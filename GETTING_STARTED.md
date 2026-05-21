# Getting Started with Team Task Manager

Welcome! This is a complete, production-ready team task management application. Here's everything you need to know to get up and running.

## What You Have

A **full-stack JavaScript application** with:
- React.js frontend (React 18)
- Express.js backend (Node.js)
- MySQL database
- JWT authentication
- Role-based access control
- Complete REST API

## Quick Start (5 Minutes)

### 1. Prerequisites
- Node.js installed
- MySQL installed and running
- 2 terminal windows

### 2. Setup Database
```bash
# Create the database with tables
mysql -u root -p < backend/schema.sql
# Enter your MySQL password when prompted
```

### 3. Install Dependencies
```bash
# Terminal 1 - Backend
cd backend
npm install

# Terminal 2 - Frontend
cd frontend
npm install
```

### 4. Start Servers
```bash
# Terminal 1 - Backend (stays running)
cd backend
npm run dev
# You should see: "Server running on port 5000"

# Terminal 2 - Frontend (in another terminal)
cd frontend
npm start
# Browser opens automatically to http://localhost:3000
```

### 5. Create Account & Test
1. Click "Sign Up"
2. Create a test account
3. Create a project
4. Add tasks to your project
5. Invite team members

That's it! You're ready to go.

## Documentation Files

| File | Purpose |
|------|---------|
| **README.md** | Complete feature list, API reference, database schema |
| **SETUP.md** | Detailed installation, troubleshooting, tips |
| **API_TESTING.md** | How to test API endpoints with examples |
| **DEVELOPER.md** | Architecture, code patterns, how to extend |
| **PROJECT_SUMMARY.md** | What was built, tech stack, status |
| **GETTING_STARTED.md** | This file - quick orientation |

## Project Structure

```
v0-project/
├── backend/              # Express REST API
│   ├── src/
│   │   ├── server.js
│   │   ├── controllers/  # Business logic
│   │   ├── routes/       # API endpoints
│   │   ├── middleware/   # Auth, validation
│   │   └── utils/        # Helpers
│   ├── schema.sql        # Database
│   ├── package.json
│   └── .env              # Config
│
└── frontend/             # React app
    ├── src/
    │   ├── App.jsx
    │   ├── pages/        # Login, Dashboard, Projects, etc.
    │   ├── components/   # Navbar, TaskCard, etc.
    │   ├── services/     # API calls
    │   └── utils/        # Helpers
    ├── public/index.html
    ├── package.json
    └── .env              # Config
```

## Key Features

### What Users Can Do
- Create accounts with secure login
- Create projects and organize work
- Create tasks with title, description, priority, due dates
- Assign tasks to team members
- Update task status (TODO → IN_PROGRESS → DONE)
- Invite others to projects
- View team member information
- Filter tasks by status and priority
- See dashboard with task statistics

### What's Behind the Scenes
- Secure JWT authentication
- Password hashing with bcrypt
- Database validation and constraints
- SQL injection prevention
- Role-based access (Admin/Member)
- Comprehensive error handling

## API Endpoints

All endpoints start with: `http://localhost:5000/api`

### Authentication (Sign up, Log in)
```
POST /auth/signup
POST /auth/login
```

### Projects (CRUD)
```
POST /projects          # Create
GET /projects           # List all
GET /projects/:id       # Get one
PUT /projects/:id       # Update (admin)
DELETE /projects/:id    # Delete (admin)
```

### Tasks (CRUD + Filters)
```
POST /tasks             # Create
GET /tasks              # Get (with filters)
GET /tasks/:id          # Get one
PUT /tasks/:id          # Update
DELETE /tasks/:id       # Delete
```

### Team (Manage members)
```
POST /team/:id/members        # Add
GET /team/:id/members         # List
PUT /team/:id/members/:id     # Update role
DELETE /team/:id/members/:id  # Remove
```

See **API_TESTING.md** for complete endpoint documentation with examples.

## Common Tasks

### "I want to modify the styling"
- Edit `frontend/src/index.css`
- Use CSS classes like: `btn-primary`, `card`, `badge`
- All styling is custom CSS (no tailwind in frontend)

### "I want to change what fields are required"
- Backend validation: `backend/src/utils/validators.js`
- Frontend validation: `frontend/src/utils/validators.js`
- Database schema: `backend/schema.sql`

### "I want to add a new page"
1. Create file: `frontend/src/pages/NewPage.jsx`
2. Import in `frontend/src/App.jsx`
3. Add route in App.jsx
4. Wrap with `<ProtectedRoute>` if authentication needed
5. Use existing patterns from other pages

### "I want to add a new API endpoint"
1. Create controller function in `backend/src/controllers/`
2. Add route in `backend/src/routes/`
3. Register route in `backend/src/server.js`
4. Use existing patterns from other endpoints

### "I want to add a new database field"
1. Update schema in `backend/schema.sql`
2. Drop and recreate database: `mysql -u root -p < backend/schema.sql`
3. Update controllers to handle new field
4. Update frontend form if needed

### "My database isn't working"
```bash
# Check if MySQL is running
mysql -u root -p -e "SELECT 1"

# Recreate database
mysql -u root -p < backend/schema.sql

# Verify tables exist
mysql -u root -p -e "USE task_manager; SHOW TABLES;"
```

### "My token expired, I'm logged out"
- This is normal - tokens expire after 24 hours
- Just log in again
- To change expiry: edit `backend/src/controllers/authController.js` line with `expiresIn`

## Development Workflow

### Making a Change

1. **Make the change** (edit a file)
2. **Check it works**:
   - Backend changes: Backend auto-restarts via nodemon
   - Frontend changes: React auto-refreshes
3. **Test in browser**: http://localhost:3000
4. **Check console**:
   - Browser DevTools (F12): JavaScript errors
   - Backend terminal: Server errors
5. **All good?** Commit your code

### Example: Adding a "Complete" Button to Tasks

1. Edit `frontend/src/components/TaskCard.jsx`
2. Add button to mark task as DONE
3. Call `taskService.updateTask()` on click
4. Save and refresh browser - change appears
5. Check that it works in UI and database updated

## Testing the Application

### Manual Testing
1. Create 2 user accounts
2. Create a project as user 1
3. Add user 2 as a team member
4. Create tasks as user 1
5. Assign to user 2
6. Log in as user 2 and see the task
7. Log in as user 1 and verify user 2 can't delete project

### API Testing
See **API_TESTING.md** for cURL commands and Postman examples.

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123"}'
```

## Deployment

When you're ready to deploy:

1. **Backend**: Use Node.js hosting (Heroku, Railway, Vercel, AWS, etc.)
2. **Frontend**: Use static hosting (Vercel, Netlify, GitHub Pages, AWS S3, etc.)
3. **Database**: Use managed MySQL (AWS RDS, DigitalOcean, Heroku, etc.)
4. **Update .env files** with production URLs

See **DEVELOPER.md** for deployment considerations.

## Troubleshooting

### Frontend won't start
```bash
# Kill any process on port 3000
lsof -i :3000
kill -9 <PID>

# Clear npm cache
npm cache clean --force

# Reinstall
rm -rf node_modules package-lock.json
npm install

# Try again
npm start
```

### Backend won't start
```bash
# Check if port 5000 is in use
lsof -i :5000
kill -9 <PID>

# Check database connection
mysql -u root -p -e "SELECT * FROM task_manager.users LIMIT 1;"

# Reinstall
rm -rf node_modules package-lock.json
npm install

# Try again
npm run dev
```

### Database errors
```bash
# Check if MySQL is running
mysql -u root -p

# Recreate database from scratch
mysql -u root -p
DROP DATABASE task_manager;
source backend/schema.sql;
```

### CORS or token errors
- Check backend `CORS_ORIGIN` in `.env` matches frontend URL
- Check `JWT_SECRET` is set in backend `.env`
- Check token is in localStorage (DevTools → Application → Local Storage)
- Check Authorization header includes "Bearer "

## Next Steps

1. **Customize the design**
   - Edit colors in `frontend/src/index.css`
   - Change logo text in `frontend/src/components/Navbar.jsx`

2. **Add more features**
   - Task comments
   - Notifications
   - Advanced filtering
   - Export functionality

3. **Prepare for production**
   - Update environment variables
   - Use strong JWT_SECRET
   - Set up database backups
   - Configure HTTPS
   - Add monitoring/logging

4. **Deploy**
   - Deploy backend to Node.js host
   - Deploy frontend to static host
   - Set up database in cloud
   - Update .env files
   - Test in production

## Key Files to Know

| File | What it does |
|------|-------------|
| `backend/schema.sql` | Database structure |
| `backend/src/server.js` | Starts the API |
| `backend/src/controllers/authController.js` | Login/signup logic |
| `frontend/src/App.jsx` | Route definitions |
| `frontend/src/pages/LoginPage.jsx` | Auth UI |
| `frontend/src/pages/DashboardPage.jsx` | Main dashboard |
| `frontend/src/services/api.js` | API communication |

## Getting Help

1. **Check the documentation**: README.md, SETUP.md, DEVELOPER.md
2. **Look at error messages**: Both in browser console and backend terminal
3. **Review similar code**: Look at existing components for patterns
4. **API Testing**: Use API_TESTING.md to test endpoints directly

## Important Reminders

- **Never commit `.env` files** with real secrets
- **Change JWT_SECRET** before deploying to production
- **Database backups** are your responsibility
- **HTTPS required** in production
- **Security audits** recommended before production

## You're All Set!

You have a fully functional team task management application. Start by:

1. Creating an account
2. Creating a project
3. Adding tasks
4. Inviting team members

Then explore the code, customize it, and deploy it!

Questions? Check the documentation files - they have detailed information on every aspect of the application.

Happy building! 🚀
