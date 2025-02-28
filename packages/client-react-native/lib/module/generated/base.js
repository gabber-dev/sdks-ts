"use strict";

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

// Some imports not used depending on template conditions
// @ts-ignore

import globalAxios from 'axios';
export const BASE_PATH = "https://api.gabber.dev".replace(/\/+$/, "");

/**
 *
 * @export
 */
export const COLLECTION_FORMATS = {
  csv: ",",
  ssv: " ",
  tsv: "\t",
  pipes: "|"
};

/**
 *
 * @export
 * @interface RequestArgs
 */

/**
 *
 * @export
 * @class BaseAPI
 */
export class BaseAPI {
  constructor(configuration, basePath = BASE_PATH, axios = globalAxios) {
    this.basePath = basePath;
    this.axios = axios;
    if (configuration) {
      this.configuration = configuration;
      this.basePath = configuration.basePath ?? basePath;
    }
  }
}
;

/**
 *
 * @export
 * @class RequiredError
 * @extends {Error}
 */
export class RequiredError extends Error {
  constructor(field, msg) {
    super(msg);
    this.field = field;
    this.name = "RequiredError";
  }
}
/**
 *
 * @export
 */
export const operationServerMap = {};
//# sourceMappingURL=base.js.map