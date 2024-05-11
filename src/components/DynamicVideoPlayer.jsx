import React, { useRef, useState, useEffect, useMemo } from "react";
import "./VideoPlayer.css";

function DynamicVideoPlayer() {
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
  const [lastPausedTimestamp, setLastPausedTimestamp] = useState(null);

  const [furthestWatched, setFurthestWatched] = useState(0);
  const [completed, setCompleted] = useState([]);

  const [timestamps, setTimestamps] = useState([]);
  const searchParams = new URLSearchParams(window.location.search)
  const videoID = searchParams.get('videoID');

  useEffect(() => {
    if (videoID) {
      fetch(`/data/${videoID}.json`)
        .then(response => response.json())
        .then(data => {
          const relevantData = data['dynamic'];
          setTimestamps(relevantData);
        })
        .catch(error => console.error('Error loading the hotspot data:', error));
    }
  }, [videoID]);

  useEffect(() => {
    const updateTimeStamp = setInterval(() => {
      if (!videoRef.current) return;

      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;

      setCurrentTime(currentTime);
      setProgress((currentTime / duration) * 100);
      if (currentTime > furthestWatched) {
        setFurthestWatched(currentTime);
      }
    }, 500);

    return () => clearInterval(updateTimeStamp);
  }, [furthestWatched]);

  useEffect(() => {
    const video = videoRef.current;
    const checkTime = () => {
      const currentTime = video.currentTime;

      if (!isPlaying) return;
      const matchingTimestamp = timestamps.find(
        (ts) =>
          Math.abs(ts.time - currentTime) <= 0.5 &&
          currentTime - lastPausedTimestamp > 1 &&
          !completed.includes(ts.time)
      );

      if (matchingTimestamp) {
        setLastPausedTimestamp(currentTime);
        videoRef.current.pause();
        setShowPause(true);
        const totalDuration = 0.5 * 1000;
        setTimeout(() => {
          setShowPause(false);
        }, totalDuration);
        setIsPlaying(false);
        setShowControls(false);
        setPlayButton({ ...matchingTimestamp.location });
        setCompleted((previous) => [...previous, matchingTimestamp.time]);
      }
    };

    video.addEventListener("timeupdate", checkTime);
    return () => video.removeEventListener("timeupdate", checkTime);
  }, [isPlaying, timestamps, lastPausedTimestamp, completed]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      event.preventDefault();
      if ((event.key === 'ArrowRight' || event.KeyCode === 39) && (!isPlaying && !showControls)) {
        handlePlayPause();
      }
    };

    // Add event listener for the 'keydown' event
    window.addEventListener('keydown', handleKeyPress);

    // Cleanup the event listener
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  });

  const handlePlayPause = () => {
    if (videoRef.current) {
      const videoElement = videoRef.current;

      if (isPlaying) {
        videoElement.pause();
        setShowPause(true);
        const totalDuration = 0.5 * 1000;
        setTimeout(() => {
          setShowPause(false);
        }, totalDuration);
        setIsPlaying(false);
      } else {
        if (videoElement.readyState >= 3) {
          videoElement
            .play()
            .then(() => {
              setShowPlay(true);
              const totalDuration = 0.5 * 1000;
              setTimeout(() => {
                setShowPlay(false);
              }, totalDuration);
              setPlayButton({ bottom: "0%", left: "" });
              setShowControls(true);
              setIsPlaying(true);
            })
            .catch((error) => {
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
        setShowRewind(false);
      }, totalDuration);
      videoRef.current.currentTime -= 10;
      setLastPausedTimestamp(null);
    }
  };

  const handleFastForward = () => {
    if (videoRef.current) {
      setShowForward(true);
      const totalDuration = 0.5 * 1000;
      setTimeout(() => {
        setShowForward(false);
      }, totalDuration);
      videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, furthestWatched);
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
    videoRef.current.currentTime = Math.min(newTime, furthestWatched);
    setLastPausedTimestamp(null);
    setProgress(e.target.value);
  };

  const calculateProgressBackground = (value, max) => {
    const percentage = (value / max) * 100;
    return `linear-gradient(to right, red ${percentage}%, lightgrey ${percentage}%, lightgrey 100%)`;
  };

  return (
    <div className="video-player">
      {!isPlaying && (<div className="pause-overlay"></div>)}
      <video ref={videoRef} className="video-element">
        <source src={`/videos/${videoID}.webm`} type="video/webm" />
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
            className={`control-button play-pause-button ${showControls ? '' : 'blink-glow'}`}
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

export default DynamicVideoPlayer;
