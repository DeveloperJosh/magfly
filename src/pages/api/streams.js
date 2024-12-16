// pages/api/streams.js
export default function handler(req, res) {
    res.status(200).json(global.streamsList || []);
  }
  