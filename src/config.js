/**
 * Subtitle Wizard - Configuration and Constants
 */

// Application constants
export const VERSION = '1.0.0';
export const APP_NAME = 'Subtitle Wizard';

// Video format support
export const SUPPORTED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/avi',
  'video/mpeg',
  'video/mov'
];

export const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

// FFmpeg.wasm configuration
export const FFMPEG_WASM_URL = 'https://unpkg.com/@ffmpeg/wasm@0.12.2/dist/esm/ffmpeg.js';
export const FFMPEG_CORE_URL = 'https://unpkg.com/@ffmpeg/wasm@0.12.2/dist/esm/core.js';

// Audio format configuration
export const AUDIO_FORMATS = {
  MP3: { mime: 'audio/mp3', extension: 'mp3', codec: 'libmp3lame' },
  WAV: { mime: 'audio/wav', extension: 'wav', codec: 'pcm_s16le' },
  AAC: { mime: 'audio/aac', extension: 'aac', codec: 'aac' }
};

// Default audio format for extraction
export const DEFAULT_AUDIO_FORMAT = AUDIO_FORMATS.MP3;

// AWS Polly configuration
export const AWS_POLLY = {
  region: 'us-east-1',
  sampleRate: 16000,
  outputFormat: 'json',
  supportedLanguages: {
    'en-US': {
      name: 'English (US)',
      defaultVoice: 'Joanna',
      voices: ['Joanna', 'Kendra', ' Kimberly', 'Ruth', 'Brian', 'Russell', 'Amy', 'Emma', 'Ivy', 'Salli']
    },
    'es-ES': {
      name: 'Spanish (Spain)',
      defaultVoice: 'Enric',
      voices: ['Enric', 'Conchita', 'Mia']
    },
    'en-GB': {
      name: 'English (UK)',
      defaultVoice: 'Amy',
      voices: ['Amy', 'Russell', 'Emma', 'Brian']
    }
  }
};

// Subtitle configuration
export const SUBTITLE = {
  defaultColor: '#FFFFFF',
  defaultFontSize: 16,
  minFontSize: 10,
  maxFontSize: 48,
  confidenceThreshold: 0.7,
  silenceDetection: {
    silenceThreshold: -50, // dB
    minSilenceDuration: 0.3, // seconds
    minSegmentDuration: 1.0 // seconds
  }
};

// Session persistence keys
export const STORAGE_KEYS = {
  SESSION: 'subtitle_wizard_session_v1',
  HISTORY: 'subtitle_wizard_history_v1',
  CREDENTIALS: 'subtitle_wizard_credentials_v1',
  CACHE_PREFIX: 'subtitle_wizard_cache_'
};

// Auto-save settings
export const AUTO_SAVE_INTERVAL = 2 * 60 * 1000; // 2 minutes

// Default settings
export const DEFAULT_SETTINGS = {
  language: 'en-US',
  voice: 'Joanna',
  rate: 1.0,
  fontSize: SUBTITLE.defaultFontSize,
  showWaveform: true,
  autoScroll: true
};

// Queue configuration
export const QUEUE = {
  maxRetries: 3,
  retryDelay: 1000, // ms
  pollyRateLimit: 20 // requests per second
};

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  PLAY_PAUSE: ' ',
  SEEK_FORWARD: 'ArrowRight',
  SEEK_BACKWARD: 'ArrowLeft',
  SEEK_FORWARD_10: 'Shift+ArrowRight',
  SEEK_BACKWARD_10: 'Shift+ArrowLeft',
  TOGGLE_SUBTITLES: 's',
  INCREASE_FONT: 'ArrowUp',
  DECREASE_FONT: 'ArrowDown'
};
