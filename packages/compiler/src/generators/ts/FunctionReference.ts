import type { ConditionalOutput } from "ts-poet/build/ConditionalOutput.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class FunctionReference {
  readonly annotatedUsage: Code;
  readonly unannotatedUsage: Code;

  constructor(code_: ConditionalOutput | Code) {
    this.annotatedUsage = this.unannotatedUsage = code`${code_}`;
  }
}
