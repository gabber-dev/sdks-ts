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
import type { RealtimeSessionGeneralConfig } from './realtime-session-general-config';
import type { RealtimeSessionGenerativeConfig } from './realtime-session-generative-config';
import type { RealtimeSessionInputConfig } from './realtime-session-input-config';
import type { RealtimeSessionOutputConfig } from './realtime-session-output-config';
/**
 *
 * @export
 * @interface RealtimeSessionConfig
 */
export interface RealtimeSessionConfig {
    /**
     *
     * @type {RealtimeSessionGeneralConfig}
     * @memberof RealtimeSessionConfig
     */
    'general': RealtimeSessionGeneralConfig;
    /**
     *
     * @type {RealtimeSessionInputConfig}
     * @memberof RealtimeSessionConfig
     */
    'input': RealtimeSessionInputConfig;
    /**
     *
     * @type {RealtimeSessionGenerativeConfig}
     * @memberof RealtimeSessionConfig
     */
    'generative': RealtimeSessionGenerativeConfig;
    /**
     *
     * @type {RealtimeSessionOutputConfig}
     * @memberof RealtimeSessionConfig
     */
    'output': RealtimeSessionOutputConfig;
}
//# sourceMappingURL=realtime-session-config.d.ts.map