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
import { DUMMY_BASE_URL, assertParamExists, setApiKeyToObject, setSearchParams, serializeDataIfNeeded, toPathString, createRequestFunction } from "../common.js";
// @ts-ignore
import { BASE_PATH, BaseAPI, operationServerMap } from "../base.js";
// @ts-ignore

// @ts-ignore

// @ts-ignore

// @ts-ignore

// @ts-ignore

// @ts-ignore

/**
 * ToolApi - axios parameter creator
 * @export
 */
export const ToolApiAxiosParamCreator = function (configuration) {
  return {
    /**
     * Create a tool definition
     * @summary Create a tool definition
     * @param {CreateToolDefinitionRequest} createToolDefinitionRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createToolDefinition: async (createToolDefinitionRequest, options = {}) => {
      // verify required parameter 'createToolDefinitionRequest' is not null or undefined
      assertParamExists('createToolDefinition', 'createToolDefinitionRequest', createToolDefinitionRequest);
      const localVarPath = `/v1/tool`;
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
      localVarHeaderParameter['Content-Type'] = 'application/json';
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers
      };
      localVarRequestOptions.data = serializeDataIfNeeded(createToolDefinitionRequest, localVarRequestOptions, configuration);
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * Delete a tool definition
     * @summary Delete a tool definition
     * @param {string} tool 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteToolDefinition: async (tool, options = {}) => {
      // verify required parameter 'tool' is not null or undefined
      assertParamExists('deleteToolDefinition', 'tool', tool);
      const localVarPath = `/v1/tool/{tool}`.replace(`{${"tool"}}`, encodeURIComponent(String(tool)));
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
     * Get a tool call result
     * @summary Get a tool call result
     * @param {string} call 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getToolCallResult: async (call, options = {}) => {
      // verify required parameter 'call' is not null or undefined
      assertParamExists('getToolCallResult', 'call', call);
      const localVarPath = `/v1/tool/call/{call}/result`.replace(`{${"call"}}`, encodeURIComponent(String(call)));
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
     * Get a tool definition
     * @summary Get a tool definition
     * @param {string} tool 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getToolDefinition: async (tool, options = {}) => {
      // verify required parameter 'tool' is not null or undefined
      assertParamExists('getToolDefinition', 'tool', tool);
      const localVarPath = `/v1/tool/{tool}`.replace(`{${"tool"}}`, encodeURIComponent(String(tool)));
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
     * List tools
     * @summary List tools
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listToolDefinitions: async (options = {}) => {
      const localVarPath = `/v1/tool/list`;
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
     * Update a tool definition
     * @summary Update a tool definition
     * @param {string} tool 
     * @param {CreateToolDefinitionRequest} createToolDefinitionRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateToolDefinition: async (tool, createToolDefinitionRequest, options = {}) => {
      // verify required parameter 'tool' is not null or undefined
      assertParamExists('updateToolDefinition', 'tool', tool);
      // verify required parameter 'createToolDefinitionRequest' is not null or undefined
      assertParamExists('updateToolDefinition', 'createToolDefinitionRequest', createToolDefinitionRequest);
      const localVarPath = `/v1/tool/{tool}`.replace(`{${"tool"}}`, encodeURIComponent(String(tool)));
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
      localVarHeaderParameter['Content-Type'] = 'application/json';
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers
      };
      localVarRequestOptions.data = serializeDataIfNeeded(createToolDefinitionRequest, localVarRequestOptions, configuration);
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    }
  };
};

/**
 * ToolApi - functional programming interface
 * @export
 */
export const ToolApiFp = function (configuration) {
  const localVarAxiosParamCreator = ToolApiAxiosParamCreator(configuration);
  return {
    /**
     * Create a tool definition
     * @summary Create a tool definition
     * @param {CreateToolDefinitionRequest} createToolDefinitionRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createToolDefinition(createToolDefinitionRequest, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.createToolDefinition(createToolDefinitionRequest, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap['ToolApi.createToolDefinition']?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * Delete a tool definition
     * @summary Delete a tool definition
     * @param {string} tool 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteToolDefinition(tool, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.deleteToolDefinition(tool, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap['ToolApi.deleteToolDefinition']?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * Get a tool call result
     * @summary Get a tool call result
     * @param {string} call 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getToolCallResult(call, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getToolCallResult(call, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap['ToolApi.getToolCallResult']?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * Get a tool definition
     * @summary Get a tool definition
     * @param {string} tool 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getToolDefinition(tool, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getToolDefinition(tool, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap['ToolApi.getToolDefinition']?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * List tools
     * @summary List tools
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listToolDefinitions(options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.listToolDefinitions(options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap['ToolApi.listToolDefinitions']?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * Update a tool definition
     * @summary Update a tool definition
     * @param {string} tool 
     * @param {CreateToolDefinitionRequest} createToolDefinitionRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateToolDefinition(tool, createToolDefinitionRequest, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.updateToolDefinition(tool, createToolDefinitionRequest, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap['ToolApi.updateToolDefinition']?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    }
  };
};

/**
 * ToolApi - factory interface
 * @export
 */
export const ToolApiFactory = function (configuration, basePath, axios) {
  const localVarFp = ToolApiFp(configuration);
  return {
    /**
     * Create a tool definition
     * @summary Create a tool definition
     * @param {CreateToolDefinitionRequest} createToolDefinitionRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createToolDefinition(createToolDefinitionRequest, options) {
      return localVarFp.createToolDefinition(createToolDefinitionRequest, options).then(request => request(axios, basePath));
    },
    /**
     * Delete a tool definition
     * @summary Delete a tool definition
     * @param {string} tool 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteToolDefinition(tool, options) {
      return localVarFp.deleteToolDefinition(tool, options).then(request => request(axios, basePath));
    },
    /**
     * Get a tool call result
     * @summary Get a tool call result
     * @param {string} call 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getToolCallResult(call, options) {
      return localVarFp.getToolCallResult(call, options).then(request => request(axios, basePath));
    },
    /**
     * Get a tool definition
     * @summary Get a tool definition
     * @param {string} tool 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getToolDefinition(tool, options) {
      return localVarFp.getToolDefinition(tool, options).then(request => request(axios, basePath));
    },
    /**
     * List tools
     * @summary List tools
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listToolDefinitions(options) {
      return localVarFp.listToolDefinitions(options).then(request => request(axios, basePath));
    },
    /**
     * Update a tool definition
     * @summary Update a tool definition
     * @param {string} tool 
     * @param {CreateToolDefinitionRequest} createToolDefinitionRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateToolDefinition(tool, createToolDefinitionRequest, options) {
      return localVarFp.updateToolDefinition(tool, createToolDefinitionRequest, options).then(request => request(axios, basePath));
    }
  };
};

/**
 * ToolApi - object-oriented interface
 * @export
 * @class ToolApi
 * @extends {BaseAPI}
 */
export class ToolApi extends BaseAPI {
  /**
   * Create a tool definition
   * @summary Create a tool definition
   * @param {CreateToolDefinitionRequest} createToolDefinitionRequest 
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ToolApi
   */
  createToolDefinition(createToolDefinitionRequest, options) {
    return ToolApiFp(this.configuration).createToolDefinition(createToolDefinitionRequest, options).then(request => request(this.axios, this.basePath));
  }

  /**
   * Delete a tool definition
   * @summary Delete a tool definition
   * @param {string} tool 
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ToolApi
   */
  deleteToolDefinition(tool, options) {
    return ToolApiFp(this.configuration).deleteToolDefinition(tool, options).then(request => request(this.axios, this.basePath));
  }

  /**
   * Get a tool call result
   * @summary Get a tool call result
   * @param {string} call 
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ToolApi
   */
  getToolCallResult(call, options) {
    return ToolApiFp(this.configuration).getToolCallResult(call, options).then(request => request(this.axios, this.basePath));
  }

  /**
   * Get a tool definition
   * @summary Get a tool definition
   * @param {string} tool 
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ToolApi
   */
  getToolDefinition(tool, options) {
    return ToolApiFp(this.configuration).getToolDefinition(tool, options).then(request => request(this.axios, this.basePath));
  }

  /**
   * List tools
   * @summary List tools
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ToolApi
   */
  listToolDefinitions(options) {
    return ToolApiFp(this.configuration).listToolDefinitions(options).then(request => request(this.axios, this.basePath));
  }

  /**
   * Update a tool definition
   * @summary Update a tool definition
   * @param {string} tool 
   * @param {CreateToolDefinitionRequest} createToolDefinitionRequest 
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ToolApi
   */
  updateToolDefinition(tool, createToolDefinitionRequest, options) {
    return ToolApiFp(this.configuration).updateToolDefinition(tool, createToolDefinitionRequest, options).then(request => request(this.axios, this.basePath));
  }
}
//# sourceMappingURL=tool-api.js.map