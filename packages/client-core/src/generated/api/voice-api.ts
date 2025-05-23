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
import type { DeleteVoice200Response } from '../model';
// @ts-ignore
import type { GenerateVoiceRequest } from '../model';
// @ts-ignore
import type { ListVoices200Response } from '../model';
// @ts-ignore
import type { UpdateVoiceRequest } from '../model';
// @ts-ignore
import type { Voice } from '../model';
/**
 * VoiceApi - axios parameter creator
 * @export
 */
export const VoiceApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Creates a new cloned voice based on the input audio file
         * @summary Clone a voice
         * @param {string} name Name of the new voice
         * @param {string} language Language of the voice (e.g., \\\&#39;en\\\&#39;, \\\&#39;es\\\&#39;, \\\&#39;fr\\\&#39;)
         * @param {File} file Audio file for voice cloning (MP3 format)
         * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        cloneVoice: async (name: string, language: string, file: File, xHumanId?: string, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'name' is not null or undefined
            assertParamExists('cloneVoice', 'name', name)
            // verify required parameter 'language' is not null or undefined
            assertParamExists('cloneVoice', 'language', language)
            // verify required parameter 'file' is not null or undefined
            assertParamExists('cloneVoice', 'file', file)
            const localVarPath = `/v1/voice/clone`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;
            const localVarFormParams = new ((configuration && configuration.formDataCtor) || FormData)();

            // authentication ApiKeyAuth required
            await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration)

            // authentication BearerAuth required
            // http bearer authentication required
            await setBearerAuthToObject(localVarHeaderParameter, configuration)

            if (xHumanId != null) {
                localVarHeaderParameter['x-human-id'] = String(xHumanId);
            }


            if (name !== undefined) { 
                localVarFormParams.append('name', name as any);
            }
    
            if (language !== undefined) { 
                localVarFormParams.append('language', language as any);
            }
    
            if (file !== undefined) { 
                localVarFormParams.append('file', file as any);
            }
    
    
            localVarHeaderParameter['Content-Type'] = 'multipart/form-data';
    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = localVarFormParams;

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @summary Delete a voice
         * @param {string} voiceId 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        deleteVoice: async (voiceId: string, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'voiceId' is not null or undefined
            assertParamExists('deleteVoice', 'voiceId', voiceId)
            const localVarPath = `/v1/voice/{voice_id}`
                .replace(`{${"voice_id"}}`, encodeURIComponent(String(voiceId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'DELETE', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication ApiKeyAuth required
            await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration)

            // authentication BearerAuth required
            // http bearer authentication required
            await setBearerAuthToObject(localVarHeaderParameter, configuration)


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Generates speech from input text and specified voice
         * @summary Generate voice
         * @param {GenerateVoiceRequest} generateVoiceRequest 
         * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        generateVoice: async (generateVoiceRequest: GenerateVoiceRequest, xHumanId?: string, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'generateVoiceRequest' is not null or undefined
            assertParamExists('generateVoice', 'generateVoiceRequest', generateVoiceRequest)
            const localVarPath = `/v1/voice/generate`;
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
            localVarRequestOptions.data = serializeDataIfNeeded(generateVoiceRequest, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @summary Get a voice
         * @param {string} voiceId 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getVoice: async (voiceId: string, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'voiceId' is not null or undefined
            assertParamExists('getVoice', 'voiceId', voiceId)
            const localVarPath = `/v1/voice/{voice_id}`
                .replace(`{${"voice_id"}}`, encodeURIComponent(String(voiceId)));
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


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @summary Get a list of voices
         * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
         * @param {Array<string>} [tags] Filter voices by tag names
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listVoices: async (xHumanId?: string, tags?: Array<string>, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/v1/voice/list`;
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

            if (tags) {
                localVarQueryParameter['tags'] = tags;
            }

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
         * Updates a voice based on the input request data
         * @summary Update a voice
         * @param {string} voiceId 
         * @param {UpdateVoiceRequest} updateVoiceRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        updateVoice: async (voiceId: string, updateVoiceRequest: UpdateVoiceRequest, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'voiceId' is not null or undefined
            assertParamExists('updateVoice', 'voiceId', voiceId)
            // verify required parameter 'updateVoiceRequest' is not null or undefined
            assertParamExists('updateVoice', 'updateVoiceRequest', updateVoiceRequest)
            const localVarPath = `/v1/voice/{voice_id}`
                .replace(`{${"voice_id"}}`, encodeURIComponent(String(voiceId)));
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

            // authentication BearerAuth required
            // http bearer authentication required
            await setBearerAuthToObject(localVarHeaderParameter, configuration)


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(updateVoiceRequest, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * VoiceApi - functional programming interface
 * @export
 */
export const VoiceApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = VoiceApiAxiosParamCreator(configuration)
    return {
        /**
         * Creates a new cloned voice based on the input audio file
         * @summary Clone a voice
         * @param {string} name Name of the new voice
         * @param {string} language Language of the voice (e.g., \\\&#39;en\\\&#39;, \\\&#39;es\\\&#39;, \\\&#39;fr\\\&#39;)
         * @param {File} file Audio file for voice cloning (MP3 format)
         * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async cloneVoice(name: string, language: string, file: File, xHumanId?: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Voice>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.cloneVoice(name, language, file, xHumanId, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['VoiceApi.cloneVoice']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        /**
         * 
         * @summary Delete a voice
         * @param {string} voiceId 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async deleteVoice(voiceId: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<DeleteVoice200Response>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.deleteVoice(voiceId, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['VoiceApi.deleteVoice']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        /**
         * Generates speech from input text and specified voice
         * @summary Generate voice
         * @param {GenerateVoiceRequest} generateVoiceRequest 
         * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async generateVoice(generateVoiceRequest: GenerateVoiceRequest, xHumanId?: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<File>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.generateVoice(generateVoiceRequest, xHumanId, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['VoiceApi.generateVoice']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        /**
         * 
         * @summary Get a voice
         * @param {string} voiceId 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getVoice(voiceId: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Voice>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getVoice(voiceId, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['VoiceApi.getVoice']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        /**
         * 
         * @summary Get a list of voices
         * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
         * @param {Array<string>} [tags] Filter voices by tag names
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async listVoices(xHumanId?: string, tags?: Array<string>, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<ListVoices200Response>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.listVoices(xHumanId, tags, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['VoiceApi.listVoices']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        /**
         * Updates a voice based on the input request data
         * @summary Update a voice
         * @param {string} voiceId 
         * @param {UpdateVoiceRequest} updateVoiceRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async updateVoice(voiceId: string, updateVoiceRequest: UpdateVoiceRequest, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Voice>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.updateVoice(voiceId, updateVoiceRequest, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['VoiceApi.updateVoice']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
    }
};

/**
 * VoiceApi - factory interface
 * @export
 */
export const VoiceApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = VoiceApiFp(configuration)
    return {
        /**
         * Creates a new cloned voice based on the input audio file
         * @summary Clone a voice
         * @param {string} name Name of the new voice
         * @param {string} language Language of the voice (e.g., \\\&#39;en\\\&#39;, \\\&#39;es\\\&#39;, \\\&#39;fr\\\&#39;)
         * @param {File} file Audio file for voice cloning (MP3 format)
         * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        cloneVoice(name: string, language: string, file: File, xHumanId?: string, options?: RawAxiosRequestConfig): AxiosPromise<Voice> {
            return localVarFp.cloneVoice(name, language, file, xHumanId, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary Delete a voice
         * @param {string} voiceId 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        deleteVoice(voiceId: string, options?: RawAxiosRequestConfig): AxiosPromise<DeleteVoice200Response> {
            return localVarFp.deleteVoice(voiceId, options).then((request) => request(axios, basePath));
        },
        /**
         * Generates speech from input text and specified voice
         * @summary Generate voice
         * @param {GenerateVoiceRequest} generateVoiceRequest 
         * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        generateVoice(generateVoiceRequest: GenerateVoiceRequest, xHumanId?: string, options?: RawAxiosRequestConfig): AxiosPromise<File> {
            return localVarFp.generateVoice(generateVoiceRequest, xHumanId, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary Get a voice
         * @param {string} voiceId 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getVoice(voiceId: string, options?: RawAxiosRequestConfig): AxiosPromise<Voice> {
            return localVarFp.getVoice(voiceId, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary Get a list of voices
         * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
         * @param {Array<string>} [tags] Filter voices by tag names
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listVoices(xHumanId?: string, tags?: Array<string>, options?: RawAxiosRequestConfig): AxiosPromise<ListVoices200Response> {
            return localVarFp.listVoices(xHumanId, tags, options).then((request) => request(axios, basePath));
        },
        /**
         * Updates a voice based on the input request data
         * @summary Update a voice
         * @param {string} voiceId 
         * @param {UpdateVoiceRequest} updateVoiceRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        updateVoice(voiceId: string, updateVoiceRequest: UpdateVoiceRequest, options?: RawAxiosRequestConfig): AxiosPromise<Voice> {
            return localVarFp.updateVoice(voiceId, updateVoiceRequest, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * VoiceApi - object-oriented interface
 * @export
 * @class VoiceApi
 * @extends {BaseAPI}
 */
export class VoiceApi extends BaseAPI {
    /**
     * Creates a new cloned voice based on the input audio file
     * @summary Clone a voice
     * @param {string} name Name of the new voice
     * @param {string} language Language of the voice (e.g., \\\&#39;en\\\&#39;, \\\&#39;es\\\&#39;, \\\&#39;fr\\\&#39;)
     * @param {File} file Audio file for voice cloning (MP3 format)
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VoiceApi
     */
    public cloneVoice(name: string, language: string, file: File, xHumanId?: string, options?: RawAxiosRequestConfig) {
        return VoiceApiFp(this.configuration).cloneVoice(name, language, file, xHumanId, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary Delete a voice
     * @param {string} voiceId 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VoiceApi
     */
    public deleteVoice(voiceId: string, options?: RawAxiosRequestConfig) {
        return VoiceApiFp(this.configuration).deleteVoice(voiceId, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Generates speech from input text and specified voice
     * @summary Generate voice
     * @param {GenerateVoiceRequest} generateVoiceRequest 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VoiceApi
     */
    public generateVoice(generateVoiceRequest: GenerateVoiceRequest, xHumanId?: string, options?: RawAxiosRequestConfig) {
        return VoiceApiFp(this.configuration).generateVoice(generateVoiceRequest, xHumanId, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary Get a voice
     * @param {string} voiceId 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VoiceApi
     */
    public getVoice(voiceId: string, options?: RawAxiosRequestConfig) {
        return VoiceApiFp(this.configuration).getVoice(voiceId, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary Get a list of voices
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {Array<string>} [tags] Filter voices by tag names
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VoiceApi
     */
    public listVoices(xHumanId?: string, tags?: Array<string>, options?: RawAxiosRequestConfig) {
        return VoiceApiFp(this.configuration).listVoices(xHumanId, tags, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Updates a voice based on the input request data
     * @summary Update a voice
     * @param {string} voiceId 
     * @param {UpdateVoiceRequest} updateVoiceRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VoiceApi
     */
    public updateVoice(voiceId: string, updateVoiceRequest: UpdateVoiceRequest, options?: RawAxiosRequestConfig) {
        return VoiceApiFp(this.configuration).updateVoice(voiceId, updateVoiceRequest, options).then((request) => request(this.axios, this.basePath));
    }
}

