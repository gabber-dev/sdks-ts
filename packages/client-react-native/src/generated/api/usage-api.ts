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


import type { Configuration } from '../configuration';
import type { AxiosPromise, AxiosInstance, RawAxiosRequestConfig } from 'axios';
import globalAxios from 'axios';
// Some imports not used depending on template conditions
// @ts-ignore
import { DUMMY_BASE_URL, assertParamExists, setApiKeyToObject, setBasicAuthToObject, setBearerAuthToObject, setOAuthToObject, setSearchParams, serializeDataIfNeeded, toPathString, createRequestFunction } from '../common';
// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS, type RequestArgs, BaseAPI, RequiredError, operationServerMap } from '../base';
// @ts-ignore
import type { BadRequest } from '../model';
// @ts-ignore
import type { CreateUsageToken200Response } from '../model';
// @ts-ignore
import type { UpdateUsageLimitsRequest } from '../model';
// @ts-ignore
import type { UsageLimitsInner } from '../model';
// @ts-ignore
import type { UsageTokenRequest } from '../model';
/**
 * UsageApi - axios parameter creator
 * @export
 */
export const UsageApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Requests a token for a human
         * @summary Create a new usage token
         * @param {UsageTokenRequest} usageTokenRequest 
         * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createUsageToken: async (usageTokenRequest: UsageTokenRequest, xHumanId?: string, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'usageTokenRequest' is not null or undefined
            assertParamExists('createUsageToken', 'usageTokenRequest', usageTokenRequest)
            const localVarPath = `/v1/usage/token`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication ApiKeyAuth required
            await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration)


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            if (xHumanId != null) {
                localVarHeaderParameter['x-human-id'] = String(xHumanId);
            }
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(usageTokenRequest, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Gets the usage limits of a token
         * @summary Get usage limits
         * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getUsageLimits: async (xHumanId?: string, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/v1/usage/limits`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication ApiKeyAuth required
            await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration)

            // authentication BearerAuth required
            // http bearer authentication required
            await setBearerAuthToObject(localVarHeaderParameter, configuration)


    
            if (xHumanId != null) {
                localVarHeaderParameter['x-human-id'] = String(xHumanId);
            }
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Updates the usage limits of a human
         * @summary Update limits on a usage token
         * @param {UpdateUsageLimitsRequest} updateUsageLimitsRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        updateUsageToken: async (updateUsageLimitsRequest: UpdateUsageLimitsRequest, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'updateUsageLimitsRequest' is not null or undefined
            assertParamExists('updateUsageToken', 'updateUsageLimitsRequest', updateUsageLimitsRequest)
            const localVarPath = `/v1/usage/token`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'PUT', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication ApiKeyAuth required
            await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration)


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(updateUsageLimitsRequest, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * UsageApi - functional programming interface
 * @export
 */
export const UsageApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = UsageApiAxiosParamCreator(configuration)
    return {
        /**
         * Requests a token for a human
         * @summary Create a new usage token
         * @param {UsageTokenRequest} usageTokenRequest 
         * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async createUsageToken(usageTokenRequest: UsageTokenRequest, xHumanId?: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<CreateUsageToken200Response>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.createUsageToken(usageTokenRequest, xHumanId, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['UsageApi.createUsageToken']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        /**
         * Gets the usage limits of a token
         * @summary Get usage limits
         * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getUsageLimits(xHumanId?: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Array<UsageLimitsInner>>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getUsageLimits(xHumanId, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['UsageApi.getUsageLimits']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        /**
         * Updates the usage limits of a human
         * @summary Update limits on a usage token
         * @param {UpdateUsageLimitsRequest} updateUsageLimitsRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async updateUsageToken(updateUsageLimitsRequest: UpdateUsageLimitsRequest, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<{ [key: string]: any; }>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.updateUsageToken(updateUsageLimitsRequest, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['UsageApi.updateUsageToken']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
    }
};

/**
 * UsageApi - factory interface
 * @export
 */
export const UsageApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = UsageApiFp(configuration)
    return {
        /**
         * Requests a token for a human
         * @summary Create a new usage token
         * @param {UsageTokenRequest} usageTokenRequest 
         * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createUsageToken(usageTokenRequest: UsageTokenRequest, xHumanId?: string, options?: RawAxiosRequestConfig): AxiosPromise<CreateUsageToken200Response> {
            return localVarFp.createUsageToken(usageTokenRequest, xHumanId, options).then((request) => request(axios, basePath));
        },
        /**
         * Gets the usage limits of a token
         * @summary Get usage limits
         * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getUsageLimits(xHumanId?: string, options?: RawAxiosRequestConfig): AxiosPromise<Array<UsageLimitsInner>> {
            return localVarFp.getUsageLimits(xHumanId, options).then((request) => request(axios, basePath));
        },
        /**
         * Updates the usage limits of a human
         * @summary Update limits on a usage token
         * @param {UpdateUsageLimitsRequest} updateUsageLimitsRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        updateUsageToken(updateUsageLimitsRequest: UpdateUsageLimitsRequest, options?: RawAxiosRequestConfig): AxiosPromise<{ [key: string]: any; }> {
            return localVarFp.updateUsageToken(updateUsageLimitsRequest, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * UsageApi - object-oriented interface
 * @export
 * @class UsageApi
 * @extends {BaseAPI}
 */
export class UsageApi extends BaseAPI {
    /**
     * Requests a token for a human
     * @summary Create a new usage token
     * @param {UsageTokenRequest} usageTokenRequest 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsageApi
     */
    public createUsageToken(usageTokenRequest: UsageTokenRequest, xHumanId?: string, options?: RawAxiosRequestConfig) {
        return UsageApiFp(this.configuration).createUsageToken(usageTokenRequest, xHumanId, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Gets the usage limits of a token
     * @summary Get usage limits
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsageApi
     */
    public getUsageLimits(xHumanId?: string, options?: RawAxiosRequestConfig) {
        return UsageApiFp(this.configuration).getUsageLimits(xHumanId, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Updates the usage limits of a human
     * @summary Update limits on a usage token
     * @param {UpdateUsageLimitsRequest} updateUsageLimitsRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsageApi
     */
    public updateUsageToken(updateUsageLimitsRequest: UpdateUsageLimitsRequest, options?: RawAxiosRequestConfig) {
        return UsageApiFp(this.configuration).updateUsageToken(updateUsageLimitsRequest, options).then((request) => request(this.axios, this.basePath));
    }
}

