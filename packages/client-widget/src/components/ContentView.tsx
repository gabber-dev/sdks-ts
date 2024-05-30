import { useSession } from "gabber-client-react";
import React, { useMemo } from "react";
import { Settings } from "..";

type Props = {
  connect: () => void;
  settings?: Settings;
};

export function ContentView({ connect, settings }: Props) {
  const { inProgressState } = useSession();

  const showConnectButton = useMemo(() => {
    if (inProgressState !== "not_connected") {
      return true;
    }
    return !Boolean(settings?.autoConnect);
  }, [settings?.autoConnect, inProgressState]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {inProgressState}
      {showConnectButton && <button onClick={connect}>Connect</button>}
    </div>
  );
}
