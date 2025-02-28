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
import type { WebhookMessageUsageTrackedPayload } from './webhook-message-usage-tracked-payload';
/**
 *
 * @export
 * @interface WebhookMessageUsageTracked
 */
export interface WebhookMessageUsageTracked {
    /**
     *
     * @type {string}
     * @memberof WebhookMessageUsageTracked
     */
    'type': WebhookMessageUsageTrackedTypeEnum;
    /**
     *
     * @type {WebhookMessageUsageTrackedPayload}
     * @memberof WebhookMessageUsageTracked
     */
    'payload': WebhookMessageUsageTrackedPayload;
}
export declare const WebhookMessageUsageTrackedTypeEnum: {
    readonly UsageTracked: "usage.tracked";
};
export type WebhookMessageUsageTrackedTypeEnum = typeof WebhookMessageUsageTrackedTypeEnum[keyof typeof WebhookMessageUsageTrackedTypeEnum];
//# sourceMappingURL=webhook-message-usage-tracked.d.ts.map