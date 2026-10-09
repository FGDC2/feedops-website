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

