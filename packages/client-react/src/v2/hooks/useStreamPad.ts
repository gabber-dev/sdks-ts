import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import type {
  IStreamPad,
  AudioOptions,
  VideoOptions,
  PadDataTypeDefinition
} from "gabber-client-core/v2";

export interface UseStreamPadOptions {
  /** The stream pad instance */
  pad: IStreamPad | null;
  /** Whether to automatically update when pad state changes */
  reactive?: boolean;
}

export interface UseStreamPadReturn {
  /** The stream pad instance */
  pad: IStreamPad | null;
  /** Whether the pad exists */
  exists: boolean;
  /** Current connection state */
  isConnected: boolean;
  /** Whether the pad is currently publishing */
  isPublishing: boolean;
  /** Whether the pad is subscribed to a stream */
  isSubscribed: boolean;
  /** Current media stream (if any) */
  currentStream: MediaStream | null;
  /** Current value (for property pads) */
  value: any;
  /** Whether this is a property pad */
  isPropertyPad: boolean;
  /** Whether this is a stateless pad */
  isStatelessPad: boolean;
  /** Whether this is a source pad */
  isSourcePad: boolean;
  /** Whether this is a sink pad */
  isSinkPad: boolean;
  /** The derived data type */
  dataType: string;
  /** Allowed types for this pad */
  allowedTypes: PadDataTypeDefinition[] | undefined;
  /** Whether this pad is fully typed (has exactly one allowed type) */
  isFullyTyped: boolean;
  /** Single allowed type (if fully typed) */
  singleAllowedType: PadDataTypeDefinition | null;

  /** Enable/disable microphone (for audio pads) */
  setMicrophoneEnabled: (enabled: boolean, options?: AudioOptions) => Promise<void>;
  /** Enable/disable camera (for video pads) */
  setVideoEnabled: (enabled: boolean, options?: VideoOptions) => Promise<void>;
  /** Enable/disable audio track at source level (for audio pads) */
  setEnabled: (enabled: boolean, options?: { element?: HTMLAudioElement }) => Promise<void>;
  /** Set value (for property pads) */
  setValue: (value: any) => void;
  /** Get current value (for property pads) */
  getValue: () => any;
}

/**
 * Hook for working with a stream pad
 * Provides reactive state management and convenient methods
 */
export function useStreamPad({
  pad,
  reactive = true
}: UseStreamPadOptions): UseStreamPadReturn {
  // State for reactive updates
  const [isConnected, setIsConnected] = useState(() => pad?.getConnectionState() || false);
  const [isPublishing, setIsPublishing] = useState(() => pad?.isPublishing() || false);
  const [isSubscribed, setIsSubscribed] = useState(() => pad?.isSubscribed() || false);
  const [currentStream, setCurrentStream] = useState(() => pad?.getCurrentStream() || null);
  const [value, setValue] = useState(() => pad?.getValue());
  const [, forceUpdate] = useState({});

  // Event handlers stored in refs to prevent recreation
  const handleConnectionChanged = useRef((connected: boolean) => {
    setIsConnected(connected);
  });

  const handleDataReceived = useRef((data: any) => {
    setValue(data);
    if (reactive) {
      forceUpdate({});
    }
  });

  const handleStreamReceived = useRef((stream: MediaStream) => {
    setCurrentStream(stream);
    if (reactive) {
      forceUpdate({});
    }
  });

  const handleTriggerReceived = useRef((data: any) => {
    if (reactive) {
      forceUpdate({});
    }
  });

  // Set up event listeners when pad changes
  useEffect(() => {
    if (!pad || !reactive) return;

    // Update initial state
    setIsConnected(pad.getConnectionState());
    setIsPublishing(pad.isPublishing());
    setIsSubscribed(pad.isSubscribed());
    setCurrentStream(pad.getCurrentStream());
    setValue(pad.getValue());

    // Add event listeners
    pad.on('connection-changed', handleConnectionChanged.current);
    pad.on('data-received', handleDataReceived.current);
    pad.on('stream-received', handleStreamReceived.current);
    pad.on('trigger-received', handleTriggerReceived.current);

    return () => {
      pad.off('connection-changed', handleConnectionChanged.current);
      pad.off('data-received', handleDataReceived.current);
      pad.off('stream-received', handleStreamReceived.current);
      pad.off('trigger-received', handleTriggerReceived.current);
    };
  }, [pad, reactive]);

  // Computed properties
  const exists = pad !== null;

  const padProperties = useMemo(() => {
    if (!pad) {
      return {
        isPropertyPad: false,
        isStatelessPad: false,
        isSourcePad: false,
        isSinkPad: false,
        dataType: 'data',
        allowedTypes: undefined,
        isFullyTyped: false,
        singleAllowedType: null,
      };
    }

    return {
      isPropertyPad: pad.isPropertyPad(),
      isStatelessPad: pad.isStatelessPad(),
      isSourcePad: pad.isSourcePad(),
      isSinkPad: pad.isSinkPad(),
      dataType: pad.dataType,
      allowedTypes: pad.allowedTypes,
      isFullyTyped: pad.isFullyTyped(),
      singleAllowedType: pad.getSingleAllowedType(),
    };
  }, [pad]);

  // Action handlers
  const setMicrophoneEnabled = useCallback(async (enabled: boolean, options?: AudioOptions) => {
    if (!pad) {
      throw new Error('No pad available');
    }
    await pad.setMicrophoneEnabled(enabled, options);
    // Update local state
    setIsPublishing(pad.isPublishing());
    setIsConnected(pad.getConnectionState());
  }, [pad]);

  const setVideoEnabled = useCallback(async (enabled: boolean, options?: VideoOptions) => {
    if (!pad) {
      throw new Error('No pad available');
    }
    await pad.setVideoEnabled(enabled, options);
    // Update local state
    setIsPublishing(pad.isPublishing());
    setIsConnected(pad.getConnectionState());
  }, [pad]);

  const setEnabled = useCallback(async (enabled: boolean, options?: { element?: HTMLAudioElement }) => {
    if (!pad) {
      throw new Error('No pad available');
    }
    await pad.setEnabled(enabled, options);
  }, [pad]);

  const setPadValue = useCallback((newValue: any) => {
    if (!pad) {
      throw new Error('No pad available');
    }
    pad.setValue(newValue);
    setValue(newValue);
  }, [pad]);

  const getPadValue = useCallback(() => {
    return pad?.getValue();
  }, [pad]);

  return {
    pad,
    exists,
    isConnected,
    isPublishing,
    isSubscribed,
    currentStream,
    value,
    ...padProperties,
    setMicrophoneEnabled,
    setVideoEnabled,
    setEnabled,
    setValue: setPadValue,
    getValue: getPadValue,
  };
}

/**
 * Hook for working with audio pads specifically
 * Provides audio-specific convenience methods
 */
export function useAudioPad(pad: IStreamPad | null) {
  const streamPad = useStreamPad({ pad });

  const isAudioPad = streamPad.dataType === 'audio';

  const enableMicrophone = useCallback(async (options?: AudioOptions) => {
    if (!isAudioPad) {
      throw new Error('This is not an audio pad');
    }
    await streamPad.setMicrophoneEnabled(true, options);
  }, [isAudioPad, streamPad]);

  const disableMicrophone = useCallback(async () => {
    if (!isAudioPad) {
      throw new Error('This is not an audio pad');
    }
    await streamPad.setMicrophoneEnabled(false);
  }, [isAudioPad, streamPad]);

  const enableAudio = useCallback(async (options?: { element?: HTMLAudioElement }) => {
    if (!isAudioPad) {
      throw new Error('This is not an audio pad');
    }
    await streamPad.setEnabled(true, options);
  }, [isAudioPad, streamPad]);

  const disableAudio = useCallback(async () => {
    if (!isAudioPad) {
      throw new Error('This is not an audio pad');
    }
    await streamPad.setEnabled(false);
  }, [isAudioPad, streamPad]);

  return {
    ...streamPad,
    isAudioPad,
    enableMicrophone,
    disableMicrophone,
    enableAudio,
    disableAudio,
  };
}

/**
 * Hook for working with video pads specifically
 * Provides video-specific convenience methods
 */
export function useVideoPad(pad: IStreamPad | null) {
  const streamPad = useStreamPad({ pad });

  const isVideoPad = streamPad.dataType === 'video';

  const enableCamera = useCallback(async (options?: VideoOptions) => {
    if (!isVideoPad) {
      throw new Error('This is not a video pad');
    }
    await streamPad.setVideoEnabled(true, options);
  }, [isVideoPad, streamPad]);

  const disableCamera = useCallback(async () => {
    if (!isVideoPad) {
      throw new Error('This is not a video pad');
    }
    await streamPad.setVideoEnabled(false);
  }, [isVideoPad, streamPad]);

  return {
    ...streamPad,
    isVideoPad,
    enableCamera,
    disableCamera,
  };
}

/**
 * Hook for working with property pads specifically
 * Provides property-specific convenience methods
 */
export function usePropertyPad(pad: IStreamPad | null) {
  const streamPad = useStreamPad({ pad });

  const updateValue = useCallback((newValue: any) => {
    if (!streamPad.isPropertyPad) {
      throw new Error('This is not a property pad');
    }
    streamPad.setValue(newValue);
  }, [streamPad]);

  return {
    ...streamPad,
    updateValue,
  };
}