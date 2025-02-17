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
import type { Context } from './context';
// May contain unused imports in some cases
// @ts-ignore
import type { LLM } from './llm';
// May contain unused imports in some cases
// @ts-ignore
import type { Persona } from './persona';
// May contain unused imports in some cases
// @ts-ignore
import type { Scenario } from './scenario';
// May contain unused imports in some cases
// @ts-ignore
import type { ToolDefinition } from './tool-definition';
// May contain unused imports in some cases
// @ts-ignore
import type { Voice } from './voice';

/**
 * Configuration for the generative AI in the RealtimeSession.
 * @export
 * @interface RealtimeSessionGenerativeConfig
 */
export interface RealtimeSessionGenerativeConfig {
    /**
     * 
     * @type {LLM}
     * @memberof RealtimeSessionGenerativeConfig
     */
    'llm': LLM;
    /**
     * 
     * @type {Voice}
     * @memberof RealtimeSessionGenerativeConfig
     */
    'voice_override'?: Voice;
    /**
     * 
     * @type {Persona}
     * @memberof RealtimeSessionGenerativeConfig
     */
    'persona'?: Persona;
    /**
     * 
     * @type {Scenario}
     * @memberof RealtimeSessionGenerativeConfig
     */
    'scenario'?: Scenario;
    /**
     * 
     * @type {Context}
     * @memberof RealtimeSessionGenerativeConfig
     */
    'context': Context;
    /**
     * The tool definitions to use for the generative AI.
     * @type {Array<ToolDefinition>}
     * @memberof RealtimeSessionGenerativeConfig
     */
    'tool_definitions': Array<ToolDefinition>;
    /**
     * Extra configuration for the generative AI. Usually this is for internal purposes.
     * @type {object}
     * @memberof RealtimeSessionGenerativeConfig
     */
    '_extra'?: object;
}

