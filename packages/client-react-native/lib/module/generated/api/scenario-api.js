"use strict";

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

import globalAxios from 'axios';
// Some imports not used depending on template conditions
// @ts-ignore
import { DUMMY_BASE_URL, assertParamExists, setApiKeyToObject, setBearerAuthToObject, setSearchParams, serializeDataIfNeeded, toPathString, createRequestFunction } from "../common.js";
// @ts-ignore
import { BASE_PATH, BaseAPI, operationServerMap } from "../base.js";
// @ts-ignore

// @ts-ignore

// @ts-ignore

// @ts-ignore

// @ts-ignore

// @ts-ignore

/**
 * ScenarioApi - axios parameter creator
 * @export
 */
export const ScenarioApiAxiosParamCreator = function (configuration) {
  return {
    /**
     * 
     * @summary Create a scenario
     * @param {CreateScenarioRequest} createScenarioRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createScenario: async (createScenarioRequest, options = {}) => {
      // verify required parameter 'createScenarioRequest' is not null or undefined
      assertParamExists('createScenario', 'createScenarioRequest', createScenarioRequest);
      const localVarPath = `/v1/scenario`;
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
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

      // authentication ApiKeyAuth required
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);

      // authentication BearerAuth required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      localVarHeaderParameter['Content-Type'] = 'application/json';
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers
      };
      localVarRequestOptions.data = serializeDataIfNeeded(createScenarioRequest, localVarRequestOptions, configuration);
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * 
     * @summary Delete a scenario
     * @param {string} scenarioId 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteScenario: async (scenarioId, xHumanId, options = {}) => {
      // verify required parameter 'scenarioId' is not null or undefined
      assertParamExists('deleteScenario', 'scenarioId', scenarioId);
      const localVarPath = `/v1/scenario/{scenario_id}`.replace(`{${"scenario_id"}}`, encodeURIComponent(String(scenarioId)));
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = {
        method: 'DELETE',
        ...baseOptions,
        ...options
      };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};

      // authentication ApiKeyAuth required
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);

      // authentication BearerAuth required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      if (xHumanId != null) {
        localVarHeaderParameter['x-human-id'] = String(xHumanId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers
      };
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * 
     * @summary Get a scenario
     * @param {string} scenarioId 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getScenario: async (scenarioId, xHumanId, options = {}) => {
      // verify required parameter 'scenarioId' is not null or undefined
      assertParamExists('getScenario', 'scenarioId', scenarioId);
      const localVarPath = `/v1/scenario/{scenario_id}`.replace(`{${"scenario_id"}}`, encodeURIComponent(String(scenarioId)));
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = {
        method: 'GET',
        ...baseOptions,
        ...options
      };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};

      // authentication ApiKeyAuth required
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);

      // authentication BearerAuth required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      if (xHumanId != null) {
        localVarHeaderParameter['x-human-id'] = String(xHumanId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers
      };
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * 
     * @summary Get a list of scenarios
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listScenarios: async (xHumanId, options = {}) => {
      const localVarPath = `/v1/scenario/list`;
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = {
        method: 'GET',
        ...baseOptions,
        ...options
      };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};

      // authentication ApiKeyAuth required
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);

      // authentication BearerAuth required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      if (xHumanId != null) {
        localVarHeaderParameter['x-human-id'] = String(xHumanId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers
      };
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * 
     * @summary Update a scenario
     * @param {string} scenarioId 
     * @param {UpdateScenarioRequest} updateScenarioRequest 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateScenario: async (scenarioId, updateScenarioRequest, xHumanId, options = {}) => {
      // verify required parameter 'scenarioId' is not null or undefined
      assertParamExists('updateScenario', 'scenarioId', scenarioId);
      // verify required parameter 'updateScenarioRequest' is not null or undefined
      assertParamExists('updateScenario', 'updateScenarioRequest', updateScenarioRequest);
      const localVarPath = `/v1/scenario/{scenario_id}`.replace(`{${"scenario_id"}}`, encodeURIComponent(String(scenarioId)));
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = {
        method: 'PUT',
        ...baseOptions,
        ...options
      };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};

      // authentication ApiKeyAuth required
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);

      // authentication BearerAuth required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      localVarHeaderParameter['Content-Type'] = 'application/json';
      if (xHumanId != null) {
        localVarHeaderParameter['x-human-id'] = String(xHumanId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers
      };
      localVarRequestOptions.data = serializeDataIfNeeded(updateScenarioRequest, localVarRequestOptions, configuration);
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    }
  };
};

/**
 * ScenarioApi - functional programming interface
 * @export
 */
export const ScenarioApiFp = function (configuration) {
  const localVarAxiosParamCreator = ScenarioApiAxiosParamCreator(configuration);
  return {
    /**
     * 
     * @summary Create a scenario
     * @param {CreateScenarioRequest} createScenarioRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createScenario(createScenarioRequest, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.createScenario(createScenarioRequest, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap['ScenarioApi.createScenario']?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * 
     * @summary Delete a scenario
     * @param {string} scenarioId 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteScenario(scenarioId, xHumanId, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.deleteScenario(scenarioId, xHumanId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap['ScenarioApi.deleteScenario']?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * 
     * @summary Get a scenario
     * @param {string} scenarioId 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getScenario(scenarioId, xHumanId, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getScenario(scenarioId, xHumanId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap['ScenarioApi.getScenario']?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * 
     * @summary Get a list of scenarios
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listScenarios(xHumanId, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.listScenarios(xHumanId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap['ScenarioApi.listScenarios']?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * 
     * @summary Update a scenario
     * @param {string} scenarioId 
     * @param {UpdateScenarioRequest} updateScenarioRequest 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateScenario(scenarioId, updateScenarioRequest, xHumanId, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.updateScenario(scenarioId, updateScenarioRequest, xHumanId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap['ScenarioApi.updateScenario']?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    }
  };
};

/**
 * ScenarioApi - factory interface
 * @export
 */
export const ScenarioApiFactory = function (configuration, basePath, axios) {
  const localVarFp = ScenarioApiFp(configuration);
  return {
    /**
     * 
     * @summary Create a scenario
     * @param {CreateScenarioRequest} createScenarioRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createScenario(createScenarioRequest, options) {
      return localVarFp.createScenario(createScenarioRequest, options).then(request => request(axios, basePath));
    },
    /**
     * 
     * @summary Delete a scenario
     * @param {string} scenarioId 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteScenario(scenarioId, xHumanId, options) {
      return localVarFp.deleteScenario(scenarioId, xHumanId, options).then(request => request(axios, basePath));
    },
    /**
     * 
     * @summary Get a scenario
     * @param {string} scenarioId 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getScenario(scenarioId, xHumanId, options) {
      return localVarFp.getScenario(scenarioId, xHumanId, options).then(request => request(axios, basePath));
    },
    /**
     * 
     * @summary Get a list of scenarios
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listScenarios(xHumanId, options) {
      return localVarFp.listScenarios(xHumanId, options).then(request => request(axios, basePath));
    },
    /**
     * 
     * @summary Update a scenario
     * @param {string} scenarioId 
     * @param {UpdateScenarioRequest} updateScenarioRequest 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateScenario(scenarioId, updateScenarioRequest, xHumanId, options) {
      return localVarFp.updateScenario(scenarioId, updateScenarioRequest, xHumanId, options).then(request => request(axios, basePath));
    }
  };
};

/**
 * ScenarioApi - object-oriented interface
 * @export
 * @class ScenarioApi
 * @extends {BaseAPI}
 */
export class ScenarioApi extends BaseAPI {
  /**
   * 
   * @summary Create a scenario
   * @param {CreateScenarioRequest} createScenarioRequest 
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ScenarioApi
   */
  createScenario(createScenarioRequest, options) {
    return ScenarioApiFp(this.configuration).createScenario(createScenarioRequest, options).then(request => request(this.axios, this.basePath));
  }

  /**
   * 
   * @summary Delete a scenario
   * @param {string} scenarioId 
   * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ScenarioApi
   */
  deleteScenario(scenarioId, xHumanId, options) {
    return ScenarioApiFp(this.configuration).deleteScenario(scenarioId, xHumanId, options).then(request => request(this.axios, this.basePath));
  }

  /**
   * 
   * @summary Get a scenario
   * @param {string} scenarioId 
   * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ScenarioApi
   */
  getScenario(scenarioId, xHumanId, options) {
    return ScenarioApiFp(this.configuration).getScenario(scenarioId, xHumanId, options).then(request => request(this.axios, this.basePath));
  }

  /**
   * 
   * @summary Get a list of scenarios
   * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ScenarioApi
   */
  listScenarios(xHumanId, options) {
    return ScenarioApiFp(this.configuration).listScenarios(xHumanId, options).then(request => request(this.axios, this.basePath));
  }

  /**
   * 
   * @summary Update a scenario
   * @param {string} scenarioId 
   * @param {UpdateScenarioRequest} updateScenarioRequest 
   * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ScenarioApi
   */
  updateScenario(scenarioId, updateScenarioRequest, xHumanId, options) {
    return ScenarioApiFp(this.configuration).updateScenario(scenarioId, updateScenarioRequest, xHumanId, options).then(request => request(this.axios, this.basePath));
  }
}
//# sourceMappingURL=scenario-api.js.map