/**
 * Subtitle Wizard - Metadata preservation
 */

/**
 * Metadata handler for video files
 */
export class Metadata {
  constructor() {
    this.videoMetadata = null;
    this.extractedMetadata = {};
  }

  /**
   * Extract metadata from video file
   */
  async extractMetadata(videoFile) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(videoFile);
      const video = document.createElement('video');

      video.preload = 'metadata';
      video.src = url;

      video.addEventListener('loadedmetadata', () => {
        this.videoMetadata = {
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
          aspectRatio: video.videoWidth / video.videoHeight,
          name: videoFile.name,
          size: videoFile.size,
          type: videoFile.type
        };

        this.extractedMetadata = {
          ...this.videoMetadata,
          createdAt: Date.now(),
          fileName: videoFile.name,
          originalType: videoFile.type
        };

        resolve(this.extractedMetadata);

        // Cleanup
        URL.revokeObjectURL(url);
      });

      video.addEventListener('error', () => {
        // Return basic metadata if detailed parsing fails
        this.extractedMetadata = {
          duration: null,
          width: null,
          height: null,
          aspectRatio: null,
          name: videoFile.name,
          size: videoFile.size,
          type: videoFile.type,
          createdAt: Date.now(),
          originalType: videoFile.type
        };
        resolve(this.extractedMetadata);
      });
    });
  }

  /**
   * Get extracted metadata
   */
  getMetadata() {
    return this.extractedMetadata;
  }

  /**
   * Get video dimensions
   */
  getDimensions() {
    if (!this.extractedMetadata) return null;
    return {
      width: this.extractedMetadata.width,
      height: this.extractedMetadata.height,
      aspectRatio: this.extractedMetadata.aspectRatio
    };
  }

  /**
   * Get video duration in seconds
   */
  getDuration() {
    return this.extractedMetadata?.duration || 0;
  }

  /**
   * Check if metadata is available
   */
  hasMetadata() {
    return this.extractedMetadata !== null && this.extractedMetadata !== undefined;
  }

  /**
   * Reset metadata
   */
  reset() {
    this.videoMetadata = null;
    this.extractedMetadata = {};
  }
}

// Export singleton
export const metadataHandler = new Metadata();
