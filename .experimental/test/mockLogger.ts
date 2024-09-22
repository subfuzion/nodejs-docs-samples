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

import {type Logger, type LogLevel, LogLevels} from '../lib/log.ts';
import {format} from 'node:util';

export class MockLogger implements Logger {
  logLevel: LogLevel;
  #stdout: string = '';
  #stderr: string = '';

  constructor(logLevel: LogLevel = 'info') {
    this.logLevel = logLevel;
  }

  shouldLog(logLevel: LogLevel): boolean {
    return LogLevels.indexOf(logLevel) >= LogLevels.indexOf(this.logLevel);
  }

  get stdout(): string {
    return this.#stdout;
  }

  set stdout(str: Uint8Array | string) {
    this.#stdout = str.toString();
  }

  get stderr(): string {
    return this.#stderr;
  }

  set stderr(str: Uint8Array | string) {
    this.#stderr = str.toString();
  }

  print(str: Uint8Array | string): void {
    this.stdout += str.toString();
  }

  printf(fmt: string, ...params: any[]): void {
    this.stdout += format(fmt, ...params);
  }

  println(message?: string, ...rest: any[]): void {
    if (rest.length > 0) {
      this.stdout += `${message} ${rest.join(' ')}\n`;
    } else {
      this.stdout += `${message}\n`;
    }
  }

  printerrln(message?: string, ...rest: any[]): void {
    if (rest.length > 0) {
      this.stderr += `${message} ${rest.join(' ')}\n`;
    } else {
      this.stderr += `${message}\n`;
    }
  }

  clear(): void {
    this.stdout = '';
    this.stderr = '';
  }

  debug(message?: any, ...rest: any[]): void {
    this.shouldLog('debug') && this.log(message, ...rest);
  }

  log(message?: any, ...rest: any[]): void {
    this.shouldLog('log') && this.println(message, ...rest);
  }

  info(message?: any, ...rest: any[]): void {
    this.shouldLog('info') && this.log(`INFO: ${message}`, ...rest);
  }

  warn(message?: string, ...rest: any[]): void {
    this.shouldLog('warn') && this.log(`WARN: ${message}`, ...rest);
  }

  error(message?: string, ...rest: any[]): void {
    if (this.shouldLog('error')) {
      this.printerrln(`ERROR: ${message}`, ...rest);
    }
  }

  ok(message?: string, ...args: any[]): void {
    this.log(`OK: ${message}`, ...args);
  }

  pass(message?: string, ...args: any[]): void {
    this.log(`PASS: ${message}`, ...args);
  }

  fail(message?: string, ...args: any[]): void {
    this.log(`FAIL: ${message}`, ...args);
  }
}
