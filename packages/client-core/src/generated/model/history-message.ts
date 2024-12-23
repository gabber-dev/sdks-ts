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



/**
 * 
 * @export
 * @interface HistoryMessage
 */
export interface HistoryMessage {
    /**
     * 
     * @type {string}
     * @memberof HistoryMessage
     */
    'content': string;
    /**
     * 
     * @type {string}
     * @memberof HistoryMessage
     */
    'import_id'?: string;
    /**
     * 
     * @type {string}
     * @memberof HistoryMessage
     */
    'role': HistoryMessageRoleEnum;
}

export const HistoryMessageRoleEnum = {
    Assistant: 'assistant',
    System: 'system',
    User: 'user'
} as const;

export type HistoryMessageRoleEnum = typeof HistoryMessageRoleEnum[keyof typeof HistoryMessageRoleEnum];

