# Subtitle Processor - Module Structure

```
src/
├── main.js                 # Application entry point
├── config.js               # Configuration and constants
├── utils/
│   ├── fileUtils.js        # File handling, validation
│   ├── timeUtils.js        # Time formatting (hh:mm:ss,mss)
│   ├── encryption.js       # LocalStorage encryption helpers
│   └── logger.js           # Unified logging
├── aws/
│   ├── credentials.js      # AWS key storage/managers
│   ├── pollyClient.js      # Polly API wrapper
│   └── stsClient.js        # STS temporary credentials
├── video/
│   ├── FFmpegController.js # FFmpeg.wasm orchestration
│   ├── AudioExtractor.js   # Audio extraction logic
│   └── Metadata.js         # Metadata preservation
├── audio/
│   ├── AudioPlayer.js      # Web Audio API player
│   ├── WaveformRenderer.js # Waveform canvas rendering
│   └── Segmenter.js        # Silence-based segmentation
├── subtitles/
│   ├── SubtitleManager.js  # Core subtitle operations
│   ├── SubtitleEditor.js   # Edit state management
│   ├── SRTParser.js        # SRT import/export
│   └── PollySyncer.js      # Polly response processing
├── player/
│   ├── VideoPlayer.js      # Video.js wrapper
│   └── SubtitleOverlay.js  # Custom subtitle overlay
├── ui/
│   ├── UploadUI.js         # Upload handlers
│   ├── ProgressBar.js      # Progress tracking UI
│   ├── Toast.js            # Toast notifications
│   └── Modal.js            # Confirmation modals
├── storage/
│   ├── SessionStore.js     # Session persistence
│   ├── Cache.js            # Polly response caching
│   └── HistoryStore.js     # Recent 5 history
└── queue/
    ├── TaskQueue.js        # Sequential queue management
    └── TaskRunner.js       # Task executor

tests/
├── unit/                   # Unit tests (Jest/Vitest)
├── integration/            # Integration tests
└── e2e/                    # E2E tests (Playwright/Cypress)

docs/
├── api/                    # API documentation
│   └── polly.md
├── architecture/           # Architecture diagrams
│   ├── data-flow.svg
│   └── module-dependencies.svg
└── user-guide/             # User-facing docs
    ├── quick-start.md
    └── troubleshooting.md
```

---

## Key Modules Description

### main.js
- Application initialization
- Route management (upload, process, edit, export views)
- Event bus for cross-module communication

### FFmpegController.js
- Manages FFmpeg.wasm instance
- Handles video-to-audio conversion
- Progress callbacks during transcoding

### PollyClient.js
- AWS SDK wrapper for Polly
- SynthesizeSpeech API calls
- MP3 output handling
- Rate limiting and retry logic

### SubtitleManager.js
- Core data structure for subtitle segments
- CRUD operations for segments
- Timing validation
- Confidence score management

### VideoPlayer.js
- Video.js integration
- Subtitle track management
- Play/pause/seek event handling
- Custom overlay rendering

### SessionStore.js
- Encrypted localStorage persistence
- Session state serialization
- Migration handling for version changes

### TaskQueue.js
- Sequential task execution
- Progress reporting per task
- Failure recovery (resume from failure point)
