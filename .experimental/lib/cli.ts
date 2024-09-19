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

import {inspect} from 'node:util';

import {Config} from './config.ts';
import {Context} from './context.ts';
import {IO} from './io.ts';

export class Cli {
  context: Context;

  constructor(argv: string[]) {
    const config = new Config();
    const c = new Context(argv, config, IO.defaultIO());
    this.context = c;
  }

  run() {
    this.context.io.debug(inspect(this, false, 100));
  }

  static run(argv: string[]) {
    const cli = new Cli(argv);
    cli.run();
  }
}
