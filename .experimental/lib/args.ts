import {parseArgs} from 'node:util';
import {Config} from './config.ts';

export class Args {
  constructor() {
    const args = ['path'];
    const options = {};
    const {values, positionals} = parseArgs({args, options});
    console.log(values, positionals);
  }
}
