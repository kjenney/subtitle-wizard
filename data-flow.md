# Subtitle Processor - Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              User Browser (Client)                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │   UploadUI   │  │  VideoPlayer │  │ SubtitleEditor│ │ SubtitleOverlay │    │
│  └───────┬──────┘  └───────┬──────┘  └───────┬──────┘  └────────┬─────────┘    │
│          │                  │                  │                  │              │
│          └──────────────────┼──────────────────┼──────────────────┘              │
│                             │                  │                                  │
│                    ┌────────▼────────┐  ┌─────▼──────┐                            │
│                    │SessionStore     │  │HistoryStore│                            │
│                    │(LocalStorage)   │  │            │                            │
│                    └────────┬────────┘  └────────────┘                            │
│                             │                                                     │
│                    ┌────────▼────────┐                                            │
│                    │  SubtitleManager│                                            │
│                    │  - Segments     │                                            │
│                    │  - Timing       │                                            │
│                    │  - Confidence   │                                            │
│                    └────────┬────────┘                                            │
│                             │                                                     │
│        ┌────────────────────┼────────────────────┐                                │
│        │                    │                    │                                │
│   ┌────▼────┐           ┌───▼───┐          ┌────▼────┐                            │
│   │  FFmpeg │           │ Polly │          │  Audio  │                            │
│   │ .wasm    │           │Client │          │ Player  │                            │
│   └────┬────┘           └───────┘          └─────────┘                            │
│        │                                                    │                      │
│        │ Video In/Out                                       │ Audio Data           │
│        ▼                                                    ▼                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐ │
│  │                           Browser Storage/File System                        │ │
│  │  - Input Video (memory)                                                      │ │
│  │  - Extracted Audio (memory/temp)                                             │ │
│  │  - Processed Subtitles (localStorage)                                        │ │
│  │  - Exported Files (download)                                                 │ │
│  └──────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS (AWS API)
                                    ▼
                            ┌─────────────────┐
                            │   AWS Polly     │
                            │  - Synthesize   │
                            │  - DescribeVoice│
                            └─────────────────┘

```

---

## Data Flow Sequence

### 1. Upload & Extract
```
User Upload → UploadUI → FFmpegController → AudioExtractor → Audio Track
                                                    ↓
                                            Web Audio API
```

### 2. Polly Processing
```
SubtitleManager → PollyClient → Polly API → MP3 Response → Speech-to-Text
                                                    ↓
                                            Subtitle Segments (with timing)
```

### 3. Subtitle Editing
```
User Edits → SubtitleEditor → SubtitleManager → SessionStore
                                                    ↓
                                            LocalStorage (encrypted)
```

### 4. Export
```
Export Request → SubtitleManager → SRTParser → SRT File → Download
                              ↓
                         VideoPlayer → FFmpegController → Burned-in Video
```

---

## State Management

```javascript
// Session State Structure
{
  id: string,                    // Unique session ID
  video: {
    name: string,
    size: number,
    type: string,
    metadata: object             // Preserved metadata
  },
  audioTrack: {
    id: number,
    language: string,
    sampleRate: number
  },
  segments: [
    {
      id: string,
      start: number,             // Seconds
      end: number,               // Seconds
      text: string,
      confidence: number,        // 0.0 - 1.0
      voice: string,             // Polly voice ID
      timestamp: number          // Created/modified
    }
  ],
  settings: {
    language: 'en-US' | 'es-ES',
    voice: string,               // Polly voice name
    rate: number,                // 0.5 - 2.0
    color: string,               // Subtitle color
    fontSize: number
  },
  cache: {
    polly: {                     // Polly responses (audio files)
      [textHash]: {
        mp3: string,            // Base64 MP3 data
        timestamps: number[]    // Word timings
      }
    }
  },
  history: [                     // Last 5 sessions
    { id, videoName, timestamp }
  ]
}
```
