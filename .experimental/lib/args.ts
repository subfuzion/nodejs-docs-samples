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

import {LogLevels} from './io.ts';
import {inspect, parseArgs} from 'node:util';

export interface Logger {
  print(str: Uint8Array | string): void;
  debug(message?: any, ...rest: any[]): void;
  log(message?: any, ...rest: any[]): void;
  info(message?: any, ...rest: any[]): void;
  warn(message?: string, ...rest: any[]): void;
  error(message?: string, ...rest: any[]): void;
  ok(message?: string, ...args: any[]): void;
  pass(message?: string, ...args: any[]): void;
  fail(message?: string, ...args: any[]): void;
  abort(message?: string, ...args: any[]): void;
}

type LogLevel = (typeof LogLevels)[number];

interface KeyValues {
  [key: string]: string | boolean | number | (string | boolean | number)[];
}

export class ParsedArgs {
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
  private logger: Logger;

  parsedArgs: ParsedArgs;

  samplePath: string;
  logLevel: LogLevel;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  parse(args: string[]): ParsedArgs {
    const options = {
      loglevel: {
        type: 'string',
        default: 'log',
      },
    };

    const parsed = parseArgs({
      // @ts-ignore
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

    if (positionals.length > 1) {
      this.logger.abort('too many arguments');
    }

    this.samplePath = positionals[0];

    let logLevel = values.loglevel as LogLevel;
    if (!LogLevels.includes(logLevel)) {
      this.logger.abort('bad loglevel:', logLevel);
    }
    this.logLevel = logLevel;

    return parsedArgs;
  }
}
