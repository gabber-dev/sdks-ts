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
import type { TTSWebsocketRequestMessagePayload } from './ttswebsocket-request-message-payload';
// May contain unused imports in some cases
// @ts-ignore
import type { TTSWebsocketRequestMessageType } from './ttswebsocket-request-message-type';

/**
 * 
 * @export
 * @interface TTSWebsocketRequestMessage
 */
export interface TTSWebsocketRequestMessage {
    /**
     * 
     * @type {TTSWebsocketRequestMessageType}
     * @memberof TTSWebsocketRequestMessage
     */
    'type': TTSWebsocketRequestMessageType;
    /**
     * The session ID for the TTS session.
     * @type {string}
     * @memberof TTSWebsocketRequestMessage
     */
    'session': string;
    /**
     * 
     * @type {TTSWebsocketRequestMessagePayload}
     * @memberof TTSWebsocketRequestMessage
     */
    'payload': TTSWebsocketRequestMessagePayload;
}



