import {Config} from './config.ts';

export class Context {
  config;

  execPath: string;
  startModule: string;
  args: string[];
}
