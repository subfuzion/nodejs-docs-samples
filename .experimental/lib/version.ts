import pkg from '../package.json' with {type: 'json'};

export function version(): string {
  return pkg.version;
}
