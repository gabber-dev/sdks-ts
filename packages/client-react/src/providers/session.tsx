import { createContext, useRef, useEffect, useState } from 'react'
import { Gabber } from 'gabber-client-core'
import React from 'react'

type SessionContextData = {
  inProgressState: Gabber.InProgressState;
  messages: Gabber.SessionMessage[];
  microphoneEnabled: boolean;
  agentVolumeBands: number[];
  agentVolume: number;
  userVolumeBands: number[];
  userVolume: number;
  agentState: Gabber.AgentState;
  setMicrophoneEnabled: (enabled: boolean) => Promise<void>;
  sendChatMessage: (p: Gabber.SendChatMessageParams) => Promise<void>;
};

const SessionContext = createContext<SessionContextData | undefined>(undefined)

type Props = {
  connectionDetails: Gabber.ConnectionDetails;
  connect: boolean;
  children: React.ReactNode;
};

export function SessionProvider({
  connectionDetails,
  connect,
  children,
}: Props) {

  const [inProgressState, setInProgressState] =
    useState<Gabber.InProgressState>("not_connected");
  const [messages, setMessages] = useState<Gabber.SessionMessage[]>([]);
  const [microphoneEnabledState, setMicrophoneEnabledState] = useState(false);
  const [agentVolumeBands, setAgentVolumeBands] = useState<number[]>([]);
  const [agentVolume, setAgentVolume] = useState<number>(0);
  const [userVolumeBands, setUserVolumeBands] = useState<number[]>([]);
  const [userVolume, setUserVolume] = useState<number>(0);
  const [agentState, setAgentState] = useState<Gabber.AgentState>("listening");
  const createOnce = useRef(false);

  const onInProgressStateChanged = useRef(
    (sessionState: Gabber.InProgressState) => {
      setInProgressState(sessionState);
    }
  );

  const onMessagesChanged = useRef((messages: Gabber.SessionMessage[]) => {
    setMessages([...messages]);
  });

  const onMicrophoneChanged = useRef(async (enabled: boolean) => {
    setMicrophoneEnabledState(enabled);
  });

  const onAgentVolumeChanged = useRef((values: number[], volume: number) => {
    setAgentVolumeBands(values);
    setAgentVolume(volume)
  })

  const onUserVolumeChanged = useRef((values: number[], volume: number) => {
    setUserVolumeBands(values);
    setUserVolume(volume);
  })

  const onAgentStateChanged = useRef((as: Gabber.AgentState) => {
    setAgentState(as);
  })

  const sessionEngine = useRef(
    (() => {
      // React will always return the first instantiation
      // even though this function will be called multiple times
      if (createOnce.current) {
        return {} as Gabber.SessionEngine
      }
      createOnce.current = true;
      return new Gabber.SessionEngine({
        connectionDetails,
        onAgentStateChanged: onAgentStateChanged.current,
        onUserVolumeChanged: onUserVolumeChanged.current,
        onAgentVolumeChanged: onAgentVolumeChanged.current,
        onInProgressStateChanged: onInProgressStateChanged.current,
        onMessagesChanged: onMessagesChanged.current,
        onMicrophoneChanged: onMicrophoneChanged.current,
      });
    })()
  );

  const setMicrophoneEnabled = useRef(async (enabled: boolean) => {
    if (!sessionEngine.current) {
      console.error("Trying to set microphone when there is no session");
      return;
    }
    await sessionEngine.current.setMicrophoneEnabled(enabled);
  });

  const sendChatMessage = useRef(async (p: Gabber.SendChatMessageParams) => {
    if (!sessionEngine.current) {
      console.error("Trying to send chat message when there is no session");
      return;
    }
    await sessionEngine.current.sendChatMessage(p);
  });

  useEffect(() => {
    if (connect) {
      if (inProgressState !== "not_connected") {
        return;
      }
      if (!connectionDetails) {
        console.error("Trying to connect without a token or url");
        return;
      }
      console.log("session engine connecting");
      sessionEngine.current.connect();
    }
  }, [connect, connectionDetails, inProgressState]);

  return (
    <SessionContext.Provider
      value={{
        messages,
        inProgressState,
        microphoneEnabled: microphoneEnabledState,
        agentVolumeBands,
        agentVolume,
        userVolumeBands,
        userVolume,
        agentState,
        sendChatMessage: sendChatMessage.current,
        setMicrophoneEnabled: setMicrophoneEnabled.current,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
    const context = React.useContext(SessionContext)
    if(!context) {
        throw "useSession must be used within a SessionProvider"
    }
    return context;
}