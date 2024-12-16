// lib/streamFromMagnet.js
import WebTorrent from 'webtorrent';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { randomUUID } from 'crypto';

ffmpeg.setFfmpegPath(ffmpegPath);

const client = new WebTorrent();

/**
 * Download and convert the first suitable video file from a magnet link into HLS format.
 * @param {string} magnetURI
 * @param {string} baseURL The base URL (e.g. "https://yourdomain.com") for constructing return URLs
 * @returns {Promise<{playlistUrl: string}>}
 */
export default async function streamFromMagnet(magnetURI, baseURL) {
  const uniqueId = randomUUID(); // generate a unique directory for the HLS files
  const outputDir = path.join(process.cwd(), 'public', 'streamhls', uniqueId);
  fs.mkdirSync(outputDir, { recursive: true });

  return new Promise((resolve, reject) => {
    client.add(magnetURI, (torrent) => {
      // find a suitable video file
      const file = torrent.files.find((f) =>
        /\.(mp4|mkv|avi|mov)$/i.test(f.name)
      );

      if (!file) {
        return reject(new Error('No suitable video file found in the torrent.'));
      }

      const m3u8Path = path.join(outputDir, 'index.m3u8');

      const stream = file.createReadStream();

      ffmpeg(stream)
        .outputOptions([
          '-preset veryfast',
          '-profile:v baseline', // HLS compatibility
          '-level 3.0',
          '-start_number 0',
          '-hls_time 10',
          '-hls_list_size 0',
          '-f hls',
        ])
        .output(m3u8Path)
        .on('start', (commandLine) => {
          console.log('FFmpeg started with command:', commandLine);
        })
        .on('end', () => {
          console.log('HLS transcoding finished.');

          const playlistUrl = `${baseURL}/streamhls/${uniqueId}/index.m3u8`;
          resolve({ playlistUrl });
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(err);
        })
        .run();
    });
  });
}
