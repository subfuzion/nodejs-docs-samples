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

import {accessSync, constants, statSync} from 'node:fs';
import {normalize, parse, resolve} from 'node:path';

import {Config} from './config.ts';
import {IO} from './io.ts';
import {Args, ParsedArgs} from './args.ts';

class ParsedPath {
  original: string;
  normalized: string;
  isDirectory: boolean;
  full: string;
  dir: string;
  base: string;
  name: string;
  ext: string;
}

export class Context {
  config: Config;

  io = IO.defaultIO();

  execPath: string;
  main: string;
  args: string[];
  parsedArgs: ParsedArgs;

  samplePath: ParsedPath;

  constructor(argv: string[], config: Config, io: IO) {
    this.config = config;
    this.io = io;

    // command line
    this.execPath = argv[0];
    this.main = argv[1];
    this.args = argv.slice(2);

    // command line args
    const args = new Args(io);
    this.parsedArgs = args.parse(this.args);

    // sample path
    if (!isAccessible(args.samplePath)) {
      io.abort('sample is not accessible:', args.samplePath);
    }
    const samplePath = new ParsedPath();
    samplePath.original = args.samplePath;
    samplePath.normalized = normalize(args.samplePath);
    let p = samplePath.normalized;
    samplePath.isDirectory = isDirectory(p);
    samplePath.full = resolve(p);
    const {dir, base, name, ext} = parse(p);
    samplePath.dir = normalize(dir);
    samplePath.base = base;
    samplePath.name = name;
    samplePath.ext = ext;
    this.samplePath = samplePath;

    // log level
    this.io.logLevel = args.logLevel;
  }

  toString(): string {
    return `{
      io: ${this.io.toString()}
    }`;
  }
}

/**
 * @param path - Path like.
 * @param mode - F_OK, R_OK, W_OK, or X_OK.
 *               See: https://nodejs.org/api/fs.html#file-access-constants
 */
function isAccessible(path: string, mode?: number): boolean {
  try {
    mode = mode || constants.R_OK;
    accessSync(path, mode);
    return true;
  } catch (err) {
    return false;
  }
}

function isDirectory(path: string): boolean {
  try {
    const stats = statSync(path);
    return stats.isDirectory();
  } catch (err) {
    return false;
  }
}
