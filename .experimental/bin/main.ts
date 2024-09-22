#!/usr/bin/env node --experimental-strip-types --disable-warning=ExperimentalWarning
//
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
import {argv} from 'node:process';

import {Cli} from '../lib/cli.ts';
import {IO} from '../lib/io.ts';

try {
  await Cli.run(argv);
} catch (err) {
  // ALL early CLI exceptions (until a command runs) surface here.
  IO.abort(err);
  process.exitCode = 1;
}
