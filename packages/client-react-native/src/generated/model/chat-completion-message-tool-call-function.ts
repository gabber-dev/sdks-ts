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
 * @interface ChatCompletionMessageToolCallFunction
 */
export interface ChatCompletionMessageToolCallFunction {
    /**
     * The name of the function to call.
     * @type {string}
     * @memberof ChatCompletionMessageToolCallFunction
     */
    'name': string;
    /**
     * The arguments to call the function with, as generated by the model in JSON format. Note that the model does not always generate valid JSON, and may hallucinate parameters not defined by your function schema. Validate the arguments in your code before calling your function.
     * @type {string}
     * @memberof ChatCompletionMessageToolCallFunction
     */
    'arguments': string;
}

