import { Gabber } from "gabber-client-core";
import { useSession } from "gabber-client-react";
import React, { useEffect, useRef, useState } from "react";

type Props = {
  color: string;
  gap: number;
};

export const AgentVisualizer = ({ color, gap }: Props) => {
  const { agentVolumeBands, connectionState, agentState } = useSession();
  const [heights, setHeights] = useState<number[]>([])

  const agentVolumesRef = useRef<number[]>(agentVolumeBands)
  const connectionStateRef = useRef<Gabber.ConnectionState>("not_connected")
  const agentStateRef = useRef<Gabber.AgentState>("listening")
  const thinkingIndex = useRef<number>(0)
  const thinkingLastTick = useRef<number>(0)
  const thinkingDirection = useRef(1)

  useAnimationFrame((dt: number) => {
    if (connectionStateRef.current !== "connected") {
      setHeights([]);
      return;
    }

    if(agentStateRef.current === "thinking") {
      if (thinkingIndex.current >= agentVolumesRef.current.length) {
        thinkingIndex.current = agentVolumesRef.current.length - 1;
      }
      thinkingLastTick.current += dt;
      if (thinkingLastTick.current > 60) {
        thinkingLastTick.current = 0;
        if (thinkingIndex.current == 0) {
          thinkingDirection.current = 1;
        } else if (
          thinkingIndex.current ==
          agentVolumesRef.current.length - 1
        ) {
          thinkingDirection.current = -1;
        }
        thinkingIndex.current += thinkingDirection.current;
        setHeights(
          agentVolumesRef.current.map((_, idx) => {
            if (idx === thinkingIndex.current) {
              return 0.4;
            }
            return 0.2;
          })
        );
      }
    } else {
      setHeights(agentVolumesRef.current)
    }
  })

  useEffect(() => {
    agentStateRef.current = agentState;
  }, [agentState])

  useEffect(() => {
    agentVolumesRef.current = agentVolumeBands;
    connectionStateRef.current = connectionState;
  }, [agentVolumeBands, connectionState]);

  return (
    <div className={`flex flex-row items-center w-full h-full`} style={{ gap }}>
      {heights.map((frequency, index) => {
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

const useAnimationFrame = (callback: (dt: number) => void) => {
  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const requestRef = React.useRef<number>(-1);
  const previousTimeRef = React.useRef<number>();
  
  const animate = (time: number) => {
    if (previousTimeRef.current != undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime)
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }
  
  React.useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);
}