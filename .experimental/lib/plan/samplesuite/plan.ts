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

import type {Context} from '#lib/context.ts';
import {type Plan, type PlanCallback, PlanRunResults} from '#lib/plan.ts';

export class SampleSuitePlan implements Plan {
  context: Context;

  constructor(context: Context) {
    this.context = context;
  }

  async prepare(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.context.io.info('prepare plan');
      this.context.io.ok('prepare plan');
      resolve();
    });
  }
  async setup(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.context.io.info('setup plan');
      this.context.io.ok('setup plan');
      resolve();
    });
  }
  async execute(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.context.io.info('run plan');
      this.context.io.ok('run plan');
      resolve();
    });
  }
  async cleanup(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.context.io.info('cleanup plan');
      resolve();
    });
  }

  async run(
    prepare?: PlanCallback,
    setup?: PlanCallback,
    execute?: PlanCallback,
    cleanup?: PlanCallback,
  ): Promise<PlanRunResults> {
    const result = new PlanRunResults();

    try {
      result.prepareStatus = 'started';
      await this.prepare();
      result.prepareStatus = 'succeeded';
    } catch (error) {
      result.prepareErrors.push(error);
      // If prepare fails, stop.
      return result;
    }

    try {
      result.setupStatus = 'started';
      await this.setup();
      result.setupStatus = 'succeeded';
    } catch (error) {
      result.setupErrors.push(error);
      this.context.io.error(error);
    }

    if (result.setupStatus !== 'succeeded') {
      result.executeStatus = 'skipped';
    } else {
      try {
        result.executeStatus = 'started';
        await this.execute();
        throw new Error('run failed');
        //result.executeStatus = 'succeeded';
      } catch (error) {
        result.executeErrors.push(error);
        this.context.io.error(error.message);
      }
    }

    try {
      result.cleanupStatus = 'started';
      this.context.io.pass('cool');
      this.context.io.fail('dang');
      await this.cleanup();
      result.cleanupStatus = 'succeeded';
    } catch (error) {
      result.cleanupErrors.push(error);
      this.context.io.error(error);
    }

    return result;
  }
}
