"use strict";

import { createAudioAnalyser } from "livekit-client";
export class TrackVolumeVisualizer {
  cleanup = null;
  constructor({
    bands,
    onTick
  }) {
    this.bands = bands;
    this.callback = onTick;
  }
  setTrack(track) {
    if (this.interval) {
      clearInterval(this.interval);
    }
    if (this.cleanup) {
      this.cleanup();
    }
    const {
      analyser,
      cleanup,
      calculateVolume
    } = createAudioAnalyser(track, {
      fftSize: 256,
      smoothingTimeConstant: 0.7
    });
    this.cleanup = cleanup;
    const dataArray = new Float32Array(this.bands);
    this.interval = setInterval(() => {
      analyser.getFloatFrequencyData(dataArray);
      const result = [];
      for (let i = 0; i < dataArray.length; i++) {
        result.push(Math.max(0, dataArray[i] + 140) / 140);
      }
      this.callback(result, calculateVolume());
    }, 1000 / 100);
  }
}
//# sourceMappingURL=track_volume_visualizer.js.map