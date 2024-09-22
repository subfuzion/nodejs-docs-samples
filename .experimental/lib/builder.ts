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

import {type Plan} from './plan.ts';
import {SampleSuiteBuilder} from './plan/samplesuite/builder.ts';

// TypeScript enum is not supported in strip-only mode. Symbols aren't strictly
// necessary here, but do make it easier for the caller not to mistake.
export class BuilderType {
  static SampleSuiteBuilder = Symbol('SampleSuiteBuilder');
}

export interface Builder {
  build(): Plan;
}

export class BuilderFactory {
  static builder(builderType: symbol): Builder {
    switch (builderType) {
      case BuilderType.SampleSuiteBuilder:
        return new SampleSuiteBuilder();
      default:
        throw new Error(`Unsupported builder type: ${String(builderType)}`);
    }
  }
}
