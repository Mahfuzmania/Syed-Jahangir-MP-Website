# Design and Content Verification Checklist

## Palette Guardrail
- [x] No change to brand color values in `tailwind.config.js`
- [x] UI enhancements use spacing, hierarchy, typography, contrast, and composition (not palette replacement)

## Content Quality
- [x] Remove placeholders (phone/social links/text)
- [x] BN/EN parity and translation consistency
- [x] Clear value proposition per page section
- [x] CTA copy specificity and intent clarity

## Design Integrity
- [ ] Responsive behavior (320px, 375px, 768px, 1024px, 1440px) - manual browser pass pending
- [ ] No overflow/cutoff in cards, tables, nav drawers, and embeds - manual browser pass pending
- [x] Consistent card radius, spacing rhythm, and button sizing
- [x] Icon alignment, stroke consistency, and click target quality

## Functional Verification
- [x] Public routes load correctly for `/bn` and `/en`
- [x] Search/filter/track forms behave correctly
- [x] Error/empty/success states are clear and localized
- [x] Admin role and submission status flows work end-to-end

## Accessibility
- [x] Keyboard reachability for nav/forms/dialogs
- [x] Focus-visible styles are consistent
- [x] Form fields have accessible labeling and validation messages
- [ ] Color contrast remains readable in light and dark modes - no dark mode enabled in this release

## SEO + Technical Hygiene
- [x] Metadata per page where relevant
- [x] `robots.ts` and `sitemap.ts` correctness
- [x] Canonical and language alternates
- [x] Broken links/media references resolved
