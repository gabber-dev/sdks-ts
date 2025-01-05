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
import type { ChatCompletionResponseMessageGabber } from './chat-completion-response-message-gabber';

/**
 * A chat completion message generated by the model.
 * @export
 * @interface ChatCompletionResponseMessage
 */
export interface ChatCompletionResponseMessage {
    /**
     * The contents of the message.
     * @type {string}
     * @memberof ChatCompletionResponseMessage
     */
    'content': string;
    /**
     * The refusal message generated by the model.
     * @type {string}
     * @memberof ChatCompletionResponseMessage
     */
    'refusal': string;
    /**
     * The role of the author of this message.
     * @type {string}
     * @memberof ChatCompletionResponseMessage
     */
    'role': ChatCompletionResponseMessageRoleEnum;
    /**
     * 
     * @type {ChatCompletionResponseMessageGabber}
     * @memberof ChatCompletionResponseMessage
     */
    'gabber'?: ChatCompletionResponseMessageGabber;
}

export const ChatCompletionResponseMessageRoleEnum = {
    Assistant: 'assistant'
} as const;

export type ChatCompletionResponseMessageRoleEnum = typeof ChatCompletionResponseMessageRoleEnum[keyof typeof ChatCompletionResponseMessageRoleEnum];


