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
 * Pricing details for a voice
 * @export
 * @interface VoicePricing
 */
export interface VoicePricing {
    /**
     * Price per second for using this voice
     * @type {string}
     * @memberof VoicePricing
     */
    'price_per_second': string;
    /**
     * Currency for the price (e.g., USD)
     * @type {string}
     * @memberof VoicePricing
     */
    'currency': string;
    /**
     * Name of the product in Stripe
     * @type {string}
     * @memberof VoicePricing
     */
    'product_name': string;
}

