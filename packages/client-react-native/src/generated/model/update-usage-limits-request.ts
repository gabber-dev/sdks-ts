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
import type { UsageLimitsInner } from './usage-limits-inner';

/**
 * 
 * @export
 * @interface UpdateUsageLimitsRequest
 */
export interface UpdateUsageLimitsRequest {
    /**
     * 
     * @type {Array<UsageLimitsInner>}
     * @memberof UpdateUsageLimitsRequest
     */
    'limits': Array<UsageLimitsInner>;
    /**
     * The ID of the human that the token is for. (this is typically your user id from your system)
     * @type {string}
     * @memberof UpdateUsageLimitsRequest
     */
    'human_id': string;
}

