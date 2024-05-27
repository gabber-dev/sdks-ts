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
    url: string | undefined 
    token: string | undefined
    connect: boolean
    children: React.ReactNode
}

export function SessionProvider({ token, url, connect, children }: Props) {
    const session = useRef<Gabber.Session | null>(null)
    const [inProgressState, setInProgressState] = useState<Gabber.InProgressState>("not_connected")
    const [messages, setMessages] = useState<Gabber.SessionMessage[]>([])
    const [microphoneEnabledState, setMicrophoneEnabledState] = useState(false);

    const onInProgressStateChanged = useCallback((sessionState: Gabber.InProgressState) => { 
        setInProgressState(sessionState);
    }, [])

    const onMessagesChanged = useCallback((messages: Gabber.SessionMessage[]) => {
        setMessages([...messages])
    }, [])

    const setMicrophoneEnabled = useCallback(async (enabled: boolean) => {
        if(!session.current) {
            console.error("Trying to set microphone when there is no session")
            return
        }
        await session.current.setMicrophoneEnabled(enabled);
    }, [])

    const sendChatMessage = useCallback(
      async (p: Gabber.SendChatMessageParams) => {
        if(!session.current) {
            console.error("Trying to send chat message when there is no session")
            return
        }
        await session.current.sendChatMessage(p);
      },
      []
    );

    const onMicrophoneChanged = useCallback(async (enabled: boolean) => {
        setMicrophoneEnabledState(enabled);
    }, [])

    useEffect(() => {
        if(connect) {
            if(!token || !url) {
                console.error("Trying to connect without a token or url")
                return
            }
            if(session.current) {
                return
            }
            session.current = new Gabber.Session({ url, token, onInProgressStateChanged, onMessagesChanged, onMicrophoneChanged })
            session.current.connect()
        } else {
            if(!session.current) {
                console.error("Trying to disconnect from no session")
                return
            }
            session.current.disconnect().then(() => session.current = null)
        }
    }, [connect, onInProgressStateChanged, onMessagesChanged, onMicrophoneChanged, token, url])

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