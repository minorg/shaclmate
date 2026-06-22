import type { Code } from "../ts-poet-wrapper.js";
import type { AbstractType_JsType } from "./AbstractType_JsType.js";

export interface AbstractType_ConversionFunction {
  readonly code: Code;
  readonly sourceTypes: {
    readonly expression: Code;
    readonly jsType: AbstractType_JsType;
  }[];
}
