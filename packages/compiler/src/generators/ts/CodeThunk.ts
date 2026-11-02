import type { Code } from "./ts-poet-wrapper.js";

export type CodeThunk = Code | (() => Code);

export namespace CodeThunk {
  export function evaluate(codeThunk: CodeThunk): Code {
    return typeof codeThunk === "function" ? codeThunk() : codeThunk;
  }
}
