# Team Task Manager

A full-stack web application for managing team projects, tasks, and team members with role-based access control (ADMIN/MEMBER).

## Features

- **Authentication**: Secure signup/login with JWT tokens and bcrypt password hashing
- **Project Management**: Create, update, and delete projects with team collaboration
- **Task Management**: Create, assign, and track tasks with status (TODO, IN_PROGRESS, DONE) and priority (LOW, MEDIUM, HIGH)
- **Team Management**: Add team members, assign roles, and manage permissions
- **Dashboard**: View task statistics, track progress, and filter by status/priority
- **Role-Based Access Control**: Admin users can manage teams and project settings; Members can create and manage tasks
- **Responsive Design**: Mobile-friendly interface built with CSS utilities and modern web standards

## Project Structure

```
v0-project/
├── backend/              # Express.js REST API
│   ├── src/
│   │   ├── config/       # Database configuration
│   │   ├── controllers/  # Business logic
│   │   ├── middleware/   # Auth & validation middleware
│   │   ├── routes/       # API routes
│   │   ├── utils/        # Validators & helpers
│   │   └── server.js     # Express app entry point
│   ├── schema.sql        # MySQL database schema
│   ├── package.json
│   └── .env              # Environment variables
│
└── frontend/             # React.js Frontend
    ├── src/
    │   ├── components/   # Reusable UI components
    │   ├── pages/        # Page components
    │   ├── services/     # API service layer
    │   ├── hooks/        # Custom React hooks
    │   ├── utils/        # Formatters, validators, constants
    │   ├── context/      # React context for auth
    │   ├── App.jsx       # Main app component
    │   └── index.js      # Entry point
    ├── public/           # Static files
    ├── package.json
    └── .env              # Environment variables
```

## Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn** or **pnpm**
- **MySQL** (v5.7 or higher)

## Installation

### 1. Database Setup

Create the MySQL database and tables:

```bash
# Connect to MySQL
mysql -u root -p

# Run the schema file
source backend/schema.sql;
```

Or manually create the database:
```sql
CREATE DATABASE task_manager;
USE task_manager;
-- Then run the SQL from backend/schema.sql
```

### 2. Backend Setup

```bash
cd backend
npm install
# or
pnpm install
```

Create `.env` file with your configuration:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=task_manager
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

Start the backend server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000/api`

### 3. Frontend Setup

```bash
cd frontend
npm install
# or
pnpm install
```

The `.env` file is already configured:
```
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login and receive JWT token

### Projects
- `POST /api/projects` - Create project (Auth required)
- `GET /api/projects` - Get user's projects
- `GET /api/projects/:id` - Get project details with team members
- `PUT /api/projects/:id` - Update project (Admin only)
- `DELETE /api/projects/:id` - Delete project (Admin only)

### Tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks` - Get tasks with filters (projectId, status, assigned_to, priority)
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task (Creator or Admin)
- `DELETE /api/tasks/:id` - Delete task (Creator or Admin)

### Team Members
- `POST /api/team/:projectId/members` - Add team member (Admin only)
- `GET /api/team/:projectId/members` - Get team members
- `PUT /api/team/:projectId/members/:memberId` - Update member role (Admin only)
- `DELETE /api/team/:projectId/members/:memberId` - Remove member (Admin only)

## Database Schema

### users
- `id` - Primary key
- `email` - Unique email address
- `password_hash` - Bcrypt hashed password
- `name` - User full name
- `created_at` - Timestamp
- `updated_at` - Timestamp

### projects
- `id` - Primary key
- `name` - Project name
- `description` - Project description
- `created_by` - User ID of creator
- `created_at` - Timestamp
- `updated_at` - Timestamp

### team_members
- `id` - Primary key
- `project_id` - Foreign key to projects
- `user_id` - Foreign key to users
- `role` - ENUM: 'ADMIN' or 'MEMBER'
- `joined_at` - Timestamp

### tasks
- `id` - Primary key
- `project_id` - Foreign key to projects
- `title` - Task title
- `description` - Task description
- `status` - ENUM: 'TODO', 'IN_PROGRESS', 'DONE'
- `priority` - ENUM: 'LOW', 'MEDIUM', 'HIGH'
- `assigned_to` - User ID assigned to task (nullable)
- `due_date` - Task due date (nullable)
- `created_by` - User ID of creator
- `created_at` - Timestamp
- `updated_at` - Timestamp

### task_comments (Optional)
- `id` - Primary key
- `task_id` - Foreign key to tasks
- `user_id` - Foreign key to users
- `comment` - Comment text
- `created_at` - Timestamp

## Authentication Flow

1. User signs up with email, password, and name
2. Password is hashed using bcryptjs
3. JWT token is generated and sent back
4. Token is stored in localStorage (frontend)
5. Token is included in Authorization header for all protected requests
6. Backend middleware validates token for each request
7. On token expiration or 401 response, user is logged out

## Role-Based Access Control

### ADMIN
- Create, update, and delete projects
- Manage team members and their roles
- Modify all tasks in the project
- Delete any task

### MEMBER
- Create and edit own tasks
- View project details and team members
- Update own task assignments
- Cannot modify project settings or manage team

Project creators are automatically assigned ADMIN role.

## Features Demo

### Dashboard
- View task statistics (Total, To Do, In Progress, Done, Overdue)
- Filter tasks by status and priority
- Quick task management with status updates

### Projects
- Create and organize projects
- Manage team members
- View all project tasks in one place
- Add tasks to projects

### Task Management
- Create tasks with title, description, priority, and due date
- Assign tasks to team members
- Change task status
- Delete tasks
- Color-coded priority and status indicators

### Team Management
- Add team members by email
- Assign roles (Admin/Member)
- Remove team members
- View team member list with roles

## Development Notes

- All API responses follow a consistent format: `{ success: boolean, data: any, error: string }`
- Validation is done both on frontend and backend
- SQL injection prevention through parameterized queries
- CORS is configured to allow frontend requests
- Passwords are hashed with 10 salt rounds
- JWT tokens expire after 24 hours

## Future Enhancements

- Task comments and activity log
- Email notifications
- Task attachments and file uploads
- Advanced filtering and search
- Task templates
- Time tracking
- Sprint management
- Kanban board view
- Dark mode
- User preferences and notifications settings

## Security Considerations

- Never commit `.env` files with secrets to version control
- Change JWT_SECRET in production
- Use HTTPS in production
- Implement rate limiting for API endpoints
- Add CSRF protection if using sessions
- Sanitize user inputs
- Keep dependencies updated
- Use environment variables for sensitive data

## Troubleshooting

**Database Connection Error**
- Ensure MySQL is running
- Check DB credentials in `.env`
- Verify database name is correct

**CORS Error**
- Check CORS_ORIGIN in backend `.env` matches frontend URL
- Ensure backend is running on correct port

**Token Errors**
- Clear localStorage and try logging in again
- Check JWT_SECRET is set in backend `.env`

**Task Not Showing**
- Verify you're part of the project (team member)
- Check database has projects with tasks
- Filter might be hiding tasks

## License

MIT License - feel free to use this project for learning and development purposes.
