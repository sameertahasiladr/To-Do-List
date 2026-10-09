## DoIt Today — To-Do List 

**AI Coding Agent:** GitHub Copilot Agent

## Prompt Used for User Management and RBAC

You are working on my existing, fully developed Full Stack To-Do List application, **DoIt Today**.

Do not create a new project or rebuild the application. Inspect the existing GitHub repository and review its current implementation before making any changes.

### Existing Technology Stack

- React and TypeScript
- Node.js and Express
- PostgreSQL
- Prisma ORM
- JWT authentication
- bcryptjs
- Zod validation

### Existing Backend Structure

The project already contains:

- Express server in `server/src/index.ts`
- Prisma connection in `server/src/db.ts`
- Authentication routes in `server/src/routes/auth.ts`
- Task routes in `server/src/routes/tasks.ts`
- User-management routes in `server/src/routes/users.ts`
- Authentication and authorization middleware in `server/src/middleware/auth.ts`
- Request validation schemas in `server/src/validation.ts`
- Prisma User and Task models in `server/prisma/schema.prisma`
- Existing React frontend and task-management functionality

### Objective

Review the existing User Management and Role-Based Access Control (RBAC) implementation against the assessment requirements. Fix only genuine gaps within the permitted AI-assisted scope.

**Do not rewrite functionality that is already working. Reuse the existing code and architecture.**

### 1. Authentication and Authorization

Inspect `server/src/middleware/auth.ts`.

The existing implementation provides:

- JWT authentication through `authenticate`
- Role authorization through `authorize`
- User identity and role loaded from the database
- HTTP 401 responses for missing or invalid authentication
- HTTP 403 responses for insufficient permissions

Verify that these protections work correctly. Reuse the existing middleware instead of creating duplicate authorization middleware unless a genuine issue requires a change.

Preserve existing login functionality and `/api/auth/me`. Do not assume a registration endpoint exists without checking the actual code.

### 2. User Management

Inspect `server/src/routes/users.ts`.

Verify that only authenticated administrators can:

- View all registered users
- Create user accounts
- Edit user information
- Delete user accounts
- Assign or change user roles

Verify that:

- Passwords are hashed using bcryptjs.
- Password hashes are never returned in API responses.
- Duplicate email addresses are handled appropriately.
- Invalid roles are rejected.
- User input follows the existing validation schemas.
- Administrators cannot accidentally delete their own account or demote themselves, according to the existing safeguards.
- User deletion respects the existing Prisma relationship and cascade behavior.

The current user routes already include listing, creation, editing, and deletion. Role changes are handled through the existing user-update route. Do not add duplicate routes without a demonstrated requirement.

### 3. Task Ownership and Role Restrictions

Inspect `server/src/routes/tasks.ts`.

Verify the existing RBAC behavior:

- Administrators can view all tasks.
- Regular users can view only their own tasks.
- Regular users can create tasks only for themselves.
- Regular users can update and delete only their own tasks.
- Regular users cannot access or modify another user's tasks by changing a task ID.
- User-supplied `userId` values cannot override the authenticated user's identity during task creation.
- Administrators cannot create, update, delete, or change the status of tasks through the task-management API.

The current implementation scopes task listings by role, derives the task owner from the authenticated user during creation, and checks ownership during updates and deletions.

Verify these protections without rewriting the general To-Do functionality.

If a genuine RBAC gap exists, make only the minimum necessary change to enforce the relevant permission.

### 4. Administrator Task Access

Review whether the existing `GET /api/tasks` endpoint correctly allows administrators to view all tasks while restricting regular users to their own tasks.

A separate `GET /api/admin/tasks` endpoint is not currently required if the existing protected endpoint satisfies the assessment. Add one only if there is a clear requirement that cannot be met by the current route.

### 5. Security and Error Handling

Within the permitted User Management and RBAC scope, verify that:

- Missing or invalid JWTs receive HTTP 401.
- Authenticated users without permission receive HTTP 403.
- Missing resources receive appropriate HTTP 404 responses.
- Duplicate emails receive HTTP 409 responses where appropriate.
- Invalid user-management input is rejected.
- Database errors are handled safely.
- Sensitive information, especially password hashes, is not exposed.

Preserve the existing Zod validation and error-handling architecture. Do not introduce unrelated validation changes.

### 6. Preserve Existing Functionality

Do not:

- Create a new project.
- Rebuild the React frontend.
- Rewrite general task CRUD functionality.
- Change CSS or styling.
- Add bonus features.
- Replace the existing Prisma connection.
- Rewrite working authentication.
- Modify the database schema unless a genuine RBAC requirement cannot otherwise be satisfied.
- Create duplicate routes, controllers, middleware, or services unnecessarily.

All changes must remain within the assessment's permitted User Management and RBAC scope.

### 7. Verification

Review the existing code and run the available backend TypeScript build or relevant tests if the environment permits.

Report actual results. Do not claim that tests passed unless they were executed successfully.

Check the following cases:

**Admin tests**
- Admin can list users.
- Admin can create a user.
- Admin can edit user details.
- Admin can change a user's role.
- Admin can delete another user.
- Admin can view all tasks.
- Admin cannot modify tasks through the task-management API.

**User tests**
- User can view their own tasks.
- User can create tasks for themselves.
- User can update and delete their own tasks.
- User cannot access or modify another user's tasks.

**Security tests**
- Missing JWT returns 401.
- Invalid JWT returns 401.
- User accessing `/api/users` receives 403.
- User attempting to access another user's task receives 403 or 404.
- User cannot assign themselves a different `userId` through a task-creation request.

### 8. Final Report

At the end, provide:

1. The existing RBAC functionality that was already correct.
2. Any genuine issues discovered.
3. The exact files modified and the reason for each change.
4. Build and test results.
5. Any remaining security concerns.

Make no unnecessary changes. The application is already developed, and the objective is to verify and correct only the permitted User Management and RBAC functionality.

