// Copyright 2024 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {inspect, parseArgs} from 'node:util';
import {type Logger, type LogLevel} from './log.ts';

interface KeyValues {
  [key: string]: string | boolean | number | (string | boolean | number)[];
}

export class ParsedArgs {
  options: any;
  values: KeyValues;
  positionals: string[];
  toString(): string {
    return `{
      values: ${inspect(this.values)},
      positionals: ${inspect(this.positionals)},
    }`;
  }
}

export class Args {
  options: any;
  parsedArgs: ParsedArgs;
  samplePath: string;
  logLevel: LogLevel;

  constructor() {
    this.options = {
      help: {
        type: 'boolean',
        short: 'h',
        description: 'Print usage information',
      },
      loglevel: {
        type: 'string',
        default: 'info',
        description: 'Print:  debug | trace | info * | warn | error | silent',
      },
      version: {
        type: 'boolean',
        short: 'v',
        description: 'Print current version',
      },
    };
  }

  parse(args: string[]): ParsedArgs {
    const options = this.options;
    const parsed = parseArgs({
      options,
      args,
      allowPositionals: true,
      strict: true,
    });

    const parsedArgs = new ParsedArgs();
    this.parsedArgs = parsedArgs;
    const values = Object.fromEntries(Object.entries(parsed.values));
    parsedArgs.values = values;
    const positionals = parsed.positionals;
    parsedArgs.positionals = positionals;
    parsedArgs.options = options;

    this.logLevel = values.loglevel as LogLevel;
    this.samplePath = positionals[0];

    return parsedArgs;
  }
}
