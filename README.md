# FanFicBinder - Web Fiction and Fanfiction to EPUB Converter

FanFicBinder is a browser-based tool for turning readable web serials, fanfiction, and articles into clean EPUB files or accessible Reader Mode HTML files. Binder content stays local to the browser, while a first-party proxy is used only for the URLs you request.

## Key Features

- Readable page fetching for public HTML chapter pages.
- Sequence fetching when a source exposes stable next-chapter links.
- Manual Entry fallback for blocked or unsupported sites.
- EPUB generation with title, author, cover, font, spacing, and drop-cap options.
- Reader Mode HTML export for browser read-aloud tools and speech apps.
- Privacy-minded workflow that avoids storing binder content on a server.

## Output Formats

FanFicBinder supports two primary output formats:

1. EPUB (`.epub`) for Kindle, Kobo, Apple Books, and other e-reader workflows.
2. Reader Mode HTML (`.html`) for Edge Read Aloud, Safari Listen to Page, Speechify, and similar text-to-speech workflows.

## Public Guides

The site ships prerendered public guides for:

- Fanfiction to EPUB workflows
- Web serial chapter collection
- Reader Mode HTML for text-to-speech
- Kindle and e-reader transfer steps
- Troubleshooting blocked fetches and manual-entry fallbacks

## How It Works

1. Fetch a readable chapter page or add copied text manually.
2. Clean the chapter content with Mozilla Readability where possible.
3. Export the binder as EPUB or Reader Mode HTML.

## Tech Stack

- Frontend: React, TypeScript, Tailwind CSS
- Routing: wouter
- UI Components: Shadcn/UI with Radix primitives
- Engine: `@mozilla/readability` and `jszip`

## License

MIT License
