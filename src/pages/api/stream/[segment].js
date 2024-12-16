// pages/api/stream/[segment].js
import fs from 'fs';
import path from 'path';
import { getCurrentStreamInfo } from '../start-stream';

export default function handler(req, res) {
  const info = getCurrentStreamInfo();
  if (!info) {
    return res.status(404).send('No active stream.');
  }

  const { segmentsDir } = info;
  const { segment } = req.query;
  const segmentPath = path.join(segmentsDir, segment);

  fs.stat(segmentPath, (err, stats) => {
    if (err || !stats.isFile()) {
      return res.status(404).send('Segment not found');
    }

    res.setHeader('Content-Type', 'video/mp2t');
    fs.createReadStream(segmentPath).pipe(res);
  });
}
