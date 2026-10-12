# Local website review instructions

This repository is a static copy of the FeedOps website. You do not need GitHub or web-development experience to review the pages locally.

## What you need

- Git, to download the repository
- Python 3, to run the local preview server
- A web browser

You do not need to install Node.js or run `npm install` for a content review.

## Download the branch for this PR

Open Terminal (macOS/Linux) or Git Bash (Windows), then run:

```bash
git clone -b feature/DCA-22193_conversational-shopping-website https://github.com/FGDC2/feedops-website.git
cd feedops-website
```

If you already downloaded the repository, open a terminal in that folder and run:

```bash
git switch feature/DCA-22193_conversational-shopping-website
git pull
```

## Start the local website

From the repository folder, run:

```bash
python3 -m http.server 4173 --directory site
```

Keep that terminal window open while reviewing the site. Open this address in your browser:

```text
http://127.0.0.1:4173/guide/google-conversational-shopping-feed-guide/
```

The guide is intentionally marked as not for search-engine indexing while it is being reviewed locally.

## Review the page

Check the page at desktop and mobile widths, follow the links in the guide, and review the rollout sequence:

1. Start with the FeedOps audit.
2. Map website data to the recommended attributes.
3. Enrich the mapped data with the FeedOps playbook.
4. Recheck the audit.

The page links to the local copies of related FeedOps content, so those links can also be reviewed from the same local server.

## If port 4173 is already in use

Start the preview on another port:

```bash
python3 -m http.server 4174 --directory site
```

Then open:

```text
http://127.0.0.1:4174/guide/google-conversational-shopping-feed-guide/
```

## Stop the server

Return to the terminal running the server and press `Ctrl+C`.

## Required SEO and LLM sweep for website changes

Every website change must include a quick search and AI-readability review before it is considered ready for review. Use the local page, the repository conventions, and the relevant source material as the evidence for the review.

### Page-level SEO checks

- Use one clear, search-intent-aligned `<title>` and one `<h1>`. Keep the title specific to the page topic and brand it with FeedOps where appropriate.
- Add a useful meta description that accurately summarises the visible page. Do not promise content that the page does not contain.
- Set a canonical URL. Use `index, follow` plus the site’s standard preview directives for approved public pages; use `noindex, follow` for pages still under review. Do not add review-only pages to the sitemap until they are approved for publication.
- Add appropriate Open Graph and Twitter metadata. Do not invent an image URL; omit image fields when no suitable local or public image exists.
- Add JSON-LD only when it describes visible content. Keep `Article`, `WebPage`, `BreadcrumbList`, `HowTo`, and `FAQPage` fields aligned with the actual page headings, steps, questions, and answers. Never add FAQ or HowTo schema for content that is not visible on the page.
- Check heading hierarchy, descriptive link text, image `alt` text, keyboard-visible focus states, mobile layout, and internal links to relevant active pages.
- Use the current shared header/footer asset cache keys. Confirm that relative links work from the page’s actual directory.

### LLM readability checks

- Give the page an answer-first introduction that states what the page is about, who it is for, and the practical outcome.
- Use explicit terms for the product, platform, audience, process, and key entities. Define specialist language the first time it appears.
- Organise the content into short, descriptive sections with lists or tables for procedures, comparisons, attributes, and requirements.
- Make the main workflow and important relationships unambiguous. Keep visible FAQs and structured data in agreement with the body copy.
- Link to authoritative first-party sources for external claims, and avoid unsupported benchmarks, guarantees, or implied product capabilities.
- Keep customer-facing copy direct and use second-person language (`you` and `your`) unless a different voice is explicitly required.
- If a page is approved, indexable, and part of the rebuilt site, add it to `site/llms.txt` with a concise summary and primary topic. Add it to `site/sitemap.xml` according to the repository’s sitemap policy. Do not list noindex review pages as active LLM source-of-truth pages.

### Minimum verification

For each changed page, run `git diff --check`, serve the site locally, open the page at its real path, and verify the rendered title, heading, navigation, links, and mobile layout. Extract and parse any JSON-LD before pushing the branch. Record any intentional `noindex`, omitted social image, or unavailable source as a review note rather than silently treating it as complete.
