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
import type { ChatCompletionStreamResponseDeltaGabberVoice } from './chat-completion-stream-response-delta-gabber-voice';

/**
 * If the audio output modality is requested, this object contains data
 * @export
 * @interface ChatCompletionStreamResponseDeltaGabber
 */
export interface ChatCompletionStreamResponseDeltaGabber {
    /**
     * 
     * @type {ChatCompletionStreamResponseDeltaGabberVoice}
     * @memberof ChatCompletionStreamResponseDeltaGabber
     */
    'voice'?: ChatCompletionStreamResponseDeltaGabberVoice;
}

