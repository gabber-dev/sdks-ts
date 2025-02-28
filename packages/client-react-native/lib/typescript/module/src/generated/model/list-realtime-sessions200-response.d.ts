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
import type { RealtimeSession } from './realtime-session';
/**
 *
 * @export
 * @interface ListRealtimeSessions200Response
 */
export interface ListRealtimeSessions200Response {
    /**
     * The URL to the next page of items.
     * @type {string}
     * @memberof ListRealtimeSessions200Response
     */
    'next_page'?: string;
    /**
     * The total number of items.
     * @type {number}
     * @memberof ListRealtimeSessions200Response
     */
    'total_count': number;
    /**
     * The list of items.
     * @type {Array<RealtimeSession>}
     * @memberof ListRealtimeSessions200Response
     */
    'values': Array<RealtimeSession>;
}
//# sourceMappingURL=list-realtime-sessions200-response.d.ts.map