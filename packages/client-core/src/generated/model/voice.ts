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
 * @interface Voice
 */
export interface Voice {
    /**
     * 
     * @type {string}
     * @memberof Voice
     */
    'created_at': string;
    /**
     * 
     * @type {string}
     * @memberof Voice
     */
    'id': string;
    /**
     * 
     * @type {string}
     * @memberof Voice
     */
    'name': string;
    /**
     * 
     * @type {string}
     * @memberof Voice
     */
    'language': string;
    /**
     * 
     * @type {string}
     * @memberof Voice
     */
    'service'?: string;
    /**
     * 
     * @type {string}
     * @memberof Voice
     */
    'model'?: string;
    /**
     * 
     * @type {string}
     * @memberof Voice
     */
    'voice'?: string;
    /**
     * 
     * @type {Array<number>}
     * @memberof Voice
     */
    'embeddings'?: Array<number>;
    /**
     * 
     * @type {string}
     * @memberof Voice
     */
    'cartesia_voice_id'?: string;
    /**
     * 
     * @type {string}
     * @memberof Voice
     */
    'elevenlabs_voice_id'?: string;
    /**
     * 
     * @type {string}
     * @memberof Voice
     */
    'project'?: string;
    /**
     * 
     * @type {string}
     * @memberof Voice
     */
    'human'?: string;
    /**
     * 
     * @type {string}
     * @memberof Voice
     */
    'preview_url'?: string;
    /**
     * Extra configuration for the voice. Usually this is for internal purposes.
     * @type {{ [key: string]: any; }}
     * @memberof Voice
     */
    '_extra'?: { [key: string]: any; };
}

