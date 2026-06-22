# FeedOps SEO Operating System

This folder tracks SEO performance, link health, and growth opportunities for the FeedOps website.

## Goals

1. Track rankings for priority commercial and educational keywords.
2. Check that important links, especially paid links, are live and pointing to the right pages.
3. Monitor Search Console, Bing Webmaster Tools, and Google Analytics for traffic, conversion, and indexing signals.
4. Identify page, content, internal-linking, and technical SEO opportunities.
5. Keep SEO recommendations separate from website publishing until approved.

## Data Sources

- SearchRankings.com: keyword rankings and competitor movement.
- Search Engine Rankings: keyword ranking source if this is the active paid rank checker.
- Google Search Console: queries, impressions, clicks, CTR, average position, indexing, crawl issues.
- Bing Webmaster Tools: Bing search performance, indexing, crawl issues, backlink clues.
- Google Analytics: landing page engagement, conversions, demo bookings, form submissions.
- Website files in `site/`: page titles, meta descriptions, canonicals, schema, headings, links, page content.
- Paid link records: source URL, target URL, anchor text, status, renewal date, and value.

## SearchRankings.com Workflow

SearchRankings.com is the first rank-tracking source for this workspace. Use it as the weekly ranking baseline until an API or another rank tracker replaces it.

Weekly SearchRankings run:

1. Export the FeedOps project keyword rankings from SearchRankings.com.
2. Use the Australia / Google market view where available.
3. Include keyword, current rank, previous rank, ranking URL, target URL, and competitor URLs above FeedOps when the export supports them.
4. Import or paste those rows into `marketing/seo/rankings-tracker.csv`.
5. Compare changes against the prior review and write the summary to `marketing/seo/reviews/`.
6. Add any action-worthy finding to `marketing/seo/opportunities.csv`.

Recommended SearchRankings project setup:

- Project: FeedOps
- Domain: `feedops.com`
- Market: Australia
- Search engine: Google
- Device: Desktop first; add mobile once the main baseline is stable
- Frequency: weekly
- Priority groups: commercial, lead generation, troubleshooting, guides, comparison, branded

The first export should focus on baseline positions, not conclusions. Once two or more weekly exports exist, use movement trends to decide which pages need title, copy, internal-linking, or conversion updates.

## Managed Data Flow

The agent can manage the SEO process, but it needs one reliable way to access each source.

Preferred options, in order:

1. API access from the rank checker, if available.
2. A scheduled CSV export or email report from the rank checker.
3. A logged-in browser workflow, useful for guided checks but less reliable for unattended weekly runs.

Once SearchRankings.com or another source is connected, the weekly agent run should:

- collect Australian ranking data for tracked keywords;
- update the ranking tracker;
- check paid or important backlinks;
- check website links and obvious technical SEO issues;
- compare movement against the previous review;
- add opportunities or urgent actions to the backlog;
- recommend website updates without publishing them automatically.

## Review Cadence

Weekly:

- Check ranking movement for priority keywords.
- Check paid and important backlinks are still live.
- Check broken internal and external links.
- Review Search Console movement for top landing pages and rising queries.
- Add new opportunities to `opportunities.csv`.

Monthly:

- Review SEO conversions from Google Analytics.
- Compare Search Console clicks and impressions month over month.
- Identify pages with high impressions but low CTR.
- Identify pages ranking positions 4-20 that could move with updates.
- Review backlink value and renewals.
- Choose the next SEO actions to apply to the website.

Quarterly:

- Reassess target keyword list.
- Compare against competitors.
- Review content gaps.
- Refresh priority pages.
- Decide whether paid links are still worth keeping.

## Core Metrics

Rankings:

- Keyword
- Target page
- SERP market
- Current rank
- Previous rank
- Best rank
- Search intent
- Priority
- Competitor URLs above us

Search Console:

- Clicks
- Impressions
- CTR
- Average position
- Query-to-page match
- Indexing status

Google Analytics:

- Organic sessions
- Engaged sessions
- Demo bookings
- Contact form submissions
- Audit requests
- Conversion rate by landing page

Links:

- Source URL
- Target URL
- Anchor text
- Link type
- Status
- Last checked
- Paid amount
- Renewal date
- Notes

## Opportunity Types

- Improve title tag or meta description.
- Refresh page content.
- Add FAQ/schema.
- Add internal links from related pages.
- Create a new supporting article.
- Consolidate overlapping pages.
- Fix broken links or redirects.
- Improve page speed or mobile experience.
- Improve conversion path from organic landing page.
- Protect or replace a paid backlink.

## Safe Agent Workflow

Use this wording for review-only SEO work:

```text
Read the website in site/ and the SEO files in marketing/seo/. Run an SEO review and write findings to marketing/seo/. Do not edit site/.
```

Use this wording for approved website changes:

```text
Use the approved SEO opportunities in marketing/seo/ to update the relevant website pages in site/.
```

This keeps SEO analysis connected to the website while preserving a review step before publication.
