import { useSession } from "gabber-client-react";
import React, { useState } from "react";

type Props = {
}

export function ScenarioInput({}: Props) {
  const [value, setValue] = useState("");
  const { connectionState } = useSession();
  if(connectionState !== "not_connected") {
    return null
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