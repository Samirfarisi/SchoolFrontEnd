import React from 'react';

/**
 * Custom video player component that uses the native HTML5 video player
 * without relying on react-player which is causing import issues
 */
const VideoPlayer = ({ url, width = '100%', height = '100%', controls = true, playing = false }) => {
  // Determine what kind of video source we're dealing with
  const isYouTube = url && (
    url.includes('youtube.com') || 
    url.includes('youtu.be') || 
    url.includes('youtube-nocookie.com')
  );
  
  const isVimeo = url && url.includes('vimeo.com');

  // Render an iframe for YouTube or Vimeo videos
  if (isYouTube || isVimeo) {
    let embedUrl = url;
    
    // Convert YouTube URLs to embed format
    if (isYouTube) {
      // Extract video ID from various YouTube URL formats
      let videoId = '';
      if (url.includes('v=')) {
        videoId = url.split('v=')[1];
        const ampersandPosition = videoId.indexOf('&');
        if (ampersandPosition !== -1) {
          videoId = videoId.substring(0, ampersandPosition);
        }
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1];
      } else if (url.includes('embed/')) {
        videoId = url.split('embed/')[1];
      }
      
      // Form the embed URL
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${playing ? 1 : 0}&controls=${controls ? 1 : 0}`;
      }
    }
    
    // Convert Vimeo URLs to embed format
    if (isVimeo) {
      // Extract video ID from various Vimeo URL formats
      const vimeoRegex = /vimeo\.com\/(?:video\/|event\/|channels\/[^/]+\/|groups\/[^/]+\/videos\/|album\/\d+\/video\/|)(\d+)(?:$|\/|\?)/;
      const match = url.match(vimeoRegex);
      
      if (match && match[1]) {
        const videoId = match[1];
        embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=${playing ? 1 : 0}&controls=${controls ? 1 : 0}`;
      }
    }
    
    return (
      <div className="video-player-iframe" style={{ width, height, position: 'relative' }}>
        <iframe
          src={embedUrl}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Video Player"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    );
  }
  
  // For direct video files, use the HTML5 video tag
  return (
    <div className="video-player-native" style={{ width, height, position: 'relative' }}>
      <video 
        src={url} 
        controls={controls} 
        autoPlay={playing} 
        style={{ width: '100%', height: '100%' }}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
