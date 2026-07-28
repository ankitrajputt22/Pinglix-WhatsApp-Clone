# Development setup

## Requirements

- JDK 21 or newer
- Docker with Docker Compose
- Git

## Start MySQL

```bash
cd infrastructure
cp .env.example .env
docker compose up -d
docker compose ps
```

Wait until `pinglix-mysql` reports a healthy status.

## Start the backend

```bash
cd backend
./mvnw spring-boot:run
```

The default development connection is:

- URL: `jdbc:mysql://localhost:3306/pinglix`
- user: `pinglix`
- password: `pinglix_dev_password`

Override these values with `PINGLIX_DB_URL`, `PINGLIX_DB_USERNAME`, and
`PINGLIX_DB_PASSWORD`.

## Verify

```bash
curl http://localhost:8080/api/v1/health
curl http://localhost:8080/actuator/health
```

## Test

```bash
cd backend
./mvnw test
```

The controller test does not replace local MySQL verification. A complete
manual Phase 1 check requires a real MySQL container so Spring Boot and Flyway
can connect during startup.

## Production profile

Activate production configuration with:

```bash
SPRING_PROFILES_ACTIVE=prod \
PINGLIX_DB_URL='jdbc:mysql://database-host:3306/pinglix?serverTimezone=UTC' \
PINGLIX_DB_USERNAME='runtime-user' \
PINGLIX_DB_PASSWORD='runtime-secret' \
./mvnw spring-boot:run
```

Do not commit production values.

