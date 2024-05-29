import { createContext, useRef, useEffect, useCallback, useState } from 'react'
import { Gabber } from 'gabber-client-core'
import React from 'react'

type SessionContextData = {
  inProgressState: Gabber.InProgressState;
  messages: Gabber.SessionMessage[];
  microphoneEnabled: boolean;
  setMicrophoneEnabled: (enabled: boolean) => Promise<void>;
  sendChatMessage: (p: Gabber.SendChatMessageParams) => Promise<void>;
};

const SessionContext = createContext<SessionContextData | undefined>(undefined)

type Props = {
  connectionDetails: Gabber.ConnectionDetails;
  session: Gabber.Session;
  persona: Gabber.Persona;
  scenario: Gabber.Scenario;
  connect: boolean;
  children: React.ReactNode;
};

export function SessionProvider({
  connectionDetails,
  persona,
  session,
  scenario,
  connect,
  children,
}: Props) {

  const [inProgressState, setInProgressState] =
    useState<Gabber.InProgressState>("not_connected");
  const [messages, setMessages] = useState<Gabber.SessionMessage[]>([]);
  const [microphoneEnabledState, setMicrophoneEnabledState] = useState(false);

  const onInProgressStateChanged = useCallback(
    (sessionState: Gabber.InProgressState) => {
      setInProgressState(sessionState);
    },
    []
  );

  const onMessagesChanged = useCallback((messages: Gabber.SessionMessage[]) => {
    setMessages([...messages]);
  }, []);

  const onMicrophoneChanged = useCallback(async (enabled: boolean) => {
    setMicrophoneEnabledState(enabled);
  }, []);

  const sessionEngine = useRef<Gabber.SessionEngine>(
    new Gabber.SessionEngine({
      connectionDetails,
      persona,
      session,
      scenario,
      onInProgressStateChanged,
      onMessagesChanged,
      onMicrophoneChanged,
    })
  );

  useEffect(() => {
    if(session.id === sessionEngine.current.session.id) {
      return;
    }

    console.error("Using a new session id, this isn't supported yet");
  }, [session.id])

  const setMicrophoneEnabled = useCallback(async (enabled: boolean) => {
    if (!sessionEngine.current) {
      console.error("Trying to set microphone when there is no session");
      return;
    }
    await sessionEngine.current.setMicrophoneEnabled(enabled);
  }, []);

  const sendChatMessage = useCallback(
    async (p: Gabber.SendChatMessageParams) => {
      if (!sessionEngine.current) {
        console.error("Trying to send chat message when there is no session");
        return;
      }
      await sessionEngine.current.sendChatMessage(p);
    },
    []
  );

  useEffect(() => {
    if (connect) {
      if (!connectionDetails) {
        console.error("Trying to connect without a token or url");
        return;
      }
      if (sessionEngine.current) {
        return;
      }
      sessionEngine.current = new Gabber.SessionEngine({
        connectionDetails,
        session,
        persona,
        scenario,
        onInProgressStateChanged,
        onMessagesChanged,
        onMicrophoneChanged,
      });
      sessionEngine.current.connect();
    } else {
      if (!sessionEngine.current) {
        console.error("Trying to disconnect from no session");
        return;
      }
      sessionEngine.current.disconnect();
    }
  }, [
    connect,
    session,
    persona,
    scenario,
    connectionDetails,
    onInProgressStateChanged,
    onMessagesChanged,
    onMicrophoneChanged,
  ]);

  return (
    <SessionContext.Provider
      value={{
        messages,
        inProgressState,
        microphoneEnabled: microphoneEnabledState,
        sendChatMessage,
        setMicrophoneEnabled,
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