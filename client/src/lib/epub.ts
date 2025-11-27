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

// Helper to ensure content is valid XHTML body content
function sanitizeContent(content: string): string {
  // Basic cleanup - ensure paragraphs
  let clean = content;
  
  // If content has no tags, wrap paragraphs
  if (!clean.includes('<p>') && !clean.includes('<div>')) {
    clean = clean.split('\n').map(line => line.trim()).filter(line => line.length > 0).map(line => `<p>${line}</p>`).join('\n');
  }

  // Remove scripts, styles, iframes
  clean = clean.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
               .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
               .replace(/<iframe\b[^>]*>([\s\S]*?)<\/iframe>/gim, "");

  // Ensure images are closed properly for XHTML
  clean = clean.replace(/<img([^>]+)>/gi, '<img$1 />');
  clean = clean.replace(/<br>/gi, '<br />');
  clean = clean.replace(/<hr>/gi, '<hr />');
  
  // Replace named entities with numeric entities for strictly parsed XML
  // This fixes the "undefined entity" error in many EPUB readers
  clean = clean.replace(/&nbsp;/g, '&#160;');
  clean = clean.replace(/&copy;/g, '&#169;');
  clean = clean.replace(/&mdash;/g, '&#8212;');
  clean = clean.replace(/&ndash;/g, '&#8211;');
  clean = clean.replace(/&lsquo;/g, '&#8216;');
  clean = clean.replace(/&rsquo;/g, '&#8217;');
  clean = clean.replace(/&ldquo;/g, '&#8220;');
  clean = clean.replace(/&rdquo;/g, '&#8221;');
  clean = clean.replace(/&hellip;/g, '&#8230;');
  
  return clean;
}

export async function generateEpub(chapters: Chapter[], metadata: BookMetadata) {
  try {
    const zip = new JSZip();
    const date = new Date().toISOString().split('.')[0] + 'Z';
    const uuid = crypto.randomUUID();

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
      // Sanitize and ensure valid XHTML
      const safeContent = sanitizeContent(chapter.content);
      const safeTitle = escapeXml(chapter.title);
      
      const htmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en">
<head>
  <title>${safeTitle}</title>
  <meta charset="UTF-8" />
  <style>
    body { font-family: serif; line-height: 1.6; padding: 1em; max-width: 100%; }
    h1 { text-align: center; margin-bottom: 2em; page-break-after: avoid; }
    p { margin-bottom: 1em; text-indent: 1.5em; margin-top: 0; }
    img { max-width: 100%; height: auto; }
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

// Fetch with fallback proxies
async function fetchWithFallback(url: string): Promise<string> {
  const errors: string[] = [];

  // Strategy 1: AllOrigins (JSONP-like CORS proxy)
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

  // Strategy 2: Corsproxy.io (Direct CORS proxy)
  try {
    // Note: corsproxy.io appends the URL directly
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

export async function mockFetchUrl(url: string): Promise<{ title: string; content: string }> {
  try {
    // 1. Fetch HTML via proxy
    const html = await fetchWithFallback(url);
    
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

    return {
      title: article.title || "Unknown Chapter",
      content: article.content
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
