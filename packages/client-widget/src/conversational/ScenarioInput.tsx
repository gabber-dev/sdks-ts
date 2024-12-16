import { useRealtimeSessionEngine } from "gabber-client-react";
import React, { useState } from "react";

export function ScenarioInput() {
  const [value, setValue] = useState("");
  const { connectionState } = useRealtimeSessionEngine();
  if (connectionState !== "not_connected") {
    return null;
  }

  return (
    <div>
      <textarea
        placeholder="Type your scenario here..."
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      />
    </div>
  );
}
