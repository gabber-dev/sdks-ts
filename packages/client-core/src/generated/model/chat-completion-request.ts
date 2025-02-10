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
import type { ChatCompletionRequestGabber } from './chat-completion-request-gabber';
// May contain unused imports in some cases
// @ts-ignore
import type { ChatCompletionRequestMessage } from './chat-completion-request-message';
// May contain unused imports in some cases
// @ts-ignore
import type { ChatCompletionTool } from './chat-completion-tool';
// May contain unused imports in some cases
// @ts-ignore
import type { ChatCompletionToolChoiceOption } from './chat-completion-tool-choice-option';

/**
 * 
 * @export
 * @interface ChatCompletionRequest
 */
export interface ChatCompletionRequest {
    /**
     * Chat context
     * @type {Array<ChatCompletionRequestMessage>}
     * @memberof ChatCompletionRequest
     */
    'messages': Array<ChatCompletionRequestMessage>;
    /**
     * Gabber llm_id
     * @type {string}
     * @memberof ChatCompletionRequest
     */
    'model': string;
    /**
     * 
     * @type {object}
     * @memberof ChatCompletionRequest
     */
    'metadata'?: object;
    /**
     * 
     * @type {ChatCompletionRequestGabber}
     * @memberof ChatCompletionRequest
     */
    'gabber'?: ChatCompletionRequestGabber;
    /**
     * If set, partial message deltas will be sent, like in ChatGPT. 
     * @type {boolean}
     * @memberof ChatCompletionRequest
     */
    'stream'?: boolean;
    /**
     * Temperature for sampling from the model. Higher values mean more randomness. 
     * @type {number}
     * @memberof ChatCompletionRequest
     */
    'temperature'?: number;
    /**
     * Maximum number of tokens to generate. Requests can be up to 4096 tokens. 
     * @type {number}
     * @memberof ChatCompletionRequest
     */
    'max_tokens'?: number;
    /**
     * List of tools to call during the completion. Each tool will be called in the order they are listed. 
     * @type {Array<ChatCompletionTool>}
     * @memberof ChatCompletionRequest
     */
    'tools'?: Array<ChatCompletionTool>;
    /**
     * 
     * @type {ChatCompletionToolChoiceOption}
     * @memberof ChatCompletionRequest
     */
    'tool_choice'?: ChatCompletionToolChoiceOption;
    /**
     * Whether to enable parallel function calling
     * @type {boolean}
     * @memberof ChatCompletionRequest
     */
    'parallel_tool_calls'?: boolean;
}

