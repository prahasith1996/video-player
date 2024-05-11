import React, { useRef, useState, useEffect, useMemo } from "react";
import "./VideoPlayer.css";

function VideoPlayer() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [playButton, setPlayButton] = useState({ bottom: "0%", left: "" });
  const [showForward, setShowForward] = useState(false);
  const [showRewind, setShowRewind] = useState(false);
  const [showPlay, setShowPlay] = useState(false);
  const [showPause, setShowPause] = useState(false);

  const timestamps = useMemo(() => {
    return [
      {
        time: 10,
        location: {
          top: "50%",
          left: "70%",
          color: "Green",
          //   fontSize: "3em",
          //   border: "5px solid Green",
          //   borderRadius: "50%",
        },
      }, // 10 seconds
      {
        time: 20,
        location: {
          top: "30%",
          left: "30%",
          color: "Red",
          //   fontSize: "3em",
          //   border: "5px solid white",
          //   borderRadius: "50%",
        },
      }, // 20 seconds
      {
        time: 30,
        location: { bottom: "0%", left: "" },
      }, // 30 seconds
      // Add more as needed
    ];
  }, []);

  const [lastPausedTimestamp, setLastPausedTimestamp] = useState(null);

  useEffect(() => {
    const updateTimeStamp = setInterval(() => {
      if (!videoRef.current) return;

      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;

      setCurrentTime(currentTime);
      setProgress((currentTime / duration) * 100);
    }, 500);

    return () => clearInterval(updateTimeStamp);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const checkTime = () => {
      const currentTime = video.currentTime;

      if (!isPlaying) return;
      const matchingTimestamp = timestamps.find(
        (ts) =>
          Math.abs(ts.time - currentTime) <= 0.5 &&
          currentTime - lastPausedTimestamp > 1
      );

      if (matchingTimestamp) {
        setLastPausedTimestamp(currentTime);
        videoRef.current.pause();
        setShowPause(true);
        const totalDuration = 0.5 * 1000;
        setTimeout(() => {
          setShowPause(false); // Reset animation state for potential future animations
        }, totalDuration);
        setIsPlaying(false);
        setShowControls(false);
        setPlayButton({ ...matchingTimestamp.location });
      }
    };

    video.addEventListener("timeupdate", checkTime);
    return () => video.removeEventListener("timeupdate", checkTime);
  }, [isPlaying, timestamps, lastPausedTimestamp]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      const videoElement = videoRef.current;

      if (isPlaying) {
        videoElement.pause();
        setShowPause(true);
        const totalDuration = 0.5 * 1000;
        setTimeout(() => {
          setShowPause(false); // Reset animation state for potential future animations
        }, totalDuration);
        setIsPlaying(false);
      } else {
        // Check if the video is ready to play
        if (videoElement.readyState >= 3) {
          videoElement
            .play()
            .then(() => {
              setShowPlay(true);
              const totalDuration = 0.5 * 1000;
              setTimeout(() => {
                setShowPlay(false); // Reset animation state for potential future animations
              }, totalDuration);
              setPlayButton({ bottom: "0%", left: "" });
              setShowControls(true);
              setIsPlaying(true);
            })
            .catch((error) => {
              // Handle the error for failed playback
              console.error("Error trying to play the video:", error);
            });
        }
      }
    }
  };

  const handleRewind = () => {
    if (videoRef.current) {
      setShowRewind(true);
      const totalDuration = 0.5 * 1000;
      setTimeout(() => {
        setShowRewind(false); // Reset animation state for potential future animations
      }, totalDuration);
      videoRef.current.currentTime -= 10; // Rewind 10 seconds
      setLastPausedTimestamp(null);
    }
  };

  const handleFastForward = () => {
    if (videoRef.current) {
      setShowForward(true);
      const totalDuration = 0.5 * 1000;
      setTimeout(() => {
        setShowForward(false); // Reset animation state for potential future animations
      }, totalDuration);
      videoRef.current.currentTime += 10; // Fast forward 10 seconds
      setLastPausedTimestamp(null);
    }
  };

  const formatTime = (seconds) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes().toString().padStart(2, "0");
    const ss = date.getUTCSeconds().toString().padStart(2, "0");
    if (hh) {
      return `${hh}:${mm}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  const handleProgressChange = (e) => {
    const newTime = videoRef.current.duration * (e.target.value / 100);
    videoRef.current.currentTime = newTime;
    setLastPausedTimestamp(null);
    setProgress(e.target.value);
  };

  const calculateProgressBackground = (value, max) => {
    // Calculate percentage of progress
    const percentage = (value / max) * 100;
    // Return a background style with gradient effect
    return `linear-gradient(to right, red ${percentage}%, lightgrey ${percentage}%, lightgrey 100%)`;
  };

  return (
    <div className="video-player">
      {!isPlaying && <div className="pause-overlay"></div>}
      <video ref={videoRef} className="video-element">
        <source src="/videos/Acid Rain.mp4" type="video/webm" />
        Your browser does not support the video tag.
      </video>
      {showForward && (
        <div className="moving-arrows forward-arrows">
          <span className="arrow" style={{ animationDelay: "0s" }}>
            ›
          </span>
          <span className="arrow" style={{ animationDelay: "0.2s" }}>
            ›
          </span>
          <span className="arrow" style={{ animationDelay: "0.4s" }}>
            ›
          </span>
        </div>
      )}
      {showRewind && (
        <div className="moving-arrows rewind-arrows">
          <span className="arrow" style={{ animationDelay: "0.4s" }}>
            ‹
          </span>
          <span className="arrow" style={{ animationDelay: "0.2s" }}>
            ‹
          </span>
          <span className="arrow" style={{ animationDelay: "0s" }}>
            ‹
          </span>
        </div>
      )}
      {showPlay && false && <div className="icon-play-pause icon-play">▶</div>}
      {showPause && false && <div className="icon-play-pause icon-pause">❚❚</div>}
      <div className="video-overlay">
        <div className="progress-container">
          <input
            type="range"
            className="progress-bar"
            min="0"
            max="100"
            value={progress}
            onChange={handleProgressChange}
            style={{
              background: calculateProgressBackground(progress, 100),
              visibility: showControls ? "visible" : "hidden",
            }}
          />
          <div className="time-display">{formatTime(currentTime)}</div>
        </div>
        <div className="video-controls">
          <button
            onClick={handleRewind}
            className="control-button"
            style={{
              bottom: "2%",
              left: "30%",
              visibility: showControls ? "visible" : "hidden",
            }}
          >
            <span className="button-icon rewind">⟲</span>
            <span className="button-text rewind">10</span>
          </button>

          <button
            onClick={handlePlayPause}
            className={`control-button play-pause-button ${
              showControls ? "" : "blink-glow"
            }`}
            style={{ ...playButton }}
          >
            {isPlaying ? "❚❚" : "▶"}
          </button>

          <button
            onClick={handleFastForward}
            className="control-button"
            style={{
              bottom: "2%",
              right: "30%",
              visibility: showControls ? "visible" : "hidden",
            }}
          >
            <span className="button-icon forward">⟳</span>
            <span className="button-text forward">10</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;
