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

        setPauseTimes((prevTimes) => [...prevTimes, Date.now()]);

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

  useEffect(() => {
    if (playTimes.length === 4) {
      // Calculate the durations and export to CSV when 3 pauses have occurred
      const durations = pauseTimes.map((pauseTime, index) => {
        return (playTimes[index] - pauseTime)/1000;
      });
      exportToCSV(durations);
    }
  }, [pauseTimes, playTimes]);

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
    const durations = pauseTimes.map((pauseTime, index) => {
      return (playTimes[index] - pauseTime)/1000;
    });
    alert(durations);
  };

  const exportToCSV = (intervals) => {
    const csvRows = [
      ["Interaction Index", "Interaction duration (seconds)"],
    ];
    intervals.forEach((interval, index) => {
      csvRows.push([index + 1, interval]);
    });
    const csvString = csvRows.map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "interaction-durations.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="video-player">
      {!isPlaying && <div className="pause-overlay"></div>}
      <video ref={videoRef} className="video-element" onEnded={handleVideoEnd}>
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
    </div>
  );
}

export default VideoPlayer;
