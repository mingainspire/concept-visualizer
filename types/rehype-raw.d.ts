// Type definitions for rehype-raw 6.0
// Project: https://github.com/rehypejs/rehype-raw
// Definitions by: DefinitelyTyped

declare module 'rehype-raw' {
  import { Plugin } from 'unified';

  interface RehypeRawOptions {
    passThrough?: boolean;
  }

  const rehypeRaw: Plugin<[RehypeRawOptions?]>;
  export = rehypeRaw;
}
