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
 * @interface SessionMessage
 */
export interface SessionMessage {
    /**
     * 
     * @type {boolean}
     * @memberof SessionMessage
     */
    'agent': boolean;
    /**
     * 
     * @type {string}
     * @memberof SessionMessage
     */
    'created_at': string;
    /**
     * 
     * @type {string}
     * @memberof SessionMessage
     */
    'deleted_at'?: string;
    /**
     * 
     * @type {string}
     * @memberof SessionMessage
     */
    'id': string;
    /**
     * 
     * @type {string}
     * @memberof SessionMessage
     */
    'import_id': string | null;
    /**
     * 
     * @type {string}
     * @memberof SessionMessage
     */
    'media'?: string;
    /**
     * 
     * @type {string}
     * @memberof SessionMessage
     */
    'session': string;
    /**
     * 
     * @type {string}
     * @memberof SessionMessage
     */
    'speaking_ended_at': string;
    /**
     * 
     * @type {string}
     * @memberof SessionMessage
     */
    'text'?: string;
}

