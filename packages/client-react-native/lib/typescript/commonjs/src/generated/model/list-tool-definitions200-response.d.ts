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
import type { ToolDefinition } from './tool-definition';
/**
 *
 * @export
 * @interface ListToolDefinitions200Response
 */
export interface ListToolDefinitions200Response {
    /**
     * The token for the next page of results, or null if there are no more pages.
     * @type {string}
     * @memberof ListToolDefinitions200Response
     */
    'next_page'?: string;
    /**
     * The total number of items available.
     * @type {number}
     * @memberof ListToolDefinitions200Response
     */
    'total_count': number;
    /**
     * The array of tools.
     * @type {Array<ToolDefinition>}
     * @memberof ListToolDefinitions200Response
     */
    'values': Array<ToolDefinition>;
}
//# sourceMappingURL=list-tool-definitions200-response.d.ts.map