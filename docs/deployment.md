# Pinglix Deployment Foundation

This document describes a simple production-style build for Pinglix. It is a
deployment starting point, not a claim that the project is production-scaled.

## Local development

For normal local work, use the existing development Compose file:

```bash
cd infrastructure
docker compose up -d
```

The current local ports are frontend `5174`, backend `8081`, and MySQL `3306`.
The regular setup instructions are in `docs/development-setup.md`.

## Environment values

Use placeholders from:

- `backend/.env.example`
- `frontend/.env.example`
- `infrastructure/.env.example`

Do not commit `.env` files. For the production-style Compose example, provide
database credentials, a JWT secret of at least 32 characters, allowed CORS
origins, and cookie settings in an ignored `infrastructure/.env` file.

The backend accepts these important values:

```text
SPRING_PROFILES_ACTIVE
SPRING_DATASOURCE_URL
SPRING_DATASOURCE_USERNAME
SPRING_DATASOURCE_PASSWORD
PINGLIX_JWT_SECRET
PINGLIX_CORS_ALLOWED_ORIGINS
PINGLIX_COOKIE_SECURE
PINGLIX_COOKIE_SAME_SITE
```

The frontend receives its API and WebSocket URLs at build time:

```text
VITE_API_BASE_URL
VITE_WS_URL
```

## Build without Docker

Build and test the backend:

```bash
cd backend
./mvnw test
./mvnw clean package
```

Build and test the frontend:

```bash
cd frontend
npm install
npm test
npm run build
```

## Build Docker images

```bash
docker build -t pinglix-backend ./backend
docker build \
  --build-arg VITE_API_BASE_URL=http://localhost:8080 \
  --build-arg VITE_WS_URL=ws://localhost:8080/ws \
  -t pinglix-frontend ./frontend
```

The backend image exposes port `8080`. The frontend image serves the Vite build
on nginx port `80` and includes an SPA fallback for React Router routes.

## Production-style Compose example

The example is intentionally separate from local development:

```bash
cd infrastructure
docker compose -f docker-compose.prod.example.yml config
docker compose -f docker-compose.prod.example.yml up --build -d
```

It starts MySQL, the backend, and the frontend. MySQL is mapped to host port
`3307` in the example so it does not conflict with an existing local MySQL on
`3306`. The backend is mapped to `8080`, and the frontend is mapped to `5174`.

## CORS, cookies, and WebSocket

`PINGLIX_CORS_ALLOWED_ORIGINS` must contain the exact browser origin, including
the port. Do not use `*` with credentialed cookies.

For real HTTPS deployment, set `PINGLIX_COOKIE_SECURE=true`, use an HTTPS
origin, and review the `PINGLIX_COOKIE_SAME_SITE` value. The WebSocket URL must
also use `wss://` when the page is served over HTTPS. A reverse proxy or load
balancer must forward WebSocket upgrade headers.

## Known limitations

- This setup does not provide horizontal scaling or shared presence storage.
- Presence is in memory and resets when the backend restarts.
- TLS certificates, DNS, backups, monitoring, and secret management are not
  included.
- No cloud credentials or hosting-provider-specific files are included.
- The app still supports private text conversations only.
