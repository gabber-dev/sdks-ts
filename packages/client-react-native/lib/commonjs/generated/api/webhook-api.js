"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WebhookApiFp = exports.WebhookApiFactory = exports.WebhookApiAxiosParamCreator = exports.WebhookApi = void 0;
var _axios = _interopRequireDefault(require("axios"));
var _common = require("../common.js");
var _base = require("../base.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/* tslint:disable */
/* eslint-disable */
/**
 * Gabber API Reference
 * The Gabber API is a set of APIs that allow you to interact with the Gabber platform.
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

// Some imports not used depending on template conditions
// @ts-ignore

// @ts-ignore

// @ts-ignore

/**
 * WebhookApi - axios parameter creator
 * @export
 */
const WebhookApiAxiosParamCreator = function (configuration) {
  return {
    /**
     * Receives events from the server.
     * @summary Webhook
     * @param {string} xWebhookSignature Hex string of HMAC-SHA256 signature of the request body signed using your configured service key
     * @param {WebhookMessage} webhookMessage 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    webhookPost: async (xWebhookSignature, webhookMessage, options = {}) => {
      // verify required parameter 'xWebhookSignature' is not null or undefined
      (0, _common.assertParamExists)('webhookPost', 'xWebhookSignature', xWebhookSignature);
      // verify required parameter 'webhookMessage' is not null or undefined
      (0, _common.assertParamExists)('webhookPost', 'webhookMessage', webhookMessage);
      const localVarPath = `/webhook`;
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, _common.DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = {
        method: 'POST',
        ...baseOptions,
        ...options
      };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      localVarHeaderParameter['Content-Type'] = 'application/json';
      if (xWebhookSignature != null) {
        localVarHeaderParameter['X-Webhook-Signature'] = String(xWebhookSignature);
      }
      (0, _common.setSearchParams)(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers
      };
      localVarRequestOptions.data = (0, _common.serializeDataIfNeeded)(webhookMessage, localVarRequestOptions, configuration);
      return {
        url: (0, _common.toPathString)(localVarUrlObj),
        options: localVarRequestOptions
      };
    }
  };
};

/**
 * WebhookApi - functional programming interface
 * @export
 */
exports.WebhookApiAxiosParamCreator = WebhookApiAxiosParamCreator;
const WebhookApiFp = function (configuration) {
  const localVarAxiosParamCreator = WebhookApiAxiosParamCreator(configuration);
  return {
    /**
     * Receives events from the server.
     * @summary Webhook
     * @param {string} xWebhookSignature Hex string of HMAC-SHA256 signature of the request body signed using your configured service key
     * @param {WebhookMessage} webhookMessage 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async webhookPost(xWebhookSignature, webhookMessage, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.webhookPost(xWebhookSignature, webhookMessage, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = _base.operationServerMap['WebhookApi.webhookPost']?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => (0, _common.createRequestFunction)(localVarAxiosArgs, _axios.default, _base.BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    }
  };
};

/**
 * WebhookApi - factory interface
 * @export
 */
exports.WebhookApiFp = WebhookApiFp;
const WebhookApiFactory = function (configuration, basePath, axios) {
  const localVarFp = WebhookApiFp(configuration);
  return {
    /**
     * Receives events from the server.
     * @summary Webhook
     * @param {string} xWebhookSignature Hex string of HMAC-SHA256 signature of the request body signed using your configured service key
     * @param {WebhookMessage} webhookMessage 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    webhookPost(xWebhookSignature, webhookMessage, options) {
      return localVarFp.webhookPost(xWebhookSignature, webhookMessage, options).then(request => request(axios, basePath));
    }
  };
};

/**
 * WebhookApi - object-oriented interface
 * @export
 * @class WebhookApi
 * @extends {BaseAPI}
 */
exports.WebhookApiFactory = WebhookApiFactory;
class WebhookApi extends _base.BaseAPI {
  /**
   * Receives events from the server.
   * @summary Webhook
   * @param {string} xWebhookSignature Hex string of HMAC-SHA256 signature of the request body signed using your configured service key
   * @param {WebhookMessage} webhookMessage 
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof WebhookApi
   */
  webhookPost(xWebhookSignature, webhookMessage, options) {
    return WebhookApiFp(this.configuration).webhookPost(xWebhookSignature, webhookMessage, options).then(request => request(this.axios, this.basePath));
  }
}
exports.WebhookApi = WebhookApi;
//# sourceMappingURL=webhook-api.js.map