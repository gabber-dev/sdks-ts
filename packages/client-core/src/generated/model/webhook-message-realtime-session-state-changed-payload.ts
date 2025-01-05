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
import type { WebhookMessageRealtimeSessionStateChangedPayloadPreviousRealtimeSession } from './webhook-message-realtime-session-state-changed-payload-previous-realtime-session';

/**
 * 
 * @export
 * @interface WebhookMessageRealtimeSessionStateChangedPayload
 */
export interface WebhookMessageRealtimeSessionStateChangedPayload {
    /**
     * 
     * @type {WebhookMessageRealtimeSessionStateChangedPayloadPreviousRealtimeSession}
     * @memberof WebhookMessageRealtimeSessionStateChangedPayload
     */
    'previous_realtime_session'?: WebhookMessageRealtimeSessionStateChangedPayloadPreviousRealtimeSession;
    /**
     * 
     * @type {WebhookMessageRealtimeSessionStateChangedPayloadPreviousRealtimeSession}
     * @memberof WebhookMessageRealtimeSessionStateChangedPayload
     */
    'current_realtime_session'?: WebhookMessageRealtimeSessionStateChangedPayloadPreviousRealtimeSession;
}

