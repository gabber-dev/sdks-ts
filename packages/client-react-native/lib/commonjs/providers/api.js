"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ApiProvider = ApiProvider;
exports.useApi = useApi;
var _react = _interopRequireWildcard(require("react"));
var _gabberClientCore = require("gabber-client-core");
var _jsxRuntime = require("react/jsx-runtime");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const ApiContext = /*#__PURE__*/(0, _react.createContext)(undefined);
function ApiProvider({
  usageToken,
  children
}) {
  const api = (0, _react.useMemo)(() => new _gabberClientCore.Api(usageToken), [usageToken]);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(ApiContext.Provider, {
    value: {
      api
    },
    children: children
  });
}
function useApi() {
  const context = _react.default.useContext(ApiContext);
  if (!context) {
    throw new Error("useApi must be used within a ApiProvider");
  }
  return context;
}
//# sourceMappingURL=api.js.map