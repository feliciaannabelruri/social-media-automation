const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

class MediaProcessor {
  async processImage(inputPath, outputPath, options = {}) {
    const {
      width = 1080,
      height = 1080,
      quality = 90
    } = options;

    try {
      await sharp(inputPath)
        .resize(width, height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality })
        .toFile(outputPath);
      
      return outputPath;
    } catch (error) {
      throw new Error(`Image processing failed: ${error.message}`);
    }
  }

  async processVideo(inputPath, outputPath, options = {}) {
    const {
      width = 1080,
      height = 1920, // TikTok format
      fps = 30,
      bitrate = '2000k'
    } = options;

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .size(`${width}x${height}`)
        .fps(fps)
        .videoBitrate(bitrate)
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(err))
        .run();
    });
  }

  async addWatermark(inputPath, watermarkPath, outputPath) {
    try {
      await sharp(inputPath)
        .composite([{
          input: watermarkPath,
          gravity: 'southeast'
        }])
        .toFile(outputPath);
      
      return outputPath;
    } catch (error) {
      throw new Error(`Watermark failed: ${error.message}`);
    }
  }

  getMediaType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const videoExts = ['.mp4', '.mov', '.avi', '.mkv'];

    if (imageExts.includes(ext)) return 'image';
    if (videoExts.includes(ext)) return 'video';
    return 'unknown';
  }
}

module.exports = new MediaProcessor();