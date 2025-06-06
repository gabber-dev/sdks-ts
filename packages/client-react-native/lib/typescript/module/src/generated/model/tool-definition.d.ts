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
import type { ToolDefinitionCallSettings } from './tool-definition-call-settings';
import type { ToolDefinitionParameter } from './tool-definition-parameter';
/**
 *
 * @export
 * @interface ToolDefinition
 */
export interface ToolDefinition {
    /**
     *
     * @type {string}
     * @memberof ToolDefinition
     */
    'id': string;
    /**
     *
     * @type {string}
     * @memberof ToolDefinition
     */
    'name': string;
    /**
     *
     * @type {string}
     * @memberof ToolDefinition
     */
    'description': string;
    /**
     *
     * @type {Array<ToolDefinitionParameter>}
     * @memberof ToolDefinition
     */
    'parameters': Array<ToolDefinitionParameter>;
    /**
     *
     * @type {ToolDefinitionCallSettings}
     * @memberof ToolDefinition
     */
    'call_settings': ToolDefinitionCallSettings;
}
//# sourceMappingURL=tool-definition.d.ts.map