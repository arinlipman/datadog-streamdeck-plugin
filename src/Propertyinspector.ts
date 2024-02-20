import { FormBuilder } from '@rweich/streamdeck-formbuilder';
import { Streamdeck } from '@rweich/streamdeck-ts';

import { isSettings, Settings } from './Settings';

const pi = new Streamdeck().propertyinspector();
let builder: FormBuilder<Settings> | undefined;

pi.on('websocketOpen', ({ uuid }) => pi.getSettings(uuid)); // trigger the didReceiveSettings event
//todo: Migrate API keys to global settings
//todo: add server selector
pi.on('didReceiveSettings', ({ settings }) => {
  if (builder === undefined) {
    const initialData: Settings = isSettings(settings) ? settings : { apikey: '', appkey: '', monitorId: '0' };
    builder = new FormBuilder<Settings>(initialData);

    builder.addElement('monitorId', builder.createInput().setLabel('Monitor ID'));

    const headingElement = document.createElement('div');
    headingElement.className = 'sdpi-heading';
    headingElement.textContent = 'Global DataDog Settings';
    builder.addHtmlElement(headingElement);

    const ddApiKeyDetails = builder.createDetails();
    ddApiKeyDetails.addSummary('DataDog API Keys Info');
    ddApiKeyDetails.addParagraph(
      'To use this plugin, you need to provide your DataDog API and Application keys. You can find these keys in your DataDog account settings. See <a href="https://docs.datadoghq.com/account_management/api-app-keys" target="_blank">here</a> for more details.',
    );
    builder.addHtml(ddApiKeyDetails);
    builder.addElement('apikey', builder.createInput().setLabel('API Key'));
    builder.addElement('appkey', builder.createInput().setLabel('Application Key'));
    builder.appendTo(document.querySelector('.sdpi-wrapper') ?? document.body);
    builder.on('change-settings', () => {
      if (pi.pluginUUID === undefined) {
        console.error('pi has no uuid! is it registered already?', pi.pluginUUID);
        return;
      }
      pi.setSettings(pi.pluginUUID, builder?.getFormData());
    });
  } else if (isSettings(settings)) {
    builder.setFormData(settings);
  }
});

export default pi;
