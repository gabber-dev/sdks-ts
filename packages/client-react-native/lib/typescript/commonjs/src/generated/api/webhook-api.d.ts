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
import type { WebhookMessage } from '../model';
/**
 * WebhookApi - axios parameter creator
 * @export
 */
export declare const WebhookApiAxiosParamCreator: (configuration?: Configuration) => {
    /**
     * Receives events from the server.
     * @summary Webhook
     * @param {string} xWebhookSignature Hex string of HMAC-SHA256 signature of the request body signed using your configured service key
     * @param {WebhookMessage} webhookMessage
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    webhookPost: (xWebhookSignature: string, webhookMessage: WebhookMessage, options?: RawAxiosRequestConfig) => Promise<RequestArgs>;
};
/**
 * WebhookApi - functional programming interface
 * @export
 */
export declare const WebhookApiFp: (configuration?: Configuration) => {
    /**
     * Receives events from the server.
     * @summary Webhook
     * @param {string} xWebhookSignature Hex string of HMAC-SHA256 signature of the request body signed using your configured service key
     * @param {WebhookMessage} webhookMessage
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    webhookPost(xWebhookSignature: string, webhookMessage: WebhookMessage, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>>;
};
/**
 * WebhookApi - factory interface
 * @export
 */
export declare const WebhookApiFactory: (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) => {
    /**
     * Receives events from the server.
     * @summary Webhook
     * @param {string} xWebhookSignature Hex string of HMAC-SHA256 signature of the request body signed using your configured service key
     * @param {WebhookMessage} webhookMessage
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    webhookPost(xWebhookSignature: string, webhookMessage: WebhookMessage, options?: RawAxiosRequestConfig): AxiosPromise<void>;
};
/**
 * WebhookApi - object-oriented interface
 * @export
 * @class WebhookApi
 * @extends {BaseAPI}
 */
export declare class WebhookApi extends BaseAPI {
    /**
     * Receives events from the server.
     * @summary Webhook
     * @param {string} xWebhookSignature Hex string of HMAC-SHA256 signature of the request body signed using your configured service key
     * @param {WebhookMessage} webhookMessage
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof WebhookApi
     */
    webhookPost(xWebhookSignature: string, webhookMessage: WebhookMessage, options?: RawAxiosRequestConfig): Promise<import("axios").AxiosResponse<void, any>>;
}
//# sourceMappingURL=webhook-api.d.ts.map