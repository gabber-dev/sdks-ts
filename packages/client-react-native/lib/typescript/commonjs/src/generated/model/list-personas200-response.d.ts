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
import type { Persona } from './persona';
/**
 *
 * @export
 * @interface ListPersonas200Response
 */
export interface ListPersonas200Response {
    /**
     * The token for the next page of results, or null if there are no more pages.
     * @type {string}
     * @memberof ListPersonas200Response
     */
    'next_page': string;
    /**
     * The total number of items available.
     * @type {number}
     * @memberof ListPersonas200Response
     */
    'total_count': number;
    /**
     * The array of personas.
     * @type {Array<Persona>}
     * @memberof ListPersonas200Response
     */
    'values': Array<Persona>;
}
//# sourceMappingURL=list-personas200-response.d.ts.map