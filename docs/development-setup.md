# Pinglix Development Setup

## Requirements

Install these tools:

- Java 21
- Node.js and npm
- Docker Desktop
- Git

The backend includes a Maven wrapper. A separate Maven installation is not required.

Docker Desktop provides Docker and Docker Compose for local MySQL.

## Local Ports

This project uses:

- Frontend: `localhost:5174`
- Backend: `localhost:8081`
- MySQL: `localhost:3306`

The MySQL database name is `pinglix`.

## Use an Existing Local MySQL Database

If the `pinglix` database already exists in local MySQL on port `3306`, do not
recreate it. You only need to make sure the local development user exists and
has permission to use this database.

Open MySQL as an administrator and run:

```sql
CREATE DATABASE IF NOT EXISTS pinglix
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

DROP USER IF EXISTS 'pinglix'@'localhost';
DROP USER IF EXISTS 'pinglix'@'127.0.0.1';
DROP USER IF EXISTS 'pinglix'@'%';

CREATE USER 'pinglix'@'localhost'
IDENTIFIED BY 'pinglix_dev_password';

CREATE USER 'pinglix'@'127.0.0.1'
IDENTIFIED BY 'pinglix_dev_password';

CREATE USER 'pinglix'@'%'
IDENTIFIED BY 'pinglix_dev_password';

GRANT ALL PRIVILEGES ON pinglix.* TO 'pinglix'@'localhost';
GRANT ALL PRIVILEGES ON pinglix.* TO 'pinglix'@'127.0.0.1';
GRANT ALL PRIVILEGES ON pinglix.* TO 'pinglix'@'%';

FLUSH PRIVILEGES;
```

Test the connection:

```bash
mysql -u pinglix -p -h 127.0.0.1 -P 3306 pinglix
```

Enter this local development password when MySQL asks for it:

```text
pinglix_dev_password
```

The backend uses this local connection by default:

```text
jdbc:mysql://localhost:3306/pinglix?useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC&allowPublicKeyRetrieval=true
```

## Start MySQL with Docker Instead

Use Docker only if you are not using the existing local MySQL server. Both
services cannot listen on port `3306` at the same time.

From the project root:

```bash
cd infrastructure
docker compose up -d
docker compose ps
```

## Start the Backend

```bash
cd backend
./mvnw spring-boot:run
```

Check the backend:

```bash
curl http://localhost:8081/api/v1/health
curl http://localhost:8081/actuator/health
```

Build the backend without starting it:

```bash
./mvnw clean package
```

## Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5174
```

The local WebSocket endpoint is:

```text
ws://localhost:8081/ws
```

To test live delivery, open two separate browser sessions. Log in as two
different users. Open the same private conversation and send a message from
one user. The other user should see it without refreshing.

## Run Tests

Backend:

```bash
cd backend
./mvnw test
./mvnw clean package
```

Frontend:

```bash
cd frontend
npm test
npm run build
```

The backend test profile uses an isolated H2 database for each Spring test
context. It does not change the local MySQL database.

## Configuration

Local secrets should use environment variables or local environment files.

Do not commit:

- Real passwords
- JWT secrets
- Tokens
- Cookie values
- Production database details

Flyway runs when the backend starts. New database changes must use a new migration file.

Useful local environment variables include:

- `SERVER_PORT`
- `PINGLIX_DB_URL`
- `PINGLIX_DB_USERNAME`
- `PINGLIX_DB_PASSWORD`
- `PINGLIX_CORS_ALLOWED_ORIGINS`
- `VITE_API_BASE_URL`
- `VITE_WS_URL`

Safe examples are available in `backend/.env.example`, `frontend/.env.example`,
and `infrastructure/.env.example`. Copy values into local environment files only
when needed. Never commit `.env` files or real production secrets.

Production secrets must come from environment variables.
