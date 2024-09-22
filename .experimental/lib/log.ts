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

export const LogLevels = [
  /** Verbose debugging information */
  'debug',

  /** General / diagnostic log statements */
  'log',

  /** Status information */
  'info',

  /** Warning information */
  'warn',

  /** Error information */
  'error',

  /** No output */
  'silent',
] as const;

export type LogLevel = (typeof LogLevels)[number];

export interface Logger {
  print(str: Uint8Array | string): void;
  printf(fmt: string, ...params: any[]): void;
  clear(): void;
  debug(message?: any, ...rest: any[]): void;
  log(message?: any, ...rest: any[]): void;
  info(message?: any, ...rest: any[]): void;
  warn(message?: string, ...rest: any[]): void;
  error(message?: string, ...rest: any[]): void;
  ok(message?: string, ...args: any[]): void;
  pass(message?: string, ...args: any[]): void;
  fail(message?: string, ...args: any[]): void;
}