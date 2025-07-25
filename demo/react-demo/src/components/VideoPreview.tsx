import React, { useRef, useEffect, useState } from 'react';
import { v2 } from 'gabber-client-react';

function VideoPreview() {
  const { publisherNode } = v2.useAppEngine();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVideoStream, setHasVideoStream] = useState(false);
  const [videoStatus, setVideoStatus] = useState('No video stream active');

  // Get video pad from publisher node
  const videoPad = publisherNode?.getSourcePad('video_source') || null;

  useEffect(() => {
    if (!videoPad || !videoRef.current) return;

    const handleStreamReceived = (stream: MediaStream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasVideoStream(true);
        setVideoStatus('Video stream active');
        console.log('📹 Video stream connected to preview');
      }
    };

    const handleConnectionChanged = (connected: boolean) => {
      if (!connected && videoRef.current) {
        videoRef.current.srcObject = null;
        setHasVideoStream(false);
        setVideoStatus('Video stream disconnected');
      }
    };

    // Listen for video stream events
    videoPad.on('stream-received', handleStreamReceived);
    videoPad.on('connection-changed', handleConnectionChanged);

    // Check if there's already a stream
    const currentStream = videoPad.getCurrentStream();
    if (currentStream && videoRef.current) {
      videoRef.current.srcObject = currentStream;
      setHasVideoStream(true);
      setVideoStatus('Video stream active');
    }

    return () => {
      videoPad.off('stream-received', handleStreamReceived);
      videoPad.off('connection-changed', handleConnectionChanged);
    };
  }, [videoPad]);

  return (
    <div className="section">
      <h3>📹 Video Preview</h3>
      <div style={{ marginBottom: '15px' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '320px',
            height: '240px',
            background: '#000',
            borderRadius: '8px',
            display: hasVideoStream ? 'block' : 'none'
          }}
        />
        <p style={{ margin: '10px 0', color: '#666', fontSize: '14px' }}>
          {videoStatus}
        </p>
        {!hasVideoStream && (
          <div
            style={{
              width: '320px',
              height: '240px',
              background: '#f0f0f0',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666',
              fontSize: '14px'
            }}
          >
            📹 No video preview available
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoPreview;