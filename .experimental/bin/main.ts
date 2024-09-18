#!/usr/bin/env node --experimental-strip-types --disable-warning=ExperimentalWarning
import {argv} from 'node:process';
import {Cli} from '../lib/cli.ts';
Cli.run(argv);
