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

export type PlanCallback = () => void;

export type PlanStatus =
  | 'pending'
  | 'skipped'
  | 'started'
  | 'succeeded'
  | 'failed';

export class PlanRunResults {
  prepareStatus: PlanStatus = 'pending';
  prepareErrors: Error[] = [];

  setupStatus: PlanStatus = 'pending';
  setupErrors: Error[] = [];

  executeStatus: PlanStatus = 'pending';
  executeErrors: Error[] = [];

  cleanupStatus: PlanStatus = 'pending';
  cleanupErrors: Error[] = [];
}

/**
 * A plan can perform lifecycle methods individually (prepare, setup, execute,
 * cleanup) or using the convenience method (run) with optional callback hooks.
 */
export interface Plan {
  /** Prepare the plan, load/process/parse required resources */
  prepare(): Promise<void>;
  /** Perform any setup in preparation to run the plan */
  setup(): Promise<void>;
  /** Execute the plan */
  execute(): Promise<void>;
  /** Teardown - remove plan artifacts intended to be ephemeral */
  cleanup(): Promise<void>;

  /**
   * run convenience method performs all async lifecycle methods in sequence,
   * catches any errors, and resolves a PlanRunResults.
   * All individual lifecycle methods must succeed for run to succeed.
   * - If prepare fails, then run terminates with failure
   * - If setup fails, attempt to execute cleanup, then terminate with failure
   * - If execute fails, attempt to execute cleanup, then terminate with failure
   * - If cleanup fails, terminate with failure
   */
  run(
    prepare?: PlanCallback,
    setup?: PlanCallback,
    execute?: PlanCallback,
    cleanup?: PlanCallback,
  ): Promise<PlanRunResults>;
}
