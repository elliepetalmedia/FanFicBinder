export interface ExportOptions {
  font?: string;
  spacing?: string;
  dropCaps?: boolean;
}

export function generateCustomCSS(options: ExportOptions): string {
  let css = `
    body {
      font-family: ${options.font === "sans" ? "sans-serif" : options.font === "dyslexic" ? "OpenDyslexic, sans-serif" : "serif"};
      line-height: ${options.spacing || "1.6"};
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
