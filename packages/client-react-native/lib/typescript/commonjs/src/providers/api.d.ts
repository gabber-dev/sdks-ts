import { Api } from "gabber-client-core";
import React from "react";
type ApiContextData = {
    api: Api;
};
type Props = {
    usageToken: string;
    children: React.ReactNode;
};
export declare function ApiProvider({ usageToken, children }: Props): import("react/jsx-runtime").JSX.Element;
export declare function useApi(): ApiContextData;
export {};
//# sourceMappingURL=api.d.ts.map