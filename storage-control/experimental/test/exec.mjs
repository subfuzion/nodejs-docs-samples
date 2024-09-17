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
 * return a {Result} synchronously or to return the child process and
 * asynchronously call a callback with a {Result}.
 * @param {string | string[]} cmd - Command file (pathname). Optional, if the
 *                                  first argument is the `args` array, then
 *                                  the default command is 'node'.
 * @param {string[] | {}} [args] - Command arguments.
 * @param {ExecOptions | Callback} [options] - Options for executing command.
 * @param {Callback} [cb] - Optional callback for inspecting result.
 * @returns {Result | ChildProcessWithoutNullStreams}
 */
export function execNode(cmd, args, options, cb) {
  // The cmd is optional, If the first argument looks like the args array,
  // reassign args to parameters on the right and then assign the default cmd.
  if (Array.isArray(cmd)) {
    cb = options;
    options = args;
    args = cmd;
    cmd = defaultCommand;
  }

  const command = [cmd, ...args].join(' ').trim();
  let resultObject;

  // Check if cmd exists before attempting to spawn it. This is because node
  // will hang until the timeout expires on an ENOENT. Setting `detached: true`
  // as an option doesn't help.
  const result = spawnSync('which', [cmd]);
  if (result.status !== 0) {
    resultObject = {
      error: new Error(`command '${cmd}' not found`),
      command: command,
      exitCode: -1,
      stdout: '',
      stderr: '',
    };
    return cb ? cb(resultObject) : resultObject;
  }

  if (cb) {
    let stdout = '';
    let stderr = '';
    const child = spawn(cmd, args, options);
    try {
      child.once('error', err => {
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
      child.once('close', code => {
        resultObject = {
          error: undefined,
          command: command,
          exitCode: code,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
        };
        cb(resultObject);
      });
      child.stdout.on('data', data => {
        stdout += data.toString();
      });
      child.stderr.on('data', data => {
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
    // In case the caller wants access.
    return child;
  } else {
    // If no callback
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

// test sync
const options = {timeout: 5000};
const result = execNode(['experimental/folder/create.mjs'], options);
if (result.exitCode !== 0) {
  console.error(result.stderr);
  console.error(`FAIL: ${result.command} (exit code: ${result.exitCode})`);
} else {
  console.log(result.stdout);
  console.log(`PASS: ${result.command}`);
}

// test with callback
execNode(['experimental/folders/create.mjs'], options, result => {
  if (result.error) {
    console.error(result.error);
    console.error(`FAIL: failed to exec: '${result.command}'`);
  } else if (result.exitCode !== 0) {
    console.error(result.stderr);
    console.error(`FAIL: ${result.command} (exit code: ${result.exitCode})`);
  } else {
    console.log(result.stdout);
    console.log(`PASS: ${result.command}`);
  }
});

execNode(['--version'], options, result => {
  if (result.error) {
    console.error(result.error);
    console.error(`ERROR: failed to exec: '${result.command}'`);
  } else if (result.exitCode !== 0) {
    console.error(result.stderr);
    console.error(`FAIL: ${result.command} (exit code: ${result.exitCode})`);
  } else {
    console.log(result.stdout);
    console.log(`PASS: ${result.command}`);
  }
});

// expect an error
execNode('foo', [], options, result => {
  if (result.error) {
    console.error(result.error);
    console.error(`FAIL: failed to exec: '${result.command}'`);
  } else if (result.exitCode !== 0) {
    console.error(result.stderr);
    console.error(`FAIL: ${result.command} (exit code: ${result.exitCode})`);
  } else {
    console.log(result.stdout);
    console.log(`PASS: ${result.command}`);
  }
});
