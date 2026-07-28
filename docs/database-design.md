# Database design

## Phase 1

The local database is MySQL 8.4:

- database: `pinglix`;
- storage engine: InnoDB;
- character set: `utf8mb4`;
- collation: `utf8mb4_0900_ai_ci`;
- timezone: UTC.

No application tables are created in Phase 1.

Flyway is enabled and its migration location is
`backend/src/main/resources/db/migration`. The directory intentionally contains
no versioned migration yet so `V1__create_users.sql` remains available for the
future user module.

Schema changes must never be made manually. Each future change requires a
reviewed Flyway migration with appropriate constraints and indexes.

