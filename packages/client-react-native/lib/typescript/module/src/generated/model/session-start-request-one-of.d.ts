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
import type { HistoryMessage } from './history-message';
/**
 *
 * @export
 * @interface SessionStartRequestOneOf
 */
export interface SessionStartRequestOneOf {
    /**
     *
     * @type {Array<HistoryMessage>}
     * @memberof SessionStartRequestOneOf
     */
    'history'?: Array<HistoryMessage>;
    /**
     *
     * @type {number}
     * @memberof SessionStartRequestOneOf
     */
    'time_limit_s'?: number;
    /**
     *
     * @type {string}
     * @memberof SessionStartRequestOneOf
     */
    'voice_override'?: string;
    /**
     *
     * @type {string}
     * @memberof SessionStartRequestOneOf
     */
    'llm'?: string;
    /**
     *
     * @type {string}
     * @memberof SessionStartRequestOneOf
     */
    'persona'?: string;
    /**
     * save session messages
     * @type {boolean}
     * @memberof SessionStartRequestOneOf
     */
    'save_messages'?: boolean;
    /**
     * reserved for internal use
     * @type {object}
     * @memberof SessionStartRequestOneOf
     */
    '_extra'?: object;
}
//# sourceMappingURL=session-start-request-one-of.d.ts.map