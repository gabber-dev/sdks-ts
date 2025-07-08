import { EventEmitter } from 'eventemitter3';
import { Room, createLocalVideoTrack, Track, ParticipantKind, createAudioAnalyser } from 'livekit-client';
import globalAxios7 from 'axios';

var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/v2/types.ts
var types_exports = {};
__export(types_exports, {
  PadType: () => PadType,
  deriveDataType: () => deriveDataType,
  isSinkPad: () => isSinkPad,
  isSourcePad: () => isSourcePad
});
function isSourcePad(padType) {
  return padType.indexOf("Source") !== -1;
}
function isSinkPad(padType) {
  return padType.indexOf("Sink") !== -1;
}
function deriveDataType(allowedTypes, padId) {
  if (padId) {
    const padIdLower = padId.toLowerCase();
    if (padIdLower.includes("audio")) {
      return "audio";
    } else if (padIdLower.includes("video")) {
      return "video";
    } else if (padId.endsWith("_trigger")) {
      return "trigger";
    }
  }
  if (allowedTypes && allowedTypes.length > 0) {
    const firstType = allowedTypes[0];
    const typeName = firstType.type;
    switch (typeName) {
      case "audio_clip":
      case "audio_frame":
      case "audio":
        return "audio";
      case "video_clip":
      case "video_frame":
      case "video":
        return "video";
      case "string":
      case "text":
        return "text";
      case "bool":
      case "boolean":
        return "boolean";
      case "int":
      case "integer":
        return "integer";
      case "float":
      case "number":
        return "number";
      case "trigger":
        return "trigger";
      case "context_message":
        return "data";
      default:
        return "data";
    }
  }
  return "data";
}
var PadType;
var init_types = __esm({
  "src/v2/types.ts"() {
    PadType = {
      Audio: "audio",
      Video: "video",
      Data: "data",
      Trigger: "trigger",
      Text: "text",
      Boolean: "boolean",
      Integer: "integer",
      Number: "number"
    };
  }
});

// src/v2/StreamPad.ts
var StreamPad_exports = {};
__export(StreamPad_exports, {
  StreamPad: () => StreamPad
});
var StreamPad;
var init_StreamPad = __esm({
  "src/v2/StreamPad.ts"() {
    init_types();
    StreamPad = class extends EventEmitter {
      /**
       * Creates a new StreamPad instance.
       * @param {PadConfig} config - Configuration object for the pad
       */
      constructor(config) {
        super();
        this._value = null;
        this.currentStream = null;
        this.isConnected = false;
        this.publishing = false;
        this.subscribed = false;
        this.livekitRoom = null;
        this.outputElement = null;
        this.isEnabled = true;
        this.currentTrack = null;
        this.autoManagedAudioElement = null;
        this.autoManagedVideoElement = null;
        this.id = config.id;
        this.nodeId = config.nodeId;
        this.name = config.name;
        this.backendType = config.backendType;
        this.category = config.category;
        this.allowedTypes = config.allowedTypes;
        this.nextPads = config.nextPads;
        this.previousPad = config.previousPad;
        this._value = config.value;
      }
      /**
       * Gets the derived data type from allowed types.
       * This is computed dynamically based on the pad's allowed types.
       */
      get dataType() {
        return deriveDataType(this.allowedTypes, this.id);
      }
      /**
       * Checks if this is a source pad based on its backend type.
       * @returns {boolean} True if this is a source pad
       */
      isSourcePad() {
        return this.backendType ? isSourcePad(this.backendType) : false;
      }
      /**
       * Checks if this is a sink pad based on its backend type.
       * @returns {boolean} True if this is a sink pad
       */
      isSinkPad() {
        return this.backendType ? isSinkPad(this.backendType) : false;
      }
      /**
       * Gets the single allowed type if this pad is fully typed.
       * Following the React Flow UI pattern.
       * @returns {PadDataTypeDefinition | null} The single allowed type, or null if not fully typed
       */
      getSingleAllowedType() {
        if (!this.allowedTypes || this.allowedTypes.length !== 1) {
          return null;
        }
        return this.allowedTypes[0];
      }
      /**
       * Checks if this pad is fully typed (has exactly one allowed type).
       * Following the React Flow UI pattern.
       * @returns {boolean} True if this pad has exactly one allowed type
       */
      isFullyTyped() {
        return this.getSingleAllowedType() !== null;
      }
      /**
       * Sets the HTML media element to output audio/video to.
       * Only valid for audio/video source pads.
       * Note: This will override any auto-managed element.
       *
       * @internal
       * @private
       * @param {HTMLAudioElement | HTMLVideoElement} element - The media element to output to
       * @throws {Error} If used on non-media pad or sink pad
       */
      _setElement(element) {
        if (this.dataType === "audio" && !(element instanceof HTMLAudioElement)) {
          throw new Error("Audio pad requires HTMLAudioElement");
        }
        if (this.dataType === "video" && !(element instanceof HTMLVideoElement)) {
          throw new Error("Video pad requires HTMLVideoElement");
        }
        if (!this.isSourcePad()) {
          throw new Error("Can only set element on source pads");
        }
        if (this.autoManagedAudioElement) {
          this.autoManagedAudioElement.remove();
          this.autoManagedAudioElement = null;
        }
        if (this.autoManagedVideoElement) {
          this.autoManagedVideoElement.remove();
          this.autoManagedVideoElement = null;
        }
        this.outputElement = element;
        if (this.currentStream && this.isEnabled) {
          element.srcObject = this.currentStream;
        }
      }
      /**
       * Enables or disables the audio track on this pad.
       * Only valid for audio pads. When disabled, the track will be disabled at the source
       * which is more efficient than just muting the audio element.
       *
       * If no audio element is provided, one will be automatically created and managed.
       *
       * @param {boolean} enabled - Whether to enable or disable the track
       * @param {object} [options] - Optional configuration
       * @param {HTMLAudioElement} [options.element] - Audio element to control (if not provided, will use auto-managed element)
       * @throws {Error} If used on non-audio pad
       */
      async setEnabled(enabled, options) {
        if (this.dataType !== "audio") {
          throw new Error("Can only set enabled state on audio pads");
        }
        if (!this.isSourcePad()) {
          throw new Error("Can only set enabled state on source pads");
        }
        this.isEnabled = enabled;
        if (options?.element) {
          this._setElement(options.element);
        }
        let targetElement = this.outputElement;
        if (!targetElement && this.isSourcePad()) {
          if (!this.autoManagedAudioElement) {
            this.autoManagedAudioElement = document.createElement("audio");
            this.autoManagedAudioElement.autoplay = true;
            this.autoManagedAudioElement.style.display = "none";
            document.body.appendChild(this.autoManagedAudioElement);
          }
          targetElement = this.autoManagedAudioElement;
        }
        if (this.currentTrack && this.publishing) {
          try {
            if (this.livekitRoom?.localParticipant) {
              await this.livekitRoom.localParticipant.setTrackEnabled(this.currentTrack, enabled);
            }
          } catch (error) {
            console.warn(`Failed to ${enabled ? "enable" : "disable"} track:`, error);
          }
        }
        if (targetElement) {
          if (enabled) {
            targetElement.muted = false;
            if (this.currentStream) {
              targetElement.srcObject = this.currentStream;
            }
          } else {
            targetElement.muted = true;
            targetElement.srcObject = null;
          }
        }
      }
      /**
       * Enables or disables the microphone for this pad.
       * Only valid for audio source pads.
       *
       * @param {boolean} enabled - Whether to enable or disable the microphone
       * @param {AudioOptions} [options] - Optional configuration for the microphone
       * @throws {Error} If used on non-audio pad or sink pad
       */
      async setMicrophoneEnabled(enabled, options) {
        if (this.dataType !== "audio") {
          throw new Error("Can only set microphone on audio pads");
        }
        if (!this.isSourcePad()) {
          throw new Error("Cannot set microphone on sink pad");
        }
        if (!this.livekitRoom) {
          throw new Error("Cannot set microphone: not connected to LiveKit room");
        }
        if (options?.element) {
          this._setElement(options.element);
        }
        try {
          if (enabled) {
            try {
              const devices = await navigator.mediaDevices.enumerateDevices();
              const hasMicrophone = devices.some((device) => device.kind === "audioinput");
              if (!hasMicrophone) {
                throw new Error("No microphone device found on this system");
              }
            } catch (deviceError) {
              const errorMsg = deviceError instanceof Error ? deviceError.message : String(deviceError);
              throw new Error(`Microphone device check failed: ${errorMsg}`);
            }
            try {
              await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            } catch (permissionError) {
              if (permissionError instanceof Error) {
                if (permissionError.name === "NotAllowedError") {
                  throw new Error("Microphone permission denied. Please allow microphone access in your browser settings.");
                } else if (permissionError.name === "NotFoundError") {
                  throw new Error("No microphone found. Please connect a microphone or check if another application is using it.");
                } else if (permissionError.name === "NotReadableError") {
                  throw new Error("Microphone is already in use by another application.");
                } else {
                  throw new Error(`Microphone access failed: ${permissionError.message}`);
                }
              } else {
                throw new Error(`Microphone access failed: ${String(permissionError)}`);
              }
            }
          }
          await this.livekitRoom.localParticipant.setMicrophoneEnabled(enabled);
          this.publishing = enabled;
          this.isConnected = enabled;
          this.emit("connection-changed", enabled);
          if (this.outputElement instanceof HTMLAudioElement) {
            if (enabled) {
              this.outputElement.muted = false;
              if (this.currentStream) {
                this.outputElement.srcObject = this.currentStream;
              }
            } else {
              this.outputElement.muted = true;
              this.outputElement.srcObject = null;
            }
          }
        } catch (error) {
          throw new Error(`Failed to ${enabled ? "enable" : "disable"} microphone on pad ${this.id}: ${error}`);
        }
      }
      /**
       * Enables or disables the camera for this pad.
       * Only valid for video source pads.
       *
       * @param {boolean} enabled - Whether to enable or disable the camera
       * @param {VideoOptions} [options] - Optional configuration for the camera
       * @throws {Error} If used on non-video pad or sink pad
       */
      async setVideoEnabled(enabled, options) {
        if (this.dataType !== "video") {
          throw new Error("Can only set video on video pads");
        }
        if (!this.isSourcePad()) {
          throw new Error("Cannot set video on sink pad");
        }
        if (!this.livekitRoom) {
          throw new Error("Cannot set video: not connected to LiveKit room");
        }
        if (options?.element) {
          this._setElement(options.element);
        }
        try {
          if (enabled) {
            try {
              const devices = await navigator.mediaDevices.enumerateDevices();
              const hasCamera = devices.some((device) => device.kind === "videoinput");
              if (!hasCamera) {
                throw new Error("No camera device found on this system");
              }
            } catch (deviceError) {
              const errorMsg = deviceError instanceof Error ? deviceError.message : String(deviceError);
              throw new Error(`Camera device check failed: ${errorMsg}`);
            }
            try {
              await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            } catch (permissionError) {
              if (permissionError instanceof Error) {
                if (permissionError.name === "NotAllowedError") {
                  throw new Error("Camera permission denied. Please allow camera access in your browser settings.");
                } else if (permissionError.name === "NotFoundError") {
                  throw new Error("No camera found. Please connect a camera or check if another application is using it.");
                } else if (permissionError.name === "NotReadableError") {
                  throw new Error("Camera is already in use by another application.");
                } else {
                  throw new Error(`Camera access failed: ${permissionError.message}`);
                }
              } else {
                throw new Error(`Camera access failed: ${String(permissionError)}`);
              }
            }
          }
          await this.livekitRoom.localParticipant.setCameraEnabled(enabled);
          this.publishing = enabled;
          this.isConnected = enabled;
          this.emit("connection-changed", enabled);
          if (this.outputElement instanceof HTMLVideoElement) {
            if (enabled) {
              if (this.currentStream) {
                this.outputElement.srcObject = this.currentStream;
              }
            } else {
              this.outputElement.srcObject = null;
            }
          }
        } catch (error) {
          throw new Error(`Failed to ${enabled ? "enable" : "disable"} camera on pad ${this.id}: ${error}`);
        }
      }
      /**
       * Gets the current media stream associated with this pad.
       * @returns {MediaStream | null} The current media stream or null if none exists
       */
      getCurrentStream() {
        return this.currentStream;
      }
      /**
       * Gets the current connection state of the pad.
       * @returns {boolean} True if connected, false otherwise
       */
      getConnectionState() {
        return this.isConnected;
      }
      /**
       * Checks if the pad is currently publishing.
       * @returns {boolean} True if publishing, false otherwise
       */
      isPublishing() {
        return this.publishing;
      }
      /**
       * Checks if the pad is currently subscribed.
       * @returns {boolean} True if subscribed, false otherwise
       */
      isSubscribed() {
        return this.subscribed;
      }
      /**
       * Sets the LiveKit room for this pad.
       * @internal
       * @param {any} room - The LiveKit room instance
       */
      setLivekitRoom(room) {
        this.livekitRoom = room;
      }
      /**
       * Sets the connection state of the pad.
       * @internal
       * @param {boolean} connected - The new connection state
       */
      setConnectionState(connected) {
        if (this.isConnected !== connected) {
          this.isConnected = connected;
          this.emit("connection-changed", connected);
        }
      }
      /**
       * Sets a media stream for this pad.
       * @internal
       * @param {MediaStream | null} stream - The media stream to set
       */
      setStream(stream) {
        if (!this.isSourcePad()) {
          throw new Error("Can only set stream on source pads");
        }
        this.currentStream = stream;
        if (stream) {
          this.subscribed = true;
          const audioTracks = stream.getAudioTracks();
          if (audioTracks.length > 0) {
            this.currentTrack = audioTracks[0];
            if (this.dataType === "audio") {
              this.currentTrack.enabled = this.isEnabled;
            }
          }
          this.emit("stream-received", stream);
          if (this.outputElement && this.dataType === "audio" && this.isEnabled) {
            this.outputElement.srcObject = stream;
          }
        } else {
          this.subscribed = false;
          this.currentTrack = null;
          if (this.outputElement && this.dataType === "audio") {
            this.outputElement.srcObject = null;
          }
        }
      }
      /**
       * Sets data for this pad.
       * @internal
       * @param {any} data - The data to set
       */
      setData(data) {
        if (data !== null && data !== undefined) {
          this.subscribed = true;
          this.emit("data-received", data);
        } else {
          this.subscribed = false;
        }
      }
      /**
       * Gets the current value of the pad (for property pads).
       * @returns {any} The current value or null if not a property pad
       */
      getValue() {
        return this._value;
      }
      /**
       * Sets the value of the pad (for property pads).
       * @param {any} value - The new value to set
       */
      setValue(value) {
        this._value = value;
        this.emit("data-received", value);
      }
      /**
       * Checks if this is a property pad.
       * @returns {boolean} True if this is a property pad
       */
      isPropertyPad() {
        return this.category === "property" || this.backendType === "PropertySourcePad" || this.backendType === "PropertySinkPad";
      }
      /**
       * Checks if this is a stateless pad.
       * @returns {boolean} True if this is a stateless pad
       */
      isStatelessPad() {
        return this.category === "stateless" || this.backendType === "StatelessSourcePad" || this.backendType === "StatelessSinkPad";
      }
      /**
       * Cleans up all resources associated with this pad.
       * Stops publishing, clears streams, and removes event listeners.
       */
      async cleanup() {
        try {
          if (this.publishing && this.livekitRoom) {
            if (this.dataType === "audio") {
              await this.setMicrophoneEnabled(false);
            } else if (this.dataType === "video") {
              await this.setVideoEnabled(false);
            }
          }
        } catch (error) {
          console.warn(`Error during pad cleanup: ${error}`);
        }
        if (this.autoManagedAudioElement) {
          this.autoManagedAudioElement.remove();
          this.autoManagedAudioElement = null;
        }
        if (this.autoManagedVideoElement) {
          this.autoManagedVideoElement.remove();
          this.autoManagedVideoElement = null;
        }
        if (this.outputElement) {
          this.outputElement.srcObject = null;
          this.outputElement = null;
        }
        this.currentStream = null;
        this.isConnected = false;
        this.publishing = false;
        this.subscribed = false;
        this.livekitRoom = null;
        this.isEnabled = true;
        this.currentTrack = null;
        this.removeAllListeners();
      }
    };
  }
});
var TrackVolumeVisualizer = class {
  constructor({ bands, onTick }) {
    this.cleanup = null;
    this.bands = bands;
    this.callback = onTick;
  }
  setTrack(track) {
    if (this.interval) {
      clearInterval(this.interval);
    }
    if (this.cleanup) {
      this.cleanup();
    }
    const { analyser, cleanup, calculateVolume } = createAudioAnalyser(track, {
      fftSize: 256,
      smoothingTimeConstant: 0.7
    });
    this.cleanup = cleanup;
    const dataArray = new Float32Array(this.bands);
    this.interval = setInterval(() => {
      analyser.getFloatFrequencyData(dataArray);
      const result = [];
      for (let i = 0; i < dataArray.length; i++) {
        result.push(Math.max(0, dataArray[i] + 140) / 140);
      }
      this.callback(result, calculateVolume());
    }, 1e3 / 100);
  }
};
var BASE_PATH = "https://api.gabber.dev".replace(/\/+$/, "");
var BaseAPI = class {
  constructor(configuration, basePath = BASE_PATH, axios = globalAxios7) {
    this.basePath = basePath;
    this.axios = axios;
    if (configuration) {
      this.configuration = configuration;
      this.basePath = configuration.basePath ?? basePath;
    }
  }
};
var RequiredError = class extends Error {
  constructor(field, msg) {
    super(msg);
    this.field = field;
    this.name = "RequiredError";
  }
};
var operationServerMap = {};

// src/generated/common.ts
var DUMMY_BASE_URL = "https://example.com";
var assertParamExists = function(functionName, paramName, paramValue) {
  if (paramValue === null || paramValue === undefined) {
    throw new RequiredError(paramName, `Required parameter ${paramName} was null or undefined when calling ${functionName}.`);
  }
};
var setApiKeyToObject = async function(object, keyParamName, configuration) {
  if (configuration && configuration.apiKey) {
    const localVarApiKeyValue = typeof configuration.apiKey === "function" ? await configuration.apiKey(keyParamName) : await configuration.apiKey;
    object[keyParamName] = localVarApiKeyValue;
  }
};
var setBearerAuthToObject = async function(object, configuration) {
  if (configuration && configuration.accessToken) {
    const accessToken = typeof configuration.accessToken === "function" ? await configuration.accessToken() : await configuration.accessToken;
    object["Authorization"] = "Bearer " + accessToken;
  }
};
function setFlattenedQueryParams(urlSearchParams, parameter, key = "") {
  if (parameter == null) return;
  if (typeof parameter === "object") {
    if (Array.isArray(parameter)) {
      parameter.forEach((item) => setFlattenedQueryParams(urlSearchParams, item, key));
    } else {
      Object.keys(parameter).forEach(
        (currentKey) => setFlattenedQueryParams(urlSearchParams, parameter[currentKey], `${key}${key !== "" ? "." : ""}${currentKey}`)
      );
    }
  } else {
    if (urlSearchParams.has(key)) {
      urlSearchParams.append(key, parameter);
    } else {
      urlSearchParams.set(key, parameter);
    }
  }
}
var setSearchParams = function(url, ...objects) {
  const searchParams = new URLSearchParams(url.search);
  setFlattenedQueryParams(searchParams, objects);
  url.search = searchParams.toString();
};
var serializeDataIfNeeded = function(value, requestOptions, configuration) {
  const nonString = typeof value !== "string";
  const needsSerialization = nonString && configuration && configuration.isJsonMime ? configuration.isJsonMime(requestOptions.headers["Content-Type"]) : nonString;
  return needsSerialization ? JSON.stringify(value !== undefined ? value : {}) : value || "";
};
var toPathString = function(url) {
  return url.pathname + url.search + url.hash;
};
var createRequestFunction = function(axiosArgs, globalAxios12, BASE_PATH2, configuration) {
  return (axios = globalAxios12, basePath = BASE_PATH2) => {
    const axiosRequestArgs = { ...axiosArgs.options, url: (axios.defaults.baseURL ? "" : configuration?.basePath ?? basePath) + axiosArgs.url };
    return axios.request(axiosRequestArgs);
  };
};
var LLMApiAxiosParamCreator = function(configuration) {
  return {
    /**
     * Create a new Context with the given configuration. 
     * @summary Create a new Context.
     * @param {ContextCreateRequest} contextCreateRequest 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createContext: async (contextCreateRequest, xHumanId, options = {}) => {
      assertParamExists("createContext", "contextCreateRequest", contextCreateRequest);
      const localVarPath = `/v1/llm/context`;
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "POST", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      if (xHumanId != null) {
        localVarHeaderParameter["x-human-id"] = String(xHumanId);
      }
      localVarHeaderParameter["Content-Type"] = "application/json";
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      localVarRequestOptions.data = serializeDataIfNeeded(contextCreateRequest, localVarRequestOptions, configuration);
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * Create a new ContextMessage with the given configuration. 
     * @summary Create a new ContextMessage.
     * @param {string} context The unique identifier of the Context.
     * @param {ContextMessageCreateParams} contextMessageCreateParams 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createContextMessage: async (context, contextMessageCreateParams, xHumanId, options = {}) => {
      assertParamExists("createContextMessage", "context", context);
      assertParamExists("createContextMessage", "contextMessageCreateParams", contextMessageCreateParams);
      const localVarPath = `/v1/llm/context/{context}/message`.replace(`{${"context"}}`, encodeURIComponent(String(context)));
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "POST", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      if (xHumanId != null) {
        localVarHeaderParameter["x-human-id"] = String(xHumanId);
      }
      localVarHeaderParameter["Content-Type"] = "application/json";
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      localVarRequestOptions.data = serializeDataIfNeeded(contextMessageCreateParams, localVarRequestOptions, configuration);
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * Retrieve the Context with the given identifier. 
     * @summary Retrieve a Context.
     * @param {string} context The unique identifier of the Context.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getContext: async (context, xHumanId, options = {}) => {
      assertParamExists("getContext", "context", context);
      const localVarPath = `/v1/llm/context/{context}`.replace(`{${"context"}}`, encodeURIComponent(String(context)));
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "GET", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      if (xHumanId != null) {
        localVarHeaderParameter["x-human-id"] = String(xHumanId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * Retrieve the ContextMessage with the given identifier. 
     * @summary Retrieve a ContextMessage.
     * @param {string} context The unique identifier of the Context.
     * @param {string} message The unique identifier of the ContextMessage.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getContextMessage: async (context, message, xHumanId, options = {}) => {
      assertParamExists("getContextMessage", "context", context);
      assertParamExists("getContextMessage", "message", message);
      const localVarPath = `/v1/llm/context/{context}/message/{message}`.replace(`{${"context"}}`, encodeURIComponent(String(context))).replace(`{${"message"}}`, encodeURIComponent(String(message)));
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "GET", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      if (xHumanId != null) {
        localVarHeaderParameter["x-human-id"] = String(xHumanId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * 
     * @summary Get a list of llms
     * @param {string} llm 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getLLM: async (llm, xHumanId, options = {}) => {
      assertParamExists("getLLM", "llm", llm);
      const localVarPath = `/v1/llm/{llm}`.replace(`{${"llm"}}`, encodeURIComponent(String(llm)));
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "GET", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      if (xHumanId != null) {
        localVarHeaderParameter["x-human-id"] = String(xHumanId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * List all ContextMessages associated with the given Context. 
     * @summary List ContextMessages.
     * @param {string} context The unique identifier of the Context.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {Array<string>} [messageIds] A comma-separated list of message IDs to fetch.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listContextMessages: async (context, xHumanId, messageIds, options = {}) => {
      assertParamExists("listContextMessages", "context", context);
      const localVarPath = `/v1/llm/context/{context}/message/list`.replace(`{${"context"}}`, encodeURIComponent(String(context)));
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "GET", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      if (messageIds) {
        localVarQueryParameter["message_ids"] = messageIds;
      }
      if (xHumanId != null) {
        localVarHeaderParameter["x-human-id"] = String(xHumanId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * List all Contexts associated with the given human. 
     * @summary List Contexts.
     * @param {Array<string>} contextIds A comma-separated list of context IDs to fetch.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listContexts: async (contextIds, xHumanId, options = {}) => {
      assertParamExists("listContexts", "contextIds", contextIds);
      const localVarPath = `/v1/llm/context/list`;
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "GET", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      if (contextIds) {
        localVarQueryParameter["context_ids"] = contextIds;
      }
      if (xHumanId != null) {
        localVarHeaderParameter["x-human-id"] = String(xHumanId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * 
     * @summary Get a list of llms
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listLLMs: async (xHumanId, options = {}) => {
      const localVarPath = `/v1/llm/list`;
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "GET", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      if (xHumanId != null) {
        localVarHeaderParameter["x-human-id"] = String(xHumanId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * Retrieve the ContextMemory with the given identifier. 
     * @summary Query the advanced context memory
     * @param {string} context The unique identifier of the Context.
     * @param {ContextAdvancedMemoryQueryRequest} contextAdvancedMemoryQueryRequest 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    queryAdvancedContextMemory: async (context, contextAdvancedMemoryQueryRequest, xHumanId, options = {}) => {
      assertParamExists("queryAdvancedContextMemory", "context", context);
      assertParamExists("queryAdvancedContextMemory", "contextAdvancedMemoryQueryRequest", contextAdvancedMemoryQueryRequest);
      const localVarPath = `/v1/llm/context/{context}/advanced_memory/query`.replace(`{${"context"}}`, encodeURIComponent(String(context)));
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "POST", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      if (xHumanId != null) {
        localVarHeaderParameter["x-human-id"] = String(xHumanId);
      }
      localVarHeaderParameter["Content-Type"] = "application/json";
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      localVarRequestOptions.data = serializeDataIfNeeded(contextAdvancedMemoryQueryRequest, localVarRequestOptions, configuration);
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    }
  };
};
var LLMApiFp = function(configuration) {
  const localVarAxiosParamCreator = LLMApiAxiosParamCreator(configuration);
  return {
    /**
     * Create a new Context with the given configuration. 
     * @summary Create a new Context.
     * @param {ContextCreateRequest} contextCreateRequest 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createContext(contextCreateRequest, xHumanId, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.createContext(contextCreateRequest, xHumanId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["LLMApi.createContext"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * Create a new ContextMessage with the given configuration. 
     * @summary Create a new ContextMessage.
     * @param {string} context The unique identifier of the Context.
     * @param {ContextMessageCreateParams} contextMessageCreateParams 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createContextMessage(context, contextMessageCreateParams, xHumanId, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.createContextMessage(context, contextMessageCreateParams, xHumanId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["LLMApi.createContextMessage"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * Retrieve the Context with the given identifier. 
     * @summary Retrieve a Context.
     * @param {string} context The unique identifier of the Context.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getContext(context, xHumanId, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getContext(context, xHumanId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["LLMApi.getContext"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * Retrieve the ContextMessage with the given identifier. 
     * @summary Retrieve a ContextMessage.
     * @param {string} context The unique identifier of the Context.
     * @param {string} message The unique identifier of the ContextMessage.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getContextMessage(context, message, xHumanId, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getContextMessage(context, message, xHumanId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["LLMApi.getContextMessage"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * 
     * @summary Get a list of llms
     * @param {string} llm 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getLLM(llm, xHumanId, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getLLM(llm, xHumanId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["LLMApi.getLLM"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * List all ContextMessages associated with the given Context. 
     * @summary List ContextMessages.
     * @param {string} context The unique identifier of the Context.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {Array<string>} [messageIds] A comma-separated list of message IDs to fetch.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listContextMessages(context, xHumanId, messageIds, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.listContextMessages(context, xHumanId, messageIds, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["LLMApi.listContextMessages"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * List all Contexts associated with the given human. 
     * @summary List Contexts.
     * @param {Array<string>} contextIds A comma-separated list of context IDs to fetch.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listContexts(contextIds, xHumanId, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.listContexts(contextIds, xHumanId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["LLMApi.listContexts"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * 
     * @summary Get a list of llms
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listLLMs(xHumanId, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.listLLMs(xHumanId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["LLMApi.listLLMs"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * Retrieve the ContextMemory with the given identifier. 
     * @summary Query the advanced context memory
     * @param {string} context The unique identifier of the Context.
     * @param {ContextAdvancedMemoryQueryRequest} contextAdvancedMemoryQueryRequest 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async queryAdvancedContextMemory(context, contextAdvancedMemoryQueryRequest, xHumanId, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.queryAdvancedContextMemory(context, contextAdvancedMemoryQueryRequest, xHumanId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["LLMApi.queryAdvancedContextMemory"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    }
  };
};
var LLMApi = class extends BaseAPI {
  /**
   * Create a new Context with the given configuration. 
   * @summary Create a new Context.
   * @param {ContextCreateRequest} contextCreateRequest 
   * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof LLMApi
   */
  createContext(contextCreateRequest, xHumanId, options) {
    return LLMApiFp(this.configuration).createContext(contextCreateRequest, xHumanId, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * Create a new ContextMessage with the given configuration. 
   * @summary Create a new ContextMessage.
   * @param {string} context The unique identifier of the Context.
   * @param {ContextMessageCreateParams} contextMessageCreateParams 
   * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof LLMApi
   */
  createContextMessage(context, contextMessageCreateParams, xHumanId, options) {
    return LLMApiFp(this.configuration).createContextMessage(context, contextMessageCreateParams, xHumanId, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * Retrieve the Context with the given identifier. 
   * @summary Retrieve a Context.
   * @param {string} context The unique identifier of the Context.
   * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof LLMApi
   */
  getContext(context, xHumanId, options) {
    return LLMApiFp(this.configuration).getContext(context, xHumanId, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * Retrieve the ContextMessage with the given identifier. 
   * @summary Retrieve a ContextMessage.
   * @param {string} context The unique identifier of the Context.
   * @param {string} message The unique identifier of the ContextMessage.
   * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof LLMApi
   */
  getContextMessage(context, message, xHumanId, options) {
    return LLMApiFp(this.configuration).getContextMessage(context, message, xHumanId, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * 
   * @summary Get a list of llms
   * @param {string} llm 
   * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof LLMApi
   */
  getLLM(llm, xHumanId, options) {
    return LLMApiFp(this.configuration).getLLM(llm, xHumanId, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * List all ContextMessages associated with the given Context. 
   * @summary List ContextMessages.
   * @param {string} context The unique identifier of the Context.
   * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
   * @param {Array<string>} [messageIds] A comma-separated list of message IDs to fetch.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof LLMApi
   */
  listContextMessages(context, xHumanId, messageIds, options) {
    return LLMApiFp(this.configuration).listContextMessages(context, xHumanId, messageIds, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * List all Contexts associated with the given human. 
   * @summary List Contexts.
   * @param {Array<string>} contextIds A comma-separated list of context IDs to fetch.
   * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof LLMApi
   */
  listContexts(contextIds, xHumanId, options) {
    return LLMApiFp(this.configuration).listContexts(contextIds, xHumanId, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * 
   * @summary Get a list of llms
   * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof LLMApi
   */
  listLLMs(xHumanId, options) {
    return LLMApiFp(this.configuration).listLLMs(xHumanId, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * Retrieve the ContextMemory with the given identifier. 
   * @summary Query the advanced context memory
   * @param {string} context The unique identifier of the Context.
   * @param {ContextAdvancedMemoryQueryRequest} contextAdvancedMemoryQueryRequest 
   * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof LLMApi
   */
  queryAdvancedContextMemory(context, contextAdvancedMemoryQueryRequest, xHumanId, options) {
    return LLMApiFp(this.configuration).queryAdvancedContextMemory(context, contextAdvancedMemoryQueryRequest, xHumanId, options).then((request) => request(this.axios, this.basePath));
  }
};
var PersonaApiAxiosParamCreator = function(configuration) {
  return {
    /**
     * 
     * @summary Create a persona
     * @param {CreatePersonaRequest} createPersonaRequest 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createPersona: async (createPersonaRequest, xHumanId, options = {}) => {
      assertParamExists("createPersona", "createPersonaRequest", createPersonaRequest);
      const localVarPath = `/v1/persona`;
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "POST", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      if (xHumanId != null) {
        localVarHeaderParameter["x-human-id"] = String(xHumanId);
      }
      localVarHeaderParameter["Content-Type"] = "application/json";
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      localVarRequestOptions.data = serializeDataIfNeeded(createPersonaRequest, localVarRequestOptions, configuration);
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * 
     * @summary Delete a persona
     * @param {string} personaId 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deletePersona: async (personaId, xHumanId, options = {}) => {
      assertParamExists("deletePersona", "personaId", personaId);
      const localVarPath = `/v1/persona/{persona_id}`.replace(`{${"persona_id"}}`, encodeURIComponent(String(personaId)));
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "DELETE", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      if (xHumanId != null) {
        localVarHeaderParameter["x-human-id"] = String(xHumanId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * 
     * @summary Get a persona
     * @param {string} personaId 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getPersona: async (personaId, xHumanId, options = {}) => {
      assertParamExists("getPersona", "personaId", personaId);
      const localVarPath = `/v1/persona/{persona_id}`.replace(`{${"persona_id"}}`, encodeURIComponent(String(personaId)));
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "GET", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      if (xHumanId != null) {
        localVarHeaderParameter["x-human-id"] = String(xHumanId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * 
     * @summary Get a list of personas
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listPersonas: async (xHumanId, options = {}) => {
      const localVarPath = `/v1/persona/list`;
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "GET", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      if (xHumanId != null) {
        localVarHeaderParameter["x-human-id"] = String(xHumanId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * 
     * @summary Update a persona
     * @param {string} personaId 
     * @param {UpdatePersonaRequest} updatePersonaRequest 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updatePersona: async (personaId, updatePersonaRequest, xHumanId, options = {}) => {
      assertParamExists("updatePersona", "personaId", personaId);
      assertParamExists("updatePersona", "updatePersonaRequest", updatePersonaRequest);
      const localVarPath = `/v1/persona/{persona_id}`.replace(`{${"persona_id"}}`, encodeURIComponent(String(personaId)));
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "PUT", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      if (xHumanId != null) {
        localVarHeaderParameter["x-human-id"] = String(xHumanId);
      }
      localVarHeaderParameter["Content-Type"] = "application/json";
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      localVarRequestOptions.data = serializeDataIfNeeded(updatePersonaRequest, localVarRequestOptions, configuration);
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    }
  };
};
var PersonaApiFp = function(configuration) {
  const localVarAxiosParamCreator = PersonaApiAxiosParamCreator(configuration);
  return {
    /**
     * 
     * @summary Create a persona
     * @param {CreatePersonaRequest} createPersonaRequest 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createPersona(createPersonaRequest, xHumanId, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.createPersona(createPersonaRequest, xHumanId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["PersonaApi.createPersona"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * 
     * @summary Delete a persona
     * @param {string} personaId 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deletePersona(personaId, xHumanId, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.deletePersona(personaId, xHumanId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["PersonaApi.deletePersona"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * 
     * @summary Get a persona
     * @param {string} personaId 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getPersona(personaId, xHumanId, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getPersona(personaId, xHumanId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["PersonaApi.getPersona"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * 
     * @summary Get a list of personas
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listPersonas(xHumanId, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.listPersonas(xHumanId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["PersonaApi.listPersonas"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * 
     * @summary Update a persona
     * @param {string} personaId 
     * @param {UpdatePersonaRequest} updatePersonaRequest 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updatePersona(personaId, updatePersonaRequest, xHumanId, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.updatePersona(personaId, updatePersonaRequest, xHumanId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["PersonaApi.updatePersona"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    }
  };
};
var PersonaApi = class extends BaseAPI {
  /**
   * 
   * @summary Create a persona
   * @param {CreatePersonaRequest} createPersonaRequest 
   * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PersonaApi
   */
  createPersona(createPersonaRequest, xHumanId, options) {
    return PersonaApiFp(this.configuration).createPersona(createPersonaRequest, xHumanId, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * 
   * @summary Delete a persona
   * @param {string} personaId 
   * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PersonaApi
   */
  deletePersona(personaId, xHumanId, options) {
    return PersonaApiFp(this.configuration).deletePersona(personaId, xHumanId, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * 
   * @summary Get a persona
   * @param {string} personaId 
   * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PersonaApi
   */
  getPersona(personaId, xHumanId, options) {
    return PersonaApiFp(this.configuration).getPersona(personaId, xHumanId, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * 
   * @summary Get a list of personas
   * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PersonaApi
   */
  listPersonas(xHumanId, options) {
    return PersonaApiFp(this.configuration).listPersonas(xHumanId, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * 
   * @summary Update a persona
   * @param {string} personaId 
   * @param {UpdatePersonaRequest} updatePersonaRequest 
   * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PersonaApi
   */
  updatePersona(personaId, updatePersonaRequest, xHumanId, options) {
    return PersonaApiFp(this.configuration).updatePersona(personaId, updatePersonaRequest, xHumanId, options).then((request) => request(this.axios, this.basePath));
  }
};
var RealtimeApiAxiosParamCreator = function(configuration) {
  return {
    /**
     * Attaches a human to a RealtimeSession. This is useful for previously anonymous sessions, for example sessions created via a phone call.
     * @summary Attach a human to a RealtimeSession
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {AttachHumanRequest} attachHumanRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    attachHuman: async (session, attachHumanRequest, options = {}) => {
      assertParamExists("attachHuman", "session", session);
      assertParamExists("attachHuman", "attachHumanRequest", attachHumanRequest);
      const localVarPath = `/v1/realtime/session/{session}/attach_human`.replace(`{${"session"}}`, encodeURIComponent(String(session)));
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "POST", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      localVarHeaderParameter["Content-Type"] = "application/json";
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      localVarRequestOptions.data = serializeDataIfNeeded(attachHumanRequest, localVarRequestOptions, configuration);
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * For a live session, force agent to send DTMF tones
     * @summary DTMF
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {RealtimeSessionDTMFRequest} realtimeSessionDTMFRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    dtmf: async (session, realtimeSessionDTMFRequest, options = {}) => {
      assertParamExists("dtmf", "session", session);
      assertParamExists("dtmf", "realtimeSessionDTMFRequest", realtimeSessionDTMFRequest);
      const localVarPath = `/v1/realtime/{session}/dtmf`.replace(`{${"session"}}`, encodeURIComponent(String(session)));
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "POST", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      localVarHeaderParameter["Content-Type"] = "application/json";
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      localVarRequestOptions.data = serializeDataIfNeeded(realtimeSessionDTMFRequest, localVarRequestOptions, configuration);
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * End the RealtimeSession with the given identifier. 
     * @summary End a RealtimeSession.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    endRealtimeSession: async (session, xHumanId, options = {}) => {
      assertParamExists("endRealtimeSession", "session", session);
      const localVarPath = `/v1/realtime/{session}/end`.replace(`{${"session"}}`, encodeURIComponent(String(session)));
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "POST", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      if (xHumanId != null) {
        localVarHeaderParameter["x-human-id"] = String(xHumanId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * End the RealtimeSession with the given identifier. 
     * @summary Get a RealtimeSession.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getRealtimeSession: async (session, xHumanId, options = {}) => {
      assertParamExists("getRealtimeSession", "session", session);
      const localVarPath = `/v1/realtime/{session}`.replace(`{${"session"}}`, encodeURIComponent(String(session)));
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "GET", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      if (xHumanId != null) {
        localVarHeaderParameter["x-human-id"] = String(xHumanId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * Get all ContextMessages associated with the given RealtimeSession. 
     * @summary Get a RealtimeSession messages.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getRealtimeSessionMessages: async (session, xHumanId, options = {}) => {
      assertParamExists("getRealtimeSessionMessages", "session", session);
      const localVarPath = `/v1/realtime/{session}/messages`.replace(`{${"session"}}`, encodeURIComponent(String(session)));
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "GET", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      if (xHumanId != null) {
        localVarHeaderParameter["x-human-id"] = String(xHumanId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * Get the timeline of the RealtimeSession with the given identifier. 
     * @summary Get a RealtimeSession timeline.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getRealtimeSessionTimeline: async (session, xHumanId, options = {}) => {
      assertParamExists("getRealtimeSessionTimeline", "session", session);
      const localVarPath = `/v1/realtime/{session}/timeline`.replace(`{${"session"}}`, encodeURIComponent(String(session)));
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "GET", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      if (xHumanId != null) {
        localVarHeaderParameter["x-human-id"] = String(xHumanId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * Initiate an outbound call from a RealtimeSession. 
     * @summary Initiate an outbound call.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {RealtimeSessionInitiateOutboundCallRequest} realtimeSessionInitiateOutboundCallRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    initiateOutboundCall: async (session, realtimeSessionInitiateOutboundCallRequest, options = {}) => {
      assertParamExists("initiateOutboundCall", "session", session);
      assertParamExists("initiateOutboundCall", "realtimeSessionInitiateOutboundCallRequest", realtimeSessionInitiateOutboundCallRequest);
      const localVarPath = `/v1/realtime/{session}/outbound_call`.replace(`{${"session"}}`, encodeURIComponent(String(session)));
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "POST", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      localVarHeaderParameter["Content-Type"] = "application/json";
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      localVarRequestOptions.data = serializeDataIfNeeded(realtimeSessionInitiateOutboundCallRequest, localVarRequestOptions, configuration);
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * List all Realtime Sessions. 
     * @summary List Realtime Sessions.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {string} [page] Page token for pagination
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listRealtimeSessions: async (xHumanId, page, options = {}) => {
      const localVarPath = `/v1/realtime/list`;
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "GET", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      if (page !== undefined) {
        localVarQueryParameter["page"] = page;
      }
      if (xHumanId != null) {
        localVarHeaderParameter["x-human-id"] = String(xHumanId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * For a live session, force the agent to speak a given text.
     * @summary Speak
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {SpeakRequest} speakRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    speak: async (session, speakRequest, options = {}) => {
      assertParamExists("speak", "session", session);
      assertParamExists("speak", "speakRequest", speakRequest);
      const localVarPath = `/v1/realtime/{session}/speak`.replace(`{${"session"}}`, encodeURIComponent(String(session)));
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "POST", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      localVarHeaderParameter["Content-Type"] = "application/json";
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      localVarRequestOptions.data = serializeDataIfNeeded(speakRequest, localVarRequestOptions, configuration);
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * Start a new RealtimeSession with the given configuration. 
     * @summary Start a new RealtimeSession.
     * @param {StartRealtimeSessionRequest} startRealtimeSessionRequest 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    startRealtimeSession: async (startRealtimeSessionRequest, xHumanId, options = {}) => {
      assertParamExists("startRealtimeSession", "startRealtimeSessionRequest", startRealtimeSessionRequest);
      const localVarPath = `/v1/realtime/start`;
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "POST", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      if (xHumanId != null) {
        localVarHeaderParameter["x-human-id"] = String(xHumanId);
      }
      localVarHeaderParameter["Content-Type"] = "application/json";
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      localVarRequestOptions.data = serializeDataIfNeeded(startRealtimeSessionRequest, localVarRequestOptions, configuration);
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * Update the RealtimeSession with the given identifier. 
     * @summary Update a RealtimeSession.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {RealtimeSessionConfigUpdate} realtimeSessionConfigUpdate 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateRealtimeSession: async (session, realtimeSessionConfigUpdate, xHumanId, options = {}) => {
      assertParamExists("updateRealtimeSession", "session", session);
      assertParamExists("updateRealtimeSession", "realtimeSessionConfigUpdate", realtimeSessionConfigUpdate);
      const localVarPath = `/v1/realtime/{session}/update`.replace(`{${"session"}}`, encodeURIComponent(String(session)));
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "POST", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      if (xHumanId != null) {
        localVarHeaderParameter["x-human-id"] = String(xHumanId);
      }
      localVarHeaderParameter["Content-Type"] = "application/json";
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      localVarRequestOptions.data = serializeDataIfNeeded(realtimeSessionConfigUpdate, localVarRequestOptions, configuration);
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    }
  };
};
var RealtimeApiFp = function(configuration) {
  const localVarAxiosParamCreator = RealtimeApiAxiosParamCreator(configuration);
  return {
    /**
     * Attaches a human to a RealtimeSession. This is useful for previously anonymous sessions, for example sessions created via a phone call.
     * @summary Attach a human to a RealtimeSession
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {AttachHumanRequest} attachHumanRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async attachHuman(session, attachHumanRequest, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.attachHuman(session, attachHumanRequest, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["RealtimeApi.attachHuman"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * For a live session, force agent to send DTMF tones
     * @summary DTMF
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {RealtimeSessionDTMFRequest} realtimeSessionDTMFRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async dtmf(session, realtimeSessionDTMFRequest, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.dtmf(session, realtimeSessionDTMFRequest, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["RealtimeApi.dtmf"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * End the RealtimeSession with the given identifier. 
     * @summary End a RealtimeSession.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async endRealtimeSession(session, xHumanId, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.endRealtimeSession(session, xHumanId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["RealtimeApi.endRealtimeSession"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * End the RealtimeSession with the given identifier. 
     * @summary Get a RealtimeSession.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getRealtimeSession(session, xHumanId, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getRealtimeSession(session, xHumanId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["RealtimeApi.getRealtimeSession"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * Get all ContextMessages associated with the given RealtimeSession. 
     * @summary Get a RealtimeSession messages.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getRealtimeSessionMessages(session, xHumanId, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getRealtimeSessionMessages(session, xHumanId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["RealtimeApi.getRealtimeSessionMessages"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * Get the timeline of the RealtimeSession with the given identifier. 
     * @summary Get a RealtimeSession timeline.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getRealtimeSessionTimeline(session, xHumanId, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getRealtimeSessionTimeline(session, xHumanId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["RealtimeApi.getRealtimeSessionTimeline"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * Initiate an outbound call from a RealtimeSession. 
     * @summary Initiate an outbound call.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {RealtimeSessionInitiateOutboundCallRequest} realtimeSessionInitiateOutboundCallRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async initiateOutboundCall(session, realtimeSessionInitiateOutboundCallRequest, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.initiateOutboundCall(session, realtimeSessionInitiateOutboundCallRequest, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["RealtimeApi.initiateOutboundCall"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * List all Realtime Sessions. 
     * @summary List Realtime Sessions.
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {string} [page] Page token for pagination
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listRealtimeSessions(xHumanId, page, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.listRealtimeSessions(xHumanId, page, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["RealtimeApi.listRealtimeSessions"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * For a live session, force the agent to speak a given text.
     * @summary Speak
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {SpeakRequest} speakRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async speak(session, speakRequest, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.speak(session, speakRequest, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["RealtimeApi.speak"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * Start a new RealtimeSession with the given configuration. 
     * @summary Start a new RealtimeSession.
     * @param {StartRealtimeSessionRequest} startRealtimeSessionRequest 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async startRealtimeSession(startRealtimeSessionRequest, xHumanId, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.startRealtimeSession(startRealtimeSessionRequest, xHumanId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["RealtimeApi.startRealtimeSession"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * Update the RealtimeSession with the given identifier. 
     * @summary Update a RealtimeSession.
     * @param {string} session The unique identifier of the RealtimeSession.
     * @param {RealtimeSessionConfigUpdate} realtimeSessionConfigUpdate 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateRealtimeSession(session, realtimeSessionConfigUpdate, xHumanId, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.updateRealtimeSession(session, realtimeSessionConfigUpdate, xHumanId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["RealtimeApi.updateRealtimeSession"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    }
  };
};
var RealtimeApi = class extends BaseAPI {
  /**
   * Attaches a human to a RealtimeSession. This is useful for previously anonymous sessions, for example sessions created via a phone call.
   * @summary Attach a human to a RealtimeSession
   * @param {string} session The unique identifier of the RealtimeSession.
   * @param {AttachHumanRequest} attachHumanRequest 
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RealtimeApi
   */
  attachHuman(session, attachHumanRequest, options) {
    return RealtimeApiFp(this.configuration).attachHuman(session, attachHumanRequest, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * For a live session, force agent to send DTMF tones
   * @summary DTMF
   * @param {string} session The unique identifier of the RealtimeSession.
   * @param {RealtimeSessionDTMFRequest} realtimeSessionDTMFRequest 
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RealtimeApi
   */
  dtmf(session, realtimeSessionDTMFRequest, options) {
    return RealtimeApiFp(this.configuration).dtmf(session, realtimeSessionDTMFRequest, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * End the RealtimeSession with the given identifier. 
   * @summary End a RealtimeSession.
   * @param {string} session The unique identifier of the RealtimeSession.
   * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RealtimeApi
   */
  endRealtimeSession(session, xHumanId, options) {
    return RealtimeApiFp(this.configuration).endRealtimeSession(session, xHumanId, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * End the RealtimeSession with the given identifier. 
   * @summary Get a RealtimeSession.
   * @param {string} session The unique identifier of the RealtimeSession.
   * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RealtimeApi
   */
  getRealtimeSession(session, xHumanId, options) {
    return RealtimeApiFp(this.configuration).getRealtimeSession(session, xHumanId, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * Get all ContextMessages associated with the given RealtimeSession. 
   * @summary Get a RealtimeSession messages.
   * @param {string} session The unique identifier of the RealtimeSession.
   * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RealtimeApi
   */
  getRealtimeSessionMessages(session, xHumanId, options) {
    return RealtimeApiFp(this.configuration).getRealtimeSessionMessages(session, xHumanId, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * Get the timeline of the RealtimeSession with the given identifier. 
   * @summary Get a RealtimeSession timeline.
   * @param {string} session The unique identifier of the RealtimeSession.
   * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RealtimeApi
   */
  getRealtimeSessionTimeline(session, xHumanId, options) {
    return RealtimeApiFp(this.configuration).getRealtimeSessionTimeline(session, xHumanId, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * Initiate an outbound call from a RealtimeSession. 
   * @summary Initiate an outbound call.
   * @param {string} session The unique identifier of the RealtimeSession.
   * @param {RealtimeSessionInitiateOutboundCallRequest} realtimeSessionInitiateOutboundCallRequest 
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RealtimeApi
   */
  initiateOutboundCall(session, realtimeSessionInitiateOutboundCallRequest, options) {
    return RealtimeApiFp(this.configuration).initiateOutboundCall(session, realtimeSessionInitiateOutboundCallRequest, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * List all Realtime Sessions. 
   * @summary List Realtime Sessions.
   * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
   * @param {string} [page] Page token for pagination
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RealtimeApi
   */
  listRealtimeSessions(xHumanId, page, options) {
    return RealtimeApiFp(this.configuration).listRealtimeSessions(xHumanId, page, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * For a live session, force the agent to speak a given text.
   * @summary Speak
   * @param {string} session The unique identifier of the RealtimeSession.
   * @param {SpeakRequest} speakRequest 
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RealtimeApi
   */
  speak(session, speakRequest, options) {
    return RealtimeApiFp(this.configuration).speak(session, speakRequest, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * Start a new RealtimeSession with the given configuration. 
   * @summary Start a new RealtimeSession.
   * @param {StartRealtimeSessionRequest} startRealtimeSessionRequest 
   * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RealtimeApi
   */
  startRealtimeSession(startRealtimeSessionRequest, xHumanId, options) {
    return RealtimeApiFp(this.configuration).startRealtimeSession(startRealtimeSessionRequest, xHumanId, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * Update the RealtimeSession with the given identifier. 
   * @summary Update a RealtimeSession.
   * @param {string} session The unique identifier of the RealtimeSession.
   * @param {RealtimeSessionConfigUpdate} realtimeSessionConfigUpdate 
   * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RealtimeApi
   */
  updateRealtimeSession(session, realtimeSessionConfigUpdate, xHumanId, options) {
    return RealtimeApiFp(this.configuration).updateRealtimeSession(session, realtimeSessionConfigUpdate, xHumanId, options).then((request) => request(this.axios, this.basePath));
  }
};
var ScenarioApiAxiosParamCreator = function(configuration) {
  return {
    /**
     * 
     * @summary Create a scenario
     * @param {CreateScenarioRequest} createScenarioRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createScenario: async (createScenarioRequest, options = {}) => {
      assertParamExists("createScenario", "createScenarioRequest", createScenarioRequest);
      const localVarPath = `/v1/scenario`;
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "POST", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      localVarHeaderParameter["Content-Type"] = "application/json";
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      localVarRequestOptions.data = serializeDataIfNeeded(createScenarioRequest, localVarRequestOptions, configuration);
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * 
     * @summary Delete a scenario
     * @param {string} scenarioId 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteScenario: async (scenarioId, xHumanId, options = {}) => {
      assertParamExists("deleteScenario", "scenarioId", scenarioId);
      const localVarPath = `/v1/scenario/{scenario_id}`.replace(`{${"scenario_id"}}`, encodeURIComponent(String(scenarioId)));
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "DELETE", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      if (xHumanId != null) {
        localVarHeaderParameter["x-human-id"] = String(xHumanId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * 
     * @summary Get a scenario
     * @param {string} scenarioId 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getScenario: async (scenarioId, xHumanId, options = {}) => {
      assertParamExists("getScenario", "scenarioId", scenarioId);
      const localVarPath = `/v1/scenario/{scenario_id}`.replace(`{${"scenario_id"}}`, encodeURIComponent(String(scenarioId)));
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "GET", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      if (xHumanId != null) {
        localVarHeaderParameter["x-human-id"] = String(xHumanId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * 
     * @summary Get a list of scenarios
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listScenarios: async (xHumanId, options = {}) => {
      const localVarPath = `/v1/scenario/list`;
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "GET", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      if (xHumanId != null) {
        localVarHeaderParameter["x-human-id"] = String(xHumanId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * 
     * @summary Update a scenario
     * @param {string} scenarioId 
     * @param {UpdateScenarioRequest} updateScenarioRequest 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateScenario: async (scenarioId, updateScenarioRequest, xHumanId, options = {}) => {
      assertParamExists("updateScenario", "scenarioId", scenarioId);
      assertParamExists("updateScenario", "updateScenarioRequest", updateScenarioRequest);
      const localVarPath = `/v1/scenario/{scenario_id}`.replace(`{${"scenario_id"}}`, encodeURIComponent(String(scenarioId)));
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "PUT", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      if (xHumanId != null) {
        localVarHeaderParameter["x-human-id"] = String(xHumanId);
      }
      localVarHeaderParameter["Content-Type"] = "application/json";
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      localVarRequestOptions.data = serializeDataIfNeeded(updateScenarioRequest, localVarRequestOptions, configuration);
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    }
  };
};
var ScenarioApiFp = function(configuration) {
  const localVarAxiosParamCreator = ScenarioApiAxiosParamCreator(configuration);
  return {
    /**
     * 
     * @summary Create a scenario
     * @param {CreateScenarioRequest} createScenarioRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createScenario(createScenarioRequest, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.createScenario(createScenarioRequest, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["ScenarioApi.createScenario"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * 
     * @summary Delete a scenario
     * @param {string} scenarioId 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteScenario(scenarioId, xHumanId, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.deleteScenario(scenarioId, xHumanId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["ScenarioApi.deleteScenario"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * 
     * @summary Get a scenario
     * @param {string} scenarioId 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getScenario(scenarioId, xHumanId, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getScenario(scenarioId, xHumanId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["ScenarioApi.getScenario"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * 
     * @summary Get a list of scenarios
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listScenarios(xHumanId, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.listScenarios(xHumanId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["ScenarioApi.listScenarios"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * 
     * @summary Update a scenario
     * @param {string} scenarioId 
     * @param {UpdateScenarioRequest} updateScenarioRequest 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateScenario(scenarioId, updateScenarioRequest, xHumanId, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.updateScenario(scenarioId, updateScenarioRequest, xHumanId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["ScenarioApi.updateScenario"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    }
  };
};
var ScenarioApi = class extends BaseAPI {
  /**
   * 
   * @summary Create a scenario
   * @param {CreateScenarioRequest} createScenarioRequest 
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ScenarioApi
   */
  createScenario(createScenarioRequest, options) {
    return ScenarioApiFp(this.configuration).createScenario(createScenarioRequest, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * 
   * @summary Delete a scenario
   * @param {string} scenarioId 
   * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ScenarioApi
   */
  deleteScenario(scenarioId, xHumanId, options) {
    return ScenarioApiFp(this.configuration).deleteScenario(scenarioId, xHumanId, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * 
   * @summary Get a scenario
   * @param {string} scenarioId 
   * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ScenarioApi
   */
  getScenario(scenarioId, xHumanId, options) {
    return ScenarioApiFp(this.configuration).getScenario(scenarioId, xHumanId, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * 
   * @summary Get a list of scenarios
   * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ScenarioApi
   */
  listScenarios(xHumanId, options) {
    return ScenarioApiFp(this.configuration).listScenarios(xHumanId, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * 
   * @summary Update a scenario
   * @param {string} scenarioId 
   * @param {UpdateScenarioRequest} updateScenarioRequest 
   * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ScenarioApi
   */
  updateScenario(scenarioId, updateScenarioRequest, xHumanId, options) {
    return ScenarioApiFp(this.configuration).updateScenario(scenarioId, updateScenarioRequest, xHumanId, options).then((request) => request(this.axios, this.basePath));
  }
};
var ToolApiAxiosParamCreator = function(configuration) {
  return {
    /**
     * Create a tool definition
     * @summary Create a tool definition
     * @param {CreateToolDefinitionRequest} createToolDefinitionRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createToolDefinition: async (createToolDefinitionRequest, options = {}) => {
      assertParamExists("createToolDefinition", "createToolDefinitionRequest", createToolDefinitionRequest);
      const localVarPath = `/v1/tool`;
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "POST", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      localVarHeaderParameter["Content-Type"] = "application/json";
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      localVarRequestOptions.data = serializeDataIfNeeded(createToolDefinitionRequest, localVarRequestOptions, configuration);
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * Delete a tool definition
     * @summary Delete a tool definition
     * @param {string} tool 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteToolDefinition: async (tool, options = {}) => {
      assertParamExists("deleteToolDefinition", "tool", tool);
      const localVarPath = `/v1/tool/{tool}`.replace(`{${"tool"}}`, encodeURIComponent(String(tool)));
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "DELETE", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * Get a tool call result
     * @summary Get a tool call result
     * @param {string} call 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getToolCallResult: async (call, options = {}) => {
      assertParamExists("getToolCallResult", "call", call);
      const localVarPath = `/v1/tool/call/{call}/result`.replace(`{${"call"}}`, encodeURIComponent(String(call)));
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "GET", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * Get a tool definition
     * @summary Get a tool definition
     * @param {string} tool 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getToolDefinition: async (tool, options = {}) => {
      assertParamExists("getToolDefinition", "tool", tool);
      const localVarPath = `/v1/tool/{tool}`.replace(`{${"tool"}}`, encodeURIComponent(String(tool)));
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "GET", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * List tools
     * @summary List tools
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listToolDefinitions: async (options = {}) => {
      const localVarPath = `/v1/tool/list`;
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "GET", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * Update a tool definition
     * @summary Update a tool definition
     * @param {string} tool 
     * @param {CreateToolDefinitionRequest} createToolDefinitionRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateToolDefinition: async (tool, createToolDefinitionRequest, options = {}) => {
      assertParamExists("updateToolDefinition", "tool", tool);
      assertParamExists("updateToolDefinition", "createToolDefinitionRequest", createToolDefinitionRequest);
      const localVarPath = `/v1/tool/{tool}`.replace(`{${"tool"}}`, encodeURIComponent(String(tool)));
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "PUT", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      localVarHeaderParameter["Content-Type"] = "application/json";
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      localVarRequestOptions.data = serializeDataIfNeeded(createToolDefinitionRequest, localVarRequestOptions, configuration);
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    }
  };
};
var ToolApiFp = function(configuration) {
  const localVarAxiosParamCreator = ToolApiAxiosParamCreator(configuration);
  return {
    /**
     * Create a tool definition
     * @summary Create a tool definition
     * @param {CreateToolDefinitionRequest} createToolDefinitionRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createToolDefinition(createToolDefinitionRequest, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.createToolDefinition(createToolDefinitionRequest, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["ToolApi.createToolDefinition"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * Delete a tool definition
     * @summary Delete a tool definition
     * @param {string} tool 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteToolDefinition(tool, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.deleteToolDefinition(tool, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["ToolApi.deleteToolDefinition"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * Get a tool call result
     * @summary Get a tool call result
     * @param {string} call 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getToolCallResult(call, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getToolCallResult(call, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["ToolApi.getToolCallResult"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * Get a tool definition
     * @summary Get a tool definition
     * @param {string} tool 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getToolDefinition(tool, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getToolDefinition(tool, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["ToolApi.getToolDefinition"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * List tools
     * @summary List tools
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listToolDefinitions(options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.listToolDefinitions(options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["ToolApi.listToolDefinitions"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * Update a tool definition
     * @summary Update a tool definition
     * @param {string} tool 
     * @param {CreateToolDefinitionRequest} createToolDefinitionRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateToolDefinition(tool, createToolDefinitionRequest, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.updateToolDefinition(tool, createToolDefinitionRequest, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["ToolApi.updateToolDefinition"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    }
  };
};
var ToolApi = class extends BaseAPI {
  /**
   * Create a tool definition
   * @summary Create a tool definition
   * @param {CreateToolDefinitionRequest} createToolDefinitionRequest 
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ToolApi
   */
  createToolDefinition(createToolDefinitionRequest, options) {
    return ToolApiFp(this.configuration).createToolDefinition(createToolDefinitionRequest, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * Delete a tool definition
   * @summary Delete a tool definition
   * @param {string} tool 
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ToolApi
   */
  deleteToolDefinition(tool, options) {
    return ToolApiFp(this.configuration).deleteToolDefinition(tool, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * Get a tool call result
   * @summary Get a tool call result
   * @param {string} call 
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ToolApi
   */
  getToolCallResult(call, options) {
    return ToolApiFp(this.configuration).getToolCallResult(call, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * Get a tool definition
   * @summary Get a tool definition
   * @param {string} tool 
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ToolApi
   */
  getToolDefinition(tool, options) {
    return ToolApiFp(this.configuration).getToolDefinition(tool, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * List tools
   * @summary List tools
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ToolApi
   */
  listToolDefinitions(options) {
    return ToolApiFp(this.configuration).listToolDefinitions(options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * Update a tool definition
   * @summary Update a tool definition
   * @param {string} tool 
   * @param {CreateToolDefinitionRequest} createToolDefinitionRequest 
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ToolApi
   */
  updateToolDefinition(tool, createToolDefinitionRequest, options) {
    return ToolApiFp(this.configuration).updateToolDefinition(tool, createToolDefinitionRequest, options).then((request) => request(this.axios, this.basePath));
  }
};
var UsageApiAxiosParamCreator = function(configuration) {
  return {
    /**
     * Checks the validity of a human token
     * @summary Check a usage token
     * @param {CheckUsageTokenRequest} checkUsageTokenRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    checkUsageToken: async (checkUsageTokenRequest, options = {}) => {
      assertParamExists("checkUsageToken", "checkUsageTokenRequest", checkUsageTokenRequest);
      const localVarPath = `/v1/usage/token/check`;
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "POST", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      localVarHeaderParameter["Content-Type"] = "application/json";
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      localVarRequestOptions.data = serializeDataIfNeeded(checkUsageTokenRequest, localVarRequestOptions, configuration);
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * Requests a token for a human
     * @summary Create a new usage token
     * @param {UsageTokenRequest} usageTokenRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createUsageToken: async (usageTokenRequest, options = {}) => {
      assertParamExists("createUsageToken", "usageTokenRequest", usageTokenRequest);
      const localVarPath = `/v1/usage/token`;
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "POST", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      localVarHeaderParameter["Content-Type"] = "application/json";
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      localVarRequestOptions.data = serializeDataIfNeeded(usageTokenRequest, localVarRequestOptions, configuration);
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * Gets the usage limits of a token
     * @summary Get usage limits
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @deprecated
     * @throws {RequiredError}
     */
    getUsageLimits: async (xHumanId, options = {}) => {
      const localVarPath = `/v1/usage/limits`;
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "GET", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      if (xHumanId != null) {
        localVarHeaderParameter["x-human-id"] = String(xHumanId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * Revokes a human token
     * @summary Revoke a usage token
     * @param {RevokeUsageTokenRequest} revokeUsageTokenRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    revokeUsageToken: async (revokeUsageTokenRequest, options = {}) => {
      assertParamExists("revokeUsageToken", "revokeUsageTokenRequest", revokeUsageTokenRequest);
      const localVarPath = `/v1/usage/token/revoke`;
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "POST", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      localVarHeaderParameter["Content-Type"] = "application/json";
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      localVarRequestOptions.data = serializeDataIfNeeded(revokeUsageTokenRequest, localVarRequestOptions, configuration);
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * Updates the usage limits of a human
     * @summary Update limits on a usage token
     * @param {UpdateUsageLimitsRequest} updateUsageLimitsRequest 
     * @param {*} [options] Override http request option.
     * @deprecated
     * @throws {RequiredError}
     */
    updateUsageToken: async (updateUsageLimitsRequest, options = {}) => {
      assertParamExists("updateUsageToken", "updateUsageLimitsRequest", updateUsageLimitsRequest);
      const localVarPath = `/v1/usage/token`;
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "PUT", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      localVarHeaderParameter["Content-Type"] = "application/json";
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      localVarRequestOptions.data = serializeDataIfNeeded(updateUsageLimitsRequest, localVarRequestOptions, configuration);
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * Updates the TTL of a human tokan
     * @summary Update the TTL of a usage token
     * @param {UpdateUsageTokenTTLRequest} updateUsageTokenTTLRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateUsageTokenTTL: async (updateUsageTokenTTLRequest, options = {}) => {
      assertParamExists("updateUsageTokenTTL", "updateUsageTokenTTLRequest", updateUsageTokenTTLRequest);
      const localVarPath = `/v1/usage/token/update_ttl`;
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "POST", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      localVarHeaderParameter["Content-Type"] = "application/json";
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      localVarRequestOptions.data = serializeDataIfNeeded(updateUsageTokenTTLRequest, localVarRequestOptions, configuration);
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    }
  };
};
var UsageApiFp = function(configuration) {
  const localVarAxiosParamCreator = UsageApiAxiosParamCreator(configuration);
  return {
    /**
     * Checks the validity of a human token
     * @summary Check a usage token
     * @param {CheckUsageTokenRequest} checkUsageTokenRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async checkUsageToken(checkUsageTokenRequest, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.checkUsageToken(checkUsageTokenRequest, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["UsageApi.checkUsageToken"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * Requests a token for a human
     * @summary Create a new usage token
     * @param {UsageTokenRequest} usageTokenRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createUsageToken(usageTokenRequest, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.createUsageToken(usageTokenRequest, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["UsageApi.createUsageToken"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * Gets the usage limits of a token
     * @summary Get usage limits
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @deprecated
     * @throws {RequiredError}
     */
    async getUsageLimits(xHumanId, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getUsageLimits(xHumanId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["UsageApi.getUsageLimits"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * Revokes a human token
     * @summary Revoke a usage token
     * @param {RevokeUsageTokenRequest} revokeUsageTokenRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async revokeUsageToken(revokeUsageTokenRequest, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.revokeUsageToken(revokeUsageTokenRequest, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["UsageApi.revokeUsageToken"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * Updates the usage limits of a human
     * @summary Update limits on a usage token
     * @param {UpdateUsageLimitsRequest} updateUsageLimitsRequest 
     * @param {*} [options] Override http request option.
     * @deprecated
     * @throws {RequiredError}
     */
    async updateUsageToken(updateUsageLimitsRequest, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.updateUsageToken(updateUsageLimitsRequest, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["UsageApi.updateUsageToken"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * Updates the TTL of a human tokan
     * @summary Update the TTL of a usage token
     * @param {UpdateUsageTokenTTLRequest} updateUsageTokenTTLRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateUsageTokenTTL(updateUsageTokenTTLRequest, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.updateUsageTokenTTL(updateUsageTokenTTLRequest, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["UsageApi.updateUsageTokenTTL"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    }
  };
};
var UsageApi = class extends BaseAPI {
  /**
   * Checks the validity of a human token
   * @summary Check a usage token
   * @param {CheckUsageTokenRequest} checkUsageTokenRequest 
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsageApi
   */
  checkUsageToken(checkUsageTokenRequest, options) {
    return UsageApiFp(this.configuration).checkUsageToken(checkUsageTokenRequest, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * Requests a token for a human
   * @summary Create a new usage token
   * @param {UsageTokenRequest} usageTokenRequest 
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsageApi
   */
  createUsageToken(usageTokenRequest, options) {
    return UsageApiFp(this.configuration).createUsageToken(usageTokenRequest, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * Gets the usage limits of a token
   * @summary Get usage limits
   * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
   * @param {*} [options] Override http request option.
   * @deprecated
   * @throws {RequiredError}
   * @memberof UsageApi
   */
  getUsageLimits(xHumanId, options) {
    return UsageApiFp(this.configuration).getUsageLimits(xHumanId, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * Revokes a human token
   * @summary Revoke a usage token
   * @param {RevokeUsageTokenRequest} revokeUsageTokenRequest 
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsageApi
   */
  revokeUsageToken(revokeUsageTokenRequest, options) {
    return UsageApiFp(this.configuration).revokeUsageToken(revokeUsageTokenRequest, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * Updates the usage limits of a human
   * @summary Update limits on a usage token
   * @param {UpdateUsageLimitsRequest} updateUsageLimitsRequest 
   * @param {*} [options] Override http request option.
   * @deprecated
   * @throws {RequiredError}
   * @memberof UsageApi
   */
  updateUsageToken(updateUsageLimitsRequest, options) {
    return UsageApiFp(this.configuration).updateUsageToken(updateUsageLimitsRequest, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * Updates the TTL of a human tokan
   * @summary Update the TTL of a usage token
   * @param {UpdateUsageTokenTTLRequest} updateUsageTokenTTLRequest 
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsageApi
   */
  updateUsageTokenTTL(updateUsageTokenTTLRequest, options) {
    return UsageApiFp(this.configuration).updateUsageTokenTTL(updateUsageTokenTTLRequest, options).then((request) => request(this.axios, this.basePath));
  }
};
var VoiceApiAxiosParamCreator = function(configuration) {
  return {
    /**
     * Creates a new cloned voice based on the input audio file
     * @summary Clone a voice
     * @param {string} name Name of the new voice
     * @param {string} language Language of the voice (e.g., \\\&#39;en\\\&#39;, \\\&#39;es\\\&#39;, \\\&#39;fr\\\&#39;)
     * @param {File} file Audio file for voice cloning (MP3 format)
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    cloneVoice: async (name, language, file, xHumanId, options = {}) => {
      assertParamExists("cloneVoice", "name", name);
      assertParamExists("cloneVoice", "language", language);
      assertParamExists("cloneVoice", "file", file);
      const localVarPath = `/v1/voice/clone`;
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "POST", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      const localVarFormParams = new (configuration && configuration.formDataCtor || FormData)();
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      if (xHumanId != null) {
        localVarHeaderParameter["x-human-id"] = String(xHumanId);
      }
      if (name !== undefined) {
        localVarFormParams.append("name", name);
      }
      if (language !== undefined) {
        localVarFormParams.append("language", language);
      }
      if (file !== undefined) {
        localVarFormParams.append("file", file);
      }
      localVarHeaderParameter["Content-Type"] = "multipart/form-data";
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      localVarRequestOptions.data = localVarFormParams;
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * 
     * @summary Delete a voice
     * @param {string} voiceId 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteVoice: async (voiceId, options = {}) => {
      assertParamExists("deleteVoice", "voiceId", voiceId);
      const localVarPath = `/v1/voice/{voice_id}`.replace(`{${"voice_id"}}`, encodeURIComponent(String(voiceId)));
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "DELETE", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * Generates speech from input text and specified voice
     * @summary Generate voice
     * @param {GenerateVoiceRequest} generateVoiceRequest 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    generateVoice: async (generateVoiceRequest, xHumanId, options = {}) => {
      assertParamExists("generateVoice", "generateVoiceRequest", generateVoiceRequest);
      const localVarPath = `/v1/voice/generate`;
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "POST", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      if (xHumanId != null) {
        localVarHeaderParameter["x-human-id"] = String(xHumanId);
      }
      localVarHeaderParameter["Content-Type"] = "application/json";
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      localVarRequestOptions.data = serializeDataIfNeeded(generateVoiceRequest, localVarRequestOptions, configuration);
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * 
     * @summary Get a voice
     * @param {string} voiceId 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getVoice: async (voiceId, options = {}) => {
      assertParamExists("getVoice", "voiceId", voiceId);
      const localVarPath = `/v1/voice/{voice_id}`.replace(`{${"voice_id"}}`, encodeURIComponent(String(voiceId)));
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "GET", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * 
     * @summary Get a list of voices
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {Array<string>} [tags] Filter voices by tag names
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listVoices: async (xHumanId, tags, options = {}) => {
      const localVarPath = `/v1/voice/list`;
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "GET", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      if (tags) {
        localVarQueryParameter["tags"] = tags;
      }
      if (xHumanId != null) {
        localVarHeaderParameter["x-human-id"] = String(xHumanId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    },
    /**
     * Updates a voice based on the input request data
     * @summary Update a voice
     * @param {string} voiceId 
     * @param {UpdateVoiceRequest} updateVoiceRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateVoice: async (voiceId, updateVoiceRequest, options = {}) => {
      assertParamExists("updateVoice", "voiceId", voiceId);
      assertParamExists("updateVoice", "updateVoiceRequest", updateVoiceRequest);
      const localVarPath = `/v1/voice/{voice_id}`.replace(`{${"voice_id"}}`, encodeURIComponent(String(voiceId)));
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: "PUT", ...baseOptions, ...options };
      const localVarHeaderParameter = {};
      const localVarQueryParameter = {};
      await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration);
      await setBearerAuthToObject(localVarHeaderParameter, configuration);
      localVarHeaderParameter["Content-Type"] = "application/json";
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      localVarRequestOptions.data = serializeDataIfNeeded(updateVoiceRequest, localVarRequestOptions, configuration);
      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions
      };
    }
  };
};
var VoiceApiFp = function(configuration) {
  const localVarAxiosParamCreator = VoiceApiAxiosParamCreator(configuration);
  return {
    /**
     * Creates a new cloned voice based on the input audio file
     * @summary Clone a voice
     * @param {string} name Name of the new voice
     * @param {string} language Language of the voice (e.g., \\\&#39;en\\\&#39;, \\\&#39;es\\\&#39;, \\\&#39;fr\\\&#39;)
     * @param {File} file Audio file for voice cloning (MP3 format)
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async cloneVoice(name, language, file, xHumanId, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.cloneVoice(name, language, file, xHumanId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["VoiceApi.cloneVoice"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * 
     * @summary Delete a voice
     * @param {string} voiceId 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteVoice(voiceId, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.deleteVoice(voiceId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["VoiceApi.deleteVoice"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * Generates speech from input text and specified voice
     * @summary Generate voice
     * @param {GenerateVoiceRequest} generateVoiceRequest 
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async generateVoice(generateVoiceRequest, xHumanId, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.generateVoice(generateVoiceRequest, xHumanId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["VoiceApi.generateVoice"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * 
     * @summary Get a voice
     * @param {string} voiceId 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getVoice(voiceId, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getVoice(voiceId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["VoiceApi.getVoice"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * 
     * @summary Get a list of voices
     * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
     * @param {Array<string>} [tags] Filter voices by tag names
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listVoices(xHumanId, tags, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.listVoices(xHumanId, tags, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["VoiceApi.listVoices"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * Updates a voice based on the input request data
     * @summary Update a voice
     * @param {string} voiceId 
     * @param {UpdateVoiceRequest} updateVoiceRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateVoice(voiceId, updateVoiceRequest, options) {
      const localVarAxiosArgs = await localVarAxiosParamCreator.updateVoice(voiceId, updateVoiceRequest, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath = operationServerMap["VoiceApi.updateVoice"]?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios7, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
    }
  };
};
var VoiceApi = class extends BaseAPI {
  /**
   * Creates a new cloned voice based on the input audio file
   * @summary Clone a voice
   * @param {string} name Name of the new voice
   * @param {string} language Language of the voice (e.g., \\\&#39;en\\\&#39;, \\\&#39;es\\\&#39;, \\\&#39;fr\\\&#39;)
   * @param {File} file Audio file for voice cloning (MP3 format)
   * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VoiceApi
   */
  cloneVoice(name, language, file, xHumanId, options) {
    return VoiceApiFp(this.configuration).cloneVoice(name, language, file, xHumanId, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * 
   * @summary Delete a voice
   * @param {string} voiceId 
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VoiceApi
   */
  deleteVoice(voiceId, options) {
    return VoiceApiFp(this.configuration).deleteVoice(voiceId, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * Generates speech from input text and specified voice
   * @summary Generate voice
   * @param {GenerateVoiceRequest} generateVoiceRequest 
   * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VoiceApi
   */
  generateVoice(generateVoiceRequest, xHumanId, options) {
    return VoiceApiFp(this.configuration).generateVoice(generateVoiceRequest, xHumanId, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * 
   * @summary Get a voice
   * @param {string} voiceId 
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VoiceApi
   */
  getVoice(voiceId, options) {
    return VoiceApiFp(this.configuration).getVoice(voiceId, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * 
   * @summary Get a list of voices
   * @param {string} [xHumanId] When using x-api-key authentication, this header is used to scope requests to a specific human.
   * @param {Array<string>} [tags] Filter voices by tag names
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VoiceApi
   */
  listVoices(xHumanId, tags, options) {
    return VoiceApiFp(this.configuration).listVoices(xHumanId, tags, options).then((request) => request(this.axios, this.basePath));
  }
  /**
   * Updates a voice based on the input request data
   * @summary Update a voice
   * @param {string} voiceId 
   * @param {UpdateVoiceRequest} updateVoiceRequest 
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VoiceApi
   */
  updateVoice(voiceId, updateVoiceRequest, options) {
    return VoiceApiFp(this.configuration).updateVoice(voiceId, updateVoiceRequest, options).then((request) => request(this.axios, this.basePath));
  }
};

// src/generated/configuration.ts
var Configuration = class {
  constructor(param = {}) {
    this.apiKey = param.apiKey;
    this.username = param.username;
    this.password = param.password;
    this.accessToken = param.accessToken;
    this.basePath = param.basePath;
    this.serverIndex = param.serverIndex;
    this.baseOptions = param.baseOptions;
    this.formDataCtor = param.formDataCtor;
  }
  /**
   * Check if the given MIME is a JSON MIME.
   * JSON MIME examples:
   *   application/json
   *   application/json; charset=UTF8
   *   APPLICATION/JSON
   *   application/vnd.company+json
   * @param mime - MIME (Multipurpose Internet Mail Extensions)
   * @return True if the given MIME is JSON, false otherwise.
   */
  isJsonMime(mime) {
    const jsonMime = new RegExp("^(application/json|[^;/ 	]+/[^;/ 	]+[+]json)[ 	]*(;.*)?$", "i");
    return mime !== null && (jsonMime.test(mime) || mime.toLowerCase() === "application/json-patch+json");
  }
};

// src/generated/model/bad-request.ts
var BadRequestTypeEnum = {
  UsageLimitExceeded: "usage_limit_exceeded",
  ProjectDisabled: "project_disabled",
  ModerationError: "moderation_error",
  InvalidInput: "invalid_input"
};

// src/generated/model/chat-completion-message-tool-call.ts
var ChatCompletionMessageToolCallTypeEnum = {
  Function: "function",
  GabberTool: "gabber_tool"
};

// src/generated/model/chat-completion-message-tool-call-chunk.ts
var ChatCompletionMessageToolCallChunkTypeEnum = {
  Function: "function",
  GabberTool: "gabber_tool"
};

// src/generated/model/chat-completion-named-tool-choice.ts
var ChatCompletionNamedToolChoiceTypeEnum = {
  Function: "function"
};

// src/generated/model/chat-completion-request-assistant-message.ts
var ChatCompletionRequestAssistantMessageRoleEnum = {
  Assistant: "assistant"
};

// src/generated/model/chat-completion-request-message-content-part-audio.ts
var ChatCompletionRequestMessageContentPartAudioTypeEnum = {
  InputAudio: "input_audio"
};

// src/generated/model/chat-completion-request-message-content-part-audio-input-audio.ts
var ChatCompletionRequestMessageContentPartAudioInputAudioFormatEnum = {
  Wav: "wav",
  Mp3: "mp3",
  Ogg: "ogg"
};

// src/generated/model/chat-completion-request-message-content-part-text.ts
var ChatCompletionRequestMessageContentPartTextTypeEnum = {
  Text: "text"
};

// src/generated/model/chat-completion-request-system-message.ts
var ChatCompletionRequestSystemMessageRoleEnum = {
  System: "system"
};

// src/generated/model/chat-completion-request-tool-message.ts
var ChatCompletionRequestToolMessageRoleEnum = {
  Tool: "tool"
};

// src/generated/model/chat-completion-request-user-message.ts
var ChatCompletionRequestUserMessageRoleEnum = {
  User: "user"
};

// src/generated/model/chat-completion-response-gabber-message-data.ts
var ChatCompletionResponseGabberMessageDataTypeEnum = {
  AudioTranscript: "audio_transcript"
};

// src/generated/model/chat-completion-response-message.ts
var ChatCompletionResponseMessageRoleEnum = {
  Assistant: "assistant"
};

// src/generated/model/chat-completion-stream-response.ts
var ChatCompletionStreamResponseObjectEnum = {
  ChatCompletionChunk: "chat.completion.chunk"
};

// src/generated/model/chat-completion-stream-response-choice.ts
var ChatCompletionStreamResponseChoiceFinishReasonEnum = {
  Stop: "stop",
  Length: "length",
  ToolCalls: "tool_calls",
  ContentFilter: "content_filter",
  FunctionCall: "function_call"
};

// src/generated/model/chat-completion-stream-response-delta.ts
var ChatCompletionStreamResponseDeltaRoleEnum = {
  System: "system",
  User: "user",
  Assistant: "assistant"
};

// src/generated/model/chat-completion-tool.ts
var ChatCompletionToolTypeEnum = {
  Function: "function",
  GabberTool: "gabber_tool"
};

// src/generated/model/context-message.ts
var ContextMessageRoleEnum = {
  Assistant: "assistant",
  System: "system",
  User: "user",
  Tool: "tool"
};

// src/generated/model/context-message-content-text.ts
var ContextMessageContentTextTypeEnum = {
  Text: "text"
};

// src/generated/model/context-message-create-params.ts
var ContextMessageCreateParamsRoleEnum = {
  Assistant: "assistant",
  System: "system",
  User: "user",
  Tool: "tool",
  Custom: "custom"
};

// src/generated/model/context-message-tool-call.ts
var ContextMessageToolCallTypeEnum = {
  Function: "function",
  GabberTool: "gabber_tool"
};

// src/generated/model/create-persona-request.ts
var CreatePersonaRequestGenderEnum = {
  Male: "male",
  Female: "female"
};

// src/generated/model/history-message.ts
var HistoryMessageRoleEnum = {
  Assistant: "assistant",
  System: "system",
  User: "user"
};

// src/generated/model/human-data-type.ts
var HumanDataType = {
  PhoneNumber: "phone_number"
};

// src/generated/model/persona.ts
var PersonaGenderEnum = {
  Male: "male",
  Female: "female"
};

// src/generated/model/realtime-session.ts
var RealtimeSessionStateEnum = {
  Ended: "ended",
  InProgress: "in_progress",
  NotStarted: "not_started"
};

// src/generated/model/realtime-session-dtmfdigit.ts
var RealtimeSessionDTMFDigitDigitEnum = {
  _0: "0",
  _1: "1",
  _2: "2",
  _3: "3",
  _4: "4",
  _5: "5",
  _6: "6",
  _7: "7",
  _8: "8",
  _9: "9",
  Star: "*",
  Hash: "#",
  A: "A",
  B: "B",
  C: "C",
  D: "D",
  Pause: "<pause>"
};

// src/generated/model/realtime-session-data.ts
var RealtimeSessionDataTypeEnum = {
  CallerPhoneNumber: "caller_phone_number",
  AgentPhoneNumber: "agent_phone_number"
};

// src/generated/model/realtime-session-data-type.ts
var RealtimeSessionDataType = {
  CallerPhoneNumber: "caller_phone_number",
  AgentPhoneNumber: "agent_phone_number"
};

// src/generated/model/realtime-session-initiate-outbound-call-request-phone.ts
var RealtimeSessionInitiateOutboundCallRequestPhoneTypeEnum = {
  Phone: "phone"
};

// src/generated/model/realtime-session-timeline-item.ts
var RealtimeSessionTimelineItemTypeEnum = {
  Silence: "silence",
  Agent: "agent",
  User: "user"
};

// src/generated/model/sdkagent-state.ts
var SDKAgentState = {
  Warmup: "warmup",
  Listening: "listening",
  Thinking: "thinking",
  Speaking: "speaking",
  TimeLimitExceeded: "time_limit_exceeded",
  UsageLimitExceeded: "usage_limit_exceeded"
};

// src/generated/model/sdkconnection-state.ts
var SDKConnectionState = {
  NotConnected: "not_connected",
  Connecting: "connecting",
  WaitingForAgent: "waiting_for_agent",
  Connected: "connected"
};

// src/generated/model/session.ts
var SessionStateEnum = {
  Ended: "ended",
  InProgress: "in_progress",
  NotStarted: "not_started"
};

// src/generated/model/session-timeline-item.ts
var SessionTimelineItemTypeEnum = {
  Silence: "silence",
  Agent: "agent",
  User: "user"
};

// src/generated/model/ttswebsocket-request-message-type.ts
var TTSWebsocketRequestMessageType = {
  StartSession: "start_session",
  PushText: "push_text",
  Eos: "eos"
};

// src/generated/model/ttswebsocket-response-message-audio-payload.ts
var TTSWebsocketResponseMessageAudioPayloadAudioFormatEnum = {
  Pcm16le: "pcm16le"
};
var TTSWebsocketResponseMessageAudioPayloadEncodingEnum = {
  Pcm: "pcm"
};

// src/generated/model/ttswebsocket-response-message-type.ts
var TTSWebsocketResponseMessageType = {
  Audio: "audio",
  Final: "final",
  Error: "error"
};

// src/generated/model/tool-definition-call-setting-destination-client-app.ts
var ToolDefinitionCallSettingDestinationClientAppTypeEnum = {
  ClientApp: "client_app"
};

// src/generated/model/tool-definition-call-setting-destination-web-request.ts
var ToolDefinitionCallSettingDestinationWebRequestTypeEnum = {
  WebRequest: "web_request"
};

// src/generated/model/tool-definition-parameter.ts
var ToolDefinitionParameterTypeEnum = {
  String: "string",
  Number: "number",
  Boolean: "boolean",
  Object: "object",
  Array: "array"
};

// src/generated/model/update-persona-request.ts
var UpdatePersonaRequestGenderEnum = {
  Male: "male",
  Female: "female"
};

// src/generated/model/usage-type.ts
var UsageType = {
  ConversationalSeconds: "conversational_seconds",
  VoiceSynthesisSeconds: "voice_synthesis_seconds",
  TokenCnt: "token_cnt",
  MemoryMessageCnt: "memory_message_cnt"
};

// src/generated/model/webhook-message-realtime-session-message-committed.ts
var WebhookMessageRealtimeSessionMessageCommittedTypeEnum = {
  RealtimeSessionMessageCommitted: "realtime_session.message_committed"
};

// src/generated/model/webhook-message-realtime-session-state-changed.ts
var WebhookMessageRealtimeSessionStateChangedTypeEnum = {
  RealtimeSessionStateChanged: "realtime_session.state_changed"
};

// src/generated/model/webhook-message-realtime-session-state-changedpayload-session.ts
var WebhookMessageRealtimeSessionStateChangedpayloadSessionStateEnum = {
  Ended: "ended",
  InProgress: "in_progress",
  NotStarted: "not_started"
};

// src/generated/model/webhook-message-realtime-session-time-limit-exceeded.ts
var WebhookMessageRealtimeSessionTimeLimitExceededTypeEnum = {
  RealtimeSessionTimeLimitExceeded: "realtime_session.time_limit_exceeded"
};

// src/generated/model/webhook-message-tool-calls-finished.ts
var WebhookMessageToolCallsFinishedTypeEnum = {
  ToolCallsFinished: "tool.calls_finished"
};

// src/generated/model/webhook-message-tool-calls-started.ts
var WebhookMessageToolCallsStartedTypeEnum = {
  ToolCallsStarted: "tool.calls_started"
};

// src/generated/model/webhook-message-usage-tracked.ts
var WebhookMessageUsageTrackedTypeEnum = {
  UsageTracked: "usage.tracked"
};

// src/api.ts
var Api = class {
  constructor(token) {
    const config = new Configuration({ accessToken: token });
    this.realtime = new RealtimeApi(config);
    this.persona = new PersonaApi(config);
    this.voice = new VoiceApi(config);
    this.scenario = new ScenarioApi(config);
    this.llm = new LLMApi(config);
    this.usage = new UsageApi(config);
    this.tool = new ToolApi(config);
  }
};

// src/session.ts
var RealtimeSessionEngine = class {
  constructor({
    onConnectionStateChanged,
    onMessagesChanged,
    onMicrophoneChanged,
    onAgentVolumeChanged,
    onUserVolumeChanged,
    onAgentStateChanged,
    onAgentVideoChanged,
    onWebcamChanged,
    onRemainingSecondsChanged,
    onError,
    onCanPlayAudioChanged
  }) {
    this.agentParticipant = null;
    this.agentAudioTrack = null;
    this.agentVideoTrack = null;
    this._videoTrackDestination = undefined;
    this._microphoneEnabledState = false;
    this._agentVideo = false;
    this._webcamState = "off";
    this._webcamTrackDestination = undefined;
    this._webcamTrack = undefined;
    this.transcriptions = [];
    this._agentState = "warmup";
    this._remainingSeconds = null;
    this.id = null;
    this.livekitRoom = new Room();
    this.livekitRoom.on("connected", this.onRoomConnected.bind(this));
    this.livekitRoom.on("disconnected", this.onRoomDisconnected.bind(this));
    this.livekitRoom.on("trackSubscribed", this.onTrackSubscribed.bind(this));
    this.livekitRoom.on(
      "trackUnsubscribed",
      this.onTrackUnsubscribed.bind(this)
    );
    this.livekitRoom.on("dataReceived", this.onDataReceived.bind(this));
    this.livekitRoom.on(
      "participantMetadataChanged",
      this.onParticipantMetadataChanged.bind(this)
    );
    this.livekitRoom.on(
      "localTrackPublished",
      this.onLocalTrackPublished.bind(this)
    );
    this.livekitRoom.on(
      "localTrackUnpublished",
      this.onLocalTrackUnpublished.bind(this)
    );
    this.livekitRoom.on("trackMuted", this.onTrackMuted.bind(this));
    this.livekitRoom.on("trackUnmuted", this.onTrackUnmuted.bind(this));
    this.livekitRoom.on(
      "audioPlaybackChanged",
      this.onAudioPlaybackChangaed.bind(this)
    );
    if (typeof document !== "undefined") {
      this.divElement = document.createElement("div");
      document.body.appendChild(this.divElement);
    } else {
      this.divElement = {};
    }
    this.onConnectionStateChanged = onConnectionStateChanged;
    this.onMessagesChanged = onMessagesChanged;
    this.onMicrophoneChanged = onMicrophoneChanged;
    this.onAgentVolumeChanged = onAgentVolumeChanged;
    this.onUserVolumeChanged = onUserVolumeChanged;
    this.onAgentStateChanged = onAgentStateChanged;
    this.onRemainingSecondsChanged = onRemainingSecondsChanged;
    this.onError = onError;
    this.onCanPlayAudioChanged = onCanPlayAudioChanged;
    this.onAgentVideoChanged = onAgentVideoChanged;
    this.onWebcamChanged = onWebcamChanged;
    this.agentVolumeVisualizer = new TrackVolumeVisualizer({
      onTick: this.onAgentVolumeChanged.bind(this),
      bands: 10
    });
    this.userVolumeVisualizer = new TrackVolumeVisualizer({
      onTick: this.onUserVolumeChanged.bind(this),
      bands: 10
    });
  }
  async connect(opts) {
    let connectionDetails = undefined;
    if ("connection_details" in opts) {
      connectionDetails = opts.connection_details;
    } else if ("token" in opts && "config" in opts) {
      const api = new Api(opts.token);
      const res = await api.realtime.startRealtimeSession(opts);
      connectionDetails = {
        url: res.data.connection_details.url,
        token: res.data.connection_details.token
      };
    }
    if (!connectionDetails) {
      throw new Error("No connection details provided");
    }
    try {
      this.onConnectionStateChanged("connecting");
      await this.livekitRoom.connect(
        connectionDetails.url,
        connectionDetails.token,
        {
          autoSubscribe: true
        }
      );
    } catch (e) {
      this.onConnectionStateChanged("not_connected");
      this.onError(new RealtimeSessionErrorConnect("Error connecting to room"));
    }
    this.onCanPlayAudioChanged(this.livekitRoom.canPlaybackAudio);
  }
  async disconnect() {
    await this.livekitRoom.disconnect();
  }
  async startAudio() {
    try {
      await this.livekitRoom.startAudio();
    } catch (e) {
      console.error("Error starting audio");
    }
  }
  async setMicrophoneEnabled(enabled) {
    await this.livekitRoom.localParticipant.setMicrophoneEnabled(enabled);
  }
  async setWebcamEnabled(enabled) {
    if (enabled === "off") {
      if (this._webcamTrack) {
        await this._webcamTrack.stop();
        this._webcamTrack = undefined;
        this.resolveWebcam();
      }
      return;
    } else if (enabled === "preview") {
      if (this._webcamTrack) {
        const webcamPublication = this.getWebcamTrackPublication();
        if (webcamPublication?.track) {
          await this.livekitRoom.localParticipant.unpublishTrack(webcamPublication.track);
        }
        this.resolveWebcam();
      } else {
        const vt = await createLocalVideoTrack({});
        this._webcamTrack = vt;
        this.resolveWebcam();
      }
    } else if (enabled === "on") {
      if (this._webcamTrack) {
        await this.livekitRoom.localParticipant.publishTrack(this._webcamTrack);
        this.resolveWebcam();
      } else {
        const vt = await createLocalVideoTrack({});
        this._webcamTrack = vt;
        this.resolveWebcam();
        await this.livekitRoom.localParticipant.publishTrack(this._webcamTrack);
        this.resolveWebcam();
      }
    }
  }
  async sendChatMessage({ text }) {
    const te = new TextEncoder();
    const encoded = te.encode(JSON.stringify({ text }));
    await this.livekitRoom.localParticipant.publishData(encoded, {
      topic: "chat_input"
    });
  }
  setWebcamTrackDestination({ element }) {
    if (typeof document === "undefined") {
      return;
    }
    if (typeof element === "string") {
      const el = document.getElementById(element);
      if (!el) {
        console.error("Element not found", element);
        return;
      }
      if (!(el instanceof HTMLVideoElement)) {
        console.error("Element is not a video element", el);
        return;
      }
      element = el;
    } else if (element && !(element instanceof HTMLVideoElement)) {
      console.error("Element is not a video element", element);
      return;
    }
    this._webcamTrackDestination = element;
    this.resolveWebcam();
  }
  setVideoTrackDestination({ element }) {
    if (typeof document === "undefined") {
      return;
    }
    if (typeof element === "string") {
      const el = document.getElementById(element);
      if (!el) {
        console.error("Element not found", element);
        return;
      }
      if (!(el instanceof HTMLVideoElement)) {
        console.error("Element is not a video element", el);
        return;
      }
      element = el;
    } else if (element && !(element instanceof HTMLVideoElement)) {
      console.error("Element is not a video element", element);
      return;
    }
    this._videoTrackDestination = element;
    this.resolveVideoTrackAttachment();
  }
  set agentState(value) {
    if (value == this._agentState) {
      return;
    }
    this._agentState = value;
    this.onAgentStateChanged(value);
  }
  set remainingSeconds(value) {
    if (value === this._remainingSeconds) {
      return;
    }
    this._remainingSeconds = value;
    this.onRemainingSecondsChanged(value);
  }
  set microphoneEnabledState(value) {
    if (this._microphoneEnabledState !== value) {
      this._microphoneEnabledState = value;
      this.onMicrophoneChanged(value);
    }
  }
  set agentVideo(value) {
    if (this._agentVideo !== value) {
      this._agentVideo = value;
      this.onAgentVideoChanged(value);
    }
  }
  resolveMicrophoneState() {
    if (!this.livekitRoom.localParticipant) {
      this.microphoneEnabledState = false;
    }
    this.microphoneEnabledState = this.livekitRoom.localParticipant.isMicrophoneEnabled;
  }
  resolveVideoTrackAttachment() {
    if (!this.agentVideoTrack || !this._videoTrackDestination) {
      return;
    }
    this.agentVideoTrack.attach(this._videoTrackDestination);
  }
  resolveWebcam() {
    let webcamStateChanged = false;
    const pub = this.getWebcamTrackPublication();
    if (pub && this._webcamState !== "on") {
      this._webcamState = "on";
      webcamStateChanged = true;
    }
    if (!pub && this._webcamState !== "preview") {
      this._webcamState = this._webcamTrack ? "preview" : "off";
      webcamStateChanged = true;
    }
    if (webcamStateChanged) {
      this.onWebcamChanged(this._webcamState);
    }
    if (this._webcamTrack && this._webcamTrackDestination) {
      this._webcamTrack.attach(this._webcamTrackDestination);
    }
  }
  onTrackUnmuted(publication, participant) {
    console.log("Local track unmuted", publication, participant);
    if (!participant.isLocal) {
      return;
    }
    if (publication.kind === Track.Kind.Audio) {
      this.resolveMicrophoneState();
    }
  }
  onTrackMuted(publication, participant) {
    console.log("Local track muted", publication, participant);
    if (!participant.isLocal) {
      return;
    }
    if (publication.kind === Track.Kind.Audio) {
      this.resolveMicrophoneState();
    }
  }
  onLocalTrackPublished(publication, participant) {
    console.log("Local track published", publication, participant);
    if (publication.kind === Track.Kind.Audio) {
      this.userVolumeVisualizer.setTrack(
        publication.audioTrack
      );
      this.resolveMicrophoneState();
    } else if (publication.kind === Track.Kind.Video) {
      this.resolveWebcam();
    }
  }
  onLocalTrackUnpublished(publication, participant) {
    console.log("Local track unpublished", publication, participant);
    if (publication.kind === Track.Kind.Audio) {
      this.resolveMicrophoneState();
    } else if (publication.kind === Track.Kind.Video) {
      this.resolveWebcam();
    }
  }
  onAudioPlaybackChangaed(_) {
    this.onCanPlayAudioChanged(this.livekitRoom.canPlaybackAudio);
  }
  onRoomConnected() {
    console.log("Room connected");
    this.resolveMicrophoneState();
    const metadataString = this.livekitRoom.metadata || "{}";
    this.id = JSON.parse(metadataString)["session"] || null;
    this.onConnectionStateChanged("waiting_for_agent");
  }
  onRoomDisconnected() {
    console.log("Room disconnected");
    this.id = null;
    this.resolveMicrophoneState();
    this.onConnectionStateChanged("not_connected");
  }
  onTrackSubscribed(track, pub, participant) {
    console.log("Track subscribed", track, pub, participant);
    if (track.kind === "video") {
      this.agentVideoTrack = track;
      this.agentVideo = true;
      this.resolveVideoTrackAttachment();
    } else if (track.kind === "audio") {
      if (this.agentParticipant) {
        console.error("Already subscribed to an agent");
        return;
      }
      this.agentAudioTrack?.detach();
      this.divElement.appendChild(track.attach());
      this.agentParticipant = participant;
      this.agentAudioTrack = track;
      this.agentVolumeVisualizer.setTrack(track);
    }
    this.onConnectionStateChanged("connected");
  }
  onTrackUnsubscribed(track, pub, participant) {
    console.log("Track unsubscribed", track, pub, participant);
    if (track.kind === "video") {
      this.agentVideoTrack = null;
      this.agentVideo = false;
      this.resolveVideoTrackAttachment();
    } else if (track.kind === "audio") {
      track.attachedElements.forEach((el) => {
        el.remove();
      });
      if (track !== this.agentAudioTrack) {
        console.error("Unsubscribed from unknown track");
        return;
      }
      this.agentParticipant = null;
      this.agentAudioTrack = null;
      if (this.livekitRoom.state === "connected") {
        this.onConnectionStateChanged("waiting_for_agent");
      }
    }
  }
  onDataReceived(data, participant, _, topic) {
    if (participant?.kind !== ParticipantKind.AGENT) {
      return;
    }
    const decoded = new TextDecoder().decode(data);
    console.log("Data received", decoded, participant, topic);
    if (topic === "message") {
      const message = JSON.parse(decoded);
      for (let i = 0; i < this.transcriptions.length; i++) {
        if (this.transcriptions[i].id === message.id && this.transcriptions[i].agent == message.agent) {
          this.transcriptions[i] = message;
          this.onMessagesChanged(this.transcriptions);
          return;
        }
      }
      this.transcriptions.push(message);
      this.onMessagesChanged(this.transcriptions);
    } else if (topic === "error") {
      const payload = JSON.parse(decoded);
      this.onError(new RealtimeSessionErrorUnknown(payload.message));
    }
  }
  onParticipantMetadataChanged(_, participant) {
    if (!participant.metadata || !participant.isAgent) {
      return;
    }
    try {
      const md = JSON.parse(participant.metadata);
      if (md.remaining_seconds) {
        this.remainingSeconds = md.remaining_seconds;
      }
      const { agent_state } = md;
      if (agent_state != "speaking" && agent_state != "listening" && agent_state != "thinking" && agent_state != "warmup" && agent_state != "time_limit_exceeded" && agent_state != "usage_limit_exceeded") {
        console.error("Unrecognized agent_state", agent_state);
        return;
      }
      this.agentState = agent_state;
    } catch (e) {
      console.error("Error on participant metadata cb", e);
    }
  }
  getWebcamTrackPublication() {
    for (const key in this.livekitRoom.localParticipant.videoTrackPublications) {
      const publication = this.livekitRoom.localParticipant.videoTrackPublications.get(key);
      if (publication?.kind === Track.Kind.Video) {
        return publication;
      }
    }
    return undefined;
  }
  destroy() {
    if (typeof document === "undefined") {
      return;
    }
    document.body.removeChild(this.divElement);
    try {
      this.livekitRoom.removeAllListeners();
      this.livekitRoom.disconnect(true);
    } catch (e) {
      console.error("Error destroying session", e);
    }
  }
};
var RealtimeSessionErrorConnect = class extends Error {
  constructor(message) {
    super(message);
    this.name = "ConnectError";
  }
};
var RealtimeSessionErrorUnknown = class extends Error {
  constructor(message) {
    super(message);
    this.name = "UnknownError";
  }
};

// src/v2/index.ts
var v2_exports = {};
__export(v2_exports, {
  AppEngine: () => AppEngine,
  PadType: () => PadType,
  StreamPad: () => StreamPad,
  WorkflowNode: () => WorkflowNode,
  deriveDataType: () => deriveDataType,
  isSinkPad: () => isSinkPad,
  isSourcePad: () => isSourcePad
});

// src/v2/WorkflowNode.ts
init_StreamPad();
var WorkflowNode = class extends EventEmitter {
  /**
   * Creates a new WorkflowNode instance.
   * @param {string} id - Unique identifier for the node
   * @param {NodeType} type - Type identifier for the node
   */
  constructor(id, type) {
    super();
    this.pads = /* @__PURE__ */ new Map();
    this.currentAudioStream = null;
    this.currentVideoStream = null;
    this.livekitRoom = null;
    this.audioTrack = null;
    this.videoTrack = null;
    this.id = id;
    this.type = type;
  }
  /**
   * Gets a pad by its ID.
   * @param {string} padId - ID of the pad to retrieve
   * @returns {IStreamPad | null} The pad if found, null otherwise
   */
  getPad(padId) {
    return this.pads.get(padId) || null;
  }
  /**
   * Gets all source (output) pads on this node.
   * @returns {IStreamPad[]} Array of source pads
   */
  getSourcePads() {
    return Array.from(this.pads.values()).filter((pad) => pad.isSourcePad());
  }
  /**
   * Gets all sink (input) pads on this node.
   * @returns {IStreamPad[]} Array of sink pads
   */
  getSinkPads() {
    return Array.from(this.pads.values()).filter((pad) => pad.isSinkPad());
  }
  /**
   * Gets input pads, optionally filtered by data type.
   * @param {PadDataType} [dataType] - Optional data type to filter by
   * @returns {IStreamPad[]} Array of matching input pads
   */
  getInputPads(dataType) {
    const sinkPads = this.getSinkPads();
    return dataType ? sinkPads.filter((pad) => pad.dataType === dataType) : sinkPads;
  }
  /**
   * Gets output pads, optionally filtered by data type.
   * @param {PadDataType} [dataType] - Optional data type to filter by
   * @returns {IStreamPad[]} Array of matching output pads
   */
  getOutputPads(dataType) {
    const sourcePads = this.getSourcePads();
    return dataType ? sourcePads.filter((pad) => pad.dataType === dataType) : sourcePads;
  }
  /**
   * Gets a source pad by ID with specific type.
   * @param {string} padId - ID of the pad to retrieve
   * @returns {(IStreamPad & { dataType: T }) | null} The pad if found and matches type, null otherwise
   */
  getSourcePad(padId) {
    const pad = this.pads.get(padId);
    if (pad && pad.isSourcePad()) {
      return pad;
    }
    return null;
  }
  /**
   * Gets a sink pad by ID with specific type.
   * @param {string} padId - ID of the pad to retrieve
   * @returns {(IStreamPad & { dataType: T }) | null} The pad if found and matches type, null otherwise
   */
  getSinkPad(padId) {
    const pad = this.pads.get(padId);
    if (pad && pad.isSinkPad()) {
      return pad;
    }
    return null;
  }
  /**
   * Adds a pad to this node.
   * @internal
   * @param {IStreamPad} pad - The pad to add
   * @throws {Error} If pad is not an instance of StreamPad
   */
  addPad(pad) {
    if (!(pad instanceof StreamPad)) {
      throw new Error("Pad must be instance of StreamPad");
    }
    this.pads.set(pad.id, pad);
  }
  /**
   * Sets the LiveKit room for this node.
   * @internal
   * @param {any} room - The LiveKit room instance
   */
  setLivekitRoom(room) {
    this.livekitRoom = room;
    for (const pad of this.pads.values()) {
      pad.setLivekitRoom(room);
    }
  }
  /**
   * Sets the current audio stream for this node.
   * @internal
   * @param {MediaStream | null} stream - The audio stream to set
   */
  setAudioStream(stream) {
    this.currentAudioStream = stream;
  }
  /**
   * Sets the current video stream for this node.
   * @internal
   * @param {MediaStream | null} stream - The video stream to set
   */
  setVideoStream(stream) {
    this.currentVideoStream = stream;
  }
  /**
   * Handles a subscribed track from LiveKit.
   * @internal
   * @param {any} track - The track that was subscribed
   * @param {any} publication - The track publication
   * @param {any} participant - The participant that owns the track
   */
  handleTrackSubscribed(track, publication, participant) {
    if (track.kind === "audio") {
      let mediaStreamTrack;
      if (track.mediaStreamTrack) {
        mediaStreamTrack = track.mediaStreamTrack;
      } else if (track.track) {
        mediaStreamTrack = track.track;
      } else {
        console.warn("Unable to extract MediaStreamTrack from LiveKit track:", track);
        return;
      }
      const stream = new MediaStream([mediaStreamTrack]);
      this.setAudioStream(stream);
    } else if (track.kind === "video") {
      let mediaStreamTrack;
      if (track.mediaStreamTrack) {
        mediaStreamTrack = track.mediaStreamTrack;
      } else if (track.track) {
        mediaStreamTrack = track.track;
      } else {
        console.warn("Unable to extract MediaStreamTrack from LiveKit track:", track);
        return;
      }
      const stream = new MediaStream([mediaStreamTrack]);
      this.setVideoStream(stream);
    }
    this.routeTrackToPads(track, publication, participant);
  }
  /**
   * Handles an unsubscribed track from LiveKit.
   * @internal
   * @param {any} track - The track that was unsubscribed
   * @param {any} publication - The track publication
   * @param {any} participant - The participant that owned the track
   */
  handleTrackUnsubscribed(track, publication, participant) {
    if (track.kind === "audio") {
      this.setAudioStream(null);
    } else if (track.kind === "video") {
      this.setVideoStream(null);
    }
    this.routeTrackUnsubscriptionToPads(track, publication, participant);
  }
  /**
   * Routes a track to appropriate pads.
   * @private
   * @param {any} track - The track to route
   * @param {any} publication - The track publication
   * @param {any} participant - The participant that owns the track
   */
  routeTrackToPads(track, publication, _participant) {
    const trackName = publication.trackName || "";
    for (const pad of this.pads.values()) {
      if (pad.isSinkPad() && (pad.dataType === "audio" && track.kind === "audio" || pad.dataType === "video" && track.kind === "video")) {
        if (trackName.includes(pad.id) || trackName.includes(pad.name)) {
          pad.setStream(new MediaStream([track]));
        }
      }
    }
  }
  /**
   * Routes track unsubscription to appropriate pads.
   * @private
   * @param {any} track - The track that was unsubscribed
   * @param {any} publication - The track publication
   * @param {any} participant - The participant that owned the track
   */
  routeTrackUnsubscriptionToPads(track, publication, _participant) {
    const trackName = publication.trackName || "";
    for (const pad of this.pads.values()) {
      if (pad.isSinkPad() && (pad.dataType === "audio" && track.kind === "audio" || pad.dataType === "video" && track.kind === "video")) {
        if (trackName.includes(pad.id) || trackName.includes(pad.name)) {
          pad.setStream(null);
        }
      }
    }
  }
  /**
   * Cleans up all resources associated with this node.
   * Stops all streams, unpublishes tracks, and removes event listeners.
   */
  async cleanup() {
    for (const pad of this.pads.values()) {
      await pad.cleanup();
    }
    this.pads.clear();
    if (this.audioTrack && this.livekitRoom) {
      try {
        await this.livekitRoom.localParticipant.unpublishTrack(this.audioTrack);
      } catch (error) {
        console.warn(`Failed to unpublish audio track during cleanup: ${error}`);
      }
      this.audioTrack = null;
    }
    if (this.videoTrack && this.livekitRoom) {
      try {
        await this.livekitRoom.localParticipant.unpublishTrack(this.videoTrack);
      } catch (error) {
        console.warn(`Failed to unpublish video track during cleanup: ${error}`);
      }
      this.videoTrack = null;
    }
    if (this.currentAudioStream) {
      this.currentAudioStream.getAudioTracks().forEach((track) => track.stop());
      this.currentAudioStream = null;
    }
    if (this.currentVideoStream) {
      this.currentVideoStream.getVideoTracks().forEach((track) => track.stop());
      this.currentVideoStream = null;
    }
    this.removeAllListeners();
  }
};

// src/v2/AppEngine.ts
var AppEngine = class extends EventEmitter {
  /**
   * Creates a new AppEngine instance.
   * @param {AppEngineConfig} [config] - Optional initial configuration
   */
  constructor(config) {
    super();
    this.livekitRoom = null;
    this.nodes = /* @__PURE__ */ new Map();
    this.connectionState = "disconnected";
    this.runState = "idle";
    this.config = {
      apiBaseUrl: "http://localhost:8080"
    };
    this._publisherNode = null;
    if (config) {
      this.configure(config);
    }
  }
  /**
   * Gets the publisher node if available.
   * This is automatically set during node discovery.
   */
  get publisherNode() {
    return this._publisherNode;
  }
  /**
   * Configures the workflow engine with the provided options.
   * @param {AppEngineConfig} config - Configuration options
   */
  configure(config) {
    this.config = { ...this.config, ...config };
  }
  /**
   * Gets the current run state.
   * @returns {RunState} Current run state
   */
  getRunState() {
    return this.runState;
  }
  /**
   * Connects to a workflow using the provided connection details.
   * This establishes the WebSocket connection and discovers workflow nodes.
   *
   * @param {ConnectionDetails} connectionDetails - Connection details for the workflow
   * @throws {Error} If already connected or if connection fails
   */
  async connect(connectionDetails) {
    if (this.connectionState === "connected" || this.connectionState === "connecting") {
      throw new Error("Already connected or connecting");
    }
    this.setConnectionState("connecting");
    try {
      this.livekitRoom = new Room();
      this.setupRoomEventListeners();
      await this.livekitRoom.connect(connectionDetails.url, connectionDetails.token);
      await this.discoverNodes();
      this.setConnectionState("connected");
    } catch (error) {
      this.setConnectionState("disconnected");
      if (this.livekitRoom) {
        this.livekitRoom.disconnect();
        this.livekitRoom = null;
      }
      throw error;
    }
  }
  /**
   * Disconnects from the current workflow and cleans up resources.
   */
  async disconnect() {
    if (this.connectionState === "disconnected") {
      return;
    }
    this.setConnectionState("disconnected");
    for (const node of this.nodes.values()) {
      await node.cleanup();
    }
    this.nodes.clear();
    if (this.livekitRoom) {
      this.livekitRoom.disconnect();
      this.livekitRoom = null;
    }
  }
  /**
   * Gets a workflow node by its ID.
   * @param {string} nodeId - ID of the node to retrieve
   * @returns {IWorkflowNode | null} The node if found, null otherwise
   */
  getNode(nodeId) {
    return this.nodes.get(nodeId) || null;
  }
  /**
   * Lists all available workflow nodes.
   * @returns {IWorkflowNode[]} Array of all nodes
   */
  listNodes() {
    return Array.from(this.nodes.values());
  }
  /**
   * Gets the current connection state.
   * @returns {ConnectionState} Current connection state
   */
  getConnectionState() {
    return this.connectionState;
  }
  /**
   * Sets the connection state and emits a state change event.
   * @private
   * @param {ConnectionState} state - New connection state
   */
  setConnectionState(state) {
    if (this.connectionState !== state) {
      this.connectionState = state;
      this.emit("connection-state-changed", state);
    }
  }
  /**
   * Sets up event listeners for the LiveKit room.
   * @private
   */
  setupRoomEventListeners() {
    if (!this.livekitRoom) return;
    this.livekitRoom.on("connected", () => {
      console.log("Gabber workflow connected");
      if (this.livekitRoom) {
        console.log("\u{1F50D} Initial remote participants in room:", this.livekitRoom.remoteParticipants.size);
        this.livekitRoom.remoteParticipants.forEach((participant) => {
          console.log(`  - Remote participant: ${participant.identity}`);
        });
        setTimeout(() => {
          if (this.livekitRoom) {
            console.log("\u{1F50D} Remote participants after 2s:", this.livekitRoom.remoteParticipants.size);
            this.livekitRoom.remoteParticipants.forEach((participant) => {
              console.log(`  - Remote participant: ${participant.identity}`);
            });
          }
        }, 2e3);
      }
    });
    this.livekitRoom.on("disconnected", (reason) => {
      console.log("Gabber workflow disconnected:", reason);
      this.setConnectionState("disconnected");
    });
    this.livekitRoom.on("trackSubscribed", (track, publication, participant) => {
      this.handleTrackSubscribed(track, publication, participant);
    });
    this.livekitRoom.on("trackUnsubscribed", (track, publication, participant) => {
      this.handleTrackUnsubscribed(track, publication, participant);
    });
    this.livekitRoom.on("dataReceived", (payload, participant, kind, topic) => {
      console.log("\u{1F50D} Raw data received - Topic:", topic, "Participant:", participant?.identity, "Kind:", kind, "Payload size:", payload.length);
      this.handleDataReceived(payload, participant);
    });
    this.livekitRoom.on("participantConnected", (participant) => {
      console.log("\u{1F464} Participant connected:", participant.identity);
    });
    this.livekitRoom.on("participantDisconnected", (participant) => {
      console.log("\u{1F464} Participant disconnected:", participant.identity);
    });
  }
  /**
   * Discovers workflow nodes from room metadata and participants.
   * @private
   */
  async discoverNodes() {
    if (!this.livekitRoom) return;
    console.log("\u{1F50D} Starting node discovery - waiting for backend node information...");
    console.log("\u{1F50D} Waiting for backend node information...");
    setTimeout(() => {
      if (this.nodes.size === 0) {
        console.warn("\u26A0\uFE0F No nodes discovered after 5 seconds. This could mean:");
        console.warn("  1. Backend agent is not connecting to the room");
        console.warn("  2. Backend is not sending node discovery data");
        console.warn("  3. Edit ledger is empty (no workflow nodes defined)");
        console.warn("  4. Timing issue with data packet delivery");
        if (this.livekitRoom) {
          console.warn("\u{1F50D} Current remote participants:", this.livekitRoom.remoteParticipants.size);
          this.livekitRoom.remoteParticipants.forEach((participant) => {
            console.warn(`  - ${participant.identity}`);
          });
        }
      }
    }, 5e3);
  }
  /**
   * Finds the publisher node among discovered nodes.
   * @private
   * @returns {IWorkflowNode | null} The publisher node if found, null otherwise
   */
  findPublisherNode() {
    for (const node of this.nodes.values()) {
      const nodeType = node.type.toLowerCase();
      if (nodeType === "publisher" || nodeType === "publish") {
        console.log(`\u{1F50D} Found publisher/publish node: ${node.id} (${node.type})`);
        return node;
      }
    }
    console.log(`\u{1F50D} No publisher/publish node found among ${this.nodes.size} nodes`);
    return null;
  }
  /**
   * Handles a subscribed track from LiveKit.
   * @private
   * @param {any} track - The track that was subscribed
   * @param {any} publication - The track publication
   * @param {any} participant - The participant that owns the track
   */
  handleTrackSubscribed(track, publication, participant) {
    const nodeId = this.extractNodeIdFromParticipant(participant);
    console.log(`\u{1F50A} Track subscribed - Node: ${nodeId}, Track: ${track.kind}, Publication: ${publication.trackName}, Participant: ${participant.identity}`);
    if (nodeId) {
      const node = this.nodes.get(nodeId);
      if (node) {
        if (typeof node.handleTrackSubscribed === "function") {
          node.handleTrackSubscribed(track, publication, participant);
        }
        if (track.kind === "audio" || track.kind === "video") {
          console.log(`\u{1F50A} Routing ${track.kind} track to node ${nodeId} pads`);
          let mediaStreamTrack;
          if (track.mediaStreamTrack) {
            mediaStreamTrack = track.mediaStreamTrack;
          } else if (track.track) {
            mediaStreamTrack = track.track;
          } else {
            console.warn("\u{1F50A} Unable to extract MediaStreamTrack from LiveKit track:", track);
            return;
          }
          const mediaStream = new MediaStream([mediaStreamTrack]);
          const targetPads = node.getSourcePads().filter((pad) => pad.dataType === track.kind);
          targetPads.forEach((pad) => {
            pad.setStream(mediaStream);
          });
        }
        return;
      }
    }
    console.log("\u{1F50A} No node match found, attempting enhanced track routing");
    if (track.kind === "audio" && (publication.trackName === "microphone" || participant.identity.startsWith("agent-") || publication.source === "microphone")) {
      console.log("\u{1F50A} Identified as TTS audio track, finding TTS node");
      const ttsNode = Array.from(this.nodes.values()).find(
        (node) => node.type === "tts" && node.getSourcePads().some((pad) => pad.dataType === "audio")
      );
      if (ttsNode) {
        console.log(`\u{1F50A} Found TTS node: ${ttsNode.id}, routing audio track`);
        const audioSourcePad = ttsNode.getSourcePads().find((pad) => pad.dataType === "audio");
        if (audioSourcePad) {
          console.log(`\u{1F50A} Routing TTS audio to pad: ${audioSourcePad.id} (${audioSourcePad.name})`);
          let mediaStreamTrack;
          if (track.mediaStreamTrack) {
            mediaStreamTrack = track.mediaStreamTrack;
          } else if (track.track) {
            mediaStreamTrack = track.track;
          } else {
            console.warn("\u{1F50A} Unable to extract MediaStreamTrack from LiveKit track:", track);
            return;
          }
          console.log("\u{1F50A} Creating MediaStream with track:", mediaStreamTrack);
          const mediaStream = new MediaStream([mediaStreamTrack]);
          audioSourcePad.setStream(mediaStream);
          console.log(`\u{1F50A} Successfully routed TTS audio to ${ttsNode.type} node`);
        }
      } else {
        console.warn("\u{1F50A} No TTS node found for audio routing");
      }
    }
  }
  /**
   * Handles an unsubscribed track from LiveKit.
   * @private
   * @param {any} track - The track that was unsubscribed
   * @param {any} publication - The track publication
   * @param {any} participant - The participant that owned the track
   */
  handleTrackUnsubscribed(track, publication, participant) {
    const nodeId = this.extractNodeIdFromParticipant(participant);
    if (nodeId) {
      const node = this.nodes.get(nodeId);
      if (node && typeof node.handleTrackUnsubscribed === "function") {
        node.handleTrackUnsubscribed(track, publication, participant);
      }
    }
  }
  /**
   * Handles received data messages from LiveKit.
   * @private
   * @param {Uint8Array} payload - Raw message payload
   * @param {any} participant - The participant that sent the message
   */
  handleDataReceived(payload, participant) {
    console.log("\u{1F50D} Data packet received from participant:", participant?.identity, "payload size:", payload.length);
    try {
      const decoder = new TextDecoder();
      const message = JSON.parse(decoder.decode(payload));
      console.log("\u{1F4E8} Received data message:", message);
      if (message.type === "node_discovery") {
        console.log("\u{1F50D} Received node discovery from backend:", message);
        this.handleNodeDiscovery(message.nodes);
        return;
      }
      if (message.nodeId) {
        const node = this.nodes.get(message.nodeId);
        if (node) {
          node.emit("data-received", message);
          if (message.padId) {
            const pad = node.getPad(message.padId);
            if (pad) {
              if (message.type === "trigger") {
                pad.emit("trigger-received", message);
              } else if (message.type === "data") {
                pad.emit("data-received", message);
              } else if (message.type === "stream") {
                pad.emit("stream-received", message);
              } else {
                pad.emit("data-received", message);
              }
            } else {
              console.warn(`Pad ${message.padId} not found on node ${message.nodeId}`);
            }
          }
        } else {
          console.warn(`Node ${message.nodeId} not found`);
        }
      }
    } catch (error) {
      console.warn("Failed to parse data message:", error);
    }
  }
  /**
  * Handles node discovery messages from the backend.
  * @private
  * @param {any[]} nodesData - Array of node data from backend
  */
  async handleNodeDiscovery(nodesData) {
    console.log(`\u{1F50D} Processing node discovery for ${nodesData.length} nodes from backend`);
    console.log("\u{1F50D} Node types being discovered:", nodesData.map((n) => `${n.id} (${n.type})`));
    try {
      for (const nodeData of nodesData) {
        await this.createNodeFromBackendData(nodeData);
      }
      this._publisherNode = this.findPublisherNode();
      if (this._publisherNode) {
        console.log(`\u{1F50D} Publisher/Publish node found: ${this._publisherNode.id} (${this._publisherNode.type})`);
        const audioPads = this._publisherNode.getSourcePads().filter((pad) => pad.dataType === "audio");
        const videoPads = this._publisherNode.getSourcePads().filter((pad) => pad.dataType === "video");
        console.log(`\u{1F50D} Publisher node has ${audioPads.length} audio pads and ${videoPads.length} video pads`);
        audioPads.forEach((pad) => console.log(`  - Audio pad: ${pad.id} (${pad.name})`));
        videoPads.forEach((pad) => console.log(`  - Video pad: ${pad.id} (${pad.name})`));
      } else {
        console.log("\u{1F50D} No Publisher node found");
        console.log("\u{1F50D} Available node types:", Array.from(this.nodes.values()).map((n) => `${n.id} (${n.type})`));
      }
      console.log(`\u2705 Node discovery complete: ${this.nodes.size} nodes created`);
      this.emit("nodes-discovered");
    } catch (error) {
      console.error("Failed to process node discovery:", error);
    }
  }
  /**
   * Creates a workflow node from backend data.
   * @private
   * @param {any} nodeData - Node data from backend
   */
  async createNodeFromBackendData(nodeData) {
    try {
      const nodeId = nodeData.id;
      const nodeType = nodeData.type;
      console.log(`\u{1F527} Creating node from backend data: ${nodeId} (${nodeType})`);
      if (this.nodes.has(nodeId)) {
        console.log(`Node ${nodeId} already exists, skipping`);
        return;
      }
      const node = new WorkflowNode(nodeId, nodeType);
      node.setLivekitRoom(this.livekitRoom);
      if (nodeData.pads && Array.isArray(nodeData.pads)) {
        for (const padData of nodeData.pads) {
          await this.createPadFromBackendData(node, padData);
        }
      }
      console.log(`\u2705 Successfully created node: ${nodeId} (${nodeType}) with ${nodeData.pads?.length || 0} pads`);
      this.addNode(node);
    } catch (error) {
      console.error(`Failed to create node from backend data:`, error);
    }
  }
  /**
   * Creates a pad from backend data and adds it to the node.
   * @private
   * @param {IWorkflowNode} node - Node to add the pad to
   * @param {any} padData - Pad data from backend
   */
  async createPadFromBackendData(node, padData) {
    try {
      const padId = padData.id;
      const padBackendType = padData.type;
      const padDisplayName = padData.id.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
      const { isSourcePad: isSourcePad2, isSinkPad: isSinkPad2 } = await Promise.resolve().then(() => (init_types(), types_exports));
      const padDirection = isSourcePad2(padBackendType) ? "source" : isSinkPad2(padBackendType) ? "sink" : "unknown";
      console.log(`  Adding pad from backend: ${padId} (${padDirection} derived from ${padBackendType})`);
      let padCategory = "stateless";
      if (padBackendType === "PropertySourcePad" || padBackendType === "PropertySinkPad") {
        padCategory = "property";
      }
      const pad = new (await Promise.resolve().then(() => (init_StreamPad(), StreamPad_exports))).StreamPad({
        id: padId,
        nodeId: node.id,
        name: padDisplayName,
        backendType: padBackendType,
        category: padCategory,
        value: padData.value,
        allowedTypes: padData.allowed_types || [],
        nextPads: padData.next_pads || [],
        previousPad: padData.previous_pad || null
      });
      pad.setLivekitRoom(this.livekitRoom);
      node.addPad(pad);
      console.log(`    \u2705 Added pad: ${padId} \u2192 ${padDisplayName} (${padCategory}) with data type: ${pad.dataType}`);
    } catch (error) {
      console.warn(`\u26A0\uFE0F Failed to create pad ${padData.id} for node ${node.id}:`, error);
    }
  }
  /**
   * Extracts a node ID from a LiveKit participant.
   * @private
   * @param {any} participant - LiveKit participant
   * @returns {string | null} Node ID if found, null otherwise
   */
  extractNodeIdFromParticipant(participant) {
    const identity = participant.identity;
    console.log(`\u{1F50D} Extracting node ID from participant identity: "${identity}"`);
    console.log(`\u{1F50D} Available node IDs:`, Array.from(this.nodes.keys()));
    if (!identity) {
      console.log(`\u{1F50D} No identity found`);
      return null;
    }
    if (identity === "publisher") {
      for (const [nodeId, node] of this.nodes.entries()) {
        const nodeType = node.type.toLowerCase();
        if (nodeType === "publisher" || nodeType === "publish") {
          console.log(`\u{1F50D} Mapped "publisher" identity to publisher node: ${nodeId} (${node.type})`);
          return nodeId;
        }
      }
      console.log(`\u{1F50D} No publisher node found for "publisher" identity`);
      return null;
    }
    if (identity.includes("node-")) {
      const nodeId = identity.split("node-")[1] || null;
      console.log(`\u{1F50D} Found node- prefix, extracted ID: ${nodeId}`);
      return nodeId;
    }
    if (this.nodes.has(identity)) {
      console.log(`\u{1F50D} Direct match found: ${identity}`);
      return identity;
    }
    for (const nodeId of this.nodes.keys()) {
      if (identity.includes(nodeId)) {
        console.log(`\u{1F50D} Partial match found: ${nodeId} in ${identity}`);
        return nodeId;
      }
    }
    console.log(`\u{1F50D} No matching node ID found for identity: ${identity}`);
    return null;
  }
  /**
   * Adds a node to the workflow engine.
   * @private
   * @param {IWorkflowNode} node - Node to add
   */
  addNode(node) {
    this.nodes.set(node.id, node);
  }
};

// src/v2/index.ts
init_StreamPad();
init_types();

export { Api, BadRequestTypeEnum, ChatCompletionMessageToolCallChunkTypeEnum, ChatCompletionMessageToolCallTypeEnum, ChatCompletionNamedToolChoiceTypeEnum, ChatCompletionRequestAssistantMessageRoleEnum, ChatCompletionRequestMessageContentPartAudioInputAudioFormatEnum, ChatCompletionRequestMessageContentPartAudioTypeEnum, ChatCompletionRequestMessageContentPartTextTypeEnum, ChatCompletionRequestSystemMessageRoleEnum, ChatCompletionRequestToolMessageRoleEnum, ChatCompletionRequestUserMessageRoleEnum, ChatCompletionResponseGabberMessageDataTypeEnum, ChatCompletionResponseMessageRoleEnum, ChatCompletionStreamResponseChoiceFinishReasonEnum, ChatCompletionStreamResponseDeltaRoleEnum, ChatCompletionStreamResponseObjectEnum, ChatCompletionToolTypeEnum, ContextMessageContentTextTypeEnum, ContextMessageCreateParamsRoleEnum, ContextMessageRoleEnum, ContextMessageToolCallTypeEnum, CreatePersonaRequestGenderEnum, HistoryMessageRoleEnum, HumanDataType, PersonaGenderEnum, RealtimeSessionDTMFDigitDigitEnum, RealtimeSessionDataType, RealtimeSessionDataTypeEnum, RealtimeSessionEngine, RealtimeSessionErrorConnect, RealtimeSessionErrorUnknown, RealtimeSessionInitiateOutboundCallRequestPhoneTypeEnum, RealtimeSessionStateEnum, RealtimeSessionTimelineItemTypeEnum, SDKAgentState, SDKConnectionState, SessionStateEnum, SessionTimelineItemTypeEnum, TTSWebsocketRequestMessageType, TTSWebsocketResponseMessageAudioPayloadAudioFormatEnum, TTSWebsocketResponseMessageAudioPayloadEncodingEnum, TTSWebsocketResponseMessageType, ToolDefinitionCallSettingDestinationClientAppTypeEnum, ToolDefinitionCallSettingDestinationWebRequestTypeEnum, ToolDefinitionParameterTypeEnum, UpdatePersonaRequestGenderEnum, UsageType, WebhookMessageRealtimeSessionMessageCommittedTypeEnum, WebhookMessageRealtimeSessionStateChangedTypeEnum, WebhookMessageRealtimeSessionStateChangedpayloadSessionStateEnum, WebhookMessageRealtimeSessionTimeLimitExceededTypeEnum, WebhookMessageToolCallsFinishedTypeEnum, WebhookMessageToolCallsStartedTypeEnum, WebhookMessageUsageTrackedTypeEnum, v2_exports as v2 };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map