# Subtitle Wizard - Documentation Index

## Welcome to Subtitle Wizard

Subtitle Wizard is a browser-based video subtitle generator using AWS Polly. All processing happens client-side - your videos never leave your computer.

---

## Quick Links

| Document | Purpose |
|----------|---------|
| [SETUP.md](SETUP.md) | **Start here** - Quick 5-minute setup guide |
| [README.md](README.md) | Project overview and features |
| [docs/HELP.md](docs/HELP.md) | Usage instructions and troubleshooting |
| [ROADMAP.md](ROADMAP.md) | Current status and future plans |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | Technical architecture |
| [GAP-ANALYSIS.md](GAP-ANALYSIS.md) | Feature gaps and TODO list |

---

## Getting Started (3 minutes)

### 1. Open the Application
```
Clone/download this repository and open index.html in your browser
```

### 2. Setup AWS Credentials
- Sign into AWS Console > IAM
- Create user with AmazonPollyReadOnlyAccess
- Enter Access Key ID and Secret Access Key in the app

### 3. Upload & Process
1. Drag & drop a video (MP4, WebM, OGG, MOV, AVI)
2. Click "Extract Audio"
3. Click "Generate Subtitles"
4. Click "Export SRT"

---

## Current Status

**Version**: 1.0.0-alpha  
**Completion**: ~25%

### What's Working
- Video upload (drag-drop + file picker)
- Video player integration
- AWS credentials UI with encryption
- Polly client integration
- Session persistence with encryption
- Keyboard handlers (logic complete)
- SRT export functionality

### What's Next (Priority Order)
1. FFmpeg.wasm audio extraction
2. Polly API connection/testing
3. Subtitle editor UI
4. Keyboard shortcuts (event connections)
5. Error handling improvements

---

## Documentation Structure

### For Users
| File | When to Read |
|------|--------------|
| [SETUP.md](SETUP.md) | First time using the app |
| [docs/HELP.md](docs/HELP.md) | Using features, troubleshooting |
| [GAP-ANALYSIS.md](GAP-ANALYSIS.md) | Understanding current limitations |

### For Developers
| File | When to Read |
|------|--------------|
| [README.md](README.md) | Project overview |
| [ROADMAP.md](ROADMAP.md) | Current direction and priorities |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | Code structure and architecture |
| [data-flow.md](data-flow.md) | How data moves through the app |
| [MODULE-STRUCTURE.md](MODULE-STRUCTURE.md) | File organization |

### Technical Details
- [GLOSSARY.md](GLOSSARY.md) - Domain terminology
- [user-stories.md](user-stories.md) - Feature requirements
- [PROJECT-PLAN.md](PROJECT-PLAN.md) - Milestone planning

---

## Browser Requirements

| Browser | Version | Notes |
|---------|---------|-------|
| Chrome | 90+ | Full support |
| Firefox | 88+ | Full support |
| Safari | 14+ | Full support |
| Edge | 90+ | Full support |

---

## File Size Limits

- **Maximum**: 500MB per video
- **Recommended**: Under 100MB for best performance

---

## AWS Polly Pricing

| Region | Price per 1M characters |
|--------|------------------------|
| US East (N. Virginia) | $4.00 |
| US East (Ohio) | $4.40 |
| US West (Oregon) | $4.50 |
| EU (Ireland) | $4.80 |

**Examples:**
- 10-minute video: ~$0.01
- 1-hour video: ~$0.06

The app caches results to reduce costs on re-processing.

---

## Privacy & Security

- **Client-side processing**: Videos never leave your computer
- **Encrypted storage**: AWS credentials stored with AES-256-GCM
- **No telemetry**: No data collection or tracking
- **Local storage only**: Everything saved locally

---

## Quick Commands

```bash
# Open the app
open index.html

# Run a local server (optional)
python -m http.server 8080
# Then visit: http://localhost:8080
```

---

## Getting Help

1. Check [docs/HELP.md](docs/HELP.md) for common issues
2. Review [GAP-ANALYSIS.md](GAP-ANALYSIS.md) for feature status
3. See [SETUP.md](SETUP.md) for troubleshooting setup issues

---

## Contributing

Contributions welcome! See:
- [ROADMAP.md](ROADMAP.md) for current priorities
- [GAP-ANALYSIS.md](GAP-ANALYSIS.md) for TODO items

---

## License

[MIT License](LICENSE) - See LICENSE file for details.

---

**Happy Subtitling!** 🎬📝
