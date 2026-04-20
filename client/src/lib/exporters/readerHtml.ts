import saveAs from "file-saver";
import { escapeXml, type BookMetadata, type Chapter } from "@/lib/chapter";
import { sanitizeContent } from "@/lib/content/sanitize";

export async function generateReaderModeHTML(chapters: Chapter[], metadata: BookMetadata) {
  try {
    const combinedContent = chapters
      .map(
        (chapter) => `
      <article class="chapter" aria-label="${escapeXml(chapter.title)}">
        <h2>${escapeXml(chapter.title)}</h2>
        ${sanitizeContent(chapter.content)}
      </article>
    `,
      )
      .join("\n<hr/>\n");

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

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    saveAs(blob, `${metadata.title.replace(/[^a-z0-9]/gi, "_")}_reader.html`);
    return true;
  } catch (error) {
    console.error("Error generating Reader Mode HTML:", error);
    throw new Error("Failed to generate Reader Mode HTML");
  }
}

export async function generateAudiobookHTML(chapters: Chapter[], metadata: BookMetadata) {
  try {
    const combinedContent = chapters
      .map(
        (chapter) => `
      <article class="chapter" data-title="${escapeXml(chapter.title)}">
        <h2>${escapeXml(chapter.title)}</h2>
        ${sanitizeContent(chapter.content)}
      </article>
    `,
      )
      .join("\n<hr/>\n");

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
    let isPlaying = false;
    let paragraphs = Array.from(document.querySelectorAll('p'));
    let currentIndex = 0;
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
    if (speechSynthesis.onvoiceschanged !== undefined) speechSynthesis.onvoiceschanged = loadVoices;
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
      const utterance = new SpeechSynthesisUtterance(paragraphs[index].innerText);
      const voiceIndex = document.getElementById('voice-select').value;
      if (voices[voiceIndex]) utterance.voice = voices[voiceIndex];
      utterance.rate = parseFloat(document.getElementById('speed-select').value);
      utterance.onend = () => {
        if (isPlaying) speak(currentIndex + 1);
      };
      utterance.onerror = () => {
        isPlaying = false;
        updateButton();
      };
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
    paragraphs.forEach((p, i) => {
      p.style.cursor = 'pointer';
      p.onclick = () => {
        isPlaying = true;
        updateButton();
        speak(i);
      };
    });
    document.getElementById('speed-select').onchange = () => {
      if (isPlaying) {
        synth.cancel();
        speak(currentIndex);
      }
    };
  </script>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    saveAs(blob, `${metadata.title.replace(/[^a-z0-9]/gi, "_")}.html`);
    return true;
  } catch (error) {
    console.error("Error generating Audiobook:", error);
    throw new Error("Failed to generate Audiobook HTML");
  }
}
