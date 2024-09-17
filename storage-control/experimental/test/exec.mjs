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
 * @param {number} [timeout]
 * @param {string | number} [killSignal]
 * @param {Record<string, string>} [env]
 * @param {string | Buffer}  [input]
 * @param {number} [maxBuffer]
 * @param {string} [encoding]
 * @param {string | URL | TypedArray | DataView} [cwd]
 * @param {string} [argv0]
 * @param {string | Array} [stdio]
 * @param {number} [uid]
 * @param {number} [gid]
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
 * @returns {Result}
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
    const proc = spawn(cmd, args, options);
    proc.on('close', code => {
      resultObject = {
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
  } else {
    try {
      const result = spawnSync(cmd, args, options);
      resultObject = {
        command: command,
        exitCode: result.status,
        stdout: result.stdout.toString().trim(),
        stderr: result.stderr.toString().trim(),
      };
    } catch (err) {
      resultObject = {
        command: command,
        exitCode: -1,
        stdout: '',
        stderr: err.toString(),
      };
    }
    return resultObject;
  }
}

const options = {timeout: 60000};
const result = execNode(['experimental/folder/create.mjs'], options);
if (result.exitCode !== 0) {
  console.error(result.stderr);
  console.error(`FAIL: ${result.command} (exit code: ${result.exitCode})`);
  process.exitCode = result.exitCode;
} else {
  console.log(result.stdout);
  console.log(`PASS: ${result.command}`);
}

console.log('test with callback');
execNode(['experimental/folders/create.mjs'], options, result => {
  if (result.exitCode !== 0) {
    console.error(result.stderr);
    console.error(`FAIL: ${result.command} (exit code: ${result.exitCode})`);
    process.exitCode = result.exitCode;
  } else {
    console.log(result.stdout);
    console.log(`PASS: ${result.command}`);
  }
});
