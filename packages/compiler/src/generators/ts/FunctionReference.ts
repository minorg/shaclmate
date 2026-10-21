import type { ConditionalOutput } from "ts-poet/build/ConditionalOutput.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class FunctionReference {
  readonly usage: Code;

  constructor(code_: ConditionalOutput | Code) {
    this.usage = code`${code_}`;
  }
}
