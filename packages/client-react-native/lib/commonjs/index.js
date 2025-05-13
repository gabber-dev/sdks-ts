"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  RealtimeSessionEngineProvider: true,
  useRealtimeSessionEngine: true,
  ApiProvider: true,
  useApi: true
};
Object.defineProperty(exports, "ApiProvider", {
  enumerable: true,
  get: function () {
    return _api2.ApiProvider;
  }
});
Object.defineProperty(exports, "RealtimeSessionEngineProvider", {
  enumerable: true,
  get: function () {
    return _realtime_session_engine.RealtimeSessionEngineProvider;
  }
});
Object.defineProperty(exports, "useApi", {
  enumerable: true,
  get: function () {
    return _api2.useApi;
  }
});
Object.defineProperty(exports, "useRealtimeSessionEngine", {
  enumerable: true,
  get: function () {
    return _realtime_session_engine.useRealtimeSessionEngine;
  }
});
var _api = require("./lib/api.js");
Object.keys(_api).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _api[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _api[key];
    }
  });
});
var _realtime_session_engine = require("./providers/realtime_session_engine.js");
var _api2 = require("./providers/api.js");
//# sourceMappingURL=index.js.map