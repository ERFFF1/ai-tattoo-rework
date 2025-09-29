declare module 'potrace' {
  export interface PotraceOptions {
    turdSize?: number;
    threshold?: number;
    optTolerance?: number;
    color?: string;
    background?: string;
  }
  
  export function trace(
    input: Buffer | string,
    options?: PotraceOptions
  ): Promise<string>;
}
