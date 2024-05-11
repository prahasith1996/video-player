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
  const videoID = searchParams.get("videoID");

  useEffect(() => {
    if (videoID) {
      fetch(`/data/${videoID}.json`)
        .then((response) => response.json())
        .then((data) => {
          const relevantData = data["dynamic"];
          setTimestamps(relevantData);
        })
        .catch((error) =>
          console.error("Error loading the hotspot data:", error)
        );
    }
  }, [videoID]);

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
        !showControls
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
            })
            .catch((error) => {
              console.error("Error trying to play the video:", error);
            });
        }
      }
    }
  };

  return (
    <div className="video-player">
      {!isPlaying && <div className="pause-overlay"></div>}
      <video ref={videoRef} className="video-element">
        <source src={`/videos/${videoID}.webm`} type="video/webm" />
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
    </div>
  );
}

export default VideoPlayer;
