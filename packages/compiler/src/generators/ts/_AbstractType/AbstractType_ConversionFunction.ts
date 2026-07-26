import { codeEquals } from "../codeEquals.js";
import type { Code } from "../ts-poet-wrapper.js";
import { AbstractType_JsType } from "./AbstractType_JsType.js";

export interface AbstractType_ConversionFunction {
  readonly code: Code;
  readonly sourceTypes: AbstractType_ConversionFunction.SourceType[];
}

export namespace AbstractType_ConversionFunction {
  export interface SourceType {
    readonly expression: Code;
    readonly jsType: AbstractType_JsType;
  }

  export namespace SourceType {
    export function equals(left: SourceType, right: SourceType): boolean {
      if (!codeEquals(left.expression, right.expression)) {
        return false;
      }

      if (!AbstractType_JsType.equals(left.jsType, right.jsType)) {
        return false;
      }

      return true;
    }
  }
}
