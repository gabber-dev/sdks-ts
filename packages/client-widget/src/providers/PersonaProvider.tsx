import { Api, Persona } from "gabber-client-core";
import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { useToken } from "./TokenProvider";

type PersonaContextData = {
    personas: Persona[];
    selectedPersonaIdx: number;
    setSelectedPersonaIdx: (idx: number) => void;
};

const PersonaContext = createContext<PersonaContextData | undefined>(
  undefined
);

type Props = {
  children: React.ReactNode;
};

export function PersonaProvider({
  children,
}: Props) {
  const {token} = useToken();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersonaIdx, setSelectedPersonaIdx] = useState<number>(0);
  const api = useMemo(() => {
    if(!token) {
      return null;
    }
    return new Api(token);
  }, [token]);

  const loadPersonas = useCallback(async () => {
    if(!api) {
      return;
    }
    const personas = await api.getPersonas();
    setPersonas(personas.values);
  }, [api]);

  useEffect(() => {
    loadPersonas();
  }, [loadPersonas]);

  return (
    <PersonaContext.Provider
      value={{ personas, selectedPersonaIdx, setSelectedPersonaIdx }}
    >
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  const context = React.useContext(PersonaContext);
  if (!context) {
    throw "usePersona must be used within a PersonaProvider";
  }
  return context;
}
