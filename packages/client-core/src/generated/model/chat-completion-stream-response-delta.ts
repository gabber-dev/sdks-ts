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
import type { ChatCompletionStreamResponseDeltaGabber } from './chat-completion-stream-response-delta-gabber';

/**
 * A chat completion delta generated by streamed model responses.
 * @export
 * @interface ChatCompletionStreamResponseDelta
 */
export interface ChatCompletionStreamResponseDelta {
    /**
     * The contents of the chunk message.
     * @type {string}
     * @memberof ChatCompletionStreamResponseDelta
     */
    'content'?: string;
    /**
     * The role of the author of this message.
     * @type {string}
     * @memberof ChatCompletionStreamResponseDelta
     */
    'role'?: ChatCompletionStreamResponseDeltaRoleEnum;
    /**
     * The refusal message generated by the model.
     * @type {string}
     * @memberof ChatCompletionStreamResponseDelta
     */
    'refusal'?: string;
    /**
     * 
     * @type {ChatCompletionStreamResponseDeltaGabber}
     * @memberof ChatCompletionStreamResponseDelta
     */
    'gabber'?: ChatCompletionStreamResponseDeltaGabber;
}

export const ChatCompletionStreamResponseDeltaRoleEnum = {
    System: 'system',
    User: 'user',
    Assistant: 'assistant'
} as const;

export type ChatCompletionStreamResponseDeltaRoleEnum = typeof ChatCompletionStreamResponseDeltaRoleEnum[keyof typeof ChatCompletionStreamResponseDeltaRoleEnum];


