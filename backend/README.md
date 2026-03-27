# TutorSync Backend

Express + TypeScript + PostgreSQL + Sequelize ORM (Object-relational Mapping)

## Prerequisites

- Node.js (v22+)
- PostgreSQL
- WSL or Linux (Makefile uses `createdb`/`dropdb` and `sudo service`)

## Getting Started

```bash
# If on WSL, start PostgreSQL first
make db-start

# Full setup (installs deps, creates .env, creates db, runs migrations)
make setup

# Start the dev server (port 3000)
make dev
```

## Makefile Commands

| Command                | What it does                             |
| ---------------------- | ---------------------------------------- |
| `make setup`           | Full first-time setup                    |
| `make dev`             | Start dev server (ts-node, auto-runs TS) |
| `make build`           | Compile TypeScript to `dist/`            |
| `make start`           | Run compiled JS (run `make build` first) |
| `make db-start`        | Start PostgreSQL (WSL/Linux)             |
| `make db-create`       | Create the `tutorsync` database          |
| `make db-drop`         | Drop the database                        |
| `make db-reset`        | Drop, recreate, and run all migrations   |
| `make db-migrate`      | Run pending migrations                   |
| `make db-migrate-undo` | Undo the last migration                  |
| `make db-seed`         | Run seed files                           |

## Project Structure

```
src/
├── app.ts                  # Express app (middleware + routes)
├── server.ts               # HTTP server entry point
├── routes/                 # Route handlers
│   ├── index.ts
│   ├── users.ts
│   └── auth.ts
├── middleware/
│   └── auth.ts             # JWT authenticate middleware
├── models/                 # Sequelize models
│   ├── index.ts
│   ├── User.ts
│   ├── Session.ts
│   └── SessionParticipant.ts
└── db/
    ├── index.ts            # Sequelize connection
    ├── config.js           # DB config (dev/test/prod)
    ├── migrations/         # Schema migrations
    └── seeders/            # Seed data
```

## Adding a Route

1. Create a file in `src/routes/`, e.g. `src/routes/sessions.ts`:

```ts
import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.json({ message: "list sessions" });
});

export default router;
```

2. Register it in `src/app.ts`:

```ts
import sessionsRouter from "./routes/sessions";
app.use("/sessions", sessionsRouter);
```

## Adding Middleware

To protect a route with auth, use the `authenticate` middleware:

```ts
import { authenticate, AuthRequest } from "../middleware/auth";

router.get("/protected", authenticate, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});
```

## Adding a Model

1. Create a file in `src/models/`, e.g. `src/models/Message.ts`:

```ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../db";

class Message extends Model {
  declare id: number;
  declare content: string;
}

Message.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "messages",
    underscored: true,
  },
);

export default Message;
```

2. Export it from `src/models/index.ts`.

3. Create a matching migration (see below).

## Migrations

Migrations live in `src/db/migrations/` as plain JS files (required by sequelize-cli).

Create a new migration file with a timestamp prefix:

```
src/db/migrations/20260326000004-create-messages.js
```

```js
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("messages", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("messages");
  },
};
```

Then run:

```bash
make db-migrate
```

To undo:

```bash
make db-migrate-undo
```

## Environment Variables

Copy `.env.example` to `.env` and edit as needed (`make setup` does this automatically):

```
DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET, PORT
```
