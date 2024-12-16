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
 * Configuration for the generative AI in the RealtimeSession.
 * @export
 * @interface RealtimeSessionGenerativeConfigCreate
 */
export interface RealtimeSessionGenerativeConfigCreate {
    /**
     * The LLM to use for the RealtimeSession.
     * @type {string}
     * @memberof RealtimeSessionGenerativeConfigCreate
     */
    'llm': string;
    /**
     * The voice to use for the RealtimeSession.
     * @type {string}
     * @memberof RealtimeSessionGenerativeConfigCreate
     */
    'voice_override'?: string;
    /**
     * The persona to use for the RealtimeSession.
     * @type {string}
     * @memberof RealtimeSessionGenerativeConfigCreate
     */
    'persona'?: string;
    /**
     * The scenario to use for the RealtimeSession.
     * @type {string}
     * @memberof RealtimeSessionGenerativeConfigCreate
     */
    'scenario'?: string;
    /**
     * The context to use for the RealtimeSession. If unspecified, a new context will be created.
     * @type {string}
     * @memberof RealtimeSessionGenerativeConfigCreate
     */
    'context'?: string;
    /**
     * Extra configuration for the generative AI. Usually this is for internal purposes.
     * @type {{ [key: string]: any; }}
     * @memberof RealtimeSessionGenerativeConfigCreate
     */
    '_extra'?: { [key: string]: any; };
}

