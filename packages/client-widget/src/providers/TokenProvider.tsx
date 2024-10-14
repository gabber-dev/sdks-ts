import React, { createContext, useEffect } from "react";

type TokenContextData = {
  token: string | null;
};

const TokenContext = createContext<TokenContextData | undefined>(
  undefined
);

type Props = {
  children: React.ReactNode;
  tokenGenerator?: () => Promise<string>;
};

export function TokenProvider({
  children,
  tokenGenerator
}: Props) {
  const [token, setToken] = React.useState<string | null>(null);

  useEffect(() => {
    if(tokenGenerator) {
      tokenGenerator().then(setToken).catch(console.error);
    }
  }, [tokenGenerator]);

  return (
    <TokenContext.Provider value={{ token }}>
      {children}
    </TokenContext.Provider>
  );
}

export function useToken() {
  const context = React.useContext(TokenContext);
  if (!context) {
    throw "useToken must be used within a TokenProvider";
  }
  return context;
}