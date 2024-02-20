import { isSomething } from 'ts-type-guards';

export function isSettings(value: unknown): value is Settings {
  return (
    (value as Settings).hasOwnProperty('apikey')
    && isSomething((value as Settings).apikey)
    && (value as Settings).hasOwnProperty('appkey')
    && isSomething((value as Settings).appkey)
    && (value as Settings).hasOwnProperty('monitorId')
    && isSomething((value as Settings).monitorId)
  );
}

export type Settings = {
  apikey: string;
  appkey: string;
  monitorId: string;
};
