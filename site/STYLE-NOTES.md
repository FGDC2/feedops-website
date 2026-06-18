# FeedOps Site Style Notes

## Global Layout

- Every page must include the shared global header and footer unless Frank explicitly requests a page-specific exception.
- Use `header-standard.css` and `header-standard.js` for the global header.
- Use `footer-standard.css` and `footer-standard.js` for the global footer.
- Do not remove the global header or footer when cleaning up exported page markup; remove only duplicate embedded/exported header or footer blocks.

## Guide Pages

- Put the guide date directly under the hero image.
- Use this order in the hero: `.hero-content`, `.hero-image`, `.updated-date`, `.hero-note`.
- Use the date label format: `Last updated: <time datetime="YYYY-MM-DD">D Month YYYY</time>`.
- Do not place `.updated-date` inside `.hero-content` or `.hero-note`.
