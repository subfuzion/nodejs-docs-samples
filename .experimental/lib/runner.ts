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
import {Callback, DefaultCommand, ExecCommandOptions} from './exec.ts';

type VisitorCallback = (node: TestNode) => void;

interface VisitorCallbackOptions {
  skip: boolean;
}

interface ExecCommandSpec {
  cmd: string;
  args: string[];
  options: ExecCommandOptions;
  cb: Callback;
}

class TestNode {
  name: string;
  cmdSpec: ExecCommandSpec;
  children: TestNode[];
  skip: boolean;

  constructor(
    name: string,
    cmd?: string | string[],
    args?: string[] | ExecCommandOptions,
    options?: ExecCommandOptions | Callback,
    cb?: Callback
  ) {
    // The cmd is optional, If the first argument looks like the args array,
    // reassign args to parameters on the right and then assign the default cmd.
    if (Array.isArray(cmd)) {
      cb = options as Callback;
      options = args as ExecCommandOptions;
      args = cmd as string[];
      cmd = DefaultCommand;
    }
    // @ts-ignore
    this.cmdSpec = {cmd, args, options, cb};
    this.name = name;
  }

  add(node: TestNode) {
    if (!this.children) this.children = [];
    this.children.push(node);
  }

  /**
   * Perform an in-order traversal of all test nodes.
   * @param {VisitorCallback} cb - The visitor callback function.
   * @param {VisitorCallbackOptions} [options] - Visitor callback options.
   */
  visit(cb: VisitorCallback, options?: VisitorCallbackOptions) {
    const _visit = (node: TestNode, cb: VisitorCallback) => {
      if (options && options.skip && node.skip) return;
      cb(node);
      if (node.children) {
        node.children.forEach(child => _visit(child, cb));
      }
    };
    _visit(this, cb);
  }
}

// eslint-disable-next-line no-unused-vars
class TestRunner {
  root: TestNode;

  constructor(node: TestNode) {
    this.root = node;
  }

  /**
   * Perform an in-order traversal of all test nodes starting at the root.
   * @param {VisitorCallback} cb - The visitor callback function.
   * @param {VisitorCallbackOptions} [options] - Visitor callback options.
   */
  visit(cb: VisitorCallback, options?: VisitorCallbackOptions) {
    if (!this.root) return;
    this.root.visit(cb, options);
  }

  /**
   * Perform in-order tests of all nodes starting at the root.
   */
  test() {
    const visitor: VisitorCallback = (node: TestNode): void => {
      console.log(node.name);
    };
    this.visit(visitor);
  }
}

const testSuite = new TestNode('Test Suite');

const testRunner = new TestRunner(testSuite);

testRunner.test();
