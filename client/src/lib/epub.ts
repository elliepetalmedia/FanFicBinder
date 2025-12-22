import JSZip from 'jszip';
import saveAs from 'file-saver';
import { Readability } from '@mozilla/readability';

export interface Chapter {
  id: string;
  title: string;
  content: string;
  wordCount: number;
}

export interface BookMetadata {
  title: string;
  author: string;
  cover?: ArrayBuffer | null;
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return "";
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// Helper to ensure content is valid XHTML body content using DOM parser
function sanitizeContent(content: string): string {
  try {
    // Use DOMParser to parse the HTML string
    // This automatically handles tag closing and nesting better than regex
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<body>${content}</body>`, 'text/html');
    
    // Clean up the DOM
    const body = doc.body;

    // Remove unwanted elements
    const unwantedSelectors = ['script', 'style', 'iframe', 'noscript', 'object', 'embed'];
    unwantedSelectors.forEach(selector => {
      const elements = body.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });

    // Ensure images are proper
    const images = body.querySelectorAll('img');
    images.forEach(img => {
        if (!img.hasAttribute('alt')) img.setAttribute('alt', '');
    });
    
    // Serialize back to XML string
    const serializer = new XMLSerializer();
    // Serialize children of body to avoid including the body tag itself if we just want content
    // But we need to handle the case where content might be text nodes mixed with elements
    
    let serialized = "";
    // Iterate over child nodes to serialize them individually
    Array.from(body.childNodes).forEach(node => {
        serialized += serializer.serializeToString(node);
    });
    
    // Fallback if serialization fails or returns empty
    if (!serialized) {
        // If content was text-only, it might have been parsed into body text content
        serialized = escapeXml(body.textContent || "");
        // Wrap in p if it's just text
        if (serialized && !serialized.startsWith('<')) {
            serialized = `<p>${serialized}</p>`;
        }
    }
    
    // If empty, return a non-breaking space paragraph
    if (!serialized.trim()) {
        return '<p>&#160;</p>';
    }

    return serialized;
  } catch (e) {
    console.error("Sanitization failed, falling back to basic cleanup", e);
    // Fallback to basic cleanup if DOM parser fails (unlikely in browser)
    let clean = content;
    clean = clean.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
                 .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "");
    return clean;
  }
}

export interface ExportOptions {
  font?: string;
  spacing?: string;
  dropCaps?: boolean;
}

function generateCustomCSS(options: ExportOptions): string {
  let css = `
    body { 
      font-family: ${options.font === 'sans' ? 'sans-serif' : options.font === 'dyslexic' ? 'OpenDyslexic, sans-serif' : 'serif'}; 
      line-height: ${options.spacing || '1.6'}; 
      padding: 1em; 
      max-width: 100%; 
    }
    h1 { text-align: center; margin-bottom: 2em; page-break-after: avoid; }
    p { margin-bottom: 1em; text-indent: 1.5em; margin-top: 0; }
    img { max-width: 100%; height: auto; }
    pre { white-space: pre-wrap; word-wrap: break-word; }
  `;

  if (options.dropCaps) {
    css += `
      p:first-of-type::first-letter { 
        font-size: 3em; 
        float: left; 
        line-height: 0.8; 
        padding-right: 0.1em;
      }
    `;
  }

  return css;
}

export async function generateAudiobookHTML(chapters: Chapter[], metadata: BookMetadata) {
  try {
    const combinedContent = chapters.map(c => `
      <article class="chapter" data-title="${escapeXml(c.title)}">
        <h2>${escapeXml(c.title)}</h2>
        ${sanitizeContent(c.content)}
      </article>
    `).join('\n<hr/>\n');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeXml(metadata.title)} - Audiobook</title>
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; padding-bottom: 120px; background: #fdf6e3; color: #333; }
    h1 { text-align: center; color: #2c3e50; }
    h2 { border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 40px; }
    p { margin-bottom: 1.2em; transition: background 0.3s; padding: 5px; border-radius: 4px; }
    .reading-now { background: #ffe0b2; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    
    /* Player UI */
    #audio-player {
      position: fixed; bottom: 0; left: 0; right: 0;
      background: #fff; border-top: 1px solid #ddd;
      padding: 15px; box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
      display: flex; gap: 15px; align-items: center; justify-content: center;
      flex-wrap: wrap; z-index: 1000;
    }
    button {
      background: #ff9f0a; color: white; border: none; padding: 10px 20px;
      border-radius: 20px; cursor: pointer; font-weight: bold;
      display: flex; align-items: center; gap: 5px;
    }
    button:hover { background: #e08900; }
    button:disabled { background: #ccc; cursor: not-allowed; }
    select { padding: 8px; border-radius: 5px; border: 1px solid #ccc; max-width: 200px; }
    .controls { display: flex; gap: 10px; align-items: center; }
    .progress { flex: 1; text-align: center; font-size: 0.9em; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  </style>
</head>
<body>
  <h1>${escapeXml(metadata.title)}</h1>
  <div id="content">
    ${combinedContent}
  </div>

  <div id="audio-player">
    <div class="controls">
      <button id="play-btn">Play</button>
      <select id="voice-select"><option>Loading voices...</option></select>
      <select id="speed-select">
        <option value="0.8">0.8x</option>
        <option value="1" selected>1.0x</option>
        <option value="1.2">1.2x</option>
        <option value="1.5">1.5x</option>
        <option value="2">2.0x</option>
      </select>
    </div>
    <div class="progress" id="status-text">Ready to read</div>
  </div>

  <script>
    const synth = window.speechSynthesis;
    let voices = [];
    let currentUtterance = null;
    let isPlaying = false;
    let paragraphs = Array.from(document.querySelectorAll('p'));
    let currentIndex = 0;
    
    // Load Saved Progress
    const savedIndex = localStorage.getItem('audiobook_progress_${escapeXml(metadata.title)}');
    if (savedIndex) {
      currentIndex = parseInt(savedIndex, 10);
      highlightParagraph(currentIndex);
    }

    function loadVoices() {
      voices = synth.getVoices().sort((a, b) => {
        const aScore = (a.name.includes('Google') || a.name.includes('Premium')) ? 2 : 1;
        const bScore = (b.name.includes('Google') || b.name.includes('Premium')) ? 2 : 1;
        return bScore - aScore;
      });
      
      const select = document.getElementById('voice-select');
      select.innerHTML = '';
      voices.forEach((voice, i) => {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = voice.name + ' (' + voice.lang + ')';
        select.appendChild(option);
      });
    }

    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    function highlightParagraph(index) {
      paragraphs.forEach(p => p.classList.remove('reading-now'));
      if (paragraphs[index]) {
        paragraphs[index].classList.add('reading-now');
        paragraphs[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    function speak(index) {
      if (index >= paragraphs.length) {
        isPlaying = false;
        updateButton();
        return;
      }
      
      synth.cancel();
      currentIndex = index;
      localStorage.setItem('audiobook_progress_${escapeXml(metadata.title)}', currentIndex);
      highlightParagraph(index);
      
      const text = paragraphs[index].innerText;
      const utterance = new SpeechSynthesisUtterance(text);
      
      const voiceIndex = document.getElementById('voice-select').value;
      if (voices[voiceIndex]) utterance.voice = voices[voiceIndex];
      
      utterance.rate = parseFloat(document.getElementById('speed-select').value);
      
      utterance.onend = () => {
        if (isPlaying) {
          speak(currentIndex + 1);
        }
      };
      
      utterance.onerror = (e) => {
        console.error('Speech error', e);
        isPlaying = false;
        updateButton();
      };

      currentUtterance = utterance;
      synth.speak(utterance);
      
      document.getElementById('status-text').innerText = 'Reading paragraph ' + (index + 1) + ' of ' + paragraphs.length;
    }

    function updateButton() {
      document.getElementById('play-btn').textContent = isPlaying ? 'Pause' : 'Play';
    }

    document.getElementById('play-btn').onclick = () => {
      if (isPlaying) {
        synth.cancel();
        isPlaying = false;
      } else {
        isPlaying = true;
        speak(currentIndex);
      }
      updateButton();
    };
    
    // Allow clicking paragraphs to jump
    paragraphs.forEach((p, i) => {
      p.style.cursor = 'pointer';
      p.onclick = () => {
        isPlaying = true;
        updateButton();
        speak(i);
      };
    });

    // Handle speed change
    document.getElementById('speed-select').onchange = () => {
      if (isPlaying) {
        synth.cancel();
        speak(currentIndex);
      }
    };
  </script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    saveAs(blob, `${metadata.title.replace(/[^a-z0-9]/gi, '_')}.html`);
    return true;
  } catch (error) {
    console.error("Error generating Audiobook:", error);
    throw new Error("Failed to generate Audiobook HTML");
  }
}

export async function generateEpub(chapters: Chapter[], metadata: BookMetadata, options?: ExportOptions) {
  try {
    const zip = new JSZip();
    const date = new Date().toISOString().split('.')[0] + 'Z';
    const uuid = crypto.randomUUID();
    const cssContent = generateCustomCSS(options || {});

    // 1. mimetype (must be first, no compression)
    zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

    // 2. container.xml
    zip.folder('META-INF')?.file('container.xml', 
      '<?xml version="1.0"?>' +
      '<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">' +
      '  <rootfiles>' +
      '    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>' +
      '  </rootfiles>' +
      '</container>'
    );

    const oebps = zip.folder('OEBPS');
    if (!oebps) throw new Error("Failed to create OEBPS folder");

    // 3. Add cover image if exists
    let coverFilename = '';
    if (metadata.cover) {
        coverFilename = 'cover.jpg';
        oebps.file(coverFilename, metadata.cover);
    }

    // 4. Create HTML files for each chapter
    chapters.forEach((chapter, index) => {
      const filename = `chapter_${index + 1}.xhtml`;
      // Sanitize and ensure valid XHTML using DOMParser strategy
      const safeContent = sanitizeContent(chapter.content);
      const safeTitle = escapeXml(chapter.title);
      
      const htmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en">
<head>
  <title>${safeTitle}</title>
  <meta charset="UTF-8" />
  <style>
    ${cssContent}
  </style>
</head>
<body>
  <h1>${safeTitle}</h1>
  ${safeContent}
</body>
</html>`;
      oebps.file(filename, htmlContent);
    });

    // 5. content.opf
    const manifestItems = chapters.map((_, i) => 
      `<item id="chap${i + 1}" href="chapter_${i + 1}.xhtml" media-type="application/xhtml+xml"/>`
    ).join('\n    ');
    
    const spineItems = chapters.map((_, i) => 
      `<itemref idref="chap${i + 1}"/>`
    ).join('\n    ');

    const coverManifest = coverFilename 
        ? `<item id="cover-image" href="${coverFilename}" media-type="image/jpeg" properties="cover-image"/>` 
        : '';

    const opfContent = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${escapeXml(metadata.title)}</dc:title>
    <dc:creator>${escapeXml(metadata.author)}</dc:creator>
    <dc:language>en</dc:language>
    <dc:identifier id="BookId">urn:uuid:${uuid}</dc:identifier>
    <meta property="dcterms:modified">${date}</meta>
  </metadata>
  <manifest>
    ${coverManifest}
    ${manifestItems}
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
  </manifest>
  <spine toc="ncx">
    ${spineItems}
  </spine>
</package>`;

    oebps.file('content.opf', opfContent);

    // 6. toc.ncx (for older readers)
    const navPoints = chapters.map((c, i) => `
    <navPoint id="navPoint-${i + 1}" playOrder="${i + 1}">
      <navLabel><text>${escapeXml(c.title)}</text></navLabel>
      <content src="chapter_${i + 1}.xhtml"/>
    </navPoint>`).join('');

    const ncxContent = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:${uuid}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${escapeXml(metadata.title)}</text></docTitle>
  <navMap>
    ${navPoints}
  </navMap>
</ncx>`;

    oebps.file('toc.ncx', ncxContent);

    // Generate Blob
    const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' });
    saveAs(blob, `${metadata.title.replace(/[^a-z0-9]/gi, '_')}.epub`);
    
    return true;
  } catch (error) {
    console.error("Error generating EPUB:", error);
    throw new Error("Failed to generate EPUB");
  }
}

// Retry logic wrapper
async function retry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return retry(fn, retries - 1, delay * 1.5); // Exponential backoff
  }
}

// Fetch with server-side proxy
async function fetchWithFallback(url: string): Promise<string> {
  const errors: string[] = [];

  // Strategy 1: Use our Netlify Function proxy (production) or Express proxy (development)
  try {
    // Check if we're in production (Netlify) or development (Express)
    const isNetlify = window.location.hostname.includes('netlify') || window.location.hostname.includes('.app');
    const proxyUrl = isNetlify 
      ? `/.netlify/functions/proxy?url=${encodeURIComponent(url)}`
      : `/api/proxy?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      throw new Error(`Backend proxy error: ${errorData.error || response.status}`);
    }
    
    const text = await response.text();
    if (text) return text;
    throw new Error("Backend proxy returned empty content");
  } catch (e) {
    errors.push((e as Error).message);
  }

  // Strategy 2: Fallback to AllOrigins (public CORS proxy)
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error(`AllOrigins error: ${response.status}`);
    const data = await response.json();
    if (data.contents) return data.contents;
    throw new Error("AllOrigins returned empty content");
  } catch (e) {
    errors.push((e as Error).message);
  }

  // Strategy 3: Fallback to Corsproxy.io
  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error(`CorsProxy error: ${response.status}`);
    const text = await response.text();
    if (text) return text;
    throw new Error("CorsProxy returned empty content");
  } catch (e) {
    errors.push((e as Error).message);
  }
  
  throw new Error(`All proxies failed: ${errors.join(", ")}`);
}

export async function mockFetchUrl(url: string): Promise<{ title: string; content: string; nextUrl?: string | null }> {
  try {
    // 1. Fetch HTML via proxy with retries
    const html = await retry(() => fetchWithFallback(url));
    
    // 2. Parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    
    // Fix relative links before parsing
    const base = doc.createElement('base');
    base.href = url;
    doc.head.appendChild(base);

    // 3. Use Readability to extract content
    // We clone the document because Readability mutates it
    const reader = new Readability(doc.cloneNode(true) as Document);
    const article = reader.parse();

    if (!article || !article.content) {
       throw new Error("Readability failed to parse content");
    }

    // 4. Post-processing
    // Check specifically for Wattpad blocking
    if (url.includes('wattpad.com') && (article.content.includes('Log in') || article.content.includes('Sign up'))) {
         throw new Error("Wattpad content is protected. Please use Manual Entry.");
    }
    
    // Find Next Chapter Link
    let nextUrl: string | null = null;

    // 1. AO3 Specific (Most Reliable)
    if (url.includes('archiveofourown.org')) {
        const ao3Next = doc.querySelector('li.chapter.next a');
        if (ao3Next) {
            nextUrl = (ao3Next as HTMLAnchorElement).href;
        }
    }

    // 2. RoyalRoad Specific
    if (!nextUrl && url.includes('royalroad.com')) {
        const rrNext = Array.from(doc.querySelectorAll('a')).find(a => 
            a.textContent?.toLowerCase().includes('next chapter') && 
            !a.textContent?.toLowerCase().includes('next part') 
        );
        if (rrNext) nextUrl = (rrNext as HTMLAnchorElement).href;
    }

    // 3. Wattpad Specific
    if (!nextUrl && url.includes('wattpad.com')) {
        // Wattpad usually splits chapters into pages. 
        // We need to find the "Next Page" link if it exists to stitch content, 
        // OR the "Next Part" link if we are at the end of a chapter.
        
        // However, since we can't easily stitch pages in this loop structure without major refactoring,
        // we will prioritize finding the "Next Part" (next chapter).
        // Wattpad often uses a link with class 'next-part-link' or similar.
        
        const wpNextPart = doc.querySelector('.next-part-link') || doc.querySelector('a.on-navigate-next');
        if (wpNextPart) {
            nextUrl = (wpNextPart as HTMLAnchorElement).href;
        }
    }

    // 4. General Heuristic (Fallback)
    if (!nextUrl) {
        const links = Array.from(doc.querySelectorAll('a'));
        for (const link of links) {
            const text = (link.textContent || "").trim().toLowerCase();
            
            // Skip if text looks like it points to a different work
            if (text.includes('work') || text.includes('series') || text.includes('book') || text.includes('volume')) {
                continue;
            }

            if (text === "next" || text === "next chapter" || text === "next >" || text === ">") {
                nextUrl = link.href;
                break;
            }
        }
    }

    // Fix incomplete Wattpad content
    // Wattpad content is often in <pre> tags or specific containers that Readability might miss or truncate
    if (url.includes('wattpad.com')) {
        const preContent = doc.querySelector('pre');
        if (preContent) {
            // If we found a pre tag, it likely contains the story text. 
            // We should use this if Readability returned very little text.
            const rawText = preContent.innerHTML;
            if (rawText.length > article.content.length) {
                article.content = rawText;
            }
        }
    }

    return {
      title: article.title || "Unknown Chapter",
      content: article.content,
      nextUrl: nextUrl
    };

  } catch (error) {
    console.error("Fetch error:", error);
    
    // Specific error message for user
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    // Custom message for Wattpad failures since they are common
    if (url.includes('wattpad.com')) {
        throw new Error(`Wattpad blocks external tools. Please open the chapter, copy the text, and use the "Manual" tab.`);
    }
    
    throw new Error(`Connection Failed: ${errorMessage}. Try manual entry.`);
  }
}

export async function generateReaderModeHTML(chapters: Chapter[], metadata: BookMetadata) {
  try {
    const combinedContent = chapters.map(c => `
      <article class="chapter" aria-label="${escapeXml(c.title)}">
        <h2>${escapeXml(c.title)}</h2>
        ${sanitizeContent(c.content)}
      </article>
    `).join('\n<hr/>\n');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeXml(metadata.title)} - Reader Mode</title>
  <style>
    body { 
      font-family: system-ui, -apple-system, sans-serif; 
      line-height: 1.6; 
      max-width: 800px; 
      margin: 0 auto; 
      padding: 20px; 
      background: #ffffff; 
      color: #333; 
    }
    h1 { text-align: center; color: #2c3e50; margin-bottom: 40px; }
    h2 { border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 60px; }
    p { margin-bottom: 1.2em; }
    
    /* Utility for screen readers */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }

    #reader-instructions {
        padding: 20px; 
        text-align: center; 
        border-bottom: 1px solid #ccc;
        margin-bottom: 40px;
        background: #f8f9fa;
        border-radius: 8px;
    }
  </style>
</head>
<body>
  <a href="#content" class="sr-only">Skip to content</a>
  
  <div id="reader-instructions">
     <p><strong>Audiobook Ready:</strong> Open this file in Edge (Read Aloud) or Safari (Listen to Page) for the best experience.</p>
  </div>

  <main id="content">
      <h1>${escapeXml(metadata.title)}</h1>
      <p style="text-align: center; color: #666; margin-bottom: 40px;">by ${escapeXml(metadata.author)}</p>
      
      ${combinedContent}
  </main>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    saveAs(blob, `${metadata.title.replace(/[^a-z0-9]/gi, '_')}_reader.html`);
    return true;
  } catch (error) {
    console.error("Error generating Reader Mode HTML:", error);
    throw new Error("Failed to generate Reader Mode HTML");
  }
}
