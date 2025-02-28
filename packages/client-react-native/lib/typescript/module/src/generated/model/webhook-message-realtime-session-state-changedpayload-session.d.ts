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
 * @interface WebhookMessageRealtimeSessionStateChangedpayloadSession
 */
export interface WebhookMessageRealtimeSessionStateChangedpayloadSession {
    /**
     *
     * @type {string}
     * @memberof WebhookMessageRealtimeSessionStateChangedpayloadSession
     */
    'id': string;
    /**
     *
     * @type {string}
     * @memberof WebhookMessageRealtimeSessionStateChangedpayloadSession
     */
    'state': WebhookMessageRealtimeSessionStateChangedpayloadSessionStateEnum;
}
export declare const WebhookMessageRealtimeSessionStateChangedpayloadSessionStateEnum: {
    readonly NotStarted: "not_started";
    readonly InProgress: "in_progress";
    readonly Ended: "ended";
};
export type WebhookMessageRealtimeSessionStateChangedpayloadSessionStateEnum = typeof WebhookMessageRealtimeSessionStateChangedpayloadSessionStateEnum[keyof typeof WebhookMessageRealtimeSessionStateChangedpayloadSessionStateEnum];
//# sourceMappingURL=webhook-message-realtime-session-state-changedpayload-session.d.ts.map