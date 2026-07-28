# Pinglix

Real-time conversations, instantly connected.

Pinglix is a full-stack real-time messaging web application being built with
Spring Boot, React TypeScript, MySQL, and WebSocket/STOMP. The project follows a
phase-by-phase approach so the core messaging flow remains secure,
maintainable, and testable.

## Current status

Phase 0 and Phase 1 establish:

- the monorepo structure;
- a Java 21 Spring Boot backend;
- MySQL 8.4 through Docker Compose;
- Flyway migration support;
- application profiles for development and production;
- `GET /api/v1/health`;
- Spring Boot Actuator health;
- a consistent unexpected-error response;
- a controller test for the public health endpoint.

Authentication, users, conversations, messages, WebSocket support, and the
React application are intentionally deferred.

## Repository structure

```text
.
├── backend/
├── frontend/
├── infrastructure/
│   └── docker-compose.yml
├── docs/
├── .github/
│   └── workflows/
├── README.md
├── .gitignore
└── LICENSE
```

## Prerequisites

- JDK 21 or newer
- Docker with Docker Compose
- Git

The repository includes the Maven Wrapper, so a separate Maven installation is
not required.

## Run locally

### 1. Start MySQL

```bash
cd infrastructure
cp .env.example .env
docker compose up -d
docker compose ps
```

The example credentials are for local development only. If you change
`PINGLIX_DB_USERNAME` or `PINGLIX_DB_PASSWORD` in `infrastructure/.env`, export
the same values before starting the backend.

### 2. Start the backend

```bash
cd backend
./mvnw spring-boot:run
```

The default `dev` profile connects to MySQL on `localhost:3306` using the values
documented in `infrastructure/.env.example`. Environment variables can override
all connection settings:

```bash
PINGLIX_DB_URL='jdbc:mysql://localhost:3306/pinglix?useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC&allowPublicKeyRetrieval=true' \
PINGLIX_DB_USERNAME='pinglix' \
PINGLIX_DB_PASSWORD='your-local-password' \
./mvnw spring-boot:run
```

### 3. Verify the application

```bash
curl http://localhost:8080/api/v1/health
curl http://localhost:8080/actuator/health
```

The custom endpoint returns:

```json
{
  "status": "UP",
  "application": "Pinglix",
  "message": "Pinglix backend is running",
  "timestamp": "2026-07-29T10:30:00Z"
}
```

### 4. Run tests

```bash
cd backend
./mvnw test
```

### 5. Stop local infrastructure

```bash
cd infrastructure
docker compose down
```

Use `docker compose down -v` only when intentionally deleting the local MySQL
data volume.

## Configuration

| Variable | Development default | Purpose |
| --- | --- | --- |
| `PINGLIX_DB_URL` | MySQL at `localhost:3306/pinglix` | JDBC connection URL |
| `PINGLIX_DB_USERNAME` | `pinglix` | Application database user |
| `PINGLIX_DB_PASSWORD` | `pinglix_dev_password` | Local-only password |
| `MYSQL_ROOT_PASSWORD` | Defined in local `.env` | Local MySQL root password |
| `SERVER_PORT` | `8080` | Backend HTTP port |

The production profile has no database credential defaults and therefore
requires environment variables.

## API overview

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v1/health` | Public | Pinglix backend status |
| `GET` | `/actuator/health` | Public | Framework and database health |

See [docs/api-design.md](docs/api-design.md) for the current contract.

## Planned work

The next phase initializes the React TypeScript frontend and connects it to the
backend health endpoint. Authentication and messaging features will follow only
after that foundation works.

