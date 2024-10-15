import React from "react";
import { useSettings } from "./SettingsProvider";
type Props = {
  items: any;
  name: (item: any) => string;
  selectedItemIdx: number;
  setSelectedItemIdx: (idx: number) => void;
};

export function Selector({
  items,
  name,
  selectedItemIdx,
  setSelectedItemIdx,
}: Props) {
  const { settings } = useSettings();
  return (
    <div
      className="flex flex-col h-full w-full justify-start overflow-scroll"
      style={{
        backgroundColor: settings.baseColorPlusOne,
      }}
    >
      {items.map((item: any, idx: number) => (
        <button
          key={idx}
          onClick={() => setSelectedItemIdx(idx)}
          className="h-[40px] w-full"
          style={{
            color: settings.primaryColor,
            backgroundColor:
              idx === selectedItemIdx ? settings.secondaryColor : "",
          }}
        >
          {name(item)}
        </button>
      ))}
    </div>
  );
}
