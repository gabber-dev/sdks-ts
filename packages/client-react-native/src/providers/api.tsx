import { createContext, useMemo } from "react";
import React from "react";
import { Api } from "../lib/api";

type ApiContextData = {
  api: Api;
};

const ApiContext = createContext<ApiContextData | undefined>(undefined);

type Props = {
  usageToken: string;
  children: React.ReactNode;
};

export function ApiProvider({ usageToken, children }: Props) {
  const api = useMemo(() => new Api(usageToken), [usageToken]);

  return (
    <ApiContext.Provider
      value={{
        api,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
}

export function useApi() {
  const context = React.useContext(ApiContext);
  if (!context) {
    throw new Error("useApi must be used within a ApiProvider");
  }
  return context;
}
