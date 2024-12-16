// pages/index.js
import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Hls from 'hls.js';

export default function HomePage() {
  const [magnet, setMagnet] = useState('');
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [error, setError] = useState('');
  const videoRef = useRef(null);

  const handleStart = async () => {
    setError('');
    setPlaylistUrl('');

    try {
      const res = await fetch(`/api/start-stream?magnet=${encodeURIComponent(magnet)}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to start stream');
      }
      const data = await res.json();
      if (data.playlistUrl) {
        setPlaylistUrl(data.playlistUrl);
      } else {
        throw new Error('No playlistUrl received');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  useEffect(() => {
    if (playlistUrl && videoRef.current) {
      if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS
        videoRef.current.src = playlistUrl;
        videoRef.current.play().catch(console.error);
      } else if (Hls.isSupported()) {
        // hls.js for other browsers
        const hls = new Hls();
        hls.loadSource(playlistUrl);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current.play().catch(console.error);
        });
      } else {
        setError('HLS not supported by this browser');
      }
    }
  }, [playlistUrl]);

  return (
    <div style={{ padding: '1rem' }}>
      <Head>
        <title>Torrent to HLS Stream</title>
      </Head>

      <h1>Torrent to HLS Stream</h1>
      <p>Enter a magnet link to start streaming:</p>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Enter magnet link..."
          style={{ width: '100%', padding: '0.5rem' }}
          value={magnet}
          onChange={(e) => setMagnet(e.target.value)}
        />
      </div>

      <button onClick={handleStart}>Start Stream</button>

      {error && (
        <div style={{ marginTop: '1rem', color: 'red' }}>
          Error: {error}
        </div>
      )}

      {playlistUrl && !error && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Video Player</h2>
          <video
            ref={videoRef}
            controls
            style={{ width: '100%', maxWidth: '800px', background: '#000' }}
          />
          <p><small>Now playing from {playlistUrl}</small></p>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <a href="/streams">View All Streams</a>
      </div>
    </div>
  );
}
