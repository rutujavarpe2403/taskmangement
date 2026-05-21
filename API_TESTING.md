# API Testing Guide

This guide shows how to test all endpoints of the Task Manager API using cURL, Postman, or directly in the frontend.

## Prerequisites

- Backend running on `http://localhost:5000`
- Database created with schema
- Valid credentials for testing

## Base URL

```
http://localhost:5000/api
```

## Testing Tools

### Option 1: cURL (Command Line)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Option 2: Postman
1. Import collection or create requests manually
2. Use environment variables for token and base URL
3. Set Authorization header automatically

### Option 3: Frontend UI
- Use the application directly
- Check Network tab in DevTools
- See actual API calls being made

## Authentication Endpoints

### 1. Signup
Create a new user account.

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "john@example.com",
      "name": "John Doe"
    }
  }
}
```

**Test Cases:**
- ✅ Valid signup with all fields
- ❌ Missing email
- ❌ Invalid email format
- ❌ Password too short (<6 characters)
- ❌ Duplicate email

### 2. Login
Login with existing account credentials.

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "john@example.com",
      "name": "John Doe"
    }
  }
}
```

**Test Cases:**
- ✅ Valid credentials
- ❌ Wrong password
- ❌ Non-existent email
- ❌ Missing email or password

## Project Endpoints

**Required Header for all requests:**
```
Authorization: Bearer <token>
```

Replace `<token>` with actual JWT token from signup/login.

### 1. Create Project
Create a new project.

**Request:**
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "name": "Website Redesign",
    "description": "Redesign company website"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Website Redesign",
    "description": "Redesign company website",
    "created_by": 1,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Test Cases:**
- ✅ Create with name and description
- ✅ Create with only name
- ❌ Missing name
- ❌ Missing auth token
- ❌ Invalid token

### 2. Get User Projects
Retrieve all projects for the authenticated user.

**Request:**
```bash
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Website Redesign",
      "description": "Redesign company website",
      "created_by": 1,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Test Cases:**
- ✅ Get projects for authenticated user
- ❌ No auth token provided
- ❌ Invalid token

### 3. Get Project by ID
Get detailed information about a specific project.

**Request:**
```bash
curl -X GET http://localhost:5000/api/projects/1 \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Website Redesign",
    "description": "Redesign company website",
    "created_by": 1,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z",
    "team_members": [
      {
        "id": 1,
        "user_id": 1,
        "role": "ADMIN",
        "joined_at": "2024-01-15T10:30:00.000Z",
        "name": "John Doe",
        "email": "john@example.com"
      }
    ],
    "userRole": "ADMIN"
  }
}
```

**Test Cases:**
- ✅ Get project where user is member
- ❌ Get project where user is not member (403)
- ❌ Non-existent project ID (404)

### 4. Update Project
Update project details (admin only).

**Request:**
```bash
curl -X PUT http://localhost:5000/api/projects/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "name": "Website Redesign v2",
    "description": "Updated description"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Website Redesign v2",
    "description": "Updated description",
    "created_by": 1,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-16T11:45:00.000Z"
  }
}
```

**Test Cases:**
- ✅ Admin updates project
- ❌ Non-admin tries to update (403)
- ❌ Invalid project ID (404)
- ❌ No auth token (401)

### 5. Delete Project
Delete a project (admin only).

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/projects/1 \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Project deleted successfully"
  }
}
```

**Test Cases:**
- ✅ Admin deletes project
- ❌ Non-admin tries to delete (403)
- ❌ Non-existent project ID (404)

## Team Member Endpoints

### 1. Add Team Member
Add a user to project team (admin only).

**Request:**
```bash
curl -X POST http://localhost:5000/api/team/1/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "email": "jane@example.com",
    "role": "MEMBER"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "project_id": 1,
    "user_id": 2,
    "role": "MEMBER",
    "joined_at": "2024-01-16T12:00:00.000Z"
  }
}
```

**Test Cases:**
- ✅ Admin adds member with MEMBER role
- ✅ Admin adds member with ADMIN role
- ❌ Non-admin tries to add member (403)
- ❌ User doesn't exist (404)
- ❌ User already in team (409)

### 2. Get Team Members
Get all team members of a project.

**Request:**
```bash
curl -X GET http://localhost:5000/api/team/1/members \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "role": "ADMIN",
      "joined_at": "2024-01-15T10:30:00.000Z",
      "name": "John Doe",
      "email": "john@example.com"
    },
    {
      "id": 2,
      "user_id": 2,
      "role": "MEMBER",
      "joined_at": "2024-01-16T12:00:00.000Z",
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  ]
}
```

**Test Cases:**
- ✅ Get team for own project
- ❌ Get team for project not member of (403)
- ❌ Non-existent project (404)

### 3. Update Team Member Role
Update a team member's role (admin only).

**Request:**
```bash
curl -X PUT http://localhost:5000/api/team/1/members/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "role": "ADMIN"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "user_id": 2,
    "role": "ADMIN",
    "joined_at": "2024-01-16T12:00:00.000Z",
    "name": "Jane Smith",
    "email": "jane@example.com"
  }
}
```

**Test Cases:**
- ✅ Admin promotes member to admin
- ✅ Admin demotes admin to member
- ❌ Non-admin tries to update (403)
- ❌ Non-existent member (404)

### 4. Remove Team Member
Remove a user from project team (admin only).

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/team/1/members/2 \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Team member removed successfully"
  }
}
```

**Test Cases:**
- ✅ Admin removes member
- ❌ Admin tries to remove self (400)
- ❌ Non-admin tries to remove (403)
- ❌ Non-existent member (404)

## Task Endpoints

### 1. Create Task
Create a new task in a project.

**Request:**
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "projectId": 1,
    "title": "Design homepage",
    "description": "Create modern homepage design",
    "priority": "HIGH",
    "assigned_to": 2,
    "due_date": "2024-02-01"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "project_id": 1,
    "title": "Design homepage",
    "description": "Create modern homepage design",
    "status": "TODO",
    "priority": "HIGH",
    "assigned_to": 2,
    "due_date": "2024-02-01",
    "created_by": 1,
    "created_at": "2024-01-16T13:00:00.000Z"
  }
}
```

**Test Cases:**
- ✅ Create with all fields
- ✅ Create with minimal fields
- ❌ Missing title
- ❌ Invalid priority
- ❌ Invalid due date
- ❌ Non-project member (403)

### 2. Get Tasks
Get all tasks with optional filters.

**Request:**
```bash
curl -X GET "http://localhost:5000/api/tasks?projectId=1&status=TODO&priority=HIGH" \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "project_id": 1,
      "title": "Design homepage",
      "description": "Create modern homepage design",
      "status": "TODO",
      "priority": "HIGH",
      "assigned_to": 2,
      "due_date": "2024-02-01",
      "created_by": 1,
      "created_at": "2024-01-16T13:00:00.000Z",
      "assigned_user_name": "Jane Smith",
      "assigned_user_email": "jane@example.com",
      "created_by_name": "John Doe"
    }
  ]
}
```

**Filter Options:**
- `projectId` - Filter by project
- `status` - TODO, IN_PROGRESS, DONE
- `assigned_to` - User ID
- `priority` - LOW, MEDIUM, HIGH

**Test Cases:**
- ✅ Get all tasks
- ✅ Filter by project
- ✅ Filter by status
- ✅ Multiple filters
- ❌ Invalid filter value

### 3. Get Task by ID
Get detailed information about a task.

**Request:**
```bash
curl -X GET http://localhost:5000/api/tasks/1 \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "project_id": 1,
    "title": "Design homepage",
    "description": "Create modern homepage design",
    "status": "TODO",
    "priority": "HIGH",
    "assigned_to": 2,
    "due_date": "2024-02-01",
    "created_by": 1,
    "created_at": "2024-01-16T13:00:00.000Z",
    "assigned_user_name": "Jane Smith",
    "created_by_name": "John Doe"
  }
}
```

**Test Cases:**
- ✅ Get task from project you're in
- ❌ Get task from project you're not in (403)
- ❌ Non-existent task (404)

### 4. Update Task
Update task details (creator or admin).

**Request:**
```bash
curl -X PUT http://localhost:5000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "title": "Design modern homepage",
    "status": "IN_PROGRESS",
    "priority": "MEDIUM"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "project_id": 1,
    "title": "Design modern homepage",
    "description": "Create modern homepage design",
    "status": "IN_PROGRESS",
    "priority": "MEDIUM",
    "assigned_to": 2,
    "due_date": "2024-02-01",
    "created_by": 1,
    "created_at": "2024-01-16T13:00:00.000Z",
    "updated_at": "2024-01-16T14:30:00.000Z"
  }
}
```

**Test Cases:**
- ✅ Creator updates task
- ✅ Admin updates task
- ❌ Non-creator/non-admin updates (403)
- ❌ Invalid status
- ❌ Non-existent task (404)

### 5. Delete Task
Delete a task (creator or admin).

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/tasks/1 \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Task deleted successfully"
  }
}
```

**Test Cases:**
- ✅ Creator deletes task
- ✅ Admin deletes task
- ❌ Non-creator/non-admin (403)
- ❌ Non-existent task (404)

## Error Responses

All endpoints return consistent error format:

**401 Unauthorized**
```json
{
  "success": false,
  "error": "Access token required" or "Invalid or expired token"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "error": "Access denied" or "Insufficient permissions"
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": "Project not found" or "Task not found"
}
```

**400 Bad Request**
```json
{
  "success": false,
  "error": "Validation error message"
}
```

**409 Conflict**
```json
{
  "success": false,
  "error": "Email already registered" or "User is already a team member"
}
```

**500 Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Testing Workflow

### Complete Workflow Example

```bash
# 1. Signup
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}' \
  | jq -r '.data.token')

echo "Token: $TOKEN"

# 2. Create project
PROJECT=$(curl -s -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test Project","description":"Test"}' \
  | jq -r '.data.id')

echo "Project ID: $PROJECT"

# 3. Create task
TASK=$(curl -s -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"projectId\":$PROJECT,\"title\":\"Test Task\",\"priority\":\"HIGH\"}" \
  | jq -r '.data.id')

echo "Task ID: $TASK"

# 4. Update task status
curl -s -X PUT http://localhost:5000/api/tasks/$TASK \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"IN_PROGRESS"}' | jq

# 5. Get all tasks
curl -s -X GET "http://localhost:5000/api/tasks?projectId=$PROJECT" \
  -H "Authorization: Bearer $TOKEN" | jq
```

## Postman Collection

Import this collection into Postman for easy testing:

1. File → Import
2. Paste the JSON below or import from a file
3. Set environment variables: `baseUrl` and `token`
4. Run requests in sequence

See `/postman_collection.json` if available, or create requests manually following the examples above.

## Performance Testing

### Load Testing Example

```bash
# Test API with 100 requests
for i in {1..100}; do
  curl -s -X GET http://localhost:5000/api/health &
done
wait
echo "Completed 100 health check requests"
```

### Benchmark

Expected response times:
- GET requests: <50ms
- POST/PUT requests: <100ms
- Database queries: <30ms

## Troubleshooting API

### Common Issues

**401 Unauthorized**
- Token is missing or invalid
- Token has expired
- Authorization header format is wrong
- Should be: `Authorization: Bearer <token>`

**403 Forbidden**
- User is not part of the project
- User doesn't have required role
- Non-creator trying to modify task

**404 Not Found**
- Resource ID doesn't exist
- User is not part of project (can't access)

**500 Server Error**
- Database connection failed
- Invalid SQL query
- Check backend logs for details

### Debug Mode

Add logging to backend:
```javascript
console.log('[v0] Request:', req.method, req.path);
console.log('[v0] User:', req.user);
console.log('[v0] Body:', req.body);
```

Check frontend network tab for:
- Request headers
- Request body
- Response status
- Response body

---

For more information, see README.md and DEVELOPER.md
