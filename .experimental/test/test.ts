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
import test, {suite} from 'node:test';

const timeout = 5 * 60000; // 5 minutes * 60000 ms/min

await suite('experimental', {timeout}, async () => {
  await suite('folder', async () => {
    test('dummy', () => {
      assert.equal(1, 1);
    });
  });
  await suite('folders', async () => {
    test('dummy', () => {
      assert.equal(1, 1);
      assert.ok(Promise.resolve(true));
    });
  });
  await test('managed_folders', async () => {
    await test('dummy', async () => {
      assert.equal(1, 1);
      await Promise.resolve();
      await new Promise(resolve => setTimeout(resolve, 5000));
      assert.ok(true);
    });
  });
});
