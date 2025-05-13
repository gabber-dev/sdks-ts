# Gabber Client React Native

## Getting Started (Expo)


Install dependencies:

```bash
npm install gabber-client-react-native @livekit/react-native @livekit/react-native-expo-plugin @livekit/react-native-webrtc @config-plugins/react-native-webrtc
```

Add plugins to your `app.json`

```json
{
  "expo": {
    ...
    "plugins": [
      "@livekit/react-native-expo-plugin",
      "@config-plugins/react-native-webrtc"
    ],
    ...
  }
}
```

See our [full Expo example](https://github.com/gabber-dev/example-react-native-expo/tree/main) for usage details.

Join our [Discord](https://discord.gg/kHuuscKA) for support, feature requests, and quesions.