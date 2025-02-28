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
 * @interface ChatCompletionRequestMessageContentPartAudioInputAudio
 */
export interface ChatCompletionRequestMessageContentPartAudioInputAudio {
    /**
     * Base64 encoded audio data.
     * @type {string}
     * @memberof ChatCompletionRequestMessageContentPartAudioInputAudio
     */
    'data': string;
    /**
     * The format of the audio data.
     * @type {string}
     * @memberof ChatCompletionRequestMessageContentPartAudioInputAudio
     */
    'format': ChatCompletionRequestMessageContentPartAudioInputAudioFormatEnum;
}

export const ChatCompletionRequestMessageContentPartAudioInputAudioFormatEnum = {
    Wav: 'wav',
    Mp3: 'mp3',
    Ogg: 'ogg'
} as const;

export type ChatCompletionRequestMessageContentPartAudioInputAudioFormatEnum = typeof ChatCompletionRequestMessageContentPartAudioInputAudioFormatEnum[keyof typeof ChatCompletionRequestMessageContentPartAudioInputAudioFormatEnum];


