import { Api, UsageType } from "gabber-client-core";
import React, { createContext, useCallback, useMemo, useState } from "react";
import { useToken } from "./TokenProvider";

type UsageContextData = {
  exceededLimits: UsageType[];
  checkUsage: (type: UsageType) => Promise<boolean>;
};

const UsageContext = createContext<UsageContextData | undefined>(undefined);

type Props = {
  children: React.ReactNode;
  usageLimitExceededCallback?: (type: UsageType) => void;
};

export function UsageProvider({ children, usageLimitExceededCallback }: Props) {
  const { token } = useToken();
  const [exceededLimits, setExceededLimits] = useState<UsageType[]>([]);
  const api = useMemo(() => {
    if (!token) {
      return null;
    }
    return new Api(token);
  }, [token]);

  const checkUsage = useCallback(
    async (type: UsageType) => {
      console.log("Checking usage for", type);
      if (!api) {
        if (usageLimitExceededCallback) {
          usageLimitExceededCallback(type);
        }
        return false;
      }
      const limits = await api.usage.getUsageLimits();
      const limit = limits.data.find((l) => l.type === type);
      let limitAllowed = true;
      if (!limit || limit.value <= 0) {
        limitAllowed = false;
      }

      console.info("Limit allowed:", limitAllowed, "for", type);
      if (!limitAllowed && usageLimitExceededCallback) {
        console.log("Calling exceeded callback", type);
        usageLimitExceededCallback(type);
        setExceededLimits((prev) => {
          const filtered = prev.filter((l) => l !== type);
          return [...filtered, type];
        });
      }
      return limitAllowed;
    },
    [api, usageLimitExceededCallback],
  );

  return (
    <UsageContext.Provider value={{ checkUsage, exceededLimits }}>
      {children}
    </UsageContext.Provider>
  );
}

export function useUsage() {
  const context = React.useContext(UsageContext);
  if (!context) {
    throw new Error("useUsage must be used within a UsageProvider");
  }
  return context;
}
