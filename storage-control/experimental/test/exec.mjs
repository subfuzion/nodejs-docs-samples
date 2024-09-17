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

import {spawn, spawnSync} from 'node:child_process';

const defaultCommand = 'node';

/**
 * @typedef {object} Result
 * @property {string} command - The full command plus arguments.
 * @property {string} stdout - The `stdout` buffer as a trimmed string.
 * @property {string} stderr - The `stderr` buffer as a trimmed string.
 * @property {number} exitCode - The command's exit code.
 * @property {Error} error - The error if the command failed to execute.
 */

/**
 * @typedef {object} ExecOptions
 * @property {number} [timeout]
 * @property {string | number} [killSignal]
 * @property {Record<string, string>} [env]
 * @property {string | Buffer}  [input]
 * @property {number} [maxBuffer]
 * @property {string} [encoding]
 * @property {string | URL | TypedArray | DataView} [cwd]
 * @property {string} [argv0]
 * @property {string | Array} [stdio]
 * @property {number} [uid]
 * @property {number} [gid]
 */

/**
 * @callback Callback
 * @param {Result} result
 */

/**
 * Spawns child process. Does not throw. This function can be used to either
 * return a {Result} synchronously or to asynchronously call a callback with a
 * {Result}.
 * @param {string | string[]} cmd - Command file (pathname).
 * @param {string[] | {}} [args] - Command arguments.
 * @param {ExecOptions | Callback} [options] - Options for executing command.
 * @param {Callback} [cb] - Optional callback for inspecting result.
 * @returns {Result | ChildProcessWithoutNullStreams}
 */
export function execNode(cmd, args, options, cb) {
  // cmd is optional, defaults to 'node'
  if (Array.isArray(cmd)) {
    cb = options;
    options = args;
    args = cmd;
    cmd = defaultCommand;
  }

  const command = [cmd, ...args].join(' ').trim();
  let resultObject;

  if (cb) {
    let stdout = '';
    let stderr = '';
    // eslint-disable-next-line no-undef
    const controller = new AbortController();
    const {signal} = controller;
    options.signal = signal;
    options.killSignal = 'SIGKILL';
    //options.detached = true;
    const proc = spawn(cmd, args, options);
    try {
      proc.once('error', err => {
        resultObject = {
          error: err,
          command: command,
          exitCode: -1,
          stdout: '',
          stderr: '',
        };
        proc.removeAllListeners();
        proc.stdin.end();
        proc.stdout.destroy();
        proc.stderr.destroy();
        proc.kill('SIGTERM');
        proc.kill('SIGABRT');
        proc.kill('SIGINT');
        proc.kill('SIGKILL');
        controller.abort();
        proc.unref();
        // return cb(resultObject);
        cb(resultObject);
        //throw err;
      });
      proc.once('close', code => {
        resultObject = {
          error: undefined,
          command: command,
          exitCode: code,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
        };
        return cb(resultObject);
      });
      proc.stdout.on('data', data => {
        stdout += data.toString();
      });
      proc.stderr.on('data', data => {
        stderr += data.toString();
      });
    } catch (err) {
      // Should never get here, but just in case.
      resultObject = {
        error: err,
        command: command,
        exitCode: -1,
        stdout: '',
        stderr: '',
      };
      return cb(resultObject);
    }
    return proc;
  } else {
    try {
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

const options = {timeout: 5000};
//const options = {};
// const result = execNode(['experimental/folder/create.mjs'], options);
// if (result.exitCode !== 0) {
//   console.error(result.stderr);
//   console.error(`FAIL: ${result.command} (exit code: ${result.exitCode})`);
//   process.exitCode = result.exitCode;
// } else {
//   console.log(result.stdout);
//   console.log(`PASS: ${result.command}`);
// }
//
// console.log('test with callback');
//execNode(['experimental/folders/create.mjs'], options, result => {
execNode('foo', [], options, result => {
  if (result.error) {
    console.error(result.error);
    console.error(`FAIL: failed to exec: '${result.command}'`);
    //process.exitCode = result.exitCode;
  } else if (result.exitCode !== 0) {
    console.error(result.stderr);
    console.error(`FAIL: ${result.command} (exit code: ${result.exitCode})`);
    //process.exitCode = result.exitCode;
  } else {
    console.log(result.stdout);
    console.log(`PASS: ${result.command}`);
  }
});
execNode(['--version'], options, result => {
  if (result.error) {
    console.error(result.error);
    console.error(`ERROR: failed to exec: '${result.command}'`);
    //process.exitCode = result.exitCode;
  } else if (result.exitCode !== 0) {
    console.error(result.stderr);
    console.error(`FAIL: ${result.command} (exit code: ${result.exitCode})`);
    //process.exitCode = result.exitCode;
  } else {
    console.log(result.stdout);
    console.log(`PASS: ${result.command}`);
  }
});
