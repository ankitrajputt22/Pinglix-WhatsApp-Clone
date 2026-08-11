# Pinglix Phase 14 Merge Readiness

## Branch details

- Branch: `feature/phase14-final-hardening`
- Base branch: `develop`
- Phase 13 is already merged into `develop`.
- Do not merge or delete branches until the review is complete.

## Completed hardening scope

- Reviewed backend authentication and membership boundaries.
- Reviewed profile, message, receipt, typing, and presence flows.
- Reviewed frontend API and STOMP client usage.
- Confirmed browser storage is not used for tokens.
- Updated release and QA documentation.
- Added final QA and release checklists.
- Confirmed no Phase 14 product feature or database migration was added.

## Verification commands

```bash
cd backend
./mvnw test
./mvnw clean package
```

```bash
cd frontend
npm install
npm test
npm run build
```

## Manual QA

Use [final-qa.md](final-qa.md) and [demo-walkthrough.md](demo-walkthrough.md)
with two browser sessions. Check authentication, profile editing, user search,
private conversations, message history, real-time delivery, receipts, typing,
presence, last seen, and mobile layout.

## Known limitations

- Presence is in memory and resets when the backend restarts.
- The MVP supports private text conversations only.
- CSRF protection needs review before a cross-site production deployment.
- The deployment setup is a foundation, not a deployed production service.
- TLS, backups, monitoring, managed secrets, and horizontal scaling are not
  included.

## Merge notes

After review and successful QA, run:

```bash
git switch develop
git pull --ff-only origin develop
git merge --no-ff feature/phase14-final-hardening -m "merge: complete phase 14 final MVP hardening"
git push origin develop
```

Keep `feature/phase14-final-hardening` after merging for history and review.

## Post-merge verification

```bash
git switch develop
git pull --ff-only origin develop
git status
git log --oneline --decorate -5
```

Then repeat the backend and frontend tests and open the local demo flow.
