# Architecture

## Repository

Pinglix uses a monorepo containing a Spring Boot backend, a React frontend,
local infrastructure, and project documentation.

## Backend

The backend is a modular monolith rooted at the `in.pinglix` package. Business
features will be organized by feature rather than by a single global technical
layer.

Phase 1 contains only:

- the application entry point;
- a small health feature;
- shared API error handling;
- environment-specific configuration.

Spring Web serves REST APIs. Spring Data JPA provides future persistence
support. Flyway is the only supported schema-migration mechanism. Actuator
provides operational health information.

## Configuration

The default profile is `dev`. It contains safe local-development defaults.
The `prod` profile requires database connection values from the runtime
environment and does not contain passwords.

## Future boundaries

Planned feature packages include authentication, users, conversations,
messages, real-time delivery, media, notifications, security, and common
infrastructure. These packages are introduced only in their corresponding
phases.

