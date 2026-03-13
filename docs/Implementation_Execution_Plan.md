# Implementation Execution Plan

## Constraints
- Keep existing brand palette unchanged (`brand.green`, `brand.red`, `brand.cream`, `brand.ink`).
- Improve design/content quality without color identity drift.
- Include full micro-issue verification (UX, copy, responsive, accessibility, link correctness).

## Phase Tracking
- [x] Phase 0: Baseline + guardrails + parity checklist started
- [x] Phase 1: Data model and migration layer
- [x] Phase 2: Route and navigation expansion
- [x] Phase 3: Writing upgrade by segment
- [x] Phase 4: Visual system refresh (palette preserved)
- [x] Phase 5: Icon and brand language pass
- [x] Phase 6: Feature port + adaptation
- [x] Phase 7: Admin capability upgrade
- [x] Phase 8: SEO, accessibility, security hardening
- [ ] Phase 9: QA and release readiness (final manual smoke + deployment checklist pending)

## Current Workstream (Now)
1. Execute final bilingual manual smoke test for public + admin routes.
2. Run admin workflow verification for users/submissions/chatbot flows.
3. Freeze release checklist and production environment notes.

## Automated QA Commands
1. `powershell -ExecutionPolicy Bypass -File scripts/qa-start-server.ps1`
2. `powershell -ExecutionPolicy Bypass -File scripts/qa-run-smoke.ps1`
3. `powershell -ExecutionPolicy Bypass -File scripts/qa-stop-server.ps1`

## Definition of Done for Foundation
- Existing pages continue to work with old + new data shape.
- New keys are present in persisted content data.
- Submission status pipeline supports `processing`.
- Chat conversation storage APIs are available for upcoming chatbot feature integration.
