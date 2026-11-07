# Subtitle Wizard - Quick Start Setup

## Overview

Subtitle Wizard is a browser-based application for automatically generating subtitles for videos using AWS Polly text-to-speech service. All processing happens client-side in your browser - your videos never leave your computer.

## Quick Start (5 minutes)

### Step 1: Open the Application

**Important**: Due to browser CORS security, you cannot open `index.html` directly from your filesystem. You must use a local web server.

1. Open a terminal in the project directory
2. Start a local server (choose one of these):

```bash
# Option A: Python 3
python3 -m http.server 8080

# Option B: Python 2
python -m SimpleHTTPServer 8080

# Option C: Node.js (with http-server package)
npx http-server -p 8080

# Option D: PHP
php -S localhost:8080
```

3. Open your browser and visit: `http://localhost:8080`

**No installation required!** The app runs entirely in your browser.

> **Note**: When using a local server, the app loads ES6 modules properly and works without CORS errors.

### Step 2: Prepare AWS Credentials

To generate subtitles, you'll need AWS Polly credentials:

1. Sign in to the [AWS Management Console](https://aws.amazon.com/console/)
2. Navigate to **IAM** (Identity and Access Management)
3. Create a new user or use an existing one
4. Attach the **AmazonPollyReadOnlyAccess** policy to the user
5. Copy the **Access Key ID** and **Secret Access Key**

> **Important:** For security, use IAM user credentials - never use root account credentials.

### Step 3: Configure Credentials in the App

1. Click the "AWS Credentials" button in the app
2. Enter your:
   - **Access Key ID** (starts with AKIA...)
   - **Secret Access Key**
   - **AWS Region** (default: US East - N. Virginia)
3. Click "Save & Test" to verify

Your credentials are encrypted and stored in your browser's local storage.

### Step 4: Upload Your Video

1. Drag and drop a video file, or click "Choose File"
2. Supported formats: MP4, WebM, OGG, MOV, AVI
3. Maximum file size: 500MB

### Step 5: Generate Subtitles

1. Click "Extract Audio" to prepare the video
2. Select your language and voice
3. Click "Generate Subtitles"
4. Wait for processing to complete

### Step 6: Export Your Subtitles

1. Click "Export SRT" to download the subtitle file
2. The file will be named `{video-name}_subtitles.srt`

---

## Advanced Setup

### Configuring AWS Permissions

Minimal IAM policy for Subtitle Wizard:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "polly:SynthesizeSpeech",
        "polly:DescribeVoices"
      ],
      "Resource": "*"
    }
  ]
}
```

### Budget Alerts

To avoid unexpected charges:

1. Navigate to **AWS Budgets** in the console
2. Create a new budget for Polly usage
3. Set alerts at 50%, 80%, and 100% of your expected usage

---

## Troubleshooting

### "Failed to initialize Polly client"

**Cause:** AWS SDK failed to load

**Solutions:**
- Check your internet connection
- Try a different browser
- Disable ad blockers that might block AWS SDK

### "Credentials test failed"

**Cause:** Invalid or expired AWS credentials

**Solutions:**
- Double-check your Access Key ID and Secret Key
- Ensure your AWS region is correct
- Verify your IAM user has_POLly permissions
- Check if your keys have expired

### "Audio extraction failed"

**Cause:** FFmpeg.wasm initialization issue

**Solutions:**
- Refresh the page
- Try a different video file
- Check browser console for errors

### "Failed to load video"

**Cause:** Unsupported video format or corrupted file

**Solutions:**
- Convert video to MP4 using a tool like HandBrake
- Ensure file size is under 500MB
- Try a different video

---

## Browser Requirements

| Browser | Version | Notes |
|---------|---------|-------|
| Chrome | 90+ | Full support |
| Firefox | 88+ | Full support |
| Safari | 14+ | Full support |
| Edge | 90+ | Full support |

## File Format Support

**Container Formats:**
- MP4 (recommended)
- WebM
- OGG
- MOV
- AVI
- MPEG

**Audio Formats (extracted):**
- MP3
- WAV
- AAC

---

## Privacy & Security

- **Client-side only:** Videos and audio are processed entirely in your browser
- **AWS SDK:** The AWS SDK is loaded from a CDN (unpkg.com)
- **Credential storage:** Encrypted with browser-level encryption
- **No server:** No data is sent to any server except AWS Polly

---

## Cost Estimation

Amazon Polly pricing (as of 2024):

| Region | Price per 1M characters |
|--------|------------------------|
| US East (N. Virginia) | $4.00 |
| US East (Ohio) | $4.40 |
| US West (Oregon) | $4.50 |
| EU (Ireland) | $4.80 |

**Examples:**
- 10-minute video (~1500 words): ~$0.10
- 1-hour video (~9000 words): ~$0.60

The app caches results to reduce costs on re-processing.

---

## Getting Help

- Check the [Help](HELP.md) documentation in the app
- Review the [GAP-ANALYSIS.md](GAP-ANALYSIS.md) for current limitations
- See [IMPLEMENTATION.md](IMPLEMENTATION.md) for development status
