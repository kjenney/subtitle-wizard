# Architectural Decisions

## 0001-client-side-processing

All video/audio processing happens in the browser using FFmpeg.wasm. No video data is sent to a server during processing.

**Why**: Privacy and cost. Users can process sensitive content without sending it to our servers, and we avoid server bandwidth/compute costs. The tradeoff is that very large videos may be limited by browser memory.

---

## 0002-polly-as-source-of-truth

Amazon Polly is the authoritative source for subtitle text and timing. We don't use separate speech-to-text services.

**Why**: Simplicity and quality. Polly's neural TTS produces natural speech, and we can derive precise timestamps from the TTS output. Adding a separate STS service would increase complexity and cost.

---

## 0003-srt-as-primary-format

SRT is the primary and canonical subtitle format. Other formats (VTT) are converted from SRT, not produced natively.

**Why**: SRT is the lingua franca of subtitle files. It's human-readable, widely supported, and easier to edit manually if needed.

---

## 0004-user-aws-credentials

Users provide their own AWS access keys. We do not provide shared credentials or charge users directly.

**Why**: Security and compliance. User credentials ensure proper IAM boundaries and audit trails. We act as a client that uses STS to assume roles if needed, but the billing and access control belong to the user's AWS account.

---

## 0005-localstorage-persistence

The app uses encrypted localStorage for session persistence and caching. No server-side database is used.

**Why**: Simplicity and offline capability. Since this is a static site on GitHub Pages, localStorage is the most straightforward way to save user sessions, credentials (encrypted), and cached Polly responses.

---

## 0006-single-tab-constraint

Only one session can be active per browser tab. Multiple tabs are not synchronized.

**Why**: Complexity management. Supporting multiple concurrent sessions would require complex state management and could exhaust browser memory. Users can open multiple tabs for parallel processing, but each tab is independent.

---

## 0007-high-quality-first

The app defaults to high-quality Polly processing. A "fast mode" is not implemented.

**Why**: Subtitle quality matters more than processing speed for this use case. Users can typically wait longer for better results. Fast mode can be added later if demand exists.

---

## 0008-english-and-spanish-only

Initial release supports only English and Spanish voices. Multi-language support is out of scope.

**Why**: Focus. Adding more languages increases testing burden and complexity. These two languages cover the largest user bases. Additional languages can be added via feature flags.

---

## 0009-burned-in-export-as-new-file

When exporting video with burned-in subtitles, a new file is created. The original is never modified.

**Why**: Safety and workflow. Users may need to iterate on subtitles multiple times. Reversing burned-in subtitles is difficult or impossible, so preserving the original is critical.

---

## 0010-timing-precision-level

Subtitle timing uses sentence-level precision, not word-level.

**Why**: Simplicity vs. benefit tradeoff. Sentence-level provides good subtitle synchronization with significantly less complexity than word-level timing. Word-level would require phoneme-level analysis or much more complex segmentation.
