
### Using the Gabber Widget

### Overview

This guide covers the integration and customization of the Gabber widget into your website, allowing users to interact with Gabber sessions.

### Setup

1. **Include the Gabber Widget Script**
    - Add the Gabber widget script to your HTML:
        
        ```
        <script src="https://unpkg.com/gabber-client-widget/dist/index.js"></script>
        
        ```
        
2. **Create a Container for the Widget**
    - Create a div element where the widget will be attached:
        
        ```
        <div id="gabber-div"></div>
        
        ```
        
3. **Initialize the Widget**
    - Initialize the widget using the connection details provided by your backend:
        
        ```
        <script>
          Gabber.Widget.create({
            elementID: 'gabber-div',
            connectionDetails: { url: 'your_url', token: 'your_token' },
            settings: {
              autoConnect: true,
              primaryColor: '#ff0000',
              primaryColorContent: "#ffffff",
              secondaryColor: "#00ff00",
              secondaryColorContent: "#ffffff",
              baseColor: '#000000',
              baseColorPlusOne: "#1c1c1c",
              baseColorPlusTwo: "#373636",
              baseColorContent: '#ffffff',
              personaImage: persona.image_url || "",
              layout: 'bottom_bar',
              audioPlaybackFailed: {
                descriptionText: 'Audio playback requires a user gesture.',
                buttonText: 'Start Audio Playback',
              }
            }
          });
        </script>
        
        ```
        

### Customization Options

1. **Color Settings**
    - Customize the widget's colors to match your website's theme:
        
        ```
        {
          "primaryColor": "#ff0000",
          "primaryColorContent": "#ffffff",
          "secondaryColor": "#00ff00",
          "secondaryColorContent": "#ffffff",
          "baseColor": "#000000",
          "baseColorPlusOne": "#1c1c1c",
          "baseColorPlusTwo": "#373636",
          "baseColorContent": "#ffffff"
        }
        
        ```
        
2. **Layout Settings**
    - Choose the layout of the widget:
        
        ```
        {
          "layout": "bottom_bar"
        }
        
        ```
        
3. **Audio Playback Settings**
    - Customize the text for the audio playback failure UI:
        
        ```
        {
          "audioPlaybackFailed": {
            "descriptionText": "Audio playback requires a user gesture.",
            "buttonText": "Start Audio Playback"
          }
        }
        
        ```
        

### Example Code

**HTML Example:**

```
<html>
<head>
  <script src="https://unpkg.com/gabber-client-widget/dist/index.js"></script>
  <style>
    .gabber { width: 500px; height: 500px; }
  </style>
</head>
<body>
  <div class="gabber" id="gabber-div"></div>
</body>
<script>
  Gabber.Widget.create({
    elementID: 'gabber-div',
    connectionDetails: { url: 'your_url', token: 'your_token' },
    settings: {
      autoConnect: true,
      primaryColor: '#ff0000',
      baseColor: '#000000',
      baseColorContent: '#ffffff',
      layout: 'bottom_bar',
      audioPlaybackFailed: {
        descriptionText: 'Audio playback requires a user gesture.',
        buttonText: 'Start Audio Playback',
      }
    }
  });
</script>
</html>

```
