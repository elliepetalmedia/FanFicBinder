import JSZip from "jszip";
import saveAs from "file-saver";
import { escapeXml, type BookMetadata, type Chapter } from "@/lib/chapter";
import { sanitizeContent } from "@/lib/content/sanitize";
import { generateCustomCSS, type ExportOptions } from "./options";

export async function generateEpub(
  chapters: Chapter[],
  metadata: BookMetadata,
  options?: ExportOptions,
) {
  try {
    const zip = new JSZip();
    const date = new Date().toISOString().split(".")[0] + "Z";
    const uuid = crypto.randomUUID();
    const cssContent = generateCustomCSS(options || {});

    zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

    zip.folder("META-INF")?.file(
      "container.xml",
      '<?xml version="1.0"?>' +
        '<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">' +
        "  <rootfiles>" +
        '    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>' +
        "  </rootfiles>" +
        "</container>",
    );

    const oebps = zip.folder("OEBPS");
    if (!oebps) throw new Error("Failed to create OEBPS folder");

    let coverFilename = "";
    if (metadata.cover) {
      coverFilename = "cover.jpg";
      oebps.file(coverFilename, metadata.cover);
    }

    chapters.forEach((chapter, index) => {
      const filename = `chapter_${index + 1}.xhtml`;
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

    const manifestItems = chapters
      .map(
        (_, i) =>
          `<item id="chap${i + 1}" href="chapter_${i + 1}.xhtml" media-type="application/xhtml+xml"/>`,
      )
      .join("\n    ");

    const spineItems = chapters
      .map((_, i) => `<itemref idref="chap${i + 1}"/>`)
      .join("\n    ");

    const coverManifest = coverFilename
      ? `<item id="cover-image" href="${coverFilename}" media-type="image/jpeg" properties="cover-image"/>`
      : "";

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

    oebps.file("content.opf", opfContent);

    const navPoints = chapters
      .map(
        (chapter, i) => `
    <navPoint id="navPoint-${i + 1}" playOrder="${i + 1}">
      <navLabel><text>${escapeXml(chapter.title)}</text></navLabel>
      <content src="chapter_${i + 1}.xhtml"/>
    </navPoint>`,
      )
      .join("");

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

    oebps.file("toc.ncx", ncxContent);

    const blob = await zip.generateAsync({ type: "blob", mimeType: "application/epub+zip" });
    saveAs(blob, `${metadata.title.replace(/[^a-z0-9]/gi, "_")}.epub`);

    return true;
  } catch (error) {
    console.error("Error generating EPUB:", error);
    throw new Error("Failed to generate EPUB");
  }
}

export type { ExportOptions };
