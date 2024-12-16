// pages/streams.js
import React, { useEffect, useState } from 'react';
import Head from 'next/head';

export default function StreamsPage() {
  const [streams, setStreams] = useState([]);

  useEffect(() => {
    fetch('/api/streams')
      .then((res) => res.json())
      .then((data) => {
        setStreams(data);
      })
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <Head>
        <title>All Streams</title>
      </Head>
      <h1>All Streams</h1>
      {streams.length === 0 ? (
        <p>No streams found. Go back and add one!</p>
      ) : (
        <table border="1" cellPadding="8" style={{borderCollapse: 'collapse', width: '100%', maxWidth: '800px'}}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Magnet</th>
              <th>Playlist URL</th>
            </tr>
          </thead>
          <tbody>
            {streams.map((stream) => (
              <tr key={stream.id}>
                <td>{stream.id}</td>
                <td style={{maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={stream.magnet}>{stream.magnet}</td>
                <td><a href={stream.playlistUrl} target="_blank" rel="noopener noreferrer">Open Playlist</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
