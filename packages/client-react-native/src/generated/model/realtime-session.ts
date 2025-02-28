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
import type { RealtimeSessionConfig } from './realtime-session-config';
// May contain unused imports in some cases
// @ts-ignore
import type { RealtimeSessionData } from './realtime-session-data';

/**
 * 
 * @export
 * @interface RealtimeSession
 */
export interface RealtimeSession {
    /**
     * The unique identifier of the RealtimeSession.
     * @type {string}
     * @memberof RealtimeSession
     */
    'id': string;
    /**
     * The current state of the RealtimeSession.
     * @type {string}
     * @memberof RealtimeSession
     */
    'state': RealtimeSessionStateEnum;
    /**
     * The time the RealtimeSession was created.
     * @type {string}
     * @memberof RealtimeSession
     */
    'created_at': string;
    /**
     * The time the RealtimeSession ended.
     * @type {string}
     * @memberof RealtimeSession
     */
    'ended_at'?: string;
    /**
     * The project identifier.
     * @type {string}
     * @memberof RealtimeSession
     */
    'project': string;
    /**
     * The human identifier.
     * @type {string}
     * @memberof RealtimeSession
     */
    'human'?: string;
    /**
     * Whether the session is simulated or not.
     * @type {boolean}
     * @memberof RealtimeSession
     */
    'simulated': boolean;
    /**
     * 
     * @type {RealtimeSessionConfig}
     * @memberof RealtimeSession
     */
    'config': RealtimeSessionConfig;
    /**
     * 
     * @type {Array<RealtimeSessionData>}
     * @memberof RealtimeSession
     */
    'data': Array<RealtimeSessionData>;
    /**
     * Extra configuration for the RealtimeSession. Usually this is for internal purposes.
     * @type {object}
     * @memberof RealtimeSession
     */
    '_extra'?: object;
}

export const RealtimeSessionStateEnum = {
    Ended: 'ended',
    InProgress: 'in_progress',
    NotStarted: 'not_started'
} as const;

export type RealtimeSessionStateEnum = typeof RealtimeSessionStateEnum[keyof typeof RealtimeSessionStateEnum];


