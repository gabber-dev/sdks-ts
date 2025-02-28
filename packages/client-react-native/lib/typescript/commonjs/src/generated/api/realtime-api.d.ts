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
import { type RequestArgs, BaseAPI } from '../base';
import type { AttachHumanRequest } from '../model';
import type { GetRealtimeSessionMessages200Response } from '../model';
import type { GetRealtimeSessionTimeline200Response } from '../model';
import type { ListRealtimeSessions200Response } from '../model';
import type { RealtimeSession } from '../model';
import type { RealtimeSessionConfigUpdate } from '../model';
import type { RealtimeSessionDTMFRequest } from '../model';
import type { RealtimeSessionInitiateOutboundCallRequest } from '../model';
import type { RealtimeSessionStartResponse } from '../model';
import type { SpeakRequest } from '../model';
import type { StartRealtimeSessionRequest } from '../model';
/**
 * RealtimeApi - axios parameter creator
 * @export
 */
export declare const RealtimeApiAxiosParamCreator: (configuration?: Configuration) => {
    /**
     * Attaches a human to a RealtimeSession. This is useful for previously anonymous sessions, for example sessions created via a phone call.
     * @summary Attach a human to a RealtimeSession
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {AttachHumanRequest} attachHumanRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    attachHuman: (session: string, attachHumanRequest: AttachHumanRequest, options?: RawAxiosRequestConfig) => Promise<RequestArgs>;
    /**
     * For a live session, force agent to send DTMF tones
     * @summary DTMF
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {RealtimeSessionDTMFRequest} realtimeSessionDTMFRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    dtmf: (session: string, realtimeSessionDTMFRequest: RealtimeSessionDTMFRequest, options?: RawAxiosRequestConfig) => Promise<RequestArgs>;
    /**
     * End the RealtimeSession with the given identifier.
     * @summary End a RealtimeSession.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    endRealtimeSession: (session: string, xHumanId?: string, options?: RawAxiosRequestConfig) => Promise<RequestArgs>;
    /**
     * End the RealtimeSession with the given identifier.
     * @summary Get a RealtimeSession.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getRealtimeSession: (session: string, xHumanId?: string, options?: RawAxiosRequestConfig) => Promise<RequestArgs>;
    /**
     * Get all ContextMessages associated with the given RealtimeSession.
     * @summary Get a RealtimeSession messages.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getRealtimeSessionMessages: (session: string, xHumanId?: string, options?: RawAxiosRequestConfig) => Promise<RequestArgs>;
    /**
     * Get the timeline of the RealtimeSession with the given identifier.
     * @summary Get a RealtimeSession timeline.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getRealtimeSessionTimeline: (session: string, xHumanId?: string, options?: RawAxiosRequestConfig) => Promise<RequestArgs>;
    /**
     * Initiate an outbound call from a RealtimeSession.
     * @summary Initiate an outbound call.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {RealtimeSessionInitiateOutboundCallRequest} realtimeSessionInitiateOutboundCallRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    initiateOutboundCall: (session: string, realtimeSessionInitiateOutboundCallRequest: RealtimeSessionInitiateOutboundCallRequest, options?: RawAxiosRequestConfig) => Promise<RequestArgs>;
    /**
     * List all Realtime Sessions.
     * @summary List Realtime Sessions.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listRealtimeSessions: (xHumanId?: string, options?: RawAxiosRequestConfig) => Promise<RequestArgs>;
    /**
     * For a live session, force the agent to speak a given text.
     * @summary Speak
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {SpeakRequest} speakRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    speak: (session: string, speakRequest: SpeakRequest, options?: RawAxiosRequestConfig) => Promise<RequestArgs>;
    /**
     * Start a new RealtimeSession with the given configuration.
     * @summary Start a new RealtimeSession.
     * @param {StartRealtimeSessionRequest} startRealtimeSessionRequest
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    startRealtimeSession: (startRealtimeSessionRequest: StartRealtimeSessionRequest, xHumanId?: string, options?: RawAxiosRequestConfig) => Promise<RequestArgs>;
    /**
     * Update the RealtimeSession with the given identifier.
     * @summary Update a RealtimeSession.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {RealtimeSessionConfigUpdate} realtimeSessionConfigUpdate
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateRealtimeSession: (session: string, realtimeSessionConfigUpdate: RealtimeSessionConfigUpdate, xHumanId?: string, options?: RawAxiosRequestConfig) => Promise<RequestArgs>;
};
/**
 * RealtimeApi - functional programming interface
 * @export
 */
export declare const RealtimeApiFp: (configuration?: Configuration) => {
    /**
     * Attaches a human to a RealtimeSession. This is useful for previously anonymous sessions, for example sessions created via a phone call.
     * @summary Attach a human to a RealtimeSession
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {AttachHumanRequest} attachHumanRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    attachHuman(session: string, attachHumanRequest: AttachHumanRequest, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<RealtimeSession>>;
    /**
     * For a live session, force agent to send DTMF tones
     * @summary DTMF
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {RealtimeSessionDTMFRequest} realtimeSessionDTMFRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    dtmf(session: string, realtimeSessionDTMFRequest: RealtimeSessionDTMFRequest, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>>;
    /**
     * End the RealtimeSession with the given identifier.
     * @summary End a RealtimeSession.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    endRealtimeSession(session: string, xHumanId?: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<RealtimeSession>>;
    /**
     * End the RealtimeSession with the given identifier.
     * @summary Get a RealtimeSession.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getRealtimeSession(session: string, xHumanId?: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<RealtimeSession>>;
    /**
     * Get all ContextMessages associated with the given RealtimeSession.
     * @summary Get a RealtimeSession messages.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getRealtimeSessionMessages(session: string, xHumanId?: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<GetRealtimeSessionMessages200Response>>;
    /**
     * Get the timeline of the RealtimeSession with the given identifier.
     * @summary Get a RealtimeSession timeline.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getRealtimeSessionTimeline(session: string, xHumanId?: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<GetRealtimeSessionTimeline200Response>>;
    /**
     * Initiate an outbound call from a RealtimeSession.
     * @summary Initiate an outbound call.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {RealtimeSessionInitiateOutboundCallRequest} realtimeSessionInitiateOutboundCallRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    initiateOutboundCall(session: string, realtimeSessionInitiateOutboundCallRequest: RealtimeSessionInitiateOutboundCallRequest, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<RealtimeSession>>;
    /**
     * List all Realtime Sessions.
     * @summary List Realtime Sessions.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listRealtimeSessions(xHumanId?: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<ListRealtimeSessions200Response>>;
    /**
     * For a live session, force the agent to speak a given text.
     * @summary Speak
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {SpeakRequest} speakRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    speak(session: string, speakRequest: SpeakRequest, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<RealtimeSession>>;
    /**
     * Start a new RealtimeSession with the given configuration.
     * @summary Start a new RealtimeSession.
     * @param {StartRealtimeSessionRequest} startRealtimeSessionRequest
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    startRealtimeSession(startRealtimeSessionRequest: StartRealtimeSessionRequest, xHumanId?: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<RealtimeSessionStartResponse>>;
    /**
     * Update the RealtimeSession with the given identifier.
     * @summary Update a RealtimeSession.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {RealtimeSessionConfigUpdate} realtimeSessionConfigUpdate
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateRealtimeSession(session: string, realtimeSessionConfigUpdate: RealtimeSessionConfigUpdate, xHumanId?: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<RealtimeSession>>;
};
/**
 * RealtimeApi - factory interface
 * @export
 */
export declare const RealtimeApiFactory: (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) => {
    /**
     * Attaches a human to a RealtimeSession. This is useful for previously anonymous sessions, for example sessions created via a phone call.
     * @summary Attach a human to a RealtimeSession
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {AttachHumanRequest} attachHumanRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    attachHuman(session: string, attachHumanRequest: AttachHumanRequest, options?: RawAxiosRequestConfig): AxiosPromise<RealtimeSession>;
    /**
     * For a live session, force agent to send DTMF tones
     * @summary DTMF
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {RealtimeSessionDTMFRequest} realtimeSessionDTMFRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    dtmf(session: string, realtimeSessionDTMFRequest: RealtimeSessionDTMFRequest, options?: RawAxiosRequestConfig): AxiosPromise<void>;
    /**
     * End the RealtimeSession with the given identifier.
     * @summary End a RealtimeSession.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    endRealtimeSession(session: string, xHumanId?: string, options?: RawAxiosRequestConfig): AxiosPromise<RealtimeSession>;
    /**
     * End the RealtimeSession with the given identifier.
     * @summary Get a RealtimeSession.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getRealtimeSession(session: string, xHumanId?: string, options?: RawAxiosRequestConfig): AxiosPromise<RealtimeSession>;
    /**
     * Get all ContextMessages associated with the given RealtimeSession.
     * @summary Get a RealtimeSession messages.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getRealtimeSessionMessages(session: string, xHumanId?: string, options?: RawAxiosRequestConfig): AxiosPromise<GetRealtimeSessionMessages200Response>;
    /**
     * Get the timeline of the RealtimeSession with the given identifier.
     * @summary Get a RealtimeSession timeline.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getRealtimeSessionTimeline(session: string, xHumanId?: string, options?: RawAxiosRequestConfig): AxiosPromise<GetRealtimeSessionTimeline200Response>;
    /**
     * Initiate an outbound call from a RealtimeSession.
     * @summary Initiate an outbound call.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {RealtimeSessionInitiateOutboundCallRequest} realtimeSessionInitiateOutboundCallRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    initiateOutboundCall(session: string, realtimeSessionInitiateOutboundCallRequest: RealtimeSessionInitiateOutboundCallRequest, options?: RawAxiosRequestConfig): AxiosPromise<RealtimeSession>;
    /**
     * List all Realtime Sessions.
     * @summary List Realtime Sessions.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listRealtimeSessions(xHumanId?: string, options?: RawAxiosRequestConfig): AxiosPromise<ListRealtimeSessions200Response>;
    /**
     * For a live session, force the agent to speak a given text.
     * @summary Speak
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {SpeakRequest} speakRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    speak(session: string, speakRequest: SpeakRequest, options?: RawAxiosRequestConfig): AxiosPromise<RealtimeSession>;
    /**
     * Start a new RealtimeSession with the given configuration.
     * @summary Start a new RealtimeSession.
     * @param {StartRealtimeSessionRequest} startRealtimeSessionRequest
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    startRealtimeSession(startRealtimeSessionRequest: StartRealtimeSessionRequest, xHumanId?: string, options?: RawAxiosRequestConfig): AxiosPromise<RealtimeSessionStartResponse>;
    /**
     * Update the RealtimeSession with the given identifier.
     * @summary Update a RealtimeSession.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {RealtimeSessionConfigUpdate} realtimeSessionConfigUpdate
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateRealtimeSession(session: string, realtimeSessionConfigUpdate: RealtimeSessionConfigUpdate, xHumanId?: string, options?: RawAxiosRequestConfig): AxiosPromise<RealtimeSession>;
};
/**
 * RealtimeApi - object-oriented interface
 * @export
 * @class RealtimeApi
 * @extends {BaseAPI}
 */
export declare class RealtimeApi extends BaseAPI {
    /**
     * Attaches a human to a RealtimeSession. This is useful for previously anonymous sessions, for example sessions created via a phone call.
     * @summary Attach a human to a RealtimeSession
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {AttachHumanRequest} attachHumanRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RealtimeApi
     */
    attachHuman(session: string, attachHumanRequest: AttachHumanRequest, options?: RawAxiosRequestConfig): Promise<import("axios").AxiosResponse<RealtimeSession, any>>;
    /**
     * For a live session, force agent to send DTMF tones
     * @summary DTMF
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {RealtimeSessionDTMFRequest} realtimeSessionDTMFRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RealtimeApi
     */
    dtmf(session: string, realtimeSessionDTMFRequest: RealtimeSessionDTMFRequest, options?: RawAxiosRequestConfig): Promise<import("axios").AxiosResponse<void, any>>;
    /**
     * End the RealtimeSession with the given identifier.
     * @summary End a RealtimeSession.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RealtimeApi
     */
    endRealtimeSession(session: string, xHumanId?: string, options?: RawAxiosRequestConfig): Promise<import("axios").AxiosResponse<RealtimeSession, any>>;
    /**
     * End the RealtimeSession with the given identifier.
     * @summary Get a RealtimeSession.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RealtimeApi
     */
    getRealtimeSession(session: string, xHumanId?: string, options?: RawAxiosRequestConfig): Promise<import("axios").AxiosResponse<RealtimeSession, any>>;
    /**
     * Get all ContextMessages associated with the given RealtimeSession.
     * @summary Get a RealtimeSession messages.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RealtimeApi
     */
    getRealtimeSessionMessages(session: string, xHumanId?: string, options?: RawAxiosRequestConfig): Promise<import("axios").AxiosResponse<GetRealtimeSessionMessages200Response, any>>;
    /**
     * Get the timeline of the RealtimeSession with the given identifier.
     * @summary Get a RealtimeSession timeline.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RealtimeApi
     */
    getRealtimeSessionTimeline(session: string, xHumanId?: string, options?: RawAxiosRequestConfig): Promise<import("axios").AxiosResponse<GetRealtimeSessionTimeline200Response, any>>;
    /**
     * Initiate an outbound call from a RealtimeSession.
     * @summary Initiate an outbound call.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {RealtimeSessionInitiateOutboundCallRequest} realtimeSessionInitiateOutboundCallRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RealtimeApi
     */
    initiateOutboundCall(session: string, realtimeSessionInitiateOutboundCallRequest: RealtimeSessionInitiateOutboundCallRequest, options?: RawAxiosRequestConfig): Promise<import("axios").AxiosResponse<RealtimeSession, any>>;
    /**
     * List all Realtime Sessions.
     * @summary List Realtime Sessions.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RealtimeApi
     */
    listRealtimeSessions(xHumanId?: string, options?: RawAxiosRequestConfig): Promise<import("axios").AxiosResponse<ListRealtimeSessions200Response, any>>;
    /**
     * For a live session, force the agent to speak a given text.
     * @summary Speak
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {SpeakRequest} speakRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RealtimeApi
     */
    speak(session: string, speakRequest: SpeakRequest, options?: RawAxiosRequestConfig): Promise<import("axios").AxiosResponse<RealtimeSession, any>>;
    /**
     * Start a new RealtimeSession with the given configuration.
     * @summary Start a new RealtimeSession.
     * @param {StartRealtimeSessionRequest} startRealtimeSessionRequest
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RealtimeApi
     */
    startRealtimeSession(startRealtimeSessionRequest: StartRealtimeSessionRequest, xHumanId?: string, options?: RawAxiosRequestConfig): Promise<import("axios").AxiosResponse<RealtimeSessionStartResponse, any>>;
    /**
     * Update the RealtimeSession with the given identifier.
     * @summary Update a RealtimeSession.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {RealtimeSessionConfigUpdate} realtimeSessionConfigUpdate
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RealtimeApi
     */
    updateRealtimeSession(session: string, realtimeSessionConfigUpdate: RealtimeSessionConfigUpdate, xHumanId?: string, options?: RawAxiosRequestConfig): Promise<import("axios").AxiosResponse<RealtimeSession, any>>;
}
//# sourceMappingURL=realtime-api.d.ts.map