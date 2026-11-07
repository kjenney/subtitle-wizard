# Subtitle Wizard - Implementation Guide

## Project Status

**Current Milestone**: MVP (Minimum Viable Product)

The Subtitle Wizard is a client-side web application for video subtitle generation using AWS Polly. The project is approximately 25% complete with the UI framework in place and core architecture working.

## Project Structure

```
subtitle-wizard/
├── index.html              # Main entry point with UI
├── SETUP.md                # Quick start setup guide
├── README.md               # Project overview
├── IMPLEMENTATION.md       # This file
├── GAP-ANALYSIS.md         # Feature gaps and TODO
├── LICENSE                 # MIT License
└── src/
    ├── main.js            # Application entry point
    ├── config.js          # Configuration and constants
    ├── utils/
    │   ├── timeUtils.js   # Time formatting utilities
    │   ├── fileUtils.js   # File handling utilities
    │   ├── logger.js      # Unified logging
    │   └── encryption.js  # Encryption helpers
    ├── aws/
    │   ├── credentials.js # AWS credential management
    │   ├── pollyClient.js # Polly API client
    │   └── stsClient.js   # STS client
    ├── video/
    │   ├── FFmpegController.js  # FFmpeg.wasm integration
    │   ├── AudioExtractor.js    # Audio extraction
    │   └── Metadata.js          # Metadata preservation
    ├── audio/
    │   ├── AudioPlayer.js       # Web Audio API player
    │   ├── WaveformRenderer.js  # Waveform visualization
    │   └── Segmenter.js         # Silence-based segmentation
    ├── subtitles/
    │   ├── SubtitleManager.js   # Segment management
    │   ├── SubtitleEditor.js    # Edit state management
    │   ├── SRTParser.js         # SRT import/export
    │   └── PollySyncer.js       # Polly integration
    ├── player/
    │   ├── VideoPlayer.js       # Video player wrapper
    │   └── SubtitleOverlay.js   # Subtitle overlay
    ├── ui/
    │   ├── UploadUI.js          # Upload handlers
    │   ├── ProgressBar.js       # Progress tracking
    │   ├── Toast.js             # Toast notifications
    │   └── Modal.js             # Modal dialogs
    ├── storage/
    │   ├── SessionStore.js      # Session persistence
    │   ├── Cache.js             # Polly response cache
    │   └── HistoryStore.js      # Recent history
    └── queue/
        ├── TaskQueue.js         # Sequential task queue
        └── TaskRunner.js        # Task executor
```

## Implementation Progress

### Phase 1: Core Processing (Approx. 60% Complete)
- [x] Video upload (local file + browse button)
- [x] Video player integration with HTML5 Video
- [x] Drag-and-drop upload area
- [x] File validation (type and size)
- [x] Audio extraction framework
- [x] Metadata preservation structure
- [ ] FFmpeg.wasm actual integration (needs testing)
- [ ] Multi-track audio support

### Phase 2: Subtitle Generation (Approx. 40% Complete)
- [x] AWS credentials UI with encryption
- [x] Polly client with AWS SDK integration
- [x] Voice selection dropdown (static)
- [x] Speech rate adjustment (0.5x - 2.0x)
- [ ] Polly API integration with credentials
- [ ] Text-to-speech synthesis testing
- [ ] Subtitle segment generation
- [ ] Silence-based segmentation
- [ ] Confidence score display

### Phase 3-7: Future Phases
See GAP-ANALYSIS.md for detailed feature list and priorities.

## Development Setup

### Running Locally

1. Clone or download this repository
2. Open `index.html` in a modern web browser
3. The app is purely client-side - no server required

### Development Requirements

- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Internet**: Required to load AWS SDK from CDN
- **AWS Account**: For testing Polly integration

### Testing with Sample Data

For testing without AWS credentials:

1. Open the app in your browser
2. Upload a video file ( MP4, WebM, OGG)
3. Use the UI to verify interactions work correctly
4. AWS features will show "not authorized" until credentials are added

## Key Features Implemented

1. **UploadUI**: Drag-and-drop and file picker for videos
2. **VideoPlayer**: HTML5 video player wrapper
3. **AudioPlayer**: Web Audio API audio player
4. **SubtitleManager**: Segment storage and management
5. **SRTParser**: SRT file format handling (import/export)
6. **Toast Notifications**: User feedback system
7. **SessionStore**: LocalStorage persistence with AES encryption
8. **TaskQueue**: Sequential task processing framework
9. **PollyClient**: AWS Polly API client with SDK integration
10. **Config System**: Centralized configuration constants

## Configuration

Edit `src/config.js` to customize:

```javascript
// AWS Polly configuration
AWS_POLLY: {
  region: 'us-east-1',
  sampleRate: 16000,
  outputFormat: 'json'
}

// Subtitle configuration
SUBTITLE: {
  defaultColor: '#FFFFFF',
  defaultFontSize: 16,
  minFontSize: 10,
  maxFontSize: 48
}

// File limits
MAX_FILE_SIZE: 500 * 1024 * 1024  // 500MB

// Auto-save interval
AUTO_SAVE_INTERVAL: 2 * 60 * 1000  // 2 minutes
```

## Browser Support

| Browser | Version | Notes |
|---------|---------|-------|
| Chrome | 90+ | Full support |
| Firefox | 88+ | Full support |
| Safari | 14+ | Full support |
| Edge | 90+ | Full support |

## Next Steps

### Priority 1 (Core Functionality)
1. [ ] Implement FFmpeg.wasm audio extraction
2. [ ] Connect AWS credentials to Polly client
3. [ ] Test Polly API with real credentials
4. [ ] Implement subtitle editor UI
5. [ ] Add inline text editing

### Priority 2 (Polish)
1. [ ] Implement keyboard shortcuts (event listeners)
2. [ ] Add waveform visualization
3. [ ] Improve error handling with retry logic
4. [ ] Add session recovery UI
5. [ ] Create confirmation modals for exports

### Priority 3 (Advanced)
1. [ ] Support URL video input
2. [ ] Implement multi-track audio selection
3. [ ] Add burned-in subtitle export
4. [ ] Large file support via S3
5. [ ] Batch processing support

## Architecture

### State Management

```
AppState:
  VIDEO_UPLOADED
  AUDIO_EXTRACTED
  SUBTITLES_GENERATED
  EDITING
  EXPORTING
```

### Data Flow

```
Upload → VideoPlayer → AudioExtractor → PollyClient → SubtitleSegments → Export
                        ↓                                ↓
                   SessionStore ←→ SubtitleEditor → SRT Export
```

### Storage Keys

```javascript
STORAGE_KEYS = {
  SESSION: 'subtitle_wizard_session_v1',
  HISTORY: 'subtitle_wizard_history_v1',
  CREDENTIALS: 'subtitle_wizard_credentials_v1',
  CACHE_PREFIX: 'subtitle_wizard_cache_'
}
```

## AWS Polly Integration

### Required Permissions

```json
{
  "Effect": "Allow",
  "Action": [
    "polly:SynthesizeSpeech",
    "polly:DescribeVoices"
  ],
  "Resource": "*"
}
```

### Pricing

- US East (N. Virginia): $4.00 per million characters
- Other regions may have different pricing
- Cache reduces costs on re-processing

## Testing

### Manual Testing Checklist

- [ ] Upload video via file picker
- [ ] Upload video via drag-and-drop
- [ ] Validate unsupported file types
- [ ] Validate oversized files
- [ ] Enter and save AWS credentials
- [ ] Test credential validation
- [ ] Play/pause video
- [ ] Seek through video
- [ ] Adjust subtitle font size
- [ ] Export SRT file

## Troubleshooting

### Common Issues

**AWS SDK fails to load**
- Check internet connection
- Verify CDN access (unpkg.com)
- Disable ad blockers

**Credentials not saving**
- Check browser localStorage permission
- Clear cache and re-enter
- Try incognito mode

**Audio extraction fails**
- Refresh and retry
- Try different video format (MP4 recommended)
- Check browser console for errors

## License

MIT License - See `LICENSE` file for details.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

See `GAP-ANALYSIS.md` for currently needed features.
