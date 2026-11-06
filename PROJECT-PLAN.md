# Subtitle Processor - Project Plan

## Overview

A web-based application for extracting audio from video files and generating subtitles using Amazon Polly. Built as a static site hosted on GitHub Pages with all processing happening client-side in the browser.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, JavaScript (ES2021+) |
| Video Processing | FFmpeg.wasm |
| Audio Processing | Web Audio API |
| Subtitle Display | Video.js (player) + custom overlay |
| AWS Integration | AWS SDK for JavaScript (browser) |
| Styling | CSS custom properties (dark/light theme) |
| Build/Deployment | GitHub Pages |

---

## Milestones

### Phase 1: Core Processing (Weeks 1-3)
- [ ] Video upload (local file + URL input)
- [ ] Audio extraction using FFmpeg.wasm
- [ ] Audio track selection UI
- [ ] Metadata preservation

### Phase 2: Subtitle Generation (Weeks 4-6)
- [ ] Polly voice selection (English/Spanish)
- [ ] Polly API integration with user credentials
- [ ] Text-to-speech synthesis via Polly
- [ ] Subtitle segment generation (sentence-level)
- [ ] Silence-based segmentation

### Phase 3: Subtitle Editing (Weeks 7-9)
- [ ] Video player with subtitle overlay
- [ ] Subtitle text editing
- [ ] Timing adjustment (manual + auto)
- [ ] Confidence scoring display
- [ ] Audio waveform display (toggleable)

### Phase 4: Session & Persistence (Weeks 10-11)
- [ ] LocalStorage persistence
- [ ] Session recovery on refresh
- [ ] AWS credential encryption/storage
- [ ] Cache for Polly responses

### Phase 5: Export & Output (Weeks 12-13)
- [ ] SRT file download
- [ ] MP4 export with burned-in subtitles
- [ ] Filename generation (video-title_subtitles.srt)
- [ ] Progress indicators during export
- [ ] Export confirmation dialog

### Phase 6: Polish & UX (Weeks 14-16)
- [ ] Queue system for sequential processing
- [ ] Error handling and retry logic
- [ ] User-friendly error messages
- [ ] Keyboard shortcuts (preset profiles)
- [ ] Auto-scroll subtitle preview
- [ ] Recent 5-item history
- [ ] Help system (tooltips + help page)

### Phase 7: Testing & Deployment (Week 17)
- [ ] E2E testing
- [ ] Cross-browser testing
- [ ] Performance optimization
- [ ] Documentation (quick start + tooltips)
- [ ] GitHub Pages deployment

---

## Design Goals

| Goal | Details |
|------|---------|
| Privacy | User credentials never leave browser |
| Offline | FFmpeg.wasm works without internet |
| Cost Control | Users pay for their own Polly usage |
| Simplicity | Single tab constraint, clear UX |
| Quality | High-quality Polly processing by default |

---

## Out of Scope (Future)

- Multi-language automatic translation
- Speaker diarization
- Word-level timing
- YouTube URL direct download
- Batch processing
- User accounts/authentication
- Cloud storage integration
- Dark mode (can be handled by browser/system)
