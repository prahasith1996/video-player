import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import VideoPlayer from "./components/VideoPlayer"; // Import the VideoPlayer component
import RegularVideoPlayer from "./components/RegularVideoPlayer";
import AnywhereVideoPlayer from "./components/AnywhereVideoPlayer";
import StaticVideoPlayer from "./components/StaticVideoPlayer";
import DynamicVideoPlayer from "./components/DynamicVideoPlayer";


function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/regular" element={<RegularVideoPlayer />} />
          <Route path="/anywhere" element={<AnywhereVideoPlayer />} />
          <Route path="/static" element={<StaticVideoPlayer />} />
          <Route path="/dynamic" element={<DynamicVideoPlayer />} />
          <Route path="*" element={<Navigate to="/regular" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
