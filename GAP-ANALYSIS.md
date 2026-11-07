# Feature GAP Analysis & Implementation Plan

This document tracks the gap between acceptance criteria and current implementation.

---

## US-001: Upload Video

| Criteria | Status | Notes |
|----------|--------|-------|
| Supports local file upload via drag-drop and browse button | **COMPLETED** | UploadUI.js handles both drag-drop and file input |
| Support video URL input | **TODO** | Input field exists but not implemented |
| Validates file type (MP4, AVI, MOV, WebM, etc.) | **PARTIAL** | Validation exists but includes basic formats |
| Shows file name, size, and duration before processing | **PARTIAL** | Name and size shown, duration needs loading |
| Displays error for unsupported formats | **PARTIAL** | Basic alert exists, styled error needed |
| Handles files up to unlimited size (with progress feedback) | **PARTIAL** | 500MB limit enforced, no upload progress |

**Status: 2/6 Met**

### Completed:
- [x] Drag-drop upload area
- [x] File input with browse button
- [x] File validation (basic types)
- [x] File name and size display
- [x] Remove/Clear button

### Remaining:
- [ ] Add video URL input field implementation
- [ ] Show video duration (metadata loading)
- [ ] Add styled error messages instead of alert()
- [ ] Implement real upload progress indicator

---

## US-002: Extract Audio

| Criteria | Status | Notes |
|----------|--------|-------|
| Extracts all audio tracks from video | **TODO** | FFmpegController framework exists |
| Allows user to select which audio track to use | **TODO** | No track selection UI |
| Preserves original video metadata | **PARTIAL** | Metadata class exists but not integrated |
| Shows extraction progress (percent complete) | **TODO** | No progress tracking during extraction |
| Works for videos with multiple audio tracks | **TODO** | Multi-track support not implemented |

**Status: 0/5 Met**

### Implementation Needed:
- [ ] Complete FFmpeg.wasm actual audio extraction
- [ ] Add audio track selection UI dropdown
- [ ] Integrate metadata extraction from video
- [ ] Add extraction progress callback
- [ ] Implement multi-track discovery using FFprobe

---

## US-003: Generate Subtitles with Polly

| Criteria | Status | Notes |
|----------|--------|-------|
| User enters AWS access key ID and secret key | **COMPLETED** | Credentials input UI added in HTML |
| Stores credentials encrypted in localStorage | **COMPLETED** | Encryption exists in SessionStore |
| Allows Polly voice selection (English/Spanish voices) | **PARTIAL** | Static dropdown implemented, API population TODO |
| Includes voice rate adjustment (0.5x - 2.0x) | **COMPLETED** | Range slider exists in HTML |
| Shows synthesis progress | **TODO** | Progress indicator exists but needs Polly integration |
| Handles Polly rate limits gracefully | **TODO** | No rate limiting implementation |

**Status: 3/6 Met**

### Completed:
- [x] AWS credentials UI with input fields
- [x] Credential storage with encryption
- [x] Rate slider (0.5x - 2.0x)
- [x] Voice selection dropdown (static)

### Remaining:
- [ ] Connect credentials to Polly client for actual API calls
- [ ] Populate voice list from actual Polly API (describeVoices)
- [ ] Add real synthesis progress display
- [ ] Implement rate limiting (20 req/sec)

---

## US-004: View and Edit Subtitles

| Criteria | Status | Notes |
|----------|--------|-------|
| Displays subtitles overlaid on video player | **TODO** | SubtitleOverlay exists but not connected |
| Shows audio waveform for reference | **TODO** | WaveformRenderer exists but not integrated |
| Allows text editing in place | **TODO** | No edit UI for subtitle text |
| Drag-to-adjust timing on timeline | **TODO** | No timeline drag implementation |
| Shows confidence scores (color coded + numeric) | **PARTIAL** | CSS classes exist, no data display |
| Auto-scrolls to current subtitle during playback | **TODO** | No auto-scroll logic |

**Status: 1/6 Met**

### Completed:
- [x] SubtitleOverlay class with color/font size control
- [x] Confidence score CSS styles (high/medium/low)

### Remaining:
- [ ] Connect SubtitleOverlay to VideoPlayer for display
- [ ] Integrate WaveformRenderer with audio buffer
- [ ] Add inline text editing UI with save/cancel
- [ ] Implement timeline drag for timing adjustment
- [ ] Display confidence scores from subtitle segments
- [ ] Add auto-scroll to current subtitle during playback

---

## US-005: Save Session

| Criteria | Status | Notes |
|----------|--------|-------|
| Auto-saves every 2 minutes to localStorage | **COMPLETED** | SessionStore exists with interval |
| Recovers session on page refresh | **TODO** | SessionStore.load() exists but no recovery UI |
| Persists subtitle edits, settings, and credentials | **PARTIAL** | SessionStore stores data but not fully utilized |
| Cache persists Polly responses for cost savings | **COMPLETED** | Cache class exists |

**Status: 2/4 Met**

### Completed:
- [x] SessionStore with encryption
- [x] Cache for Polly responses
- [x] Settings persistence
- [x] Auto-save interval (2 minutes)

### Remaining:
- [ ] Implement session recovery UI notification
- [ ] Store AWS credentials in session (encrypted)
- [ ] Show "Session restored" toast on page load

---

## US-006: Export Subtitles

| Criteria | Status | Notes |
|----------|--------|-------|
| Exports clean SRT format | **COMPLETED** | SRTParser.format() implemented |
| Filename: {video-title}_subtitles.srt | **COMPLETED** | Logic exists in main.js |
| Opens confirmation dialog before download | **TODO** | No confirmation modal |
| Shows estimated file size in confirmation | **TODO** | File size not calculated |

**Status: 2/4 Met**

### Remaining:
- [ ] Add confirmation modal before SRT download
- [ ] Calculate and display SRT file size
- [ ] Add option to copy to clipboard

---

## US-007: Export Video with Burned-in Subtitles

| Criteria | Status | Notes |
|----------|--------|-------|
| Exports as MP4 with burned-in subtitles | **TODO** | FFmpeg.wasm integration not complete |
| Creates new file (original unchanged) | **TODO** | Not implemented |
| Allows color selection for burned-in subtitles | **TODO** | No color picker for burned subtitles |
| Shows export progress with step-by-step status | **TODO** | No export progress display |
| Preserves original video metadata | **TODO** | Metadata not preserved in export |

**Status: 0/5 Met**

### Implementation Needed:
- [ ] Complete FFmpeg.wasm video output integration
- [ ] Implement burned-in subtitle rendering (VTT overlay)
- [ ] Add subtitle color picker
- [ ] Add export progress tracking
- [ ] Preserve video metadata during re-encoding

---

## US-008: Keyboard Shortcuts

| Criteria | Status | Notes |
|----------|--------|-------|
| Space: Play/Pause | **COMPLETED** | Logic in main.js, event listener TODO |
| Left/Right Arrow: Seek 1 second | **COMPLETED** | Logic exists, event listener TODO |
| Shift+Left/Right: Seek 10 seconds | **COMPLETED** | Logic exists, event listener TODO |
| Up/Down: Increase/decrease subtitle font size | **COMPLETED** | Method exists, event listener TODO |
| S: Toggle subtitles | **COMPLETED** | Logic exists, event listener TODO |

**Status: 0/5 Met** (Logic exists, event connections pending)

### Completed:
- [x] All keyboard handler methods in main.js

### Remaining:
- [ ] Connect keyboard event listeners to handlers
- [ ] Test shortcut conflicts with browser defaults

---

## US-009: Error Handling

| Criteria | Status | Notes |
|----------|--------|-------|
| User-friendly error summary visible | **PARTIAL** | Toast system exists for basic errors |
| Technical details in expandable section | **TODO** | No technical error details display |
| Retry button on network failures | **TODO** | No retry mechanism |
| Cache persists partial progress on failure | **TODO** | No partial progress caching |
| Allows resume from failure point | **TODO** | No resume logic |

**Status: 1/5 Met**

### Implementation Needed:
- [ ] Create error modal with technical details (error code, stack trace)
- [ ] Implement retry logic for failed tasks
- [ ] Cache partial synthesis results
- [ ] Add resume capability for interrupted tasks
- [ ] Distinguish between error types (network, auth, quota)

---

## US-010: Help and Documentation

| Criteria | Status | Notes |
|----------|--------|-------|
| Inline tooltips on first use | **TODO** | No tooltip system |
| Help icon opens quick-start guide | **COMPLETED** | Help button opens modal |
| Troubleshooting section for common issues | **COMPLETED** | docs/HELP.md created |
| AWS credential setup instructions | **COMPLETED** | SETUP.md created |

**Status: 2/4 Met**

### Completed:
- [x] Help button opens quick-start modal
- [x] Keyboard shortcuts display
- [x] Troubleshooting documentation
- [x] AWS credential setup instructions

### Remaining:
- [ ] Add tooltip library (tippy.js or similar)
- [ ] Implement tooltips for first-time user guidance
- [ ] Add video tutorial link

---

## US-EC01: Multiple Audio Tracks

| Criteria | Status | Notes |
|----------|--------|-------|
| Select which audio track to use | **TODO** | Track selection not implemented |

**Status: 0/1 Met**

### Implementation Needed:
- [ ] Detect multiple audio tracks using FFprobe
- [ ] Add track selection dropdown to UI
- [ ] Allow user to select track by index/language

---

## US-EC02: Large Video Files

| Criteria | Status | Notes |
|----------|--------|-------|
| Process large videos without hitting browser memory limits | **TODO** | 500MB limit enforced |

**Status: 0/1 Met**

### Implementation Needed:
- [ ] Implement S3 upload for large files
- [ ] Add chunked processing
- [ ] Progressive loading
- [ ] Memory usage monitoring

---

## US-EC03: Browser Navigation

| Criteria | Status | Notes |
|----------|--------|-------|
| Warn about leaving with unsaved work | **TODO** | No beforeunload handler |

**Status: 0/1 Met**

### Implementation Needed:
- [ ] Implement beforeunload handler
- [ ] Show confirmation dialog if unsaved changes
- [ ] Store session dirty state

---

## US-EC04: Invalid AWS Credentials

| Criteria | Status | Notes |
|----------|--------|-------|
| Test credentials immediately | **TODO** | No credential validation |

**Status: 0/1 Met**

### Implementation Needed:
- [ ] Add "Test Credentials" button
- [ ] Make actual Polly API call with test text
- [ ] Show success/error feedback
- [ ] Validate format of Access Key ID

---

## Summary

| Category | Met | Partial | TODO | Total |
|----------|-----|---------|------|-------|
| US-001 Upload Video | 2 | 2 | 2 | 6 |
| US-002 Extract Audio | 0 | 0 | 5 | 5 |
| US-003 Generate Subtitles | 3 | 0 | 3 | 6 |
| US-004 View/Edit Subtitles | 1 | 0 | 5 | 6 |
| US-005 Save Session | 2 | 0 | 2 | 4 |
| US-006 Export Subtitles | 2 | 0 | 2 | 4 |
| US-007 Export Video | 0 | 0 | 5 | 5 |
| US-008 Keyboard Shortcuts | 0 | 1 | 4 | 5 |
| US-009 Error Handling | 1 | 0 | 4 | 5 |
| US-010 Help & Docs | 2 | 0 | 2 | 4 |
| US-EC01-EC04 Edge Cases | 0 | 0 | 4 | 4 |
| **TOTAL** | **13** | **4** | **38** | **55** |

### Overall Progress: **24% Complete**

---

## Priority Implementation Roadmap

### Week 1-2: Core Audio Processing
1. FFmpeg.wasm integration for audio extraction
2. Audio track selection UI
3. Progress tracking for extraction

### Week 3-4: Polly Integration
1. Complete AWS credentials connection
2. Test actual Polly API calls
3. Implement voice list from API
4. Add synthesis progress display

### Week 5-6: Subtitle Editor
1. Connect SubtitleOverlay to video player
2. Inline text editing UI
3. Confidence score display
4. Auto-scroll during playback

### Week 7-8: Polish & Edge Cases
1. Keyboard shortcut event connections
2. Error handling with retry logic
3. Session recovery UI
4. BeforeUnload handler for unsaved work
5. Credential validation button

### Week 9-10: Advanced Features
1. Burned-in subtitle export
2. URL video input support
3. Multiple audio track detection
4. S3 upload for large files

---

## Quick Fixes (High Priority)

1. **Keyboard shortcuts**: Connect event listeners (30 min)
2. **Error handling**: Add error modal with details (45 min)
3. **BeforeUnload**: Add unsaved work warning (15 min)
4. **Test Credentials**: Add validation button (30 min)
5. **Session Recovery**: Show "Session restored" toast (15 min)

**Total**: ~2 hours
