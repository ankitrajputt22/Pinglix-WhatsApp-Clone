# Pinglix Security Notes

## Current protections

- Passwords are hashed with BCrypt before they are stored.
- Access and refresh tokens are kept in HttpOnly cookies.
- The frontend does not store tokens in `localStorage` or `sessionStorage`.
- The API client sends cookies with `credentials: "include"`.
- CORS origins are configurable and are not open to every origin.
- Protected API routes require an authenticated user.
- Conversation, message, receipt, and typing actions check conversation membership.
- Profile updates use the authenticated user ID and do not accept a user ID from
  the request body.
- DTOs do not expose password hashes, raw tokens, cookies, or other internal
  security fields.
- Authentication logs contain user IDs and safe event names only.
- WebSocket events contain IDs, status values, and timestamps only.

## Local and production settings

Local development uses `secure-cookie: false` so HTTP localhost works. Production
uses secure cookies and must run over HTTPS. The JWT secret, database password,
CORS origins, and cookie settings must come from environment variables.

CSRF is disabled for this local cookie-based MVP. Before a cross-site production
deployment, add and test a CSRF protection strategy together with the deployment
origin and cookie policy.

## Not claimed

Pinglix does not claim end-to-end encryption. It also does not provide production
grade horizontal scaling, push notifications, groups, attachments, or admin
security controls yet.
