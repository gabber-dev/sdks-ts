import { Gabber } from "gabber-client-core";
import React, { createContext, useCallback, useMemo, useState } from "react";
import { useToken } from "./TokenProvider";

type UsageContextData = {
  exceededLimits: Gabber.UsageType[];
  checkUsage: (type: Gabber.UsageType) => Promise<boolean>;
};

const UsageContext = createContext<UsageContextData | undefined>(
  undefined
);

type Props = {
  children: React.ReactNode;
  usageLimitExceededCallback?: (type: Gabber.UsageType) => void;
};

export function UsageProvider({
  children,
  usageLimitExceededCallback,
}: Props) {
  const {token} = useToken();
  const [exceededLimits, setExceededLimits] = useState<Gabber.UsageType[]>([]);
  const api = useMemo(() => {
    if(!token) {
      return null;
    }
    return new Gabber.Api(token);
  }, [token]);

  const checkUsage = useCallback(async (type: Gabber.UsageType) => {
    console.log('Checking usage for', type);
    if(!api) {
      if(usageLimitExceededCallback) {
        usageLimitExceededCallback(type);
      }
      return false;
    }
    const limits = await api.getUsageLimits();
    const limit = limits.find((l) => l.type === type);
    let limitAllowed = true;
    if(!limit || limit.value <= 0) {
      limitAllowed = false;
    }

    console.info("Limit allowed:", limitAllowed, "for", type);
    if(!limitAllowed && usageLimitExceededCallback) {
      console.log('Calling exceeded callback', type);
      usageLimitExceededCallback(type);
      setExceededLimits(prev => {
        const filtered = prev.filter((l) => l !== type);
        return [...filtered, type];
      });
    }
    return limitAllowed;
  }, [api]);

  return (
    <UsageContext.Provider value={{ checkUsage, exceededLimits }}>
      {children}
    </UsageContext.Provider>
  );
}

export function useUsage() {
  const context = React.useContext(UsageContext);
  if (!context) {
    throw "useUsage must be used within a UsageProvider";
  }
  return context;
}