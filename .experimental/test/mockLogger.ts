import {Logger, LogLevel, LogLevels} from '../lib/log.ts';
import {format} from 'node:util';

export class MockLogger implements Logger {
  logLevel: LogLevel;
  #stdout: string = '';
  #stderr: string = '';

  constructor(logLevel: LogLevel = 'log') {
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

  printf(message?: string, ...args: string[]): void {
    this.stdout += format(message, ...args);
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
