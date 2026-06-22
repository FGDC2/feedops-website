# FeedOps Marketing Workspace

This folder is for marketing planning, campaigns, positioning, content briefs, and customer-success insights that may later inform the public website.

## Relationship to the Website

- The public website lives in `site/`.
- Marketing work lives in `marketing/`.
- Marketing files are reference material only. They should not be copied into `site/` unless there is a specific website update task.
- Website updates should be made deliberately in `site/`, reviewed, then published through the normal website process.

## Recommended Workflow

1. Capture campaign ideas, customer-success notes, and content opportunities here.
2. Turn approved ideas into website change requests.
3. Apply those website changes separately inside `site/`.
4. Check the changed pages locally before publishing.

## Agent Boundary

The marketing workspace can act like the source of truth for ideas and recommendations. The website remains the publishing surface.

When asking an agent to work across both areas, use language like:

```text
Read the marketing notes first, then propose website updates. Do not edit the website until I approve the specific page changes.
```

Or, when ready to publish:

```text
Use the approved marketing brief to update the relevant website page in site/.
```

This keeps strategy and publishing connected without letting temporary admin or planning material become public website content by accident.

## SEO Tracking

SEO work is tracked in `marketing/seo/`.

- `marketing/interface/index.html` provides a local SEO tracking interface.
- `marketing/seo/SEO-OPERATING-SYSTEM.md` defines the regular review process.
- `marketing/seo/rankings-tracker.csv` tracks priority keyword positions.
- `marketing/seo/paid-links-register.csv` tracks paid or important backlinks.
- `marketing/seo/opportunities.csv` tracks new SEO opportunities.
- `marketing/seo/review-template.md` is used for each weekly or monthly SEO review.

Recommended rule: SEO analysis can read the website in `site/`, but findings should be written to `marketing/seo/` first. Only approved actions should become edits to `site/`.
