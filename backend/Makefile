.PHONY: install dev start build db-create db-drop db-reset db-migrate db-migrate-undo db-seed env setup

# Install dependencies
install:
	npm install

# Start dev server with ts-node
dev:
	npm run dev

# Build TypeScript to dist/
build:
	npm run build

# Start production server from dist/
start:
	npm run start

# Create the tutorsync database
db-create:
	createdb tutorsync

# Drop the tutorsync database
db-drop:
	dropdb tutorsync

# Run Sequelize migrations
db-migrate:
	npm run db:migrate

# Undo last migration
db-migrate-undo:
	npm run db:migrate:undo

# Run seed files
db-seed:
	npm run db:seed

# Drop and recreate the database, then migrate
db-reset: db-drop db-create db-migrate
	@echo "Database reset and migrated"

# Copy .env.example to .env if it doesn't exist
env:
	@test -f .env || cp .env.example .env && echo ".env created from .env.example"
	@test -f .env && echo ".env already exists"

# Full setup: install deps, create .env, create db, run migrations
setup: install env db-create db-migrate
	@echo "Setup complete — run 'make dev' to start the server"

# Start PostgreSQL server in WSL/Linux
db-start:
	sudo service postgresql start

