"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  Api: true
};
exports.Api = void 0;
var _index = require("../generated/index.js");
var _index2 = require("../generated/model/index.js");
Object.keys(_index2).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _index2[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _index2[key];
    }
  });
});
class Api {
  constructor(token) {
    const config = new _index.Configuration({
      accessToken: token
    });
    this.realtime = new _index.RealtimeApi(config);
    this.persona = new _index.PersonaApi(config);
    this.voice = new _index.VoiceApi(config);
    this.scenario = new _index.ScenarioApi(config);
    this.llm = new _index.LLMApi(config);
    this.usage = new _index.UsageApi(config);
  }
}
exports.Api = Api;
//# sourceMappingURL=api.js.map