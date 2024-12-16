// lib/streamFromMagnet.js
import WebTorrent from 'webtorrent';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

ffmpeg.setFfmpegPath(ffmpegPath);
const client = new WebTorrent();

export default async function streamFromMagnet(magnetURI, baseURL) {
  const uniqueId = randomUUID();
  const outputDir = path.join(process.cwd(), 'public', 'streamhls', uniqueId);
  fs.mkdirSync(outputDir, { recursive: true });

  return new Promise((resolve, reject) => {
    client.add(magnetURI, (torrent) => {
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
          '-profile:v baseline',
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
          resolve({ playlistUrl, uniqueId });
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(err);
        })
        .run();
    });
  });
}
