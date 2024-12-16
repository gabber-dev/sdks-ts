import { Api, Scenario } from "gabber-client-core";
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useToken } from "./TokenProvider";

type ScenarioContextData = {
  scenarios: Scenario[];
  selectedScenarioIdx: number;
  setSelectedScenarioIdx: (idx: number) => void;
};

const ScenarioContext = createContext<ScenarioContextData | undefined>(
  undefined,
);

type Props = {
  children: React.ReactNode;
};

export function ScenarioProvider({ children }: Props) {
  const { token } = useToken();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenarioIdx, setSelectedScenarioIdx] = useState<number>(0);
  const api = useMemo(() => {
    if (!token) {
      return null;
    }
    return new Api(token);
  }, [token]);

  const loadScenarios = useCallback(async () => {
    if (!api) {
      return;
    }
    const scenarios = await api.scenario.listScenarios();
    setScenarios(scenarios.data.values);
  }, [api]);

  useEffect(() => {
    loadScenarios();
  }, [loadScenarios]);

  return (
    <ScenarioContext.Provider
      value={{ scenarios, selectedScenarioIdx, setSelectedScenarioIdx }}
    >
      {children}
    </ScenarioContext.Provider>
  );
}

export function useScenario() {
  const context = React.useContext(ScenarioContext);
  if (!context) {
    throw new Error("useScenario must be used within a ScenarioProvider");
  }
  return context;
}
