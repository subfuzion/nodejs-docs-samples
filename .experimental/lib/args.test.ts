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

import assert from 'node:assert/strict';
import test, {before, beforeEach, suite} from 'node:test';

import {Args} from './args.ts';
import {MockLogger} from '../test/mockLogger.ts';

await suite('args', async () => {
  let mockLogger: MockLogger;
  let args: Args;

  before(() => {
    mockLogger = new MockLogger();
    args = new Args();
  });

  beforeEach(() => {
    mockLogger.clear();
  });

  await test.skip('must have at least one argument', () => {
    const argv = [];
    assert.throws(() => args.parse(argv));
  });

  await test.skip('must not have more than one argument', () => {
    const argv = ['.', 'foo'];
    assert.throws(() => args.parse(argv));
  });

  await test('should set loglevel = log', () => {
    const argv = ['--loglevel=log', '.'];
    args.parse(argv);
    assert.equal(args.logLevel, 'log');
  });

  await test('should log', () => {
    const argv = ['--loglevel=log', '.'];
    args.parse(argv);
    assert.equal(args.logLevel, 'log');

    mockLogger.logLevel = args.logLevel;
    mockLogger.log('hello');
    assert.ok(mockLogger.stdout.includes('hello'));
  });

  await test('should not log', () => {
    const argv = ['--loglevel=log', '.'];
    args.parse(argv);
    assert.equal(args.logLevel, 'log');

    mockLogger.logLevel = args.logLevel;
    mockLogger.debug('hello');
    assert.ok(!mockLogger.stdout.includes('hello'));
  });

  await test('sample path', () => {
    const argv = ['.'];
    args.parse(argv);
    assert.equal(args.samplePath, '.');
  });
});
