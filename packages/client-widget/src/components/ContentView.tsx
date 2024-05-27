import { useSession } from "gabber-client-react";
import React from "react";

export function ContentView() {
    const { inProgressState } = useSession();
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        {inProgressState}
      </div>
    );
}