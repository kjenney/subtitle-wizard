# Subtitle Processor - User Stories & Acceptance Criteria

## Core User Stories

### US-001: Upload Video
**As a** user
**I want to** upload a video file from my device
**So that** I can process it for subtitles

**Acceptance Criteria:**
- [ ] Supports local file upload via drag-drop and browse button
- [ ] Supportsvideo URL input
- [ ] Validates file type (MP4, AVI, MOV, WebM, etc.)
- [ ] Shows file name, size, and duration before processing
- [ ] Displays error for unsupported formats
- [ ] Handles files up to unlimited size (with progress feedback)

---

### US-002: Extract Audio
**As a** user
**I want to** extract audio from my video
**So that** Polly can generate subtitles from the speech

**Acceptance Criteria:**
- [ ] Extracts all audio tracks from video
- [ ] Allows user to select which audio track to use
- [ ] Preserves original video metadata
- [ ] Shows extraction progress (percent complete)
- [ ] Works for videos with multiple audio tracks

---

### US-003: Generate Subtitles with Polly
**As a** user
**I want to** generate subtitles using Amazon Polly
**So that** I get accurate, time-synced subtitles

**Acceptance Criteria:**
- [ ] User enters AWS access key ID and secret key
- [ ] Stores credentials encrypted in localStorage
- [ ] Allows Polly voice selection (English/Spanish voices)
- [ ] Includes voice rate adjustment (0.5x - 2.0x)
- [ ] Shows synthesis progress
- [ ] Handles Polly rate limits gracefully

---

### US-004: View and Edit Subtitles
**As a** user
**I want to** view and edit subtitle segments
**So that** I can correct errors and adjust timing

**Acceptance Criteria:**
- [ ] Displays subtitles overlaid on video player
- [ ] Shows audio waveform for reference
- [ ] Allows text editing in place
- [ ] Drag-to-adjust timing on timeline
- [ ] Shows confidence scores (color coded + numeric)
- [ ] Auto-scrolls to current subtitle during playback

---

### US-005: Save Session
**As a** user
**I want to** save my work
**So that** I can resume later

**Acceptance Criteria:**
- [ ] Auto-saves every 2 minutes to localStorage
- [ ] Recovers session on page refresh
- [ ] Persists subtitle edits, settings, and credentials
- [ ] Cache persists Polly responses for cost savings

---

### US-006: Export Subtitles
**As a** user
**I want to** download SRT files
**So that** I can use them in other applications

**Acceptance Criteria:**
- [ ] Exports clean SRT format
- [ ] Filename: `{video-title}_subtitles.srt`
- [ ] Opens confirmation dialog before download
- [ ] Shows estimated file size in confirmation

---

### US-007: Export Video with Burned-in Subtitles
**As a** user
**I want to** create a video file with subtitles baked in
**So that** I can share it with subtitles always visible

**Acceptance Criteria:**
- [ ] Exports as MP4 with burned-in subtitles
- [ ] Creates new file (original unchanged)
- [ ] Allows color selection for burned-in subtitles
- [ ] Shows export progress with step-by-step status
- [ ] Preserves original video metadata

---

### US-008: Keyboard Shortcuts
**As a** user
**I want to** use keyboard shortcuts for common actions
**So that** I can edit faster

**Acceptance Criteria:**
- [ ] Space: Play/Pause
- [ ] Left/Right Arrow: Seek 1 second
- [ ] Shift+Left/Right: Seek 10 seconds
- [ ] Up/Down: Increase/decrease subtitle font size
- [ ] S: Toggle subtitles

---

### US-009: Error Handling
**As a** user
**I want to** clear error messages
**So that** I know what went wrong and how to fix it

**Acceptance Criteria:**
- [ ] User-friendly error summary visible
- [ ] Technical details in expandable section
- [ ] Retry button on network failures
- [ ] Cache persists partial progress on failure
- [ ] Allows resume from failure point

---

### US-010: Help and Documentation
**As a** user
**I want to** get help when needed
**So that** I can use the application effectively

**Acceptance Criteria:**
- [ ] Inline tooltips on first use
- [ ] Help icon opens quick-start guide
- [ ] Troubleshooting section for common issues
- [ ] AWS credential setup instructions

---

## Edge Case Stories

### US-EC01: Multiple Audio Tracks
**As a** user
**I want to** select which audio track to use
**So that** I can subtitle the correct language

### US-EC02: Large Video Files
**As a** user
**I want to** process large videos
**So that** I don't hit browser memory limits

### US-EC03: Browser Navigation
**As a** user
**I want to** know if I'm about to leave with unsaved work
**So that** I don't lose my progress

### US-EC04: Invalid AWS Credentials
**As a** user
**I want to** know immediately if my AWS keys are invalid
**So that** I can fix them before processing
