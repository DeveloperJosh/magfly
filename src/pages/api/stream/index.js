// pages/api/stream/index.js
import fs from 'fs';
import { getCurrentStreamInfo } from '../start-stream';

export default function handler(req, res) {
  const info = getCurrentStreamInfo();
  if (!info) {
    return res.status(404).send('No active stream.');
  }

  const { m3u8Path } = info;
  fs.readFile(m3u8Path, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send(err.message);
    }

    const updatedPlaylist = data.replace(/(\S+\.ts)/g, (match) => {
      return `${req.url}/${match}`;
    });

    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.status(200).send(updatedPlaylist);
  });
}
