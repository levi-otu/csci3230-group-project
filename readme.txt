CSCI3230 Group Project Run Instructions

Project structure
- backend: Express + TypeScript + PostgreSQL
- web-dev-project: Vue 3 frontend
- Yjs collaboration is used for real-time code editor, chat, agenda, and drawing synchronization
- There is also a README.md inside both the backend and web-dev-project folders with more detailed instructions.
- If you get stuck on backend or frontend setup, check those folder-specific README files as well.

Prerequisites
- Node.js 22 recommended for backend scripts
- npm
- PostgreSQL running locally

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Yjs WebSocket: ws://localhost:1234

Recommended quick start on Windows
1. Open PowerShell in the project root.
2. Run the provided startup script:
   .\start-all.ps1
3. This starts:
   - backend on port 3000
   - Yjs WebSocket server on port 1234
   - frontend on port 5173

Manual setup

Backend
1. Open a terminal in the backend folder.
2. Install dependencies:
   npm install
3. Configure your environment variables for PostgreSQL and JWT.
4. Create the database in PostgreSQL (first time only):
   Make sure PostgreSQL is running, then create the database:
   - Using psql:
     CREATE DATABASE tutorsync;
   - Or using pgAdmin: create a new database named "tutorsync"
5. Run database migrations:
   npm run db:migrate
6. (Optional but recommended for demo) Seed default users:
   npm run db:seed
7. Start backend server:
   npm run dev

Yjs WebSocket server
1. Open a second terminal in the backend folder.
2. Start the Yjs server:
   npm run yjs:dev

Frontend
1. Open a terminal in the web-dev-project folder.
2. Install dependencies:
   npm install
3. Start frontend dev server:
   npm run dev

Application summary
- Users can register and log in.
- Admins can manage users.
- Instructors/admins can create sessions.
- Students can join sessions.
- Work sessions include:
  - collaborative code editor
  - collaborative chat
  - collaborative agenda/tasks
  - collaborative drawing board
- Drawings can also be saved to the backend database.

Accounts
- Add your actual demo/admin/test accounts here before submission.
- Example admin account:
  username: admin1
   password: Password123
- Example instructor account:
  username: tutor1
  password: Password123
- Example student account:
  username: student1
  password: Password123

Database notes
- Make sure PostgreSQL is running before starting the backend.
- If using a fresh database, run migrations before launching the app.

Fresh-start account creation
- This project includes a default users seeder (`npm run db:seed`) for `admin1`, `tutor1`, and `student1`.
- The frontend registration form does NOT allow selecting a role — all self-registered users default to `student`.
- To create accounts with specific roles (admin, instructor), use the API directly as shown below.

Using PowerShell (recommended on Windows):

1. Create admin account
   Invoke-RestMethod -Method Post -Uri "http://localhost:3000/auth/register" -ContentType "application/json" -Body '{"username":"admin1","email":"admin1@example.com","password":"Password123","role":"admin"}'

2. Create instructor account
   Invoke-RestMethod -Method Post -Uri "http://localhost:3000/auth/register" -ContentType "application/json" -Body '{"username":"tutor1","email":"tutor1@example.com","password":"Password123","role":"instructor"}'

3. Create student account
   Invoke-RestMethod -Method Post -Uri "http://localhost:3000/auth/register" -ContentType "application/json" -Body '{"username":"student1","email":"student1@example.com","password":"Password123","role":"student"}'
