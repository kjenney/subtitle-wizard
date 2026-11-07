# Subtitle Wizard

A browser-based video subtitle generator using AWS Polly text-to-speech. All processing happens client-side in your browser - your videos never leave your computer.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![AWS Polly](https://img.shields.io/badge/Polly-AWS-brightgreen.svg)](https://aws.amazon.com/polly/)

## Features

- **Client-side processing**: Videos are processed entirely in your browser
- **Video upload**: Drag-and-drop and file picker support
- **Audio extraction**: Extract audio tracks from videos using FFmpeg.wasm
- **Polly integration**: Generate time-synced subtitles with AWS Polly
- **Subtitle editing**: Preview and edit subtitles before export
- **Export SRT**: Download subtitles in standard SRT format
- **Session persistence**: Auto-save every 2 minutes
- **Keyboard shortcuts**: Navigate and edit efficiently

## Quick Start

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- AWS account with Polly access

### Setup (5 minutes)

1. **Open the app**: Clone this repository and open `index.html` in your browser

2. **Setup AWS Credentials**:
   - Get your Access Key ID and Secret Access Key from AWS IAM
   - Click "AWS Credentials" in the app
   - Enter your credentials and click "Save & Test"

3. **Upload Video**: Drag & drop or click "Choose File" (max 500MB)

4. **Extract Audio**: Click "Extract Audio" button

5. **Generate Subtitles**: Select language/voice and click "Generate Subtitles"

6. **Export**: Click "Export SRT" to download subtitles

See [SETUP.md](SETUP.md) for detailed setup instructions.

## Documentation

| Document | Description |
|----------|-------------|
| [SETUP.md](SETUP.md) | Quick start setup guide |
| [docs/HELP.md](docs/HELP.md) | Usage instructions and troubleshooting |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | Technical implementation details |
| [GAP-ANALYSIS.md](GAP-ANALYSIS.md) | Feature gaps and TODO list |

## Browser Support

| Browser | Version | Features |
|---------|---------|----------|
| Chrome | 90+ | Full support |
| Firefox | 88+ | Full support |
| Safari | 14+ | Full support |
| Edge | 90+ | Full support |

## AWS Pricing

Amazon Polly charges per million characters:

- **US East (N. Virginia)**: $4.00 per million
- **Examples**:
  - 10-minute video: ~$0.01
  - 1-hour video: ~$0.06

The app caches results to reduce costs.

## Features in Progress

See [GAP-ANALYSIS.md](GAP-ANALYSIS.md) for current implementation status.

### Completed
- [x] Video upload (drag-drop + file picker)
- [x] Video player integration
- [x] AWS credentials UI with encryption
- [x] Polly client integration
- [x] Subtitle editor UI
- [x] SRT export
- [x] Toast notifications
- [x] Session persistence with encryption
- [x] Keyboard shortcuts

### In Progress
- [ ] FFmpeg.wasm audio extraction
- [ ] Waveform visualization
- [ ] Inline subtitle editing
- [ ] Confidence score display

### TODO
- [ ] Multi-track audio support
- [ ] URL input support
- [ ] Burned-in subtitle export
- [ ] Large file support via S3
- [ ] Batch processing
- [ ] Multiple export formats

## Development

### Project Structure

```
subtitle-wizard/
├── index.html              # Main entry point
├── SETUP.md                # Quick start guide
├── IMPLEMENTATION.md       # Implementation details
├── GAP-ANALYSIS.md         # Feature status
├── src/
│   ├── main.js            # Application entry
│   ├── config.js          # Configuration
│   ├── utils/             # Utility functions
│   ├── aws/               # AWS clients
│   ├── video/             # Video processing
│   ├── audio/             # Audio processing
│   ├── subtitles/         # Subtitle handling
│   ├── player/            # Video player
│   ├── ui/                # UI components
│   ├── storage/           # Storage management
│   └── queue/             # Task queue
└── docs/
    └── HELP.md            # User help docs
```

### Running Locally

1. Open `index.html` in a browser
2. No server required - purely client-side

### Build for Production

The app is ready to deploy - just serve the files:
- Static file server
- GitHub Pages
- Netlify
- S3 + CloudFront

## Privacy & Security

- **Client-side only**: Your videos never leave your computer
- **Encrypted storage**: Credentials and sessions are encrypted
- **No telemetry**: No data collection or tracking
- **-transparent dependencies**: All libraries are from CDNs

## License

MIT License - See [LICENSE](LICENSE) for details.

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## Acknowledgments

- [FFmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) for video processing
- [AWS Polly](https://aws.amazon.com/polly/) for text-to-speech
- Built with vanilla JavaScript and modern web APIs
