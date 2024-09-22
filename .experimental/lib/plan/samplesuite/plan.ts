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

import {Context} from '#lib/context.ts';
import {type Plan} from '#lib/plan.ts';

export class SampleSuitePlan implements Plan {
  context: Context;

  constructor(context: Context) {
    this.context = context;
  }

  async prepare(): Promise<void> {
    return new Promise<void>(resolve => {
      this.context.io.info('prepare plan');
      this.context.io.ok('prepare plan');
      resolve();
    });
  }
  async setup(): Promise<void> {
    return new Promise<void>(resolve => {
      this.context.io.info('setup plan');
      this.context.io.ok('setup plan');
      resolve();
    });
  }
  async run(): Promise<void> {
    return new Promise<void>(resolve => {
      this.context.io.info('run plan');
      this.context.io.ok('run plan');
      resolve();
    });
  }
  async cleanup(): Promise<void> {
    return new Promise<void>(resolve => {
      this.context.io.info('cleanup plan');
      this.context.io.fail('cleanup plan');
      resolve();
    });
  }
}
