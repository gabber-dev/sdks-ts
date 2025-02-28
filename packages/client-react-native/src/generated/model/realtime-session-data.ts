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
 * @interface RealtimeSessionData
 */
export interface RealtimeSessionData {
    /**
     * 
     * @type {string}
     * @memberof RealtimeSessionData
     */
    'type': RealtimeSessionDataTypeEnum;
    /**
     * 
     * @type {string}
     * @memberof RealtimeSessionData
     */
    'value': string;
}

export const RealtimeSessionDataTypeEnum = {
    CallerPhoneNumber: 'caller_phone_number',
    AgentPhoneNumber: 'agent_phone_number'
} as const;

export type RealtimeSessionDataTypeEnum = typeof RealtimeSessionDataTypeEnum[keyof typeof RealtimeSessionDataTypeEnum];


