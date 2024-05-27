import React, { useState } from "react";
import { useSession } from "gabber-client-react";
import { Send } from "@mui/icons-material";

export function ChatInput() {
  const [value, setValue] = useState("");
  const { sendChatMessage } = useSession();
  return (
    <form
      className="h-full w-full flex"
      onSubmit={async (e) => {
        e.preventDefault();
        await sendChatMessage({ text: value });
        setValue("");
      }}
    >
      <input
        className="h-full grow"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      ></input>
      <button
        onClick={async () => {
          await sendChatMessage({ text: value });
          setValue("");
        }}
      >
        <Send />
      </button>
    </form>
  );
}
