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
import type { ChatCompletionRequestUserMessageContent } from './chat-completion-request-user-message-content';

/**
 * 
 * @export
 * @interface ChatCompletionRequestUserMessage
 */
export interface ChatCompletionRequestUserMessage {
    /**
     * 
     * @type {ChatCompletionRequestUserMessageContent}
     * @memberof ChatCompletionRequestUserMessage
     */
    'content': ChatCompletionRequestUserMessageContent;
    /**
     * The role of the messages author.
     * @type {string}
     * @memberof ChatCompletionRequestUserMessage
     */
    'role': ChatCompletionRequestUserMessageRoleEnum;
}

export const ChatCompletionRequestUserMessageRoleEnum = {
    User: 'user'
} as const;

export type ChatCompletionRequestUserMessageRoleEnum = typeof ChatCompletionRequestUserMessageRoleEnum[keyof typeof ChatCompletionRequestUserMessageRoleEnum];


