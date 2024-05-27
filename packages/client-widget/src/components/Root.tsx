import { useCallback, useEffect, useRef, useState } from "react";
import { ConnectParams, Widget } from "..";
import { SessionProvider } from "gabber-client-react";
import React from "react";
import { MainView } from "./MainView";

type Props = {
  widget: Widget;
};
export function Root({ widget }: Props) {
  const widgetRef = useRef(widget);
  const [url, setUrl] = useState<string | undefined>(undefined);
  const [token, setToken] = useState<string | undefined>(undefined);

  const connectHandler = useCallback((p: ConnectParams) => {
    console.log("Connect with params")
    setUrl(p.url)
    setToken(p.token);
  }, []);

  useEffect(() => {
    widgetRef.current.registerConnectHandler(connectHandler);
    return () => {
        widgetRef.current.unregisterConnectHandler(connectHandler);
    }
  }, [connectHandler]);
  return (
    <SessionProvider url={url} token={token} connect={Boolean(url && token)}>
      <>
        <MainView />
      </>
    </SessionProvider>
  );
}