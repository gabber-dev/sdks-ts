import { LocalAudioTrack, RemoteAudioTrack } from "livekit-client";
export declare class TrackVolumeVisualizer {
    private interval;
    private callback;
    private bands;
    private cleanup;
    constructor({ bands, onTick }: TrackVolumeVisualizerParams);
    setTrack(track: LocalAudioTrack | RemoteAudioTrack): void;
}
type TrackVolumeVisualizerParams = {
    bands: number;
    onTick: (values: number[], volume: number) => void;
};
export {};
//# sourceMappingURL=track_volume_visualizer.d.ts.map