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

import {accessSync, constants} from 'node:fs';
import {inspect} from 'node:util';

import {PlanBuilderFactory, PlanBuilderType} from './builder.ts';
import {Config} from './config.ts';
import {Context} from './context.ts';
import {IO} from './io.ts';
import {LogLevels} from './log.ts';
import Package from './Package.ts';

export class Cli {
  context: Context;

  constructor(argv: string[]) {
    const config = new Config();
    this.context = new Context(argv, config, IO.defaultIO());
  }

  async run() {
    if (this.context.parsedArgs.values.help) {
      return this.printUsage();
    }
    if (this.context.parsedArgs.values.version) {
      return this.printVersion();
    }
    this.context.io.log(inspect(this, false, 100));
    this.validate();

    const plan = await PlanBuilderFactory.builder(
      PlanBuilderType.SampleSuiteBuilder
    ).build(this.context);

    await plan.prepare();

    let failures = false;

    try {
      await plan.setup();
    } catch (error) {
      failures = true;
      this.context.io.error(error);
    }

    if (!failures) {
      try {
        await plan.run();
      } catch (error) {
        failures = true;
        this.context.io.error(error);
      }
    }

    try {
      await plan.cleanup();
    } catch (error) {
      failures = true;
      this.context.io.error(error);
    }

    if (failures) {
      this.context.io.fail('there were failures');
    } else {
      this.context.io.pass();
    }
  }

  validate() {
    const context = this.context;
    if (!LogLevels.includes(context.io.logLevel)) {
      throw new Error(`bad loglevel: ${context.io.logLevel}`);
    }
    if (!context.parsedArgs.positionals.length) {
      this.printUsage();
      throw new Error('missing argument PATHNAME');
    }
    if (context.parsedArgs.positionals.length > 1) {
      throw new Error(
        `too many arguments (expected one): ${context.parsedArgs.positionals}`
      );
    }
    if (!isAccessible(this.context.samplePath.normalized)) {
      throw new Error(
        `can't access path "${this.context.samplePath.normalized}"`
      );
    }
  }

  printUsage(): void {
    if (!process.stdout.isTTY) return;
    const name = Package.name;
    const version = Package.version;
    const description = Package.description;
    const options = this.context.parsedArgs.options;

    const usage = `${name} ${version} - ${description} 
   
USAGE:
  ${Package.name} [OPTIONS] PATHNAME

  PATHNAME           Path to a sample or sample directory 

OPTIONS:
  -h, --help         ${options.help.description} 
  -l, --loglevel     ${options.loglevel.description}
  -v, --version      ${options.version.description}

`;
    this.context.io.printf(usage);
  }

  printVersion(): void {
    this.context.io.println(Package.version);
  }

  static async run(argv: string[]) {
    const cli = new Cli(argv);
    await cli.run();
  }
}

/**
 * Checks if path is accessible for the specified mode (default is read access).
 * @param path - File or directory path.
 * @param mode - F_OK, R_OK, W_OK, or X_OK.
 *               See: https://nodejs.org/api/fs.html#file-access-constants
 */
function isAccessible(path: string, mode: number = constants.R_OK): boolean {
  try {
    accessSync(path, mode);
    return true;
  } catch (err) {
    return false;
  }
}
