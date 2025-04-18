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
import type { ChatCompletionRequestSystemMessageContent } from './chat-completion-request-system-message-content';

/**
 * 
 * @export
 * @interface ChatCompletionRequestSystemMessage
 */
export interface ChatCompletionRequestSystemMessage {
    /**
     * 
     * @type {ChatCompletionRequestSystemMessageContent}
     * @memberof ChatCompletionRequestSystemMessage
     */
    'content': ChatCompletionRequestSystemMessageContent;
    /**
     * The role of the messages author.
     * @type {string}
     * @memberof ChatCompletionRequestSystemMessage
     */
    'role': ChatCompletionRequestSystemMessageRoleEnum;
}

export const ChatCompletionRequestSystemMessageRoleEnum = {
    System: 'system'
} as const;

export type ChatCompletionRequestSystemMessageRoleEnum = typeof ChatCompletionRequestSystemMessageRoleEnum[keyof typeof ChatCompletionRequestSystemMessageRoleEnum];


