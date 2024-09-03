# Gabber Client React

## Getting Started

### Install

```bash
npm install gabber-client-react
```

### Add Provider

```tsx
import { SessionProvider } from 'gabber-client-react'
export const MyApp = () => {
  return (
    <SessionProvider
      connectionDetails={{
        url: 'my-connection-url' // Generate these from your backend (i.e. a nextjs api handler). See gabber-server
        token: 'my-connection-token'
      }}
    >
      <MyComponent />
    </SessionProvider>
  )
}
```

  connectionState: Gabber.ConnectionState;
  messages: Gabber.SessionMessage[];
  lastError: string | null;
  microphoneEnabled: boolean;
  agentVolumeBands: number[];
  agentVolume: number;
  userVolumeBands: number[];
  userVolume: number;
  agentState: Gabber.AgentState;
  remainingSeconds: number | null;
  transcription: { text: string; final: boolean };
  canPlayAudio: boolean;
  setMicrophoneEnabled: (enabled: boolean) => Promise<void>;
  sendChatMessage: (p: Gabber.SendChatMessageParams) => Promise<void>;
  startAudio: () => Promise<void>;

### Use Hooks
```tsx
import { useSession } from 'gabber-client-react'
export const MyComponent = () => {
    const { connectionState,
            messages,
            lastError,
            microphoneEnabled,
            agentVolumeBands,
            agentVolume,
            userVolumeBands,
            userVolume,
            agentState,
            remainingSeconds,
            transcription,
            canPlayAudio,
            setMicrophoneEnabled,
            sendChatMessage,
            startAudio} = useSession();
    return (<div>your component stuff</div>)
}
```
