// pages/api/start-stream.js
import streamFromMagnet from '@/lib/streamFromMagnet';

export default async function handler(req, res) {
  const { magnet } = req.query;
  if (!magnet) {
    return res.status(400).json({ error: 'Missing magnet link' });
  }

  try {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const baseURL = `${protocol}://${host}`;

    const { playlistUrl } = await streamFromMagnet(magnet, baseURL);
    res.status(200).json({ playlistUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
