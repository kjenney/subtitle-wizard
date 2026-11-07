# Subtitle Wizard - Roadmap

## Current Status (v1.0.0)

The project is approximately **25% complete** with the UI framework and core architecture in place. Key completed components include the upload UI, video player integration, session persistence with encryption, and basic Polly client integration.

---

## Recent Updates

### Completed (v1.0.0-alpha)
- [x] Video upload (drag-and-drop + file picker)
- [x] Video player integration with HTML5 Video
- [x] AWS credentials UI with encryption
- [x] Polly client with AWS SDK integration
- [x] Subtitle editor UI framework
- [x] SRT export functionality
- [x] Toast notification system
- [x] Session persistence with encryption
- [x] Basic keyboard handlers implemented

### Documentation Completed
- [x] Quick Start Guide (`SETUP.md`)
- [x] User Help Documentation (`docs/HELP.md`)
- [x] GAP Analysis (`GAP-ANALYSIS.md`)
- [x] Implementation Guide (`IMPLEMENTATION.md`)
- [x] README documentation

---

## Roadmap

### Week 1-2: Core Audio Extraction (Priority: High)
**Goal**: Complete FFmpeg.wasm integration for audio extraction

- [ ] Complete FFmpeg.wasm actual audio extraction
- [ ] Add audio track selection UI dropdown
- [ ] Integrate metadata extraction from video
- [ ] Add extraction progress callback
- [ ] Implement multi-track discovery using FFprobe

### Week 3-4: Polly Integration (Priority: High)
**Goal**: Connect AWS credentials to Polly API and test synthesis

- [ ] Connect credentials to Polly client for actual API calls
- [ ] Populate voice list from actual Polly API (describeVoices)
- [ ] Add real synthesis progress display
- [ ] Implement rate limiting (20 req/sec)
- [ ] Add "Test Credentials" validation button

### Week 5-6: Subtitle Editor (Priority: High)
**Goal**: Enable subtitle editing with visual feedback

- [ ] Connect SubtitleOverlay to VideoPlayer for display
- [ ] Implement inline text editing UI with save/cancel
- [ ] Add confidence score display from subtitle segments
- [ ] Add auto-scroll to current subtitle during playback
- [ ] Implement waveform visualization with audio buffer

### Week 7-8: Polish & UX Improvements (Priority: High)
**Goal**: Complete keyboard shortcuts and error handling

- [ ] Connect keyboard event listeners to handlers
- [ ] Create error modal with technical details
- [ ] Implement retry logic for failed tasks
- [ ] Add session recovery UI notification
- [ ] Implement beforeunload handler for unsaved work

### Week 9-10: Export Enhancements (Priority: Medium)
**Goal**: Improve export experience

- [ ] Add confirmation modal before SRT download
- [ ] Calculate and display SRT file size
- [ ] Add option to copy to clipboard
- [ ] Implement burned-in subtitle export
- [ ] Add subtitle color picker for burned-in

### Week 11-12: Advanced Features (Priority: Medium)
**Goal**: Add advanced functionality

- [ ] URL video input support
- [ ] Multiple audio track detection
- [ ] S3 upload for large files (>500MB)
- [ ] Batch processing support
- [ ] Recent 5-item history

---

## Long-Term Vision (Future Phases)

### Phase 8: Collaboration (Q1 2025)
- [ ] Share sessions via URL
- [ ] Export to Google Docs/Office formats
- [ ] Multi-user editing (WebSockets)

### Phase 9: Analytics (Q2 2025)
- [ ] Usage statistics (anonymous)
- [ ] Cost tracking per user
- [ ] Voice preference analytics

### Phase 10: Internationalization (Q3 2025)
- [ ] Translate UI to Spanish
- [ ] Support RTL languages
- [ ] Region-specific settings

---

## Quick Fixes (High Priority - Can be done now)

| Task | Effort | Impact |
|------|--------|--------|
| Keyboard shortcuts connection | 30 min | High |
| Error modal with details | 45 min | High |
| BeforeUnload handler | 15 min | Medium |
| Test Credentials button | 30 min | High |
| Session Recovery toast | 15 min | Low |
| **Total** | **~2 hours** | **High** |

---

## Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Core functionality | 100% | 25% |
| Unit test coverage | 80% | 0% |
| User satisfaction | 4.5/5 | N/A |
| Error-free workflow | 95% | N/A |

---

## Contribution Guidelines

### Getting Started
1. Review GAP-ANALYSIS.md for current TODOs
2. Check IMPLEMENTATION.md for code structure
3. See SETUP.md for development setup

### Testing
- Run tests: `npm test` (when testing framework is set up)
- Manual testing: Open `index.html` and verify features

### Code Standards
- ES2021+ features
- Consistent naming conventions
- JSDoc comments for public functions
- Error handling throughout
