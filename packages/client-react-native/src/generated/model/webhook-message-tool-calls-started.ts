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
import type { WebhookMessageToolCallsStartedPayload } from './webhook-message-tool-calls-started-payload';

/**
 * 
 * @export
 * @interface WebhookMessageToolCallsStarted
 */
export interface WebhookMessageToolCallsStarted {
    /**
     * 
     * @type {string}
     * @memberof WebhookMessageToolCallsStarted
     */
    'type': WebhookMessageToolCallsStartedTypeEnum;
    /**
     * 
     * @type {WebhookMessageToolCallsStartedPayload}
     * @memberof WebhookMessageToolCallsStarted
     */
    'payload': WebhookMessageToolCallsStartedPayload;
}

export const WebhookMessageToolCallsStartedTypeEnum = {
    ToolCallsStarted: 'tool.calls_started'
} as const;

export type WebhookMessageToolCallsStartedTypeEnum = typeof WebhookMessageToolCallsStartedTypeEnum[keyof typeof WebhookMessageToolCallsStartedTypeEnum];


