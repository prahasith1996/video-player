import React, { useRef, useState, useEffect, useMemo } from "react";
import "./VideoPlayer.css";

function VideoPlayer() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playButton, setPlayButton] = useState({ bottom: "0%", left: "" });
  const [lastPausedTimestamp, setLastPausedTimestamp] = useState(null);
  const [timestamps, setTimestamps] = useState([]);
  const searchParams = new URLSearchParams(window.location.search);
  const name = searchParams.get("name");
  const type = searchParams.get("type");
  const gaze = searchParams.get("gaze");
  const [pauseTimes, setPauseTimes] = useState([]);
  const [playTimes, setPlayTimes] = useState([]);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (name) {
      fetch(`/data/${name}.json`)
        .then((response) => response.json())
        .then((data) => {
          const relevantData = data[type];
          setTimestamps(relevantData);
        })
        .catch((error) =>
          console.error("Error loading the hotspot data:", error)
        );
    }
  }, [name]);

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
        setIsPlaying(false);
        setShowControls(false);
        setPlayButton({ ...matchingTimestamp.location });
      }
    };

    video.addEventListener("timeupdate", checkTime);
    return () => video.removeEventListener("timeupdate", checkTime);
  }, [isPlaying, lastPausedTimestamp, timestamps]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      event.preventDefault();
      if (
        (event.key === "ArrowRight" || event.KeyCode === 39) &&
        !isPlaying &&
        !showControls &&
        gaze === "true"
      ) {
        handlePlayPause();
      }
    };

    // Add event listener for the 'keydown' event
    window.addEventListener("keydown", handleKeyPress);

    // Cleanup the event listener
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  });

  const handlePlayPause = () => {
    if (videoRef.current) {
      const videoElement = videoRef.current;

      if (isPlaying) {
        videoElement.pause();
        setIsPlaying(false);
      } else {
        if (videoElement.readyState >= 3) {
          videoElement
            .play()
            .then(() => {
              setPlayButton({ bottom: "0%", left: "" });
              setShowControls(true);
              setIsPlaying(true);
              if (pauseTimes.length > 0) {
                setPlayTimes((prevTimes) => [...prevTimes, Date.now()]);
              }
            })
            .catch((error) => {
              console.error("Error trying to play the video:", error);
            });
        }
      }
    }
  };

  const handleVideoEnd = () => {
    setShowAlert(true);
  };

  const handlePause = () => {
    if (pauseTimes.length < 4) {
      setPauseTimes((prevTimes) => [...prevTimes, Date.now()]);
    }
  };

  return (
    <div className="video-player">
      {!isPlaying && <div className="pause-overlay"></div>}
      <video
        ref={videoRef}
        className="video-element"
        onEnded={handleVideoEnd}
        onPause={handlePause}
      >
        <source src={`/videos/${name}.webm`} type="video/webm" />
        Your browser does not support the video tag.
      </video>
      <div className="video-overlay">
        <div className="video-controls">
          <button
            onClick={handlePlayPause}
            className={`control-button play-pause-button`}
            style={{ ...playButton }}
          >
            {isPlaying ? "" : "▶"}
          </button>
        </div>
      </div>
      <div className={showAlert ? "alert-box" : "alert-box alert-box-hidden"}>
        <table>
          <thead>
            <tr>
              <th>Interaction</th>
              <th>Interaction Duration (seconds)</th>
            </tr>
          </thead>
          <tbody>
            {pauseTimes.map((pauseTime, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{((playTimes[index] - pauseTime) / 1000).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default VideoPlayer;
