# Dinajpur-3 Website Proposal Compliance Audit

Date: 17 February 2026
Project: `syeed-jahangir-mp-web`
Reference: `Dinajpur-3_MP_Website_Proposal_AzmLabs.pdf`

## Executive Status
- Implemented: Core public website pages, bilingual support, admin content management, role-based access, media/gallery/news publishing, contact and write-to-MP submission pipeline.
- Partially implemented: Citizen service workflow, media/press, accessibility enhancements.
- Not yet implemented: Search, analytics integration, advanced governance/backup automation.

## Feature-by-Feature Audit
| Proposal Feature | Status | Current Implementation | Gap / Action Needed |
|---|---|---|---|
| Home, About/Profile, Priorities, Work, News, Gallery, Contact, Write to MP | Implemented | All core routes and pages exist | None |
| Term Priorities as tile cards | Implemented | Commitment cards on homepage with detail pages | None |
| Bangla-first bilingual site | Implemented | `bn` + `en` routes and bilingual content fields | Content quality/editorial review ongoing |
| Easy staff update via CMS | Implemented | Form-based admin editor (no JSON coding) | None |
| Upload photos/videos/PDF from admin | Implemented | Admin upload API + upload fields in editor | Add file size/type policy note in docs |
| News editor with featured image | Implemented | News CRUD-style section in admin content editor | No tag/category system yet |
| Social links in contact/footer | Implemented | Social links + icon buttons in modern footer | None |
| Map in contact page | Implemented | Embedded map URL with MP office-pin default | For exact office pin, set exact map link/coordinates in admin |
| Write-to-MP form + email routing | Implemented | Submission saved + SMTP email notification supported | SMTP env vars must be configured in deployment |
| BD mobile/email validation | Implemented | Client + server validation and normalization added | None |
| Consent checkbox | Implemented | Privacy checkbox present in write form | None |
| Write form category + union/ward + attachment | Partial | Basic fields implemented | Add structured category, ward/union selector, citizen attachment upload |
| Media section (YouTube + press links) | Partial | YouTube/media cards implemented | Press coverage links list/editor missing |
| Gallery by event/date | Partial | Album-based gallery available | Event date metadata/filter missing |
| Accessibility (alt text, keyboard friendly, readability) | Partial | Alt text and semantic links used | Add skip-link, stronger focus states, contrast/accessibility audit |
| Site search | Missing | Not implemented | Add indexed search UI + data indexing |
| Analytics (GA/Matomo) | Missing | Not implemented | Add analytics provider + event tracking |
| Service workflow statuses (New/In Review/Resolved/Closed) | Implemented | Admin inbox supports status transitions and filters | Optional: add assignee/audit trail |
| Monthly export/report CSV/PDF | Implemented (CSV) | CSV export endpoint + admin export button | Optional: add PDF export |
| Auto acknowledgement email/SMS to citizen | Partial | Office notification email exists | Add citizen confirmation email/SMS |
| Anti-spam (CAPTCHA/rate-limit) | Implemented | Built-in captcha challenge + API rate limiting on submit | Optional: upgrade to Turnstile/reCAPTCHA |
| SSL/backups/rollback automation | Missing (app-level) | Not configured in local environment | Configure in hosting/deployment stack |

## Priority Recommendations (Next)
1. Add tags/categories/share for news and a press links module.
2. Add analytics dashboard (GA4/Matomo) for decision support.
3. Add site search and accessibility pass.
4. Add citizen confirmation email/SMS acknowledgement.
5. Add optional PDF export for monthly reports.
