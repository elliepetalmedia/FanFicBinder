# FanFicBinder - Universal Web-to-EPUB Converter

FanFicBinder is a 100% client-side web application that archives web serials, fanfiction, and articles into clean EPUB files or accessible Reader Mode HTML files. It runs entirely in your browser—no server-side processing or data storage required.

## 🛠 Key Features

- **Universal Fetching**: Grabs content from any URL using the Mozilla Readability engine (via CORS proxy or direct if allowed).
- **Sequence Fetching**: Automatically detects "Next Chapter" links to download entire books in one go.
  - *Smart Delays*: Pauses randomly between chapters (1.5s - 3.5s) to avoid rate limits.
  - *Auto-Retry*: Automatically pauses and retries if it hits a "Too Many Requests" error.
- **Wattpad Support**: Special handling for Wattpad's unique structure and content blocking.
- **EPUB Generation**: Creates valid EPUB files with custom metadata (Title, Author, Cover).
- **Reader Mode Export**: Generates a semantic HTML file optimized for:
  - Microsoft Edge "Read Aloud"
  - Safari "Listen to Page"
  - Speechify & Voice Dream Reader
- **Custom Formatting**:
  - Fonts: Serif (Merriweather), Sans-Serif, Dyslexic Friendly
  - Line Spacing: Compact, Comfortable, Loose
  - Drop Caps: Stylish chapter openers
- **Privacy First**: All data stays in your browser's memory. Nothing is uploaded or stored on any server.

## � Output Formats

FanFicBinder supports two primary output formats:
1. **EPUB (.epub):** A standard, highly compatible ebook format perfect for Kindle (via Send to Kindle), Kobo, Apple Books, and other dedicated e-readers.
2. **Reader Mode HTML (.html):** A clean, semantic HTML file designed specifically for text-to-speech tools. It strips all styling distractions so accessibility tools like Microsoft Edge's "Read Aloud", Safari's "Listen to Page", and Speechify can effortlessly read the chapter text out loud.

## �📦 How it Works

1. **Fetch**: The app fetches the URL content directly from your browser.
2. **Clean**: It uses Mozilla's `@mozilla/readability` engine to strip ads, sidebars, and comments.
3. **Bind**: The app packages the text into a valid `.epub` or `.html` file using `JSZip` and semantic HTML templates.

## 💻 Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Routing**: wouter
- **UI Components**: Shadcn/UI (Radix Primitives)
- **Engine**: @mozilla/readability (Content Extraction), jszip (EPUB creation)

## 📄 License

MIT License - Open source and free to use.
