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
import type { ChatCompletionResponseGabberMessageDataData } from './chat-completion-response-gabber-message-data-data';

/**
 * 
 * @export
 * @interface ChatCompletionResponseGabberMessageData
 */
export interface ChatCompletionResponseGabberMessageData {
    /**
     * 
     * @type {number}
     * @memberof ChatCompletionResponseGabberMessageData
     */
    'message_index': number;
    /**
     * 
     * @type {number}
     * @memberof ChatCompletionResponseGabberMessageData
     */
    'content_index': number;
    /**
     * 
     * @type {string}
     * @memberof ChatCompletionResponseGabberMessageData
     */
    'type': ChatCompletionResponseGabberMessageDataTypeEnum;
    /**
     * 
     * @type {ChatCompletionResponseGabberMessageDataData}
     * @memberof ChatCompletionResponseGabberMessageData
     */
    'data': ChatCompletionResponseGabberMessageDataData;
}

export const ChatCompletionResponseGabberMessageDataTypeEnum = {
    AudioTranscript: 'audio_transcript'
} as const;

export type ChatCompletionResponseGabberMessageDataTypeEnum = typeof ChatCompletionResponseGabberMessageDataTypeEnum[keyof typeof ChatCompletionResponseGabberMessageDataTypeEnum];


