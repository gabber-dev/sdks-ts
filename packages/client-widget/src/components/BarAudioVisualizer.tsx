import React from "react";

type AgentMultibandAudioVisualizerProps = {
  color: string;
  gap: number;
  values: number[];
};

export const BarAudioVisualizer = ({
  color,
  values,
  gap,
}: AgentMultibandAudioVisualizerProps) => {
  return (
    <div className={`flex flex-row items-center w-full h-full`} style={{ gap }}>
      {values.map((frequency, index) => {
        return (
          <div
            className="grow rouded-sm"
            key={"frequency-" + index}
            style={{
              height: `calc(5% + ${frequency} * 80%)`,
              transform: "",
              backgroundColor: color,
              boxShadow: `0px 0px 20px 1px ${color}`,
            }}
          ></div>
        );
      })}
    </div>
  );
};