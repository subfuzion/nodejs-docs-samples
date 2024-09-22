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

import {Context} from '../../context.ts';
import {type Plan} from '../../plan.ts';

export class SampleSuitePlan implements Plan {
  async setup(context: Context): Promise<void> {
    return new Promise<void>(resolve => {
      context.io.info('setup');
      resolve();
    });
  }
  async run(context: Context): Promise<void> {
    return new Promise<void>(resolve => {
      context.io.info('run');
      resolve();
    });
  }
  async cleanup(context: Context): Promise<void> {
    return new Promise<void>(resolve => {
      context.io.info('cleanup');
      resolve();
    });
  }
}
