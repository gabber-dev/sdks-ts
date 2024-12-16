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
import type { LLM } from './llm';

/**
 * 
 * @export
 * @interface ListLLMs200Response
 */
export interface ListLLMs200Response {
    /**
     * The token for the next page of results, or null if there are no more pages.
     * @type {string}
     * @memberof ListLLMs200Response
     */
    'next_page': string;
    /**
     * The total number of items available.
     * @type {number}
     * @memberof ListLLMs200Response
     */
    'total_count': number;
    /**
     * The array of voices.
     * @type {Array<LLM>}
     * @memberof ListLLMs200Response
     */
    'values': Array<LLM>;
}

