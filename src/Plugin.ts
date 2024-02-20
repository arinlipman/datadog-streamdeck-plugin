import { client, v1 } from '@datadog/datadog-api-client';
import { Configuration } from '@datadog/datadog-api-client/dist/packages/datadog-api-client-common';
import * as MonitorOverallStates from '@datadog/datadog-api-client/dist/packages/datadog-api-client-v1/models/MonitorOverallStates';
import { Streamdeck } from '@rweich/streamdeck-ts';

import { isSettings, Settings } from './Settings';

// Create plugin instance
const plugin = new Streamdeck().plugin();

interface ContextState {
  [key: string]: {
    apiInstance: v1.MonitorsApi;
    monitorId: number;
  };
}

const contextState: ContextState = {};

let apiInstance: v1.MonitorsApi; // = new v1.MonitorsApi(configuration);
//
plugin.on('didReceiveSettings', ({ context, settings }) => {
  console.log('got settings');
  if (isSettings(settings)) {
    if (!settings.apikey || !settings.appkey) {
      return;
    }
    const configurationOptions = {
      authMethods: {
        apiKeyAuth: settings.apikey,
        appKeyAuth: settings.appkey,
      },
    };
    const configuration = client.createConfiguration(configurationOptions);
    apiInstance = new v1.MonitorsApi(configuration);
    const contextObject = {
      apiInstance: apiInstance,
      monitorId: Number.parseInt(settings.monitorId, 10),
    };
    contextState[context] = contextObject;
  }
});

// Sending events:
// For some events you'll need to set a context (the "button-id").
// It's sent along most events received from the streamdeck.
plugin.on('willAppear', ({ context }) => {
  plugin.getSettings(context);
  plugin.setTitle('Pending API Fetch', context);
});

let keypresses = 0;
plugin.on('keyDown', ({ context }) => {
  plugin.setTitle(`key pressed ${++keypresses} times`, context);
  if (contextState[context] === undefined) {
    plugin.showAlert(context);
    show('yellow', context);
  } else {
    const parameters: v1.MonitorsApiGetMonitorRequest = {
      // number | The ID of the monitor
      monitorId: contextState[context].monitorId,
    };
    if (contextState[context] === undefined) {
      plugin.getSettings(context);
      console.log('apiInstance is undefined');
      plugin.showAlert(context);
      return;
    }

    apiInstance
      .getMonitor(parameters)
      .then((data: v1.Monitor) => {
        if (data.overallState !== undefined) {
          plugin.setTitle(data.overallState.toString(), context);
        }
        if (data.overallState === MonitorOverallStates.OK) {
          show('black', context);
        } else if (data.overallState === MonitorOverallStates.WARN) {
          show('yellow', context);
        } else {
          show('red', context);
        }
        console.log('API called successfully. Returned data: ' + JSON.stringify(data));
        return self;
      })
      .catch((error: any) => {
        plugin.showAlert(context);
        console.error(error);
      });
  }
});

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function show(color: string, pluginContext: string): void {
  //
  //

  const image = new Image();
  image.addEventListener('load', () => {
    const canvas = document.createElement('canvas');

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const canvasContext = canvas.getContext('2d');
    if (canvasContext) {
      canvasContext.fillStyle = color;
      canvasContext.fillRect(0, 0, 144, 144);
      canvasContext.drawImage(image, 0, 0);
    }
    const dataURL = canvas.toDataURL('image/png');
    plugin.setImage(dataURL, pluginContext);
  });

  // const img = new Image();
  // img.onload = function() {
  //   if (context) {
  //     context.drawImage(img, 0, 0); // Draw the image on the canvas
  //   }
  // };
  // image.src = 'images/datadoghq-icon.svg';
  image.src = 'images/dd_icon_white.svg';
  // const imgData = canvas.toDataURL('image/png');
  // plugin.setImage(imgData, pluginContext);
}

// same for the property inspector
const pi = new Streamdeck().propertyinspector();
pi.on('didReceiveSettings', ({ settings }) => console.log('got settings', settings));

export default plugin;
