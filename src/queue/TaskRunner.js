/**
 * Subtitle Wizard - Task Runner
 */

import { taskQueue } from './TaskQueue.js';
import { pollyClient } from '../aws/pollyClient.js';
import { subtitleManager } from '../subtitles/SubtitleManager.js';
import { pollySyncer } from '../subtitles/PollySyncer.js';
import { logger } from '../utils/logger.js';