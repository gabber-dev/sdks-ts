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
import type { ContextMessageContent } from './context-message-content';
// May contain unused imports in some cases
// @ts-ignore
import type { ContextMessageToolCall } from './context-message-tool-call';

/**
 * 
 * @export
 * @interface ContextMessage
 */
export interface ContextMessage {
    /**
     * 
     * @type {string}
     * @memberof ContextMessage
     */
    'id': string;
    /**
     * 
     * @type {string}
     * @memberof ContextMessage
     */
    'speaking_ended_at'?: string;
    /**
     * 
     * @type {string}
     * @memberof ContextMessage
     */
    'speaking_started_at'?: string;
    /**
     * 
     * @type {string}
     * @memberof ContextMessage
     */
    'created_at': string;
    /**
     * 
     * @type {string}
     * @memberof ContextMessage
     */
    'role': ContextMessageRoleEnum;
    /**
     * 
     * @type {string}
     * @memberof ContextMessage
     */
    'realtime_session'?: string;
    /**
     * 
     * @type {Array<ContextMessageContent>}
     * @memberof ContextMessage
     */
    'content': Array<ContextMessageContent>;
    /**
     * 
     * @type {Array<ContextMessageToolCall>}
     * @memberof ContextMessage
     */
    'tool_calls'?: Array<ContextMessageToolCall>;
}

export const ContextMessageRoleEnum = {
    Assistant: 'assistant',
    System: 'system',
    User: 'user',
    Tool: 'tool'
} as const;

export type ContextMessageRoleEnum = typeof ContextMessageRoleEnum[keyof typeof ContextMessageRoleEnum];


