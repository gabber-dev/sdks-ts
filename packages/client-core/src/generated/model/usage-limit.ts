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
import type { UsageType } from './usage-type';

/**
 * 
 * @export
 * @interface UsageLimit
 */
export interface UsageLimit {
    /**
     * 
     * @type {UsageType}
     * @memberof UsageLimit
     * @deprecated
     */
    'type': UsageType;
    /**
     * 
     * @type {number}
     * @memberof UsageLimit
     */
    'value': number;
}



