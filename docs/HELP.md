# Subtitle Wizard Help Guide

## Quick Start

1. **Upload Video**
   - Drag and drop a video file onto the upload area, or click "Choose File"
   - Supported formats: MP4, WebM, OGG, MOV, AVI
   - Maximum file size: 500MB

2. **Extract Audio**
   - Click "Extract Audio" to prepare the video for subtitle processing
   - The audio track will be extracted for Polly processing

3. **Configure AWS Credentials** (Required for subtitle generation)
   - Click AWS Credentials button
   - Enter your AWS Access Key ID and Secret Access Key
   - Credentials are stored encrypted in your browser

4. **Generate Subtitles**
   - Select your preferred language and voice
   - Click "Generate Subtitles"
   - Wait for Polly to process and create time-synced subtitles

5. **Edit Subtitles**
   - Review subtitles in the Preview tab
   - Switch to Edit tab for manual adjustments
   - Click on segment text to edit

6. **Export**
   - Click "Export SRT" to download subtitle file
   - Filename format: `{video-title}_subtitles.srt`

## Voice Selection

The available voices depend on your selected language:

**English (US):**
- Joanna (Female) - Default
- Kendra (Female)
- Brian (Male)
- Kimberly (Female)
- Ruth (Female)
- Russell (Male)
- Amy (Female)
- Emma (Female)
- Ivy (Female)
- Salli (Female)

**English (UK):**
- Amy (Female) - Default
- Brian (Male)
- Russell (Male)
- Emma (Female)

**Spanish (Spain):**
- Enric (Male) - Default
- Conchita (Female)
- Mia (Female)

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Play/Pause video |
| Left Arrow | Seek back 1 second |
| Right Arrow | Seek forward 1 second |
| Shift + Left/Right | Seek 10 seconds |
| Up Arrow | Increase subtitle font size |
| Down Arrow | Decrease subtitle font size |
| S | Toggle subtitles on/off |

## Troubleshooting

### Video won't load

**Check:**
- File format is supported (MP4, WebM, OGG, MOV, AVI)
- File size is under 500MB
- Browser console (F12) for error messages

**Solutions:**
- Try converting video to MP4 using HandBrake or FFmpeg
- Trim the video to reduce file size
- Try a different browser

### Audio extraction fails

**Check:**
- FFmpeg.wasm loaded successfully
- Video file is not corrupted

**Solutions:**
- Refresh the page and try again
- Try a different video file
- Check browser console for specific errors

### Subtitle generation fails

**Check:**
- AWS credentials are valid and correct
- AWS Polly quota (20 requests/second)
- Internet connection is stable

**Solutions:**
1. Test your credentials in the AWS Credentials modal
2. Check AWS Console for service limits
3. Try generating subtitles for a shorter clip first

### Credentials not saving

**Check:**
- Browser allows localStorage
- Encryption key was generated

**Solutions:**
- Clear browser cache and re-enter credentials
- Try incognito/private mode
- Check browser settings for localStorage permission

### Export fails

**Check:**
- Browser allows downloads
- No popup blocker is blocking downloads

**Solutions:**
- Allow downloads for this site
- Try a different browser
- Right-click "Export SRT" and select "Save link as"

---

## AWS Polly Pricing

Amazon Polly charges per million characters:

| Region | Price |
|--------|-------|
| US East (N. Virginia) | $4.00 per million |
| US East (Ohio) | $4.40 per million |
| US West (Oregon) | $4.50 per million |
| EU (Ireland) | $4.80 per million |

**Cost Examples:**
- 1 minute video (~150 words): ~$0.001
- 10 minute video (~1500 words): ~$0.01
- 1 hour video (~9000 words): ~$0.06

The app caches synthesis results to reduce costs on re-processing.

---

## Technical Details

### Client-Side Processing

- **FFmpeg.wasm**: Video/audio processing happens entirely in browser
- **AWS SDK**: Loaded from CDN (unpkg.com)
- **Web Audio API**: Audio analysis and playback
- **LocalStorage**: Encrypted session persistence

### Data Flow

```
Video Upload → Audio Extraction → Polly TTS → Subtitle Segments → Export
```

### Browser Storage

| Key | Purpose | Encrypted |
|-----|---------|-----------|
| `subtitle_wizard_session_v1` | Current session data | Yes |
| `subtitle_wizard_credentials_v1` | AWS credentials | Yes |
| `subtitle_wizard_encryption_key` | Encryption key | Yes |
| `subtitle_wizard_history_v1` | History of processed videos | No |

### Supported Browsers

| Browser | Minimum Version | Features |
|---------|-----------------|----------|
| Chrome | 90+ | Full support |
| Firefox | 88+ | Full support |
| Safari | 14+ | Full support |
| Edge | 90+ | Full support |

---

## FAQ

**Q: Are my videos sent to any server?**
A: No. All processing happens in your browser. Your videos never leave your computer.

**Q: How long are sessions stored?**
A: Sessions are stored in your browser's localStorage until you clear them or change browsers.

**Q: Can I use this offline?**
A: No. The app requires internet access to load the AWS SDK and connect to AWS Polly.

**Q: What happens if I close the browser?**
A: Your session is automatically saved every 2 minutes. Refreshing the page will restore your work.

**Q: Can I share my projects?**
A: Currently, projects are stored locally. Plan to add export/import functionality.

**Q: Is there a file size limit?**
A: 500MB per file. Large files may require S3 upload in future versions.

---

## Keyboard Reference

```
[Space]    Play/Pause
[←]        Seek back 1 second
[→]        Seek forward 1 second
[↑]        Increase subtitle font size
[↓]        Decrease subtitle font size
[S]        Toggle subtitles
```

---

## Shortcuts Reference

| Action | Shortcut |
|--------|----------|
| Play/Pause | Space |
| Seek -1s | Left Arrow |
| Seek +1s | Right Arrow |
| Seek -10s | Shift + Left |
| Seek +10s | Shift + Right |
| Font + | Up Arrow |
| Font - | Down Arrow |
| Toggle Subtitles | S |
