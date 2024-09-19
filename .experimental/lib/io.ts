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

// export type Logger = (message?: string, ...args: any[]) => void;

export const LogLevels = [
  'all',
  'debug',
  'log',
  'info',
  'warn',
  'error',
  'none',
] as const;

export type LogLevel = (typeof LogLevels)[number];

export type StdinType = NodeJS.ReadStream & {fd: 0};
export type StdoutType = NodeJS.WriteStream & {fd: 1};
export type StderrType = NodeJS.WriteStream & {fd: 2};

const DefaultConsole = console;
const DefaultStdin: StdinType = process.stdin;
const DefaultStdout: StdoutType = process.stdout;
const DefaultStderr: StderrType = process.stderr;

export interface Logger {
  print(str: Uint8Array | string): void;
  debug(message?: any, ...rest: any[]): void;
  log(message?: any, ...rest: any[]): void;
  info(message?: any, ...rest: any[]): void;
  warn(message?: string, ...rest: any[]): void;
  error(message?: string, ...rest: any[]): void;
  ok(message?: string, ...args: any[]): void;
  pass(message?: string, ...args: any[]): void;
  fail(message?: string, ...args: any[]): void;
  abort(message?: string, ...args: any[]): void;
}

export class IO implements Logger {
  #logLevel: LogLevel;
  readonly #console: Console;
  readonly #stdin: StdinType;
  readonly #stdout: StdoutType;
  readonly #stderr: StderrType;

  constructor(
    logLevel: LogLevel = 'log',
    console: Console = DefaultConsole,
    stdin: StdinType = DefaultStdin,
    stdout: StdoutType = DefaultStdout,
    stderr: StderrType = DefaultStderr
  ) {
    this.#logLevel = logLevel;
    this.#console = console;
    this.#stdin = stdin;
    this.#stdout = stdout;
    this.#stderr = stderr;
  }

  get logLevel(): LogLevel {
    return this.#logLevel;
  }

  set logLevel(logLevel: LogLevel) {
    this.#logLevel = logLevel;
  }

  shouldLog(logLevel: LogLevel): boolean {
    return LogLevels.indexOf(logLevel) >= LogLevels.indexOf(this.logLevel);
  }

  get console(): Console {
    return this.#console;
  }

  get stdin(): StdinType {
    return this.#stdin;
  }

  get stdout(): StdoutType {
    return this.#stdout;
  }

  get stderr(): StderrType {
    return this.#stderr;
  }

  /**
   * Prints str to stdout (regardless of log level).
   */
  print(str: Uint8Array | string): void {
    this.stdout.write(str);
  }

  /**
   * Prints message to stdout with a newline (regardless of log level).
   */
  println(message?: any, ...rest: any[]): void {
    this.console.log(message, ...rest);
  }

  debug(message?: any, ...rest: any[]): void {
    this.shouldLog('debug') && this.console.debug(message, ...rest);
  }

  log(message?: any, ...rest: any[]): void {
    this.shouldLog('log') && this.console.log(message, ...rest);
  }

  info(message?: any, ...rest: any[]): void {
    this.shouldLog('info') && this.console.info(`ℹ️ INFO: ${message}`, ...rest);
  }

  warn(message?: string, ...rest: any[]): void {
    this.shouldLog('warn') && this.console.warn(`⚠️ WARN: ${message}`, ...rest);
  }

  error(message?: string, ...rest: any[]): void {
    this.shouldLog('error') &&
      this.console.error(`⛔️ ERROR: ${message}`, ...rest);
  }

  ok(message?: string, ...args: any[]): void {
    this.log(`✔ OK: ${message}`, ...args);
  }

  pass(message?: string, ...args: any[]): void {
    this.log(`✅ PASS: ${message}`, ...args);
  }

  fail(message?: string, ...args: any[]): void {
    this.log(`❌ FAIL: ${message}`, ...args);
  }

  /**
   * This displays an error message and then exits the program.
   */
  abort(message?: string, ...args: any[]): void {
    this.error(message, ...args);
    process.exit(1);
  }

  static defaultIO(logLevel?: LogLevel): IO {
    return new IO(logLevel);
  }
}
