import {inspect} from 'node:util';
import {Context} from './context.ts';

export class Cli {
  context: Context;

  constructor(argv: string[]) {
    const c = new Context();
    c.execPath = argv[0];
    c.startModule = argv[1];
    c.args = argv.slice(2);

    this.context = c;
  }

  run() {
    console.log(this.toString());
  }

  toString() {
    return inspect(this);
  }

  static run(argv: string[]) {
    const cli = new Cli(argv);
    cli.run();
  }
}
