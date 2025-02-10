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


// May contain unused imports in some cases
// @ts-ignore
import type { WebhookMessageToolCallsFinishedPayload } from './webhook-message-tool-calls-finished-payload';

/**
 * 
 * @export
 * @interface WebhookMessageToolCallsFinished
 */
export interface WebhookMessageToolCallsFinished {
    /**
     * 
     * @type {string}
     * @memberof WebhookMessageToolCallsFinished
     */
    'type': WebhookMessageToolCallsFinishedTypeEnum;
    /**
     * 
     * @type {WebhookMessageToolCallsFinishedPayload}
     * @memberof WebhookMessageToolCallsFinished
     */
    'payload': WebhookMessageToolCallsFinishedPayload;
}

export const WebhookMessageToolCallsFinishedTypeEnum = {
    ToolCallsFinished: 'tool.calls_finished'
} as const;

export type WebhookMessageToolCallsFinishedTypeEnum = typeof WebhookMessageToolCallsFinishedTypeEnum[keyof typeof WebhookMessageToolCallsFinishedTypeEnum];


