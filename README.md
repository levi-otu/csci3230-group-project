# TutorSync

TutorSync is a full-stack collaborative study platform built for students learning code. It combines a Vue frontend, an Express backend, PostgreSQL persistence, and Yjs-powered real-time collaboration for shared work sessions.

## Tech Stack

- Frontend: Vue, TypeScript, Bulma
- Backend: Node.js, Express, TypeScript
- Realtime collaboration: Yjs, y-websocket, WebSocket
- Visualization: D3.js
- Additional libraries used in the project: jQuery, CodeMirror

## Main Features

- User authentication and role-based access
- Admin user management
- Session creation, editing, joining, and tracking
- Collaborative work sessions with:
  - shared code editor
  - shared chat
  - shared agenda/tasks
  - shared drawing board
- Drawing export and backend persistence
- Dashboard charts and data visualizations

## Project Structure

```text
csci3230-group-project/
├── backend/            Express API, Sequelize models, migrations, Yjs server integration
├── web-dev-project/    Vue frontend application
├── group_members.html  
├── contributions.txt   
├── readme.txt          
├── start-all.ps1       Windows startup helper
├── start-all.sh        Unix startup helper
└── README.md           Project overview
```
We have all the instruction to run the application in readme.txt.
For more detailed setup and usage instructions, also check the README files inside [backend](backend/README.md) and [web-dev-project](web-dev-project/README.md). If you get stuck on backend or frontend setup, those folder-specific guides should be checked as well.

## Quick Start

### Windows

From the project root, run:

```powershell
.\start-all.ps1
```

This starts:

- Backend API on `http://localhost:3000`
- Yjs WebSocket server on `ws://localhost:1234`
- Frontend on `http://localhost:5173`

### Manual Startup

Backend:

```bash
cd backend
npm install
npm run db:migrate
npm run dev
```

Yjs WebSocket server:

```bash
cd backend
npm run yjs:dev
```

Frontend:

```bash
cd web-dev-project
npm install
npm run dev
```

## Realtime Collaboration

TutorSync uses Yjs to synchronize shared state inside a room. Each work session creates a shared Yjs document that stores:

- code editor text
- chat messages
- drawing strokes
- agenda items

The frontend connects to the backend WebSocket server, and Yjs propagates updates to all users in the same room. Long-term data such as users, sessions, and saved drawing snapshots are stored through the Express API and PostgreSQL.

## User Roles

TutorSync supports three roles: **student**, **instructor**, and **admin**.

All users who register through the login page are automatically assigned the **student** role. To create accounts with `instructor` or `admin` roles, use the API directly . See `readme.txt` for the required commands.

Default demo accounts (created by running `npm run db:seed` in `backend/`):

| Username   | Password      | Role       |
|------------|---------------|------------|
| `admin1`   | `Password123` | Admin      |
| `tutor1`   | `Password123` | Instructor |
| `student1` | `Password123` | Student    |

## Backend Notes

- The backend requires PostgreSQL to be running.
- Database migrations live in `backend/src/db/migrations` and we have seeders for intial user setup.
- Auth is handled with JWT.
- Drawings are uploaded through the backend and stored in the database.