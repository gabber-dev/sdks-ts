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
import type { ChatCompletionRequest } from '../model';
// @ts-ignore
import type { ChatCompletionResponse } from '../model';
// @ts-ignore
import type { ChatCompletionStreamResponse } from '../model';
/**
 * InferenceApi - axios parameter creator
 * @export
 */
export const InferenceApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Given messages, generates LLM output text and optionally speech
         * @summary Chat Completions (+ Voice)
         * @param {ChatCompletionRequest} chatCompletionRequest 
         * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        chatCompletions: async (chatCompletionRequest: ChatCompletionRequest, xHumanId?: string, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'chatCompletionRequest' is not null or undefined
            assertParamExists('chatCompletions', 'chatCompletionRequest', chatCompletionRequest)
            const localVarPath = `/v1/chat/completions`;
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

            // authentication BearerAuth required
            // http bearer authentication required
            await setBearerAuthToObject(localVarHeaderParameter, configuration)

            if (xHumanId != null) {
                localVarHeaderParameter['x-human-id'] = String(xHumanId);
            }


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(chatCompletionRequest, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * InferenceApi - functional programming interface
 * @export
 */
export const InferenceApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = InferenceApiAxiosParamCreator(configuration)
    return {
        /**
         * Given messages, generates LLM output text and optionally speech
         * @summary Chat Completions (+ Voice)
         * @param {ChatCompletionRequest} chatCompletionRequest 
         * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async chatCompletions(chatCompletionRequest: ChatCompletionRequest, xHumanId?: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<ChatCompletionResponse>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.chatCompletions(chatCompletionRequest, xHumanId, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['InferenceApi.chatCompletions']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
    }
};

/**
 * InferenceApi - factory interface
 * @export
 */
export const InferenceApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = InferenceApiFp(configuration)
    return {
        /**
         * Given messages, generates LLM output text and optionally speech
         * @summary Chat Completions (+ Voice)
         * @param {ChatCompletionRequest} chatCompletionRequest 
         * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        chatCompletions(chatCompletionRequest: ChatCompletionRequest, xHumanId?: string, options?: RawAxiosRequestConfig): AxiosPromise<ChatCompletionResponse> {
            return localVarFp.chatCompletions(chatCompletionRequest, xHumanId, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * InferenceApi - object-oriented interface
 * @export
 * @class InferenceApi
 * @extends {BaseAPI}
 */
export class InferenceApi extends BaseAPI {
    /**
     * Given messages, generates LLM output text and optionally speech
     * @summary Chat Completions (+ Voice)
     * @param {ChatCompletionRequest} chatCompletionRequest 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InferenceApi
     */
    public chatCompletions(chatCompletionRequest: ChatCompletionRequest, xHumanId?: string, options?: RawAxiosRequestConfig) {
        return InferenceApiFp(this.configuration).chatCompletions(chatCompletionRequest, xHumanId, options).then((request) => request(this.axios, this.basePath));
    }
}

