import { SDKAgentState, SDKConnectionState } from "../generated";
import type { SDKConnectOptions, SDKSendChatMessageParams, SDKSessionTranscription } from "../generated";
import React from "react";
type RealtimeSessionEngineContextData = {
    id: string | null;
    connectionState: SDKConnectionState;
    messages: SDKSessionTranscription[];
    lastError: {
        message: string;
    } | null;
    microphoneEnabled: boolean;
    agentVolumeBands: number[];
    agentVolume: number;
    userVolumeBands: number[];
    userVolume: number;
    agentState: SDKAgentState;
    remainingSeconds: number | null;
    transcription: {
        text: string;
        final: boolean;
    };
    setMicrophoneEnabled: (enabled: boolean) => Promise<void>;
    sendChatMessage: (p: SDKSendChatMessageParams) => Promise<void>;
};
type Props = {
    connectionOpts: SDKConnectOptions | null;
    children: React.ReactNode;
};
export declare function RealtimeSessionEngineProvider({ connectionOpts, children, }: Props): import("react/jsx-runtime").JSX.Element;
export declare function useRealtimeSessionEngine(): RealtimeSessionEngineContextData;
export {};
//# sourceMappingURL=realtime_session_engine.d.ts.map