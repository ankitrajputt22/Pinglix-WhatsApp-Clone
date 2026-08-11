# Pinglix MVP Release Checklist

## Pre-release checks

- [ ] Confirm the current branch is `feature/phase14-final-hardening`.
- [ ] Confirm Phase 13 is merged into `develop`.
- [ ] Confirm the working tree contains only intended changes.
- [ ] Confirm no unsupported feature was added.

## Test checks

- [ ] Backend tests pass.
- [ ] Backend package build passes.
- [ ] Frontend tests pass.
- [ ] Frontend production build passes.
- [ ] Manual two-user demo passes.

## Build and setup checks

- [ ] MySQL starts with the local Compose file.
- [ ] Backend starts with the documented environment values.
- [ ] Frontend starts on port `5174`.
- [ ] Health and actuator endpoints return successfully.
- [ ] Docker Compose production-style configuration validates.

## Documentation checks

- [ ] README commands use ports `5174`, `8081`, and `3306` for local work.
- [ ] Demo walkthrough matches the current user flow.
- [ ] API, database, WebSocket, security, and MVP status docs are accurate.
- [ ] Deployment notes clearly say they are a foundation, not a live deployment.
- [ ] Roadmap items are marked as future work.

## Secret checks

- [ ] No real `.env` file is committed.
- [ ] Environment files are protected by `.gitignore`.
- [ ] No real JWT secret, password, token, private key, or cloud credential is
      committed.
- [ ] Frontend does not store tokens in browser storage.
- [ ] API responses and logs do not expose sensitive authentication data.

## Manual QA checks

- [ ] Register and log in.
- [ ] Edit the current profile.
- [ ] Search for another user.
- [ ] Create a private conversation.
- [ ] Send and load text messages.
- [ ] Verify real-time delivery and sent/delivered/read statuses.
- [ ] Verify typing, online/offline, and last-seen behavior.
- [ ] Verify mobile layout and error states.

## Merge checklist

- [ ] Review the final diff.
- [ ] Commit the Phase 14 changes.
- [ ] Push `feature/phase14-final-hardening`.
- [ ] Merge into `develop` only after review.
- [ ] Keep the Phase 14 branch after merging.

## Post-merge checks

- [ ] Pull the updated `develop` branch.
- [ ] Run backend tests and package build again.
- [ ] Run frontend tests and build again.
- [ ] Open the local application and repeat the health check.
