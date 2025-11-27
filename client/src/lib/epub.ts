import JSZip from 'jszip';
import saveAs from 'file-saver';

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

export async function generateEpub(chapters: Chapter[], metadata: BookMetadata) {
  try {
    const zip = new JSZip();
    const date = new Date().toISOString().split('.')[0] + 'Z';

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
      const htmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en">
<head>
  <title>${chapter.title}</title>
  <meta charset="UTF-8" />
  <style>
    body { font-family: serif; line-height: 1.6; padding: 1em; }
    h1 { text-align: center; margin-bottom: 2em; }
    p { margin-bottom: 1em; }
  </style>
</head>
<body>
  <h1>${chapter.title}</h1>
  ${chapter.content}
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
    <dc:title>${metadata.title}</dc:title>
    <dc:creator>${metadata.author}</dc:creator>
    <dc:language>en</dc:language>
    <dc:identifier id="BookId">urn:uuid:${crypto.randomUUID()}</dc:identifier>
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
      <navLabel><text>${c.title}</text></navLabel>
      <content src="chapter_${i + 1}.xhtml"/>
    </navPoint>`).join('');

    const ncxContent = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:12345"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${metadata.title}</text></docTitle>
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

// Real client-side fetch using a public CORS proxy
export async function mockFetchUrl(url: string): Promise<{ title: string; content: string }> {
  try {
    // Using allorigins.win as a CORS proxy
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    
    if (!response.ok) throw new Error("Network response was not ok");
    
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Basic heuristic to find content
    const title = doc.querySelector('title')?.textContent || 
                 doc.querySelector('h1')?.textContent || 
                 "Unknown Chapter";

    // Try to find the main content container
    // Common selectors for story sites
    const selectors = [
      '#workskin', // AO3
      '.user-content', // Generic
      '.chapter-content', // RoyalRoad
      '.story-text', // Fanfiction.net (might be blocked even with proxy)
      'article',
      'main',
      'body' // Fallback
    ];

    let contentNode = null;
    for (const selector of selectors) {
      const node = doc.querySelector(selector);
      if (node && node.textContent && node.textContent.length > 500) {
        contentNode = node;
        break;
      }
    }

    let content = "";
    if (contentNode) {
        // Extract paragraphs
        const paragraphs = contentNode.querySelectorAll('p');
        if (paragraphs.length > 0) {
            content = Array.from(paragraphs).map(p => `<p>${p.innerHTML}</p>`).join('\n');
        } else {
            // Fallback to innerHTML if no paragraphs found
            content = contentNode.innerHTML;
        }
    } else {
       // Extreme fallback
       content = "<p>Could not automatically extract content. Please copy/paste manually.</p>";
    }

    // Clean up content slightly
    // Remove scripts and styles from the extracted string if they leaked in
    content = content.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "")
                     .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gm, "");

    if (!content || content.length < 50) {
         throw new Error("No content found");
    }

    return {
      title: title.trim(),
      content: content
    };

  } catch (error) {
    console.error("Fetch error:", error);
    // Fallback to the mock if real fetch fails (e.g. very strict sites)
    // But user asked to fix it, so we throw error or return a "Manual Entry Required" message
    // Better to return a helpful error state or a manual entry prompt
    
    // For now, let's return a user-friendly mock that explains what happened
    // This prevents the "always 97 words" confusion by being explicit
    return {
      title: "Connection Failed",
      content: `
        <p><strong>Could not fetch content from:</strong> ${url}</p>
        <p>This might be due to:</p>
        <ul>
          <li>The site blocking automated access (Cloudflare, etc.)</li>
          <li>CORS restrictions</li>
          <li>Invalid URL</li>
        </ul>
        <p>Please try using the <strong>Manual Entry</strong> tab to copy-paste the content.</p>
      `
    };
  }
}
