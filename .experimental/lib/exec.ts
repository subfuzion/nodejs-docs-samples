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

import {ChildProcess, spawn, spawnSync} from 'node:child_process';

export const DefaultCommand = 'node';

export interface ExecCommandOptions {
  cwd?: string | URL;
  env?: Record<string, string>;
  argv0?: string;
  stdio?: Buffer | string;
  detached?: boolean;
  uid?: number;
  gid?: number;
  serialization?: string;
  shell?: boolean | string;
  windowsVerbatimArguments?: boolean;
  windowsHide?: boolean;
  signal?: AbortSignal;
  timeout?: number;
  killSignal?: string | number;
}

export interface ExecCommandResult {
  command: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  error: Error;
}

export type ExecCommandCallback = (result: ExecCommandResult) => void;

/**
 * Spawns child process. Does not throw. This function can be used to either
 * return an ExecCommandResult synchronously or to return the child process (or
 * null if exec failure) and asynchronously call a callback with an
 * ExecCommandResult.
 */
export function exec(
  cmd: string | string[],
  args?: string[] | ExecCommandOptions | ExecCommandCallback,
  options?: ExecCommandOptions | ExecCommandCallback,
  cb?: ExecCommandCallback
): ExecCommandResult | ChildProcess | undefined {
  // cmd, options, and cb are optional. Shift args to match parameters.
  // It can take up to 3 shifts to get all 4 args matched to parameters.
  if (Array.isArray(cmd)) {
    cb = options as ExecCommandCallback;
    options = args as ExecCommandOptions;
    args = cmd as string[];
    cmd = DefaultCommand;
  }
  if (!Array.isArray(args)) {
    cb = options as ExecCommandCallback;
    options = args as ExecCommandOptions;
    args = undefined;
  }
  if (typeof options === 'function') {
    cb = options as ExecCommandCallback;
    options = undefined;
  }

  let command = cmd;
  if (Array.isArray(args) && args.length > 0) {
    command += ' ' + args.join(' ').trim();
  }

  let resultObject: ExecCommandResult;

  // Check if cmd exists before attempting to spawn it. This is because node
  // will hang until the timeout expires on an ENOENT. Setting `detached: true`
  // as an option doesn't help.
  const result = spawnSync('which', [cmd]);
  if (result.status !== 0) {
    resultObject = {
      error: new Error(`${cmd}: command not found`),
      command: command,
      exitCode: -1,
      stdout: '',
      stderr: '',
    };
    if (cb) {
      cb(resultObject);
      return undefined;
    }
    return resultObject;
  }

  if (cb) {
    let stdout = '';
    let stderr = '';
    // @ts-ignore
    const child = spawn(cmd, args, options) as ChildProcessWithoutNullStreams;
    try {
      child.once('error', (err: Error) => {
        resultObject = {
          error: err,
          command: command,
          exitCode: -1,
          stdout: '',
          stderr: '',
        };
        child.removeAllListeners();
        child.stdin.end();
        child.stdout.destroy();
        child.stderr.destroy();
        child.kill();
        cb(resultObject);
      });
      child.once('close', (code: number) => {
        resultObject = {
          error: undefined,
          command: command,
          exitCode: code,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
        };
        cb(resultObject);
      });
      child.stdout.on('data', (data: Buffer) => {
        stdout += data.toString();
      });
      child.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });
    } catch (err) {
      // Shouldn't get here since there's an 'error' listener, but just in case.
      resultObject = {
        error: err,
        command: command,
        exitCode: -1,
        stdout: '',
        stderr: '',
      };
      cb(resultObject);
    }
    return child;
  } else {
    /* no callback */
    try {
      // @ts-ignore
      const result = spawnSync(cmd, args, options);
      resultObject = {
        error: undefined,
        command: command,
        exitCode: result.status,
        stdout: result.stdout.toString().trim(),
        stderr: result.stderr.toString().trim(),
      };
    } catch (err) {
      resultObject = {
        error: err,
        command: command,
        exitCode: -1,
        stdout: '',
        stderr: '',
      };
    }
    return resultObject;
  }
}
