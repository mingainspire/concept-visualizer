// Type definitions for rehype-sanitize 4.0
// Project: https://github.com/rehypejs/rehype-sanitize
// Definitions by: DefinitelyTyped

declare module 'rehype-sanitize' {
  import { Plugin } from 'unified';

  interface RehypeSanitizeOptions {
    tagNames?: string[];
    attributes?: Record<string, string[]>;
    protocols?: Record<string, string[]>;
    strip?: boolean;
    clobberPrefix?: string;
    clobber?: string[];
  }

  const rehypeSanitize: Plugin<[RehypeSanitizeOptions?]>;
  export = rehypeSanitize;
}
