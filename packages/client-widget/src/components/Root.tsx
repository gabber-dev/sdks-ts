import { useCallback, useEffect, useRef, useState } from "react";
import { Widget } from "..";
import { SessionProvider } from "gabber-client-react";
import React from "react";
import { MainView } from "./MainView";
import { Gabber } from "gabber-client-core";

type Props = {
  widget: Widget;
  connectionDetails: Gabber.ConnectionDetails;
  session: Gabber.Session;
  persona: Gabber.Persona;
  scenario: Gabber.Scenario;
};

export function Root({
  widget,
  connectionDetails,
  session,
  persona,
  scenario,
}: Props) {
  const widgetRef = useRef(widget);
  const [connect, setConnect] = useState(false);

  const connectHandler = useCallback(() => {
    console.log("Connect with params");
    setConnect(true);
  }, []);

  useEffect(() => {
    widgetRef.current.registerConnectHandler(connectHandler);
    return () => {
      widgetRef.current.unregisterConnectHandler(connectHandler);
    };
  }, [connectHandler]);

  return (
    <SessionProvider
      connectionDetails={connectionDetails}
      scenario={scenario}
      persona={persona}
      session={session}
      connect={connect}
    >
      <>
        <MainView />
      </>
    </SessionProvider>
  );
}