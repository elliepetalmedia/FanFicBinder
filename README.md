# FanFicBinder - Universal Web-to-EPUB Converter

FanFicBinder is a free utility that converts web serials, fanfiction chapters, and articles into clean EPUB files for e-readers (Kindle, Kobo, Apple Books).

**[🚀 Launch Live Tool](https://fanficbinder.com)**

## 🛠 Key Features
* **Universal Fetcher:** Works on AO3, RoyalRoad, Wattpad, and most blogs.
* **Smart Extraction:** Uses Mozilla's `@mozilla/readability` engine to strip ads and sidebars automatically.
* **Serverless Backend:** Uses Netlify Functions to bypass CORS restrictions securely.
* **Privacy Focused:** The server fetches the text, sends it to your browser, and forgets it immediately. No stories are stored or logged.

## 📦 How it Works
1. **Fetch:** The app sends the target URL to a serverless function.
2. **Clean:** The function extracts the main story content and title.
3. **Bind:** The client-side app packages the text into a valid `.epub` file using `JSZip`.

## 📄 License
MIT License - Open source and free to use.
