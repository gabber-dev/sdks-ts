"use strict";

import { createContext, useMemo } from "react";
import React from "react";
import { Api } from "../lib/api.js";
import { jsx as _jsx } from "react/jsx-runtime";
const ApiContext = /*#__PURE__*/createContext(undefined);
export function ApiProvider({
  usageToken,
  children
}) {
  const api = useMemo(() => new Api(usageToken), [usageToken]);
  return /*#__PURE__*/_jsx(ApiContext.Provider, {
    value: {
      api
    },
    children: children
  });
}
export function useApi() {
  const context = React.useContext(ApiContext);
  if (!context) {
    throw new Error("useApi must be used within a ApiProvider");
  }
  return context;
}
//# sourceMappingURL=api.js.map